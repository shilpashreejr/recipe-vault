import {
  IngredientSchema,
  InstructionSchema,
  NutritionalInfoSchema,
  RecipeImageSchema,
  CreateRecipeSchema,
  UpdateRecipeSchema,
  RecipeFilterSchema,
} from '../recipe-schemas';

describe('Recipe Validation Schemas', () => {
  describe('IngredientSchema', () => {
    it('should validate a valid ingredient', () => {
      const validIngredient = {
        name: 'Flour',
        quantity: 2,
        unit: 'cups',
        notes: 'All-purpose flour',
      };

      const result = IngredientSchema.safeParse(validIngredient);
      expect(result.success).toBe(true);
    });

    it('should require ingredient name', () => {
      const invalidIngredient = {
        quantity: 2,
        unit: 'cups',
      };

      const result = IngredientSchema.safeParse(invalidIngredient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('should not allow negative quantities', () => {
      const invalidIngredient = {
        name: 'Flour',
        quantity: -2,
        unit: 'cups',
      };

      const result = IngredientSchema.safeParse(invalidIngredient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantity must be positive');
      }
    });
  });

  describe('InstructionSchema', () => {
    it('should validate a valid instruction', () => {
      const validInstruction = {
        step: 1,
        instruction: 'Mix flour and water',
        time: 5,
        temperature: 180,
        notes: 'Until smooth',
      };

      const result = InstructionSchema.safeParse(validInstruction);
      expect(result.success).toBe(true);
    });

    it('should require instruction text', () => {
      const invalidInstruction = {
        step: 1,
        time: 5,
      };

      const result = InstructionSchema.safeParse(invalidInstruction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('should require positive step numbers', () => {
      const invalidInstruction = {
        step: 0,
        instruction: 'Mix ingredients',
      };

      const result = InstructionSchema.safeParse(invalidInstruction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Step number must be a positive integer');
      }
    });
  });

  describe('NutritionalInfoSchema', () => {
    it('should validate valid nutritional info', () => {
      const validNutritionalInfo = {
        calories: 250,
        protein: 10,
        carbohydrates: 30,
        fat: 8,
        fiber: 3,
        sugar: 5,
        sodium: 400,
        cholesterol: 50,
        saturatedFat: 2,
        transFat: 0,
        vitaminA: 100,
        vitaminC: 15,
        calcium: 200,
        iron: 3,
      };

      const result = NutritionalInfoSchema.safeParse(validNutritionalInfo);
      expect(result.success).toBe(true);
    });

    it('should not allow negative values', () => {
      const invalidNutritionalInfo = {
        calories: -100,
        protein: 10,
      };

      const result = NutritionalInfoSchema.safeParse(invalidNutritionalInfo);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Calories cannot be negative');
      }
    });

    it('should allow partial nutritional info', () => {
      const partialNutritionalInfo = {
        calories: 250,
        protein: 10,
      };

      const result = NutritionalInfoSchema.safeParse(partialNutritionalInfo);
      expect(result.success).toBe(true);
    });
  });

  describe('RecipeImageSchema', () => {
    it('should validate a valid recipe image', () => {
      const validImage = {
        url: 'https://example.com/image.jpg',
        alt: 'Delicious cake',
        isPrimary: true,
      };

      const result = RecipeImageSchema.safeParse(validImage);
      expect(result.success).toBe(true);
    });

    it('should require valid URL', () => {
      const invalidImage = {
        url: 'not-a-url',
        alt: 'Delicious cake',
      };

      const result = RecipeImageSchema.safeParse(invalidImage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be a valid URL');
      }
    });

    it('should default isPrimary to false', () => {
      const imageWithoutPrimary = {
        url: 'https://example.com/image.jpg',
      };

      const result = RecipeImageSchema.safeParse(imageWithoutPrimary);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPrimary).toBe(false);
      }
    });
  });

  describe('CreateRecipeSchema', () => {
    it('should validate a valid recipe', () => {
      const validRecipe = {
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake recipe',
        ingredients: [
          { name: 'Flour', quantity: 2, unit: 'cups' },
          { name: 'Sugar', quantity: 1, unit: 'cup' },
        ],
        instructions: [
          { step: 1, instruction: 'Mix dry ingredients' },
          { step: 2, instruction: 'Add wet ingredients' },
        ],
        cookingTime: 45,
        servings: 8,
        difficulty: 'medium' as const,
        cuisine: 'American',
        source: 'https://example.com/recipe',
        sourceType: 'blog' as const,
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
        nutritionalInfo: {
          calories: 300,
          protein: 5,
          carbohydrates: 45,
          fat: 12,
        },
        images: [
          {
            url: 'https://example.com/cake.jpg',
            alt: 'Chocolate cake',
            isPrimary: true,
          },
        ],
        categoryIds: ['category1', 'category2'],
      };

      const result = CreateRecipeSchema.safeParse(validRecipe);
      expect(result.success).toBe(true);
    });

    it('should require title', () => {
      const invalidRecipe = {
        ingredients: [{ name: 'Flour' }],
        instructions: [{ step: 1, instruction: 'Mix' }],
      };

      const result = CreateRecipeSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message === 'Required')).toBe(true);
      }
    });

    it('should require at least one ingredient', () => {
      const invalidRecipe = {
        title: 'Cake',
        ingredients: [],
        instructions: [{ step: 1, instruction: 'Mix' }],
      };

      const result = CreateRecipeSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message === 'At least one ingredient is required')).toBe(true);
      }
    });

    it('should require at least one instruction', () => {
      const invalidRecipe = {
        title: 'Cake',
        ingredients: [{ name: 'Flour' }],
        instructions: [],
      };

      const result = CreateRecipeSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message === 'At least one instruction is required')).toBe(true);
      }
    });

    it('should validate source type enum', () => {
      const invalidRecipe = {
        title: 'Cake',
        ingredients: [{ name: 'Flour' }],
        instructions: [{ step: 1, instruction: 'Mix' }],
        sourceType: 'invalid-source' as any,
      };

      const result = CreateRecipeSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateRecipeSchema', () => {
    it('should validate a valid recipe update', () => {
      const validUpdate = {
        id: 'clx1234567890abcdef',
        title: 'Updated Chocolate Cake',
        cookingTime: 60,
      };

      const result = UpdateRecipeSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should require valid recipe ID', () => {
      const invalidUpdate = {
        id: 'invalid-id',
        title: 'Updated Recipe',
      };

      const result = UpdateRecipeSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid recipe ID');
      }
    });
  });

  describe('RecipeFilterSchema', () => {
    it('should validate valid filter parameters', () => {
      const validFilter = {
        search: 'chocolate',
        cuisine: 'American',
        difficulty: 'medium' as const,
        isVegetarian: true,
        maxCookingTime: 60,
        categoryIds: ['cat1', 'cat2'],
        page: 1,
        limit: 20,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      };

      const result = RecipeFilterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
    });

    it('should use default values for optional parameters', () => {
      const minimalFilter = {
        search: 'chocolate',
      };

      const result = RecipeFilterSchema.safeParse(minimalFilter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('createdAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should validate sort parameters', () => {
      const invalidFilter = {
        sortBy: 'invalid' as any,
        sortOrder: 'invalid' as any,
      };

      const result = RecipeFilterSchema.safeParse(invalidFilter);
      expect(result.success).toBe(false);
    });
  });
}); 