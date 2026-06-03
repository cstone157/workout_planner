# Setup Instructions

This guide will help you set up the Workout Planner application for local development.

## Prerequisites

- Node.js 18+ (for frontend)
- Rust 1.70+ (for backend)
- MongoDB 5.0+, MongoDB Atlas account, or Docker (for MongoDB containerization)
- Git
- Docker & Docker Compose (optional, for containerized setup)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd workout_planner
```

### 2. Frontend Setup

```bash
cd frontend

# Copy environment configuration
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Setup

```bash
cd backend

# Copy environment configuration
cp .env.example .env

# Install Rust dependencies
cargo build

# Run the backend
cargo run
```

The backend API will be available at `http://localhost:8080`

### 4. Database Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Create database and collections
mongosh < setup-db.js
```

#### Option B: MongoDB Atlas Cloud

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

#### Option C: Docker MongoDB

Run MongoDB in a Docker container without installing it locally:

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d \
  --name workout-planner-db \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -v mongodb_data:/data/db \
  mongo

# Verify MongoDB is running
docker ps | grep workout-planner-db

# Access MongoDB shell
docker exec -it workout-planner-db mongosh -u admin -p admin123
```

Update `backend/.env` to use Docker MongoDB:
```
MONGODB_URI=mongodb://admin:admin123@localhost:27017
MONGODB_DATABASE=workout_planner
```

**Stopping Docker MongoDB:**
```bash
# Stop container
docker stop workout-planner-db

# Remove container (data persists in volume)
docker rm workout-planner-db

# Remove volume (deletes all data)
docker volume rm mongodb_data
```

**Restarting Docker MongoDB:**
```bash
# Restart existing container
docker start workout-planner-db
```

**Docker MongoDB with Docker Compose:**

If you prefer to manage MongoDB with Docker Compose, use the provided `docker-compose.yml`:

```bash
# Start only MongoDB
docker-compose up -d mongodb

# Stop MongoDB
docker-compose stop mongodb

# View MongoDB logs
docker-compose logs -f mongodb
```

### 5. Environment Configuration

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000
```

#### Backend (.env)
```
RUST_LOG=debug
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=workout_planner
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION_HOURS=24
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Docker Setup

### Using Docker Compose

The easiest way to run all services together:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

### Building Individual Docker Images

#### Backend
```bash
docker build -f docker/Dockerfile.backend -t workout-planner-backend .
docker run -p 8080:8080 workout-planner-backend
```

#### Frontend
```bash
docker build -f docker/Dockerfile.frontend -t workout-planner-frontend .
docker run -p 3000:3000 workout-planner-frontend
```

## Verification

### Frontend Health Check
```bash
curl http://localhost:5173
```

### Backend Health Check
```bash
curl http://localhost:8080/api/health
```

### Database Connection
```bash
mongosh mongodb://localhost:27017
use workout_planner
db.adminCommand('ping')
```

## MongoDB Management with Docker

If you're using Docker to run MongoDB, here are some helpful management commands:

### Basic Container Management

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View MongoDB container logs
docker logs workout-planner-db

# Follow logs in real-time
docker logs -f workout-planner-db

# Stop MongoDB
docker stop workout-planner-db

# Start MongoDB (restarts stopped container)
docker start workout-planner-db

# Restart MongoDB
docker restart workout-planner-db

# Remove container (keeps data in volume)
docker rm workout-planner-db

# View Docker volumes
docker volume ls
```

### Database Operations

```bash
# Access MongoDB shell
docker exec -it workout-planner-db mongosh -u admin -p admin123

# Create database backup
docker exec workout-planner-db mongodump --uri "mongodb://admin:admin123@localhost:27017" --out /dump
docker cp workout-planner-db:/dump ./mongodb-backup

# Restore database from backup
docker cp ./mongodb-backup workout-planner-db:/restore
docker exec workout-planner-db mongorestore --uri "mongodb://admin:admin123@localhost:27017" /restore

# List databases
docker exec workout-planner-db mongosh -u admin -p admin123 --eval "show databases"

# Drop database
docker exec workout-planner-db mongosh -u admin -p admin123 --eval "db.dropDatabase()" --authenticationDatabase admin workout_planner
```

### Updating Connection String

If using Docker MongoDB locally, update your `backend/.env`:

```bash
# For local Docker container
MONGODB_URI=mongodb://admin:admin123@localhost:27017

# Or if running backend in Docker Compose
MONGODB_URI=mongodb://admin:admin123@mongodb:27017
```

**Note:** When using Docker Compose, use the service name (`mongodb`) instead of `localhost`.

### Switching Between MongoDB Options

To switch from one database option to another:

1. **Stop current MongoDB:**
   ```bash
   # If using Docker
   docker stop workout-planner-db
   
   # If using local installation
   brew services stop mongodb-community
   ```

2. **Update connection string in `backend/.env`:**
   ```bash
   # For Docker MongoDB
   MONGODB_URI=mongodb://admin:admin123@localhost:27017
   
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017
   
   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

3. **Start new MongoDB option:**
   ```bash
   # Docker
   docker start workout-planner-db
   
   # Or local
   brew services start mongodb-community
   ```

4. **Restart backend:**
   ```bash
   cargo run
   ```

## Common Issues

### Port Already in Use
If port 8080 or 5173 is already in use:
- Windows: `netstat -ano | findstr :8080`
- macOS/Linux: `lsof -i :8080`

### MongoDB Connection Failed
- Ensure MongoDB is running
  - If using Docker: `docker ps | grep workout-planner-db`
  - If using local: `brew services list | grep mongodb`
  - If using Atlas: Check cluster status in MongoDB Atlas console
- Check connection string in `.env`
- Verify credentials if using MongoDB Atlas or Docker
- For Docker MongoDB, ensure port 27017 is not in use: `lsof -i :27017`
- Test MongoDB connection:
  ```bash
  # Docker MongoDB
  docker exec workout-planner-db mongosh -u admin -p admin123 --eval "db.adminCommand('ping')"
  
  # Local MongoDB
  mongosh --eval "db.adminCommand('ping')"
  ```

### Frontend Cannot Reach Backend
- Check CORS settings in backend
- Verify `VITE_API_URL` in frontend `.env`
- Ensure backend is running

## Next Steps

1. Read the [API documentation](API.md)
2. Review the [architecture documentation](ARCHITECTURE.md)
3. Check the main [README.md](../README.md) for project overview
4. Start implementing features from the development roadmap

## Getting Help

- Check existing documentation
- Review GitHub issues for similar problems
- Create a new issue with detailed information
