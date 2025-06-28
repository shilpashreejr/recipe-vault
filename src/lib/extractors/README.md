# Recipe Extractors

This directory contains the web scraping system for extracting recipe data from various sources.

## Overview

The extractors system provides:
- **General web scraping** for any recipe website
- **Specialized scrapers** for Instagram and food blogs
- **Rate limiting** to be respectful to websites
- **Error handling** with retry logic
- **Robots.txt compliance** to follow website rules
- **Manual extraction fallback** when automated extraction fails

## Components

### 1. WebScraper (General)
The main scraper for extracting recipes from any website.

```typescript
import { WebScraper } from '@/lib/extractors';

const scraper = new WebScraper();
const recipe = await scraper.scrapeRecipe('https://example.com/recipe');
await scraper.close();
```

### 2. InstagramScraper
Specialized scraper for Instagram posts and reels.

```typescript
import { InstagramScraper } from '@/lib/extractors';

const scraper = new InstagramScraper();
const recipe = await scraper.scrapeInstagramRecipe('https://instagram.com/p/...', {
  extractComments: true
});
await scraper.close();
```

### 3. FoodBlogScraper
Specialized scraper for food blogs with platform detection.

```typescript
import { FoodBlogScraper } from '@/lib/extractors';

const scraper = new FoodBlogScraper();
const recipe = await scraper.scrapeFoodBlogRecipe('https://foodblog.com/recipe', {
  extractAuthor: true,
  extractTags: true
});
await scraper.close();
```

### 4. Rate Limiting
Prevent overwhelming websites with requests.

```typescript
import { RateLimiter, RateLimitPresets } from '@/lib/extractors';

const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
await rateLimiter.waitForPermission();
// Make your request here
```

### 5. Error Handling
Handle and categorize scraping errors.

```typescript
import { ScrapingErrorHandler, ScrapingErrorType } from '@/lib/extractors';

try {
  // Scraping code
} catch (error) {
  const scrapingError = ScrapingErrorHandler.parseError(error, url);
  if (ScrapingErrorHandler.shouldRetry(scrapingError, attemptCount)) {
    const delay = ScrapingErrorHandler.getRetryDelay(scrapingError, attemptCount);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### 6. Robots.txt Compliance
Check if scraping is allowed before making requests.

```typescript
import { RobotsTxtChecker } from '@/lib/extractors';

const checker = new RobotsTxtChecker();
const result = await checker.checkRobotsTxt('https://example.com/recipe');
if (!result.allowed) {
  throw new Error(result.reason);
}
```

### 7. Manual Extraction
Fallback option for manual recipe entry.

```typescript
import { ManualExtractor } from '@/lib/extractors';

const input = {
  title: 'Chocolate Chip Cookies',
  ingredients: ['2 cups flour', '1 cup sugar'],
  instructions: ['Mix ingredients', 'Bake at 350F']
};

const validation = ManualExtractor.validateInput(input);
if (validation.isValid) {
  const recipe = ManualExtractor.createRecipe(input);
}
```

## Usage Examples

### Basic Recipe Extraction
```typescript
import { WebScraper, RateLimiter, RateLimitPresets } from '@/lib/extractors';

async function extractRecipe(url: string) {
  const scraper = new WebScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
  
  try {
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeRecipe(url);
    return recipe;
  } finally {
    await scraper.close();
  }
}
```

### Instagram Recipe Extraction
```typescript
import { InstagramScraper, RateLimiter, RateLimitPresets } from '@/lib/extractors';

async function extractInstagramRecipe(url: string) {
  const scraper = new InstagramScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.instagram);
  
  try {
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeInstagramRecipe(url, {
      extractComments: true
    });
    return recipe;
  } finally {
    await scraper.close();
  }
}
```

### Food Blog with Error Handling
```typescript
import { 
  FoodBlogScraper, 
  RateLimiter, 
  RateLimitPresets,
  ScrapingErrorHandler,
  RobotsTxtChecker 
} from '@/lib/extractors';

async function extractFoodBlogRecipe(url: string) {
  const scraper = new FoodBlogScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.moderate);
  const robotsChecker = new RobotsTxtChecker();
  
  try {
    // Check robots.txt first
    const robotsResult = await robotsChecker.checkRobotsTxt(url);
    if (!robotsResult.allowed) {
      throw new Error(robotsResult.reason);
    }
    
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeFoodBlogRecipe(url, {
      extractAuthor: true,
      extractTags: true
    });
    return recipe;
  } catch (error) {
    const scrapingError = ScrapingErrorHandler.parseError(error, url);
    throw new Error(ScrapingErrorHandler.getErrorMessage(scrapingError));
  } finally {
    await scraper.close();
  }
}
```

## Rate Limit Presets

- **conservative**: 10 requests/minute, 2s delay (default for most sites)
- **moderate**: 20 requests/minute, 1s delay (food blogs)
- **aggressive**: 50 requests/minute, 0.5s delay (robust sites)
- **instagram**: 5 requests/minute, 5s delay (Instagram-specific)

## Error Types

- `NETWORK_ERROR`: Connection issues
- `TIMEOUT_ERROR`: Request timeouts
- `RATE_LIMITED`: Too many requests
- `ACCESS_DENIED`: Site blocking requests
- `INVALID_URL`: Malformed URL
- `UNSUPPORTED_SITE`: Site not supported
- `PARSE_ERROR`: Failed to parse data
- `UNKNOWN_ERROR`: Unexpected errors

## Best Practices

1. **Always use rate limiting** to be respectful to websites
2. **Check robots.txt** before scraping
3. **Handle errors gracefully** with retry logic
4. **Close browser instances** to free resources
5. **Use appropriate user agents** for different sites
6. **Implement fallback options** when automated extraction fails

## Notes

- The scrapers use Playwright for browser automation
- All scrapers support headless mode for server deployment
- Rate limiting is per-instance, consider using a shared instance for multiple requests
- Robots.txt checking is cached to improve performance
- Manual extraction provides validation and suggestions for better user experience 