require('dotenv').config();

const config = {
  // Gym workout page URL
  gymWorkoutUrl: process.env.GYM_WORKOUT_URL,

  // Telegram configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },

  // OCR engine selection
  ocrEngine: process.env.OCR_ENGINE || 'tesseract',

  // Google Cloud Vision API (optional)
  googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,

  // Timezone for date calculations
  timezone: process.env.TIMEZONE || 'America/Los_Angeles',

  // Debug mode
  debug: process.env.DEBUG === 'true',

  // Puppeteer configuration
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },

  // Scraping configuration
  scraping: {
    carouselSelector: process.env.CAROUSEL_SELECTOR || '.workout-carousel',
    imageMatchStrategy: process.env.IMAGE_MATCH_STRATEGY || 'both',
    imageFilenamePattern: process.env.IMAGE_FILENAME_PATTERN || '({DAY})',
    imageAltPattern: process.env.IMAGE_ALT_PATTERN || '{DAY}',
  },
};

// Validation
function validateConfig() {
  const errors = [];

  if (!config.telegram.botToken) {
    errors.push('TELEGRAM_BOT_TOKEN is required');
  }

  if (!config.telegram.chatId) {
    errors.push('TELEGRAM_CHAT_ID is required');
  }

  if (!config.gymWorkoutUrl) {
    errors.push('GYM_WORKOUT_URL is required');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease create a .env file based on .env.example');
    process.exit(1);
  }
}

module.exports = { config, validateConfig };
