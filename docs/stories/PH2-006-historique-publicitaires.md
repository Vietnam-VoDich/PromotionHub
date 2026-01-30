# Story PH2-006: Historique des Publicitaires

## Metadata
- **ID:** PH2-006
- **Title:** Historique des Publicités d'un Panneau
- **Priority:** P3 (Basse)
- **Complexity:** Moyenne
- **Sprint:** Phase 2 - Améliorations UX

## Description
Permettre aux annonceurs de voir l'historique des campagnes précédentes sur un panneau. Cela inclut les anciens annonceurs (anonymisés), types de campagnes, durées moyennes, et taux de renouvellement.

## Acceptance Criteria

### AC1: Historique visible sur listing
- [ ] Section "Historique" dans la page détail
- [ ] Liste des X dernières campagnes (anonymisées)
- [ ] Type de campagne (produit, événement, politique, etc.)
- [ ] Durée de chaque campagne

### AC2: Statistiques du panneau
- [ ] Durée moyenne de location
- [ ] Taux de renouvellement (% qui relouent)
- [ ] Taux d'occupation annuel
- [ ] Secteurs d'activité fréquents

### AC3: Timeline visuelle
- [ ] Frise chronologique des occupations
- [ ] Périodes libres vs occupées
- [ ] Filtrer par année

### AC4: Confidentialité
- [ ] Noms des annonceurs NON affichés
- [ ] Seulement les secteurs d'activité
- [ ] Option pour l'annonceur de masquer sa campagne

### AC5: Insights pour owner
- [ ] Dashboard avec stats de son panneau
- [ ] Comparaison avec panneaux similaires
- [ ] Suggestions de pricing

## Technical Tasks

### Backend
```
1. [ ] Modifier model Booking pour tracking historique
2. [ ] Ajouter champ 'campaignType' aux bookings
3. [ ] GET /api/listings/:id/history - Historique anonymisé
4. [ ] GET /api/listings/:id/stats - Statistiques agrégées
5. [ ] Service de calcul des métriques
6. [ ] Cron job pour mise à jour stats mensuelles
```

### Frontend
```
1. [ ] Composant BookingHistory (timeline)
2. [ ] Composant ListingStats (métriques)
3. [ ] Composant OccupancyChart (taux occupation)
4. [ ] Section dans ListingDetail
5. [ ] Dashboard owner avec ses stats
```

### Prisma Schema Updates
```prisma
model Booking {
  // ... existing fields

  campaignType    CampaignType?
  campaignSector  String?        // "Telecom", "Food", "Auto", etc.
  isPublic        Boolean @default(true)  // Visible dans historique?

  // Pour les stats
  wasRenewed      Boolean @default(false)
  renewedFromId   String?
}

enum CampaignType {
  PRODUCT       // Produit/Marque
  EVENT         // Événement
  POLITICAL     // Politique
  PUBLIC_SERVICE // Service public
  CORPORATE     // Corporate/Image
  SEASONAL      // Saisonnier
  OTHER
}

model ListingStats {
  id              String   @id @default(uuid())
  listingId       String   @unique
  listing         Listing  @relation(fields: [listingId], references: [id])

  avgBookingDays      Float    // Durée moyenne en jours
  renewalRate         Float    // % de renouvellement
  occupancyRate       Float    // % d'occupation annuelle
  totalBookings       Int      // Nombre total de réservations

  topSectors          Json     // ["Telecom", "Food", ...]

  calculatedAt        DateTime @default(now())
}
```

### API Response Example
```json
{
  "history": [
    {
      "id": "xxx",
      "period": "2025-10 → 2025-12",
      "duration": 62,
      "sector": "Télécommunications",
      "type": "PRODUCT"
    }
  ],
  "stats": {
    "avgBookingDays": 45,
    "renewalRate": 0.35,
    "occupancyRate": 0.78,
    "totalBookings": 12,
    "topSectors": ["Telecom", "Food & Beverage", "Banking"]
  }
}
```

## Privacy Considerations
- Jamais afficher le nom de l'annonceur
- Jamais afficher les visuels des campagnes passées
- Permettre à l'annonceur de masquer sa campagne
- Données agrégées seulement

## Out of Scope
- Photos des anciennes campagnes
- Noms des annonceurs
- Performance des campagnes (ROI, etc.)

## Estimation
- Backend: 4-5h
- Frontend: 4-5h
- Calcul stats: 2-3h
- Tests: 1-2h
- **Total: 11-15h**

## Definition of Done
- [ ] Historique anonymisé visible
- [ ] Statistiques calculées
- [ ] Timeline fonctionnelle
- [ ] Privacy respectée
- [ ] Dashboard owner avec insights
