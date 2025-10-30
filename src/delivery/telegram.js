const TelegramBot = require('node-telegram-bot-api');
const { config } = require('../config/config');

let bot;

/**
 * Initialize Telegram bot
 * @returns {TelegramBot}
 */
function initBot() {
  if (!bot) {
    bot = new TelegramBot(config.telegram.botToken, { polling: false });
    console.log('✓ Telegram bot initialized');
  }
  return bot;
}

/**
 * Send workout image with caption to Telegram
 * @param {Buffer} imageBuffer
 * @param {string} caption
 * @returns {Promise<void>}
 */
async function sendWorkoutImage(imageBuffer, caption) {
  try {
    console.log('📤 Sending workout image to Telegram...');

    const telegramBot = initBot();
    const chatId = config.telegram.chatId;

    // Send photo with caption (no parse_mode = plain text)
    await telegramBot.sendPhoto(chatId, imageBuffer, {
      caption: caption,
    });

    console.log('✓ Image sent successfully to Telegram');

  } catch (error) {
    console.error('❌ Failed to send image to Telegram:', error.message);
    throw error;
  }
}

/**
 * Send text message to Telegram
 * @param {string} message
 * @returns {Promise<void>}
 */
async function sendMessage(message) {
  try {
    console.log('📤 Sending message to Telegram...');

    const telegramBot = initBot();
    const chatId = config.telegram.chatId;

    // Send as plain text (no parse_mode to avoid special character issues)
    await telegramBot.sendMessage(chatId, message);

    console.log('✓ Message sent successfully');

  } catch (error) {
    console.error('❌ Failed to send message to Telegram:', error.message);
    throw error;
  }
}

/**
 * Send error notification to Telegram
 * @param {Error} error
 * @param {string} context
 * @returns {Promise<void>}
 */
async function sendErrorNotification(error, context = 'Unknown') {
  try {
    const message = `🚨 Scraper Error\n\n` +
      `Context: ${context}\n` +
      `Error: ${error.message}\n\n` +
      `Time: ${new Date().toLocaleString()}`;

    await sendMessage(message);

  } catch (err) {
    console.error('❌ Failed to send error notification:', err.message);
  }
}

/**
 * Format workout data as Telegram caption
 * @param {Object} workoutData
 * @returns {string}
 */
function formatWorkoutCaption(workoutData) {
  const { dayName, date, confidence, textPreview } = workoutData;

  let caption = `💪 ${dayName} Workout\n`;
  caption += `📅 ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

  if (confidence) {
    caption += `🔍 OCR Confidence: ${confidence.toFixed(1)}%\n\n`;
  }

  if (textPreview) {
    const preview = textPreview.substring(0, 200);
    caption += `Preview:\n${preview}${textPreview.length > 200 ? '...' : ''}`;
  }

  return caption;
}

/**
 * Send complete workout notification (image + text)
 * @param {Buffer} imageBuffer
 * @param {Object} workoutData
 * @returns {Promise<void>}
 */
async function sendWorkoutNotification(imageBuffer, workoutData) {
  try {
    console.log('📬 Sending workout notification to Telegram...');

    // Format caption
    const caption = formatWorkoutCaption(workoutData);

    if (workoutData.fullText) {
      console.log('📤 Sending full text as separate message...');
      const textMessage = `Full Workout Text:\n\n${workoutData.fullText}`;
      await sendMessage(textMessage);
      console.log('✓ Workout notification sent successfully');
    } else {
      console.log('✓ Workout content empty');
    }

  } catch (error) {
    console.error('❌ Failed to send workout notification:', error.message);
    throw error;
  }
}

module.exports = {
  sendErrorNotification,
  sendWorkoutNotification,
};
