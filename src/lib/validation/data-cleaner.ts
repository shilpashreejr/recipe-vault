import { CreateRecipe, Ingredient, Instruction, NutritionalInfo } from './recipe-schemas';

export interface DataCleaningOptions {
  normalizeUnits?: boolean;
  normalizeIngredients?: boolean;
  normalizeInstructions?: boolean;
  removeExtraWhitespace?: boolean;
  validateUrls?: boolean;
  maxTitleLength?: number;
  maxDescriptionLength?: number;
}

export class DataCleaner {
  private static readonly COMMON_UNITS = {
    // Volume
    'tsp': 'teaspoon',
    'teaspoon': 'teaspoon',
    'teaspoons': 'teaspoon',
    'tbsp': 'tablespoon',
    'tablespoon': 'tablespoon',
    'tablespoons': 'tablespoon',
    'cup': 'cup',
    'cups': 'cup',
    'ml': 'milliliter',
    'milliliter': 'milliliter',
    'milliliters': 'milliliter',
    'l': 'liter',
    'liter': 'liter',
    'liters': 'liter',
    'fl oz': 'fluid ounce',
    'fluid ounce': 'fluid ounce',
    'fluid ounces': 'fluid ounce',
    'pint': 'pint',
    'pints': 'pint',
    'quart': 'quart',
    'quarts': 'quart',
    'gallon': 'gallon',
    'gallons': 'gallon',
    
    // Weight
    'g': 'gram',
    'gram': 'gram',
    'grams': 'gram',
    'kg': 'kilogram',
    'kilogram': 'kilogram',
    'kilograms': 'kilogram',
    'lb': 'pound',
    'pound': 'pound',
    'pounds': 'pound',
    'oz': 'ounce',
    'ounce': 'ounce',
    'ounces': 'ounce',
    
    // Count
    'piece': 'piece',
    'pieces': 'piece',
    'slice': 'slice',
    'slices': 'slice',
    'clove': 'clove',
    'cloves': 'clove',
    'bunch': 'bunch',
    'bunches': 'bunch',
    'head': 'head',
    'heads': 'head',
    'can': 'can',
    'cans': 'can',
    'jar': 'jar',
    'jars': 'jar',
    'package': 'package',
    'packages': 'package',
    'packet': 'packet',
    'packets': 'packet',
  };

  private static readonly COMMON_INGREDIENTS = {
    'all-purpose flour': 'all purpose flour',
    'ap flour': 'all purpose flour',
    'plain flour': 'all purpose flour',
    'self-raising flour': 'self rising flour',
    'self-rising flour': 'self rising flour',
    'bread flour': 'bread flour',
    'cake flour': 'cake flour',
    'whole wheat flour': 'whole wheat flour',
    'wholemeal flour': 'whole wheat flour',
    'brown sugar': 'brown sugar',
    'white sugar': 'granulated sugar',
    'granulated sugar': 'granulated sugar',
    'caster sugar': 'granulated sugar',
    'powdered sugar': 'powdered sugar',
    'confectioners sugar': 'powdered sugar',
    'icing sugar': 'powdered sugar',
    'extra virgin olive oil': 'extra virgin olive oil',
    'evoo': 'extra virgin olive oil',
    'olive oil': 'olive oil',
    'vegetable oil': 'vegetable oil',
    'canola oil': 'canola oil',
    'sunflower oil': 'sunflower oil',
    'unsalted butter': 'unsalted butter',
    'salted butter': 'salted butter',
    'butter': 'unsalted butter',
    'large eggs': 'large eggs',
    'egg': 'large egg',
    'eggs': 'large eggs',
    'milk': 'milk',
    'whole milk': 'whole milk',
    'skim milk': 'skim milk',
    'low-fat milk': 'low fat milk',
    'heavy cream': 'heavy cream',
    'whipping cream': 'heavy cream',
    'double cream': 'heavy cream',
    'sour cream': 'sour cream',
    'yogurt': 'yogurt',
    'greek yogurt': 'greek yogurt',
    'vanilla extract': 'vanilla extract',
    'vanilla': 'vanilla extract',
    'salt': 'salt',
    'kosher salt': 'kosher salt',
    'sea salt': 'sea salt',
    'black pepper': 'black pepper',
    'pepper': 'black pepper',
    'garlic': 'garlic',
    'garlic cloves': 'garlic cloves',
    'onion': 'onion',
    'yellow onion': 'yellow onion',
    'white onion': 'white onion',
    'red onion': 'red onion',
    'tomato': 'tomato',
    'tomatoes': 'tomatoes',
    'bell pepper': 'bell pepper',
    'bell peppers': 'bell peppers',
    'capsicum': 'bell pepper',
    'carrot': 'carrot',
    'carrots': 'carrots',
    'celery': 'celery',
    'potato': 'potato',
    'potatoes': 'potatoes',
    'chicken breast': 'chicken breast',
    'chicken breasts': 'chicken breasts',
    'ground beef': 'ground beef',
    'minced beef': 'ground beef',
    'beef mince': 'ground beef',
    'salmon': 'salmon',
    'tuna': 'tuna',
    'shrimp': 'shrimp',
    'prawns': 'shrimp',
    'pasta': 'pasta',
    'spaghetti': 'spaghetti',
    'rice': 'rice',
    'white rice': 'white rice',
    'brown rice': 'brown rice',
    'basmati rice': 'basmati rice',
    'jasmine rice': 'jasmine rice',
    'cheese': 'cheese',
    'cheddar cheese': 'cheddar cheese',
    'mozzarella cheese': 'mozzarella cheese',
    'parmesan cheese': 'parmesan cheese',
    'parmesan': 'parmesan cheese',
  };

  static cleanRecipe(data: Partial<CreateRecipe>, options: DataCleaningOptions = {}): Partial<CreateRecipe> {
    const {
      normalizeUnits = true,
      normalizeIngredients = true,
      normalizeInstructions = true,
      removeExtraWhitespace = true,
      validateUrls = true,
      maxTitleLength = 200,
      maxDescriptionLength = 1000,
    } = options;

    const cleaned: Partial<CreateRecipe> = { ...data };

    // Clean title
    if (cleaned.title) {
      cleaned.title = this.cleanTitle(cleaned.title, maxTitleLength);
    }

    // Clean description
    if (cleaned.description) {
      cleaned.description = this.cleanDescription(cleaned.description, maxDescriptionLength);
    }

    // Clean ingredients
    if (cleaned.ingredients && normalizeIngredients) {
      cleaned.ingredients = cleaned.ingredients.map(ingredient => 
        this.cleanIngredient(ingredient, { normalizeUnits, removeExtraWhitespace })
      );
    }

    // Clean instructions
    if (cleaned.instructions && normalizeInstructions) {
      cleaned.instructions = cleaned.instructions.map((instruction, index) => 
        this.cleanInstruction(instruction, index + 1, { removeExtraWhitespace })
      );
    }

    // Clean source URL
    if (cleaned.source && validateUrls) {
      cleaned.source = this.cleanUrl(cleaned.source);
    }

    // Clean images
    if (cleaned.images) {
      cleaned.images = cleaned.images.map(image => 
        this.cleanRecipeImage(image, { validateUrls })
      );
    }

    return cleaned;
  }

  private static cleanTitle(title: string, maxLength: number): string {
    let cleaned = title.trim();
    
    // Capitalize first letter of each word
    cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Truncate if too long
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength - 3) + '...';
    }
    
    return cleaned;
  }

  private static cleanDescription(description: string, maxLength: number): string {
    let cleaned = description.trim();
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Truncate if too long
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength - 3) + '...';
    }
    
    return cleaned;
  }

  private static cleanIngredient(ingredient: Ingredient, options: { normalizeUnits: boolean; removeExtraWhitespace: boolean }): Ingredient {
    const cleaned: Ingredient = { ...ingredient };

    // Clean name
    if (cleaned.name) {
      cleaned.name = this.normalizeIngredientName(cleaned.name, options.removeExtraWhitespace);
    }

    // Clean unit
    if (cleaned.unit && options.normalizeUnits) {
      cleaned.unit = this.normalizeUnit(cleaned.unit);
    }

    // Clean notes
    if (cleaned.notes && options.removeExtraWhitespace) {
      cleaned.notes = cleaned.notes.trim().replace(/\s+/g, ' ');
    }

    return cleaned;
  }

  private static cleanInstruction(instruction: Instruction, stepNumber: number, options: { removeExtraWhitespace: boolean }): Instruction {
    const cleaned: Instruction = { ...instruction };

    // Ensure step number is correct
    cleaned.step = stepNumber;

    // Clean instruction text
    if (cleaned.instruction) {
      cleaned.instruction = this.cleanInstructionText(cleaned.instruction, options.removeExtraWhitespace);
    }

    // Clean notes
    if (cleaned.notes && options.removeExtraWhitespace) {
      cleaned.notes = cleaned.notes.trim().replace(/\s+/g, ' ');
    }

    return cleaned;
  }

  private static cleanRecipeImage(image: any, options: { validateUrls: boolean }): any {
    const cleaned = { ...image };

    // Clean URL
    if (cleaned.url && options.validateUrls) {
      cleaned.url = this.cleanUrl(cleaned.url);
    }

    // Clean alt text
    if (cleaned.alt) {
      cleaned.alt = cleaned.alt.trim().replace(/\s+/g, ' ');
    }

    return cleaned;
  }

  private static normalizeIngredientName(name: string, removeExtraWhitespace: boolean): string {
    let normalized = name.toLowerCase().trim();

    // Remove extra whitespace
    if (removeExtraWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ');
    }

    // Check if we have a common mapping
    const commonMapping = this.COMMON_INGREDIENTS[normalized as keyof typeof this.COMMON_INGREDIENTS];
    if (commonMapping) {
      normalized = commonMapping;
    }

    // Capitalize first letter of each word for display
    return normalized.replace(/\b\w/g, l => l.toUpperCase());
  }

  private static normalizeUnit(unit: string): string {
    const normalized = unit.toLowerCase().trim();
    const mapped = this.COMMON_UNITS[normalized as keyof typeof this.COMMON_UNITS] || unit;
    // Capitalize for display
    return mapped.replace(/\b\w/g, l => l.toLowerCase() === l ? l.toLowerCase() : l);
  }

  private static cleanInstructionText(text: string, removeExtraWhitespace: boolean): string {
    let cleaned = text.trim();

    // Remove extra whitespace
    if (removeExtraWhitespace) {
      cleaned = cleaned.replace(/\s+/g, ' ');
    }

    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }

  private static cleanUrl(url: string): string {
    let cleaned = url.trim();

    // Add protocol if missing
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }

    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, '');

    return cleaned;
  }

  static validateNutritionalInfo(nutritionalInfo: NutritionalInfo): NutritionalInfo {
    const validated = { ...nutritionalInfo };

    // Ensure all values are non-negative
    Object.keys(validated).forEach(key => {
      const value = validated[key as keyof NutritionalInfo];
      if (typeof value === 'number' && value < 0) {
        validated[key as keyof NutritionalInfo] = 0;
      }
    });

    return validated;
  }

  static sanitizeHtml(html: string): string {
    // Remove script tags
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove style tags
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Remove event handlers (on...=)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '');
    // Remove href/src attributes whose value starts with javascript:
    sanitized = sanitized.replace(/(href|src)\s*=\s*(['"])(.*?)\2/gi, (match, attr, quote, value) => {
      if (value.trim().toLowerCase().startsWith('javascript:')) {
        return `${attr}=""`;
      }
      return match;
    });
    return sanitized;
  }

  static extractTextFromHtml(html: string): string {
    // Remove HTML tags, replace with space
    let text = html.replace(/<[^>]*>/g, ' ');
    // Decode HTML entities
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Remove space before period
    text = text.replace(/ \./g, '.');
    return text;
  }
} 