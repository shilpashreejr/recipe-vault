import { chromium, Browser, Page } from 'playwright';
import { ScrapedRecipe, ScrapingOptions } from './web-scraper';

export interface FoodBlogScrapingOptions extends ScrapingOptions {
  extractAuthor?: boolean;
  extractDate?: boolean;
  extractTags?: boolean;
  extractComments?: boolean;
}

export interface FoodBlogRecipe extends ScrapedRecipe {
  author?: string;
  publishDate?: string;
  tags?: string[];
  comments?: string[];
}

export class FoodBlogScraper {
  private browser: Browser | null = null;

  // Common food blog platforms and their selectors
  private readonly blogSelectors = {
    wordpress: {
      title: ['h1.entry-title', 'h1.post-title', '.recipe-title', 'h1'],
      ingredients: ['.ingredients li', '.recipe-ingredients li', '.ingredient-list li'],
      instructions: ['.instructions li', '.recipe-directions li', '.directions li'],
      time: ['.cook-time', '.prep-time', '.total-time', '.recipe-time'],
      servings: ['.servings', '.yield', '.recipe-servings'],
      author: ['.author', '.byline', '.post-author'],
      date: ['.date', '.published', '.post-date'],
      tags: ['.tags a', '.categories a', '.recipe-tags a']
    },
    blogger: {
      title: ['h1.post-title', '.post-title h1', '.recipe-title'],
      ingredients: ['.ingredients li', '.recipe-ingredients li'],
      instructions: ['.instructions li', '.recipe-directions li'],
      time: ['.cook-time', '.prep-time', '.total-time'],
      servings: ['.servings', '.yield'],
      author: ['.author', '.byline'],
      date: ['.date', '.published'],
      tags: ['.labels a', '.tags a']
    },
    squarespace: {
      title: ['h1', '.recipe-title', '.post-title'],
      ingredients: ['.ingredients li', '.recipe-ingredients li'],
      instructions: ['.instructions li', '.recipe-directions li'],
      time: ['.cook-time', '.prep-time', '.total-time'],
      servings: ['.servings', '.yield'],
      author: ['.author', '.byline'],
      date: ['.date', '.published'],
      tags: ['.tags a', '.categories a']
    },
    wix: {
      title: ['h1', '.recipe-title', '.post-title'],
      ingredients: ['.ingredients li', '.recipe-ingredients li'],
      instructions: ['.instructions li', '.recipe-directions li'],
      time: ['.cook-time', '.prep-time', '.total-time'],
      servings: ['.servings', '.yield'],
      author: ['.author', '.byline'],
      date: ['.date', '.published'],
      tags: ['.tags a', '.categories a']
    }
  };

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeFoodBlogRecipe(url: string, options: FoodBlogScrapingOptions = {}): Promise<FoodBlogRecipe> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent
      await page.setExtraHTTPHeaders({
        'User-Agent': options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const timeout = options.timeout || 30000;
      
      // Navigate to food blog
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      
      // Detect blog platform
      const platform = await this.detectBlogPlatform(page);
      
      // Extract recipe data
      const recipe = await this.extractFoodBlogRecipeData(page, url, platform, options);
      
      return recipe;
    } catch (error) {
      throw new Error(`Failed to scrape food blog recipe from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private async detectBlogPlatform(page: Page): Promise<keyof typeof this.blogSelectors> {
    // Check for WordPress
    const wordpressIndicators = [
      'wp-content',
      'wp-includes',
      'wordpress',
      'wp-'
    ];
    
    const html = await page.content();
    if (wordpressIndicators.some(indicator => html.includes(indicator))) {
      return 'wordpress';
    }
    
    // Check for Blogger
    const bloggerIndicators = [
      'blogger.com',
      'blogspot.com',
      'blogger'
    ];
    
    if (bloggerIndicators.some(indicator => html.includes(indicator))) {
      return 'blogger';
    }
    
    // Check for Squarespace
    const squarespaceIndicators = [
      'squarespace',
      'sqs-'
    ];
    
    if (squarespaceIndicators.some(indicator => html.includes(indicator))) {
      return 'squarespace';
    }
    
    // Check for Wix
    const wixIndicators = [
      'wix.com',
      'wixsite.com',
      'wix-'
    ];
    
    if (wixIndicators.some(indicator => html.includes(indicator))) {
      return 'wix';
    }
    
    // Default to WordPress as it's most common
    return 'wordpress';
  }

  private async extractFoodBlogRecipeData(
    page: Page, 
    url: string, 
    platform: keyof typeof this.blogSelectors,
    options: FoodBlogScrapingOptions
  ): Promise<FoodBlogRecipe> {
    const selectors = this.blogSelectors[platform];
    
    // Extract title
    const title = await this.extractWithSelectors(page, selectors.title);
    
    // Extract ingredients
    const ingredients = await this.extractListWithSelectors(page, selectors.ingredients);
    
    // Extract instructions
    const instructions = await this.extractListWithSelectors(page, selectors.instructions);
    
    // Extract cooking time
    const cookingTime = await this.extractWithSelectors(page, selectors.time);
    
    // Extract servings
    const servings = await this.extractWithSelectors(page, selectors.servings);
    
    // Extract difficulty
    const difficulty = await this.extractDifficulty(page);
    
    // Extract nutrition
    const nutrition = await this.extractNutrition(page);
    
    // Extract images
    const images = await this.extractImages(page);
    
    // Extract additional metadata
    const author = options.extractAuthor ? await this.extractWithSelectors(page, selectors.author) : undefined;
    const publishDate = options.extractDate ? await this.extractWithSelectors(page, selectors.date) : undefined;
    const tags = options.extractTags ? await this.extractTags(page, selectors.tags) : undefined;
    const comments = options.extractComments ? await this.extractComments(page) : undefined;
    
    return {
      title: title || 'Food Blog Recipe',
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      nutrition,
      images,
      source: url,
      extractedAt: new Date(),
      author,
      publishDate,
      tags,
      comments
    };
  }

  private async extractWithSelectors(page: Page, selectors: string[]): Promise<string | undefined> {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        continue;
      }
    }
    return undefined;
  }

  private async extractListWithSelectors(page: Page, selectors: string[]): Promise<string[]> {
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const items: string[] = [];
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              items.push(text.trim());
            }
          }
          if (items.length > 0) {
            return items;
          }
        }
      } catch (error) {
        continue;
      }
    }
    return [];
  }

  private async extractDifficulty(page: Page): Promise<string | undefined> {
    const difficultySelectors = [
      '[class*="difficulty"]',
      '[class*="level"]',
      '.difficulty',
      '.level',
      '.recipe-difficulty',
      '.recipe-level'
    ];

    return this.extractWithSelectors(page, difficultySelectors);
  }

  private async extractNutrition(page: Page): Promise<ScrapedRecipe['nutrition']> {
    const nutritionSelectors = [
      '[class*="nutrition"]',
      '[class*="calories"]',
      '[class*="protein"]',
      '[class*="carbs"]',
      '[class*="fat"]',
      '.nutrition',
      '.calories',
      '.protein',
      '.carbs',
      '.fat',
      '.recipe-nutrition',
      '.recipe-calories'
    ];

    const nutrition: ScrapedRecipe['nutrition'] = {};

    for (const selector of nutritionSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('calorie')) {
              nutrition.calories = text.trim();
            } else if (lowerText.includes('protein')) {
              nutrition.protein = text.trim();
            } else if (lowerText.includes('carb') || lowerText.includes('carbohydrate')) {
              nutrition.carbs = text.trim();
            } else if (lowerText.includes('fat')) {
              nutrition.fat = text.trim();
            }
          }
        }
      } catch (error) {
        continue;
      }
    }

    return Object.keys(nutrition).length > 0 ? nutrition : undefined;
  }

  private async extractImages(page: Page): Promise<string[]> {
    const imageSelectors = [
      '[class*="recipe"] img',
      '[class*="food"] img',
      '[class*="dish"] img',
      '.recipe img',
      '.food img',
      '.dish img',
      'img[alt*="recipe"]',
      'img[alt*="food"]',
      'img[alt*="dish"]',
      '.post-content img',
      '.entry-content img',
      '.recipe-image img'
    ];

    const images: string[] = [];

    for (const selector of imageSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const src = await element.getAttribute('src');
          if (src && src.trim()) {
            // Convert relative URLs to absolute URLs
            const absoluteUrl = new URL(src, page.url()).href;
            images.push(absoluteUrl);
          }
        }
      } catch (error) {
        continue;
      }
    }

    // Remove duplicates
    return [...new Set(images)];
  }

  private async extractTags(page: Page, tagSelectors: string[]): Promise<string[]> {
    const tags: string[] = [];

    for (const selector of tagSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            tags.push(text.trim());
          }
        }
      } catch (error) {
        continue;
      }
    }

    return [...new Set(tags)];
  }

  private async extractComments(page: Page): Promise<string[]> {
    const commentSelectors = [
      '[class*="comment"]',
      '.comment',
      '.comments',
      '#comments',
      '.post-comments'
    ];

    const comments: string[] = [];

    for (const selector of commentSelectors) {
      try {
        const elements = await page.$$(`${selector} .comment-content, ${selector} .comment-text, ${selector} p`);
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            comments.push(text.trim());
          }
        }
      } catch (error) {
        continue;
      }
    }

    return comments;
  }
} 