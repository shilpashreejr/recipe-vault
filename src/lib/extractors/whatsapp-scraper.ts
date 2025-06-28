import { RateLimiter, RateLimitPresets } from './rate-limiter';
import { ScrapingErrorHandler } from './error-handler';

export interface WhatsAppRecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string | null;
  servings?: number | null;
  dietaryRestrictions: string[];
  difficulty?: string;
  tags: string[];
  source: string;
  sourceType: 'whatsapp';
  extractedAt: string;
  metadata: {
    messageId: string;
    sender: string;
    timestamp: string;
    isForwarded: boolean;
    originalSender?: string;
  };
}

export class WhatsAppScraper {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter(RateLimitPresets.conservative);
  }

  async scrapeWhatsAppRecipe(messageContent: string, metadata?: {
    messageId?: string;
    sender?: string;
    timestamp?: string;
    isForwarded?: boolean;
    originalSender?: string;
  }): Promise<WhatsAppRecipeData> {
    try {
      if (!messageContent || messageContent.trim().length === 0) {
        throw new Error('Empty WhatsApp message content');
      }

      await this.rateLimiter.waitForPermission();

      // Clean and parse the message content
      const cleanedContent = this.cleanMessageContent(messageContent);
      const recipeData = this.parseRecipeFromMessage(cleanedContent);

      if (!recipeData.title || !recipeData.ingredients || recipeData.ingredients.length === 0 || 
          !recipeData.instructions || recipeData.instructions.length === 0) {
        throw new Error('Insufficient recipe data found in WhatsApp message');
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
        source: 'whatsapp-message',
        sourceType: 'whatsapp',
        extractedAt: new Date().toISOString(),
        metadata: {
          messageId: metadata?.messageId || this.generateMessageId(),
          sender: metadata?.sender || 'Unknown',
          timestamp: metadata?.timestamp || new Date().toISOString(),
          isForwarded: metadata?.isForwarded || false,
          originalSender: metadata?.originalSender
        }
      };

    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Empty WhatsApp message content') ||
        error.message.includes('Insufficient recipe data found in WhatsApp message')
      )) {
        throw error;
      }
      
      const scrapingError = ScrapingErrorHandler.parseError(error, 'whatsapp-message');
      throw new Error(ScrapingErrorHandler.getErrorMessage(scrapingError));
    }
  }

  private cleanMessageContent(content: string): string {
    // Remove WhatsApp-specific formatting and metadata
    let cleaned = content
      // Remove forwarded message indicators
      .replace(/^.*?Forwarded message.*?\n/gm, '')
      .replace(/^.*?Mensaje reenviado.*?\n/gm, '')
      .replace(/^.*?Mensagem encaminhada.*?\n/gm, '')
      // Remove timestamp patterns
      .replace(/\d{1,2}:\d{2}\s*(?:AM|PM)?/g, '')
      // Remove phone number patterns
      .replace(/\+\d{1,3}\s?\d{3}\s?\d{3}\s?\d{4}/g, '')
      // Remove "You" or "Yo" indicators
      .replace(/^(You|Yo):\s*/gm, '')
      // Remove multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();

    return cleaned;
  }

  private parseRecipeFromMessage(content: string): Partial<WhatsAppRecipeData> {
    // Extract title (usually the first line)
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

    // Extract tags (emojis and hashtags)
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
      /ingredientes?:\s*\n([\s\S]*?)(?=\n\n|\ninstrucoes?|\ndirecoes?|$)/i
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

    // Fallback: look for bullet points or emoji indicators
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
      /instrucoes?:\s*\n([\s\S]*?)(?=\n\n|$)/i
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
      /tiempo\s*(?:de\s*)?cocina(?:r)?\s*(\d+)\s*(?:min|minutos?|hr|hora|horas?)/i,
      /tempo\s*(?:de\s*)?cozinh(?:ar|a)\s*(\d+)\s*(?:min|minutos?|hr|hora|horas?)/i
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
      'soy-free': ['soy-free', 'soy free', 'sin soja', 'sem soja']
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

    // Extract common food emojis and convert to tags
    const emojiToTag: { [key: string]: string } = {
      '🍕': 'pizza',
      '🍝': 'pasta',
      '🍜': 'noodles',
      '🍚': 'rice',
      '🍞': 'bread',
      '🥖': 'bread',
      '🥐': 'croissant',
      '🥨': 'pretzel',
      '🥯': 'bagel',
      '🥞': 'pancakes',
      '🧇': 'waffles',
      '🥓': 'bacon',
      '🍖': 'meat',
      '🍗': 'chicken',
      '🥩': 'steak',
      '🍤': 'shrimp',
      '🐟': 'fish',
      '🐠': 'fish',
      '🥬': 'vegetables',
      '🥦': 'broccoli',
      '🥕': 'carrot',
      '🥒': 'cucumber',
      '🍅': 'tomato',
      '🥑': 'avocado',
      '🍎': 'apple',
      '🍌': 'banana',
      '🍓': 'strawberry',
      '🍇': 'grapes',
      '🍊': 'orange',
      '🍋': 'lemon',
      '🍰': 'cake',
      '🧁': 'cupcake',
      '🍪': 'cookie',
      '🍩': 'donut',
      '🍦': 'ice cream',
      '🍨': 'ice cream',
      '🍧': 'shaved ice',
      '☕': 'coffee',
      '🍵': 'tea',
      '🥤': 'soda',
      '🍺': 'beer',
      '🍷': 'wine',
      '🍸': 'cocktail',
      '🥂': 'champagne'
    };

    for (const [emoji, tag] of Object.entries(emojiToTag)) {
      if (content.includes(emoji)) {
        tags.push(tag);
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

  private generateMessageId(): string {
    return `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 