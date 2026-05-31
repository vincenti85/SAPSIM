const fs = require('fs');
const path = require('path');

// Support both PIN_Number and PIN_NUMBER env var names
const pin = process.env.PIN_Number || process.env.PIN_NUMBER;

if (!pin) {
  console.error('BUILD ERROR: Neither PIN_Number nor PIN_NUMBER environment variable is set in Vercel.');
  console.error('Go to Vercel Dashboard → Settings → Environment Variables and verify the variable name.');
  process.exit(1);
}
if (!/^\d{4}$/.test(pin)) {
  console.error(`BUILD ERROR: PIN value "${pin}" is not a 4-digit number.`);
  process.exit(1);
}

const src = path.join(__dirname, 'sap-ecc-simulator.html');
let html = fs.readFileSync(src, 'utf8');
html = html.replace("'__SAP_PIN__'", `'${pin}'`);

const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sap-ecc-simulator.html'), html);
console.log(`Build complete. PIN injected (${pin.replace(/./g, '*')}).`);
