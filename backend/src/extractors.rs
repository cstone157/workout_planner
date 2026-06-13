use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use uuid::Uuid;

use crate::auth::validate_token;
use crate::AppState;

/// Authenticated user injected by the JWT extractor
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
}

pub struct AppError(anyhow::Error);

impl<E: Into<anyhow::Error>> From<E> for AppError {
    fn from(e: E) -> Self {
        Self(e.into())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!("Internal error: {:?}", self.0);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": self.0.to_string()})),
        )
            .into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| {
                (StatusCode::UNAUTHORIZED, Json(json!({"error": "Missing Authorization header"})))
                    .into_response()
            })?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| {
                (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid Authorization format"})))
                    .into_response()
            })?;

        let claims = validate_token(token, &state.jwt_secret, "access").map_err(|_| {
            (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid or expired token"})))
                .into_response()
        })?;

        let user_id = Uuid::parse_str(&claims.sub).map_err(|_| {
            (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid token subject"})))
                .into_response()
        })?;

        Ok(AuthUser {
            id: user_id,
            email: claims.email,
        })
    }
}
