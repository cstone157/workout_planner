# Setup Instructions

This guide will help you set up the Workout Planner application for local development.

## Prerequisites

- Node.js 18+ (for frontend)
- Rust 1.70+ (for backend)
- MongoDB 5.0+ or MongoDB Atlas account
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

## Common Issues

### Port Already in Use
If port 8080 or 5173 is already in use:
- Windows: `netstat -ano | findstr :8080`
- macOS/Linux: `lsof -i :8080`

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify credentials if using MongoDB Atlas

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
