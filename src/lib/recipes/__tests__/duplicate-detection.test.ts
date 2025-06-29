import { DuplicateDetectionService, DuplicateDetectionResult } from '../duplicate-detection';
import { CreateRecipe, Ingredient, Instruction } from '../../validation/recipe-schemas';
import { Recipe } from '../../../generated/prisma/client';

// Mock Prisma client
jest.mock('../../../generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    recipe: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  })),
}));

const getMockPrismaClient = () => {
  const { PrismaClient } = require('../../../generated/prisma');
  return new PrismaClient();
};

describe('DuplicateDetectionService', () => {
  let mockPrismaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaClient = getMockPrismaClient();
  });

  const mockRecipe: CreateRecipe = {
    title: 'Chocolate Chip Cookies',
    description: 'Delicious homemade chocolate chip cookies',
    ingredients: [
      { name: 'flour', quantity: 2, unit: 'cups' },
      { name: 'sugar', quantity: 1, unit: 'cup' },
      { name: 'chocolate chips', quantity: 2, unit: 'cups' },
    ],
    instructions: [
      { step: 1, instruction: 'Preheat oven to 350°F' },
      { step: 2, instruction: 'Mix flour and sugar' },
      { step: 3, instruction: 'Add chocolate chips and bake' },
    ],
    cookingTime: 30,
    servings: 24,
    difficulty: 'easy',
    cuisine: 'American',
    source: 'https://example.com/cookies',
    sourceType: 'blog',
    isVegetarian: true,
    isGlutenFree: false,
    isVegan: false,
  };

  const mockExistingRecipe = {
    id: 'existing-recipe-id',
    title: 'Chocolate Chip Cookies',
    description: 'Delicious homemade chocolate chip cookies',
    ingredients: [
      { name: 'flour', quantity: 2, unit: 'cups' },
      { name: 'sugar', quantity: 1, unit: 'cup' },
      { name: 'chocolate chips', quantity: 2, unit: 'cups' },
    ] as any,
    instructions: [
      { step: 1, instruction: 'Preheat oven to 350°F' },
      { step: 2, instruction: 'Mix flour and sugar' },
      { step: 3, instruction: 'Add chocolate chips and bake' },
    ] as any,
    cookingTime: 30,
    servings: 24,
    difficulty: 'easy',
    cuisine: 'American',
    source: 'https://example.com/cookies',
    sourceType: 'blog',
    isVegetarian: true,
    isGlutenFree: false,
    isVegan: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    userId: 'user-id',
  } as Recipe;

  describe('detectDuplicates', () => {
    it('should detect exact title matches', async () => {
      mockPrismaClient.recipe.findMany.mockResolvedValue([mockExistingRecipe]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(result.hasDuplicates).toBe(true);
      expect(result.totalDuplicates).toBe(1);
      expect(result.duplicates[0].matchType).toBe('exact_title');
      expect(result.duplicates[0].confidence).toBe('high');
      expect(result.duplicates[0].similarityScore).toBe(1.0);
    });

    it('should detect fuzzy title matches', async () => {
      const similarRecipe = {
        ...mockExistingRecipe,
        title: 'Chocolate Chip Cookie Recipe',
      };
      mockPrismaClient.recipe.findMany.mockResolvedValue([similarRecipe]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates[0].matchType).toBe('fuzzy_title');
    });

    it('should detect ingredient similarity', async () => {
      const similarIngredientsRecipe = {
        ...mockExistingRecipe,
        title: 'Different Title',
        ingredients: [
          { name: 'flour', quantity: 2, unit: 'cups' },
          { name: 'sugar', quantity: 1, unit: 'cup' },
          { name: 'chocolate chips', quantity: 2, unit: 'cups' },
          { name: 'vanilla', quantity: 1, unit: 'tsp' },
        ] as any,
      };
      mockPrismaClient.recipe.findMany.mockResolvedValue([similarIngredientsRecipe]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates[0].matchType).toBe('ingredient_similarity');
    });

    it('should detect source URL matches', async () => {
      const sameSourceRecipe = {
        ...mockExistingRecipe,
        title: 'Different Title',
        ingredients: [{ name: 'different ingredient' }] as any,
      };
      mockPrismaClient.recipe.findMany.mockResolvedValue([sameSourceRecipe]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates[0].matchType).toBe('source_url');
    });

    it('should detect content fingerprint matches', async () => {
      const identicalRecipe = {
        ...mockExistingRecipe,
        title: 'Chocolate Chip Cookies',
      };
      mockPrismaClient.recipe.findMany.mockResolvedValue([identicalRecipe]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates[0].matchType).toBe('content_fingerprint');
    });

    it('should return no duplicates when no matches found', async () => {
      mockPrismaClient.recipe.findMany.mockResolvedValue([]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(result.hasDuplicates).toBe(false);
      expect(result.totalDuplicates).toBe(0);
      expect(result.duplicates).toHaveLength(0);
    });

    it('should respect similarity threshold', async () => {
      const similarRecipe = {
        ...mockExistingRecipe,
        title: 'Chocolate Chip Cookie Recipe',
      };
      mockPrismaClient.recipe.findMany.mockResolvedValue([similarRecipe]);

      const result = await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {
        similarityThreshold: 0.95,
      }, mockPrismaClient);

      expect(result.hasDuplicates).toBe(false);
    });

    it('should filter by user ID when provided', async () => {
      mockPrismaClient.recipe.findMany.mockResolvedValue([]);

      await DuplicateDetectionService.detectDuplicates(mockRecipe, 'user-id', {}, mockPrismaClient);

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, userId: 'user-id' },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });
    });
  });

  describe('getDuplicateStats', () => {
    it('should return duplicate statistics', async () => {
      mockPrismaClient.recipe.count.mockResolvedValue(100);
      mockPrismaClient.recipe.groupBy.mockResolvedValue([
        { title: 'Recipe 1', _count: { title: 3 } },
        { title: 'Recipe 2', _count: { title: 2 } },
      ]);

      const stats = await DuplicateDetectionService.getDuplicateStats('user-id');

      expect(stats.totalRecipes).toBe(100);
      expect(stats.potentialDuplicates).toBe(3); // (3-1) + (2-1) = 3
      expect(stats.duplicatePercentage).toBe(3);
    });

    it('should handle empty database', async () => {
      mockPrismaClient.recipe.count.mockResolvedValue(0);
      mockPrismaClient.recipe.groupBy.mockResolvedValue([]);

      const stats = await DuplicateDetectionService.getDuplicateStats('user-id');

      expect(stats.totalRecipes).toBe(0);
      expect(stats.potentialDuplicates).toBe(0);
      expect(stats.duplicatePercentage).toBe(0);
    });
  });

  describe('text normalization', () => {
    it('should normalize text correctly', () => {
      const testCases = [
        { input: 'Chocolate Chip Cookies!', expected: 'chocolate chip cookies' },
        { input: '  Chocolate   Chip   Cookies  ', expected: 'chocolate chip cookies' },
        { input: 'Chocolate-Chip Cookies', expected: 'chocolatechip cookies' },
        { input: 'CHOCOLATE CHIP COOKIES', expected: 'chocolate chip cookies' },
      ];

      testCases.forEach(({ input, expected }) => {
        // Access the private method through the class
        const result = (DuplicateDetectionService as any).normalizeText(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('URL normalization', () => {
    it('should normalize URLs correctly', () => {
      const testCases = [
        {
          input: 'https://example.com/recipe/cookies?param=value',
          expected: 'https://example.com/recipe/cookies',
        },
        {
          input: 'http://example.com/recipe/cookies#section',
          expected: 'http://example.com/recipe/cookies',
        },
        {
          input: 'https://EXAMPLE.COM/Recipe/Cookies',
          expected: 'https://example.com/recipe/cookies',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (DuplicateDetectionService as any).normalizeUrl(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle invalid URLs', () => {
      const result = (DuplicateDetectionService as any).normalizeUrl('not-a-url');
      expect(result).toBe('not-a-url');
    });
  });

  describe('ingredient normalization', () => {
    it('should normalize ingredients correctly', () => {
      const ingredients: Ingredient[] = [
        { name: 'All-Purpose Flour', quantity: 2, unit: 'cups' },
        { name: 'Granulated Sugar', quantity: 1, unit: 'cup' },
        { name: 'Chocolate Chips', quantity: 2, unit: 'cups' },
      ];

      const result = (DuplicateDetectionService as any).normalizeIngredients(ingredients);
      expect(result).toEqual(['allpurpose flour', 'chocolate chips', 'granulated sugar']);
    });
  });

  describe('string similarity', () => {
    it('should calculate string similarity correctly', () => {
      const testCases = [
        { str1: 'hello', str2: 'hello', expected: 1.0 },
        { str1: 'hello', str2: 'helo', expected: 0.8 },
        { str1: 'hello', str2: 'world', expected: 0.2 },
        { str1: '', str2: '', expected: 1.0 },
        { str1: 'hello', str2: '', expected: 0.0 },
      ];

      testCases.forEach(({ str1, str2, expected }) => {
        const result = (DuplicateDetectionService as any).calculateStringSimilarity(str1, str2);
        expect(result).toBeCloseTo(expected, 1);
      });
    });
  });

  describe('ingredient similarity', () => {
    it('should calculate ingredient similarity correctly', () => {
      const ingredients1 = ['flour', 'sugar', 'chocolate chips'];
      const ingredients2 = ['flour', 'sugar', 'chocolate chips', 'vanilla'];
      const ingredients3 = ['flour', 'sugar', 'eggs'];

      const result1 = (DuplicateDetectionService as any).calculateIngredientSimilarity(ingredients1, ingredients2);
      const result2 = (DuplicateDetectionService as any).calculateIngredientSimilarity(ingredients1, ingredients3);

      expect(result1).toBe(0.75); // 3 common / 4 total unique
      expect(result2).toBe(0.5); // 2 common / 4 total unique
    });

    it('should handle empty ingredient lists', () => {
      const result = (DuplicateDetectionService as any).calculateIngredientSimilarity([], []);
      expect(result).toBe(0);
    });
  });

  describe('content fingerprinting', () => {
    it('should create consistent fingerprints for identical recipes', () => {
      const recipe1 = { ...mockRecipe };
      const recipe2 = { ...mockRecipe };

      const fingerprint1 = (DuplicateDetectionService as any).createContentFingerprint(recipe1);
      const fingerprint2 = (DuplicateDetectionService as any).createContentFingerprint(recipe2);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should create different fingerprints for different recipes', () => {
      const recipe1 = { ...mockRecipe };
      const recipe2 = { ...mockRecipe, title: 'Different Title' };

      const fingerprint1 = (DuplicateDetectionService as any).createContentFingerprint(recipe1);
      const fingerprint2 = (DuplicateDetectionService as any).createContentFingerprint(recipe2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });
}); 