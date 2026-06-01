const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const vercelOutputDir = path.join(projectRoot, '.vercel/output');
const staticDir = path.join(vercelOutputDir, 'static');

console.log('--- Creating Vercel Prebuilt Structure ---');

// 1. Clean existing output
if (fs.existsSync(vercelOutputDir)) {
  fs.rmSync(vercelOutputDir, { recursive: true, force: true });
}

// 2. Create static structure
fs.mkdirSync(staticDir, { recursive: true });

// 3. Copy dist/ assets to static/
function copyDir(src, dest) {
  const baseName = path.basename(src);
  // Exclude massive static assets served from Supabase CDN
  if ([
    'math_crops', 
    'math_hints', 
    'premium_lectures', 
    'teachers', 
    'mteachers', 
    'hteachers', 
    'audio'
  ].includes(baseName)) {
    console.log(`Skipping massive directory: ${baseName}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(distDir, staticDir);
console.log('Copied dist/ to .vercel/output/static/');

// 4. Create config.json
const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};
fs.writeFileSync(path.join(vercelOutputDir, 'config.json'), JSON.stringify(config, null, 2));
console.log('Created config.json');
