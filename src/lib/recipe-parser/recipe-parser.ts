import { Recipe, Ingredient, NutritionalInfo } from '../../types';

export interface ParsedRecipeData {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisineType?: string;
  dietaryTags: string[];
  macros?: NutritionalInfo;
  categories: string[];
}

export interface ParsingOptions {
  extractNutrition?: boolean;
  detectDietaryRestrictions?: boolean;
  categorizeRecipe?: boolean;
  normalizeIngredients?: boolean;
  validateInstructions?: boolean;
}

export class RecipeParser {
  private static readonly TIME_PATTERNS = [
    /(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:hours?|hrs?|h)/gi,
    /(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:minutes?|mins?|min)/gi,
    /(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:seconds?|secs?|s)/gi,
  ];

  private static readonly SERVING_PATTERNS = [
    /serves?\s*(\d+)/gi,
    /(\d+)\s*servings?/gi,
    /for\s*(\d+)\s*people/gi,
    /(\d+)\s*portions?/gi,
  ];

  private static readonly DIFFICULTY_PATTERNS = [
    { pattern: /\b(easy|simple|quick|basic)\b/gi, level: 'easy' as const },
    { pattern: /\b(medium|moderate|intermediate)\b/gi, level: 'medium' as const },
    { pattern: /\b(hard|difficult|complex|advanced|challenging)\b/gi, level: 'hard' as const },
  ];

  private static readonly CUISINE_PATTERNS = [
    { pattern: /\b(italian|pasta|pizza|risotto)\b/gi, cuisine: 'Italian' },
    { pattern: /\b(chinese|asian|stir-fry|dim\s*sum)\b/gi, cuisine: 'Chinese' },
    { pattern: /\b(indian|curry|tandoori|biryani)\b/gi, cuisine: 'Indian' },
    { pattern: /\b(mexican|taco|enchilada|guacamole)\b/gi, cuisine: 'Mexican' },
    { pattern: /\b(japanese|sushi|ramen|tempura)\b/gi, cuisine: 'Japanese' },
    { pattern: /\b(thai|pad\s*thai|tom\s*yum)\b/gi, cuisine: 'Thai' },
    { pattern: /\b(french|coq\s*au\s*vin|ratatouille)\b/gi, cuisine: 'French' },
    { pattern: /\b(mediterranean|greek|falafel|hummus)\b/gi, cuisine: 'Mediterranean' },
    { pattern: /\b(american|burger|bbq|mac\s*and\s*cheese)\b/gi, cuisine: 'American' },
  ];

  private static readonly DIETARY_RESTRICTIONS = [
    { pattern: /\b(vegetarian|veggie)\b/gi, tag: 'vegetarian' },
    { pattern: /\b(vegan|plant-based)\b/gi, tag: 'vegan' },
    { pattern: /\b(gluten-free|gluten\s*free)\b/gi, tag: 'gluten-free' },
    { pattern: /\b(dairy-free|dairy\s*free|lactose-free)\b/gi, tag: 'dairy-free' },
    { pattern: /\b(nut-free|peanut-free)\b/gi, tag: 'nut-free' },
    { pattern: /\b(keto|ketogenic)\b/gi, tag: 'keto' },
    { pattern: /\b(paleo|paleolithic)\b/gi, tag: 'paleo' },
    { pattern: /\b(low-carb|low\s*carb)\b/gi, tag: 'low-carb' },
    { pattern: /\b(high-protein|high\s*protein)\b/gi, tag: 'high-protein' },
    { pattern: /\b(organic|natural)\b/gi, tag: 'organic' },
  ];

  private static readonly RECIPE_CATEGORIES = [
    { pattern: /\b(breakfast|pancake|waffle|omelette|scramble)\b/gi, category: 'Breakfast' },
    { pattern: /\b(lunch|sandwich|wrap|salad)\b/gi, category: 'Lunch' },
    { pattern: /\b(dinner|main\s*course|entree)\b/gi, category: 'Dinner' },
    { pattern: /\b(dessert|sweet|cake|cookie|pie|ice\s*cream)\b/gi, category: 'Dessert' },
    { pattern: /\b(snack|appetizer|starter|finger\s*food)\b/gi, category: 'Snacks & Appetizers' },
    { pattern: /\b(soup|stew|broth|bisque)\b/gi, category: 'Soups & Stews' },
    { pattern: /\b(sauce|dressing|dip|spread)\b/gi, category: 'Sauces & Dressings' },
    { pattern: /\b(bread|bun|roll|muffin|biscuit)\b/gi, category: 'Breads & Baked Goods' },
    { pattern: /\b(drink|beverage|smoothie|juice|cocktail)\b/gi, category: 'Beverages' },
    { pattern: /\b(side\s*dish|accompaniment)\b/gi, category: 'Side Dishes' },
  ];

  private static readonly NUTRITION_PATTERNS = [
    { pattern: /(\d+(?:\.\d+)?)\s*(?:calories?|cal)/gi, key: 'calories' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?protein/gi, key: 'protein' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?(?:carbs|carbohydrates)/gi, key: 'carbs' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?fat/gi, key: 'fat' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?fiber/gi, key: 'fiber' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?sugar/gi, key: 'sugar' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:mg|milligrams?)\s*(?:of\s*)?sodium/gi, key: 'sodium' },
  ];

  /**
   * Parse raw recipe text into structured recipe data
   */
  static parseRecipe(
    rawText: string,
    options: ParsingOptions = {}
  ): ParsedRecipeData {
    const {
      extractNutrition = true,
      detectDietaryRestrictions = true,
      categorizeRecipe = true,
      normalizeIngredients = true,
      validateInstructions = true,
    } = options;

    // Extract basic recipe information
    const title = this.extractTitle(rawText);
    const description = this.extractDescription(rawText);
    const ingredients = this.parseIngredients(rawText, normalizeIngredients);
    const instructions = this.parseInstructions(rawText, validateInstructions);
    const prepTime = this.extractPrepTime(rawText);
    const cookTime = this.extractCookTime(rawText);
    const servings = this.extractServings(rawText);
    const difficulty = this.extractDifficulty(rawText);
    const cuisineType = this.extractCuisineType(rawText);

    // Extract additional information based on options
    const dietaryTags = detectDietaryRestrictions 
      ? this.detectDietaryRestrictions(rawText, ingredients)
      : [];
    
    const macros = extractNutrition 
      ? this.extractNutritionalInfo(rawText)
      : undefined;
    
    const categories = categorizeRecipe 
      ? this.categorizeRecipe(rawText, title, ingredients)
      : [];

    return {
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisineType,
      dietaryTags,
      macros,
      categories,
    };
  }

  /**
   * Extract recipe title from raw text
   */
  private static extractTitle(rawText: string): string {
    const lines = rawText.split('\n').map(line => line.trim());
    
    // Look for the first non-empty line that could be a title
    for (const line of lines) {
      if (line.length === 0) continue;
      
      // Skip lines that are clearly not titles
      if (this.isLikelyNotTitle(line)) continue;
      
      // Clean up the title
      return this.cleanTitle(line);
    }
    
    return 'Untitled Recipe';
  }

  /**
   * Extract recipe description from raw text
   */
  private static extractDescription(rawText: string): string | undefined {
    const lines = rawText.split('\n').map(line => line.trim());
    const titleIndex = lines.findIndex(line => 
      line.length > 0 && !this.isLikelyNotTitle(line)
    );
    if (titleIndex === -1) return undefined;
    // Look for the first non-empty, non-section-header line after the title
    for (let i = titleIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 0) continue;
      if (this.isIngredientsSectionHeader(line) || this.isInstructionsSectionHeader(line) || this.isOtherSectionHeader(line)) continue;
      if (line.length > 10 && line.length < 200) return line;
    }
    return undefined;
  }

  /**
   * Parse ingredients from raw text
   */
  private static parseIngredients(
    rawText: string,
    normalize: boolean = true
  ): Ingredient[] {
    const lines = rawText.split('\n').map(line => line.trim());
    const ingredients: Ingredient[] = [];
    
    let inIngredientsSection = false;
    
    for (const line of lines) {
      if (line.length === 0) continue;
      
      // Detect ingredients section
      if (this.isIngredientsSectionHeader(line)) {
        inIngredientsSection = true;
        continue;
      }
      
      // Exit ingredients section if we hit instructions
      if (inIngredientsSection && this.isInstructionsSectionHeader(line)) {
        break;
      }
      
      // Parse ingredient line
      if (inIngredientsSection && this.isLikelyIngredient(line)) {
        const ingredient = this.parseIngredientLine(line, normalize);
        if (ingredient) {
          ingredients.push(ingredient);
        }
      }
    }
    
    return ingredients;
  }

  /**
   * Parse a single ingredient line
   */
  private static parseIngredientLine(
    line: string,
    normalize: boolean = true
  ): Ingredient | null {
    // Remove common list markers
    const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
    if (cleanLine.length === 0) return null;
    
    // Parse quantity, unit, and name
    const parsed = this.parseIngredientComponents(cleanLine);
    
    if (normalize) {
      return this.normalizeIngredient(parsed);
    }
    
    return parsed;
  }

  /**
   * Parse ingredient components (quantity, unit, name)
   */
  private static parseIngredientComponents(line: string): Ingredient {
    // Try to match 'quantity range unit name' (e.g., '1 to 2 cups milk', '1-2 cups milk')
    let match = line.match(/^(\d+(?:\/\d+)?)(?:\s*(?:to|-)\s*(\d+(?:\/\d+)?))?\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(.+)$/);
    if (match) {
      let quantity = match[1];
      let quantity2 = match[2];
      let unit = match[3].trim();
      let name = match[4];
      // If range, use average (or keep as string if you prefer)
      if (quantity2) {
        const q1 = parseFloat(quantity);
        const q2 = parseFloat(quantity2);
        if (!isNaN(q1) && !isNaN(q2)) {
          quantity = ((q1 + q2) / 2).toFixed(2);
        } else {
          quantity = `${quantity}-${quantity2}`;
        }
      }
      const normalizedUnit = this.normalizeUnit(unit);
      if (this.isKnownUnit(normalizedUnit)) {
        return {
          quantity: quantity || '1',
          unit: normalizedUnit,
          name: this.cleanIngredientName(name || ''),
        };
      } else {
        name = unit + ' ' + name;
        return {
          quantity: quantity || '1',
          name: this.cleanIngredientName(name || ''),
        };
      }
    }
    // Try to match 'quantity unit name' (e.g., '2 cups flour')
    match = line.match(/^(\d+(?:\/\d+)?)(?:\s*-\s*)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(.+)$/);
    if (match) {
      let quantity = match[1];
      let unit = match[2].trim();
      let name = match[3];
      const normalizedUnit = this.normalizeUnit(unit);
      if (this.isKnownUnit(normalizedUnit)) {
        return {
          quantity: quantity || '1',
          unit: normalizedUnit,
          name: this.cleanIngredientName(name || ''),
        };
      } else {
        name = unit + ' ' + name;
        return {
          quantity: quantity || '1',
          name: this.cleanIngredientName(name || ''),
        };
      }
    }
    // Try to match 'quantity name' (e.g., '2 eggs')
    match = line.match(/^(\d+(?:\/\d+)?)(?:\s*-\s*)?\s*(.+)$/);
    if (match) {
      return {
        quantity: match[1] || '1',
        name: this.cleanIngredientName(match[2] || ''),
      };
    }
    // If no quantity/unit found, treat entire line as name
    return {
      quantity: '1',
      name: this.cleanIngredientName(line || ''),
    };
  }

  /**
   * Normalize ingredient data
   */
  private static normalizeIngredient(ingredient: Ingredient): Ingredient {
    return {
      ...ingredient,
      quantity: this.normalizeQuantity(ingredient.quantity),
      unit: ingredient.unit ? this.normalizeUnit(ingredient.unit) : undefined,
      name: this.cleanIngredientName(ingredient.name),
    };
  }

  /**
   * Parse instructions from raw text
   */
  private static parseInstructions(
    rawText: string,
    validate: boolean = true
  ): string[] {
    const lines = rawText.split('\n').map(line => line.trim());
    const instructions: string[] = [];
    let inInstructionsSection = false;
    for (const line of lines) {
      if (line.length === 0) continue;
      if (this.isInstructionsSectionHeader(line)) {
        inInstructionsSection = true;
        continue;
      }
      if (inInstructionsSection && (this.isOtherSectionHeader(line) || this.isMetadataLine(line))) {
        break;
      }
      if (inInstructionsSection) {
        const cleanInstruction = this.cleanInstructionLine(line);
        if (cleanInstruction) {
          instructions.push(cleanInstruction);
        }
      }
    }
    if (validate) {
      return instructions;
    }
    return instructions;
  }

  /**
   * Extract cooking time from raw text
   */
  private static extractCookTime(rawText: string): number | undefined {
    return this.extractTimeFromText(rawText, ['cook', 'cooking', 'bake', 'baking', 'simmer', 'simmering']);
  }

  /**
   * Extract prep time from raw text
   */
  private static extractPrepTime(rawText: string): number | undefined {
    return this.extractTimeFromText(rawText, ['prep', 'preparation', 'preparing', 'chop', 'chopping', 'cut', 'cutting']);
  }

  /**
   * Extract servings from raw text
   */
  private static extractServings(rawText: string): number | undefined {
    for (const pattern of this.SERVING_PATTERNS) {
      const match = rawText.match(pattern);
      if (match) {
        const servings = parseInt(match[1], 10);
        if (servings > 0 && servings <= 50) {
          return servings;
        }
      }
    }
    return undefined;
  }

  /**
   * Extract difficulty level from raw text
   */
  private static extractDifficulty(rawText: string): 'easy' | 'medium' | 'hard' | undefined {
    const text = rawText.toLowerCase();
    
    for (const { pattern, level } of this.DIFFICULTY_PATTERNS) {
      if (pattern.test(text)) {
        return level;
      }
    }
    
    return undefined;
  }

  /**
   * Extract cuisine type from raw text
   */
  private static extractCuisineType(rawText: string): string | undefined {
    const text = rawText.toLowerCase();
    
    for (const { pattern, cuisine } of this.CUISINE_PATTERNS) {
      if (pattern.test(text)) {
        return cuisine;
      }
    }
    
    return undefined;
  }

  /**
   * Detect dietary restrictions from text and ingredients
   */
  private static detectDietaryRestrictions(
    rawText: string,
    ingredients: Ingredient[]
  ): string[] {
    const text = rawText.toLowerCase();
    const ingredientText = ingredients.map(i => i.name.toLowerCase()).join(' ');
    const fullText = `${text} ${ingredientText}`;
    const detectedTags: string[] = [];
    for (const { pattern, tag } of this.DIETARY_RESTRICTIONS) {
      if (pattern.test(fullText)) {
        detectedTags.push(tag);
      }
    }
    // Additional logic for vegetarian/vegan detection
    if (!detectedTags.includes('vegan')) {
      const meatIngredients = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'bacon', 'ham', 'sausage'];
      const hasMeat = meatIngredients.some(meat => fullText.includes(meat));
      if (!hasMeat && !detectedTags.includes('vegetarian')) {
        detectedTags.push('vegetarian');
      }
    }
    return [...new Set(detectedTags)];
  }

  /**
   * Extract nutritional information from raw text
   */
  private static extractNutritionalInfo(rawText: string): NutritionalInfo | undefined {
    const macros: NutritionalInfo = {};
    const lines = rawText.split('\n');
    for (const line of lines) {
      let match;
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:calories?|cal)(?:\s*per\s*serving)?/i))) {
        macros.calories = parseFloat(match[1]);
      }
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)?\s*(?:of\s*)?protein/i))) {
        macros.protein = parseFloat(match[1]);
      }
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)?\s*(?:of\s*)?(?:carbs|carbohydrates)/i))) {
        macros.carbs = parseFloat(match[1]);
      }
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)?\s*(?:of\s*)?fat/i))) {
        macros.fat = parseFloat(match[1]);
      }
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)?\s*(?:of\s*)?fiber/i))) {
        macros.fiber = parseFloat(match[1]);
      }
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)?\s*(?:of\s*)?sugar/i))) {
        macros.sugar = parseFloat(match[1]);
      }
      if ((match = line.match(/(\d+(?:\.\d+)?)\s*(?:mg|milligrams?)?\s*(?:of\s*)?sodium/i))) {
        macros.sodium = parseFloat(match[1]);
      }
    }
    return Object.keys(macros).length > 0 ? macros : undefined;
  }

  /**
   * Categorize recipe based on content
   */
  private static categorizeRecipe(
    rawText: string,
    title: string,
    ingredients: Ingredient[]
  ): string[] {
    const text = `${rawText} ${title}`.toLowerCase();
    const ingredientText = ingredients.map(i => i.name.toLowerCase()).join(' ');
    const fullText = `${text} ${ingredientText}`;
    const categories: string[] = [];
    for (const { pattern, category } of this.RECIPE_CATEGORIES) {
      if (pattern.test(fullText)) {
        categories.push(category);
      }
    }
    // Fallback: if bread or toast in title, add Breakfast
    if ((/toast|bread|bagel|muffin|pancake|waffle/.test(title.toLowerCase()) || /toast|bread|bagel|muffin|pancake|waffle/.test(fullText)) && !categories.includes('Breakfast')) {
      categories.push('Breakfast');
    }
    return [...new Set(categories)];
  }

  // Helper methods
  private static isLikelyNotTitle(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.includes('ingredients') ||
      lowerLine.includes('instructions') ||
      lowerLine.includes('directions') ||
      lowerLine.includes('method') ||
      lowerLine.includes('prep time') ||
      lowerLine.includes('cook time') ||
      lowerLine.includes('servings') ||
      lowerLine.includes('nutrition') ||
      lowerLine.includes('calories') ||
      /^\d+\./.test(line) || // Numbered list
      /^[-•*]/.test(line) || // Bullet points
      line.length > 100 // Too long for a title
    );
  }

  private static cleanTitle(title: string): string {
    return title
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private static isIngredientsSectionHeader(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.includes('ingredients') ||
      lowerLine.includes('what you need') ||
      lowerLine.includes('you will need')
    );
  }

  private static isInstructionsSectionHeader(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.includes('instructions') ||
      lowerLine.includes('directions') ||
      lowerLine.includes('method') ||
      lowerLine.includes('steps') ||
      lowerLine.includes('how to')
    );
  }

  private static isOtherSectionHeader(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.includes('nutrition') ||
      lowerLine.includes('notes') ||
      lowerLine.includes('tips') ||
      lowerLine.includes('variations')
    );
  }

  private static isLikelyIngredient(line: string): boolean {
    const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
    return (
      cleanLine.length > 0 &&
      cleanLine.length < 200 &&
      !this.isInstructionsSectionHeader(cleanLine) &&
      !this.isOtherSectionHeader(cleanLine)
    );
  }

  private static isLikelyInstruction(line: string): boolean {
    const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
    return (
      cleanLine.length > 10 &&
      cleanLine.length < 500 &&
      !this.isIngredientsSectionHeader(cleanLine) &&
      !this.isOtherSectionHeader(cleanLine)
    );
  }

  private static cleanIngredientName(name: string): string {
    return name
      .replace(/^[,.]\s*/, '') // Remove leading punctuation
      .replace(/[,.]$/, '') // Remove trailing punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase(); // Convert to lowercase for consistency
  }

  private static cleanInstructionLine(line: string): string {
    return line
      .replace(/^\d+\.\s*/, '') // Remove step numbers
      .replace(/^[-•*]\s*/, '') // Remove bullet points
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private static validateInstructions(instructions: string[]): string[] {
    return instructions.filter(instruction => 
      instruction.length >= 5 && instruction.length <= 1000
    );
  }

  private static extractTimeFromText(
    text: string,
    timeKeywords: string[]
  ): number | undefined {
    const lowerText = text.toLowerCase();
    for (const keyword of timeKeywords) {
      const lowerKeyword = keyword.toLowerCase();
      // Use word boundaries, allow for ' time', and match any non-digit chars before the number
      const regex = new RegExp(`\\b${lowerKeyword}(?:\\s*time)?[^\\d\\n]*?(\\d+)\\s*(minutes?|mins?|min|hours?|hrs?|h)`, 'i');
      const match = lowerText.match(regex);
      if (match) {
        const time = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('h')) {
          return time * 60;
        } else {
          return time;
        }
      }
    }
    return undefined;
  }

  private static normalizeQuantity(quantity: string): string {
    // Handle fractions
    if (quantity.includes('/')) {
      const [num, denom] = quantity.split('/');
      const result = parseFloat(num) / parseFloat(denom);
      return result.toFixed(2);
    }
    
    // Handle ranges
    if (quantity.includes('-') || quantity.includes('to')) {
      const parts = quantity.split(/[-to]/);
      const avg = (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
      return avg.toFixed(2);
    }
    
    return quantity;
  }

  private static normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'tbsp': 'tablespoon',
      'tbs': 'tablespoon',
      'tablespoons': 'tablespoon',
      'tsp': 'teaspoon',
      'teaspoons': 'teaspoon',
      'oz': 'ounce',
      'ounces': 'ounce',
      'lb': 'pound',
      'lbs': 'pound',
      'pounds': 'pound',
      'g': 'gram',
      'grams': 'gram',
      'kg': 'kilogram',
      'kilograms': 'kilogram',
      'ml': 'milliliter',
      'milliliters': 'milliliter',
      'l': 'liter',
      'liters': 'liter',
      'cup': 'cup',
      'cups': 'cup',
      'piece': 'piece',
      'pieces': 'piece',
      'slice': 'slice',
      'slices': 'slice',
      'clove': 'clove',
      'cloves': 'clove',
      'bunch': 'bunch',
      'bunches': 'bunch',
      'can': 'can',
      'cans': 'can',
      'package': 'package',
      'packages': 'package',
      'bag': 'bag',
      'bags': 'bag',
      'jar': 'jar',
      'jars': 'jar',
      'bottle': 'bottle',
      'bottles': 'bottle',
    };
    
    const lowerUnit = unit.toLowerCase();
    return unitMap[lowerUnit] || unit.toLowerCase();
  }

  private static isKnownUnit(unit: string): boolean {
    const knownUnits = [
      'cup','tablespoon','tbsp','teaspoon','tsp','ounce','oz','pound','lb','gram','g','kilogram','kg','ml','milliliter','liter','l','piece','pieces','slice','slices','clove','cloves','bunch','bunches','can','cans','package','packages','bag','bags','jar','jars','bottle','bottles','pinch','dash','handful','sprig','sprigs','stalk','stalks','head','heads','ear','ears','medium','large','small','extra large','xl'
    ];
    return knownUnits.includes(unit.toLowerCase());
  }

  private static isMetadataLine(line: string): boolean {
    const lower = line.toLowerCase();
    return (
      lower.startsWith('prep time') ||
      lower.startsWith('cook time') ||
      lower.startsWith('serves') ||
      lower.startsWith('difficulty') ||
      lower.startsWith('calories') ||
      lower.startsWith('protein') ||
      lower.startsWith('carbs') ||
      lower.startsWith('fat') ||
      lower.startsWith('fiber') ||
      lower.startsWith('sugar') ||
      lower.startsWith('sodium')
    );
  }
} 