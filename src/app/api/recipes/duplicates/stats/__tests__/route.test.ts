import { NextRequest } from 'next/server';
import { GET } from '../route';
import { RecipeService } from '../../../../../../lib/recipes/recipe-service';

// Mock the service
jest.mock('../../../../../../lib/recipes/recipe-service');

const mockRecipeService = RecipeService as jest.Mocked<typeof RecipeService>;

describe('/api/recipes/duplicates/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return duplicate statistics successfully', async () => {
      const mockStats = {
        totalRecipes: 100,
        potentialDuplicates: 15,
        duplicatePercentage: 15,
      };

      mockRecipeService.getDuplicateStats.mockResolvedValue(mockStats);

      const request = new NextRequest(
        'http://localhost:3000/api/recipes/duplicates/stats?userId=user-id'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(mockRecipeService.getDuplicateStats).toHaveBeenCalledWith('user-id');
    });

    it('should handle missing userId parameter', async () => {
      const mockStats = {
        totalRecipes: 50,
        potentialDuplicates: 5,
        duplicatePercentage: 10,
      };

      mockRecipeService.getDuplicateStats.mockResolvedValue(mockStats);

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates/stats');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(mockRecipeService.getDuplicateStats).toHaveBeenCalledWith(undefined);
    });

    it('should handle service errors', async () => {
      mockRecipeService.getDuplicateStats.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/recipes/duplicates/stats');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to get duplicate statistics');
    });
  });
}); 