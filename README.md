# Baahu - Automated Workout Scraper

**Baahu** (Sanskrit/Hindi for "arm" or "strength") is a generic, configurable web scraper that automatically extracts workout images from websites, performs OCR to extract exercise text, and delivers the content via Telegram.

## What It Does

1. **Scrapes Workout Pages** - Navigates to a configured workout webpage and extracts images from a carousel/gallery
2. **OCR Text Extraction** - Converts workout images to text using Tesseract.js or cloud OCR services
3. **Telegram Delivery** - Sends workout images and extracted text to your phone via Telegram bot
4. **Automated Scheduling** - Runs daily via GitHub Actions or other schedulers

## Key Features

- **Generic & Configurable** - Works with any workout website by configuring CSS selectors and patterns
- **Privacy First** - No hardcoded website URLs or business logic in the codebase
- **Environment-Based Config** - All site-specific details in `.env` file (gitignored)
- **Multiple OCR Engines** - Supports Tesseract.js (local) or cloud services (Google Vision, AWS Textract)
- **Flexible Deployment** - GitHub Actions, AWS Lambda, Railway, Render, or any Node.js environment
- **Test-Friendly** - Unit tests with mock HTML fixtures

## Technology Stack

- **Runtime**: Node.js 18+
- **Web Scraping**: Puppeteer (headless Chrome)
- **OCR**: Tesseract.js / Google Cloud Vision / AWS Textract
- **Messaging**: Telegram Bot API
- **Scheduling**: GitHub Actions / AWS EventBridge / cron
- **Testing**: Puppeteer for unit tests

## Project Structure

```
baahu/
├── src/
│   ├── config/          # Environment-based configuration
│   ├── scraper/         # Web scraping logic
│   ├── ocr/             # Text extraction (Tesseract/Cloud)
│   ├── delivery/        # Telegram bot integration
│   └── index.js         # Main workflow orchestrator
├── tests/
│   ├── fixtures/        # Test HTML fixtures (gitignored)
│   └── scraper.test.js  # Unit tests
├── .github/workflows/   # GitHub Actions automation
└── .env.example         # Configuration template
```

## How It Works

```
┌─────────────────┐
│  Workout Page   │
│  (Any Site)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  Puppeteer      │─────>│  Tesseract   │─────>│  Telegram Bot   │
│  Scraper        │      │  OCR         │      │  (Your Phone)   │
└─────────────────┘      └──────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│  JSON Storage   │
│  (Optional)     │
└─────────────────┘
```

## Configuration

All configuration is done via environment variables in `.env` file:

- `GYM_WORKOUT_URL` - Target website URL
- `CAROUSEL_SELECTOR` - CSS selector for image carousel
- `IMAGE_MATCH_STRATEGY` - How to match workout images (`alt-text`, `filename`, `both`)
- `IMAGE_FILENAME_PATTERN` - Regex pattern for image filenames
- `TELEGRAM_BOT_TOKEN` - Telegram bot authentication
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID
- `OCR_ENGINE` - OCR engine to use (`tesseract`, `google-vision`)

See `.env.example` for full configuration options.

## Adaptability

This scraper can work with any workout website by configuring:
- CSS selectors to find the carousel/gallery
- Image filename patterns
- Alt text patterns
- Matching strategies

**Example use cases:**
- Gym weekly workout schedules
- Fitness program calendars
- Training plan updates
- Exercise routine posts

## Security & Privacy

- All sensitive data (URLs, tokens, chat IDs) stored in `.env` (gitignored)
- Test fixtures with real HTML are excluded from Git
- Generic example fixtures provided for reference
- No hardcoded business logic in source code

## Deployment Options

- **GitHub Actions** - Free, serverless, scheduled workflows
- **AWS Lambda** - Serverless with EventBridge scheduling
- **Railway/Render** - Managed platforms with cron support
- **Docker** - Run anywhere containers are supported
- **VPS/EC2** - Traditional cron jobs

## License

MIT

---

## Quick Example

A typical workflow execution:

1. GitHub Actions triggers daily at 6 PM
2. Scraper navigates to workout page
3. Finds the first (newest) carousel using configured selector
4. Extracts Monday's workout image by pattern matching
5. Downloads image (e.g., 500KB)
6. Runs OCR to extract exercise text (90%+ confidence)
7. Sends image + text to Telegram
8. Stores JSON for future use
9. Completes in ~6 seconds

Result: Workout delivered to your phone automatically!
