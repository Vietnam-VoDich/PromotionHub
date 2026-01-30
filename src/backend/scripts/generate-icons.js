const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/icons');

// PromotionHub orange color
const PRIMARY_COLOR = '#f97316';
const BG_COLOR = '#ffffff';

async function generateIcons() {
  // ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const size of ICON_SIZES) {
    const padding = Math.floor(size * 0.15);
    const innerSize = size - padding * 2;

    // create SVG with "PH" logo
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${BG_COLOR}" rx="${Math.floor(size * 0.15)}"/>
        <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="${PRIMARY_COLOR}" rx="${Math.floor(innerSize * 0.1)}"/>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
              font-family="Arial, sans-serif" font-weight="bold"
              font-size="${Math.floor(innerSize * 0.45)}px" fill="${BG_COLOR}">PH</text>
      </svg>
    `;

    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // generate badge icon (smaller, for notifications)
  const badgeSize = 72;
  const badgeSvg = `
    <svg width="${badgeSize}" height="${badgeSize}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${badgeSize/2}" cy="${badgeSize/2}" r="${badgeSize/2}" fill="${PRIMARY_COLOR}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-weight="bold"
            font-size="${Math.floor(badgeSize * 0.4)}px" fill="${BG_COLOR}">PH</text>
    </svg>
  `;

  await sharp(Buffer.from(badgeSvg))
    .png()
    .toFile(path.join(OUTPUT_DIR, 'badge-72x72.png'));

  console.log('Generated: badge-72x72.png');

  // generate OG image (1200x630 recommended for social)
  const ogWidth = 1200;
  const ogHeight = 630;
  const ogSvg = `
    <svg width="${ogWidth}" height="${ogHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316"/>
          <stop offset="100%" style="stop-color:#ea580c"/>
        </linearGradient>
      </defs>
      <rect width="${ogWidth}" height="${ogHeight}" fill="url(#bg)"/>
      <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-weight="bold"
            font-size="120px" fill="${BG_COLOR}">PromotionHub</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-weight="normal"
            font-size="48px" fill="${BG_COLOR}" opacity="0.9">Panneaux Publicitaires à Abidjan</text>
    </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '../../frontend/public/og-image.jpg'));

  console.log('Generated: og-image.jpg');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
