const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcon(size) {
  const svg = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#020617;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#grad)"/>
      <rect 
        x="${Math.round(size * 0.05)}" 
        y="${Math.round(size * 0.05)}" 
        width="${Math.round(size * 0.9)}" 
        height="${Math.round(size * 0.9)}" 
        rx="${Math.round(size * 0.15)}" 
        fill="none" 
        stroke="#f59e0b" 
        stroke-width="${Math.round(size * 0.02)}"
        opacity="0.3"
      />
      <text 
        x="50%" 
        y="54%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="Georgia, serif" 
        font-weight="900" 
        font-size="${Math.round(size * 0.42)}" 
        fill="white"
        letter-spacing="-${Math.round(size * 0.01)}"
      >KY<tspan fill="#f59e0b">A</tspan></text>
    </svg>
  `);

  await sharp(svg)
    .png()
    .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

  console.log(`✓ Generated icon-${size}x${size}.png`);
}

async function generateAllIcons() {
  console.log("Generating KYA icons...\n");
  for (const size of sizes) {
    await generateIcon(size);
  }
  console.log("\n✅ All icons generated in public/icons/");
}

generateAllIcons().catch(console.error);