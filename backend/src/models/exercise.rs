use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Exercise {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub muscle_group: Option<String>,
    pub equipment: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateExerciseRequest {
    pub name: String,
    pub description: Option<String>,
    pub muscle_group: Option<String>,
    pub equipment: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateExerciseRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub muscle_group: Option<String>,
    pub equipment: Option<String>,
}

/// Text used for embedding generation
impl Exercise {
    pub fn embedding_text(&self) -> String {
        let mut parts = vec![self.name.clone()];
        if let Some(ref mg) = self.muscle_group { parts.push(format!("muscle group: {}", mg)); }
        if let Some(ref eq) = self.equipment { parts.push(format!("equipment: {}", eq)); }
        if let Some(ref desc) = self.description { parts.push(desc.clone()); }
        parts.join(". ")
    }
}

#[derive(Debug, Serialize)]
pub struct SearchResult {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub muscle_group: Option<String>,
    pub equipment: Option<String>,
    pub similarity_score: f32,
}

#[derive(Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    #[serde(default = "default_n_results")]
    pub n_results: usize,
}

fn default_n_results() -> usize { 10 }
