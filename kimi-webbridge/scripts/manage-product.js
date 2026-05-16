/**
 * Product Management Automation Script
 * Create, update, delete products on mindweave-platform
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

async function manageProduct() {
  const action = params.action || 'create';
  const productId = params.id;
  const name = params.name || 'New Product';
  const price = parseFloat(params.price || 99);
  
  console.log(`${action} product: ${name}`);
  
  const browser = await chromium.launch({ 
    headless: config.headless || false,
    channel: config.browser || 'chrome'
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(config.adminUrl, { timeout: config.timeout });
    await page.waitForLoadState('networkidle');
    
    if (action === 'create') {
      await page.click('[data-testid="products-menu"]');
      await page.waitForTimeout(config.defaultDelay);
      await page.click('[data-testid="new-product-btn"]');
      await page.fill('[data-testid="product-name-input"]', name);
      await page.fill('[data-testid="product-price-input"]', price.toString());
      await page.click('[data-testid="save-product-btn"]');
      console.log(`✅ Product "${name}" created!`);
    } else if (action === 'update' && productId) {
      await page.goto(`${config.adminUrl}/products/${productId}/edit`);
      await page.fill('[data-testid="product-price-input"]', price.toString());
      await page.click('[data-testid="save-product-btn"]');
      console.log(`✅ Product ${productId} updated!`);
    } else if (action === 'delete' && productId) {
      await page.goto(`${config.adminUrl}/products/${productId}/edit`);
      await page.click('[data-testid="delete-product-btn"]');
      await page.click('[data-testid="confirm-delete-btn"]');
      console.log(`✅ Product ${productId} deleted!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  manageProduct();
}

module.exports = { manageProduct };