use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Equipment {
    pub id: Uuid,
    pub owner_id: Option<Uuid>,
    pub name: String,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Workout {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub scheduled_date: Option<DateTime<Utc>>,
    pub completed_date: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}
