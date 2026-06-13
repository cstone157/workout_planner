use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Workout {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct WorkoutExerciseRow {
    pub exercise_id: Uuid,
    pub exercise_name: String,
    pub sets: Option<i32>,
    pub reps: Option<i32>,
    pub rest_seconds: Option<i32>,
    pub position: i32,
}

#[derive(Debug, Serialize)]
pub struct WorkoutResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub exercises: Vec<WorkoutExerciseResponse>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct WorkoutExerciseResponse {
    pub exercise_id: Uuid,
    pub exercise_name: String,
    pub sets: Option<i32>,
    pub reps: Option<i32>,
    pub rest_seconds: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWorkoutRequest {
    pub name: String,
    pub description: Option<String>,
    #[serde(default)]
    pub exercises: Vec<WorkoutExerciseInput>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct WorkoutExerciseInput {
    pub exercise_id: Uuid,
    pub sets: Option<i32>,
    pub reps: Option<i32>,
    pub rest_seconds: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateWorkoutRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub exercises: Option<Vec<WorkoutExerciseInput>>,
}
