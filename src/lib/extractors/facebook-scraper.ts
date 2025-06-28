import { chromium, Browser, Page } from 'playwright';
import { ScrapedRecipe, ScrapingOptions } from './web-scraper';

export interface FacebookScrapingOptions extends ScrapingOptions {
  extractComments?: boolean;
  extractReactions?: boolean;
  extractShares?: boolean;
  extractUserInfo?: boolean;
  extractGroupInfo?: boolean;
}

export interface FacebookRecipe extends ScrapedRecipe {
  postId: string;
  author: string;
  authorUsername: string;
  groupName?: string;
  groupUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  postUrl: string;
  imageUrl?: string;
  content: string;
  timestamp?: string;
}

export class FacebookScraper {
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

  async scrapeFacebookRecipe(url: string, options: FacebookScrapingOptions = {}): Promise<FacebookRecipe> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent to desktop to better handle Facebook
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const timeout = options.timeout || 30000;
      
      // Navigate to Facebook post
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      
      // Wait for content to load
      await page.waitForSelector('[data-testid="post_message"]', { timeout });
      
      // Extract recipe data
      const recipe = await this.extractFacebookRecipeData(page, url, options);
      
      return recipe;
    } catch (error) {
      throw new Error(`Failed to scrape Facebook recipe from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private async extractFacebookRecipeData(page: Page, url: string, options: FacebookScrapingOptions): Promise<FacebookRecipe> {
    // Extract post ID from URL
    const postId = this.extractPostId(url);
    
    // Extract content
    const content = await this.extractContent(page);
    
    // Extract author information
    const authorInfo = await this.extractAuthorInfo(page);
    
    // Extract group information
    const groupInfo = options.extractGroupInfo ? await this.extractGroupInfo(page) : {};
    
    // Extract engagement metrics
    const metrics = await this.extractMetrics(page);
    
    // Extract reactions
    const reactions = options.extractReactions ? await this.extractReactions(page) : {
      like: 0,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };
    
    // Extract recipe information from content
    const recipeData = this.parseRecipeFromContent(content);
    
    // Extract images
    const images = await this.extractImages(page);
    
    // Extract timestamp
    const timestamp = await this.extractTimestamp(page);
    
    return {
      ...recipeData,
      postId,
      author: authorInfo.name,
      authorUsername: authorInfo.username,
      groupName: groupInfo.name,
      groupUrl: groupInfo.url,
      likes: metrics.likes,
      comments: metrics.comments,
      shares: metrics.shares,
      reactions,
      postUrl: url,
      imageUrl: images[0],
      content,
      timestamp,
      source: url,
      extractedAt: new Date()
    };
  }

  private extractPostId(url: string): string {
    // Extract post ID from Facebook URL
    const match = url.match(/\/posts\/(\d+)/);
    return match ? match[1] : `facebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async extractContent(page: Page): Promise<string> {
    try {
      const contentSelectors = [
        '[data-testid="post_message"]',
        '.post_message',
        '[class*="post-message"]',
        '[class*="content"]',
        '[class*="text"]'
      ];
      
      for (const selector of contentSelectors) {
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
      console.error('Failed to extract content:', error);
      return '';
    }
  }

  private async extractAuthorInfo(page: Page): Promise<{ name: string; username: string }> {
    try {
      const authorSelectors = [
        '[data-testid="post_actor"]',
        '.post_actor',
        '[class*="author"]',
        '[class*="actor"]'
      ];
      
      for (const selector of authorSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text?.trim()) {
            return {
              name: text.trim(),
              username: text.trim().replace('@', '').replace(/\s+/g, '').toLowerCase()
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

  private async extractGroupInfo(page: Page): Promise<{ name?: string; url?: string }> {
    try {
      const groupSelectors = [
        '[data-testid="group-name"]',
        '.group-name',
        '[class*="group"]'
      ];
      
      for (const selector of groupSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          const href = await element.getAttribute('href');
          if (text?.trim()) {
            return {
              name: text.trim(),
              url: href ? `https://facebook.com${href}` : undefined
            };
          }
        }
      }
      
      return {};
    } catch (error) {
      console.error('Failed to extract group info:', error);
      return {};
    }
  }

  private async extractMetrics(page: Page): Promise<{ likes: number; comments: number; shares: number }> {
    try {
      const metrics = {
        likes: 0,
        comments: 0,
        shares: 0
      };
      
      // Extract likes
      const likeSelectors = [
        '[data-testid="UFI2ReactionsCount"]',
        '.UFI2ReactionsCount',
        '[class*="like"]'
      ];
      
      for (const selector of likeSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            metrics.likes = this.parseNumber(text);
            break;
          }
        }
      }
      
      // Extract comments
      const commentSelectors = [
        '[data-testid="UFI2CommentsCount"]',
        '.UFI2CommentsCount',
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
      
      // Extract shares
      const shareSelectors = [
        '[data-testid="UFI2SharesCount"]',
        '.UFI2SharesCount',
        '[class*="share"]'
      ];
      
      for (const selector of shareSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            metrics.shares = this.parseNumber(text);
            break;
          }
        }
      }
      
      return metrics;
    } catch (error) {
      console.error('Failed to extract metrics:', error);
      return { likes: 0, comments: 0, shares: 0 };
    }
  }

  private async extractReactions(page: Page): Promise<{ like: number; love: number; haha: number; wow: number; sad: number; angry: number }> {
    try {
      const reactions = {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      };
      
      // Extract reaction counts
      const reactionSelectors = [
        '[data-testid="UFI2ReactionsCount"]',
        '.UFI2ReactionsCount',
        '[class*="reaction"]'
      ];
      
      for (const selector of reactionSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            // Parse reaction text to extract individual counts
            const reactionText = text.toLowerCase();
            if (reactionText.includes('like')) reactions.like = this.parseNumber(text);
            if (reactionText.includes('love')) reactions.love = this.parseNumber(text);
            if (reactionText.includes('haha')) reactions.haha = this.parseNumber(text);
            if (reactionText.includes('wow')) reactions.wow = this.parseNumber(text);
            if (reactionText.includes('sad')) reactions.sad = this.parseNumber(text);
            if (reactionText.includes('angry')) reactions.angry = this.parseNumber(text);
            break;
          }
        }
      }
      
      return reactions;
    } catch (error) {
      console.error('Failed to extract reactions:', error);
      return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }
  }

  private async extractImages(page: Page): Promise<string[]> {
    const imageSelectors = [
      'img[src*="facebook"]',
      'img[src*="fbcdn"]',
      '[data-testid="post-image"] img',
      '.post-image img'
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

  private async extractTimestamp(page: Page): Promise<string | undefined> {
    try {
      const timestampSelectors = [
        '[data-testid="post-timestamp"]',
        '.post-timestamp',
        '[class*="timestamp"]',
        '[class*="time"]'
      ];
      
      for (const selector of timestampSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text?.trim()) {
            return text.trim();
          }
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Failed to extract timestamp:', error);
      return undefined;
    }
  }

  private parseRecipeFromContent(content: string): ScrapedRecipe {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
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
      title: title || 'Facebook Recipe',
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

  static isValidFacebookUrl(url: string): boolean {
    const facebookPatterns = [
      /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+\/posts\/\d+\/?$/,
      /^https?:\/\/(www\.)?facebook\.com\/groups\/[a-zA-Z0-9._-]+\/posts\/\d+\/?$/,
      /^https?:\/\/(www\.)?facebook\.com\/photo\.php\?fbid=\d+/,
      /^https?:\/\/(www\.)?facebook\.com\/permalink\.php\?story_fbid=\d+/
    ];
    
    return facebookPatterns.some(pattern => pattern.test(url));
  }

  static getPostId(url: string): string | null {
    const match = url.match(/\/posts\/(\d+)/);
    return match ? match[1] : null;
  }
} 