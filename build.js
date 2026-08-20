const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'erp-simulator.html');
const html = fs.readFileSync(src, 'utf8');

const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'erp-simulator.html'), html);

const staticFiles = ['accessible-patterns.html'];
for (const file of staticFiles) {
  const srcFile = path.join(__dirname, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(outDir, file));
    console.log(`Copied ${file}`);
  }
}

console.log('Build complete.');
