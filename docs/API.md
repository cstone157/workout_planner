# API Documentation

## Base URL

```
http://localhost:8080/api
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are JSON with the following format:

### Success Response
```json
{
  "status": "success",
  "data": { }
}
```

### Error Response
```json
{
  "error": "ErrorType",
  "message": "Error description"
}
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 86400
}
```

#### POST /auth/login
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 86400
}
```

#### POST /auth/refresh
Refresh an expired access token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_jwt_token",
  "expires_in": 86400
}
```

#### POST /auth/logout
Logout and invalidate tokens.

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

### Workouts

#### GET /workouts
List all workouts for the authenticated user.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `start_date` (optional, ISO format)
- `end_date` (optional, ISO format)

**Response:**
```json
[
  {
    "_id": "workout_id",
    "user_id": "user_id",
    "date": "2026-06-01T10:00:00Z",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 3,
        "reps": 8,
        "weight_kg": 100,
        "duration_minutes": 5,
        "notes": "Good form"
      }
    ],
    "total_duration_minutes": 45,
    "notes": "Great workout",
    "created_at": "2026-06-01T10:00:00Z",
    "updated_at": "2026-06-01T10:00:00Z"
  }
]
```

#### GET /workouts/:id
Get a specific workout by ID.

**Response:**
```json
{
  "_id": "workout_id",
  "user_id": "user_id",
  "date": "2026-06-01T10:00:00Z",
  "exercises": [ ],
  "total_duration_minutes": 45,
  "notes": "Great workout",
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-01T10:00:00Z"
}
```

#### POST /workouts
Create a new workout.

**Request Body:**
```json
{
  "date": "2026-06-01T10:00:00Z",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 3,
      "reps": 8,
      "weight_kg": 100,
      "duration_minutes": 5,
      "notes": "Good form"
    }
  ],
  "total_duration_minutes": 45,
  "notes": "Great workout"
}
```

**Response:** 201 Created
```json
{
  "_id": "new_workout_id",
  "user_id": "user_id",
  ...
}
```

#### PUT /workouts/:id
Update a workout.

**Request Body:** Same as POST /workouts

**Response:** 200 OK with updated workout data

#### DELETE /workouts/:id
Delete a workout.

**Response:** 204 No Content

#### GET /workouts/stats
Get workout statistics for the authenticated user.

**Query Parameters:**
- `period` (optional: week, month, year, default: month)

**Response:**
```json
{
  "total_workouts": 15,
  "total_duration_minutes": 450,
  "average_duration_minutes": 30,
  "most_common_exercise": "Bench Press",
  "personal_records": [
    {
      "exercise": "Bench Press",
      "weight_kg": 120,
      "date": "2026-06-01"
    }
  ]
}
```

---

### Workout Plans

#### GET /plans
List all workout plans for the authenticated user.

**Response:**
```json
[
  {
    "_id": "plan_id",
    "user_id": "user_id",
    "name": "Push/Pull/Legs",
    "description": "3-day split routine",
    "schedule": [
      {
        "day_of_week": "Monday",
        "exercises": [
          {
            "name": "Bench Press",
            "target_sets": 3,
            "target_reps": 8,
            "equipment_needed": ["Barbell", "Bench"]
          }
        ]
      }
    ],
    "is_active": true,
    "created_at": "2026-06-01T10:00:00Z",
    "updated_at": "2026-06-01T10:00:00Z"
  }
]
```

#### GET /plans/:id
Get a specific workout plan.

#### POST /plans
Create a new workout plan.

#### PUT /plans/:id
Update a workout plan.

#### DELETE /plans/:id
Delete a workout plan.

---

### Equipment

#### GET /equipment
List all equipment for the authenticated user.

**Response:**
```json
[
  {
    "_id": "equipment_id",
    "user_id": "user_id",
    "name": "Barbell",
    "category": "Weights",
    "description": "Olympic barbell 20kg",
    "acquired_date": "2025-01-01T00:00:00Z",
    "condition": "good",
    "last_maintained": "2026-05-15T00:00:00Z",
    "active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2026-05-15T00:00:00Z"
  }
]
```

#### POST /equipment
Add new equipment.

#### PUT /equipment/:id
Update equipment details.

#### DELETE /equipment/:id
Remove equipment.

---

### User Profile

#### GET /user/profile
Get the authenticated user's profile.

**Response:**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "age": 30,
    "height_cm": 180,
    "weight_kg": 85
  }
}
```

#### PUT /user/profile
Update user profile.

#### GET /user/preferences
Get user preferences.

#### PUT /user/preferences
Update user preferences.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints

---

## Examples

### Register and Login
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create a Workout
```bash
curl -X POST http://localhost:8080/api/workouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-06-01T10:00:00Z",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 3,
        "reps": 8,
        "weight_kg": 100
      }
    ],
    "total_duration_minutes": 45
  }'
```
