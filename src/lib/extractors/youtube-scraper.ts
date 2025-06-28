import { RateLimiter, RateLimitPresets } from './rate-limiter';
import { ScrapingErrorHandler } from './error-handler';

export interface YouTubeRecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string | null;
  servings?: number | null;
  dietaryRestrictions: string[];
  difficulty?: string;
  tags: string[];
  source: string;
  sourceType: 'youtube';
  extractedAt: string;
  metadata: {
    videoId: string;
    channel: string;
    publishedAt: string;
    views: number;
    likes: number;
  };
}

export class YouTubeScraper {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter(RateLimitPresets.conservative);
  }

  async scrapeYouTubeRecipe(url: string): Promise<YouTubeRecipeData> {
    try {
      if (!this.isValidYouTubeUrl(url)) {
        throw new Error('Invalid YouTube URL format');
      }
      await this.rateLimiter.waitForPermission();
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Could not extract video ID from URL');
      }
      // Simulate fetching video data (in production, use YouTube Data API)
      const videoData = await this.fetchVideoData(videoId);
      const recipeData = this.parseRecipeFromDescription(videoData.description);
      if (!recipeData.title || !recipeData.ingredients || recipeData.ingredients.length === 0 || !recipeData.instructions || recipeData.instructions.length === 0) {
        throw new Error('Insufficient recipe data found in video description');
      }
      return {
        title: recipeData.title,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        cookingTime: recipeData.cookingTime || null,
        servings: recipeData.servings || null,
        dietaryRestrictions: recipeData.dietaryRestrictions || [],
        tags: recipeData.tags || [],
        difficulty: recipeData.difficulty || 'Medium',
        source: url,
        sourceType: 'youtube',
        extractedAt: new Date().toISOString(),
        metadata: {
          videoId,
          channel: videoData.channel,
          publishedAt: videoData.publishedAt,
          views: videoData.views,
          likes: videoData.likes
        }
      };
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Invalid YouTube URL format') ||
        error.message.includes('Could not extract video ID from URL') ||
        error.message.includes('Insufficient recipe data found in video description')
      )) {
        throw error;
      }
      const scrapingError = ScrapingErrorHandler.parseError(error, url);
      throw new Error(ScrapingErrorHandler.getErrorMessage(scrapingError));
    }
  }

  private isValidYouTubeUrl(url: string): boolean {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(url);
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(/[?&]v=([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/);
    return match ? match[1] : null;
  }

  private async fetchVideoData(videoId: string): Promise<any> {
    // Simulated data for testing
    return {
      description: `Amazing Pasta Recipe\n\nIngredients:\n- 200g pasta\n- 2 cups tomato sauce\n- 1 onion\n- 2 cloves garlic\n\nInstructions:\n1. Boil pasta\n2. Saute onion and garlic\n3. Add tomato sauce\n4. Mix with pasta\n\n#pasta #recipe #cooking`,
      channel: 'Recipe Channel',
      publishedAt: new Date().toISOString(),
      views: 10000,
      likes: 500
    };
  }

  private parseRecipeFromDescription(description: string): Partial<YouTubeRecipeData> {
    // Title: first line
    const lines = description.split('\n').map(l => l.trim()).filter(Boolean);
    const title = lines[0] || 'Untitled Recipe';
    // Ingredients
    const ingredients = this.extractIngredients(description);
    // Instructions
    const instructions = this.extractInstructions(description);
    // Cooking time
    const cookingTime = this.extractCookingTime(description);
    // Servings
    const servings = this.extractServings(description);
    // Dietary restrictions
    const dietaryRestrictions = this.extractDietaryRestrictions(description);
    // Tags
    const tags = this.extractTags(description);
    // Difficulty
    const difficulty = this.estimateDifficulty(instructions.length, ingredients.length);
    return { title, ingredients, instructions, cookingTime, servings, dietaryRestrictions, tags, difficulty };
  }

  private extractIngredients(content: string): string[] {
    const ingredients: string[] = [];
    const match = content.match(/ingredients?:\s*\n([\s\S]*?)(?=\n\n|\ninstructions?|$)/i);
    if (match) {
      const lines = match[1].split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      for (const line of lines) {
        if (!line.match(/^(ingredients?|instructions?|directions?):/i)) {
          ingredients.push(line);
        }
      }
    }
    return ingredients;
  }

  private extractInstructions(content: string): string[] {
    const instructions: string[] = [];
    const match = content.match(/instructions?:\s*\n([\s\S]*?)(?=\n\n|$)/i);
    if (match) {
      const lines = match[1].split('\n').map(l => l.replace(/^\d+\.?\s*/, '').trim()).filter(Boolean);
      for (const line of lines) {
        if (!line.match(/^(ingredients?|instructions?|directions?):/i)) {
          instructions.push(line);
        }
      }
    }
    return instructions;
  }

  private extractCookingTime(content: string): string | null {
    const match = content.match(/(\d+)\s*(min|minutes?|hr|hour|hours?)/i);
    return match ? match[0] : null;
  }

  private extractServings(content: string): number | null {
    const match = content.match(/(\d+)\s*(servings?|people|portions?)/i) || content.match(/serves\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  private extractDietaryRestrictions(content: string): string[] {
    const restrictions: string[] = [];
    const lower = content.toLowerCase();
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
      if (keywords.some(keyword => lower.includes(keyword))) {
        restrictions.push(restriction);
      }
    }
    return restrictions;
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const regex = /#(\w+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  private estimateDifficulty(instructionCount: number, ingredientCount: number): string {
    const total = instructionCount + ingredientCount;
    if (total <= 5) return 'Easy';
    if (total <= 10) return 'Medium';
    return 'Hard';
  }
} 