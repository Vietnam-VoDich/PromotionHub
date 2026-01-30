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

  // create demo listings
  const quartiers = ['Plateau', 'Cocody', 'Marcory', 'Yopougon', 'Treichville'];

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
        },
      });
    })
  );
  console.log(`Created ${listings.length} demo listings`);

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
