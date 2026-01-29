# 🎯 PromotionHub - Marketplace de Publicité Outdoor

**Statut:** ✅ Conception complétée - Prêt pour développement
**Timeline:** 9 semaines pour MVP (Weeks 3-9)
**Public cible:** Propriétaires de panneaux + Annonceurs
**Format:** Web + Mobile (React.js + React Native)
**Ville de départ:** Abidjan, Côte d'Ivoire

---

## 📋 Mission

Digitaliser et automatiser le marché des panneaux publicitaires à Abidjan, créant un marketplace transparent qui connecte **propriétaires** (offre) avec **annonceurs/agences** (demande).

**Problem:** À Abidjan, les panneaux vides affichent juste un numéro. Pas de centralisation, pas de visibilité.
**Solution:** Plateforme SaaS marketplace avec bookings instant, contrats numériques, paiements mobiles, et vérification photos.

---

## 📁 Documentation Complétée

### Phase 1: Conception ✅ (Weeks 1-2 - COMPLÉTÉE)

| Document | Status | Description |
|----------|--------|-------------|
| **01-brainstorming-session.md** | ✅ | 30+ idées, 8 catégories, 7 insights clés |
| **02-product-brief.md** | ✅ | Vision, scope, objectifs SMART, timeline |
| **03-technical-requirements.md** | ✅ | Tech stack, API endpoints, DB schema |
| **04-architecture-design.md** | ✅ | System architecture, security, scaling |
| **05-sprint-roadmap.md** | ✅ | Sprints détaillés, team allocation |

### Phase 2: Development (Weeks 3-6) ⏭️
- [ ] Sprint 1: Backend boilerplate + DB
- [ ] Sprint 2: Listings API + Search
- [ ] Sprint 3: Bookings + Payments
- [ ] Sprint 4: Chat + Reviews
- [ ] Sprint 5: Web Frontend
- [ ] Sprint 6: Mobile App

### Phase 3: Beta Testing (Weeks 7-8) ⏭️
- [ ] Sprint 7: Integration & Polish
- [ ] Sprint 8: Beta Launch & Testing

### Phase 4: Public Launch (Week 9) ⏭️
- [ ] Sprint 9: Marketing & Launch

---

## 🎯 Key Numbers

| Metric | Target | Timeline |
|--------|--------|----------|
| **Users** | 500+ | Week 9 (launch) |
| **Listings** | 200+ | Week 9 |
| **Bookings** | 50+ | Week 9 (then 100+/month) |
| **Revenue** | 5M XOF MRR | Month 6 |
| **NPS Score** | 80%+ | Week 8 (beta) |
| **Uptime** | 99.9% | Target SLA |

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT tokens
- **Hosting:** AWS (EC2/ECS + RDS)
- **Payments:** Mobile Money APIs (Orange, MTN) + Stripe

### Frontend (Web)
- **Framework:** React 18 + TypeScript
- **State:** Redux Toolkit
- **Maps:** Mapbox GL JS
- **Styling:** Tailwind CSS + Shadcn/UI
- **Build:** Vite
- **Deploy:** Vercel or AWS Amplify

### Mobile
- **Framework:** React Native + TypeScript
- **Navigation:** React Navigation
- **State:** Redux Toolkit
- **Camera:** React Native Camera
- **Deploy:** App Store + Google Play

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Cloud:** AWS (ALB, ECS, RDS, S3, CloudFront)
- **Monitoring:** CloudWatch, Datadog

---

## 📊 Architecture Overview

```
Load Balancer (AWS ALB)
    ↓
API Servers (Node.js Express - stateless, scalable)
    ↓
Database (PostgreSQL - primary + read replicas)
    ↓
Storage (S3 for photos, contracts)
    ├─ Maps (Mapbox/Google Maps)
    ├─ Payments (Mobile Money + Stripe)
    ├─ Email (SendGrid)
    ├─ SMS (Twilio)
    └─ Analytics (Mixpanel/Amplitude)
```

---

## 🚀 Quick Links

- **Brainstorming:** `docs/01-brainstorming-session.md` (30 idées + insights)
- **Product Vision:** `docs/02-product-brief.md` (scope, objectifs, timeline)
- **Technical Design:** `docs/03-technical-requirements.md` (API, DB, tech stack)
- **Architecture:** `docs/04-architecture-design.md` (system design, patterns)
- **Sprint Plan:** `docs/05-sprint-roadmap.md` (9-week timeline)

---

## 📈 Business Model

### Revenue Streams
1. **Primary:** 10% commission on bookings
2. **Secondary:** Premium analytics features (future)
3. **Tertiary:** Services (drone photos, design, management - future)

### Unit Economics (at scale)
- Average booking: 1M XOF
- Commission earned: 100K XOF
- Operating cost per booking: ~30K XOF
- **Gross profit margin:** 70%

---

## 🎯 Success Criteria (MVP Week 9)

- ✅ 500+ users registered
- ✅ 200+ listings active
- ✅ 50+ completed bookings
- ✅ 1M+ XOF revenue
- ✅ 80%+ NPS score
- ✅ 95%+ uptime
- ✅ Product-market fit validated

---

## 👥 Team

- **Product Manager:** Aaron Besnainou
- **Tech Lead:** Engineering team (2-3 backend engineers)
- **Frontend Lead:** 1-2 frontend engineers
- **Mobile:** 1 mobile engineer
- **Operations:** 1 person
- **Design Support:** Aristide (UX/UI review)

---

## 📝 Notes

- **Development starts:** Week 3 (2026-02-10)
- **MVP Launch target:** Week 9 (2026-03-26)
- **Post-launch phases:** Scaling, AI features, international expansion

---

**Status:** ✅ All planning complete. Ready to start development week 3.

For detailed information, see the documentation files in `docs/`.
