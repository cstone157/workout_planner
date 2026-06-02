use crate::errors::ApiError;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id
    pub exp: i64,
    pub iat: i64,
}

pub fn generate_jwt(user_id: &str) -> Result<String, ApiError> {
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-secret-key".to_string());
    
    let expiration_hours = std::env::var("JWT_EXPIRATION_HOURS")
        .ok()
        .and_then(|h| h.parse::<i64>().ok())
        .unwrap_or(24);

    let now = Utc::now();
    let exp = now + Duration::hours(expiration_hours);

    let claims = Claims {
        sub: user_id.to_string(),
        exp: exp.timestamp(),
        iat: now.timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| ApiError::InternalServerError("Failed to generate JWT".to_string()))
}

pub fn verify_jwt(token: &str) -> Result<Claims, ApiError> {
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-secret-key".to_string());

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| ApiError::Unauthorized("Invalid JWT token".to_string()))
}

pub fn hash_password(password: &str) -> Result<String, ApiError> {
    bcrypt::hash(password, 4)
        .map_err(|_| ApiError::InternalServerError("Failed to hash password".to_string()))
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, ApiError> {
    bcrypt::verify(password, hash)
        .map_err(|_| ApiError::InternalServerError("Failed to verify password".to_string()))
}
