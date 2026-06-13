use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub workout_id: Option<Uuid>,
    pub performed_at: DateTime<Utc>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SessionSetRow {
    pub id: Uuid,
    pub session_id: Uuid,
    pub exercise_id: Uuid,
    pub exercise_name: String,
    pub set_number: i32,
    pub reps_done: i32,
    pub weight_kg: Option<sqlx::types::Decimal>,
}

#[derive(Debug, Serialize)]
pub struct SessionResponse {
    pub id: Uuid,
    pub workout_id: Option<Uuid>,
    pub workout_name: Option<String>,
    pub performed_at: DateTime<Utc>,
    pub notes: Option<String>,
    pub sets: Vec<SessionSetResponse>,
}

#[derive(Debug, Serialize)]
pub struct SessionSetResponse {
    pub exercise_id: Uuid,
    pub exercise_name: String,
    pub set_number: i32,
    pub reps_done: i32,
    pub weight_kg: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSessionRequest {
    pub workout_id: Option<Uuid>,
    pub notes: Option<String>,
    pub sets: Vec<CreateSessionSetInput>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CreateSessionSetInput {
    pub exercise_id: Uuid,
    pub set_number: i32,
    pub reps_done: i32,
    pub weight_kg: Option<f64>,
}
