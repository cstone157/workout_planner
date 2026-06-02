use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id")]
    pub id: Option<String>,
    pub email: String,
    pub username: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub profile: Option<UserProfile>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProfile {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub age: Option<i32>,
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Workout {
    #[serde(rename = "_id")]
    pub id: Option<String>,
    pub user_id: String,
    pub date: DateTime<Utc>,
    pub exercises: Vec<Exercise>,
    pub total_duration_minutes: i32,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Exercise {
    pub name: String,
    pub sets: i32,
    pub reps: i32,
    pub weight_kg: Option<f64>,
    pub duration_minutes: Option<i32>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Equipment {
    #[serde(rename = "_id")]
    pub id: Option<String>,
    pub user_id: String,
    pub name: String,
    pub category: String,
    pub description: Option<String>,
    pub acquired_date: Option<DateTime<Utc>>,
    pub condition: String,
    pub last_maintained: Option<DateTime<Utc>>,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkoutPlan {
    #[serde(rename = "_id")]
    pub id: Option<String>,
    pub user_id: String,
    pub name: String,
    pub description: Option<String>,
    pub schedule: Vec<DaySchedule>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DaySchedule {
    pub day_of_week: String,
    pub exercises: Vec<PlannedExercise>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlannedExercise {
    pub name: String,
    pub target_sets: i32,
    pub target_reps: i32,
    pub equipment_needed: Vec<String>,
}

// Request/Response DTOs
#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}
