/**
 * Content Creation Automation Script
 * Creates blog posts and content on mindweave-platform
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const args = process.argv.slice(2);
const params = {};
args.forEach((arg, i) => {
  if (arg.startsWith('--') && args[i + 1] && !args[i + 1].startsWith('--')) {
    params[arg.replace('--', '')] = args[i + 1];
  }
});

async function createContent() {
  const type = params.type || 'blog';
  const title = params.title || 'Untitled';
  const keywords = (params.keywords || '').split(',').filter(k => k.trim());
  
  console.log(`Creating ${type}: ${title}`);
  
  const browser = await chromium.launch({ 
    headless: config.headless || false,
    channel: config.browser || 'chrome'
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(config.adminUrl, { timeout: config.timeout });
    await page.waitForLoadState('networkidle');
    
    if (config.screenshotOnStep) {
      await page.screenshot({ path: path.join(config.screenshotDir, '01-admin.png') });
    }
    
    console.log('✅ Content creation started');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  createContent();
}

module.exports = { createContent };