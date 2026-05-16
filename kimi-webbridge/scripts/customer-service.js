/**
 * Customer Service Automation Script
 * Handle customer inquiries on mindweave-platform
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

async function handleCustomerService() {
  const mode = params.mode || 'inquiry';
  const email = params.email || '';
  
  console.log(`Customer service: ${mode}`);
  
  const browser = await chromium.launch({ 
    headless: config.headless || false,
    channel: config.browser || 'chrome'
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(config.adminUrl + '/customer-service', { timeout: config.timeout });
    await page.waitForLoadState('networkidle');
    
    if (email) {
      await page.fill('[data-testid="search-input"]', email);
      await page.press('[data-testid="search-input"]', 'Enter');
      await page.waitForSelector('[data-testid="customer-result"]');
    }
    
    console.log('✅ Customer service task completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  handleCustomerService();
}

module.exports = { handleCustomerService };