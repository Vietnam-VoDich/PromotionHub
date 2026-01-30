# Story PH2-002: Carte Interactive Mapbox

## Metadata
- **ID:** PH2-002
- **Title:** Carte Interactive Mapbox
- **Priority:** P1 (Haute)
- **Complexity:** Moyenne
- **Sprint:** Phase 2 - Améliorations UX

## Description
Intégrer une carte interactive Mapbox pour visualiser les panneaux publicitaires disponibles. Les utilisateurs peuvent filtrer géographiquement, voir les détails au survol, et calculer la distance depuis leur position.

## Acceptance Criteria

### AC1: Affichage carte avec markers
- [ ] Carte Mapbox GL JS intégrée
- [ ] Markers personnalisés pour chaque panneau
- [ ] Couleurs différentes selon le statut (disponible=vert, réservé=orange)
- [ ] Clustering pour zones denses

### AC2: Filtrage géographique
- [ ] Recherche par adresse/ville
- [ ] Filtrer par rayon (1km, 5km, 10km, 25km)
- [ ] Dessiner une zone personnalisée
- [ ] Filtrer par type de panneau

### AC3: Interaction avec les markers
- [ ] Popup au survol avec aperçu (photo, titre, prix)
- [ ] Clic → ouvre le détail du listing
- [ ] Navigation vers le listing

### AC4: Géolocalisation utilisateur
- [ ] Bouton "Ma position"
- [ ] Calcul et affichage de la distance
- [ ] Tri par proximité

### AC5: Street View (bonus)
- [ ] Intégration Google Street View
- [ ] Preview de l'emplacement réel
- [ ] Lien vers Google Maps

## Technical Tasks

### Backend
```
1. [ ] Ajouter latitude/longitude au model Listing
2. [ ] Migration Prisma pour coordonnées
3. [ ] GET /api/listings/geo - Listings avec filtres géo
4. [ ] Query avec ST_Distance (PostGIS) ou calcul Haversine
5. [ ] Endpoint geocoding (ou utiliser Mapbox Geocoding API)
```

### Frontend
```
1. [ ] npm install mapbox-gl react-map-gl
2. [ ] Créer MapView component
3. [ ] ListingMarker component personnalisé
4. [ ] MapFilters component (rayon, type, etc.)
5. [ ] Intégrer dans la page de recherche
6. [ ] Toggle vue liste/carte
7. [ ] Gérer le consentement géolocalisation
```

## Environment Variables
```bash
MAPBOX_ACCESS_TOKEN=pk.xxx
MAPBOX_STYLE_URL=mapbox://styles/mapbox/streets-v12
```

## Dependencies
- Mapbox GL JS (gratuit jusqu'à 50k loads/mois)
- react-map-gl wrapper React
- @turf/turf pour calculs géographiques

## Data Migration
```sql
ALTER TABLE "Listing" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Listing" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Listing" ADD COLUMN "address" TEXT;
```

## Out of Scope
- Directions/itinéraire
- Heatmap de visibilité
- Mode offline

## Estimation
- Backend: 3-4h
- Frontend: 6-8h
- Migration données: 1-2h
- Tests: 2h
- **Total: 12-16h**

## Definition of Done
- [ ] Carte fonctionnelle avec markers
- [ ] Filtres géographiques opérationnels
- [ ] Responsive (mobile-friendly)
- [ ] Performance OK (< 100 markers visibles)
- [ ] Tests E2E carte
