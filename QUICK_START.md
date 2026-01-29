# 🚀 PromotionHub - Quick Start Guide for Team

**Last Updated:** 2026-01-29
**For:** Development Team Starting Week 3

---

## 📌 30-Second Elevator Pitch

**PromotionHub** is an Uber-for-billboards marketplace. Owners list their panels, advertisers search and book, we take 10% commission. Digital contracts, mobile payments, photo proof. Launching in 9 weeks.

---

## 📁 What You Need to Know (Start Here)

### 1️⃣ **Quick Overview** (5 mins)
Read: `PROJECT_SUMMARY.md`
- What we're building
- Why it matters
- Success metrics
- Timeline

### 2️⃣ **Product Vision** (10 mins)
Read: `docs/02-product-brief.md`
- Problem statement
- Target users (owners + advertisers)
- Core features
- Success criteria

### 3️⃣ **Technology Stack** (10 mins)
Read: `docs/03-technical-requirements.md` (TechStack section)
- Backend: Node.js + Express + TypeScript
- Frontend: React.js
- Mobile: React Native
- Database: PostgreSQL
- Hosting: AWS

### 4️⃣ **Architecture** (10 mins)
Read: `docs/04-architecture-design.md` (System Architecture)
- How components talk to each other
- Database schema
- Security approach
- Scaling strategy

### 5️⃣ **Sprint Plan** (15 mins)
Read: `docs/05-sprint-roadmap.md`
- Your sprint (1-9 depending on role)
- Detailed tasks
- Success criteria
- Timeline

---

## 🎯 Your Role-Specific Checklist

### 🔧 Backend Engineers

**By End of Week 2:**
- [ ] Read PROJECT_SUMMARY.md
- [ ] Read docs/02-product-brief.md (full)
- [ ] Read docs/03-technical-requirements.md (TechStack, API Endpoints, Database)
- [ ] Read docs/04-architecture-design.md (full)
- [ ] Read docs/05-sprint-roadmap.md (Sprint 1-4)
- [ ] Ask questions on anything unclear
- [ ] Setup local development environment

**Sprint 1 Goal (Week 3):**
- Setup backend project (Express.js boilerplate)
- Create database schema (Prisma)
- Build authentication (signup, login, JWT)
- Setup Docker + local development
- **Target:** Backend API runs locally, authentication works

---

### 💻 Frontend Engineers (Web)

**By End of Week 2:**
- [ ] Read PROJECT_SUMMARY.md
- [ ] Read docs/02-product-brief.md (features section)
- [ ] Read docs/03-technical-requirements.md (Frontend section, API Endpoints)
- [ ] Read docs/04-architecture-design.md (Frontend, UX patterns)
- [ ] Read docs/05-sprint-roadmap.md (Sprint 5-6)
- [ ] Setup local React environment

**Sprint 1 Goal (Week 3):**
- Start Week 5 (wait for backend to be ready)
- Setup React project (Vite + TypeScript)
- Create component library (Button, Card, etc.)
- Setup Redux store
- **Target:** Web app runs locally, basic components work

---

### 📱 Mobile Engineers

**By End of Week 2:**
- [ ] Read PROJECT_SUMMARY.md
- [ ] Read docs/02-product-brief.md (mobile features)
- [ ] Read docs/03-technical-requirements.md (Mobile App section)
- [ ] Read docs/05-sprint-roadmap.md (Sprint 6)
- [ ] Setup React Native environment

**Sprint 1 Goal (Week 3-5):**
- Setup React Native project (Expo OR CLI)
- Create navigation structure
- Build authentication screens
- **Target:** App runs on iOS simulator + Android emulator

---

### 🔄 Product Manager

**By End of Week 2:**
- [ ] Read all documents (you know them, but review)
- [ ] Get team feedback on scope
- [ ] Finalize Sprint 1 tasks
- [ ] Setup communication channels (Slack, Discord, etc.)
- [ ] Setup project tracking (JIRA/GitHub Projects)

**Sprint 1 Goal (Week 3):**
- Daily standups (15 mins)
- Answer team questions
- Unblock impediments
- Update stakeholders

---

### 🚀 Operations / Growth

**By End of Week 2:**
- [ ] Read PROJECT_SUMMARY.md
- [ ] Read docs/02-product-brief.md (business model)
- [ ] Read docs/05-sprint-roadmap.md (full)
- [ ] Start identifying 50 pilot owners (Abidjan)
- [ ] Create outreach messaging
- [ ] Setup CRM/tracking for pilots

**Sprint 1 Goal (Week 3):**
- Reach out to 50 potential owner pilots
- Get 10-15 committed (for Week 7 beta)
- Prepare onboarding materials
- Setup support infrastructure

---

## 🗂️ Project Structure (What to Expect)

```
~/Projects/PromotionHub/
├── README.md                 ← Start here for overview
├── PROJECT_SUMMARY.md        ← Executive summary
├── QUICK_START.md           ← You are here
│
├── docs/
│   ├── 01-brainstorming-session.md     (30 ideas + insights)
│   ├── 02-product-brief.md             (vision + scope)
│   ├── 03-technical-requirements.md    (tech stack + API)
│   ├── 04-architecture-design.md       (system design)
│   └── 05-sprint-roadmap.md            (9 sprints detailed)
│
├── src/                      ← Code (will be created Week 3)
│   ├── backend/              (Node.js + Express)
│   ├── frontend-web/         (React.js)
│   └── mobile/               (React Native)
│
├── designs/                  ← Wireframes (coming Week 3)
├── research/                 ← Market research
└── assets/                   ← Images, logos, etc.
```

---

## 💬 Communication

### Daily Standup
- **Time:** 10:00 AM (Abidjan time)
- **Duration:** 15 minutes
- **Format:**
  - What did you do yesterday?
  - What are you doing today?
  - Any blockers?

### Weekly Review
- **Time:** Friday 4:00 PM
- **Duration:** 30 minutes
- **Format:**
  - Sprint progress
  - Demo of completed work
  - Questions & decisions

### Tools
- **Chat:** Discord / Slack
- **Code:** GitHub (github.com/friboost/promotionhub)
- **Tasks:** GitHub Projects or JIRA
- **Docs:** This repo + Notion (optional)

---

## 🚨 Important Questions Before Week 3

**Ask these questions NOW, not during development:**

1. **Team Size & Allocation**
   - How many backend engineers? (2-3?)
   - How many frontend engineers? (1-2?)
   - Mobile engineer assigned?
   - Any design support?

2. **AWS Account**
   - Is AWS account created?
   - Do we have credentials?
   - Budget limit set?

3. **Domains & Emails**
   - promotionhub.ci purchased?
   - support@promotionhub.ci email setup?

4. **Integrations**
   - Mobile Money API credentials? (Orange, MTN)
   - SendGrid / Email provider account?
   - Twilio account for SMS?
   - Mapbox account for maps?

5. **Decisions**
   - MVP scope approved?
   - Launch date confirmed (Week 9)?
   - Any scope changes?

---

## 📊 Key Metrics to Track

### Code Metrics (Weekly)
- Lines of code written
- Test coverage %
- Code review turnaround time
- Bug count

### Product Metrics (Weekly)
- Features completed
- Sprint velocity
- On-time delivery %

### Infrastructure Metrics (Daily)
- Uptime %
- API response time
- Database performance
- Build times

---

## 🎯 Sprint 1 Success = ...

If Sprint 1 is successful, you should have:

✅ Backend project setup and running locally
✅ Database schema created and migrated
✅ Authentication working (signup, login, JWT)
✅ API documentation started
✅ Docker development environment working
✅ Team confident in tech stack
✅ Clear path to Sprint 2

---

## 📚 Further Reading

### For Deep Dives

**Product Deep Dive:**
- Full brainstorming: `docs/01-brainstorming-session.md`
- 30 feature ideas across 8 categories
- 7 key insights
- Growth hacking strategies

**Technical Deep Dive:**
- API design: `docs/03-technical-requirements.md` (API Endpoints section)
- Database: `docs/03-technical-requirements.md` (Database Schema section)
- Architecture: `docs/04-architecture-design.md` (full)

**Business Deep Dive:**
- Unit economics: `PROJECT_SUMMARY.md` (Business Model section)
- Go-to-market: `PROJECT_SUMMARY.md` (GTM Strategy section)
- Roadmap: `docs/05-sprint-roadmap.md` (Phase 2+ section)

---

## 🤔 FAQ

### Q: When do we start development?
**A:** Week 3 (February 10, 2026). Week 1-2 is planning (done!). Use Week 2 to prepare.

### Q: Is 9 weeks realistic?
**A:** Yes, if we:
- Stay focused on MVP scope (no gold-plating)
- Have 3-4 engineers
- Use existing tech (no new frameworks)
- Good project management
- Clear decision-making

### Q: What if we miss a sprint?
**A:** Buffer week built in. Can compress later sprints slightly. But Week 9 launch date is firm (for market validation).

### Q: How much will this cost?
**A:** ~32M XOF pre-launch (salaries, infrastructure, tools, marketing). After launch, operate on 70% margins.

### Q: Can we use different tech stack?
**A:** No. Changing tech mid-project kills timelines. We chose Node/React/PostgreSQL for speed.

### Q: How do we handle design?
**A:** Aristide supports with UX/UI review. Shadcn/UI components for quick design. Don't over-design MVP.

### Q: What's the hardest part?
**A:** User adoption (getting first 50 owners). Plan now for field sales approach.

### Q: Post-launch, what's next?
**A:** Phase 2 (Months 7-12) adds AI matching, analytics, drone photos. Phase 3 (Year 2) adds design marketplace, financing, international.

---

## ✅ Pre-Sprint 1 Checklist

**Product Manager:**
- [ ] Confirm team size
- [ ] Assign sprint leads
- [ ] Setup communication channels
- [ ] Get GitHub/JIRA access
- [ ] Schedule Sprint 1 kickoff

**Backend Lead:**
- [ ] Review tech stack
- [ ] Plan infrastructure setup
- [ ] Assign tasks (1.1-1.5)
- [ ] Prepare Django/Express boilerplate

**Frontend Lead:**
- [ ] Review React tech stack
- [ ] Plan component architecture
- [ ] Setup Figma for designs
- [ ] Prepare wireframes (design phase)

**Mobile Lead:**
- [ ] Review React Native setup
- [ ] Decide Expo vs CLI
- [ ] Plan app architecture
- [ ] Test simulator/emulator

**All Engineers:**
- [ ] Read all documentation
- [ ] Ask questions NOW
- [ ] Setup local dev environment
- [ ] Get access to tools (GitHub, JIRA, Discord, etc.)

---

## 🎉 You're Ready!

**All planning is done. We're ready to build.**

Questions? Ask NOW before Sprint 1 starts.

---

**Next Step:** Await Sprint 1 kickoff (Week 3, Feb 10)

🚀 Let's build something amazing!
