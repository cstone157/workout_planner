use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use crate::AppState;

pub async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({"status": "ok"})))
}

pub async fn ready(State(state): State<AppState>) -> impl IntoResponse {
    // Check Postgres
    let pg_ok = sqlx::query("SELECT 1")
        .fetch_one(&state.db)
        .await
        .is_ok();

    // Check ChromaDB
    let chroma_ok = state.chroma.heartbeat().await;

    if pg_ok && chroma_ok {
        (StatusCode::OK, Json(json!({"status": "ready", "postgres": "ok", "chromadb": "ok"})))
    } else {
        (StatusCode::SERVICE_UNAVAILABLE, Json(json!({
            "status": "not_ready",
            "postgres": if pg_ok { "ok" } else { "error" },
            "chromadb": if chroma_ok { "ok" } else { "error" },
        })))
    }
}
