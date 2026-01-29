# 🏗️ Architecture & Design Document: PromotionHub

**Date:** 2026-01-29
**Version:** 1.0 (MVP)
**Architect:** Engineering Team

---

## 🎯 Architectural Goals

1. **Scalability** - Start monolith, microservices-ready for future
2. **Reliability** - 99.9% uptime, graceful error handling
3. **Security** - Data protection, authentication, authorization
4. **Maintainability** - Clean code, good testing, documentation
5. **Performance** - Fast API responses, optimized queries
6. **Developer Experience** - Easy local setup, clear patterns

---

## 🔧 Technology Choices & Rationale

### Backend: Node.js + Express
**Why:**
- ✅ JavaScript/TypeScript across stack (reduce context switching)
- ✅ Excellent async/await support (I/O heavy: DB, APIs, payments)
- ✅ Large ecosystem (npm packages)
- ✅ Can prototype quickly

**Alternatives Considered:**
- Python + Django (slower for prototyping, less suitable for team skill)
- Go (steeper learning curve, overkill for MVP)
- Java + Spring (heavy, slow to develop)

---

### Frontend: React.js + TypeScript
**Why:**
- ✅ Team familiar with React
- ✅ Large component ecosystem
- ✅ Type safety with TypeScript
- ✅ Strong community support
- ✅ Great DevTools

**State Management: Redux Toolkit OR Zustand**
- Redux Toolkit: Predictable, good for team, scales well
- Zustand: Simpler, lighter weight
- Decision: Use Redux Toolkit (more team experience)

---

### Database: PostgreSQL
**Why:**
- ✅ Relational data fits well (users, listings, bookings)
- ✅ ACID transactions (payment safety)
- ✅ JSON support (flexibility)
- ✅ Excellent performance with proper indexing
- ✅ AWS RDS managed service

**Alternatives:**
- MongoDB (NoSQL, but relational data fits better)
- MySQL (similar to PostgreSQL, slightly less feature-rich)

---

### Mobile: React Native
**Why:**
- ✅ Code sharing between iOS/Android
- ✅ JavaScript (same as backend/frontend)
- ✅ Faster development than native

**Alternatives:**
- Flutter (Dart - new language, but excellent performance)
- Native iOS + Android (too much code duplication)

---

## 📊 Data Model & Entity Relationships

```
users (1) ──→ (many) listings
           ──→ (many) bookings

listings (1) ──→ (many) bookings
           ──→ (many) reviews
           ──→ (many) verification_photos

bookings (1) ──→ (many) payments
           ──→ (many) messages
           ──→ (many) verification_photos

messages (many-to-many) between users
```

### Key Entities

**users**
- Columns: id, email, password_hash, role (owner/advertiser/admin), name, phone, city, avatar_url, created_at, updated_at
- Constraints: email UNIQUE, password NOT NULL
- Indexes: email, role

**listings**
- Columns: id, owner_id (FK), title, description, latitude, longitude, address, quartier, size, price_per_month, status, created_at
- Constraints: owner_id FK to users, latitude/longitude NOT NULL
- Indexes: owner_id, status, quartier, created_at

**bookings**
- Columns: id, listing_id (FK), advertiser_id (FK), start_date, end_date, total_price, status, contract_signed_at, created_at
- Constraints: listing_id FK, advertiser_id FK, dates valid
- Indexes: listing_id, advertiser_id, status, created_at

**payments**
- Columns: id, booking_id (FK), amount, currency, payment_method, status, transaction_id, created_at
- Constraints: booking_id FK, amount > 0, status NOT NULL
- Indexes: booking_id, status, created_at

**verification_photos**
- Columns: id, booking_id (FK), photo_url (S3), uploaded_by (FK), status, timestamp, created_at
- Constraints: booking_id FK, photo_url NOT NULL
- Indexes: booking_id, status

**messages**
- Columns: id, sender_id (FK), receiver_id (FK), booking_id (FK), message, is_read, created_at
- Constraints: sender_id FK, receiver_id FK, message NOT NULL
- Indexes: receiver_id, is_read, created_at

**reviews**
- Columns: id, listing_id (FK), reviewer_id (FK), rating (1-5), comment, created_at
- Constraints: listing_id FK, reviewer_id FK, rating IN (1,2,3,4,5)
- Indexes: listing_id, reviewer_id

---

## 🔀 API Layer Architecture

### API Gateway Pattern
Single entry point at `/api/*` routes all requests through:

```
Request → Express Router
    ↓
Route Handler (validate path + method)
    ↓
Middleware Pipeline:
  1. Authentication (verify JWT)
  2. Authorization (check user role/permissions)
  3. Request validation (Zod schema)
  4. Rate limiting
    ↓
Controller (call business logic)
    ↓
Service Layer (DB queries, external APIs)
    ↓
Response → JSON + status code
```

### Request/Response Cycle

```typescript
// Example: POST /api/bookings
interface BookingRequest {
  listing_id: UUID;
  start_date: Date;
  end_date: Date;
  payment_method: 'orange_money' | 'mtn_money' | 'card';
}

interface BookingResponse {
  id: UUID;
  listing_id: UUID;
  advertiser_id: UUID;
  status: 'pending' | 'confirmed';
  contract_url: string;
  created_at: Date;
}

// Error Response
interface ErrorResponse {
  error: string;
  message: string;
  status_code: number;
  timestamp: Date;
}
```

### Authentication Flow

```
1. User SignUp
   POST /api/auth/signup
   → Create user, hash password, send verification email

2. User Login
   POST /api/auth/login
   → Verify password, generate JWT tokens
   → Return accessToken (15 min) + refreshToken (7 days)

3. API Requests
   GET /api/listings
   Header: Authorization: Bearer <accessToken>
   → Middleware verifies JWT signature and expiry

4. Token Refresh (when accessToken expires)
   POST /api/auth/refresh-token
   Body: { refreshToken }
   → Return new accessToken
```

### Authorization (Role-Based Access Control)

```
Roles:
- "owner" → Can list panels, manage bookings, upload photos
- "advertiser" → Can search, book, manage campaigns
- "admin" → Full access, content moderation

Example: Edit Listing
POST /api/listings/:id
→ Check JWT user_id == listing.owner_id OR role == 'admin'
→ If not authorized → 403 Forbidden
```

---

## 🔌 Service Layer Architecture

### Separation of Concerns

```
routes/ (HTTP layer)
  ├─ auth.routes.ts
  ├─ listings.routes.ts
  ├─ bookings.routes.ts
  └─ ...

controllers/ (Request handling)
  ├─ authController.ts (calls authService)
  ├─ listingsController.ts (calls listingsService)
  └─ ...

services/ (Business logic)
  ├─ authService.ts (password hashing, token generation)
  ├─ listingsService.ts (CRUD operations, search)
  ├─ bookingsService.ts (booking logic, payment coordination)
  ├─ paymentsService.ts (payment processing, webhooks)
  └─ notificationsService.ts (email, SMS)

repositories/ (Data access - Prisma ORM)
  ├─ userRepo.ts
  ├─ listingRepo.ts
  └─ ...

utils/ (Helpers)
  ├─ validators.ts (Zod schemas)
  ├─ errorHandling.ts (custom errors)
  ├─ logger.ts (logging)
  └─ ...
```

### Example Service: BookingsService

```typescript
// src/services/bookingsService.ts

class BookingsService {
  async createBooking(
    listing_id: UUID,
    advertiser_id: UUID,
    start_date: Date,
    end_date: Date,
    payment_method: string
  ): Promise<Booking> {
    // 1. Validate dates (not in past, dates logical)
    // 2. Check listing exists and is available
    // 3. Calculate total price
    // 4. Create booking with status='pending'
    // 5. Initiate payment (call paymentsService)
    // 6. If payment successful → status='confirmed'
    // 7. Generate contract (call contractService)
    // 8. Send notifications (call notificationsService)
    // 9. Return booking
  }

  async confirmBooking(booking_id: UUID): Promise<void> {
    // Called when payment confirmed
    // 1. Update booking status to 'confirmed'
    // 2. Send email to owner
    // 3. Send SMS to advertiser
  }

  async uploadVerificationPhoto(
    booking_id: UUID,
    photo_url: string
  ): Promise<void> {
    // 1. Validate photo (image format, size < 5MB)
    // 2. Upload to S3
    // 3. Create verification record
    // 4. Send notification to owner
  }
}
```

---

## 🔒 Security Architecture

### Defense in Depth

```
Layer 1: Network Level
  → HTTPS/TLS 1.3 enforced
  → DDoS protection (AWS Shield)
  → Web Application Firewall (AWS WAF)

Layer 2: Authentication
  → JWT tokens with expiry
  → Password hashing (bcrypt)
  → Email verification

Layer 3: Authorization
  → Role-Based Access Control (RBAC)
  → Resource-level permissions (user can only see own data)

Layer 4: Input Validation
  → Zod schema validation
  → SQL injection prevention (Prisma ORM)
  → XSS prevention (React escapes)
  → CSRF tokens

Layer 5: Data Protection
  → Database encryption (AWS RDS)
  → Encrypted sensitive fields (PII)
  → No passwords/tokens in logs
  → Regular backups with encryption

Layer 6: API Security
  → Rate limiting (prevent brute force)
  → CORS properly configured
  → Security headers (CSP, X-Frame-Options, etc.)
  → Error messages don't leak info
```

### Secrets Management
```
Production secrets (API keys, passwords):
  → Stored in AWS Secrets Manager (not in code)
  → Accessed by application at startup
  → Rotated regularly
  → Never logged
```

---

## 📈 Scalability Architecture

### Horizontal Scaling (Add more servers)

**Current:** Single server handles web + API
**Future:** Separate layers

```
Load Balancer (AWS ALB)
  ├─ API Server 1 (stateless)
  ├─ API Server 2 (stateless)
  └─ API Server 3 (stateless)
        ↓
Database (PostgreSQL RDS)
  → Read replicas for analytics queries
        ↓
Cache Layer (Redis)
  → Cache listings, user data
        ↓
Storage (S3)
  → Photo/contract storage
```

### Database Optimization
```
Indexes on frequently queried columns:
  ✓ listings.quartier (search filter)
  ✓ bookings.status (status queries)
  ✓ messages.receiver_id (inbox queries)
  ✓ listings.created_at (date filters)

Connection Pooling:
  ✓ PgBouncer or Prisma's built-in pooling
  ✓ Max 20 connections per app instance

Query Optimization:
  ✓ Avoid N+1 queries (use includes in Prisma)
  ✓ Pagination (limit 50 results max)
```

### Caching Strategy (Phase 2)
```
Cache Layer (Redis):
  ✓ Listings by quartier (TTL: 1 hour)
  ✓ Top-rated listings (TTL: 1 day)
  ✓ User profile data (TTL: 1 hour)
  ✓ Session data (TTL: 7 days)

Invalidation:
  ✓ When owner updates listing → clear cache
  ✓ When new booking → clear availability
```

---

## 🔄 Deployment Architecture

### Local Development
```
docker-compose.yml:
  ├─ PostgreSQL (port 5432)
  ├─ Redis (port 6379)
  ├─ Backend API (port 3000)
  └─ Frontend dev server (port 5173)

Setup: docker-compose up
```

### Staging Environment
```
AWS EC2 (t3.medium)
  ├─ Docker container (backend)
  ├─ PM2 for process management
  ├─ Nginx reverse proxy

RDS PostgreSQL (staging)
  ├─ Multi-AZ for redundancy
  ├─ Automated backups

Deploy: Push to staging branch → GitHub Actions → Auto deploy
```

### Production Environment
```
AWS Elastic Container Service (ECS):
  ├─ Fargate (serverless containers)
  ├─ Auto-scaling (scale 1-10 containers based on CPU)
  ├─ Task definition (Docker image, CPU, memory, env vars)

RDS PostgreSQL (production):
  ├─ Multi-AZ (HA)
  ├─ Read replicas
  ├─ Automated backups (daily)
  ├─ Point-in-time recovery (35 days)

CloudFront (CDN):
  ├─ Cache static assets (CSS, JS, images)
  ├─ Distribute globally (fast delivery)

Route53 (DNS):
  ├─ Domain routing
  ├─ Health checks

CloudWatch:
  ├─ Monitoring
  ├─ Alarms (CPU, memory, error rates)
  ├─ Logs aggregation
```

---

## 🧠 Design Patterns Used

### 1. Service Layer Pattern
Separates HTTP handling from business logic
```
Router → Controller → Service → Repository → Database
```

### 2. Repository Pattern
Abstract data access logic
```
Service calls repo.findById() instead of Prisma directly
Easier to mock in tests
```

### 3. Middleware Pattern
Reusable request processing
```
Authentication middleware
Authorization middleware
Validation middleware
Error handling middleware
```

### 4. Dependency Injection
Services don't create their own dependencies
```
Easier to test (inject mocks)
Reduces coupling
```

### 5. Observer Pattern (Event-driven)
Services emit events, other services listen
```
When booking created → emit 'BookingCreated' event
NotificationService listens → sends email
AnalyticsService listens → records event
```

---

## 🧪 Testing Architecture

### Test Pyramid
```
        /\
       /  \
      /    \  E2E Tests (10%)
     /      \
    /________|  Integration Tests (30%)
   /         \
  /           \ Unit Tests (60%)
 /             \
/_______________|
```

### Test Layers

**Unit Tests (60%)**
- Individual functions/methods
- Mock dependencies
- Example: `authService.hashPassword()` generates valid hash

**Integration Tests (30%)**
- Multiple components together
- Use test database
- Example: POST /api/bookings → booking created in DB + payment initiated

**E2E Tests (10%)**
- Full user journeys
- Real browser (Playwright/Detox)
- Example: Owner lists panel → Advertiser searches → Books → Pays

### Coverage Targets
- Services: 80%+
- Controllers: 70%+
- Utilities: 90%+
- Overall: 75%+

---

## 📡 External Integrations

### Synchronous (Request-Response)
```
App → Mobile Money API
     → Response (success/failure)

App → Stripe API
     → Response (payment confirmation)

App → Google Maps API
     → Response (geocoding, place details)
```

### Asynchronous (Webhooks)
```
Mobile Money API → Webhook endpoint
                 → App updates payment status

SendGrid → Webhook endpoint
        → App logs email delivery status
```

### Circuit Breaker Pattern (Resilience)
```
If payment API is down:
  → Close circuit (stop calling)
  → Return cached response OR
  → Return "payment pending, will retry later"
  → After 30 secs, try again
```

---

## 📊 Monitoring & Observability

### Metrics
- API response time (avg, p95, p99)
- Error rate
- Database query performance
- Payment success rate
- User signup rate

### Alerting
```
If error rate > 5% → Page on-call engineer
If API response > 500ms → Alert to Slack
If database CPU > 80% → Scale RDS
```

### Logging
```
FORMAT: JSON with fields
  - timestamp
  - level (info, warn, error)
  - service (auth, bookings, etc.)
  - user_id (if applicable)
  - message
  - stack_trace (if error)

TOOLS: CloudWatch (AWS) or ELK stack
RETENTION: 30 days (production)
```

---

## 🎯 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API p95 latency | < 200ms | TBD | Design target |
| Page load (FCP) | < 2s | TBD | Design target |
| Database query p95 | < 100ms | TBD | Design target |
| Mobile Lighthouse | 90+ | TBD | Design target |
| Uptime | 99.9% | TBD | SLA target |

---

## 🔄 System Flows

### Booking Flow
```
1. Advertiser searches listings
   GET /api/listings?quartier=Plateau&budget=1000000
   → Returns matching listings

2. Advertiser views listing details
   GET /api/listings/abc123
   → Returns photos, owner rating, availability

3. Advertiser clicks "Book Now"
   POST /api/bookings { listing_id, start_date, end_date, payment_method }
   → Creates booking (status=pending)
   → Initiates payment

4. Payment processing (async)
   → User confirms on phone (Mobile Money)
   → Payment gateway sends webhook
   → App updates booking status to 'confirmed'

5. Contract signing
   POST /api/bookings/def456/sign-contract { signature }
   → E-signature saved
   → Contract PDF generated

6. Notifications
   → Owner email: "New booking for Panel ABC"
   → Advertiser email: "Booking confirmed!"
   → SMS confirmations to both

7. Photo verification (before end date)
   POST /api/verification/upload-photo { photo_url }
   → Owner uploads proof photo
   → Analytics updated (panel occupancy rate)
```

### Payment Flow
```
1. Create payment request
   POST /api/payments { booking_id, amount, method='orange_money', phone }

2. Call Mobile Money API
   → Send USSD prompt to customer phone
   → Return transaction ID

3. Poll for payment status (interval: every 5 secs, max 60 secs)
   GET /api/payments/{txn_id}/status

4. Payment confirmed
   → Update booking status
   → Send confirmations
   → Trigger notifications

5. If timeout
   → Mark as "pending confirmation"
   → Owner can manually confirm receipt
```

---

## 📝 Configuration Management

### Environment Variables
```
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/promotionhub

# JWT
JWT_SECRET=... (from Secrets Manager)
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Mobile Money
ORANGE_MONEY_API_KEY=...
MTN_MONEY_API_KEY=...

# AWS
AWS_REGION=eu-west-1
AWS_S3_BUCKET=promotionhub-photos

# Email
SENDGRID_API_KEY=...
SMTP_FROM=notifications@promotionhub.ci

# Maps
MAPBOX_TOKEN=...

# Analytics
MIXPANEL_TOKEN=...
```

---

## 🎯 Next Steps

1. ✓ Architecture designed
2. ⏭️ Create API specification (Swagger/OpenAPI)
3. ⏭️ Create database migrations
4. ⏭️ Setup development environment (Docker, Node setup)
5. ⏭️ Start development (Week 3)

---

*Generated by BMAD Method - System Architect*
*Approved for Development*
