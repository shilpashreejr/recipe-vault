import { chromium, Browser, Page } from 'playwright';
import { ScrapedRecipe, ScrapingOptions } from './web-scraper';

export interface PinterestScrapingOptions extends ScrapingOptions {
  extractComments?: boolean;
  extractRelatedPins?: boolean;
  extractBoardInfo?: boolean;
  extractUserInfo?: boolean;
}

export interface PinterestRecipe extends ScrapedRecipe {
  pinId: string;
  author: string;
  authorUsername: string;
  boardName?: string;
  boardUrl?: string;
  saves: number;
  comments: number;
  relatedPins?: string[];
  pinUrl: string;
  imageUrl?: string;
  description: string;
}

export class PinterestScraper {
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

  async scrapePinterestRecipe(url: string, options: PinterestScrapingOptions = {}): Promise<PinterestRecipe> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent to desktop to better handle Pinterest
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const timeout = options.timeout || 30000;
      
      // Navigate to Pinterest pin
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      
      // Wait for content to load
      await page.waitForSelector('[data-test-id="pin"]', { timeout });
      
      // Extract recipe data
      const recipe = await this.extractPinterestRecipeData(page, url, options);
      
      return recipe;
    } catch (error) {
      throw new Error(`Failed to scrape Pinterest recipe from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private async extractPinterestRecipeData(page: Page, url: string, options: PinterestScrapingOptions): Promise<PinterestRecipe> {
    // Extract pin ID from URL
    const pinId = this.extractPinId(url);
    
    // Extract description
    const description = await this.extractDescription(page);
    
    // Extract author information
    const authorInfo = await this.extractAuthorInfo(page);
    
    // Extract board information
    const boardInfo = options.extractBoardInfo ? await this.extractBoardInfo(page) : {};
    
    // Extract engagement metrics
    const metrics = await this.extractMetrics(page);
    
    // Extract related pins
    const relatedPins = options.extractRelatedPins ? await this.extractRelatedPins(page) : [];
    
    // Extract recipe information from description
    const recipeData = this.parseRecipeFromDescription(description);
    
    // Extract images
    const images = await this.extractImages(page);
    
    return {
      ...recipeData,
      pinId,
      author: authorInfo.name,
      authorUsername: authorInfo.username,
      boardName: boardInfo.name,
      boardUrl: boardInfo.url,
      saves: metrics.saves,
      comments: metrics.comments,
      relatedPins,
      pinUrl: url,
      imageUrl: images[0],
      description,
      source: url,
      extractedAt: new Date()
    };
  }

  private extractPinId(url: string): string {
    // Extract pin ID from Pinterest URL
    const match = url.match(/\/pin\/(\d+)/);
    return match ? match[1] : `pinterest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async extractDescription(page: Page): Promise<string> {
    try {
      const descriptionSelectors = [
        '[data-test-id="pin-draft-title"]',
        '[data-test-id="pin-draft-description"]',
        '.pin-draft-title',
        '.pin-draft-description',
        '[class*="description"]',
        '[class*="caption"]'
      ];
      
      for (const selector of descriptionSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text?.trim()) {
            return text.trim();
          }
        }
      }
      
      return '';
    } catch (error) {
      console.error('Failed to extract description:', error);
      return '';
    }
  }

  private async extractAuthorInfo(page: Page): Promise<{ name: string; username: string }> {
    try {
      const authorSelectors = [
        '[data-test-id="pin-draft-creator"]',
        '.pin-draft-creator',
        '[class*="author"]',
        '[class*="creator"]'
      ];
      
      for (const selector of authorSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text?.trim()) {
            return {
              name: text.trim(),
              username: text.trim().replace('@', '')
            };
          }
        }
      }
      
      return { name: 'Unknown Author', username: 'unknown' };
    } catch (error) {
      console.error('Failed to extract author info:', error);
      return { name: 'Unknown Author', username: 'unknown' };
    }
  }

  private async extractBoardInfo(page: Page): Promise<{ name?: string; url?: string }> {
    try {
      const boardSelectors = [
        '[data-test-id="board-name"]',
        '.board-name',
        '[class*="board"]'
      ];
      
      for (const selector of boardSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          const href = await element.getAttribute('href');
          if (text?.trim()) {
            return {
              name: text.trim(),
              url: href ? `https://pinterest.com${href}` : undefined
            };
          }
        }
      }
      
      return {};
    } catch (error) {
      console.error('Failed to extract board info:', error);
      return {};
    }
  }

  private async extractMetrics(page: Page): Promise<{ saves: number; comments: number }> {
    try {
      const metrics = {
        saves: 0,
        comments: 0
      };
      
      // Extract saves
      const saveSelectors = [
        '[data-test-id="pin-save-count"]',
        '.pin-save-count',
        '[class*="save"]'
      ];
      
      for (const selector of saveSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            metrics.saves = this.parseNumber(text);
            break;
          }
        }
      }
      
      // Extract comments
      const commentSelectors = [
        '[data-test-id="pin-comment-count"]',
        '.pin-comment-count',
        '[class*="comment"]'
      ];
      
      for (const selector of commentSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            metrics.comments = this.parseNumber(text);
            break;
          }
        }
      }
      
      return metrics;
    } catch (error) {
      console.error('Failed to extract metrics:', error);
      return { saves: 0, comments: 0 };
    }
  }

  private async extractRelatedPins(page: Page): Promise<string[]> {
    try {
      const relatedPinSelectors = [
        '[data-test-id="related-pin"]',
        '.related-pin',
        '[class*="related"]'
      ];
      
      const relatedPins: string[] = [];
      
      for (const selector of relatedPinSelectors) {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const href = await element.getAttribute('href');
          if (href && href.includes('/pin/')) {
            relatedPins.push(`https://pinterest.com${href}`);
          }
        }
      }
      
      return [...new Set(relatedPins)];
    } catch (error) {
      console.error('Failed to extract related pins:', error);
      return [];
    }
  }

  private async extractImages(page: Page): Promise<string[]> {
    const imageSelectors = [
      'img[src*="pinimg"]',
      'img[src*="pinterest"]',
      '[data-test-id="pin-image"] img',
      '.pin-image img'
    ];

    const images: string[] = [];

    for (const selector of imageSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const src = await element.getAttribute('src');
          if (src && src.trim()) {
            images.push(src);
          }
        }
      } catch (error) {
        continue;
      }
    }

    return [...new Set(images)];
  }

  private parseRecipeFromDescription(description: string): ScrapedRecipe {
    const lines = description.split('\n').map(line => line.trim()).filter(line => line);
    
    let title = '';
    const ingredients: string[] = [];
    const instructions: string[] = [];
    let cookingTime = '';
    let servings = '';
    
    let currentSection = 'title';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Detect section changes
      if (this.isIngredientsSection(lowerLine)) {
        currentSection = 'ingredients';
        continue;
      } else if (this.isInstructionsSection(lowerLine)) {
        currentSection = 'instructions';
        continue;
      } else if (this.isTimeSection(lowerLine)) {
        cookingTime = line;
        continue;
      } else if (this.isServingsSection(lowerLine)) {
        servings = line;
        continue;
      }
      
      // Extract title (first meaningful line)
      if (currentSection === 'title' && !title && line.length > 3) {
        title = line;
        currentSection = 'ingredients'; // Assume ingredients come next
        continue;
      }
      
      // Extract ingredients
      if (currentSection === 'ingredients' && this.looksLikeIngredient(line)) {
        ingredients.push(line);
      }
      
      // Extract instructions
      if (currentSection === 'instructions' && this.looksLikeInstruction(line)) {
        instructions.push(line);
      }
    }
    
    return {
      title: title || 'Pinterest Recipe',
      ingredients,
      instructions,
      cookingTime,
      servings,
      images: [],
      source: '',
      extractedAt: new Date()
    };
  }

  private isIngredientsSection(text: string): boolean {
    const ingredientsKeywords = [
      'ingredients',
      'what you need',
      'what you\'ll need',
      'supplies',
      'materials'
    ];
    
    return ingredientsKeywords.some(keyword => text.includes(keyword));
  }

  private isInstructionsSection(text: string): boolean {
    const instructionsKeywords = [
      'instructions',
      'directions',
      'steps',
      'method',
      'how to',
      'procedure'
    ];
    
    return instructionsKeywords.some(keyword => text.includes(keyword));
  }

  private isTimeSection(text: string): boolean {
    const timeKeywords = [
      'time',
      'duration',
      'cook time',
      'prep time',
      'total time'
    ];
    
    return timeKeywords.some(keyword => text.includes(keyword));
  }

  private isServingsSection(text: string): boolean {
    const servingsKeywords = [
      'servings',
      'serves',
      'yield',
      'portions'
    ];
    
    return servingsKeywords.some(keyword => text.includes(keyword));
  }

  private looksLikeIngredient(text: string): boolean {
    // Check if line looks like an ingredient (contains measurements, quantities, etc.)
    const ingredientPatterns = [
      /\d+\s*(cup|tbsp|tsp|oz|g|kg|ml|l|pound|lb)/i,
      /^\d+\s*[a-zA-Z]/,
      /^[a-zA-Z].*\d+/,
      /^[•\-\*]\s/,
      /^\d+\.\s/
    ];
    
    return ingredientPatterns.some(pattern => pattern.test(text));
  }

  private looksLikeInstruction(text: string): boolean {
    // Check if line looks like an instruction (numbered, contains action words, etc.)
    const instructionPatterns = [
      /^\d+\.\s/,
      /^[•\-\*]\s/,
      /\b(mix|stir|add|combine|heat|bake|cook|preheat|pour|whisk|fold|beat|cream|sift|chop|dice|slice|grate|peel|wash|drain|season|salt|pepper|oil|butter|flour|sugar|eggs|milk|cream|cheese|meat|chicken|beef|pork|fish|vegetables|fruits|herbs|spices)\b/i
    ];
    
    return instructionPatterns.some(pattern => pattern.test(text));
  }

  private parseNumber(text: string): number {
    // Extract number from text like "1.2K", "500", "1.5M", etc.
    const match = text.match(/(\d+(?:\.\d+)?)([KMB]?)/i);
    if (match) {
      const number = parseFloat(match[1]);
      const multiplier = match[2].toUpperCase();
      
      switch (multiplier) {
        case 'K': return Math.round(number * 1000);
        case 'M': return Math.round(number * 1000000);
        case 'B': return Math.round(number * 1000000000);
        default: return Math.round(number);
      }
    }
    
    return 0;
  }

  static isValidPinterestUrl(url: string): boolean {
    const pinterestPatterns = [
      /^https?:\/\/(www\.)?pinterest\.com\/pin\/\d+\/?$/,
      /^https?:\/\/(www\.)?pinterest\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/
    ];
    
    return pinterestPatterns.some(pattern => pattern.test(url));
  }

  static getPinId(url: string): string | null {
    const match = url.match(/\/pin\/(\d+)/);
    return match ? match[1] : null;
  }
} 