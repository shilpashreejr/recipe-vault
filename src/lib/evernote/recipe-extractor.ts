import { EvernoteNote } from './evernote-service';

export interface ExtractedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  source: string;
  sourceType: 'evernote';
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isVegan?: boolean;
  nutritionalInfo?: any;
  images?: string[];
}

export class RecipeExtractor {
  /**
   * Extract recipe information from Evernote note content
   */
  static extractFromEvernoteNote(note: EvernoteNote): ExtractedRecipe | null {
    const content = note.content;
    if (!content) return null;

    // Remove HTML tags and decode entities
    const cleanContent = this.cleanHtmlContent(content);
    
    // Try to extract recipe information
    const title = this.extractTitle(note.title, cleanContent);
    const ingredients = this.extractIngredients(cleanContent);
    const instructions = this.extractInstructions(cleanContent);
    const cookingTime = this.extractCookingTime(cleanContent);
    const servings = this.extractServings(cleanContent);
    const difficulty = this.extractDifficulty(cleanContent);
    const cuisine = this.extractCuisine(cleanContent);
    const dietaryInfo = this.extractDietaryInfo(cleanContent);
    const images = this.extractImages(note);

    // Only return if we have at least ingredients or instructions
    if (ingredients.length === 0 && instructions.length === 0) {
      return null;
    }

    // Additional check: if the content doesn't look like a recipe, return null
    if (!this.looksLikeRecipe(cleanContent)) {
      return null;
    }

    return {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      cuisine,
      source: `Evernote Note: ${note.title}`,
      sourceType: 'evernote',
      ...dietaryInfo,
      images,
    };
  }

  /**
   * Check if content looks like a recipe
   */
  private static looksLikeRecipe(content: string): boolean {
    const lower = content.toLowerCase();
    const recipeKeywords = [
      'ingredients', 'instructions', 'directions', 'method', 'steps',
      'preheat', 'bake', 'cook', 'mix', 'stir', 'add', 'combine',
      'cup', 'tbsp', 'tsp', 'ounce', 'pound', 'gram', 'serves',
      'recipe', 'dish', 'meal', 'food'
    ];
    
    const hasRecipeKeywords = recipeKeywords.some(keyword => lower.includes(keyword));
    const hasMeasurements = /\d+\s*(cup|tbsp|tsp|oz|pound|gram|g|ml|l)/i.test(content);
    const hasCookingVerbs = /(preheat|bake|cook|mix|stir|add|combine|heat|boil|simmer)/i.test(content);
    
    return hasRecipeKeywords || hasMeasurements || hasCookingVerbs;
  }

  /**
   * Clean HTML content and extract plain text
   */
  private static cleanHtmlContent(content: string): string {
    // Remove HTML tags but preserve line breaks
    let clean = content.replace(/<br\s*\/?>/gi, '\n');
    clean = clean.replace(/<\/p>/gi, '\n');
    clean = clean.replace(/<\/div>/gi, '\n');
    clean = clean.replace(/<\/li>/gi, '\n');
    clean = clean.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    clean = clean.replace(/&nbsp;/g, ' ');
    clean = clean.replace(/&amp;/g, '&');
    clean = clean.replace(/&lt;/g, '<');
    clean = clean.replace(/&gt;/g, '>');
    clean = clean.replace(/&quot;/g, '"');
    clean = clean.replace(/&#39;/g, "'");
    
    // Remove extra whitespace but preserve line breaks
    clean = clean.replace(/[ \t]+/g, ' ');
    clean = clean.replace(/\n\s*\n/g, '\n');
    clean = clean.trim();
    
    return clean;
  }

  /**
   * Extract recipe title
   */
  private static extractTitle(noteTitle: string, content: string): string {
    // Use note title if it looks like a recipe title
    if (noteTitle && this.isRecipeTitle(noteTitle)) {
      return noteTitle;
    }

    // Try to find title in content
    const lines = content.split('\n');
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed && this.isRecipeTitle(trimmed)) {
        return trimmed;
      }
    }

    return noteTitle || 'Untitled Recipe';
  }

  /**
   * Check if text looks like a recipe title
   */
  private static isRecipeTitle(text: string): boolean {
    const lower = text.toLowerCase();
    const recipeKeywords = ['recipe', 'dish', 'meal', 'food', 'cooking', 'baking'];
    return recipeKeywords.some(keyword => lower.includes(keyword)) || 
           (text.length > 3 && text.length < 100 && !text.includes('ingredients') && !text.includes('instructions'));
  }

  /**
   * Extract ingredients from content
   */
  private static extractIngredients(content: string): string[] {
    const ingredients: string[] = [];
    const lines = content.split('\n');
    
    let inIngredientsSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      const lowerTrimmed = trimmed.toLowerCase();
      
      // Check for ingredients section header
      if (lowerTrimmed.includes('ingredients') || lowerTrimmed.includes('ingredient')) {
        inIngredientsSection = true;
        continue;
      }
      
      // Check for end of ingredients section
      if (inIngredientsSection && (lowerTrimmed.includes('instructions') || lowerTrimmed.includes('directions') || lowerTrimmed.includes('method'))) {
        break;
      }
      
      // Extract ingredient lines
      if (inIngredientsSection && trimmed) {
        // Look for common ingredient patterns
        if (this.isIngredientLine(trimmed)) {
          ingredients.push(trimmed);
        }
      }
    }
    
    // If no ingredients section found, try to find ingredient-like lines
    if (ingredients.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && this.isIngredientLine(trimmed)) {
          ingredients.push(trimmed);
        }
      }
    }
    
    return ingredients.slice(0, 50); // Limit to 50 ingredients
  }

  /**
   * Check if a line looks like an ingredient
   */
  private static isIngredientLine(line: string): boolean {
    const lower = line.toLowerCase();
    
    // Skip section headers
    if (lower.includes('ingredients') || lower.includes('instructions') || lower.includes('directions')) {
      return false;
    }
    
    const ingredientPatterns = [
      /\d+\s*(cup|tbsp|tsp|oz|pound|gram|g|ml|l|teaspoon|tablespoon|ounce|pound)/i,
      /^\d+\s*[-–]\s*\w+/,
      /^\d+\s+\w+/,
      /^[a-z]+\s*[-–]\s*\d+/i,
      /^-\s*\w+/,
      /^\*\s*\w+/,
    ];
    
    return ingredientPatterns.some(pattern => pattern.test(line)) ||
           (line.length > 3 && line.length < 200 && !lower.includes('ingredients') && !lower.includes('instructions'));
  }

  /**
   * Extract cooking instructions from content
   */
  private static extractInstructions(content: string): string[] {
    const instructions: string[] = [];
    const lines = content.split('\n');
    
    let inInstructionsSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      const lowerTrimmed = trimmed.toLowerCase();
      
      // Check for instructions section header
      if (lowerTrimmed.includes('instructions') || lowerTrimmed.includes('directions') || lowerTrimmed.includes('method') || lowerTrimmed.includes('steps')) {
        inInstructionsSection = true;
        continue;
      }
      
      // Check for end of instructions section
      if (inInstructionsSection && (lowerTrimmed.includes('ingredients') || lowerTrimmed.includes('serves') || lowerTrimmed.includes('prep time'))) {
        break;
      }
      
      // Extract instruction lines
      if (inInstructionsSection && trimmed) {
        if (this.isInstructionLine(trimmed)) {
          instructions.push(trimmed);
        }
      }
    }
    
    // If no instructions section found, try to find instruction-like lines
    if (instructions.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && this.isInstructionLine(trimmed)) {
          instructions.push(trimmed);
        }
      }
    }
    
    return instructions.slice(0, 50); // Limit to 50 instructions
  }

  /**
   * Check if a line looks like an instruction
   */
  private static isInstructionLine(line: string): boolean {
    const lower = line.toLowerCase();
    
    // Skip section headers
    if (lower.includes('ingredients') || lower.includes('instructions') || lower.includes('directions')) {
      return false;
    }
    
    const instructionPatterns = [
      /^\d+\./,
      /^step\s*\d+/i,
      /^(preheat|heat|add|mix|stir|bake|cook|simmer|boil|fry|grill|roast)/i,
    ];
    
    return instructionPatterns.some(pattern => pattern.test(line)) ||
           (line.length > 10 && line.length < 500 && line.includes(' ') && !lower.includes('ingredients'));
  }

  /**
   * Extract cooking time from content
   */
  private static extractCookingTime(content: string): number | undefined {
    const timePatterns = [
      /(\d+)\s*(?:to\s*\d+\s*)?(?:minutes?|mins?|hours?|hrs?)/gi,
      /cook\s*(?:for\s*)?(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/gi,
      /bake\s*(?:for\s*)?(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/gi,
    ];
    
    for (const pattern of timePatterns) {
      const match = pattern.exec(content);
      if (match) {
        const time = parseInt(match[1]);
        if (time > 0 && time < 1000) {
          return time;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extract number of servings from content
   */
  private static extractServings(content: string): number | undefined {
    const servingPatterns = [
      /serves\s*(\d+)/gi,
      /(\d+)\s*servings?/gi,
      /yields?\s*(\d+)/gi,
    ];
    
    for (const pattern of servingPatterns) {
      const match = pattern.exec(content);
      if (match) {
        const servings = parseInt(match[1]);
        if (servings > 0 && servings < 100) {
          return servings;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extract difficulty level from content
   */
  private static extractDifficulty(content: string): 'easy' | 'medium' | 'hard' | undefined {
    const lower = content.toLowerCase();
    
    if (lower.includes('easy') || lower.includes('simple') || lower.includes('quick')) {
      return 'easy';
    }
    
    if (lower.includes('hard') || lower.includes('difficult') || lower.includes('complex')) {
      return 'hard';
    }
    
    if (lower.includes('medium') || lower.includes('moderate')) {
      return 'medium';
    }
    
    return undefined;
  }

  /**
   * Extract cuisine type from content
   */
  private static extractCuisine(content: string): string | undefined {
    const cuisines = [
      'italian', 'chinese', 'japanese', 'indian', 'mexican', 'french', 'thai', 'greek', 'mediterranean',
      'american', 'british', 'spanish', 'korean', 'vietnamese', 'lebanese', 'turkish', 'moroccan',
      'caribbean', 'african', 'russian', 'german', 'austrian', 'swiss', 'dutch', 'belgian',
    ];
    
    const lower = content.toLowerCase();
    for (const cuisine of cuisines) {
      if (lower.includes(cuisine)) {
        return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
      }
    }
    
    return undefined;
  }

  /**
   * Extract dietary information from content
   */
  private static extractDietaryInfo(content: string): {
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isVegan?: boolean;
  } {
    const lower = content.toLowerCase();
    
    return {
      isVegetarian: lower.includes('vegetarian') || lower.includes('veggie'),
      isGlutenFree: lower.includes('gluten-free') || lower.includes('gluten free'),
      isVegan: lower.includes('vegan'),
    };
  }

  /**
   * Extract image URLs from Evernote note resources
   */
  private static extractImages(note: EvernoteNote): string[] {
    const images: string[] = [];
    
    if (note.resources) {
      for (const resource of note.resources) {
        if (resource.mime && resource.mime.startsWith('image/')) {
          // For now, we'll just store the resource GUID
          // In a real implementation, you'd need to get the actual image URL
          images.push(`evernote-resource:${resource.guid}`);
        }
      }
    }
    
    return images;
  }
} 