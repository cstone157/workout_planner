# Workout Planner - Three-Tiered Web Application

## Project Overview

Workout Planner is a modern web and mobile application designed to help users track their fitness journey. The application enables users to log completed workouts, plan future workout sessions, manage their available equipment, and receive real-time workout timing assistance.

---

## Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────┐
│      Frontend (Svelte)              │
│   ├─ Web (Browser)                  │
│   └─ Mobile (Responsive/PWA)        │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────┐
│      Backend (Rust)                 │
│   ├─ API Server                     │
│   ├─ Business Logic                 │
│   └─ Authentication & Authorization │
└──────────────┬──────────────────────┘
               │ Database Driver
               ▼
┌─────────────────────────────────────┐
│      Database (MongoDB)             │
│   ├─ Workouts Collection            │
│   ├─ Users Collection               │
│   ├─ Equipment Collection           │
│   └─ Workout Plans Collection       │
└─────────────────────────────────────┘
```

---

## Frontend (Svelte)

### Technologies & Tools
- **Framework**: Svelte with SvelteKit
- **Styling**: Tailwind CSS for responsive design
- **Mobile Support**: 
  - Progressive Web App (PWA) capabilities for mobile installation
  - Responsive design for all screen sizes
  - Touch-optimized UI components
  - Offline support with service workers
- **State Management**: Svelte stores
- **HTTP Client**: Fetch API or axios for API communication
- **Build Tool**: Vite

### Key Pages/Components
1. **Dashboard**: Overview of recent workouts, upcoming plans, statistics
2. **Workout Logger**: Form to record completed workouts
   - Exercise selection
   - Sets, reps, and weight tracking
   - Duration tracking
   - Notes field
3. **Workout Planner**: Calendar view for planning future workouts
   - Drag-and-drop workout assignment
   - Recurring workout templates
   - Workout preview and editing
4. **Equipment Tracker**: Manage available equipment
   - Add/remove equipment
   - Track equipment condition/maintenance
   - Filter workouts by available equipment
5. **Timer**: Real-time workout timer with alerts
   - Set/rep timer
   - Rest period timer
   - Audible and visual notifications
6. **User Profile**: Account settings and preferences
   - Personal information
   - Goals and preferences
   - Notification settings

### Responsive Design Strategy
- Mobile-first approach
- Breakpoints: Mobile (< 640px), Tablet (640px - 1024px), Desktop (> 1024px)
- Touch-friendly button sizes and spacing (minimum 44x44px)
- Optimized navigation for mobile (hamburger menu, bottom navigation)

---

## Backend (Rust)

### Technologies & Tools
- **Web Framework**: Actix-web or Axum
- **Database Driver**: MongoDB driver for Rust (mongodb crate)
- **Authentication**: JWT tokens with refresh tokens
- **Validation**: Serde for serialization and validation
- **Logging**: Tracing and env_logger
- **Error Handling**: Custom error types with proper HTTP responses
- **Testing**: Cargo built-in testing framework

### Core API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

#### Workouts
- `GET /api/workouts` - List user's workouts (paginated)
- `GET /api/workouts/:id` - Get workout details
- `POST /api/workouts` - Create new workout log
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/stats` - Get workout statistics

#### Workout Plans
- `GET /api/plans` - List workout plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans` - Create new workout plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

#### Equipment
- `GET /api/equipment` - List available equipment
- `POST /api/equipment` - Add equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Remove equipment

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update preferences

### Backend Features
- Input validation for all endpoints
- Rate limiting to prevent abuse
- CORS configuration for frontend communication
- Comprehensive error handling
- Request/response logging
- Health check endpoint (`GET /api/health`)

---

## Database (MongoDB)

### Collections

#### Users Collection
```json
{
  "_id": ObjectId,
  "email": String,
  "username": String,
  "password_hash": String,
  "created_at": DateTime,
  "updated_at": DateTime,
  "profile": {
    "first_name": String,
    "last_name": String,
    "age": Number,
    "height_cm": Number,
    "weight_kg": Number
  }
}
```

#### Workouts Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "date": DateTime,
  "exercises": [
    {
      "name": String,
      "sets": Number,
      "reps": Number,
      "weight_kg": Number,
      "duration_minutes": Number,
      "notes": String
    }
  ],
  "total_duration_minutes": Number,
  "notes": String,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### Equipment Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "name": String,
  "category": String,
  "description": String,
  "acquired_date": DateTime,
  "condition": String (good/fair/needs_repair),
  "last_maintained": DateTime,
  "active": Boolean,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### Workout Plans Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "name": String,
  "description": String,
  "schedule": [
    {
      "day_of_week": String,
      "exercises": [
        {
          "name": String,
          "target_sets": Number,
          "target_reps": Number,
          "equipment_needed": [String]
        }
      ]
    }
  ],
  "is_active": Boolean,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### Indexes
- `users.email` (unique)
- `workouts.user_id`
- `workouts.date`
- `equipment.user_id`
- `plans.user_id`

---

## Project Structure

```
workout_planner/
├── frontend/                          # Svelte/SvelteKit application
│   ├── src/
│   │   ├── routes/                   # Page components
│   │   ├── components/               # Reusable components
│   │   ├── stores/                   # Svelte stores
│   │   ├── lib/                      # Utilities and helpers
│   │   ├── api/                      # API client functions
│   │   └── app.svelte                # Root component
│   ├── static/                       # Static assets
│   ├── svelte.config.js              # SvelteKit configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Rust Actix-web backend
│   ├── src/
│   │   ├── main.rs                   # Entry point
│   │   ├── models.rs                 # Data models
│   │   ├── handlers/                 # HTTP handlers
│   │   │   ├── auth.rs
│   │   │   ├── workouts.rs
│   │   ├── middleware/               # Custom middleware
│   │   ├── database.rs               # Database connections
│   │   ├── errors.rs                 # Error handling
│   │   └── utils.rs                  # Utility functions
│   ├── tests/                        # Integration tests
│   ├── Cargo.toml                    # Dependencies
│   └── .env.example                  # Environment variables template
│
├── docker/                            # Docker configuration
│   ├── Dockerfile.backend            # Backend container
│   ├── Dockerfile.frontend           # Frontend container
│   └── docker-compose.yml            # Multi-container orchestration
│
├── docs/                              # Documentation
│   ├── API.md                        # API documentation
│   ├── SETUP.md                      # Setup instructions
│   └── ARCHITECTURE.md               # Detailed architecture docs
│
├── .gitignore
├── README.md                          # This file
└── CONTRIBUTING.md                    # Contributing guidelines
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up project repository and initial structure
- [ ] Configure MongoDB database and collections
- [ ] Implement basic Rust backend with Actix-web
- [ ] Create authentication system (registration, login, JWT)
- [ ] Set up basic Svelte frontend project
- [ ] Create responsive layout components

### Phase 2: Core Features (Weeks 3-4)
- [ ] Implement Workout Logging feature
  - Backend endpoints for CRUD operations
  - Frontend forms and validation
- [ ] Implement Equipment Tracker
  - Backend endpoints
  - Frontend UI components
- [ ] Implement Workout Plans
  - Backend endpoints
  - Calendar interface frontend

### Phase 3: Advanced Features (Week 5)
- [ ] Implement Timer functionality
  - Real-time updates
  - Local notifications
- [ ] Add Statistics and Dashboard
  - Data aggregation in backend
  - Charts and visualizations in frontend
- [ ] User Profile and Preferences

### Phase 4: Mobile & Polish (Week 6)
- [ ] Convert to Progressive Web App (PWA)
- [ ] Add offline functionality
- [ ] Mobile optimization and testing
- [ ] Performance optimization
- [ ] Bug fixes and refinements

### Phase 5: Deployment & Production (Week 7)
- [ ] Set up Docker containers
- [ ] Configure CI/CD pipeline
- [ ] Deploy to hosting platform (AWS, Heroku, DigitalOcean, etc.)
- [ ] Set up monitoring and logging
- [ ] Create production deployment documentation

---

## Technical Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Svelte/SvelteKit | UI framework with SSR support |
| Frontend Styling | Tailwind CSS | Utility-first CSS |
| Frontend Mobile | PWA + Service Workers | Cross-platform mobile support |
| Backend | Rust + Actix-web | High-performance web framework |
| Database | MongoDB | NoSQL document database |
| API Communication | HTTP/REST | Backend-frontend communication |
| Authentication | JWT | Stateless authentication |
| Deployment | Docker | Container orchestration |

---

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Rust 1.70+ (for backend)
- MongoDB 5.0+ or MongoDB Atlas
- Git

### Quick Start
1. Clone the repository
2. Follow [SETUP.md](docs/SETUP.md) for detailed setup instructions
3. See [API.md](docs/API.md) for API endpoint documentation

---

## Features Checklist

### Workout Tracking
- [ ] Log completed workouts with exercises, sets, reps, and weight
- [ ] View workout history with filters and search
- [ ] Edit and delete workout entries

### Workout Planning
- [ ] Create customizable workout plans
- [ ] Schedule workouts on a calendar
- [ ] Set recurring workout patterns
- [ ] Plan by available equipment

### Equipment Management
- [ ] Add and track available equipment
- [ ] Update equipment status (good/fair/needs repair)
- [ ] Filter workouts by available equipment

### Timing & Alerts
- [ ] Real-time set/rep timer
- [ ] Rest period countdowns
- [ ] Audio and visual notifications
- [ ] Local browser notifications

### User Experience
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Offline mode (PWA)
- [ ] Dark/light theme support
- [ ] User authentication and authorization
- [ ] User preferences and settings

### Statistics & Insights
- [ ] Workout frequency tracking
- [ ] Personal records (PR) tracking
- [ ] Progress charts and analytics
- [ ] Goal tracking

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## License

[Specify your license here - e.g., MIT, Apache 2.0]

---

## Contact & Support

For questions, issues, or suggestions, please [describe how to reach out].

---

**Last Updated**: June 1, 2026
