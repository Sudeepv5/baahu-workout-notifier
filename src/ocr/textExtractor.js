const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { config } = require('../config/config');

/**
 * Preprocess image to improve OCR accuracy
 * @param {Buffer} imageBuffer
 * @returns {Promise<Buffer>}
 */
async function preprocessImage(imageBuffer) {
  console.log('🔧 Preprocessing image for better OCR...');

  try {
    // Convert to grayscale, enhance contrast, and sharpen
    const processedBuffer = await sharp(imageBuffer)
      .grayscale()
      .normalize() // Auto-adjust contrast
      .sharpen()
      .toBuffer();

    console.log('✓ Image preprocessed');
    return processedBuffer;

  } catch (error) {
    console.warn('⚠️  Image preprocessing failed, using original image:', error.message);
    return imageBuffer;
  }
}

/**
 * Extract text from image using Tesseract.js
 * @param {Buffer} imageBuffer
 * @returns {Promise<{text: string, confidence: number}>}
 */
async function extractTextWithTesseract(imageBuffer) {
  console.log('🔍 Starting OCR with Tesseract.js...');

  try {
    // Preprocess image
    const processedBuffer = await preprocessImage(imageBuffer);

    // Run Tesseract OCR
    const result = await Tesseract.recognize(
      processedBuffer,
      'eng',
      {
        logger: info => {
          if (config.debug && info.status === 'recognizing text') {
            console.log(`  Progress: ${(info.progress * 100).toFixed(1)}%`);
          }
        },
      }
    );

    const { text, confidence } = result.data;

    console.log(`✓ OCR completed (confidence: ${confidence.toFixed(2)}%)`);
    console.log(`✓ Extracted ${text.length} characters`);

    return {
      text: text.trim(),
      confidence,
    };

  } catch (error) {
    console.error('❌ Tesseract OCR failed:', error.message);
    throw error;
  }
}

/**
 * Main function to extract text from workout image
 * @param {Buffer} imageBuffer
 * @returns {Promise<{text: string, confidence: number, engine: string}>}
 */
async function extractText(imageBuffer) {
  console.log('📝 Extracting text from workout image...');

  const engine = config.ocrEngine;

  try {
    let result;

    if (engine === 'tesseract') {
      result = await extractTextWithTesseract(imageBuffer);
      result.engine = 'tesseract';
    } else {
      throw new Error(`Unsupported OCR engine: ${engine}`);
    }

    // Log preview of extracted text
    if (config.debug) {
      console.log('\n--- Extracted Text Preview ---');
      console.log(result.text.substring(0, 200));
      console.log('---\n');
    }

    return result;

  } catch (error) {
    console.error('❌ Text extraction failed:', error.message);
    throw error;
  }
}

/**
 * Clean and format extracted text
 * @param {string} rawText
 * @returns {string}
 */
function cleanText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = {
  extractText,
  cleanText,
};
