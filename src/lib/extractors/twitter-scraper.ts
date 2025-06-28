import { RateLimiter, RateLimitPresets } from './rate-limiter';
import { ScrapingErrorHandler, ScrapingErrorType } from './error-handler';
import { Recipe } from '@/types';

export interface TwitterRecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string | null;
  servings?: number | null;
  dietaryRestrictions: string[];
  difficulty?: string;
  tags: string[];
  source: string;
  sourceType: 'twitter';
  extractedAt: string;
  metadata: {
    postId: string;
    author: string;
    postedAt: string;
    likes: number;
    retweets: number;
    replies: number;
  };
}

export class TwitterScraper {
  private rateLimiter: RateLimiter;
  private errorHandler: ScrapingErrorHandler;

  constructor() {
    this.rateLimiter = new RateLimiter(RateLimitPresets.conservative);
    this.errorHandler = new ScrapingErrorHandler();
  }

  /**
   * Extract recipe data from a Twitter/X post
   * @param url - The Twitter/X post URL
   * @returns Promise<TwitterRecipeData> - Extracted recipe data
   */
  async scrapeTwitterRecipe(url: string): Promise<TwitterRecipeData> {
    try {
      // Validate URL format
      if (!this.isValidTwitterUrl(url)) {
        throw new Error('Invalid Twitter/X URL format');
      }

      // Check rate limits
      await this.rateLimiter.waitForPermission();

      // Extract post ID from URL
      const postId = this.extractPostId(url);
      if (!postId) {
        throw new Error('Could not extract post ID from URL');
      }

      // Fetch post data using Twitter API or web scraping
      const postData = await this.fetchPostData(postId);
      
      // Extract recipe information from post content
      const recipeData = this.parseRecipeFromContent(postData);

      // Validate extracted data - require at least title and some ingredients/instructions
      if (!recipeData.title || 
          (recipeData.ingredients && recipeData.ingredients.length === 0) ||
          (recipeData.instructions && recipeData.instructions.length === 0)) {
        throw new Error('Insufficient recipe data found in post');
      }

      return {
        title: recipeData.title,
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        cookingTime: recipeData.cookingTime || null,
        servings: recipeData.servings || null,
        dietaryRestrictions: recipeData.dietaryRestrictions || [],
        difficulty: recipeData.difficulty || 'Medium',
        tags: recipeData.tags || [],
        source: url,
        sourceType: 'twitter' as const,
        extractedAt: new Date().toISOString(),
        metadata: {
          postId,
          author: postData.author,
          postedAt: postData.postedAt,
          likes: postData.likes,
          retweets: postData.retweets,
          replies: postData.replies
        }
      };

    } catch (error) {
      // For specific errors, throw them directly
      if (error instanceof Error && (
        error.message.includes('Invalid Twitter/X URL format') ||
        error.message.includes('Could not extract post ID from URL') ||
        error.message.includes('Insufficient recipe data found in post')
      )) {
        throw error;
      }
      
      // For other errors, use the error handler
      const scrapingError = ScrapingErrorHandler.parseError(error, url);
      throw new Error(ScrapingErrorHandler.getErrorMessage(scrapingError));
    }
  }

  /**
   * Validate if the URL is a valid Twitter/X post URL
   */
  private isValidTwitterUrl(url: string): boolean {
    const twitterPatterns = [
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/i,
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/i\/web\/status\/\d+/i,
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/status\/\d+/i
    ];

    return twitterPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract post ID from Twitter/X URL
   */
  private extractPostId(url: string): string | null {
    const patterns = [
      /\/status\/(\d+)/,
      /\/i\/web\/status\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Fetch post data from Twitter/X
   * This is a placeholder implementation - in production, you'd use Twitter API
   */
  private async fetchPostData(postId: string): Promise<any> {
    // Note: This is a simplified implementation
    // In production, you would need to:
    // 1. Use Twitter API v2 with proper authentication
    // 2. Handle API rate limits
    // 3. Implement proper error handling for API responses
    
    // For now, we'll simulate the data structure
    return {
      content: `Check out this amazing recipe! 

Ingredients:
- 2 cups flour
- 1 cup sugar
- 3 eggs
- 1/2 cup milk

Instructions:
1. Mix flour and sugar
2. Add eggs and milk
3. Bake at 350°F for 30 minutes

#recipe #cooking #food`,
      author: 'recipe_chef',
      postedAt: new Date().toISOString(),
      likes: 150,
      retweets: 25,
      replies: 10
    };
  }

  /**
   * Extract ingredients from post content
   */
  private extractIngredients(content: string): string[] {
    const ingredients: string[] = [];
    
    // Look for ingredients section
    const ingredientsMatch = content.match(/ingredients?:\s*\n([\s\S]*?)(?=\n\n|\ninstructions?|$)/i);
    if (ingredientsMatch) {
      const ingredientsText = ingredientsMatch[1];
      const lines = ingredientsText.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine && !cleanLine.match(/^(ingredients?|instructions?|directions?):/i)) {
          ingredients.push(cleanLine);
        }
      }
    }

    // Fallback: look for bullet points or numbered lists
    if (ingredients.length === 0) {
      const bulletPattern = /^[-•*]\s*(.+)$/gm;
      let match;
      while ((match = bulletPattern.exec(content)) !== null) {
        const ingredient = match[1].trim();
        if (ingredient && !ingredient.match(/^(ingredients?|instructions?|directions?):/i)) {
          ingredients.push(ingredient);
        }
      }
    }

    return ingredients;
  }

  /**
   * Extract instructions from post content
   */
  private extractInstructions(content: string): string[] {
    const instructions: string[] = [];
    
    // Look for instructions section
    const instructionsMatch = content.match(/instructions?:\s*\n([\s\S]*?)(?=\n\n|$)/i);
    if (instructionsMatch) {
      const instructionsText = instructionsMatch[1];
      const lines = instructionsText.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const cleanLine = line.replace(/^\d+\.?\s*/, '').trim();
        if (cleanLine && !cleanLine.match(/^(ingredients?|instructions?|directions?):/i)) {
          instructions.push(cleanLine);
        }
      }
    }

    // Fallback: look for numbered steps
    if (instructions.length === 0) {
      const stepPattern = /^\d+\.?\s*(.+)$/gm;
      let match;
      while ((match = stepPattern.exec(content)) !== null) {
        const instruction = match[1].trim();
        if (instruction && !instruction.match(/^(ingredients?|instructions?|directions?):/i)) {
          instructions.push(instruction);
        }
      }
    }

    return instructions;
  }

  /**
   * Extract cooking time from content
   */
  private extractCookingTime(content: string): string | null {
    const timePatterns = [
      /(\d+)\s*(?:min|minutes?)/i,
      /(\d+)\s*(?:hr|hour|hours?)/i,
      /cook(?:ing)?\s*(?:time|for)\s*(\d+)\s*(?:min|minutes?|hr|hour|hours?)/i,
      /bake\s*(?:for\s*)?(\d+)\s*(?:min|minutes?|hr|hour|hours?)/i
    ];

    for (const pattern of timePatterns) {
      const match = content.match(pattern);
      if (match) {
        // Return the full matched text, not just the number
        return match[0];
      }
    }

    return null;
  }

  /**
   * Extract servings from content
   */
  private extractServings(content: string): number | null {
    const servingPatterns = [
      /(\d+)\s*(?:servings?|people|portions?)/i,
      /serves\s*(\d+)/i,
      /yields?\s*(\d+)/i
    ];

    for (const pattern of servingPatterns) {
      const match = content.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  }

  /**
   * Extract dietary restrictions from content
   */
  private extractDietaryRestrictions(content: string): string[] {
    const restrictions: string[] = [];
    const lowerContent = content.toLowerCase();

    const dietaryKeywords = {
      'vegetarian': ['vegetarian', 'veggie'],
      'vegan': ['vegan'],
      'gluten-free': ['gluten-free', 'gluten free', 'gf'],
      'dairy-free': ['dairy-free', 'dairy free'],
      'keto': ['keto', 'ketogenic'],
      'paleo': ['paleo', 'paleolithic'],
      'low-carb': ['low-carb', 'low carb'],
      'nut-free': ['nut-free', 'nut free'],
      'soy-free': ['soy-free', 'soy free']
    };

    for (const [restriction, keywords] of Object.entries(dietaryKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        restrictions.push(restriction);
      }
    }

    return restrictions;
  }

  /**
   * Extract hashtags from content
   */
  private extractTags(content: string): string[] {
    const hashtagPattern = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = hashtagPattern.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return tags;
  }

  /**
   * Estimate recipe difficulty based on number of steps and ingredients
   */
  private estimateDifficulty(instructionCount: number, ingredientCount: number): string {
    const totalComplexity = instructionCount + ingredientCount;
    
    if (totalComplexity <= 5) return 'Easy';
    if (totalComplexity <= 10) return 'Medium';
    return 'Hard';
  }

  /**
   * Parse recipe data from post content
   */
  private parseRecipeFromContent(postData: any): Partial<TwitterRecipeData> {
    const content = postData.content;
    
    // Extract title (usually the first line or after "recipe:")
    const titleMatch = content.match(/^(.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Recipe';

    // Extract ingredients
    const ingredients = this.extractIngredients(content);

    // Extract instructions
    const instructions = this.extractInstructions(content);

    // Extract cooking time
    const cookingTime = this.extractCookingTime(content);

    // Extract servings
    const servings = this.extractServings(content);

    // Extract dietary restrictions
    const dietaryRestrictions = this.extractDietaryRestrictions(content);

    return {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      dietaryRestrictions,
      difficulty: this.estimateDifficulty(instructions.length, ingredients.length),
      tags: this.extractTags(content)
    };
  }
} 