import { NextRequest } from 'next/server';
import { POST, GET, PUT } from '../route';
import { DuplicateDetectionService } from '../../../../../lib/recipes/duplicate-detection';
import { RecipeService } from '../../../../../lib/recipes/recipe-service';

// Mock the services
jest.mock('../../../../../lib/recipes/duplicate-detection');
jest.mock('../../../../../lib/recipes/recipe-service');

const mockDuplicateDetectionService = DuplicateDetectionService as jest.Mocked<typeof DuplicateDetectionService>;
const mockRecipeService = RecipeService as jest.Mocked<typeof RecipeService>;

describe('/api/recipes/duplicates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should check for duplicates successfully', async () => {
      const mockRecipe = {
        title: 'Chocolate Chip Cookies',
        description: 'Delicious cookies',
        ingredients: [{ name: 'flour', quantity: 2, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Mix ingredients' }],
        cookingTime: 30,
        servings: 24,
        difficulty: 'easy' as const,
        cuisine: 'American',
        source: 'https://example.com',
        sourceType: 'blog' as const,
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
      };

      const mockDuplicates = {
        duplicates: [
          {
            recipe: { id: 'existing-id', title: 'Chocolate Chip Cookies' } as any,
            similarityScore: 1.0,
            matchType: 'exact_title' as const,
            confidence: 'high' as const,
          },
        ],
        hasDuplicates: true,
        totalDuplicates: 1,
        highestSimilarityScore: 1.0,
      };

      mockDuplicateDetectionService.detectDuplicates.mockResolvedValue(mockDuplicates);

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates', {
        method: 'POST',
        body: JSON.stringify({
          recipe: mockRecipe,
          userId: 'user-id',
          similarityThreshold: 0.7,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDuplicates);
      expect(mockDuplicateDetectionService.detectDuplicates).toHaveBeenCalledWith(
        mockRecipe,
        'user-id',
        {
          similarityThreshold: 0.7,
          checkExactTitle: true,
          checkFuzzyTitle: true,
          checkIngredientSimilarity: true,
          checkSourceUrl: true,
          checkContentFingerprint: true,
        }
      );
    });

    it('should handle invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates', {
        method: 'POST',
        body: JSON.stringify({
          recipe: { title: '' }, // Invalid recipe
          userId: 'user-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should handle service errors', async () => {
      mockDuplicateDetectionService.detectDuplicates.mockRejectedValue(new Error('Database error'));

      const mockRecipe = {
        title: 'Chocolate Chip Cookies',
        description: 'Delicious cookies',
        ingredients: [{ name: 'flour', quantity: 2, unit: 'cups' }],
        instructions: [{ step: 1, instruction: 'Mix ingredients' }],
        cookingTime: 30,
        servings: 24,
        difficulty: 'easy' as const,
        cuisine: 'American',
        source: 'https://example.com',
        sourceType: 'blog' as const,
        isVegetarian: true,
        isGlutenFree: false,
        isVegan: false,
      };

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates', {
        method: 'POST',
        body: JSON.stringify({
          recipe: mockRecipe,
          userId: 'user-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to check duplicates');
    });
  });

  describe('GET', () => {
    it('should find all duplicates successfully', async () => {
      const mockDuplicates = {
        duplicateGroups: [
          {
            recipes: [
              { id: 'recipe-1', title: 'Chocolate Chip Cookies' },
              { id: 'recipe-2', title: 'Chocolate Chip Cookies' },
            ] as any[],
            similarityScore: 1.0,
            matchType: 'exact_title',
          },
        ],
        totalGroups: 1,
      };

      mockRecipeService.findAllDuplicates.mockResolvedValue(mockDuplicates);

      const request = new NextRequest(
        'http://localhost:3000/api/recipes/duplicates?userId=user-id&similarityThreshold=0.7&limit=50'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDuplicates);
      expect(mockRecipeService.findAllDuplicates).toHaveBeenCalledWith('user-id', {
        similarityThreshold: 0.7,
        limit: 50,
      });
    });

    it('should handle invalid query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/recipes/duplicates?similarityThreshold=invalid&limit=invalid'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request parameters');
      expect(data.details).toBeDefined();
    });

    it('should handle service errors', async () => {
      mockRecipeService.findAllDuplicates.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to find duplicates');
    });
  });

  describe('PUT', () => {
    it('should merge duplicates successfully', async () => {
      const mockMergeResult = {
        keptRecipe: { id: 'recipe-1', title: 'Chocolate Chip Cookies' } as any,
        deletedRecipes: [{ id: 'recipe-2', title: 'Chocolate Chip Cookies' }] as any[],
      };

      mockRecipeService.mergeDuplicateRecipes.mockResolvedValue(mockMergeResult);

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates', {
        method: 'PUT',
        body: JSON.stringify({
          recipeIds: ['recipe-1', 'recipe-2'],
          keepRecipeId: 'recipe-1',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMergeResult);
      expect(data.message).toBe('Successfully merged 1 duplicate recipes');
      expect(mockRecipeService.mergeDuplicateRecipes).toHaveBeenCalledWith(
        ['recipe-1', 'recipe-2'],
        'recipe-1'
      );
    });

    it('should handle invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates', {
        method: 'PUT',
        body: JSON.stringify({
          recipeIds: ['recipe-1'], // Need at least 2 recipes
          keepRecipeId: 'recipe-1',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should handle service errors', async () => {
      mockRecipeService.mergeDuplicateRecipes.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates', {
        method: 'PUT',
        body: JSON.stringify({
          recipeIds: ['recipe-1', 'recipe-2'],
          keepRecipeId: 'recipe-1',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to merge duplicates');
    });
  });
}); 