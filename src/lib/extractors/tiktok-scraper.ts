import { chromium, Browser, Page } from 'playwright';
import { ScrapedRecipe, ScrapingOptions } from './web-scraper';

export interface TikTokScrapingOptions extends ScrapingOptions {
  extractComments?: boolean;
  extractHashtags?: boolean;
  extractMusic?: boolean;
  waitForVideo?: boolean;
  extractUserInfo?: boolean;
}

export interface TikTokRecipe extends ScrapedRecipe {
  videoId: string;
  author: string;
  authorUsername: string;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  hashtags: string[];
  music?: string;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export class TikTokScraper {
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

  async scrapeTikTokRecipe(url: string, options: TikTokScrapingOptions = {}): Promise<TikTokRecipe> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent to mobile to better handle TikTok
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      });
      
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 812 });
      
      const timeout = options.timeout || 30000;
      
      // Navigate to TikTok video
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      
      // Wait for content to load
      await page.waitForSelector('[data-e2e="video-desc"]', { timeout });
      
      // Extract recipe data
      const recipe = await this.extractTikTokRecipeData(page, url, options);
      
      return recipe;
    } catch (error) {
      throw new Error(`Failed to scrape TikTok recipe from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private async extractTikTokRecipeData(page: Page, url: string, options: TikTokScrapingOptions): Promise<TikTokRecipe> {
    // Extract video ID from URL
    const videoId = this.extractVideoId(url);
    
    // Extract description
    const description = await this.extractDescription(page);
    
    // Extract author information
    const authorInfo = await this.extractAuthorInfo(page);
    
    // Extract engagement metrics
    const metrics = await this.extractMetrics(page);
    
    // Extract hashtags
    const hashtags = options.extractHashtags ? await this.extractHashtags(page) : [];
    
    // Extract music information
    const music = options.extractMusic ? await this.extractMusic(page) : undefined;
    
    // Extract video metadata
    const videoMetadata = await this.extractVideoMetadata(page);
    
    // Extract recipe information from description
    const recipeData = this.parseRecipeFromDescription(description);
    
    // Extract images (thumbnails)
    const images = await this.extractImages(page);
    
    return {
      ...recipeData,
      videoId,
      author: authorInfo.name,
      authorUsername: authorInfo.username,
      likes: metrics.likes,
      shares: metrics.shares,
      comments: metrics.comments,
      views: metrics.views,
      hashtags,
      music,
      duration: videoMetadata.duration,
      videoUrl: videoMetadata.videoUrl,
      thumbnailUrl: videoMetadata.thumbnailUrl,
      source: url,
      extractedAt: new Date()
    };
  }

  private extractVideoId(url: string): string {
    // Extract video ID from TikTok URL
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : `tiktok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async extractDescription(page: Page): Promise<string> {
    try {
      const descriptionElement = await page.$('[data-e2e="video-desc"]');
      if (descriptionElement) {
        const text = await descriptionElement.textContent();
        return text?.trim() || '';
      }
      
      // Fallback selectors
      const fallbackSelectors = [
        '.video-meta-title',
        '.video-desc',
        '[class*="desc"]',
        '[class*="caption"]'
      ];
      
      for (const selector of fallbackSelectors) {
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
      // Try to find author information
      const authorSelectors = [
        '[data-e2e="video-author-uniqueid"]',
        '.author-uniqueId',
        '[class*="author"]',
        '[class*="username"]'
      ];
      
      for (const selector of authorSelectors) {
        const element = await page.$(selector);
        if (element) {
          const username = await element.textContent();
          if (username?.trim()) {
            return {
              name: username.trim(),
              username: username.trim().replace('@', '')
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

  private async extractMetrics(page: Page): Promise<{ likes: number; shares: number; comments: number; views: number }> {
    try {
      const metrics = {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0
      };
      
      // Extract likes
      const likeSelectors = [
        '[data-e2e="like-count"]',
        '.like-count',
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
        '[data-e2e="comment-count"]',
        '.comment-count',
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
        '[data-e2e="share-count"]',
        '.share-count',
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
      return { likes: 0, shares: 0, comments: 0, views: 0 };
    }
  }

  private async extractHashtags(page: Page): Promise<string[]> {
    try {
      const hashtags: string[] = [];
      
      // Look for hashtags in the description
      const description = await this.extractDescription(page);
      const hashtagMatches = description.match(/#(\w+)/g);
      
      if (hashtagMatches) {
        hashtags.push(...hashtagMatches.map(tag => tag.substring(1)));
      }
      
      // Look for hashtag elements
      const hashtagElements = await page.$$('[class*="hashtag"], [class*="tag"]');
      for (const element of hashtagElements) {
        const text = await element.textContent();
        if (text && text.startsWith('#')) {
          const tag = text.substring(1);
          if (!hashtags.includes(tag)) {
            hashtags.push(tag);
          }
        }
      }
      
      return hashtags;
    } catch (error) {
      console.error('Failed to extract hashtags:', error);
      return [];
    }
  }

  private async extractMusic(page: Page): Promise<string | undefined> {
    try {
      const musicSelectors = [
        '[data-e2e="music-info"]',
        '.music-info',
        '[class*="music"]'
      ];
      
      for (const selector of musicSelectors) {
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
      console.error('Failed to extract music info:', error);
      return undefined;
    }
  }

  private async extractVideoMetadata(page: Page): Promise<{ duration?: number; videoUrl?: string; thumbnailUrl?: string }> {
    try {
      const metadata: { duration?: number; videoUrl?: string; thumbnailUrl?: string } = {};
      
      // Extract video URL
      const videoElement = await page.$('video');
      if (videoElement) {
        const src = await videoElement.getAttribute('src');
        if (src) {
          metadata.videoUrl = src;
        }
      }
      
      // Extract thumbnail
      const imgElements = await page.$$('img');
      for (const img of imgElements) {
        const src = await img.getAttribute('src');
        if (src && src.includes('tiktok')) {
          metadata.thumbnailUrl = src;
          break;
        }
      }
      
      return metadata;
    } catch (error) {
      console.error('Failed to extract video metadata:', error);
      return {};
    }
  }

  private async extractImages(page: Page): Promise<string[]> {
    try {
      const images: string[] = [];
      const imgElements = await page.$$('img');
      
      for (const img of imgElements) {
        const src = await img.getAttribute('src');
        if (src && src.trim()) {
          // Convert relative URLs to absolute URLs
          const absoluteUrl = new URL(src, page.url()).href;
          images.push(absoluteUrl);
        }
      }
      
      // Remove duplicates
      return [...new Set(images)];
    } catch (error) {
      console.error('Failed to extract images:', error);
      return [];
    }
  }

  private parseRecipeFromDescription(description: string): ScrapedRecipe {
    // Extract recipe information from TikTok description
    const lines = description.split('\n').map(line => line.trim()).filter(line => line);
    
    let title = '';
    const ingredients: string[] = [];
    const instructions: string[] = [];
    let cookingTime: string | undefined;
    let servings: string | undefined;
    
    // Extract title (first line or line with recipe indicators)
    for (const line of lines) {
      if (line.toLowerCase().includes('recipe') || 
          line.toLowerCase().includes('how to') ||
          line.toLowerCase().includes('tutorial')) {
        title = line;
        break;
      }
    }
    
    if (!title && lines.length > 0) {
      title = lines[0];
    }
    
    // Extract ingredients (look for ingredient patterns)
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Look for ingredient indicators
      if (lowerLine.includes('ingredients:') || 
          lowerLine.includes('what you need:') ||
          lowerLine.includes('you\'ll need:')) {
        continue; // Skip the header line
      }
      
      // Look for ingredient patterns
      if (/\d+\s*(cup|tbsp|tsp|oz|lb|g|kg|ml|l|pound|ounce|gram|kilogram|teaspoon|tablespoon)/i.test(line) ||
          /^[•\-\*]\s/.test(line) ||
          /^\d+\.\s/.test(line)) {
        ingredients.push(line);
      }
    }
    
    // Extract instructions (look for numbered steps)
    for (const line of lines) {
      if (/^\d+\.\s/.test(line) || 
          /^step\s*\d+/i.test(line) ||
          /^instruction\s*\d+/i.test(line)) {
        instructions.push(line);
      }
    }
    
    // Extract cooking time
    const timeMatch = description.match(/(\d+)\s*(min|hour|hr|minute)/i);
    if (timeMatch) {
      cookingTime = `${timeMatch[1]} ${timeMatch[2]}`;
    }
    
    // Extract servings
    const servingMatch = description.match(/(\d+)\s*(serving|portion|person)/i);
    if (servingMatch) {
      servings = `${servingMatch[1]} ${servingMatch[2]}s`;
    }
    
    return {
      title: title || 'TikTok Recipe',
      ingredients,
      instructions,
      cookingTime,
      servings,
      images: [],
      source: '',
      extractedAt: new Date()
    };
  }

  private parseNumber(text: string): number {
    // Parse numbers from text like "1.2K", "500", etc.
    const cleanText = text.replace(/[^\d.]/g, '');
    const number = parseFloat(cleanText);
    
    if (text.includes('K') || text.includes('k')) {
      return Math.floor(number * 1000);
    }
    
    if (text.includes('M') || text.includes('m')) {
      return Math.floor(number * 1000000);
    }
    
    return isNaN(number) ? 0 : Math.floor(number);
  }

  /**
   * Validate TikTok URL
   */
  static isValidTikTokUrl(url: string): boolean {
    return url.includes('tiktok.com') && url.includes('/video/');
  }

  /**
   * Get TikTok video ID from URL
   */
  static getVideoId(url: string): string | null {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }
} 