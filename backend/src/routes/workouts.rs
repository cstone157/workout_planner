use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    AppState,
    extractors::{AppResult, AuthUser},
    models::workout::{
        CreateWorkoutRequest, UpdateWorkoutRequest, WorkoutExerciseResponse,
        WorkoutExerciseRow, WorkoutResponse,
    },
};

async fn fetch_workout_response(
    db: &sqlx::PgPool,
    workout_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<Option<WorkoutResponse>> {
    let workout = sqlx::query_as::<_, crate::models::workout::Workout>(
        "SELECT * FROM workouts WHERE id = $1 AND user_id = $2"
    )
    .bind(workout_id)
    .bind(user_id)
    .fetch_optional(db)
    .await?;

    let Some(w) = workout else { return Ok(None) };

    let exercises = sqlx::query_as::<_, WorkoutExerciseRow>(
        r#"SELECT we.exercise_id, e.name as exercise_name,
                  we.sets, we.reps, we.rest_seconds, we.position
           FROM workout_exercises we
           JOIN exercises e ON e.id = we.exercise_id
           WHERE we.workout_id = $1
           ORDER BY we.position"#
    )
    .bind(workout_id)
    .fetch_all(db)
    .await?;

    Ok(Some(WorkoutResponse {
        id: w.id,
        name: w.name,
        description: w.description,
        created_at: w.created_at,
        exercises: exercises
            .into_iter()
            .map(|e| WorkoutExerciseResponse {
                exercise_id: e.exercise_id,
                exercise_name: e.exercise_name,
                sets: e.sets,
                reps: e.reps,
                rest_seconds: e.rest_seconds,
            })
            .collect(),
    }))
}

pub async fn list(
    State(state): State<AppState>,
    user: AuthUser,
) -> AppResult<Json<Vec<WorkoutResponse>>> {
    let workouts = sqlx::query_as::<_, crate::models::workout::Workout>(
        "SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user.id)
    .fetch_all(&state.db)
    .await?;

    let mut responses = Vec::with_capacity(workouts.len());
    for w in workouts {
        if let Some(resp) = fetch_workout_response(&state.db, w.id, user.id).await? {
            responses.push(resp);
        }
    }

    Ok(Json(responses))
}

pub async fn get(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<WorkoutResponse>> {
    let resp = fetch_workout_response(&state.db, id, user.id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Workout not found"))?;

    Ok(Json(resp))
}

pub async fn create(
    State(state): State<AppState>,
    user: AuthUser,
    Json(req): Json<CreateWorkoutRequest>,
) -> AppResult<(StatusCode, Json<WorkoutResponse>)> {
    let mut tx = state.db.begin().await?;

    let workout = sqlx::query_as::<_, crate::models::workout::Workout>(
        "INSERT INTO workouts (user_id, name, description) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(user.id)
    .bind(&req.name)
    .bind(&req.description)
    .fetch_one(&mut *tx)
    .await?;

    for (i, ex) in req.exercises.iter().enumerate() {
        sqlx::query(
            "INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, rest_seconds, position)
             VALUES ($1, $2, $3, $4, $5, $6)"
        )
        .bind(workout.id)
        .bind(ex.exercise_id)
        .bind(ex.sets)
        .bind(ex.reps)
        .bind(ex.rest_seconds)
        .bind(i as i32)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    let resp = fetch_workout_response(&state.db, workout.id, user.id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Failed to fetch created workout"))?;

    Ok((StatusCode::CREATED, Json(resp)))
}

pub async fn update(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateWorkoutRequest>,
) -> AppResult<Json<WorkoutResponse>> {
    let mut tx = state.db.begin().await?;

    let rows = sqlx::query(
        r#"UPDATE workouts
           SET name        = COALESCE($3, name),
               description = COALESCE($4, description),
               updated_at  = NOW()
           WHERE id = $1 AND user_id = $2"#
    )
    .bind(id)
    .bind(user.id)
    .bind(&req.name)
    .bind(&req.description)
    .execute(&mut *tx)
    .await?
    .rows_affected();

    if rows == 0 {
        return Err(anyhow::anyhow!("Workout not found").into());
    }

    if let Some(exercises) = req.exercises {
        sqlx::query("DELETE FROM workout_exercises WHERE workout_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        for (i, ex) in exercises.iter().enumerate() {
            sqlx::query(
                "INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, rest_seconds, position)
                 VALUES ($1, $2, $3, $4, $5, $6)"
            )
            .bind(id)
            .bind(ex.exercise_id)
            .bind(ex.sets)
            .bind(ex.reps)
            .bind(ex.rest_seconds)
            .bind(i as i32)
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;

    let resp = fetch_workout_response(&state.db, id, user.id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Failed to fetch updated workout"))?;

    Ok(Json(resp))
}

pub async fn delete(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {
    let rows = sqlx::query("DELETE FROM workouts WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user.id)
        .execute(&state.db)
        .await?
        .rows_affected();

    if rows == 0 {
        return Err(anyhow::anyhow!("Workout not found").into());
    }

    Ok(StatusCode::NO_CONTENT)
}
