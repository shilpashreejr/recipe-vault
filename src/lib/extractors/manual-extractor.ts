import { ScrapedRecipe } from './web-scraper';

export interface ManualRecipeInput {
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
  images?: string[];
  source?: string;
  notes?: string;
}

export interface ManualExtractionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ManualExtractor {
  static validateInput(input: ManualRecipeInput): ManualExtractionValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!input.title || input.title.trim().length === 0) {
      errors.push('Recipe title is required');
    } else if (input.title.trim().length < 3) {
      warnings.push('Recipe title seems too short');
    }

    if (!input.ingredients || input.ingredients.length === 0) {
      errors.push('At least one ingredient is required');
    } else {
      const validIngredients = input.ingredients.filter(ingredient => 
        ingredient && ingredient.trim().length > 0
      );
      if (validIngredients.length === 0) {
        errors.push('All ingredients are empty');
      } else if (validIngredients.length < input.ingredients.length) {
        warnings.push('Some ingredients are empty and will be ignored');
      }
    }

    if (!input.instructions || input.instructions.length === 0) {
      errors.push('At least one instruction step is required');
    } else {
      const validInstructions = input.instructions.filter(instruction => 
        instruction && instruction.trim().length > 0
      );
      if (validInstructions.length === 0) {
        errors.push('All instruction steps are empty');
      } else if (validInstructions.length < input.instructions.length) {
        warnings.push('Some instruction steps are empty and will be ignored');
      }
    }

    // Optional field validation
    if (input.cookingTime && input.cookingTime.trim().length > 0) {
      if (!this.isValidTimeFormat(input.cookingTime)) {
        warnings.push('Cooking time format might be unclear (e.g., "30 minutes", "1 hour")');
      }
    }

    if (input.servings && input.servings.trim().length > 0) {
      if (!this.isValidServingFormat(input.servings)) {
        warnings.push('Servings format might be unclear (e.g., "4 servings", "serves 6")');
      }
    }

    if (input.nutrition) {
      const nutrition = input.nutrition;
      if (nutrition.calories && !this.isValidNutritionFormat(nutrition.calories)) {
        warnings.push('Calories format might be unclear (e.g., "250 calories")');
      }
      if (nutrition.protein && !this.isValidNutritionFormat(nutrition.protein)) {
        warnings.push('Protein format might be unclear (e.g., "15g protein")');
      }
      if (nutrition.carbs && !this.isValidNutritionFormat(nutrition.carbs)) {
        warnings.push('Carbs format might be unclear (e.g., "30g carbs")');
      }
      if (nutrition.fat && !this.isValidNutritionFormat(nutrition.fat)) {
        warnings.push('Fat format might be unclear (e.g., "10g fat")');
      }
    }

    if (input.images && input.images.length > 0) {
      const validImages = input.images.filter(image => 
        image && image.trim().length > 0 && this.isValidImageUrl(image)
      );
      if (validImages.length < input.images.length) {
        warnings.push('Some image URLs appear to be invalid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static createRecipe(input: ManualRecipeInput, source?: string): ScrapedRecipe {
    // Clean and validate input
    const validation = this.validateInput(input);
    if (!validation.isValid) {
      throw new Error(`Invalid recipe input: ${validation.errors.join(', ')}`);
    }

    // Clean ingredients and instructions
    const cleanIngredients = input.ingredients
      .filter(ingredient => ingredient && ingredient.trim().length > 0)
      .map(ingredient => ingredient.trim());

    const cleanInstructions = input.instructions
      .filter(instruction => instruction && instruction.trim().length > 0)
      .map(instruction => instruction.trim());

    // Clean images
    const cleanImages = input.images
      ? input.images
          .filter(image => image && image.trim().length > 0 && this.isValidImageUrl(image))
          .map(image => image.trim())
      : [];

    return {
      title: input.title.trim(),
      ingredients: cleanIngredients,
      instructions: cleanInstructions,
      cookingTime: input.cookingTime?.trim(),
      servings: input.servings?.trim(),
      difficulty: input.difficulty?.trim(),
      nutrition: input.nutrition,
      images: cleanImages,
      source: source || input.source || 'Manual Entry',
      extractedAt: new Date()
    };
  }

  static suggestRecipeName(ingredients: string[]): string {
    if (ingredients.length === 0) {
      return 'Untitled Recipe';
    }

    // Look for common recipe name patterns in ingredients
    const commonIngredients = ingredients.map(ingredient => 
      ingredient.toLowerCase().trim()
    );

    // Check for main protein
    const proteins = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'tofu', 'lentils', 'beans'];
    const foundProtein = proteins.find(protein => 
      commonIngredients.some(ingredient => ingredient.includes(protein))
    );

    // Check for main vegetable
    const vegetables = ['pasta', 'rice', 'potato', 'tomato', 'onion', 'garlic', 'spinach', 'broccoli', 'carrot'];
    const foundVegetable = vegetables.find(vegetable => 
      commonIngredients.some(ingredient => ingredient.includes(vegetable))
    );

    // Check for cooking method
    const methods = ['baked', 'grilled', 'fried', 'roasted', 'steamed', 'stir-fried', 'soup', 'salad'];
    const foundMethod = methods.find(method => 
      commonIngredients.some(ingredient => ingredient.includes(method))
    );

    // Build suggested name
    let suggestedName = '';
    
    if (foundMethod) {
      suggestedName += foundMethod.charAt(0).toUpperCase() + foundMethod.slice(1) + ' ';
    }
    
    if (foundProtein) {
      suggestedName += foundProtein.charAt(0).toUpperCase() + foundProtein.slice(1);
    } else if (foundVegetable) {
      suggestedName += foundVegetable.charAt(0).toUpperCase() + foundVegetable.slice(1);
    } else {
      suggestedName += 'Recipe';
    }

    return suggestedName || 'Untitled Recipe';
  }

  static parseIngredientsFromText(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim());
    const ingredients: string[] = [];

    for (const line of lines) {
      if (line.length === 0) continue;

      // Remove common list markers
      const cleanLine = line
        .replace(/^[\d\-•\*\.\s]+/, '') // Remove leading numbers, dashes, bullets, dots
        .trim();

      if (cleanLine.length > 0) {
        ingredients.push(cleanLine);
      }
    }

    return ingredients;
  }

  static parseInstructionsFromText(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim());
    const instructions: string[] = [];

    for (const line of lines) {
      if (line.length === 0) continue;

      // Remove common list markers
      const cleanLine = line
        .replace(/^[\d\-•\*\.\s]+/, '') // Remove leading numbers, dashes, bullets, dots
        .trim();

      if (cleanLine.length > 0) {
        instructions.push(cleanLine);
      }
    }

    return instructions;
  }

  private static isValidTimeFormat(time: string): boolean {
    const timePatterns = [
      /\d+\s*(?:min|minute|minutes)/i,
      /\d+\s*(?:hr|hour|hours)/i,
      /\d+\s*(?:h|m)/i,
      /\d+:\d+/ // HH:MM format
    ];
    
    return timePatterns.some(pattern => pattern.test(time));
  }

  private static isValidServingFormat(servings: string): boolean {
    const servingPatterns = [
      /\d+\s*(?:serving|servings)/i,
      /serves\s*\d+/i,
      /\d+\s*(?:person|people)/i
    ];
    
    return servingPatterns.some(pattern => pattern.test(servings));
  }

  private static isValidNutritionFormat(nutrition: string): boolean {
    const nutritionPatterns = [
      /\d+\s*(?:calorie|calories)/i,
      /\d+\s*(?:g|gram|grams)\s*(?:protein|carbs|carbohydrate|fat)/i,
      /\d+\s*(?:mg|mcg)/i
    ];
    
    return nutritionPatterns.some(pattern => pattern.test(nutrition));
  }

  private static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      return validProtocols.includes(urlObj.protocol) && 
             (validExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext)) ||
              urlObj.hostname.includes('img') ||
              urlObj.hostname.includes('image'));
    } catch {
      return false;
    }
  }
} 