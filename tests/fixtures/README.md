# Test Fixtures

## Overview

This directory contains test fixtures for the workout scraper. **Actual HTML from workout websites is excluded from Git** for privacy and copyright reasons.

## Files

### Excluded from Git (.gitignore)
- `workoutDiv.html` - Actual carousel HTML extracted from workout page
- `mock-workout-page.html` - Full page HTML with actual data
- `*.local.html` - Any local test files

### Included in Git
- `generic-carousel.html` - Generic carousel structure for documentation
- `README.md` - This file

## Expected HTML Structure

The scraper expects a page with the following structure:

### Carousel Container
```html
<div data-widget_type="CONFIGURED_VALUE">
  <!-- Carousel wrapper -->
  <div class="carousel-wrapper">
    <!-- Image slides -->
    <div class="slide">
      <img src="path/to/image.png" alt="descriptive text">
    </div>
    <!-- More slides... -->
  </div>
</div>
```

### Configuration

The actual selectors and patterns are configured via environment variables:

- `CAROUSEL_SELECTOR` - CSS selector for carousel container (e.g., `[data-widget_type="image-carousel.default"]`)
- `IMAGE_MATCH_STRATEGY` - How to match images: `alt-text`, `filename`, or `both`
- `IMAGE_FILENAME_PATTERN` - Regex pattern for image filenames (use `{DAY}` placeholder)
- `IMAGE_ALT_PATTERN` - Pattern for alt text matching (use `{DAY}` placeholder)

### Example Patterns

If your workout images are named like:
- `1-Cover-Week2.png`
- `2-Monday-Week2.png`
- `3-Tuesday-Week2.png`

Your config would be:
```env
IMAGE_FILENAME_PATTERN=(\d+)-({DAY})-Week(\d+)\.png
IMAGE_ALT_PATTERN={DAY}
IMAGE_MATCH_STRATEGY=both
```

## Creating Local Test Fixtures

1. Save actual HTML from your workout page to `tests/fixtures/workoutDiv.html`
2. This file is gitignored and stays local only
3. Run tests with: `npm test`

## Generic Test Fixture

See `generic-carousel.html` for a sanitized example structure that can be committed to Git.
