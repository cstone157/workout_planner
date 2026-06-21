mod auth;
mod db;
mod models;
mod routes;

use axum::Router;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    // Load environment variables if .env file exists
    let _ = dotenvy::dotenv();

    // Establish database connection pool
    let pool = db::establish_connection().await;

    // Set up CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build application router
    let app = Router::new()
        .nest("/api/auth", routes::auth::routes())
        .nest("/api/equipment", routes::equipment::routes())
        .nest("/api/workouts", routes::workouts::routes())
        .with_state(pool)
        .layer(cors);

    // Start the server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Server running on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
