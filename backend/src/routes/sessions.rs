use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use rust_decimal::prelude::ToPrimitive;

use crate::{
    AppState,
    extractors::{AppResult, AuthUser},
    models::session::{
        CreateSessionRequest, SessionResponse, SessionSetResponse, SessionSetRow,
    },
};

async fn fetch_session_response(
    db: &sqlx::PgPool,
    session_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<Option<SessionResponse>> {
    let session = sqlx::query_as::<_, crate::models::session::Session>(
        "SELECT * FROM sessions WHERE id = $1 AND user_id = $2"
    )
    .bind(session_id)
    .bind(user_id)
    .fetch_optional(db)
    .await?;

    let Some(s) = session else { return Ok(None) };

    let sets = sqlx::query_as::<_, SessionSetRow>(
        r#"SELECT ss.id, ss.session_id, ss.exercise_id, e.name as exercise_name,
                  ss.set_number, ss.reps_done, ss.weight_kg
           FROM session_sets ss
           JOIN exercises e ON e.id = ss.exercise_id
           WHERE ss.session_id = $1
           ORDER BY ss.exercise_id, ss.set_number"#
    )
    .bind(session_id)
    .fetch_all(db)
    .await?;

    let workout_name: Option<String> = if let Some(wid) = s.workout_id {
        sqlx::query_scalar("SELECT name FROM workouts WHERE id = $1")
            .bind(wid)
            .fetch_optional(db)
            .await?
    } else {
        None
    };

    Ok(Some(SessionResponse {
        id: s.id,
        workout_id: s.workout_id,
        workout_name,
        performed_at: s.performed_at,
        notes: s.notes,
        sets: sets
            .into_iter()
            .map(|s| SessionSetResponse {
                exercise_id: s.exercise_id,
                exercise_name: s.exercise_name,
                set_number: s.set_number,
                reps_done: s.reps_done,
                weight_kg: s.weight_kg.and_then(|d| d.to_f64()),
            })
            .collect(),
    }))
}

pub async fn list(
    State(state): State<AppState>,
    user: AuthUser,
) -> AppResult<Json<Vec<SessionResponse>>> {
    let sessions = sqlx::query_as::<_, crate::models::session::Session>(
        "SELECT * FROM sessions WHERE user_id = $1 ORDER BY performed_at DESC LIMIT 50"
    )
    .bind(user.id)
    .fetch_all(&state.db)
    .await?;

    let mut responses = Vec::with_capacity(sessions.len());
    for s in sessions {
        if let Some(resp) = fetch_session_response(&state.db, s.id, user.id).await? {
            responses.push(resp);
        }
    }

    Ok(Json(responses))
}

pub async fn get(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<SessionResponse>> {
    let resp = fetch_session_response(&state.db, id, user.id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

    Ok(Json(resp))
}

pub async fn create(
    State(state): State<AppState>,
    user: AuthUser,
    Json(req): Json<CreateSessionRequest>,
) -> AppResult<(StatusCode, Json<SessionResponse>)> {
    let mut tx = state.db.begin().await?;

    let session = sqlx::query_as::<_, crate::models::session::Session>(
        "INSERT INTO sessions (user_id, workout_id, notes) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(user.id)
    .bind(req.workout_id)
    .bind(&req.notes)
    .fetch_one(&mut *tx)
    .await?;

    for set in &req.sets {
        sqlx::query(
            "INSERT INTO session_sets (session_id, exercise_id, set_number, reps_done, weight_kg)
             VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(session.id)
        .bind(set.exercise_id)
        .bind(set.set_number)
        .bind(set.reps_done)
        .bind(set.weight_kg)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    let resp = fetch_session_response(&state.db, session.id, user.id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Failed to fetch created session"))?;

    Ok((StatusCode::CREATED, Json(resp)))
}
