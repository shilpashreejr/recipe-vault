import { chromium, Browser, Page } from 'playwright';

export interface ScrapedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
  servings?: string;
  difficulty?: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  images: string[];
  source: string;
  extractedAt: Date;
}

export interface ScrapingOptions {
  timeout?: number;
  userAgent?: string;
  waitForSelector?: string;
  respectRobotsTxt?: boolean;
}

export class WebScraper {
  private browser: Browser | null = null;

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

  async scrapeRecipe(url: string, options: ScrapingOptions = {}): Promise<ScrapedRecipe> {
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
      
      // Set timeout
      const timeout = options.timeout || 30000;
      
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      
      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout });
      }

      // Extract recipe data
      const recipe = await this.extractRecipeData(page, url);
      
      return recipe;
    } catch (error) {
      throw new Error(`Failed to scrape recipe from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private async extractRecipeData(page: Page, url: string): Promise<ScrapedRecipe> {
    // Extract title
    const title = await this.extractTitle(page);
    
    // Extract ingredients
    const ingredients = await this.extractIngredients(page);
    
    // Extract instructions
    const instructions = await this.extractInstructions(page);
    
    // Extract cooking time
    const cookingTime = await this.extractCookingTime(page);
    
    // Extract servings
    const servings = await this.extractServings(page);
    
    // Extract difficulty
    const difficulty = await this.extractDifficulty(page);
    
    // Extract nutrition
    const nutrition = await this.extractNutrition(page);
    
    // Extract images
    const images = await this.extractImages(page);
    
    return {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      nutrition,
      images,
      source: url,
      extractedAt: new Date()
    };
  }

  private async extractTitle(page: Page): Promise<string> {
    const titleSelectors = [
      'h1[class*="title"]',
      'h1[class*="recipe"]',
      'h1',
      '[class*="title"]',
      '[class*="recipe-title"]',
      'title'
    ];

    for (const selector of titleSelectors) {
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

    // Fallback to page title
    const pageTitle = await page.title();
    return pageTitle || 'Untitled Recipe';
  }

  private async extractIngredients(page: Page): Promise<string[]> {
    const ingredientSelectors = [
      '[class*="ingredient"]',
      '[class*="ingredients"] li',
      '[class*="ingredients"] [class*="item"]',
      'ul[class*="ingredient"] li',
      'ol[class*="ingredient"] li',
      '.ingredients li',
      '.ingredient-list li'
    ];

    for (const selector of ingredientSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const ingredients: string[] = [];
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              ingredients.push(text.trim());
            }
          }
          if (ingredients.length > 0) {
            return ingredients;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }

  private async extractInstructions(page: Page): Promise<string[]> {
    const instructionSelectors = [
      '[class*="instruction"]',
      '[class*="directions"]',
      '[class*="method"]',
      '[class*="steps"]',
      '.instructions li',
      '.directions li',
      '.method li',
      '.steps li',
      'ol[class*="instruction"] li',
      'ol[class*="direction"] li'
    ];

    for (const selector of instructionSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const instructions: string[] = [];
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              instructions.push(text.trim());
            }
          }
          if (instructions.length > 0) {
            return instructions;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }

  private async extractCookingTime(page: Page): Promise<string | undefined> {
    const timeSelectors = [
      '[class*="cook-time"]',
      '[class*="prep-time"]',
      '[class*="total-time"]',
      '[class*="time"]',
      '.cook-time',
      '.prep-time',
      '.total-time'
    ];

    for (const selector of timeSelectors) {
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

  private async extractServings(page: Page): Promise<string | undefined> {
    const servingSelectors = [
      '[class*="serving"]',
      '[class*="yield"]',
      '[class*="portion"]',
      '.servings',
      '.yield',
      '.portion'
    ];

    for (const selector of servingSelectors) {
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

  private async extractDifficulty(page: Page): Promise<string | undefined> {
    const difficultySelectors = [
      '[class*="difficulty"]',
      '[class*="level"]',
      '.difficulty',
      '.level'
    ];

    for (const selector of difficultySelectors) {
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
      '.fat'
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
      'img[alt*="dish"]'
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
} 