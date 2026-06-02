mod models;
mod errors;
mod database;
mod utils;
mod handlers {
    pub mod auth;
    pub mod workouts;
}

use actix_web::{web, App, HttpServer, middleware};
use std::sync::Arc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let host = std::env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("SERVER_PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(8080);

    log::info!("Starting server on {}:{}", host, port);

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .route("/api/health", web::get().to(health_check))
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}

async fn health_check() -> actix_web::Result<web::Json<serde_json::json!({})> {
    Ok(web::Json(serde_json::json!({ "status": "ok" })))
}
