use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
    routing::get,
    Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::{auth::AuthUser, models::Workout};

#[derive(Deserialize)]
pub struct CreateWorkoutRequest {
    name: String,
    scheduled_date: Option<DateTime<Utc>>,
    completed_date: Option<DateTime<Utc>>,
    notes: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateWorkoutRequest {
    name: String,
    scheduled_date: Option<DateTime<Utc>>,
    completed_date: Option<DateTime<Utc>>,
    notes: Option<String>,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_workouts).post(create_workout))
        .route("/:id", axum::routing::put(update_workout).delete(delete_workout))
}

async fn list_workouts(
    State(pool): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<Workout>>, (StatusCode, String)> {
    let workouts = sqlx::query_as!(
        Workout,
        "SELECT id, user_id, name, scheduled_date, completed_date, notes, created_at FROM workouts WHERE user_id = $1",
        user.user_id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(workouts))
}

async fn create_workout(
    State(pool): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<CreateWorkoutRequest>,
) -> Result<(StatusCode, Json<Workout>), (StatusCode, String)> {
    let workout = sqlx::query_as!(
        Workout,
        "INSERT INTO workouts (user_id, name, scheduled_date, completed_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, name, scheduled_date, completed_date, notes, created_at",
        user.user_id,
        payload.name,
        payload.scheduled_date,
        payload.completed_date,
        payload.notes
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(workout)))
}

async fn update_workout(
    State(pool): State<PgPool>,
    user: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateWorkoutRequest>,
) -> Result<Json<Workout>, (StatusCode, String)> {
    let workout = sqlx::query_as!(
        Workout,
        "UPDATE workouts SET name = $1, scheduled_date = $2, completed_date = $3, notes = $4 WHERE id = $5 AND user_id = $6 RETURNING id, user_id, name, scheduled_date, completed_date, notes, created_at",
        payload.name,
        payload.scheduled_date,
        payload.completed_date,
        payload.notes,
        id,
        user.user_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(workout) = workout {
        Ok(Json(workout))
    } else {
        Err((StatusCode::NOT_FOUND, "Workout not found".to_string()))
    }
}

async fn delete_workout(
    State(pool): State<PgPool>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let rows_affected = sqlx::query!(
        "DELETE FROM workouts WHERE id = $1 AND user_id = $2",
        id,
        user.user_id
    )
    .execute(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .rows_affected();

    if rows_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err((StatusCode::NOT_FOUND, "Workout not found".to_string()))
    }
}
