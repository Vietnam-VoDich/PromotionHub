# Roadmap PromotionHub

## ✅ Phase 1 - MVP (Complété)

- [x] Backend Express.js + TypeScript
- [x] Base de données PostgreSQL + Prisma
- [x] Authentification JWT avec refresh tokens
- [x] CRUD Listings, Bookings, Messages, Reviews
- [x] Paiements Mobile Money (Orange, MTN, Wave)
- [x] Notifications (Email, SMS, Push)
- [x] Newsletter avec double opt-in
- [x] Smart Review Flow (Google redirect / WhatsApp support)
- [x] Frontend React 19 + Tailwind
- [x] PWA avec Service Worker

---

## 🚧 Phase 2 - Améliorations UX (En cours)

### 1. WebSocket / Temps réel (Socket.io)
- [ ] Messagerie instantanée
- [ ] Notifications en temps réel
- [ ] Statut "en ligne" des utilisateurs
- [ ] Typing indicators

### 2. Carte Interactive (Mapbox/Google Maps)
- [ ] Affichage des panneaux sur carte
- [ ] Filtrage géographique
- [ ] Calcul de distance
- [ ] Street View pour preview

### 3. Dashboard Admin React
- [ ] Vue d'ensemble des KPIs
- [ ] Gestion des utilisateurs
- [ ] Modération des listings
- [ ] Validation des photos de vérification
- [ ] Gestion des newsletters

### 4. Login Social
- [ ] Google OAuth
- [ ] Facebook Login
- [ ] Apple Sign In

---

## 📊 Phase 3 - Intelligence & Analytics

### 5. Données de Trafic
- [ ] Estimation du passage piéton/voiture
- [ ] Données de trafic par heure
- [ ] Score de visibilité
- [ ] Heatmap des zones chaudes

### 6. Historique des Publicités
- [ ] Anciens annonceurs du panneau
- [ ] Types de campagnes précédentes
- [ ] Durées moyennes de location
- [ ] Taux de renouvellement

### 7. IA & Machine Learning
- [ ] Détection automatique de la qualité des photos
- [ ] Vérification que le panneau correspond à la description
- [ ] Estimation du ROI d'une campagne
- [ ] Recommandation de panneaux similaires
- [ ] Détection de fraude

---

## 🎯 Phase 4 - Expansion

### 8. Multi-pays
- [ ] Sénégal
- [ ] Mali
- [ ] Burkina Faso
- [ ] Multi-devises (XOF, EUR)

### 9. Fonctionnalités Premium
- [ ] Panneaux LED/digitaux
- [ ] Enchères pour emplacements premium
- [ ] Réservation récurrente
- [ ] API pour agences média

### 10. Mobile App
- [ ] React Native iOS/Android
- [ ] Mode hors-ligne
- [ ] Scan QR des panneaux
- [ ] Réalité augmentée (preview affiche)

---

## Priorités immédiates

| Fonctionnalité | Complexité | Impact | Priorité |
|----------------|------------|--------|----------|
| Dashboard Admin | Moyenne | Haute | 🔴 P1 |
| Carte Mapbox | Moyenne | Haute | 🔴 P1 |
| Login Social | Faible | Moyenne | 🟡 P2 |
| WebSocket Chat | Moyenne | Moyenne | 🟡 P2 |
| Données Trafic | Haute | Haute | 🟡 P2 |
| IA Photos | Haute | Moyenne | 🟢 P3 |

---

## Stack technique prévue

| Fonctionnalité | Technologie |
|----------------|-------------|
| WebSocket | Socket.io |
| Cartes | Mapbox GL JS |
| Login Social | Passport.js + OAuth2 |
| IA Images | Google Cloud Vision / AWS Rekognition |
| Trafic | Google Maps API / données gouvernementales |
| Mobile | React Native + Expo |
