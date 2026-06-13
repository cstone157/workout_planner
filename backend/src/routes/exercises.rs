use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    AppState,
    extractors::{AppResult, AuthUser},
    models::exercise::{
        CreateExerciseRequest, Exercise, SearchRequest, SearchResult, UpdateExerciseRequest,
    },
};

pub async fn list(
    State(state): State<AppState>,
    user: AuthUser,
) -> AppResult<Json<Vec<Exercise>>> {
    let exercises = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(exercises))
}

pub async fn get(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Exercise>> {
    let exercise = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| anyhow::anyhow!("Exercise not found"))?;

    Ok(Json(exercise))
}

pub async fn create(
    State(state): State<AppState>,
    user: AuthUser,
    Json(req): Json<CreateExerciseRequest>,
) -> AppResult<(StatusCode, Json<Exercise>)> {
    let exercise = sqlx::query_as::<_, Exercise>(
        r#"INSERT INTO exercises (user_id, name, description, muscle_group, equipment)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *"#
    )
    .bind(user.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.muscle_group)
    .bind(&req.equipment)
    .fetch_one(&state.db)
    .await?;

    // Embed and store in ChromaDB (non-blocking — don't fail the request if Chroma is slow)
    let embedding_text = exercise.embedding_text();
    let exercise_id = exercise.id.to_string();
    let chroma = state.chroma.clone();
    let embedder = state.embedder.clone();

    tokio::spawn(async move {
        match embedder.embed_one(embedding_text.clone()).await {
            Ok(embedding) => {
                if let Err(e) = chroma.upsert_exercise(&exercise_id, embedding, &embedding_text).await {
                    tracing::error!("ChromaDB upsert failed for {}: {}", exercise_id, e);
                }
            }
            Err(e) => tracing::error!("Embedding failed for {}: {}", exercise_id, e),
        }
    });

    Ok((StatusCode::CREATED, Json(exercise)))
}

pub async fn update(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateExerciseRequest>,
) -> AppResult<Json<Exercise>> {
    let exercise = sqlx::query_as::<_, Exercise>(
        r#"UPDATE exercises
           SET name         = COALESCE($3, name),
               description  = COALESCE($4, description),
               muscle_group = COALESCE($5, muscle_group),
               equipment    = COALESCE($6, equipment),
               updated_at   = NOW()
           WHERE id = $1 AND user_id = $2
           RETURNING *"#
    )
    .bind(id)
    .bind(user.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.muscle_group)
    .bind(&req.equipment)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| anyhow::anyhow!("Exercise not found"))?;

    // Re-embed updated exercise
    let embedding_text = exercise.embedding_text();
    let exercise_id = exercise.id.to_string();
    let chroma = state.chroma.clone();
    let embedder = state.embedder.clone();

    tokio::spawn(async move {
        match embedder.embed_one(embedding_text.clone()).await {
            Ok(embedding) => {
                if let Err(e) = chroma.upsert_exercise(&exercise_id, embedding, &embedding_text).await {
                    tracing::error!("ChromaDB re-upsert failed for {}: {}", exercise_id, e);
                }
            }
            Err(e) => tracing::error!("Re-embedding failed for {}: {}", exercise_id, e),
        }
    });

    Ok(Json(exercise))
}

pub async fn delete(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {
    let rows = sqlx::query(
        "DELETE FROM exercises WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(user.id)
    .execute(&state.db)
    .await?
    .rows_affected();

    if rows == 0 {
        return Err(anyhow::anyhow!("Exercise not found").into());
    }

    // Delete from ChromaDB
    let exercise_id = id.to_string();
    let chroma = state.chroma.clone();
    tokio::spawn(async move {
        if let Err(e) = chroma.delete_exercise(&exercise_id).await {
            tracing::warn!("ChromaDB delete failed for {}: {}", exercise_id, e);
        }
    });

    Ok(StatusCode::NO_CONTENT)
}

pub async fn semantic_search(
    State(state): State<AppState>,
    user: AuthUser,
    Json(req): Json<SearchRequest>,
) -> AppResult<Json<Vec<SearchResult>>> {
    let query_embedding = state.embedder.embed_one(req.query).await?;
    let chroma_results = state.chroma.query_exercises(query_embedding, req.n_results).await?;

    if chroma_results.is_empty() {
        return Ok(Json(vec![]));
    }

    // Enrich results from Postgres — only return exercises belonging to this user
    let ids: Vec<Uuid> = chroma_results
        .iter()
        .filter_map(|(id, _)| Uuid::parse_str(id).ok())
        .collect();

    let exercises = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE id = ANY($1) AND user_id = $2"
    )
    .bind(&ids[..])
    .bind(user.id)
    .fetch_all(&state.db)
    .await?;

    // Re-apply ordering from ChromaDB similarity scores
    let results: Vec<SearchResult> = chroma_results
        .into_iter()
        .filter_map(|(id, score)| {
            let uuid = Uuid::parse_str(&id).ok()?;
            let ex = exercises.iter().find(|e| e.id == uuid)?;
            Some(SearchResult {
                id: ex.id,
                name: ex.name.clone(),
                description: ex.description.clone(),
                muscle_group: ex.muscle_group.clone(),
                equipment: ex.equipment.clone(),
                similarity_score: score,
            })
        })
        .collect();

    Ok(Json(results))
}
