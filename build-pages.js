/**
 * build-pages.js
 * 
 * Cloudflare Pages Build Script for BitHuB.
 * 
 * Steps:
 * 1. Runs `generate-env.js` to create `bit-mesra/env-config.js` from process.env / .env.local
 * 2. Creates a clean `dist/` deployment directory
 * 3. Copies production files:
 *    - Root HTML files (index.html, HungryBirds.html)
 *    - Static directories (assets, bit-mesra, bit-jaipur)
 *    - Cloudflare configuration files (_redirects, _headers)
 * 4. Excludes development/reference directories (`ref/`, `bit-jaipur-src/`, `BitHuB Jaipur/`)
 * 5. Verifies all assets conform to Cloudflare Pages' 25 MiB single-file limit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CLOUDFLARE_MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MiB

console.log('🚀 [Cloudflare Pages Build] Starting BitHuB build pipeline...');

// Step 1: Run generate-env.js to generate bit-mesra/env-config.js
console.log('⚙️  Step 1: Generating runtime environment configuration...');
try {
  execSync(`node "${path.join(ROOT_DIR, 'generate-env.js')}"`, { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Failed to execute generate-env.js:', err.message);
  process.exit(1);
}

// Step 2: Clean and recreate dist/ directory
console.log('🧹 Step 2: Preparing clean dist/ output directory...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Step 3: Copy required production items
const itemsToCopy = [
  'index.html',
  'HungryBirds.html',
  'assets',
  'bit-mesra',
  'bit-jaipur',
  '_redirects',
  '_headers'
];

console.log('📦 Step 3: Copying production web assets to dist/...');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const item of itemsToCopy) {
  const srcPath = path.join(ROOT_DIR, item);
  const destPath = path.join(DIST_DIR, item);

  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`   ✓ Copied ${item}`);
  } else {
    console.warn(`   ⚠️ Warning: Source item not found: ${item}`);
  }
}

// Step 4: Asset Size Verification against Cloudflare Pages 25 MiB limit
console.log('🔍 Step 4: Verifying file sizes against Cloudflare Pages 25 MiB limit...');
const oversizedFiles = [];

function checkFileSizes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkFileSizes(fullPath);
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      if (stats.size > CLOUDFLARE_MAX_FILE_BYTES) {
        const rel = path.relative(DIST_DIR, fullPath);
        oversizedFiles.push({
          path: rel,
          sizeMb: (stats.size / (1024 * 1024)).toFixed(2)
        });
      }
    }
  }
}

checkFileSizes(DIST_DIR);

if (oversizedFiles.length > 0) {
  console.error('\n⚠️ [CLOUDFLARE PAGES WARNING] The following files exceed the 25 MiB limit:');
  for (const file of oversizedFiles) {
    console.error(`   - ${file.path} (${file.sizeMb} MB)`);
  }
  console.error('\nCloudflare Pages will reject assets larger than 25 MiB.');
  console.error('Please compress these files (e.g. using compress-pdfs.py) or host them on Cloudflare R2 / external storage.\n');
} else {
  console.log('   ✓ All files in dist/ are within the 25 MiB Cloudflare Pages limit.');
}

console.log('\n🎉 [Cloudflare Pages Build] Completed successfully! Output directory: dist/');
