const fs = require('fs');
const path = require('path');

const pin = process.env.PIN_NUMBER;
if (!pin || !/^\d{4}$/.test(pin)) {
  console.error('ERROR: PIN_NUMBER environment variable must be a 4-digit number.');
  process.exit(1);
}

const src = path.join(__dirname, 'sap-ecc-simulator.html');
let html = fs.readFileSync(src, 'utf8');
html = html.replace("'__SAP_PIN__'", `'${pin}'`);

const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sap-ecc-simulator.html'), html);
console.log('Build complete. PIN injected successfully.');
