use anyhow::Context;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,       // user UUID
    pub email: String,
    pub exp: usize,        // expiry (Unix timestamp)
    pub iat: usize,        // issued at
    pub token_type: String, // "access" | "refresh"
}

const ACCESS_EXPIRY_SECS: usize = 15 * 60;          // 15 minutes
const REFRESH_EXPIRY_SECS: usize = 7 * 24 * 60 * 60; // 7 days

pub fn generate_access_token(user_id: Uuid, email: &str, secret: &str) -> anyhow::Result<String> {
    let now = chrono::Utc::now().timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_owned(),
        exp: now + ACCESS_EXPIRY_SECS,
        iat: now,
        token_type: "access".to_string(),
    };
    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .context("Failed to encode access token")
}

pub fn generate_refresh_token(user_id: Uuid, email: &str, secret: &str) -> anyhow::Result<String> {
    let now = chrono::Utc::now().timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_owned(),
        exp: now + REFRESH_EXPIRY_SECS,
        iat: now,
        token_type: "refresh".to_string(),
    };
    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .context("Failed to encode refresh token")
}

pub fn validate_token(token: &str, secret: &str, expected_type: &str) -> anyhow::Result<Claims> {
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;

    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .context("Invalid or expired token")?;

    if data.claims.token_type != expected_type {
        anyhow::bail!("Wrong token type: expected {}", expected_type);
    }

    Ok(data.claims)
}
