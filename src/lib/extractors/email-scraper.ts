import { RateLimiter, RateLimitPresets } from './rate-limiter';
import { ScrapingErrorHandler } from './error-handler';

export interface EmailRecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string | null;
  servings?: number | null;
  dietaryRestrictions: string[];
  difficulty?: string;
  tags: string[];
  source: string;
  sourceType: 'email';
  extractedAt: string;
  metadata: {
    emailId: string;
    sender: string;
    subject: string;
    timestamp: string;
    isForwarded: boolean;
    originalSender?: string;
    recipients?: string[];
  };
}

export class EmailScraper {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter(RateLimitPresets.conservative);
  }

  async scrapeEmailRecipe(emailContent: string, metadata?: {
    emailId?: string;
    sender?: string;
    subject?: string;
    timestamp?: string;
    isForwarded?: boolean;
    originalSender?: string;
    recipients?: string[];
  }): Promise<EmailRecipeData> {
    try {
      if (!emailContent || emailContent.trim().length === 0) {
        throw new Error('Empty email content');
      }

      await this.rateLimiter.waitForPermission();

      // Clean and parse the email content
      const cleanedContent = this.cleanEmailContent(emailContent);
      const recipeData = this.parseRecipeFromEmail(cleanedContent);

      if (!recipeData.title || !recipeData.ingredients || recipeData.ingredients.length === 0 || 
          !recipeData.instructions || recipeData.instructions.length === 0) {
        throw new Error('Insufficient recipe data found in email');
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
        source: 'email-forward',
        sourceType: 'email',
        extractedAt: new Date().toISOString(),
        metadata: {
          emailId: metadata?.emailId || this.generateEmailId(),
          sender: metadata?.sender || 'Unknown',
          subject: metadata?.subject || 'Recipe Email',
          timestamp: metadata?.timestamp || new Date().toISOString(),
          isForwarded: metadata?.isForwarded || false,
          originalSender: metadata?.originalSender,
          recipients: metadata?.recipients || []
        }
      };

    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Empty email content') ||
        error.message.includes('Insufficient recipe data found in email')
      )) {
        throw error;
      }
      
      const scrapingError = ScrapingErrorHandler.parseError(error, 'email-forward');
      throw new Error(ScrapingErrorHandler.getErrorMessage(scrapingError));
    }
  }

  private cleanEmailContent(content: string): string {
    // Remove email headers and metadata
    let cleaned = content
      // Remove email headers
      .replace(/^From:.*$/gm, '')
      .replace(/^To:.*$/gm, '')
      .replace(/^Subject:.*$/gm, '')
      .replace(/^Date:.*$/gm, '')
      .replace(/^Cc:.*$/gm, '')
      .replace(/^Bcc:.*$/gm, '')
      .replace(/^Reply-To:.*$/gm, '')
      .replace(/^Message-ID:.*$/gm, '')
      .replace(/^MIME-Version:.*$/gm, '')
      .replace(/^Content-Type:.*$/gm, '')
      .replace(/^Content-Transfer-Encoding:.*$/gm, '')
      // Remove forwarded email indicators
      .replace(/^.*?Forwarded message.*?\n/gm, '')
      .replace(/^.*?Begin forwarded message.*?\n/gm, '')
      .replace(/^.*?Original Message.*?\n/gm, '')
      .replace(/^.*?From:.*?\n/gm, '')
      .replace(/^.*?Sent:.*?\n/gm, '')
      .replace(/^.*?To:.*?\n/gm, '')
      .replace(/^.*?Subject:.*?\n/gm, '')
      // Remove email signatures
      .replace(/--\s*\n[\s\S]*$/, '') // Remove everything after --
      .replace(/Best regards,.*$/s, '')
      .replace(/Sincerely,.*$/s, '')
      .replace(/Thank you,.*$/s, '')
      .replace(/Cheers,.*$/s, '')
      .replace(/Regards,.*$/s, '')
      // Remove quoted text (lines starting with >)
      .replace(/^>.*$/gm, '')
      // Remove multiple newlines and whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      // Trim whitespace
      .trim();

    return cleaned;
  }

  private parseRecipeFromEmail(content: string): Partial<EmailRecipeData> {
    // Extract title (usually the first line or subject)
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const title = lines[0] || 'Untitled Recipe';

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

    // Extract tags
    const tags = this.extractTags(content);

    // Estimate difficulty
    const difficulty = this.estimateDifficulty(instructions.length, ingredients.length);

    return {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      dietaryRestrictions,
      tags,
      difficulty
    };
  }

  private extractIngredients(content: string): string[] {
    const ingredients: string[] = [];
    
    // Look for ingredients section with various patterns
    const ingredientPatterns = [
      /ingredients?:\s*\n([\s\S]*?)(?=\n\n|\ninstructions?|\ndirections?|$)/i,
      /ingredientes?:\s*\n([\s\S]*?)(?=\n\n|\ninstrucciones?|\ndirecciones?|$)/i,
      /ingredientes?:\s*\n([\s\S]*?)(?=\n\n|\ninstrucoes?|\ndirecoes?|$)/i,
      /what you'll need:\s*\n([\s\S]*?)(?=\n\n|\ninstructions?|\ndirections?|$)/i,
      /you'll need:\s*\n([\s\S]*?)(?=\n\n|\ninstructions?|\ndirections?|$)/i
    ];

    for (const pattern of ingredientPatterns) {
      const match = content.match(pattern);
      if (match) {
        const lines = match[1].split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const cleanLine = line.replace(/^[-•*▪️▫️]\s*/, '').trim();
          if (cleanLine && !cleanLine.match(/^(ingredients?|instructions?|directions?|ingredientes?|instrucciones?|instrucoes?):/i)) {
            ingredients.push(cleanLine);
          }
        }
        break;
      }
    }

    // Fallback: look for bullet points or numbered lists
    if (ingredients.length === 0) {
      const bulletPattern = /^[-•*▪️▫️]\s*(.+)$/gm;
      let match;
      while ((match = bulletPattern.exec(content)) !== null) {
        const ingredient = match[1].trim();
        if (ingredient && !ingredient.match(/^(ingredients?|instructions?|directions?|ingredientes?|instrucciones?|instrucoes?):/i)) {
          ingredients.push(ingredient);
        }
      }
    }

    return ingredients;
  }

  private extractInstructions(content: string): string[] {
    const instructions: string[] = [];
    
    // Look for instructions section with various patterns
    const instructionPatterns = [
      /instructions?:\s*\n([\s\S]*?)(?=\n\n|$)/i,
      /directions?:\s*\n([\s\S]*?)(?=\n\n|$)/i,
      /instrucciones?:\s*\n([\s\S]*?)(?=\n\n|$)/i,
      /instrucoes?:\s*\n([\s\S]*?)(?=\n\n|$)/i,
      /method:\s*\n([\s\S]*?)(?=\n\n|$)/i,
      /steps:\s*\n([\s\S]*?)(?=\n\n|$)/i,
      /how to make:\s*\n([\s\S]*?)(?=\n\n|$)/i
    ];

    for (const pattern of instructionPatterns) {
      const match = content.match(pattern);
      if (match) {
        const lines = match[1].split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const cleanLine = line.replace(/^\d+\.?\s*/, '').trim();
          if (cleanLine && !cleanLine.match(/^(ingredients?|instructions?|directions?|ingredientes?|instrucciones?|instrucoes?):/i)) {
            instructions.push(cleanLine);
          }
        }
        break;
      }
    }

    // Fallback: look for numbered steps
    if (instructions.length === 0) {
      const stepPattern = /^\d+\.?\s*(.+)$/gm;
      let match;
      while ((match = stepPattern.exec(content)) !== null) {
        const instruction = match[1].trim();
        if (instruction && !instruction.match(/^(ingredients?|instructions?|directions?|ingredientes?|instrucciones?|instrucoes?):/i)) {
          instructions.push(instruction);
        }
      }
    }

    return instructions;
  }

  private extractCookingTime(content: string): string | null {
    const timePatterns = [
      /(\d+)\s*(?:min|minutes?|mins?)/i,
      /(\d+)\s*(?:hr|hour|hours?|h)/i,
      /cook(?:ing)?\s*(?:time|for)\s*(\d+)\s*(?:min|minutes?|hr|hour|hours?)/i,
      /bake\s*(?:for\s*)?(\d+)\s*(?:min|minutes?|hr|hour|hours?)/i,
      /prep(?:aration)?\s*(?:time|for)\s*(\d+)\s*(?:min|minutes?|hr|hour|hours?)/i,
      /total\s*(?:time|for)\s*(\d+)\s*(?:min|minutes?|hr|hour|hours?)/i
    ];

    for (const pattern of timePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  private extractServings(content: string): number | null {
    const servingPatterns = [
      /(\d+)\s*(?:servings?|people|portions?|personas?|pessoas?)/i,
      /serves\s*(\d+)/i,
      /yields?\s*(\d+)/i,
      /makes\s*(\d+)/i,
      /feeds\s*(\d+)/i,
      /para\s*(\d+)\s*(?:personas?|pessoas?)/i,
      /serve\s*(\d+)\s*(?:personas?|pessoas?)/i
    ];

    for (const pattern of servingPatterns) {
      const match = content.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  }

  private extractDietaryRestrictions(content: string): string[] {
    const restrictions: string[] = [];
    const lowerContent = content.toLowerCase();

    const dietaryKeywords = {
      'vegetarian': ['vegetarian', 'veggie', 'vegetariano', 'vegetariana'],
      'vegan': ['vegan', 'vegano', 'vegana'],
      'gluten-free': ['gluten-free', 'gluten free', 'gf', 'sin gluten', 'sem gluten'],
      'dairy-free': ['dairy-free', 'dairy free', 'sin lacteos', 'sem lactose'],
      'keto': ['keto', 'ketogenic', 'cetogenico', 'cetogenica'],
      'paleo': ['paleo', 'paleolithic', 'paleolitico'],
      'low-carb': ['low-carb', 'low carb', 'bajo en carbohidratos', 'baixo em carboidratos'],
      'nut-free': ['nut-free', 'nut free', 'sin frutos secos', 'sem frutos secos'],
      'soy-free': ['soy-free', 'soy free', 'sin soja', 'sem soja'],
      'halal': ['halal'],
      'kosher': ['kosher']
    };

    for (const [restriction, keywords] of Object.entries(dietaryKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        restrictions.push(restriction);
      }
    }

    return restrictions;
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    
    // Extract hashtags
    const hashtagPattern = /#(\w+)/g;
    let match;
    while ((match = hashtagPattern.exec(content)) !== null) {
      tags.push(match[1]);
    }

    // Extract common recipe keywords
    const recipeKeywords = [
      'recipe', 'cooking', 'food', 'meal', 'dish', 'cuisine',
      'breakfast', 'lunch', 'dinner', 'dessert', 'snack',
      'appetizer', 'main course', 'side dish', 'soup', 'salad',
      'bread', 'cake', 'cookie', 'pie', 'pasta', 'rice',
      'chicken', 'beef', 'fish', 'vegetarian', 'vegan'
    ];

    const lowerContent = content.toLowerCase();
    for (const keyword of recipeKeywords) {
      if (lowerContent.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return tags;
  }

  private estimateDifficulty(instructionCount: number, ingredientCount: number): string {
    const totalComplexity = instructionCount + ingredientCount;
    
    if (totalComplexity <= 5) return 'Easy';
    if (totalComplexity <= 10) return 'Medium';
    return 'Hard';
  }

  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 