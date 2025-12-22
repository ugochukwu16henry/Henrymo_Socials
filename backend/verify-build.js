const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'dist', 'main.js');
const distPath = path.join(__dirname, 'dist');

console.log('🔍 Verifying build output...');
console.log('Current directory:', __dirname);
console.log('Looking for main.js at:', mainPath);
console.log('Dist directory:', distPath);

if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: dist directory does not exist!');
  process.exit(1);
}

// List all files recursively in dist
function listFiles(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      console.log(prefix + item + '/');
      listFiles(fullPath, prefix + '  ');
    } else {
      console.log(prefix + item);
    }
  }
}

console.log('\n📁 Contents of dist directory:');
listFiles(distPath);

if (!fs.existsSync(mainPath)) {
  console.error('\n❌ ERROR: dist/main.js was not created by nest build!');
  console.error('The build completed but main.js is missing.');
  process.exit(1);
}

console.log('\n✅ Verified: dist/main.js exists at', mainPath);
const stats = fs.statSync(mainPath);
console.log('File size:', stats.size, 'bytes');

