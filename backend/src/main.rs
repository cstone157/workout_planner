mod auth;
mod chroma;
mod embeddings;
mod extractors;
mod models;
mod routes;

use std::sync::Arc;
use axum::{
    routing::{get, post},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use tower_http::{cors::{Any, CorsLayer}, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use chroma::client::ChromaStore;
use embeddings::Embedder;

#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub chroma: Arc<ChromaStore>,
    pub embedder: Arc<Embedder>,
    pub jwt_secret: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env for local dev
    let _ = dotenvy::dotenv();

    // Tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "workout_planner_backend=info,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Config from env
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    let chroma_url = std::env::var("CHROMA_URL")
        .unwrap_or_else(|_| "http://localhost:8000".to_string());
    let jwt_secret = std::env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set");
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .expect("PORT must be a number");

    // Postgres pool
    tracing::info!("Connecting to Postgres…");
    let db = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await?;

    // Run migrations
    tracing::info!("Running database migrations…");
    sqlx::migrate!("./migrations").run(&db).await?;
    tracing::info!("Migrations complete");

    // ChromaDB
    let chroma = Arc::new(ChromaStore::new(&chroma_url).await?);

    // Embedder (downloads model on first run)
    let embedder = Arc::new(Embedder::new().await?);

    let state = AppState {
        db,
        chroma,
        embedder,
        jwt_secret,
    };

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Router
    let app = Router::new()
        // Health
        .route("/health", get(routes::health::health))
        .route("/ready",  get(routes::health::ready))
        // Auth (public)
        .route("/api/auth/register", post(routes::auth::register))
        .route("/api/auth/login",    post(routes::auth::login))
        .route("/api/auth/refresh",  post(routes::auth::refresh))
        // Exercises (protected)
        .route("/api/exercises",      get(routes::exercises::list).post(routes::exercises::create))
        .route("/api/exercises/:id",  get(routes::exercises::get)
                                          .put(routes::exercises::update)
                                          .delete(routes::exercises::delete))
        // Search (protected)
        .route("/api/search", post(routes::exercises::semantic_search))
        // Workouts (protected)
        .route("/api/workouts",     get(routes::workouts::list).post(routes::workouts::create))
        .route("/api/workouts/:id", get(routes::workouts::get)
                                        .put(routes::workouts::update)
                                        .delete(routes::workouts::delete))
        // Sessions (protected)
        .route("/api/sessions",     get(routes::sessions::list).post(routes::sessions::create))
        .route("/api/sessions/:id", get(routes::sessions::get))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("🚀 Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to install Ctrl+C handler");
    tracing::info!("Shutdown signal received, draining connections…");
}
