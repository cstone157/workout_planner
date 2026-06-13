use axum::{extract::State, http::StatusCode, Json};
use serde_json::json;
use uuid::Uuid;

use crate::{
    AppState,
    auth::{generate_access_token, generate_refresh_token, validate_token},
    auth::password::{hash_password, verify_password},
    extractors::AppResult,
    models::user::{
        AccessTokenResponse, AuthResponse, LoginRequest, RefreshRequest, RegisterRequest,
        UserResponse,
    },
};

pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> AppResult<(StatusCode, Json<AuthResponse>)> {
    // Check email uniqueness
    let existing = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE email = $1"
    )
    .bind(&req.email)
    .fetch_one(&state.db)
    .await?;

    if existing > 0 {
        return Err(anyhow::anyhow!("Email already registered").into());
    }

    let password_hash = hash_password(&req.password)?;
    let user_id = Uuid::new_v4();

    sqlx::query(
        "INSERT INTO users (id, email, password_hash, display_name) VALUES ($1, $2, $3, $4)"
    )
    .bind(user_id)
    .bind(&req.email)
    .bind(&password_hash)
    .bind(&req.display_name)
    .execute(&state.db)
    .await?;

    let access_token = generate_access_token(user_id, &req.email, &state.jwt_secret)?;
    let refresh_token = generate_refresh_token(user_id, &req.email, &state.jwt_secret)?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            access_token,
            refresh_token,
            user: UserResponse {
                id: user_id,
                email: req.email,
                display_name: req.display_name,
            },
        }),
    ))
}

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    let user = sqlx::query_as::<_, crate::models::user::User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&req.email)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| anyhow::anyhow!("Invalid email or password"))?;

    let valid = verify_password(&req.password, &user.password_hash)?;
    if !valid {
        return Err(anyhow::anyhow!("Invalid email or password").into());
    }

    let access_token = generate_access_token(user.id, &user.email, &state.jwt_secret)?;
    let refresh_token = generate_refresh_token(user.id, &user.email, &state.jwt_secret)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token,
        user: user.into(),
    }))
}

pub async fn refresh(
    State(state): State<AppState>,
    Json(req): Json<RefreshRequest>,
) -> AppResult<Json<AccessTokenResponse>> {
    let claims = validate_token(&req.refresh_token, &state.jwt_secret, "refresh")
        .map_err(|_| anyhow::anyhow!("Invalid or expired refresh token"))?;

    let user_id = Uuid::parse_str(&claims.sub)?;
    let access_token = generate_access_token(user_id, &claims.email, &state.jwt_secret)?;

    Ok(Json(AccessTokenResponse { access_token }))
}
