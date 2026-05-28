const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#020617"/>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#020617;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text 
    x="50%" 
    y="52%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="Georgia, serif" 
    font-weight="900" 
    font-size="${size * 0.38}" 
    fill="white"
  >KY</text>
  <text 
    x="${size * 0.685}" 
    y="52%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="Georgia, serif" 
    font-weight="900" 
    font-size="${size * 0.38}" 
    fill="#f59e0b"
  >A</text>
</svg>`;

  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log("All SVG icons generated in public/icons/");
console.log("Note: Convert SVGs to PNG using an online tool like cloudconvert.com");