const puppeteer = require('puppeteer');
const { config } = require('../config/config');

/**
 * Launch a Puppeteer browser instance
 * @returns {Promise<Browser>}
 */
async function launchBrowser() {
  console.log('🌐 Launching browser...');

  const browser = await puppeteer.launch(config.puppeteer);

  console.log('✓ Browser launched successfully');
  return browser;
}

/**
 * Create a new page with common settings
 * @param {Browser} browser
 * @returns {Promise<Page>}
 */
async function createPage(browser) {
  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Set user agent to avoid bot detection
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  return page;
}

/**
 * Close browser instance
 * @param {Browser} browser
 */
async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
    console.log('✓ Browser closed');
  }
}

module.exports = {
  launchBrowser,
  createPage,
  closeBrowser,
};
