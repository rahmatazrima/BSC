const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputLogo = path.join(__dirname, '../public/logoo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(inputLogo)) {
      console.error('Logo file not found:', inputLogo);
      console.log('Please ensure logoo.png exists in public folder');
      return;
    }

    console.log('Generating PWA icons...');
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon (180x180)
    const appleTouchIconPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(inputLogo)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(appleTouchIconPath);
    console.log('✓ Generated apple-touch-icon.png');

    // Generate favicon (32x32)
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    await sharp(inputLogo)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    console.log('✓ Generated favicon.png (Note: Convert to .ico manually if needed)');

    console.log('\n✅ All icons generated successfully!');
    console.log('📁 Icons location:', outputDir);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

