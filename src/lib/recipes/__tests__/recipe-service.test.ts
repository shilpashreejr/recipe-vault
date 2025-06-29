// Mock Prisma client
const mockPrisma = {
  recipe: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  category: {
    create: jest.fn(),
  },
  recipeCategory: {
    deleteMany: jest.fn(),
  },
  recipeImage: {
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Mock the Prisma client import
jest.mock('../../../generated/prisma', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

import { RecipeService } from '../recipe-service';

describe('RecipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const mockRecipe = {
        id: 'test-id',
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Mix ingredients' }],
        cookingTime: 30,
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Test Cuisine',
        source: 'https://example.com',
        sourceType: 'manual',
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.recipe.create.mockResolvedValue(mockRecipe);

      const recipeData = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Mix ingredients' }],
        cookingTime: 30,
        servings: 4,
        difficulty: 'easy' as const,
        cuisine: 'Test Cuisine',
        source: 'https://example.com',
        sourceType: 'manual' as const,
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
        nutritionalInfo: { calories: 200, protein: 5 },
        images: [
          { url: 'https://example.com/image.jpg', alt: 'Test image', isPrimary: true },
        ],
        categoryIds: ['category-id'],
      };

      const result = await RecipeService.createRecipe(recipeData);

      expect(mockPrisma.recipe.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Recipe',
          description: 'A test recipe',
          ingredients: expect.any(Object),
          instructions: expect.any(Object),
          nutritionalInfo: expect.any(Object),
          images: {
            create: [
              { url: 'https://example.com/image.jpg', alt: 'Test image', isPrimary: true },
            ],
          },
          categories: {
            create: [{ categoryId: 'category-id' }],
          },
        }),
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      expect(result).toEqual(mockRecipe);
    });
  });

  describe('getRecipe', () => {
    it('should get a recipe by id', async () => {
      const mockRecipe = {
        id: 'test-id',
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Mix ingredients' }],
        cookingTime: 30,
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Test Cuisine',
        source: 'https://example.com',
        sourceType: 'manual',
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        images: [],
        categories: [],
      };

      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const result = await RecipeService.getRecipeById('test-id');

      expect(mockPrisma.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id', deletedAt: null },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      expect(result).toEqual(mockRecipe);
    });

    it('should return null for non-existent recipe', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      const result = await RecipeService.getRecipeById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateRecipe', () => {
    it('should update a recipe successfully', async () => {
      const mockUpdatedRecipe = {
        id: 'test-id',
        title: 'Updated Recipe',
        description: 'An updated test recipe',
        ingredients: [{ name: 'Flour', quantity: 3, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Updated instructions' }],
        cookingTime: 45,
        servings: 6,
        difficulty: 'medium',
        cuisine: 'Updated Cuisine',
        source: 'https://example.com/updated',
        sourceType: 'manual',
        isVegetarian: false,
        isGlutenFree: true,
        isVegan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        images: [],
        categories: [],
      };

      mockPrisma.recipe.update.mockResolvedValue(mockUpdatedRecipe);

      const updateData = {
        id: 'test-id',
        title: 'Updated Recipe',
        description: 'An updated test recipe',
        ingredients: [{ name: 'Flour', quantity: 3, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Updated instructions' }],
        cookingTime: 45,
        servings: 6,
        difficulty: 'medium' as const,
        cuisine: 'Updated Cuisine',
        source: 'https://example.com/updated',
        sourceType: 'manual' as const,
        isVegetarian: false,
        isGlutenFree: true,
        isVegan: false,
        nutritionalInfo: { calories: 300, protein: 8 },
      };

      const result = await RecipeService.updateRecipe(updateData);

      expect(mockPrisma.recipe.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: expect.objectContaining({
          title: 'Updated Recipe',
          description: 'An updated test recipe',
          ingredients: expect.any(Object),
          instructions: expect.any(Object),
          nutritionalInfo: expect.any(Object),
        }),
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      expect(result).toEqual(mockUpdatedRecipe);
    });
  });

  describe('listRecipes', () => {
    it('should list recipes with default parameters', async () => {
      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Recipe 1',
          description: 'First recipe',
          ingredients: [],
          instructions: [],
          cookingTime: 30,
          servings: 4,
          difficulty: 'easy',
          cuisine: 'Test',
          source: 'https://example.com',
          sourceType: 'manual',
          isVegetarian: true,
          isGlutenFree: false,
          isVegan: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          images: [],
          categories: [],
        },
        {
          id: 'recipe-2',
          title: 'Recipe 2',
          description: 'Second recipe',
          ingredients: [],
          instructions: [],
          cookingTime: 45,
          servings: 6,
          difficulty: 'medium',
          cuisine: 'Test',
          source: 'https://example.com',
          sourceType: 'manual',
          isVegetarian: false,
          isGlutenFree: true,
          isVegan: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          images: [],
          categories: [],
        },
      ];

      mockPrisma.recipe.findMany.mockResolvedValue(mockRecipes);

      const result = await RecipeService.listRecipes();

      expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(mockRecipes);
    });

    it('should list recipes with custom parameters', async () => {
      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Recipe 1',
          description: 'First recipe',
          ingredients: [],
          instructions: [],
          cookingTime: 30,
          servings: 4,
          difficulty: 'easy',
          cuisine: 'Test',
          source: 'https://example.com',
          sourceType: 'manual',
          isVegetarian: true,
          isGlutenFree: false,
          isVegan: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          images: [],
          categories: [],
        },
      ];

      mockPrisma.recipe.findMany.mockResolvedValue(mockRecipes);

      const result = await RecipeService.listRecipes({
        skip: 5,
        take: 5,
        where: {
          difficulty: 'easy',
          cuisine: 'Test',
          isVegetarian: true,
        },
      });

      expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          difficulty: 'easy',
          cuisine: 'Test',
          isVegetarian: true,
        },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
        orderBy: undefined,
        skip: 5,
        take: 5,
      });

      expect(result).toEqual(mockRecipes);
    });
  });

  describe('softDeleteRecipe', () => {
    it('should soft delete a recipe', async () => {
      const mockDeletedRecipe = {
        id: 'test-id',
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [],
        instructions: [],
        cookingTime: 30,
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Test',
        source: 'https://example.com',
        sourceType: 'manual',
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        images: [],
        categories: [],
      };

      mockPrisma.recipe.update.mockResolvedValue(mockDeletedRecipe);

      const result = await RecipeService.softDeleteRecipe('test-id');

      expect(mockPrisma.recipe.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { deletedAt: expect.any(Date) },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      expect(result).toEqual(mockDeletedRecipe);
    });
  });
}); 