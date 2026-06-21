# Workout Planner

This project contains the full-stack infrastructure for an AI-powered workout planner application. It currently includes a containerized PostgreSQL database and a high-performance Rust (Axum) backend.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Building and Deployment

The entire application stack is dockerized and managed via Docker Compose.

To build the backend image and start all services (database and backend), run the following command in the root of the project:

```bash
docker compose up -d --build
```

This will:
1. Start a `postgres:17` container and automatically initialize the fitness schema on first startup.
2. Build the Rust backend inside a multi-stage Docker build.
3. Start the backend server and connect it internally to the database.

*Note: The `--build` flag ensures that the backend image is compiled using the latest source code in the `backend/` directory.*

## Accessing the Services

Once running, the services are available at the following locations:

### Backend API
- **URL**: `http://localhost:3000`
- **Endpoints**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET, POST, PUT, DELETE /api/equipment`
  - `GET, POST, PUT, DELETE /api/workouts`

### Database
You can connect to the database locally using the following credentials:
- **Host**: `localhost`
- **Port**: `5433` (mapped from the container's 5432 to avoid conflicts)
- **Database Name**: `fitness_tracker`
- **Username**: `fitness_user`
- **Password**: `fitness_password`

## Shutting Down

To stop the database and backend services, run:

```bash
docker compose down
```

To stop the services and also wipe all existing data (destroying the database volume), run:

```bash
docker compose down -v
```

## Local Development (Without Docker)

If you wish to run the backend natively for development purposes:
1. Ensure the database container is running (`docker compose up -d db`).
2. Navigate to the `backend/` directory.
3. Run the server using cargo:
```bash
cargo run
```
*(The backend relies on the `.env` file for compile-time query verification and local runtime connections).*
