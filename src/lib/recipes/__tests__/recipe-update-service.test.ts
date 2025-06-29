// Mock Prisma client
const mockPrisma = {
  recipe: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  recipeImage: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  recipeCategory: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

// Mock the Prisma client import
jest.mock('../../../generated/prisma', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

import { RecipeUpdateService } from '../recipe-update-service';

describe('RecipeUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateRecipe', () => {
    const mockExistingRecipe = {
      id: 'recipe-id',
      title: 'Original Recipe',
      description: 'Original description',
      ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
      instructions: [{ step: 1, instruction: 'Mix ingredients' }],
      cookingTime: 30,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Italian',
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

    it('should update recipe successfully', async () => {
      const mockUpdatedRecipe = {
        ...mockExistingRecipe,
        title: 'Updated Recipe',
        description: 'Updated description',
      };

      mockPrisma.recipe.findUnique
        .mockResolvedValueOnce(mockExistingRecipe) // First call for validation
        .mockResolvedValueOnce(mockUpdatedRecipe); // Second call for final result
      mockPrisma.recipe.update.mockResolvedValue(mockUpdatedRecipe);

      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
      };

      const result = await RecipeUpdateService.updateRecipe('recipe-id', updateData);

      expect(result.success).toBe(true);
      expect(result.recipe).toEqual(mockUpdatedRecipe);
      expect(result.errors).toBeUndefined();
    });

    it('should return error when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      const result = await RecipeUpdateService.updateRecipe('non-existent-id', {});

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Recipe not found');
    });

    it('should validate update data and return errors', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockExistingRecipe);

      const invalidUpdateData = {
        title: 'ab', // Too short
        cookingTime: -5, // Negative
        servings: 0, // Zero
      };

      const result = await RecipeUpdateService.updateRecipe('recipe-id', invalidUpdateData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters long');
      expect(result.errors).toContain('Cooking time must be positive');
      expect(result.errors).toContain('Servings must be at least 1');
    });

    it('should skip validation when validateBeforeUpdate is false', async () => {
      const mockUpdatedRecipe = { ...mockExistingRecipe, title: 'ab' };
      mockPrisma.recipe.findUnique.mockResolvedValue(mockExistingRecipe);
      mockPrisma.recipe.update.mockResolvedValue(mockUpdatedRecipe);

      const result = await RecipeUpdateService.updateRecipe(
        'recipe-id',
        { title: 'ab' },
        { validateBeforeUpdate: false }
      );

      expect(result.success).toBe(true);
    });

    it('should handle image updates', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockExistingRecipe);
      mockPrisma.recipe.update.mockResolvedValue(mockExistingRecipe);
      mockPrisma.recipeImage.deleteMany.mockResolvedValue({});
      mockPrisma.recipeImage.create.mockResolvedValue({});

      const updateData = {
        images: [
          { url: 'https://example.com/image1.jpg', alt: 'Image 1', isPrimary: true },
          { url: 'https://example.com/image2.jpg', alt: 'Image 2', isPrimary: false },
        ],
      };

      const result = await RecipeUpdateService.updateRecipe('recipe-id', updateData);

      expect(result.success).toBe(true);
      expect(mockPrisma.recipeImage.deleteMany).toHaveBeenCalledWith({
        where: { recipeId: 'recipe-id' },
      });
      expect(mockPrisma.recipeImage.create).toHaveBeenCalledTimes(2);
    });

    it('should handle category updates', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockExistingRecipe);
      mockPrisma.recipe.update.mockResolvedValue(mockExistingRecipe);
      mockPrisma.recipeCategory.deleteMany.mockResolvedValue({});
      mockPrisma.recipeCategory.create.mockResolvedValue({});

      const updateData = {
        categoryIds: ['category-1', 'category-2'],
      };

      const result = await RecipeUpdateService.updateRecipe('recipe-id', updateData);

      expect(result.success).toBe(true);
      expect(mockPrisma.recipeCategory.deleteMany).toHaveBeenCalledWith({
        where: { recipeId: 'recipe-id' },
      });
      expect(mockPrisma.recipeCategory.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateRecipePartial', () => {
    it('should update a single field', async () => {
      const mockExistingRecipe = {
        id: 'recipe-id',
        title: 'Original Recipe',
        description: 'Original description',
        ingredients: [],
        instructions: [],
        cookingTime: 30,
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Italian',
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

      const mockUpdatedRecipe = { ...mockExistingRecipe, title: 'Updated Title' };

      mockPrisma.recipe.findUnique
        .mockResolvedValueOnce(mockExistingRecipe) // First call for validation
        .mockResolvedValueOnce(mockUpdatedRecipe); // Second call for final result
      mockPrisma.recipe.update.mockResolvedValue(mockUpdatedRecipe);

      const result = await RecipeUpdateService.updateRecipePartial('recipe-id', 'title', 'Updated Title');

      expect(result.success).toBe(true);
      expect(result.recipe?.title).toBe('Updated Title');
    });
  });

  describe('addRecipeImage', () => {
    it('should add image successfully', async () => {
      const mockRecipe = {
        id: 'recipe-id',
        title: 'Test Recipe',
        images: [],
        categories: [],
      };

      mockPrisma.recipeImage.create.mockResolvedValue({
        id: 'image-id',
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        isPrimary: false,
        recipeId: 'recipe-id',
      });

      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const imageData = {
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        isPrimary: false,
      };

      const result = await RecipeUpdateService.addRecipeImage('recipe-id', imageData);

      expect(result.success).toBe(true);
      expect(mockPrisma.recipeImage.create).toHaveBeenCalledWith({
        data: {
          url: 'https://example.com/image.jpg',
          alt: 'Test image',
          isPrimary: false,
          recipeId: 'recipe-id',
        },
      });
    });

    it('should handle errors when adding image', async () => {
      mockPrisma.recipeImage.create.mockRejectedValue(new Error('Database error'));

      const result = await RecipeUpdateService.addRecipeImage('recipe-id', {});

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Database error');
    });
  });

  describe('removeRecipeImage', () => {
    it('should remove image successfully', async () => {
      const mockRecipe = {
        id: 'recipe-id',
        title: 'Test Recipe',
        images: [],
        categories: [],
      };

      mockPrisma.recipeImage.delete.mockResolvedValue({});
      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const result = await RecipeUpdateService.removeRecipeImage('recipe-id', 'image-id');

      expect(result.success).toBe(true);
      expect(mockPrisma.recipeImage.delete).toHaveBeenCalledWith({
        where: { id: 'image-id', recipeId: 'recipe-id' },
      });
    });

    it('should handle errors when removing image', async () => {
      mockPrisma.recipeImage.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await RecipeUpdateService.removeRecipeImage('recipe-id', 'image-id');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Delete failed');
    });
  });

  describe('addRecipeCategory', () => {
    it('should add category successfully', async () => {
      const mockRecipe = {
        id: 'recipe-id',
        title: 'Test Recipe',
        images: [],
        categories: [],
      };

      mockPrisma.recipeCategory.create.mockResolvedValue({});
      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const result = await RecipeUpdateService.addRecipeCategory('recipe-id', 'category-id');

      expect(result.success).toBe(true);
      expect(mockPrisma.recipeCategory.create).toHaveBeenCalledWith({
        data: {
          recipeId: 'recipe-id',
          categoryId: 'category-id',
        },
      });
    });

    it('should handle errors when adding category', async () => {
      mockPrisma.recipeCategory.create.mockRejectedValue(new Error('Category error'));

      const result = await RecipeUpdateService.addRecipeCategory('recipe-id', 'category-id');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Category error');
    });
  });

  describe('removeRecipeCategory', () => {
    it('should remove category successfully', async () => {
      const mockRecipe = {
        id: 'recipe-id',
        title: 'Test Recipe',
        images: [],
        categories: [],
      };

      mockPrisma.recipeCategory.delete.mockResolvedValue({});
      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const result = await RecipeUpdateService.removeRecipeCategory('recipe-id', 'category-id');

      expect(result.success).toBe(true);
      expect(mockPrisma.recipeCategory.delete).toHaveBeenCalledWith({
        where: {
          recipeId_categoryId: {
            recipeId: 'recipe-id',
            categoryId: 'category-id',
          },
        },
      });
    });

    it('should handle errors when removing category', async () => {
      mockPrisma.recipeCategory.delete.mockRejectedValue(new Error('Remove failed'));

      const result = await RecipeUpdateService.removeRecipeCategory('recipe-id', 'category-id');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Remove failed');
    });
  });
}); 