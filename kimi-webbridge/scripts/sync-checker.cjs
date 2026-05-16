/**
 * Platform Sync Checker
 * Checks if local files match deployed version
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mindweave.store';
const LOCAL_DIR = '..';

const FILES_TO_CHECK = [
  'index.html',
  'store.html',
  'prompt-lab.html',
  'blog.html',
  'creators.html',
  'login.html',
  'signup.html'
];

async function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function checkFileMatch(page, filename) {
  const localPath = path.join(LOCAL_DIR, filename);
  
  // Get local file info
  let localInfo = { exists: false, size: 0, hash: '' };
  if (fs.existsSync(localPath)) {
    localInfo.exists = true;
    const content = fs.readFileSync(localPath, 'utf8');
    localInfo.size = content.length;
    localInfo.hash = content.substring(0, 100); // First 100 chars as signature
  }
  
  // Get deployed file info
  await page.goto(`${BASE_URL}/${filename}`, { timeout: 10000, waitUntil: 'domcontentloaded' });
  const serverContent = await page.content();
  
  return {
    filename,
    localExists: localInfo.exists,
    localSize: localInfo.size,
    serverSize: serverContent.length,
    match: Math.abs(localInfo.size - serverContent.length) < 100, // Allow small diff
    localHash: localInfo.hash.substring(0, 50),
    serverHash: serverContent.substring(0, 50)
  };
}

async function main() {
  console.log('🔄 Platform Sync Checker');
  console.log('=====================\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  
  const results = [];
  
  for (const file of FILES_TO_CHECK) {
    const result = await checkFileMatch(page, file);
    results.push(result);
    
    if (result.match) {
      log(`✅ ${file} - Synced`);
    } else {
      log(`⚠️ ${file} - MISMATCH (local: ${result.localSize} vs server: ${result.serverSize})`);
    }
  }
  
  await browser.close();
  
  // Summary
  const synced = results.filter(r => r.match).length;
  const total = results.length;
  
  console.log('\n=====================');
  console.log(`Sync Status: ${synced}/${total} files synced`);
  
  if (synced < total) {
    console.log('\n⚠️ Action needed:');
    console.log('Run: git add . && git commit -m "Update files" && git push');
    console.log('Then manually deploy on Render dashboard');
  } else {
    console.log('\n✅ All files in sync!');
  }
  
  // Save report
  fs.writeFileSync('./outputs/sync-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    summary: { synced, total }
  }, null, 2));
  
  return results;
}

if (require.main === module) {
  main().then(console.log).catch(console.error);
}

module.exports = { main };