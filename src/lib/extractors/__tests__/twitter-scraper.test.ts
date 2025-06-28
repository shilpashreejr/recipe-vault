import { TwitterScraper, TwitterRecipeData } from '../twitter-scraper';

// Mock the dependencies
jest.mock('../rate-limiter');
jest.mock('../error-handler');

describe('TwitterScraper', () => {
  let scraper: TwitterScraper;

  beforeEach(() => {
    scraper = new TwitterScraper();
  });

  describe('URL Validation', () => {
    it('should validate correct Twitter URLs', () => {
      const validUrls = [
        'https://twitter.com/testuser/status/123456789',
        'https://www.twitter.com/testuser/status/123456789',
        'https://x.com/testuser/status/123456789',
        'https://www.x.com/testuser/status/123456789',
        'https://twitter.com/i/web/status/123456789',
        'https://x.com/i/web/status/123456789',
        'http://twitter.com/testuser/status/123456789',
        'http://x.com/testuser/status/123456789'
      ];

      for (const url of validUrls) {
        expect(scraper['isValidTwitterUrl'](url)).toBe(true);
      }
    });

    it('should reject invalid Twitter URLs', () => {
      const invalidUrls = [
        'https://example.com/not-twitter',
        'https://twitter.com/testuser',
        'https://x.com/testuser',
        'https://twitter.com/testuser/status/',
        'https://twitter.com/testuser/status/abc',
        'https://facebook.com/testuser/status/123456789',
        'https://instagram.com/testuser/status/123456789'
      ];

      for (const url of invalidUrls) {
        expect(scraper['isValidTwitterUrl'](url)).toBe(false);
      }
    });
  });

  describe('Post ID Extraction', () => {
    it('should extract post ID from valid URLs', () => {
      const testCases = [
        { url: 'https://twitter.com/testuser/status/123456789', expected: '123456789' },
        { url: 'https://x.com/testuser/status/987654321', expected: '987654321' },
        { url: 'https://twitter.com/i/web/status/555666777', expected: '555666777' },
        { url: 'https://x.com/i/web/status/111222333', expected: '111222333' }
      ];

      for (const { url, expected } of testCases) {
        expect(scraper['extractPostId'](url)).toBe(expected);
      }
    });

    it('should return null for invalid URLs', () => {
      const invalidUrls = [
        'https://twitter.com/testuser',
        'https://x.com/testuser',
        'https://example.com/not-twitter',
        'https://twitter.com/testuser/status/',
        'https://twitter.com/testuser/status/abc'
      ];

      for (const url of invalidUrls) {
        expect(scraper['extractPostId'](url)).toBeNull();
      }
    });
  });

  describe('Recipe Content Parsing', () => {
    it('should extract ingredients from content', () => {
      const content = `
        Check out this amazing recipe!
        
        Ingredients:
        - 2 cups flour
        - 1 cup sugar
        - 3 eggs
        - 1/2 cup milk
        
        Instructions:
        1. Mix flour and sugar
        2. Add eggs and milk
        3. Bake at 350°F for 30 minutes
      `;

      const ingredients = scraper['extractIngredients'](content);
      expect(ingredients).toEqual([
        '2 cups flour',
        '1 cup sugar',
        '3 eggs',
        '1/2 cup milk'
      ]);
    });

    it('should extract ingredients from bullet points', () => {
      const content = `
        • 2 cups flour
        • 1 cup sugar
        • 3 eggs
        • 1/2 cup milk
      `;

      const ingredients = scraper['extractIngredients'](content);
      expect(ingredients).toEqual([
        '2 cups flour',
        '1 cup sugar',
        '3 eggs',
        '1/2 cup milk'
      ]);
    });

    it('should extract instructions from content', () => {
      const content = `
        Instructions:
        1. Mix flour and sugar
        2. Add eggs and milk
        3. Bake at 350°F for 30 minutes
      `;

      const instructions = scraper['extractInstructions'](content);
      expect(instructions).toEqual([
        'Mix flour and sugar',
        'Add eggs and milk',
        'Bake at 350°F for 30 minutes'
      ]);
    });

    it('should extract numbered steps', () => {
      const content = `
        1. Mix flour and sugar
        2. Add eggs and milk
        3. Bake at 350°F for 30 minutes
      `;

      const instructions = scraper['extractInstructions'](content);
      expect(instructions).toEqual([
        'Mix flour and sugar',
        'Add eggs and milk',
        'Bake at 350°F for 30 minutes'
      ]);
    });

    it('should extract cooking time', () => {
      const content = 'Bake at 350°F for 30 minutes';
      const cookingTime = scraper['extractCookingTime'](content);
      expect(cookingTime).toBe('30 minutes');
    });

    it('should extract servings', () => {
      const content = 'Serves 4 people';
      const servings = scraper['extractServings'](content);
      expect(servings).toBe(4);
    });

    it('should extract dietary restrictions', () => {
      const content = 'This is a vegetarian, gluten-free recipe';
      const restrictions = scraper['extractDietaryRestrictions'](content);
      expect(restrictions).toContain('vegetarian');
      expect(restrictions).toContain('gluten-free');
    });

    it('should extract hashtags', () => {
      const content = 'Check out this #recipe #cooking #food';
      const tags = scraper['extractTags'](content);
      expect(tags).toEqual(['recipe', 'cooking', 'food']);
    });

    it('should estimate difficulty correctly', () => {
      expect(scraper['estimateDifficulty'](2, 3)).toBe('Easy');
      expect(scraper['estimateDifficulty'](5, 5)).toBe('Medium');
      expect(scraper['estimateDifficulty'](8, 7)).toBe('Hard');
    });
  });

  describe('Recipe Data Parsing', () => {
    it('should parse complete recipe data', () => {
      const postData = {
        content: `
          Amazing Chocolate Cake Recipe!
          
          Ingredients:
          - 2 cups flour
          - 1 cup sugar
          - 3 eggs
          - 1/2 cup milk
          
          Instructions:
          1. Mix flour and sugar
          2. Add eggs and milk
          3. Bake at 350°F for 30 minutes
          
          Serves 6 people
          #recipe #chocolate #cake
        `
      };

      const recipeData = scraper['parseRecipeFromContent'](postData);
      
      expect(recipeData.title).toBe('Amazing Chocolate Cake Recipe!');
      expect(recipeData.ingredients).toHaveLength(4);
      expect(recipeData.instructions).toHaveLength(3);
      expect(recipeData.servings).toBe(6);
      expect(recipeData.cookingTime).toBe('30 minutes');
      expect(recipeData.tags).toEqual(['recipe', 'chocolate', 'cake']);
      expect(recipeData.difficulty).toBe('Medium');
    });

    it('should handle missing optional data', () => {
      const postData = {
        content: `
          Simple Recipe
          
          Ingredients:
          - 1 cup flour
          
          Instructions:
          1. Mix flour
        `
      };

      const recipeData = scraper['parseRecipeFromContent'](postData);
      
      expect(recipeData.title).toBe('Simple Recipe');
      expect(recipeData.ingredients).toHaveLength(1);
      expect(recipeData.instructions).toHaveLength(1);
      expect(recipeData.servings).toBeNull();
      expect(recipeData.cookingTime).toBeNull();
      expect(recipeData.dietaryRestrictions).toEqual([]);
      expect(recipeData.tags).toEqual([]);
      expect(recipeData.difficulty).toBe('Easy');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid URL format', async () => {
      await expect(scraper.scrapeTwitterRecipe('invalid-url')).rejects.toThrow('Invalid Twitter/X URL format');
    });

    it('should throw error when post ID cannot be extracted', async () => {
      await expect(scraper.scrapeTwitterRecipe('https://twitter.com/testuser/status/')).rejects.toThrow('Could not extract post ID from URL');
    });

    it('should throw error for insufficient recipe data', async () => {
      // Mock the fetchPostData method to return minimal data
      jest.spyOn(scraper as any, 'fetchPostData').mockResolvedValue({
        content: 'Just a regular post with no recipe',
        author: 'testuser',
        postedAt: new Date().toISOString(),
        likes: 10,
        retweets: 2,
        replies: 1
      });

      await expect(scraper.scrapeTwitterRecipe('https://twitter.com/testuser/status/123456789')).rejects.toThrow('Insufficient recipe data found in post');
    });
  });
}); 