use axum::{
    extract::State,
    http::StatusCode,
    Json,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::auth::{hash_password, verify_password, create_jwt};

#[derive(Deserialize)]
pub struct RegisterRequest {
    username: String,
    email: String,
    password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    token: String,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

async fn register(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, String)> {
    let password_hash = hash_password(&payload.password)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password".to_string()))?;

    let user_id = sqlx::query_scalar!(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
        payload.username,
        payload.email,
        password_hash
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    let token = create_jwt(user_id)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Token creation failed".to_string()))?;

    Ok((StatusCode::CREATED, Json(AuthResponse { token })))
}

async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, String)> {
    let user = sqlx::query!(
        "SELECT id, password_hash FROM users WHERE username = $1",
        payload.username
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(user) = user {
        if verify_password(&payload.password, &user.password_hash) {
            let token = create_jwt(user.id)
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Token creation failed".to_string()))?;
            return Ok((StatusCode::OK, Json(AuthResponse { token })));
        }
    }

    Err((StatusCode::UNAUTHORIZED, "Invalid username or password".to_string()))
}
