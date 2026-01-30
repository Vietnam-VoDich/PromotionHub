# Story PH2-005: Données de Trafic

## Metadata
- **ID:** PH2-005
- **Title:** Données de Trafic des Panneaux
- **Priority:** P2 (Moyenne)
- **Complexity:** Haute
- **Sprint:** Phase 2 - Améliorations UX

## Description
Ajouter des données d'estimation de trafic pour chaque panneau publicitaire. Inclut le passage piéton/voiture, les horaires de pointe, et un score de visibilité pour aider les annonceurs à choisir.

## Acceptance Criteria

### AC1: Données de trafic par panneau
- [ ] Estimation du passage journalier (piétons + véhicules)
- [ ] Données par heure (graphique 24h)
- [ ] Différenciation jours de semaine vs weekend
- [ ] Source des données (manuelle, API, estimation)

### AC2: Score de visibilité
- [ ] Score 1-100 basé sur plusieurs facteurs
- [ ] Facteurs: trafic, hauteur, angle, obstacles, éclairage
- [ ] Affichage visuel du score (jauge, étoiles)
- [ ] Explication des facteurs

### AC3: Heatmap des zones
- [ ] Carte avec coloration par densité de trafic
- [ ] Filtrer les panneaux par niveau de trafic
- [ ] Zones "premium" identifiées

### AC4: Interface propriétaire
- [ ] Formulaire pour saisir les données de trafic
- [ ] Upload de rapports de trafic (PDF/image)
- [ ] Validation par admin

### AC5: Affichage annonceur
- [ ] Section "Trafic" dans la page listing
- [ ] Graphique interactif
- [ ] Comparaison avec la moyenne de la zone

## Technical Tasks

### Backend
```
1. [ ] Créer model TrafficData dans Prisma
2. [ ] Créer model VisibilityScore
3. [ ] GET /api/listings/:id/traffic - Données trafic
4. [ ] POST /api/listings/:id/traffic - Saisir données (owner)
5. [ ] GET /api/traffic/heatmap - Données pour heatmap
6. [ ] Service calcul score visibilité
7. [ ] Cron job pour recalculer scores (optionnel)
```

### Frontend
```
1. [ ] Composant TrafficChart (Recharts)
2. [ ] Composant VisibilityScore (jauge)
3. [ ] Composant TrafficHeatmap (Mapbox layer)
4. [ ] Formulaire TrafficDataForm (owner)
5. [ ] Section dans ListingDetail
6. [ ] Filtre par trafic dans recherche
```

### Prisma Schema
```prisma
model TrafficData {
  id           String   @id @default(uuid())
  listingId    String
  listing      Listing  @relation(fields: [listingId], references: [id])

  // Estimations journalières
  pedestriansDaily    Int?
  vehiclesDaily       Int?

  // Données horaires (JSON)
  hourlyData   Json?    // { "00": 10, "01": 5, ... }

  // Métadonnées
  dataSource   TrafficSource @default(MANUAL)
  lastUpdated  DateTime @default(now())
  verifiedBy   String?

  createdAt    DateTime @default(now())
}

enum TrafficSource {
  MANUAL      // Saisi par owner
  GOVERNMENT  // Données officielles
  ESTIMATED   // Calculé par algorithme
  API         // Google Maps / autre API
}

model VisibilityScore {
  id          String   @id @default(uuid())
  listingId   String   @unique
  listing     Listing  @relation(fields: [listingId], references: [id])

  totalScore  Int      // 1-100

  // Facteurs individuels (1-20 chacun)
  trafficScore    Int
  heightScore     Int
  angleScore      Int
  lightingScore   Int
  obstacleScore   Int

  calculatedAt DateTime @default(now())
}
```

### Algorithme Score Visibilité
```typescript
function calculateVisibilityScore(listing: Listing, traffic: TrafficData): number {
  const weights = {
    traffic: 0.35,    // 35%
    height: 0.20,     // 20%
    angle: 0.15,      // 15%
    lighting: 0.15,   // 15%
    obstacles: 0.15   // 15%
  };

  const trafficScore = normalizeTraffic(traffic.vehiclesDaily + traffic.pedestriansDaily);
  const heightScore = normalizeHeight(listing.height);
  const angleScore = normalizeAngle(listing.viewingAngle);
  const lightingScore = listing.hasLighting ? 20 : 10;
  const obstacleScore = 20 - (listing.obstacles?.length || 0) * 4;

  return Math.round(
    trafficScore * weights.traffic +
    heightScore * weights.height +
    angleScore * weights.angle +
    lightingScore * weights.lighting +
    obstacleScore * weights.obstacles
  );
}
```

## Data Sources
- **Manuel**: Propriétaires saisissent leurs estimations
- **Données gouvernementales**: Ministère des Transports CI
- **Google Maps API**: Traffic layer (coûteux)
- **Estimation**: Basée sur type de rue, zone, etc.

## Out of Scope
- Données temps réel
- Intégration caméras
- Prédiction ML du trafic

## Estimation
- Backend models + API: 4-5h
- Frontend charts: 4-5h
- Heatmap: 3-4h
- Algorithme score: 2-3h
- Tests: 2h
- **Total: 15-19h**

## Definition of Done
- [ ] Données de trafic affichées par listing
- [ ] Score de visibilité calculé
- [ ] Heatmap fonctionnelle
- [ ] Formulaire owner pour saisie
- [ ] Documentation algorithme
