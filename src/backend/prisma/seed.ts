import { PrismaClient, Role, ListingSize, ListingStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@promotionhub.ci' },
    update: {},
    create: {
      email: 'admin@promotionhub.ci',
      passwordHash: adminPassword,
      role: Role.admin,
      firstName: 'Admin',
      lastName: 'PromotionHub',
      verified: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // create demo owner
  const ownerPassword = await bcrypt.hash('owner123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.ci' },
    update: {},
    create: {
      email: 'owner@demo.ci',
      passwordHash: ownerPassword,
      role: Role.owner,
      firstName: 'Kouamé',
      lastName: 'Yao',
      phone: '+225 07 00 00 01',
      city: 'Abidjan',
      verified: true,
    },
  });
  console.log('Created owner user:', owner.email);

  // create demo advertiser
  const advertiserPassword = await bcrypt.hash('advertiser123', 12);
  const advertiser = await prisma.user.upsert({
    where: { email: 'advertiser@demo.ci' },
    update: {},
    create: {
      email: 'advertiser@demo.ci',
      passwordHash: advertiserPassword,
      role: Role.advertiser,
      firstName: 'Aminata',
      lastName: 'Diallo',
      phone: '+225 07 00 00 02',
      city: 'Abidjan',
      verified: true,
    },
  });
  console.log('Created advertiser user:', advertiser.email);

  // create demo listings with traffic data and advertiser history
  const quartiers = ['Plateau', 'Cocody', 'Marcory', 'Yopougon', 'Treichville'];

  const trafficData = [
    { daily: 45000, peaks: ['07:00-09:00', '12:00-14:00', '17:00-19:00'], brands: ['Orange CI', 'MTN', 'Coca-Cola'] },
    { daily: 32000, peaks: ['08:00-10:00', '17:00-20:00'], brands: ['Nestlé', 'Brassivoire', 'Total Energies'] },
    { daily: 28000, peaks: ['06:00-08:00', '16:00-19:00'], brands: ['Moov Africa', 'Canal+'] },
    { daily: 55000, peaks: ['06:00-09:00', '17:00-20:00'], brands: ['Jumia', 'Wave', 'Orange Money'] },
    { daily: 38000, peaks: ['07:00-10:00', '16:00-19:00'], brands: ['Solibra', 'Unilever', 'Nestlé'] },
  ];

  const listings = await Promise.all(
    quartiers.map(async (quartier, index) => {
      return prisma.listing.create({
        data: {
          ownerId: owner.id,
          title: `Panneau 4x3m - ${quartier}`,
          description: `Excellent emplacement au cœur de ${quartier}. Visibilité maximale sur l'axe principal.`,
          latitude: 5.3364 + Math.random() * 0.1,
          longitude: -4.0267 + Math.random() * 0.1,
          address: `Boulevard Principal, ${quartier}`,
          quartier,
          size: index % 3 === 0 ? ListingSize.large : index % 2 === 0 ? ListingSize.medium : ListingSize.small,
          pricePerMonth: 500000 + index * 100000,
          status: ListingStatus.active,
          availabilityStart: new Date(),
          availabilityEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          // Traffic data
          dailyTraffic: trafficData[index].daily,
          peakHours: JSON.stringify(trafficData[index].peaks),
          trafficSource: 'Estimation basée sur données municipales',
          trafficUpdatedAt: new Date(),
          // Advertiser history
          pastAdvertisers: JSON.stringify(trafficData[index].brands),
        },
      });
    })
  );
  console.log(`Created ${listings.length} demo listings with traffic data`);

  // Create blog categories
  const blogCategories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'conseils-publicite' },
      update: {},
      create: {
        slug: 'conseils-publicite',
        name: 'Conseils Publicité',
        description: 'Conseils pratiques pour réussir vos campagnes publicitaires',
        order: 1,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'tendances-marketing' },
      update: {},
      create: {
        slug: 'tendances-marketing',
        name: 'Tendances Marketing',
        description: 'Les dernières tendances du marketing en Côte d\'Ivoire',
        order: 2,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'etudes-de-cas' },
      update: {},
      create: {
        slug: 'etudes-de-cas',
        name: 'Études de cas',
        description: 'Exemples de campagnes réussies',
        order: 3,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'guide-abidjan' },
      update: {},
      create: {
        slug: 'guide-abidjan',
        name: 'Guide Abidjan',
        description: 'Guide des meilleurs emplacements publicitaires à Abidjan',
        order: 4,
      },
    }),
  ]);
  console.log(`Created ${blogCategories.length} blog categories`);

  // Create blog tags
  const blogTags = await Promise.all([
    prisma.blogTag.upsert({ where: { slug: 'affichage' }, update: {}, create: { slug: 'affichage', name: 'Affichage' } }),
    prisma.blogTag.upsert({ where: { slug: 'roi' }, update: {}, create: { slug: 'roi', name: 'ROI' } }),
    prisma.blogTag.upsert({ where: { slug: 'strategie' }, update: {}, create: { slug: 'strategie', name: 'Stratégie' } }),
    prisma.blogTag.upsert({ where: { slug: 'abidjan' }, update: {}, create: { slug: 'abidjan', name: 'Abidjan' } }),
    prisma.blogTag.upsert({ where: { slug: 'panneaux' }, update: {}, create: { slug: 'panneaux', name: 'Panneaux' } }),
    prisma.blogTag.upsert({ where: { slug: 'digital' }, update: {}, create: { slug: 'digital', name: 'Digital' } }),
  ]);
  console.log(`Created ${blogTags.length} blog tags`);

  // Create blog posts for SEO
  const blogPosts = [
    {
      slug: 'guide-complet-publicite-exterieure-abidjan',
      title: 'Guide Complet de la Publicité Extérieure à Abidjan en 2026',
      excerpt: 'Découvrez tout ce qu\'il faut savoir pour réussir vos campagnes d\'affichage publicitaire à Abidjan : emplacements stratégiques, tarifs, et meilleures pratiques.',
      content: `## Introduction à la publicité extérieure en Côte d'Ivoire

La publicité extérieure reste l'un des moyens les plus efficaces pour toucher une large audience en Côte d'Ivoire. Avec plus de 5 millions d'habitants, Abidjan offre un potentiel publicitaire considérable.

## Les meilleurs quartiers pour l'affichage

### Plateau - Le centre d'affaires

Le Plateau, cœur économique d'Abidjan, attire quotidiennement des milliers de professionnels et de décideurs. C'est l'emplacement idéal pour les campagnes B2B.

### Cocody - La zone résidentielle premium

Cocody regroupe les classes moyennes et aisées. Parfait pour les marques de luxe et les services premium.

### Marcory - Zone commerciale stratégique

Marcory bénéficie d'un trafic dense et d'une excellente visibilité. Idéal pour les lancements de produits grand public.

## Comment choisir votre emplacement

1. **Analysez le flux de circulation** - Plus le trafic est important, plus votre visibilité sera grande
2. **Étudiez votre cible** - Choisissez un quartier fréquenté par votre audience
3. **Considérez la durée d'exposition** - Les feux rouges et les embouteillages augmentent le temps de lecture

## Tarifs moyens en 2026

Les prix varient selon la taille et l'emplacement :
- Petit format (2x3m) : 300 000 à 500 000 FCFA/mois
- Moyen format (4x3m) : 500 000 à 800 000 FCFA/mois
- Grand format (8x4m) : 800 000 à 1 500 000 FCFA/mois

## Conclusion

La publicité extérieure à Abidjan représente un investissement rentable quand elle est bien planifiée. Utilisez PromotionHub pour trouver et comparer les meilleurs emplacements.`,
      coverImage: 'https://images.unsplash.com/photo-1586031489788-effdbc56ef1c?w=1200',
      metaTitle: 'Guide Publicité Extérieure Abidjan 2026 | Tarifs & Emplacements',
      metaDescription: 'Guide complet de la publicité extérieure à Abidjan : meilleurs emplacements, tarifs 2026, conseils d\'experts. Trouvez votre panneau publicitaire idéal.',
      metaKeywords: 'publicité extérieure Abidjan, panneau publicitaire Côte d\'Ivoire, affichage Abidjan, tarifs panneaux Abidjan',
      readingTime: 8,
      featured: true,
      authorName: 'Équipe PromotionHub',
      categoryIndex: 0,
      tagIndices: [0, 3, 4],
    },
    {
      slug: 'mesurer-roi-campagne-affichage',
      title: 'Comment Mesurer le ROI de Votre Campagne d\'Affichage Publicitaire',
      excerpt: 'Apprenez à calculer et optimiser le retour sur investissement de vos campagnes d\'affichage outdoor avec des méthodes éprouvées.',
      content: `## Pourquoi mesurer le ROI de l'affichage ?

Contrairement au digital, mesurer l'efficacité de la publicité extérieure peut sembler complexe. Pourtant, plusieurs méthodes fiables existent.

## Les indicateurs clés de performance

### 1. Impressions estimées

Calculez le nombre de personnes exposées à votre panneau en fonction du trafic routier et piéton.

### 2. Mémorisation de marque

Réalisez des études avant/après campagne pour mesurer l'évolution de la notoriété.

### 3. Conversions trackées

Utilisez des codes promo ou des URLs dédiées pour suivre les conversions directes.

## Calculer votre coût par mille (CPM)

CPM = (Coût total de la campagne / Impressions estimées) x 1000

En moyenne, le CPM de l'affichage à Abidjan varie entre 3 et 8 FCFA.

## Optimiser votre ROI

- Négociez des emplacements premium
- Combinez avec le digital (QR codes, réalité augmentée)
- Testez différents designs créatifs
- Analysez les périodes de forte affluence

## Conclusion

Un suivi rigoureux de vos KPIs vous permettra d'améliorer continuellement vos campagnes d'affichage.`,
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      metaTitle: 'Mesurer ROI Publicité Extérieure | Guide Complet',
      metaDescription: 'Découvrez comment calculer le retour sur investissement de vos campagnes d\'affichage publicitaire. Méthodes, KPIs et conseils d\'optimisation.',
      metaKeywords: 'ROI publicité extérieure, mesurer affichage, KPI outdoor, efficacité panneau publicitaire',
      readingTime: 6,
      featured: true,
      authorName: 'Expert Marketing PromotionHub',
      categoryIndex: 0,
      tagIndices: [1, 2],
    },
    {
      slug: 'tendances-publicite-exterieure-2026',
      title: '5 Tendances de la Publicité Extérieure en Côte d\'Ivoire pour 2026',
      excerpt: 'Découvrez les innovations qui transforment le paysage de l\'affichage publicitaire en Côte d\'Ivoire cette année.',
      content: `## L'évolution du marché publicitaire ivoirien

Le marché de la publicité extérieure en Côte d'Ivoire connaît une transformation rapide. Voici les 5 tendances majeures à surveiller.

## 1. L'affichage digital (DOOH)

Les écrans LED et panneaux digitaux se multiplient dans les grandes villes. Ils permettent une rotation des messages et une plus grande flexibilité.

## 2. L'intégration mobile

Les QR codes et technologies NFC permettent de créer un pont entre l'affichage physique et l'engagement digital.

## 3. L'affichage programmatique

Comme en digital, l'achat programmatique d'espaces publicitaires extérieurs commence à émerger.

## 4. La personnalisation géolocalisée

Les marques adaptent leurs messages en fonction des quartiers et des audiences locales.

## 5. L'éco-responsabilité

Les panneaux solaires et matériaux recyclables deviennent des arguments de vente importants.

## Comment s'adapter ?

- Restez informé des nouvelles technologies
- Testez les formats innovants
- Mesurez et comparez les performances

## Conclusion

L'affichage publicitaire reste un média puissant, et son évolution vers le digital ouvre de nouvelles opportunités.`,
      coverImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200',
      metaTitle: 'Tendances Publicité Extérieure 2026 Côte d\'Ivoire',
      metaDescription: 'Les 5 tendances qui transforment la publicité extérieure en Côte d\'Ivoire en 2026 : digital, programmatique, éco-responsabilité.',
      metaKeywords: 'tendances publicité 2026, DOOH Côte d\'Ivoire, affichage digital Abidjan, innovation publicitaire',
      readingTime: 5,
      featured: false,
      authorName: 'Équipe PromotionHub',
      categoryIndex: 1,
      tagIndices: [5, 2],
    },
    {
      slug: 'meilleurs-emplacements-panneaux-cocody',
      title: 'Les 10 Meilleurs Emplacements pour Panneaux Publicitaires à Cocody',
      excerpt: 'Notre sélection des emplacements les plus stratégiques pour votre affichage publicitaire dans le quartier prisé de Cocody.',
      content: `## Pourquoi Cocody ?

Cocody est le quartier résidentiel le plus prisé d'Abidjan. Avec ses infrastructures modernes et sa population aisée, c'est un terrain de jeu idéal pour les marques premium.

## Top 10 des emplacements

### 1. Boulevard de France
Axe principal très fréquenté, idéal pour la visibilité de masse.

### 2. Carrefour Riviera Palmeraie
Zone commerciale dynamique avec un trafic important.

### 3. Rond-point de la Riviera 3
Point névralgique connectant plusieurs quartiers.

### 4. Boulevard des Martyrs
Axe business avec de nombreuses entreprises.

### 5. Deux Plateaux - Vallon
Quartier résidentiel haut de gamme.

### 6. Angré 8ème tranche
Zone en développement avec une population jeune.

### 7. Blockauss
Carrefour stratégique très passant.

### 8. Ambassades
Quartier diplomatique et institutionnel.

### 9. Centre commercial Cap Sud
Zone de forte affluence commerciale.

### 10. Attoban
Quartier résidentiel avec bon pouvoir d'achat.

## Conseils de sélection

- Analysez votre cible
- Vérifiez la visibilité réelle sur place
- Comparez les tarifs sur PromotionHub

## Conclusion

Cocody offre de nombreuses opportunités pour l'affichage publicitaire. Utilisez notre plateforme pour comparer et réserver.`,
      coverImage: 'https://images.unsplash.com/photo-1569025743873-ea3a9ber?w=1200',
      metaTitle: 'Meilleurs Emplacements Panneaux Cocody | Guide 2026',
      metaDescription: 'Découvrez les 10 meilleurs emplacements pour panneaux publicitaires à Cocody, Abidjan. Guide complet avec conseils d\'experts.',
      metaKeywords: 'panneaux publicitaires Cocody, affichage Cocody, publicité Riviera, emplacements publicitaires Abidjan',
      readingTime: 7,
      featured: false,
      authorName: 'Équipe PromotionHub',
      categoryIndex: 3,
      tagIndices: [3, 4],
    },
  ];

  for (const post of blogPosts) {
    const { categoryIndex, tagIndices, ...postData } = post;
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...postData,
        status: 'published',
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        viewCount: Math.floor(Math.random() * 500) + 50,
        categories: {
          connect: [{ id: blogCategories[categoryIndex].id }],
        },
        tags: {
          connect: tagIndices.map((i: number) => ({ id: blogTags[i].id })),
        },
      },
    });
  }
  console.log(`Created ${blogPosts.length} blog posts`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
