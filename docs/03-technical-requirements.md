# 🏗️ Technical Requirements Document: PromotionHub

**Date:** 2026-01-29
**Version:** 1.0 (MVP)
**Status:** Ready for Development
**Tech Lead:** Engineering Team

---

## 🎯 Technical Overview

**PromotionHub** is a **SaaS marketplace** with 3 main components:

1. **Web Platform** (React.js + TypeScript) - Propriétaires & Annonceurs
2. **Mobile App** (React Native) - Propriétaires & Annonceurs
3. **Backend API** (Node.js + Express + TypeScript) - Core business logic
4. **Admin Dashboard** (React.js) - Content moderation, analytics

**Architecture:** Microservices-ready monolith (scale later)
**Database:** PostgreSQL
**Hosting:** AWS (EC2 + RDS + S3)
**DevOps:** Docker, GitHub CI/CD

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────┐
│         CLIENT LAYER (Web + Mobile)             │
├──────────────┬──────────────┬──────────────────┤
│  Web App     │  Mobile App  │  Admin Dashboard │
│  (React.js)  │  (RN)        │  (React.js)      │
└──────────────┴──────┬───────┴──────────────────┘
                      │ HTTPS
┌─────────────────────┴────────────────────────┐
│       API GATEWAY (Node.js Express)          │
├──────────────────────────────────────────────┤
│  Auth Service  │ Listings API  │ Booking API │
│  Users API     │ Payments API  │ Chat API    │
│  Admin API     │ Analytics API │             │
└──────────────────────────────────────────────┘
                      │
┌─────────────────────┴────────────────────────┐
│      DATABASE LAYER (PostgreSQL)            │
├──────────────────────────────────────────────┤
│  Users Table    │ Listings Table             │
│  Bookings Table │ Contracts Table            │
│  Payments Table │ Reviews Table              │
│  Chat Table     │ Verification Photos Table  │
└──────────────────────────────────────────────┘
                      │
┌─────────────────────┴────────────────────────┐
│    EXTERNAL INTEGRATIONS                    │
├──────────────────────────────────────────────┤
│  Mobile Money API  │ Stripe API               │
│  SendGrid (Email)  │ Twilio (SMS)            │
│  AWS S3 (Photos)   │ Maps API (Google/Mapbox)│
└──────────────────────────────────────────────┘
```

---

## 📱 Frontend: Web App (React.js)

### Technology Stack
- **Framework:** React 18 + TypeScript
- **State Management:** Redux Toolkit (or Zustand for simpler)
- **Styling:** Tailwind CSS + Shadcn/UI components
- **Maps:** Mapbox GL JS or Leaflet.js
- **Forms:** React Hook Form + Zod validation
- **API Client:** Axios + React Query (data fetching)
- **Build:** Vite (fast builds)
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel or AWS Amplify

### Key Pages/Screens

#### For Propriétaires (Owners)
- `/dashboard` - Overview (panneaux, revenus, bookings)
- `/listings` - Manage my listings
- `/listings/new` - Add new listing (form)
- `/listings/:id/edit` - Edit listing
- `/bookings` - View bookings for my panneaux
- `/bookings/:id` - Booking details, upload proof photo
- `/earnings` - Revenue tracking, invoices
- `/profile` - Account settings
- `/messages` - Chat with annonceurs
- `/contracts/:id` - View/sign contract

#### For Annonceurs (Advertisers)
- `/search` - Search panneaux (filters, map)
- `/listings/:id` - Listing details (photos, reviews, map)
- `/checkout` - Booking + payment flow
- `/campaigns` - My campaigns (bookings)
- `/campaigns/:id` - Campaign details, timeline
- `/profile` - Account settings
- `/messages` - Chat with propriétaires
- `/reviews` - Leave review for panneau/propriétaire

#### Shared
- `/login` - Authentication
- `/signup` - Registration (choose role: owner/advertiser)
- `/` - Landing page

### Data Flow Example: Booking

```
Annonceur clicks "Book Now"
    ↓
Checkout page (confirmation)
    ↓
Payment processing (Mobile Money API call)
    ↓
E-signature contract (via DocuSign or similar)
    ↓
Confirmation email + SMS
    ↓
Propriétaire gets notification
    ↓
Propriétaire accepts/confirms
    ↓
Booking confirmed in system
```

---

## 📱 Mobile App (React Native)

### Technology Stack
- **Framework:** React Native + TypeScript
- **Navigation:** React Navigation (stack, tab, drawer)
- **State Management:** Redux Toolkit
- **API Client:** Axios + TanStack Query
- **UI Components:** React Native Paper or NativeBase
- **Maps:** React Native Maps
- **Camera:** React Native Camera (photo verification)
- **Build:** Expo (easier) OR React Native CLI (more control)
- **Testing:** Jest + Detox (E2E)
- **Deployment:** App Store + Google Play

### Key Screens (iOS + Android)

#### Common
- Splash screen
- Login / Signup
- Home (tab-based)
- Map view (panneaux)

#### Owner App
- Tab 1: My Listings (cards)
- Tab 2: Bookings (incoming)
- Tab 3: Earnings (simple graph)
- Tab 4: Messages
- Tab 5: Profile

#### Advertiser App
- Tab 1: Search/Map (filter by quartier, budget)
- Tab 2: My Campaigns
- Tab 3: Messages
- Tab 4: Profile

#### Special: Photo Camera
- Camera screen to take proof photos (owner)
- Camera screen to verify panneau (advertiser)
- Upload to S3 with metadata (location, timestamp)

---

## 🔧 Backend API (Node.js + Express)

### Technology Stack
- **Runtime:** Node.js 20+
- **Framework:** Express.js + TypeScript
- **Database ORM:** Prisma (type-safe DB access)
- **Authentication:** JWT tokens + refresh tokens
- **Password:** bcrypt for hashing
- **Validation:** Zod (schema validation)
- **API Documentation:** Swagger/OpenAPI
- **Logging:** Winston or Pino
- **Error Handling:** Custom error middleware
- **Rate Limiting:** express-rate-limit
- **CORS:** CORS middleware (configure properly)
- **Testing:** Jest + Supertest (unit + integration tests)
- **Deployment:** Docker + AWS ECS

### Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'advertiser', 'admin'),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  city VARCHAR(100),
  avatar_url VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Listings (Panneaux)
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  owner_id UUID FOREIGN KEY,
  title VARCHAR(255),
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  address VARCHAR(255),
  quartier VARCHAR(100),
  size ENUM('small', 'medium', 'large'),
  price_per_month FLOAT,
  availability_start DATE,
  availability_end DATE,
  status ENUM('active', 'inactive', 'booked'),
  photo_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  listing_id UUID FOREIGN KEY,
  advertiser_id UUID FOREIGN KEY,
  start_date DATE,
  end_date DATE,
  total_price FLOAT,
  status ENUM('pending', 'confirmed', 'rejected', 'completed'),
  contract_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID FOREIGN KEY,
  amount FLOAT,
  currency VARCHAR(5),
  payment_method ENUM('orange_money', 'mtn_money', 'card'),
  status ENUM('pending', 'success', 'failed'),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP
);

-- Photo Verification
CREATE TABLE verification_photos (
  id UUID PRIMARY KEY,
  booking_id UUID FOREIGN KEY,
  photo_url VARCHAR(255),
  uploaded_by UUID FOREIGN KEY,
  status ENUM('pending', 'approved', 'rejected'),
  timestamp TIMESTAMP,
  created_at TIMESTAMP
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID FOREIGN KEY,
  receiver_id UUID FOREIGN KEY,
  booking_id UUID FOREIGN KEY,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  listing_id UUID FOREIGN KEY,
  reviewer_id UUID FOREIGN KEY,
  rating INT (1-5),
  comment TEXT,
  created_at TIMESTAMP
);
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh JWT
- `POST /api/auth/logout` - Logout

#### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `DELETE /api/users/:id` - Delete account

#### Listings
- `GET /api/listings` - List all (with filters)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing (owner only)
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/:id/photos` - Upload photos

#### Bookings
- `GET /api/bookings` - My bookings
- `GET /api/bookings/:id` - Booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status
- `POST /api/bookings/:id/sign-contract` - E-sign

#### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Payment status
- `GET /api/payments/booking/:id` - Payments for booking

#### Messages
- `GET /api/messages/:conversationId` - Chat history
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

#### Verification
- `POST /api/verification/upload-photo` - Upload proof photo
- `GET /api/verification/:bookingId` - Get verification status

#### Admin
- `GET /api/admin/analytics` - Platform stats
- `GET /api/admin/users` - User list (moderation)
- `POST /api/admin/moderate/:id` - Flag/remove content

---

## 🔐 Security Requirements

### Authentication
- ✅ JWT tokens (access + refresh)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Email verification before booking
- ✅ Rate limiting on login (prevent brute force)
- ✅ Session timeout after 30 mins of inactivity

### Data Protection
- ✅ HTTPS only (TLS 1.3)
- ✅ Database encryption at rest (AWS RDS encryption)
- ✅ Personal data encrypted (PII fields)
- ✅ S3 bucket private (only authenticated users can access)
- ✅ Regular backups (daily, 7-day retention)

### OWASP Top 10 Mitigations
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escapes by default)
- ✅ CSRF protection (CSRF tokens)
- ✅ Rate limiting
- ✅ No sensitive data in logs
- ✅ Regular dependency updates
- ✅ Code review process

---

## 💾 Database Design

### Key Constraints
- Foreign keys enforced
- Unique constraints on email
- Indexes on frequently queried columns (listing.quartier, booking.status)
- Soft deletes for audit trail (add deleted_at column)

### Scaling Considerations
- Sharding by city (future)
- Read replicas for analytics (future)
- Caching layer (Redis) for listings (future)

---

## 💳 Payment Integration

### Mobile Money (Ivory Coast)

**Orange Money:**
- API endpoint: `https://api-cash.orange.ci`
- Authentication: API key + secret
- Flow: Merchant initiates → Customer confirms on phone → Success
- Fee: ~2% per transaction

**MTN Mobile Money:**
- API endpoint: `https://api.mtnmobilemoneyafrica.com`
- Authentication: API credentials
- Flow: Similar to Orange
- Fee: ~2% per transaction

### Backup: Direct Bank Transfer (Manual)
- For first few transactions
- Propriétaire provides account details
- Manual verification by admin
- Mark booking as "pending payment confirmation"

### Stripe (Future International)
- For card payments (future)
- Webhook handling for confirmations

### Implementation
```typescript
// Example: Process Mobile Money Payment
async function processOrangeMoneyPayment(
  booking: Booking,
  phoneNumber: string,
  amount: number
) {
  // 1. Call Orange Money API
  // 2. Wait for customer USSD confirmation
  // 3. Poll for payment status
  // 4. Update booking status
  // 5. Send confirmation email
}
```

---

## 📧 Email & SMS Integrations

### Email (SendGrid / Brevo)
- Booking confirmations
- Contract signing requests
- Payment receipts
- Reminder emails (7 days before end date)
- Marketing newsletters

### SMS (Twilio / Airtels Gateway)
- OTP for login
- Booking confirmations
- Payment confirmations
- Reminder SMS

### Templates
- Stored in database or SendGrid (API)
- Dynamic variables (name, dates, amount)
- A/B testing possible

---

## 🗺️ Maps Integration

### Mapbox GL JS (Preferred)
- Interactive map with panneaux pins
- Clustering at zoom levels
- Custom styling
- Free tier: 50k map loads/month
- Pricing: $4 per 100k loads after free tier

### Alternative: Google Maps
- Similar features
- More expensive
- Better search integration

### Features
- Zoom to quartier
- Filter by type/price
- Click pin → listing details
- Draw search radius (future)

---

## 📊 Analytics & Monitoring

### Product Analytics (Mixpanel / Amplitude)
- User signup funnel
- Booking conversion rate
- Feature usage
- Retention cohorts

### Performance Monitoring (Datadog / New Relic)
- API response times
- Database query performance
- Error rates
- Infrastructure metrics

### Logging (CloudWatch / ELK)
- Structured logging (JSON)
- Log levels: info, warn, error, debug
- Retention: 30 days

---

## 🧪 Testing Strategy

### Unit Tests
- API endpoints (Jest + Supertest)
- Utility functions
- Database queries (with test DB)
- Target: 70%+ coverage

### Integration Tests
- Full booking flow
- Payment processing
- E-signature flow
- Chat functionality

### E2E Tests
- Mobile app: Detox
- Web app: Playwright
- Key user journeys:
  - Owner lists panneau → Advertiser books → Payment → Completion

### Manual Testing
- Browser compatibility (Chrome, Safari, Firefox)
- Mobile responsiveness (iOS + Android)
- Accessibility (WCAG AA)

---

## 🚀 Deployment & Infrastructure

### Development Environment
- Local setup: `npm install && npm run dev`
- Docker compose for local DB, Redis, etc.
- Environment variables in `.env`

### Staging Environment
- AWS EC2 instance (t3.medium)
- Separate RDS database
- Staging domain: `staging.promotionhub.ci`
- Auto-deploy on `develop` branch push

### Production Environment
- AWS Elastic Beanstalk OR ECS (container)
- Auto-scaling (scale down at night)
- CDN (CloudFront) for static assets
- RDS multi-AZ (high availability)
- Domain: `promotionhub.ci`
- SSL certificate (ACM)
- Automated backups (daily)

### CI/CD Pipeline (GitHub Actions)
```yaml
Push code to GitHub
  ↓
Run tests (unit + integration)
  ↓
Build Docker image
  ↓
Push to ECR (AWS)
  ↓
Deploy to staging
  ↓
Run E2E tests on staging
  ↓
Manual approval
  ↓
Deploy to production
  ↓
Health checks
```

---

## 📦 Folder Structure

```
promotionhub/
├── backend/
│   ├── src/
│   │   ├── routes/       (API endpoints)
│   │   ├── controllers/  (business logic)
│   │   ├── services/     (shared logic)
│   │   ├── models/       (Prisma models)
│   │   ├── middleware/   (auth, validation, etc.)
│   │   ├── utils/        (helpers)
│   │   └── index.ts
│   ├── tests/
│   ├── prisma/           (schema.prisma, migrations)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend-web/
│   ├── src/
│   │   ├── pages/        (React pages)
│   │   ├── components/   (reusable components)
│   │   ├── hooks/        (custom hooks)
│   │   ├── store/        (Redux)
│   │   ├── styles/       (Tailwind)
│   │   ├── api/          (API client)
│   │   ├── types/        (TypeScript types)
│   │   └── App.tsx
│   ├── public/
│   ├── tests/
│   ├── vite.config.ts
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── store/
│   │   ├── api/
│   │   └── App.tsx
│   ├── app.json
│   └── package.json
│
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
└── .github/
    └── workflows/
        ├── test.yml
        └── deploy.yml
```

---

## 🔄 Development Workflow

### Branching Strategy (Git Flow)
```
main (production-ready)
  ↑
  ├─ release/v1.0.0 (release candidate)
  ├─ develop (integration branch)
  │   ├─ feature/listing-photos
  │   ├─ feature/payment-integration
  │   ├─ bugfix/booking-validation
  │   └─ ...
  └─ hotfix/security-patch (emergency fixes)
```

### Code Quality
- Linting: ESLint + Prettier
- Pre-commit hooks (husky) to run linting
- Code review required before merge
- Protected main/develop branches

### Release Process
1. Create release branch from develop
2. Final testing and bug fixes
3. Merge to main + tag version
4. Deploy to production
5. Merge back to develop

---

## 📈 Performance Targets

- **API Response Time:** < 200ms (p95)
- **Page Load:** < 2s (First Contentful Paint)
- **Mobile Lighthouse:** 90+ score
- **Database Query:** < 100ms (p95)
- **Uptime:** 99.9% SLA target

---

## 🎯 Next Steps

1. ✓ Technical Requirements approved
2. ⏭️ Detailed API specification (Swagger/OpenAPI)
3. ⏭️ Database migration scripts
4. ⏭️ Frontend component library setup
5. ⏭️ Backend setup (Express boilerplate)
6. ⏭️ Environment configuration
7. ⏭️ Start Sprint 1 (Week 3)

---

*Generated by BMAD Method - Technical Specification*
*Ready for Development*
