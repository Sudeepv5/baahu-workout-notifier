/**
 * Unit test for workout scraper using mock HTML fixture
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const MOCK_PAGE_PATH = path.join(__dirname, 'fixtures', 'mock-workout-page.html');
const MOCK_PAGE_URL = `file://${MOCK_PAGE_PATH}`;

/**
 * Test the carousel selector and image extraction logic
 */
async function testCarouselSelection() {
  console.log('🧪 Test 1: Carousel Selection');
  console.log('   Testing that first carousel is selected (not old ones)\n');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MOCK_PAGE_URL, { waitUntil: 'domcontentloaded' });

  // Get first carousel
  const result = await page.evaluate(() => {
    const carousels = document.querySelectorAll('[data-widget_type="image-carousel.default"]');
    const firstCarousel = document.querySelector('[data-widget_type="image-carousel.default"]');

    const firstImage = firstCarousel.querySelector('img');

    return {
      totalCarousels: carousels.length,
      firstImageSrc: firstImage.src,
    };
  });

  await browser.close();

  console.log(`   Found ${result.totalCarousels} carousel(s)`);
  console.log(`   First carousel first image: ${result.firstImageSrc.split('/').slice(-2).join('/')}`);

  if (result.totalCarousels === 2) {
    console.log('   ✅ PASS: Found expected number of carousels\n');
  } else {
    console.log(`   ❌ FAIL: Expected 2 carousels, found ${result.totalCarousels}\n`);
    return false;
  }

  if (result.firstImageSrc.includes('2025/10')) {
    console.log('   ✅ PASS: First carousel is from 2025/10 (newest)\n');
  } else {
    console.log('   ❌ FAIL: First carousel should be from 2025/10\n');
    return false;
  }

  return true;
}

/**
 * Test extracting specific day images
 */
async function testDayExtraction() {
  console.log('🧪 Test 2: Day Image Extraction');
  console.log('   Testing extraction of specific day images\n');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MOCK_PAGE_URL, { waitUntil: 'domcontentloaded' });

  const testDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let allPassed = true;

  for (const day of testDays) {
    const result = await page.evaluate((targetDay) => {
      const carousel = document.querySelector('[data-widget_type="image-carousel.default"]');
      const images = carousel.querySelectorAll('img');

      for (const img of images) {
        const alt = img.alt || '';
        const src = img.src || '';

        if (alt.includes(targetDay) || src.includes(`-${targetDay}-`)) {
          return {
            found: true,
            imageUrl: img.src,
            alt: img.alt,
          };
        }
      }

      return { found: false };
    }, day);

    if (result.found) {
      const filename = result.imageUrl.split('/').pop();
      const expectedPattern = new RegExp(`\\d+-${day}-\\d+\\.png`);

      if (expectedPattern.test(filename)) {
        console.log(`   ✅ ${day.padEnd(10)} → ${filename}`);
      } else {
        console.log(`   ❌ ${day.padEnd(10)} → ${filename} (doesn't match pattern)`);
        allPassed = false;
      }
    } else {
      console.log(`   ❌ ${day.padEnd(10)} → NOT FOUND`);
      allPassed = false;
    }
  }

  await browser.close();

  console.log();
  return allPassed;
}

/**
 * Test that Cover image is NOT matched for day queries
 */
async function testCoverNotMatched() {
  console.log('🧪 Test 3: Cover Image Not Matched');
  console.log('   Testing that Cover image is not matched for day queries\n');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MOCK_PAGE_URL, { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const carousel = document.querySelector('[data-widget_type="image-carousel.default"]');
    const images = carousel.querySelectorAll('img');

    const allImages = [];
    for (const img of images) {
      allImages.push({
        src: img.src.split('/').pop(),
        alt: img.alt,
      });
    }

    // Try to match "Cover" as a day (should fail)
    let foundCover = null;
    for (const img of images) {
      if (img.alt.includes('Monday') || img.src.includes('-Monday-')) {
        foundCover = img.src.split('/').pop();
        break;
      }
    }

    return {
      allImages,
      mondayFound: foundCover,
    };
  });

  await browser.close();

  console.log('   Images in carousel:');
  result.allImages.forEach(img => {
    console.log(`     - ${img.src} (alt: "${img.alt}")`);
  });

  console.log();

  if (result.mondayFound === '2-Monday-2.png') {
    console.log('   ✅ PASS: Monday correctly matched (not Cover)\n');
    return true;
  } else {
    console.log(`   ❌ FAIL: Monday match was: ${result.mondayFound}\n`);
    return false;
  }
}

/**
 * Test filename pattern matching
 */
async function testFilenamePattern() {
  console.log('🧪 Test 4: Filename Pattern Validation');
  console.log('   Testing that all images match {num}-{Day}-{week}.png pattern\n');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MOCK_PAGE_URL, { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const carousel = document.querySelector('[data-widget_type="image-carousel.default"]');
    const images = carousel.querySelectorAll('img');

    const pattern = /(\d+)-(Cover|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)-(\d+)\.png$/;

    const results = [];
    for (const img of images) {
      const filename = img.src.split('/').pop();
      const match = filename.match(pattern);

      results.push({
        filename,
        matches: !!match,
        position: match ? match[1] : null,
        day: match ? match[2] : null,
        week: match ? match[3] : null,
      });
    }

    return results;
  });

  await browser.close();

  let allPassed = true;

  result.forEach(img => {
    if (img.matches) {
      console.log(`   ✅ ${img.filename.padEnd(20)} → pos:${img.position}, day:${img.day}, week:${img.week}`);
    } else {
      console.log(`   ❌ ${img.filename.padEnd(20)} → PATTERN MISMATCH`);
      allPassed = false;
    }
  });

  console.log();
  return allPassed;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         Baahu Workout Scraper Unit Tests              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check if mock page exists
  if (!fs.existsSync(MOCK_PAGE_PATH)) {
    console.error(`❌ Mock page not found at: ${MOCK_PAGE_PATH}`);
    process.exit(1);
  }

  console.log(`📄 Using mock page: ${path.basename(MOCK_PAGE_PATH)}\n`);
  console.log('─'.repeat(60) + '\n');

  const results = [];

  try {
    results.push(await testCarouselSelection());
    console.log('─'.repeat(60) + '\n');

    results.push(await testDayExtraction());
    console.log('─'.repeat(60) + '\n');

    results.push(await testCoverNotMatched());
    console.log('─'.repeat(60) + '\n');

    results.push(await testFilenamePattern());
    console.log('─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    process.exit(1);
  }

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`   Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n   ✅ ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log(`\n   ❌ ${total - passed} TEST(S) FAILED\n`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
