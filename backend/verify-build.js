const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'dist', 'main.js');

if (!fs.existsSync(mainPath)) {
  console.error('❌ ERROR: dist/main.js was not created by nest build!');
  console.error('Current directory:', __dirname);
  console.error('Looking for:', mainPath);
  
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.error('dist directory exists. Contents:');
    try {
      const files = fs.readdirSync(distPath);
      console.error('Files:', files);
    } catch (e) {
      console.error('Could not read dist directory:', e.message);
    }
  } else {
    console.error('dist directory does not exist!');
  }
  
  process.exit(1);
}

console.log('✅ Verified: dist/main.js exists at', mainPath);

