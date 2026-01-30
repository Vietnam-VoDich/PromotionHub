# Story PH2-007: IA Détection Images

## Metadata
- **ID:** PH2-007
- **Title:** IA Détection et Validation d'Images
- **Priority:** P3 (Basse)
- **Complexity:** Haute
- **Sprint:** Phase 2 - Améliorations UX

## Description
Utiliser l'IA (Google Cloud Vision ou AWS Rekognition) pour analyser automatiquement les photos de panneaux publicitaires. Détection de la qualité, vérification de cohérence avec la description, et détection de fraude.

## Acceptance Criteria

### AC1: Analyse de qualité photo
- [ ] Score de qualité (1-100)
- [ ] Détection flou, sous-exposition, surexposition
- [ ] Feedback automatique au propriétaire
- [ ] Suggestion de reprendre la photo si mauvaise

### AC2: Vérification panneau
- [ ] Détecter si c'est bien un panneau publicitaire
- [ ] Détecter la présence d'une affiche
- [ ] Estimer les dimensions approximatives
- [ ] Détecter le type (4x3, abribus, etc.)

### AC3: Cohérence avec description
- [ ] Comparer photo vs infos saisies
- [ ] Vérifier la localisation (GPS dans EXIF)
- [ ] Alerter si incohérence détectée

### AC4: Détection de fraude
- [ ] Détecter les photos stock/internet
- [ ] Détecter les manipulations Photoshop
- [ ] Reverse image search
- [ ] Alerter l'admin si suspect

### AC5: Modération contenu
- [ ] Détecter contenu inapproprié
- [ ] Bloquer automatiquement si NSFW
- [ ] Détecter texte/logos problématiques

## Technical Tasks

### Backend
```
1. [ ] npm install @google-cloud/vision (ou aws-sdk)
2. [ ] Créer services/image-analysis.service.ts
3. [ ] POST /api/images/analyze - Analyser une image
4. [ ] Webhook Cloudinary pour analyse auto à l'upload
5. [ ] Créer model ImageAnalysis en DB
6. [ ] Queue de traitement asynchrone (Bull)
7. [ ] Alertes admin pour contenus suspects
```

### Frontend
```
1. [ ] Afficher score qualité après upload
2. [ ] Feedback visuel (tips pour améliorer)
3. [ ] Badge "Vérifié par IA" sur les listings
4. [ ] Interface admin pour review IA flags
```

### Prisma Schema
```prisma
model ImageAnalysis {
  id              String   @id @default(uuid())
  imageUrl        String
  listingId       String?
  listing         Listing? @relation(fields: [listingId], references: [id])

  // Scores
  qualityScore    Int      // 1-100

  // Détections
  isBillboard     Boolean
  hasAdvertisement Boolean
  estimatedSize   String?  // "4x3", "Abribus", etc.

  // Qualité
  isBlurry        Boolean @default(false)
  isUnderexposed  Boolean @default(false)
  isOverexposed   Boolean @default(false)

  // Sécurité
  isNSFW          Boolean @default(false)
  isSuspicious    Boolean @default(false)
  suspicionReason String?

  // Métadonnées EXIF
  exifData        Json?
  gpsCoordinates  Json?

  // Labels détectés
  labels          Json     // ["billboard", "street", "urban", ...]

  // Statut
  status          AnalysisStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?

  createdAt       DateTime @default(now())
}

enum AnalysisStatus {
  PENDING
  ANALYZED
  APPROVED
  REJECTED
  NEEDS_REVIEW
}
```

### Google Cloud Vision Integration
```typescript
import { ImageAnnotatorClient } from '@google-cloud/vision';

export const imageAnalysisService = {
  async analyzeImage(imageUrl: string) {
    const client = new ImageAnnotatorClient();

    const [result] = await client.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'TEXT_DETECTION' },
      ],
    });

    return {
      labels: result.labelAnnotations,
      safeSearch: result.safeSearchAnnotation,
      objects: result.localizedObjectAnnotations,
      text: result.textAnnotations,
      properties: result.imagePropertiesAnnotation,
    };
  },

  calculateQualityScore(analysis: any): number {
    let score = 100;

    // Pénalités selon les problèmes détectés
    if (analysis.isBlurry) score -= 30;
    if (analysis.isUnderexposed) score -= 20;
    if (analysis.isOverexposed) score -= 20;
    if (!analysis.hasBillboard) score -= 40;

    return Math.max(score, 0);
  }
};
```

## Environment Variables
```bash
# Google Cloud Vision
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=promotionhub-ci

# OU AWS Rekognition
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=eu-west-1
```

## Pricing
- **Google Cloud Vision**: $1.50/1000 images (premiers 1000 gratuits/mois)
- **AWS Rekognition**: $1.00/1000 images

## Out of Scope
- OCR avancé du texte sur panneaux
- Reconnaissance de marques/logos
- Comparaison avant/après campagne
- Génération d'images par IA

## Estimation
- Backend service IA: 5-6h
- Intégration upload: 2-3h
- Frontend feedback: 3-4h
- Queue traitement: 2-3h
- Tests: 2h
- **Total: 14-18h**

## Definition of Done
- [ ] Analyse automatique à l'upload
- [ ] Score qualité calculé et affiché
- [ ] Détection NSFW fonctionnelle
- [ ] Alertes admin pour contenus suspects
- [ ] Badge "Vérifié" sur listings validés
- [ ] Tests avec images variées
