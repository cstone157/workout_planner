use mongodb::{Client, Database};
use crate::errors::ApiError;

pub struct DatabaseConnection;

impl DatabaseConnection {
    pub async fn connect() -> Result<Database, ApiError> {
        let uri = std::env::var("MONGODB_URI")
            .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        
        let client = Client::with_uri_str(&uri)
            .await
            .map_err(|e| ApiError::DatabaseError(format!("Failed to connect to MongoDB: {}", e)))?;

        let db_name = std::env::var("MONGODB_DATABASE")
            .unwrap_or_else(|_| "workout_planner".to_string());

        Ok(client.database(&db_name))
    }
}
