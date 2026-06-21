use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
    routing::get,
    Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{auth::AuthUser, models::Equipment};

#[derive(Deserialize)]
pub struct CreateEquipmentRequest {
    name: String,
    description: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateEquipmentRequest {
    name: String,
    description: Option<String>,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_equipment).post(create_equipment))
        .route("/:id", axum::routing::put(update_equipment).delete(delete_equipment))
}

async fn list_equipment(
    State(pool): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<Equipment>>, (StatusCode, String)> {
    let equipment = sqlx::query_as!(
        Equipment,
        "SELECT id, owner_id, name, description, created_at FROM equipment WHERE owner_id = $1",
        user.user_id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(equipment))
}

async fn create_equipment(
    State(pool): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<CreateEquipmentRequest>,
) -> Result<(StatusCode, Json<Equipment>), (StatusCode, String)> {
    let eq = sqlx::query_as!(
        Equipment,
        "INSERT INTO equipment (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id, owner_id, name, description, created_at",
        user.user_id,
        payload.name,
        payload.description
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(eq)))
}

async fn update_equipment(
    State(pool): State<PgPool>,
    user: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateEquipmentRequest>,
) -> Result<Json<Equipment>, (StatusCode, String)> {
    let eq = sqlx::query_as!(
        Equipment,
        "UPDATE equipment SET name = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING id, owner_id, name, description, created_at",
        payload.name,
        payload.description,
        id,
        user.user_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(eq) = eq {
        Ok(Json(eq))
    } else {
        Err((StatusCode::NOT_FOUND, "Equipment not found".to_string()))
    }
}

async fn delete_equipment(
    State(pool): State<PgPool>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let rows_affected = sqlx::query!(
        "DELETE FROM equipment WHERE id = $1 AND owner_id = $2",
        id,
        user.user_id
    )
    .execute(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .rows_affected();

    if rows_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err((StatusCode::NOT_FOUND, "Equipment not found".to_string()))
    }
}
