// ============================================================
//  ARENA CLASH — generate-icons.js
//  Run: node generate-icons.js
//  Creates all icons/icon-*.png files needed for PWA
// ============================================================

const fs   = require('fs');
const path = require('path');

// We'll use the 'canvas' npm package
// Install: npm install canvas
let createCanvas;
try {
  ({ createCanvas } = require('canvas'));
} catch (e) {
  console.log('');
  console.log('  Install canvas first:  npm install canvas');
  console.log('  Then run:              node generate-icons.js');
  console.log('');
  process.exit(1);
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT   = path.join(__dirname, 'icons');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');
  const s      = size;

  // Background — deep dark with gradient
  const bg = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  bg.addColorStop(0,   '#1a0d2e');
  bg.addColorStop(0.6, '#0d0d2e');
  bg.addColorStop(1,   '#05050f');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, s, s, s * 0.18);
  ctx.fill();

  // Outer glow ring
  ctx.strokeStyle = '#F72585';
  ctx.lineWidth   = s * 0.025;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.roundRect(s*0.04, s*0.04, s*0.92, s*0.92, s * 0.15);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Crossed swords / arena icon
  const cx = s / 2;
  const cy = s / 2;
  const sw = s * 0.06;   // sword width
  const sl = s * 0.35;   // sword length

  // Draw 2 crossed swords
  function drawSword(angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Blade gradient
    const bladeGrad = ctx.createLinearGradient(-sl, 0, sl, 0);
    bladeGrad.addColorStop(0,   '#4CC9F0');
    bladeGrad.addColorStop(0.5, '#ffffff');
    bladeGrad.addColorStop(1,   '#9B5DE5');
    ctx.fillStyle = bladeGrad;

    // Blade
    ctx.beginPath();
    ctx.moveTo(-sl, -sw * 0.3);
    ctx.lineTo(sl * 0.7, -sw * 0.15);
    ctx.lineTo(sl, 0);
    ctx.lineTo(sl * 0.7, sw * 0.15);
    ctx.lineTo(-sl, sw * 0.3);
    ctx.closePath();
    ctx.fill();

    // Guard
    ctx.fillStyle = '#F72585';
    ctx.fillRect(-sw * 0.3, -sw * 0.9, sw * 0.6, sw * 1.8);

    // Handle
    ctx.fillStyle = '#D4AC0D';
    ctx.fillRect(-sl * 0.05, -sw * 0.35, -sl * 0.38, sw * 0.7);

    // Pommel
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-sl * 0.43, 0, sw * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Glow under swords
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sl * 0.8);
  glow.addColorStop(0,   'rgba(247,37,133,0.25)');
  glow.addColorStop(0.5, 'rgba(76,201,240,0.12)');
  glow.addColorStop(1,   'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, sl * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Draw crossed swords
  drawSword(-Math.PI / 4);
  drawSword(Math.PI / 4);

  // Center diamond
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur  = s * 0.04;
  ctx.beginPath();
  ctx.moveTo(cx,              cy - s * 0.07);
  ctx.lineTo(cx + s * 0.05,  cy);
  ctx.lineTo(cx,              cy + s * 0.07);
  ctx.lineTo(cx - s * 0.05,  cy);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // "AC" text at bottom for larger icons
  if (size >= 128) {
    ctx.font        = `bold ${s * 0.12}px Arial`;
    ctx.textAlign   = 'center';
    ctx.fillStyle   = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.fillText('ARENA CLASH', cx, s * 0.9);
    ctx.globalAlpha = 1;
  }

  return canvas.toBuffer('image/png');
}

// Generate all sizes
SIZES.forEach(size => {
  const buf  = drawIcon(size);
  const file = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`  ✓ icons/icon-${size}.png`);
});

// Also create a simple screenshot placeholder
function drawScreenshot(w, h) {
  const canvas = createCanvas(w, h);
  const ctx    = canvas.getContext('2d');
  const bg     = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#05050f');
  bg.addColorStop(1, '#1a0d2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.font      = `bold ${h * 0.15}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F72585';
  ctx.fillText('ARENA CLASH', w/2, h * 0.45);
  ctx.font      = `${h * 0.07}px Arial`;
  ctx.fillStyle = '#4CC9F0';
  ctx.fillText('3v3 Battle Legends', w/2, h * 0.6);
  return canvas.toBuffer('image/png');
}

fs.writeFileSync(path.join(OUT, 'screenshot-wide.png'), drawScreenshot(1280, 720));
console.log('  ✓ icons/screenshot-wide.png');
console.log('');
console.log('  All icons generated! ✅');
console.log('');
