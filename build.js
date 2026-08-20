const fs = require('fs');
const path = require('path');

// PIN is optional — default '0000' for open-access self-directed learning
const pin = process.env.PIN_Number || process.env.PIN_NUMBER || '0000';

if (!/^\d{4}$/.test(pin)) {
  console.error(`BUILD ERROR: PIN value "${pin}" is not a 4-digit number.`);
  process.exit(1);
}

const src = path.join(__dirname, 'erp-simulator.html');
let html = fs.readFileSync(src, 'utf8');
html = html.replace("'__APP_PIN__'", `'${pin}'`);

const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'erp-simulator.html'), html);

// Copy static files that need no transformation
const staticFiles = ['accessible-patterns.html'];
for (const file of staticFiles) {
  const srcFile = path.join(__dirname, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(outDir, file));
    console.log(`Copied ${file}`);
  }
}

console.log(`Build complete. PIN injected (${pin.replace(/./g, '*')}).`);
