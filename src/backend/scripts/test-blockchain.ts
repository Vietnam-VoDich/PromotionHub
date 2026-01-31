import { prisma } from '../src/lib/prisma.js';
import { blockchainService } from '../src/services/blockchain.service.js';

async function testBlockchain() {
  console.log('🔗 Test de certification blockchain\n');

  // 1. Créer une réservation de test
  const listing = await prisma.listing.findFirst();
  const advertiser = await prisma.user.findFirst({ where: { role: 'advertiser' } });
  const owner = await prisma.user.findFirst({ where: { role: 'owner' } });

  if (!listing) {
    console.log('❌ Aucune annonce trouvée. Créez des données de test d\'abord.');
    return;
  }

  // Utiliser l'advertiser ou créer une réservation avec le owner
  const bookingUser = advertiser || owner;
  if (!bookingUser) {
    console.log('❌ Aucun utilisateur trouvé.');
    return;
  }

  // Vérifier si une réservation existe déjà
  let booking = await prisma.booking.findFirst({
    include: {
      listing: true,
      advertiser: true,
    },
  });

  if (!booking) {
    console.log('📝 Création d\'une réservation de test...');
    booking = await prisma.booking.create({
      data: {
        listingId: listing.id,
        advertiserId: bookingUser.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        totalPrice: listing.pricePerMonth,
        status: 'confirmed',
      },
      include: {
        listing: true,
        advertiser: true,
      },
    });
    console.log(`✅ Réservation créée: ${booking.id}\n`);
  } else {
    console.log(`📋 Réservation existante trouvée: ${booking.id}\n`);
  }

  // 2. Certifier la réservation
  console.log('🔐 Certification de la réservation sur la blockchain...');
  const certification = await blockchainService.certifyBooking(booking.id);

  console.log('\n✅ Certification réussie:');
  console.log(`   Hash: ${certification.hash}`);
  console.log(`   Network: ${certification.network}`);
  console.log(`   TX Hash: ${certification.transactionHash || 'N/A (mode local)'}`);
  console.log(`   Timestamp: ${certification.timestamp.toISOString()}`);

  // 3. Vérifier la certification
  console.log('\n🔍 Vérification de la certification...');
  const verification = await blockchainService.verify('booking', booking.id);

  console.log(`\n${verification.valid ? '✅' : '❌'} ${verification.message}`);
  console.log(`   Hash stocké: ${verification.certification?.hash}`);
  console.log(`   Hash actuel: ${verification.currentHash}`);

  // 4. Afficher les informations de la réservation mise à jour
  const updatedBooking = await prisma.booking.findUnique({
    where: { id: booking.id },
    select: {
      id: true,
      blockchainHash: true,
      blockchainTxId: true,
      blockchainNetwork: true,
      certifiedAt: true,
    },
  });

  console.log('\n📊 Réservation mise à jour avec données blockchain:');
  console.log(JSON.stringify(updatedBooking, null, 2));

  console.log('\n✨ Test blockchain terminé avec succès!');
}

testBlockchain()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
