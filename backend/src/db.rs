use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;

pub async fn establish_connection() -> PgPool {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://fitness_user:fitness_password@localhost:5433/fitness_tracker".to_string());
        
    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to Postgres")
}
