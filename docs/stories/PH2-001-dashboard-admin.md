# Story PH2-001: Dashboard Admin React

## Metadata
- **ID:** PH2-001
- **Title:** Dashboard Admin React
- **Priority:** P1 (Haute)
- **Complexity:** Moyenne
- **Sprint:** Phase 2 - Améliorations UX

## Description
Créer un dashboard administrateur complet pour gérer la plateforme PromotionHub. Le dashboard doit permettre de visualiser les KPIs, gérer les utilisateurs, modérer les listings, et valider les photos de vérification.

## Acceptance Criteria

### AC1: Vue d'ensemble des KPIs
- [ ] Afficher le nombre total d'utilisateurs (actifs/inactifs)
- [ ] Afficher le nombre de listings (par statut: actif, pending, rejected)
- [ ] Afficher le chiffre d'affaires (journalier, hebdomadaire, mensuel)
- [ ] Afficher le nombre de réservations (en cours, terminées, annulées)
- [ ] Graphiques de tendance (Chart.js ou Recharts)

### AC2: Gestion des utilisateurs
- [ ] Liste paginée des utilisateurs avec recherche
- [ ] Filtrer par rôle (advertiser, owner, admin)
- [ ] Filtrer par statut (actif, suspendu, vérifié)
- [ ] Actions: suspendre, activer, promouvoir admin
- [ ] Voir le détail d'un utilisateur (listings, bookings, reviews)

### AC3: Modération des listings
- [ ] Liste des listings en attente de validation
- [ ] Preview du listing avec photos
- [ ] Actions: approuver, rejeter (avec raison)
- [ ] Historique des modérations

### AC4: Validation des photos
- [ ] File d'attente des photos à valider
- [ ] Comparaison photo uploadée vs description
- [ ] Marquer comme validé/rejeté
- [ ] Notifier le propriétaire du résultat

### AC5: Gestion des newsletters
- [ ] Liste des abonnés avec export CSV
- [ ] Créer et envoyer des campagnes
- [ ] Statistiques des campagnes (ouvertures, clics)

## Technical Tasks

### Backend
```
1. [ ] Créer admin.controller.ts avec endpoints stats
2. [ ] GET /api/admin/stats - KPIs globaux
3. [ ] GET /api/admin/users - Liste paginée
4. [ ] PATCH /api/admin/users/:id - Modifier statut/rôle
5. [ ] GET /api/admin/listings/pending - Listings à modérer
6. [ ] PATCH /api/admin/listings/:id/moderate - Approuver/Rejeter
7. [ ] GET /api/admin/photos/pending - Photos à valider
8. [ ] PATCH /api/admin/photos/:id/validate - Valider photo
```

### Frontend
```
1. [ ] Créer /admin route protégée
2. [ ] Layout admin avec sidebar navigation
3. [ ] DashboardOverview component (KPIs + graphiques)
4. [ ] UsersTable component avec filtres
5. [ ] ListingModeration component
6. [ ] PhotoValidation component
7. [ ] NewsletterManager component
```

## Dependencies
- Middleware admin existant (admin.middleware.ts)
- Prisma queries pour stats
- React Query pour data fetching

## Out of Scope
- Analytics avancées (Google Analytics)
- Export PDF des rapports
- Notifications push admin

## Estimation
- Backend: 4-6h
- Frontend: 8-10h
- Tests: 2-3h
- **Total: 14-19h**

## Definition of Done
- [ ] Tous les endpoints API fonctionnels
- [ ] Interface responsive (desktop first)
- [ ] Tests unitaires backend
- [ ] Documentation API Swagger
- [ ] Code review passé
