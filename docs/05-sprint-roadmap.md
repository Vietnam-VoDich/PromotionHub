# 🚀 Sprint Planning & Roadmap: PromotionHub

**Date:** 2026-01-29
**Project:** PromotionHub (Marketplace Publicité Outdoor)
**Timeline:** 9 weeks to MVP launch
**Team:** 3-4 engineers + 1 PM + 1 Ops

---

## 📊 Overall Timeline

```
CONCEPTION (Weeks 1-2) ✓ DONE
├─ Brainstorming
├─ Product Brief
├─ Technical Requirements
├─ Architecture Design
└─ Sprint Planning

DEVELOPMENT (Weeks 3-6)
├─ Backend Development
├─ Frontend Development
├─ Mobile Development
└─ Integrations (Payments, Maps)

TESTING (Weeks 7-8)
├─ Beta Launch (Private)
├─ User Testing
├─ Bug Fixes
└─ Performance Optimization

LAUNCH (Week 9)
├─ Marketing
├─ Public Launch
├─ Support
└─ Monitoring

POST-LAUNCH (Week 10+)
├─ Scaling
├─ Feature Improvements
└─ User Growth
```

---

## 🎯 Sprint 1: Backend Boilerplate & Database (Week 3)

**Duration:** 5 working days
**Goal:** Solid foundation - auth, DB, API structure
**Team:** 2 backend engineers
**Deliverables:** Docker setup, running API locally

### Sprint 1 Tasks

#### Task 1.1: Project Setup & Infrastructure
- [ ] GitHub repo created
- [ ] Branch strategy setup (main, develop, feature branches)
- [ ] GitHub Actions workflows (test, deploy)
- [ ] Docker & docker-compose for local dev
- [ ] Environment variables configured
- **Owner:** Lead Backend Engineer
- **Effort:** 1 day

#### Task 1.2: Database Schema & Migrations
- [ ] Prisma schema created (all tables from doc)
- [ ] Migrations setup
- [ ] Indexes added for performance
- [ ] Seed script for demo data
- **Owner:** Backend Engineer
- **Effort:** 1.5 days

#### Task 1.3: Authentication Service
- [ ] User registration endpoint (POST /api/auth/signup)
- [ ] Login endpoint (POST /api/auth/login)
- [ ] JWT token generation & validation
- [ ] Password hashing (bcrypt)
- [ ] Refresh token logic
- [ ] Unit tests for auth service
- **Owner:** Backend Engineer
- **Effort:** 1.5 days

#### Task 1.4: Error Handling & Validation
- [ ] Custom error classes (ValidationError, NotFoundError, etc.)
- [ ] Global error middleware
- [ ] Zod schemas for request validation
- [ ] Error response format standardized
- **Owner:** Backend Engineer
- **Effort:** 0.5 days

#### Task 1.5: API Documentation (Swagger)
- [ ] Swagger/OpenAPI setup
- [ ] Document auth endpoints
- [ ] Setup CI/CD for docs auto-generation
- **Owner:** Lead Backend Engineer
- **Effort:** 1 day

### Success Criteria for Sprint 1
- ✅ Local setup works: `docker-compose up && npm run dev`
- ✅ All auth endpoints tested
- ✅ Database schema migrated successfully
- ✅ API responds to requests
- ✅ Tests run and pass (70%+ coverage target for auth)

---

## 🎯 Sprint 2: Listings API & Search (Week 4)

**Duration:** 5 working days
**Goal:** Core marketplace feature - create, read, search listings
**Team:** 2 backend engineers
**Deliverables:** Listings API complete

### Sprint 2 Tasks

#### Task 2.1: Listings CRUD Endpoints
- [ ] POST /api/listings (create listing)
- [ ] GET /api/listings (list all with filters)
- [ ] GET /api/listings/:id (single listing)
- [ ] PUT /api/listings/:id (update listing)
- [ ] DELETE /api/listings/:id (delete listing)
- [ ] Authorization checks (owner can only edit own)
- **Owner:** Backend Engineer
- **Effort:** 1.5 days

#### Task 2.2: Search & Filtering
- [ ] Filter by quartier
- [ ] Filter by price range
- [ ] Filter by availability dates
- [ ] Filter by listing size
- [ ] Pagination (limit, offset)
- [ ] Sorting (price, date, rating)
- **Owner:** Backend Engineer
- **Effort:** 1 day

#### Task 2.3: Photo Management
- [ ] AWS S3 bucket setup & configuration
- [ ] Photo upload endpoint (POST /api/listings/:id/photos)
- [ ] Photo URL generation
- [ ] Delete photo endpoint
- [ ] Max 5MB, image format validation
- **Owner:** Backend Engineer
- **Effort:** 1 day

#### Task 2.4: Listings Tests
- [ ] Unit tests for listing service
- [ ] Integration tests for CRUD operations
- [ ] Search tests (filters, pagination)
- [ ] Photo upload tests
- **Owner:** Backend Engineer
- **Effort:** 1 day

### Success Criteria for Sprint 2
- ✅ Can create and list listings
- ✅ Search filters work correctly
- ✅ Photos upload to S3
- ✅ 75%+ test coverage for listings service
- ✅ API documentation updated

---

## 🎯 Sprint 3: Bookings & Payments (Week 5)

**Duration:** 5 working days
**Goal:** Transaction engine - bookings and payment processing
**Team:** 2 backend engineers
**Deliverables:** Full booking flow working

### Sprint 3 Tasks

#### Task 3.1: Bookings Endpoints
- [ ] POST /api/bookings (create booking)
- [ ] GET /api/bookings (user's bookings)
- [ ] GET /api/bookings/:id (booking details)
- [ ] PUT /api/bookings/:id (update status)
- [ ] Availability check (don't double-book)
- [ ] Date validation
- **Owner:** Backend Engineer
- **Effort:** 1.5 days

#### Task 3.2: Payments Integration
- [ ] Payment request creation endpoint
- [ ] Orange Money API integration
- [ ] MTN Mobile Money API integration
- [ ] Webhook handling for payment confirmations
- [ ] Payment status polling
- [ ] Error handling (timeout, failed payments)
- **Owner:** Backend Engineer
- **Effort:** 2 days

#### Task 3.3: Contract Management
- [ ] Contract template storage
- [ ] Contract generation (PDF with booking details)
- [ ] E-signature endpoint (placeholder for DocuSign later)
- [ ] Contract storage (S3)
- **Owner:** Backend Engineer
- **Effort:** 1 day

#### Task 3.4: Notifications Service
- [ ] Email notifications setup (SendGrid)
- [ ] SMS notifications setup (Twilio)
- [ ] Email templates (booking, payment, reminders)
- [ ] SMS templates
- [ ] Notification queue (background jobs)
- **Owner:** Backend Engineer
- **Effort:** 1 day

### Success Criteria for Sprint 3
- ✅ Can create bookings without double-booking
- ✅ Mobile Money payment flow works end-to-end
- ✅ Emails and SMS send correctly
- ✅ Webhook handling tested
- ✅ Payment tests passing (mocked API)

---

## 🎯 Sprint 4: Chat & Reviews (Week 5 cont. + 6)

**Duration:** 5 working days
**Goal:** Communication & trust system
**Team:** 1 backend engineer
**Deliverables:** Messaging and review systems

### Sprint 4 Tasks

#### Task 4.1: Messaging System
- [ ] POST /api/messages (send message)
- [ ] GET /api/messages/:conversationId (get chat history)
- [ ] PUT /api/messages/:id/read (mark as read)
- [ ] Real-time updates (WebSocket or polling)
- [ ] Message validation
- **Owner:** Backend Engineer
- **Effort:** 1.5 days

#### Task 4.2: Review & Rating System
- [ ] POST /api/reviews (create review)
- [ ] GET /api/listings/:id/reviews (get reviews)
- [ ] Rating calculation (average, count)
- [ ] Authorization (only bookers can review)
- [ ] Star rating system (1-5)
- **Owner:** Backend Engineer
- **Effort:** 1 day

#### Task 4.3: Photo Verification
- [ ] POST /api/verification/upload-photo (owner uploads proof)
- [ ] Photo validation (image format)
- [ ] Timestamp verification (blockchain ready but not required MVP)
- [ ] Notification to owner on verification request
- **Owner:** Backend Engineer
- **Effort:** 1 day

#### Task 4.4: Admin Moderation
- [ ] Admin endpoints for moderation
- [ ] Flag inappropriate content
- [ ] Suspend user accounts
- [ ] Analytics dashboard (admin)
- **Owner:** Backend Engineer
- **Effort:** 1 day

### Success Criteria for Sprint 4
- ✅ Users can message each other
- ✅ Can leave reviews and see ratings
- ✅ Photo verification working
- ✅ Admin can moderate platform

---

## 🎯 Sprint 5: Frontend Web App (Weeks 5-6)

**Duration:** 5 working days
**Goal:** React app with core features
**Team:** 1-2 frontend engineers
**Deliverables:** Beta-ready web app

### Sprint 5 Tasks

#### Task 5.1: Project Setup & Components
- [ ] React + TypeScript setup (Vite)
- [ ] Redux Toolkit store setup
- [ ] Tailwind CSS configured
- [ ] Shadcn/UI components installed
- [ ] Project folder structure
- [ ] Reusable component library (Button, Card, Modal, etc.)
- **Owner:** Frontend Lead
- **Effort:** 1 day

#### Task 5.2: Auth Pages
- [ ] Landing page / Login page
- [ ] Signup page (choose role: owner/advertiser)
- [ ] Profile setup page
- [ ] Protected routes (redirect to login)
- [ ] Persistent login (localStorage + refresh token)
- **Owner:** Frontend Engineer
- **Effort:** 1.5 days

#### Task 5.3: Listings Pages (Owner)
- [ ] My listings dashboard
- [ ] Create listing form (location picker, photo upload)
- [ ] Edit listing form
- [ ] View my bookings
- [ ] Earnings dashboard
- **Owner:** Frontend Engineer
- **Effort:** 2 days

#### Task 5.4: Search & Discovery (Advertiser)
- [ ] Search page with map integration (Mapbox)
- [ ] Filters sidebar (price, quartier, availability)
- [ ] Listings grid view
- [ ] Listing details page (photos, owner info, reviews)
- [ ] "Book Now" button → checkout flow
- **Owner:** Frontend Engineer
- **Effort:** 2 days

#### Task 5.5: Booking & Payment Pages
- [ ] Checkout page (confirm details + payment)
- [ ] Payment method selection
- [ ] Contract review + e-sign
- [ ] Confirmation page
- [ ] My campaigns page
- **Owner:** Frontend Engineer
- **Effort:** 1.5 days

### Success Criteria for Sprint 5
- ✅ Web app runs locally
- ✅ Can signup and login
- ✅ Can list a panneau
- ✅ Can search and filter
- ✅ Can book (with mock payment)
- ✅ Responsive design (desktop + tablet)

---

## 🎯 Sprint 6: Mobile App (Week 6)

**Duration:** 5 working days
**Goal:** React Native MVP with core features
**Team:** 1 mobile engineer
**Deliverables:** Testable iOS + Android apps

### Sprint 6 Tasks

#### Task 6.1: Mobile Project Setup
- [ ] React Native project initialization (Expo OR CLI)
- [ ] TypeScript configured
- [ ] Navigation setup (React Navigation)
- [ ] Redux Toolkit connected
- [ ] Testing environment (Jest + Detox)
- **Owner:** Mobile Engineer
- **Effort:** 1 day

#### Task 6.2: Mobile Auth & Profile
- [ ] Login screen
- [ ] Signup screen
- [ ] Profile screen
- [ ] Logout
- [ ] Token persistence
- **Owner:** Mobile Engineer
- **Effort:** 1 day

#### Task 6.3: Mobile Listings (Owner)
- [ ] My listings tab with cards
- [ ] Add listing (form with camera)
- [ ] Photo capture (React Native Camera)
- [ ] View bookings
- [ ] Earnings summary
- **Owner:** Mobile Engineer
- **Effort:** 1.5 days

#### Task 6.4: Mobile Search & Booking (Advertiser)
- [ ] Search tab with map
- [ ] Filter controls
- [ ] Listing details (swipeable photos)
- [ ] Book button → checkout
- [ ] My campaigns tab
- **Owner:** Mobile Engineer
- **Effort:** 1.5 days

#### Task 6.5: Mobile Photos & Camera
- [ ] Photo picker (gallery)
- [ ] Camera capture (for verification)
- [ ] Photo upload
- [ ] Upload progress indicator
- **Owner:** Mobile Engineer
- **Effort:** 1 day

### Success Criteria for Sprint 6
- ✅ iOS and Android apps build successfully
- ✅ Can login/signup on mobile
- ✅ Core features work (list, search, book)
- ✅ Camera integration works
- ✅ Tested on devices (iOS simulator, Android emulator)

---

## 🎯 Sprint 7: Integration & Polish (Week 7)

**Duration:** 5 working days
**Goal:** All systems integrated, ready for beta
**Team:** Full team
**Deliverables:** Beta-ready product

### Sprint 7 Tasks

#### Task 7.1: End-to-End Testing
- [ ] Full booking flow (signup → search → book → pay → verify)
- [ ] Payment webhook handling verified
- [ ] Email/SMS notifications tested
- [ ] Cross-platform testing (web + mobile)
- **Owner:** QA / Lead Engineer
- **Effort:** 2 days

#### Task 7.2: Performance Optimization
- [ ] Lighthouse score 80+ (web)
- [ ] Mobile app startup time < 3s
- [ ] API response times < 200ms
- [ ] Database query optimization
- [ ] Image optimization (resize, compression)
- **Owner:** Backend + Frontend Lead
- **Effort:** 1.5 days

#### Task 7.3: Security Audit
- [ ] HTTPS everywhere
- [ ] Secrets properly managed
- [ ] No sensitive data in logs
- [ ] SQL injection prevention verified
- [ ] CSRF tokens working
- **Owner:** Backend Lead
- **Effort:** 1 day

#### Task 7.4: Staging Deployment
- [ ] Deploy backend to AWS staging
- [ ] Deploy web app to Vercel staging
- [ ] Deploy mobile to TestFlight/Firebase
- [ ] Staging environment stable
- [ ] Monitoring & logging working
- **Owner:** DevOps / Lead Engineer
- **Effort:** 1 day

### Success Criteria for Sprint 7
- ✅ Product works end-to-end
- ✅ No critical bugs
- ✅ Performance targets met
- ✅ Security baseline passed
- ✅ Ready for beta users

---

## 🎯 Sprint 8: Beta Launch & Testing (Week 8)

**Duration:** 5 working days (+ ongoing support)
**Goal:** Real users, real feedback, iterations
**Team:** Full team + Operations
**Deliverables:** Validated MVP, lessons learned

### Sprint 8 Tasks

#### Task 8.1: Beta User Onboarding
- [ ] Select 50 owners + 30 advertisers (hand-picked)
- [ ] Personalized onboarding (1-on-1 calls)
- [ ] Collect initial feedback
- [ ] Track usage metrics
- **Owner:** Operations
- **Effort:** 2 days

#### Task 8.2: Bug Fixes & Hotfixes
- [ ] Triage reported bugs
- [ ] Prioritize by severity
- [ ] Deploy hotfixes quickly
- [ ] Track uptime/performance
- **Owner:** Engineering team
- **Effort:** 2 days

#### Task 8.3: User Research
- [ ] Interview beta users (10 owners, 10 advertisers)
- [ ] Collect NPS scores
- [ ] Identify pain points
- [ ] Document feature requests
- **Owner:** Product Manager
- **Effort:** 1-2 days

#### Task 8.4: Iteration & Polish
- [ ] Fix high-priority bugs
- [ ] Improve UX based on feedback
- [ ] Add missing features (if quick wins)
- [ ] Polish UI details
- **Owner:** Full team
- **Effort:** Ongoing

### Success Criteria for Sprint 8
- ✅ 80%+ NPS score
- ✅ Zero critical production bugs
- ✅ 95% uptime
- ✅ Users completing full booking flow
- ✅ Positive user testimonials

---

## 🎯 Sprint 9: Public Launch (Week 9)

**Duration:** 3-5 working days
**Goal:** Launch to public, grow user base
**Team:** Full team
**Deliverables:** Live product, marketing campaign

### Sprint 9 Tasks

#### Task 9.1: Marketing Campaign
- [ ] Press release written
- [ ] Social media posts prepared (Instagram, LinkedIn, Facebook)
- [ ] Influencer partnerships (5-10 local influencers)
- [ ] Email list (newsletter signup)
- [ ] Landing page optimized
- **Owner:** Carine / Marketing
- **Effort:** 2 days

#### Task 9.2: Production Deployment
- [ ] Backend deployed to production
- [ ] Web app deployed to production domain
- [ ] Mobile apps submitted to App Stores (TestFlight first)
- [ ] DNS configured
- [ ] SSL certificates valid
- [ ] Final smoke tests
- **Owner:** DevOps / Lead Engineer
- **Effort:** 1 day

#### Task 9.3: Support Setup
- [ ] Help/FAQ page ready
- [ ] Email support configured (support@promotionhub.ci)
- [ ] WhatsApp support number assigned
- [ ] Support ticket system (Zendesk or simple)
- [ ] Response SLA defined (< 2 hours)
- **Owner:** Operations
- **Effort:** 1 day

#### Task 9.4: Launch Coordination
- [ ] Coordinate launch timing (best day/time)
- [ ] Monitor system during launch
- [ ] Quick response to issues
- [ ] Celebrate with team 🎉
- **Owner:** Product Manager
- **Effort:** Ongoing

### Success Criteria for Sprint 9
- ✅ Website live and accessible
- ✅ Mobile apps in stores (or TestFlight)
- ✅ 100+ signups on launch day
- ✅ Zero critical issues in first 24h
- ✅ Positive press coverage

---

## 📈 Key Metrics to Track

### User Metrics
- Monthly Active Users (MAU)
- Weekly Active Users (WAU)
- Signup rate (users/day)
- Signup completion rate (% who finish onboarding)
- Churn rate (% who leave)

### Transaction Metrics
- Bookings per day
- Average booking value
- Booking completion rate (% who finish checkout)
- Payment success rate
- Revenue per day

### Product Metrics
- Feature usage (% using each feature)
- Time in app (session duration)
- Error rate (crashes, API errors)
- Performance (API response time, page load)
- NPS score (quarterly surveys)

### Business Metrics
- Daily Active Revenue (DAR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- LTV/CAC ratio (should be > 3:1)
- Gross Margin

---

## 🔄 Phase 2 Roadmap (Post-MVP)

### Months 7-12: Scale & AI

**Phase 2a: Expansion**
- Expand to Yamoussoukro, Bouaké, other Ivorian cities
- Hire local community managers
- Regional team collaboration

**Phase 2b: AI & Analytics**
- Implement AI matching algorithm
- Predictive analytics for demand
- Dynamic pricing based on demand
- Recommender system

**Phase 2c: Features**
- Real-time analytics dashboard
- Drone photography service
- Design marketplace (service layer)
- API for agencies (B2B)

**Phase 2d: Partnerships**
- Integration with ad networks
- Government registry partnership
- Bank partnerships (financing)
- Insurance partners

---

## 👥 Team Allocation

### Sprint 1-9 Core Team
- **1x Product Manager** - Aaron (direction, decisions)
- **2x Backend Engineers** - Full-time
- **1x Frontend Engineer** - Full-time
- **1x Mobile Engineer** - Full-time (Weeks 4-6)
- **1x Operations/Growth** - Part-time support

### Additional Support
- Design consultant (Aristide) - UX/UI review
- QA tester (freelance) - Testing support

---

## 📊 Burn-Down Tracking

Sprints will use:
- **JIRA/GitHub Projects** for task tracking
- **Daily standups** (15 mins, 10am) - What done, what blocked?
- **Sprint retrospectives** - What went well, what to improve?
- **Demo days** - Show finished work to stakeholders

---

## 🎯 Launch Success Criteria

### MVP Success (Week 9)
- ✅ 500+ users registered
- ✅ 50+ active listings
- ✅ 10+ completed bookings
- ✅ 1M+ XOF revenue
- ✅ 80%+ NPS

### First Quarter Success (Month 3)
- ✅ 2,000+ users
- ✅ 200+ listings
- ✅ 100+ bookings/month
- ✅ 5M+ XOF MRR
- ✅ Profitability path clear

---

## 📝 Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **Timeline slippage** | Buffer weeks for setbacks, aggressive project mgmt |
| **Team turnover** | Good culture, early equity discussions |
| **Technical debt** | Code reviews, refactor early, don't rush |
| **User adoption slow** | Field sales team (not just digital), incentives |
| **Payment API issues** | Test extensively, have backup (manual transfers) |
| **Security breach** | Regular audits, secure coding practices, monitoring |

---

## 🚀 Next Steps

- ✅ Sprint planning approved
- ⏭️ **Week 3:** Kick off Sprint 1 (backend setup)
- ⏭️ **Week 4:** Sprint 2 (listings API)
- ⏭️ **Week 5:** Sprints 3 + 5 (parallel - payments + web)
- ⏭️ **Week 6:** Sprint 6 (mobile app)
- ⏭️ **Week 7:** Sprint 7 (integration)
- ⏭️ **Week 8:** Sprint 8 (beta)
- ⏭️ **Week 9:** Sprint 9 (launch)

---

*Generated by BMAD Method - Scrum Master*
*Ready for Execution*
