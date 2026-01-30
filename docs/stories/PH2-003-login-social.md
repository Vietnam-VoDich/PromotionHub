# Story PH2-003: Login Social

## Metadata
- **ID:** PH2-003
- **Title:** Login Social (Google, Facebook, Apple)
- **Priority:** P2 (Moyenne)
- **Complexity:** Faible
- **Sprint:** Phase 2 - Améliorations UX

## Description
Permettre aux utilisateurs de s'inscrire et se connecter via Google, Facebook, et Apple Sign In. Cela simplifie l'onboarding et réduit les frictions à l'inscription.

## Acceptance Criteria

### AC1: Google OAuth
- [ ] Bouton "Continuer avec Google"
- [ ] Authentification via Google OAuth 2.0
- [ ] Création automatique du compte si nouveau
- [ ] Liaison compte existant si même email

### AC2: Facebook Login
- [ ] Bouton "Continuer avec Facebook"
- [ ] Authentification via Facebook Login
- [ ] Récupération photo de profil
- [ ] Gestion des permissions minimales

### AC3: Apple Sign In
- [ ] Bouton "Continuer avec Apple"
- [ ] Support Hide My Email
- [ ] Requis pour App Store (iOS)

### AC4: Liaison de comptes
- [ ] Un utilisateur peut lier plusieurs providers
- [ ] Page settings pour gérer les connexions
- [ ] Possibilité de délier un provider

### AC5: Sécurité
- [ ] Vérification du token côté serveur
- [ ] Pas de stockage des tokens OAuth longs
- [ ] Audit log des connexions

## Technical Tasks

### Backend
```
1. [ ] npm install passport passport-google-oauth20 passport-facebook
2. [ ] Créer strategies/google.strategy.ts
3. [ ] Créer strategies/facebook.strategy.ts
4. [ ] Créer strategies/apple.strategy.ts
5. [ ] GET /api/auth/google - Initier OAuth
6. [ ] GET /api/auth/google/callback - Callback
7. [ ] Même pattern pour Facebook et Apple
8. [ ] Ajouter champs au User model (googleId, facebookId, appleId)
9. [ ] POST /api/auth/link-provider - Lier un provider
10. [ ] DELETE /api/auth/unlink-provider - Délier
```

### Frontend
```
1. [ ] Composant SocialLoginButtons
2. [ ] Boutons stylisés selon guidelines (Google, FB, Apple)
3. [ ] Gestion du flow OAuth (redirect)
4. [ ] Page /settings/connections
5. [ ] Afficher providers liés
```

### Prisma Schema
```prisma
model User {
  // ... existing fields
  googleId    String?   @unique
  facebookId  String?   @unique
  appleId     String?   @unique
  authProvider String?  // 'email' | 'google' | 'facebook' | 'apple'
}
```

## Environment Variables
```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Facebook Login
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# Apple Sign In
APPLE_CLIENT_ID=com.promotionhub.app
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=xxx
```

## Dependencies
- passport (authentication middleware)
- passport-google-oauth20
- passport-facebook
- passport-apple (ou apple-signin-auth)

## Out of Scope
- Twitter/X login
- LinkedIn login
- 2FA via social

## Estimation
- Backend: 4-5h
- Frontend: 2-3h
- Configuration consoles (Google, FB, Apple): 2h
- Tests: 1-2h
- **Total: 9-12h**

## Definition of Done
- [ ] Les 3 providers fonctionnels
- [ ] Création/liaison compte automatique
- [ ] Page settings pour gérer connexions
- [ ] Tests d'intégration OAuth
- [ ] Documentation setup providers
