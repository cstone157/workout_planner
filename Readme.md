# Workout Planner

This project contains the database infrastructure for an AI-powered workout planner application. 

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Initialization

The project uses a containerized PostgreSQL 17 database. On the first startup, the database will automatically initialize with a pre-configured fitness schema.

To start the database, run the following command in the root of the project:

```bash
docker compose up -d
```

This will run the database in the background.

## Database Connection Details

Once running, you can connect to the database using the following credentials:

- **Host**: `localhost`
- **Port**: `5433` (mapped from the container's 5432 to avoid conflicts)
- **Database Name**: `fitness_tracker`
- **Username**: `fitness_user`
- **Password**: `fitness_password`

## Shutting Down

To stop the database, run:

```bash
docker compose down
```

To stop the database and also wipe all existing data (destroying the data volume), run:

```bash
docker compose down -v
```
