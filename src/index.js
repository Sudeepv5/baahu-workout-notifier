const { config, validateConfig } = require('./config/config');
const { scrapeWorkoutImage } = require('./scraper/scraper');
const { extractText, cleanText } = require('./ocr/textExtractor');
const { sendWorkoutNotification, sendErrorNotification } = require('./delivery/telegram');

/**
 * Main workflow: Scrape → OCR → Send to Telegram
 */
async function main() {
  console.log('\n🏋️  Baahu Workout Scraper Starting...\n');
  console.log('='.repeat(50));

  const startTime = Date.now();

  try {
    // Validate configuration
    validateConfig();

    // Get target day from command line args (for testing)
    const targetDay = process.argv[2] || null;

    if (targetDay) {
      console.log(`🎯 Manual mode: Scraping ${targetDay}'s workout\n`);
    } else {
      console.log('⏰ Automatic mode: Scraping tomorrow\'s workout\n');
    }

    // Step 1: Scrape workout image
    console.log('📥 Step 1/3: Scraping workout image...');
    const { imageBuffer, dayName, imageUrl, date } = await scrapeWorkoutImage(targetDay);

    console.log('\n' + '-'.repeat(50));

    // Step 2: Extract text via OCR
    console.log('\n📝 Step 2/3: Extracting text from image...');
    const { text, confidence } = await extractText(imageBuffer);
    const cleanedText = cleanText(text);

    console.log('\n' + '-'.repeat(50));

    // Step 3: Send to Telegram
    console.log('\n📬 Step 3/3: Sending to Telegram...');

    const workoutData = {
      dayName,
      date,
      confidence,
      textPreview: cleanedText.substring(0, 300),
      fullText: cleanedText,
      imageUrl,
    };

    await sendWorkoutNotification(imageBuffer, workoutData);

    // Success summary
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Workflow completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   • Day: ${dayName}`);
    console.log(`   • Image: ${imageUrl}`);
    console.log(`   • OCR Confidence: ${confidence.toFixed(2)}%`);
    console.log(`   • Text Length: ${cleanedText.length} characters`);
    console.log(`   • Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log('\n' + '='.repeat(50) + '\n');

    // Print extracted text for verification
    if (config.debug || process.env.PRINT_TEXT === 'true') {
      console.log('\n📄 Extracted Text:');
      console.log('-'.repeat(50));
      console.log(cleanedText);
      console.log('-'.repeat(50) + '\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Workflow failed!\n');
    console.error('Error:', error.message);

    if (config.debug) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    // Send error notification to Telegram
    // try {
    //   await sendErrorNotification(error, 'Workout Scraper');
    // } catch (notifyError) {
    //   console.error('Failed to send error notification:', notifyError.message);
    // }

    console.log('\n' + '='.repeat(50) + '\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
