const { launchBrowser, createPage, closeBrowser } = require('./browser');
const { config } = require('../config/config');
const axios = require('axios');

/**
 * Get tomorrow's day name (since we scrape at 6PM for next day)
 * @returns {string} Day name (e.g., "Monday")
 */
function getTomorrowDayName() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[tomorrow.getDay()];

  console.log(`📅 Target day: ${dayName} (${tomorrow.toLocaleDateString()})`);
  return dayName;
}

/**
 * Scrape workout image for a specific day
 * @param {string|null} targetDay - Optional: specific day to scrape (for testing)
 * @returns {Promise<{imageBuffer: Buffer, dayName: string, imageUrl: string, date: string}>}
 */
async function scrapeWorkoutImage(targetDay = null) {
  let browser;

  try {
    // Determine which day to scrape
    const dayName = targetDay || getTomorrowDayName();

    if (targetDay) {
      console.log(`📅 Target day (manual): ${dayName}`);
    }

    // Launch browser
    browser = await launchBrowser();
    const page = await createPage(browser);

    console.log(`🔍 Navigating to ${config.gymWorkoutUrl}...`);

    // Navigate to workout page
    await page.goto(config.gymWorkoutUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✓ Page loaded successfully');

    // Find the FIRST (newest) workout carousel
    console.log('🔍 Looking for workout carousel...');
    const carouselSelector = config.scraping.carouselSelector;

    await page.waitForSelector(carouselSelector, { timeout: 10000 });
    console.log('✓ Found workout carousel');

    // Get all images from the first carousel and find the one matching target day
    console.log(`🔍 Looking for ${dayName} workout image in carousel...`);

    // Prepare matching patterns
    const altPattern = config.scraping.imageAltPattern.replace('{DAY}', dayName);
    const filenamePattern = config.scraping.imageFilenamePattern.replace('{DAY}', dayName);
    const matchStrategy = config.scraping.imageMatchStrategy;

    const result = await page.evaluate((selector, targetDay, altPattern, filenamePattern, matchStrategy, debug) => {
      const carousel = document.querySelector(selector);
      if (!carousel) {
        throw new Error('Carousel not found');
      }

      const images = carousel.querySelectorAll('img');
      const allImages = [];

      // Find image by configured strategy
      for (const img of images) {
        const alt = img.alt || '';
        const src = img.src || '';
        const filename = src.split('/').pop();

        allImages.push({ alt, src: filename }); // Collect for debug

        let matchesAlt = false;
        let matchesFilename = false;

        // Check alt text match
        if (matchStrategy === 'alt-text' || matchStrategy === 'both') {
          matchesAlt = alt.includes(altPattern);
        }

        // Check filename match
        if (matchStrategy === 'filename' || matchStrategy === 'both') {
          const regex = new RegExp(filenamePattern);
          matchesFilename = regex.test(filename);
        }

        // Return if matched based on strategy
        if ((matchStrategy === 'both' && (matchesAlt || matchesFilename)) ||
            (matchStrategy === 'alt-text' && matchesAlt) ||
            (matchStrategy === 'filename' && matchesFilename)) {
          return { imageUrl: img.src, allImages };
        }
      }

      return { imageUrl: null, allImages };
    }, carouselSelector, dayName, altPattern, filenamePattern, matchStrategy, config.debug);

    if (config.debug) {
      console.log('\n--- Available images in carousel ---');
      result.allImages.forEach(img => {
        console.log(`  Alt: "${img.alt}" | File: ${img.src}`);
      });
      console.log('---\n');
    }

    if (!result.imageUrl) {
      throw new Error(`No image found for ${dayName} in carousel`);
    }

    const imageUrl = result.imageUrl;
    console.log(`✓ Found image: ${imageUrl}`);

    // Close browser before downloading (we're done scraping)
    await closeBrowser(browser);
    browser = null;

    // Download image as buffer using axios
    console.log('📥 Downloading image...');
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const imageBuffer = Buffer.from(response.data);
    console.log(`✓ Image downloaded (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

    // Get current date for metadata
    const date = new Date().toISOString().split('T')[0];

    return {
      imageBuffer,
      dayName,
      imageUrl,
      date,
    };

  } catch (error) {
    console.error('❌ Error scraping workout image:', error.message);

    if (browser) {
      await closeBrowser(browser);
    }

    throw error;
  }
}

module.exports = {
  scrapeWorkoutImage,
};
