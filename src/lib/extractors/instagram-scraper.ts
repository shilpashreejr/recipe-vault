import { chromium, Browser, Page } from 'playwright';
import { ScrapedRecipe, ScrapingOptions } from './web-scraper';

export interface InstagramScrapingOptions extends ScrapingOptions {
  waitForVideo?: boolean;
  extractComments?: boolean;
}

export class InstagramScraper {
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

  async scrapeInstagramRecipe(url: string, options: InstagramScrapingOptions = {}): Promise<ScrapedRecipe> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent to mobile to better handle Instagram
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      });
      
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 812 });
      
      const timeout = options.timeout || 30000;
      
      // Navigate to Instagram post
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      
      // Wait for content to load
      await page.waitForSelector('article', { timeout });
      
      // Extract recipe data
      const recipe = await this.extractInstagramRecipeData(page, url, options);
      
      return recipe;
    } catch (error) {
      throw new Error(`Failed to scrape Instagram recipe from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private async extractInstagramRecipeData(page: Page, url: string, options: InstagramScrapingOptions): Promise<ScrapedRecipe> {
    // Extract caption (main text content)
    const caption = await this.extractCaption(page);
    
    // Extract title from caption
    const title = this.extractTitleFromCaption(caption);
    
    // Extract ingredients from caption
    const ingredients = this.extractIngredientsFromCaption(caption);
    
    // Extract instructions from caption
    const instructions = this.extractInstructionsFromCaption(caption);
    
    // Extract cooking time from caption
    const cookingTime = this.extractCookingTimeFromCaption(caption);
    
    // Extract servings from caption
    const servings = this.extractServingsFromCaption(caption);
    
    // Extract images/videos
    const images = await this.extractInstagramMedia(page);
    
    // Extract comments if requested
    let additionalInfo = '';
    if (options.extractComments) {
      additionalInfo = await this.extractComments(page);
    }
    
    return {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      images,
      source: url,
      extractedAt: new Date()
    };
  }

  private async extractCaption(page: Page): Promise<string> {
    const captionSelectors = [
      '[data-testid="post-caption"]',
      'article div[dir="auto"]',
      'article span[dir="auto"]',
      '.caption',
      '[class*="caption"]'
    ];

    for (const selector of captionSelectors) {
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

    return '';
  }

  private extractTitleFromCaption(caption: string): string {
    // Try to extract title from the first line or sentence
    const lines = caption.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // If it looks like a title (not too long, doesn't start with common recipe words)
      if (firstLine.length < 100 && !this.isRecipeInstruction(firstLine)) {
        return firstLine;
      }
    }
    
    return 'Instagram Recipe';
  }

  private extractIngredientsFromCaption(caption: string): string[] {
    const ingredients: string[] = [];
    const lines = caption.split('\n');
    
    let inIngredientsSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for ingredients section markers
      if (this.isIngredientsSection(trimmedLine)) {
        inIngredientsSection = true;
        continue;
      }
      
      // Look for instructions section markers to stop ingredients
      if (this.isInstructionsSection(trimmedLine)) {
        inIngredientsSection = false;
        continue;
      }
      
      if (inIngredientsSection && trimmedLine) {
        // Check if line looks like an ingredient
        if (this.isIngredientLine(trimmedLine)) {
          ingredients.push(trimmedLine);
        }
      }
    }
    
    // If no clear ingredients section found, try to extract from whole caption
    if (ingredients.length === 0) {
      return this.extractIngredientsFromText(caption);
    }
    
    return ingredients;
  }

  private extractInstructionsFromCaption(caption: string): string[] {
    const instructions: string[] = [];
    const lines = caption.split('\n');
    
    let inInstructionsSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for instructions section markers
      if (this.isInstructionsSection(trimmedLine)) {
        inInstructionsSection = true;
        continue;
      }
      
      if (inInstructionsSection && trimmedLine) {
        // Check if line looks like an instruction
        if (this.isRecipeInstruction(trimmedLine)) {
          instructions.push(trimmedLine);
        }
      }
    }
    
    // If no clear instructions section found, try to extract from whole caption
    if (instructions.length === 0) {
      return this.extractInstructionsFromText(caption);
    }
    
    return instructions;
  }

  private extractCookingTimeFromCaption(caption: string): string | undefined {
    const timePatterns = [
      /(\d+)\s*(?:min|minute|minutes)/gi,
      /(\d+)\s*(?:hr|hour|hours)/gi,
      /(\d+)\s*(?:h|m)/gi,
      /cook\s*(?:for\s*)?(\d+)/gi,
      /prep\s*(?:time\s*)?(\d+)/gi
    ];
    
    for (const pattern of timePatterns) {
      const match = caption.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return undefined;
  }

  private extractServingsFromCaption(caption: string): string | undefined {
    const servingPatterns = [
      /(\d+)\s*(?:serving|servings)/gi,
      /serves\s*(\d+)/gi,
      /(\d+)\s*(?:person|people)/gi
    ];
    
    for (const pattern of servingPatterns) {
      const match = caption.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return undefined;
  }

  private async extractInstagramMedia(page: Page): Promise<string[]> {
    const mediaSelectors = [
      'img[src*="instagram"]',
      'video[src*="instagram"]',
      'article img',
      'article video'
    ];

    const media: string[] = [];

    for (const selector of mediaSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const src = await element.getAttribute('src');
          if (src && src.trim()) {
            media.push(src);
          }
        }
      } catch (error) {
        continue;
      }
    }

    return [...new Set(media)];
  }

  private async extractComments(page: Page): Promise<string> {
    const commentSelectors = [
      '[data-testid="comment"]',
      '.comment',
      '[class*="comment"]'
    ];

    const comments: string[] = [];

    for (const selector of commentSelectors) {
      try {
        const elements = await page.$$(selector);
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

    return comments.join('\n');
  }

  private isIngredientsSection(text: string): boolean {
    const ingredientsKeywords = [
      'ingredients',
      'what you need',
      'what you\'ll need',
      'you\'ll need',
      'materials',
      'supplies'
    ];
    
    return ingredientsKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
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
    
    return instructionsKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  private isIngredientLine(text: string): boolean {
    // Check if line looks like an ingredient (contains measurements, food items, etc.)
    const ingredientPatterns = [
      /\d+\s*(?:cup|tbsp|tsp|oz|g|kg|ml|l)/i,
      /(?:salt|pepper|oil|butter|flour|sugar|egg|milk|cream)/i,
      /^\d+\.?\s*/, // Starts with number
      /^[•\-\*]\s*/, // Starts with bullet point
    ];
    
    return ingredientPatterns.some(pattern => pattern.test(text));
  }

  private isRecipeInstruction(text: string): boolean {
    // Check if line looks like a cooking instruction
    const instructionPatterns = [
      /^\d+\.?\s*/, // Starts with number
      /^[•\-\*]\s*/, // Starts with bullet point
      /(?:mix|stir|add|combine|heat|cook|bake|preheat|pour|cut|chop|slice)/i,
      /(?:until|then|next|finally|after|before)/i
    ];
    
    return instructionPatterns.some(pattern => pattern.test(text));
  }

  private extractIngredientsFromText(text: string): string[] {
    const ingredients: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (this.isIngredientLine(trimmedLine)) {
        ingredients.push(trimmedLine);
      }
    }
    
    return ingredients;
  }

  private extractInstructionsFromText(text: string): string[] {
    const instructions: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (this.isRecipeInstruction(trimmedLine)) {
        instructions.push(trimmedLine);
      }
    }
    
    return instructions;
  }
} 