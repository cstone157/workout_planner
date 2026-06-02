# Architecture Documentation

## System Overview

Workout Planner is a three-tiered web application built with modern, scalable technologies:

1. **Frontend**: Svelte + SvelteKit (Browser & Mobile PWA)
2. **Backend**: Rust + Actix-web (REST API)
3. **Database**: MongoDB (NoSQL Document Store)

## Technology Stack Details

### Frontend Architecture

#### Tech Stack
- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **State Management**: Svelte Stores
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Package Manager**: npm

#### Key Features
- **Responsive Design**: Mobile-first approach supporting all screen sizes
- **Progressive Web App**: Service workers for offline capability
- **Client-Side Routing**: SPA-style navigation without page reloads
- **Performance**: Code splitting, lazy loading, asset optimization
- **Type Safety**: TypeScript support for better development experience

#### Project Structure
```
frontend/
├── src/
│   ├── routes/           # Page components (auto-routed)
│   ├── components/       # Reusable UI components
│   ├── stores/          # Svelte stores for state
│   ├── lib/             # Utilities and helpers
│   ├── api/             # API client functions
│   └── app.svelte       # Root component
├── static/              # Static assets (favicon, images, etc.)
├── svelte.config.js     # SvelteKit configuration
├── vite.config.js       # Vite bundler configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

#### Mobile Optimization Strategy
1. **Viewport Configuration**: Proper meta tags for responsive scaling
2. **Touch-Friendly UI**: Minimum 44x44px touch targets
3. **Performance**: Optimized bundle size, lazy loading
4. **Offline Support**: Service worker caching strategy
5. **PWA Features**: Installable on home screen, works offline

### Backend Architecture

#### Tech Stack
- **Language**: Rust (Edition 2021)
- **Web Framework**: Actix-web
- **Async Runtime**: Tokio
- **Database Driver**: MongoDB Rust Driver
- **Authentication**: JWT with jsonwebtoken crate
- **Password Hashing**: bcrypt
- **JSON Serialization**: Serde + serde_json

#### Design Patterns
1. **Layered Architecture**: Separation of concerns
2. **Error Handling**: Custom error types with proper HTTP responses
3. **Middleware**: Logging, CORS, Authentication
4. **Database Abstraction**: Connection pooling and management

#### Project Structure
```
backend/
├── src/
│   ├── main.rs          # Entry point & server setup
│   ├── models.rs        # Data structures & DTOs
│   ├── errors.rs        # Error types & handlers
│   ├── database.rs      # Database connection
│   ├── utils.rs         # Utilities (JWT, hashing)
│   └── handlers/        # HTTP request handlers
│       ├── auth.rs      # Authentication endpoints
│       ├── workouts.rs  # Workout management
│       └── ...
├── tests/               # Integration tests
└── Cargo.toml           # Dependencies
```

#### API Design
- **REST Principles**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Resource-Based URLs**: `/api/resource` and `/api/resource/:id`
- **Versioning**: Future API versioning at `/api/v1/`
- **Content Negotiation**: JSON request/response format
- **Pagination**: Query parameters for list endpoints

### Database Architecture

#### MongoDB Schema Design

**Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  username: String,
  password_hash: String,
  profile: {
    first_name: String,
    last_name: String,
    age: Number,
    height_cm: Number,
    weight_kg: Number
  },
  created_at: ISODate,
  updated_at: ISODate
}
```

**Workouts Collection**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  date: ISODate,
  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number,
      weight_kg: Number,
      duration_minutes: Number,
      notes: String
    }
  ],
  total_duration_minutes: Number,
  notes: String,
  created_at: ISODate,
  updated_at: ISODate
}
```

**Equipment Collection**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  category: String,
  condition: String (enum: "good", "fair", "needs_repair"),
  active: Boolean,
  created_at: ISODate,
  updated_at: ISODate
}
```

**Workout Plans Collection**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  schedule: [
    {
      day_of_week: String,
      exercises: [
        {
          name: String,
          target_sets: Number,
          target_reps: Number,
          equipment_needed: [String]
        }
      ]
    }
  ],
  is_active: Boolean,
  created_at: ISODate,
  updated_at: ISODate
}
```

#### Indexing Strategy
- Unique index on `users.email`
- Index on `workouts.user_id` and `workouts.date`
- Index on `equipment.user_id` and `equipment.active`
- Index on `plans.user_id` and `plans.is_active`
- TTL index on refresh tokens (if stored)

#### Data Consistency
- Document-level transactions for atomic operations
- Denormalization where appropriate (e.g., user metadata in workouts)
- No cross-collection foreign keys (document-embedded references)

## Communication Flow

### Request Flow
```
Frontend (Browser/Mobile)
    ↓ HTTP/REST
Backend API (Rust)
    ↓ TCP
MongoDB Database
```

### Authentication Flow
```
1. User registers/logs in
2. Backend verifies credentials (password hash check)
3. Backend generates JWT token
4. Frontend stores token (localStorage/sessionStorage)
5. Frontend includes token in Authorization header for subsequent requests
6. Backend middleware validates JWT before processing requests
7. Expired tokens trigger refresh token flow
```

### Data Flow Example: Creating a Workout
```
1. User fills workout form in Svelte UI
2. Frontend validates input
3. Frontend sends POST /api/workouts with JWT token
4. Backend receives request, validates JWT
5. Backend validates workout data
6. Backend inserts document into workouts collection
7. Backend returns 201 with new workout data
8. Frontend updates local state and displays confirmation
```

## Security Considerations

### Authentication & Authorization
- JWT tokens with configurable expiration
- Refresh token mechanism for long-lived sessions
- Password hashing using bcrypt
- Token stored in secure HTTP-only cookies (future enhancement)

### API Security
- CORS configuration for cross-origin requests
- Rate limiting on sensitive endpoints
- Input validation on all endpoints
- SQL injection prevention (N/A - using MongoDB)
- XSS protection through proper content types

### Data Protection
- HTTPS in production (TLS/SSL)
- MongoDB authentication required
- Environment variables for sensitive configuration
- No sensitive data in logs

## Performance Optimization

### Frontend
- Code splitting at route boundaries
- Lazy loading of components
- Image optimization and compression
- CSS tree-shaking with Tailwind
- Service worker caching strategy
- Client-side pagination for large lists

### Backend
- Database connection pooling
- Query indexing strategy
- Request logging and monitoring
- Async request handling with Tokio
- Response compression (gzip)

### Database
- Appropriate indexing for common queries
- Query result caching where appropriate
- TTL indexes for automatic cleanup
- Sharding strategy (if needed for scale)

## Deployment Architecture

### Docker Containerization
- Separate containers for frontend, backend, and database
- Docker Compose for local development and testing
- Multi-stage builds for optimized image sizes
- Health checks for service availability

### Environment Configurations
- Development: Local services, verbose logging
- Staging: Hosted services, monitored
- Production: Optimized, secured, scaled

### CI/CD Pipeline (Planned)
- Automated testing on push
- Automated linting and formatting checks
- Docker image building and registry push
- Deployment to hosting platform
- Rollback procedures

## Scalability Considerations

### Horizontal Scaling
- Stateless backend allows multiple instances
- Load balancer distribution of requests
- Database sharding for large datasets

### Database Scaling
- MongoDB Atlas for managed scaling
- Read replicas for load distribution
- Eventual consistency model

### Caching Layer (Future)
- Redis for session storage
- Cache frequently accessed data
- Reduce database queries

## Monitoring & Observability

### Logging
- Structured logging with tracing crate
- Different log levels for different environments
- Log aggregation (future enhancement)

### Metrics
- API response times
- Error rates and types
- Database query performance
- Application uptime

### Health Checks
- Backend `/api/health` endpoint
- Database connectivity verification
- Frontend application availability

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live notifications
2. **Caching Layer**: Redis for performance optimization
3. **Search**: Elasticsearch for advanced workout search
4. **Notifications**: Push notifications for scheduled workouts
5. **Social Features**: Sharing workouts with other users
6. **Analytics**: Advanced statistics and insights
7. **AI Integration**: Workout recommendations and form analysis
8. **Mobile App**: Native iOS/Android applications
