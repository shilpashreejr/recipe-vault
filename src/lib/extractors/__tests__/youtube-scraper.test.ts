import { YouTubeScraper } from '../youtube-scraper';

describe('YouTubeScraper', () => {
  let scraper: YouTubeScraper;
  beforeEach(() => {
    scraper = new YouTubeScraper();
  });

  it('should validate correct YouTube URLs', () => {
    const validUrls = [
      'https://youtube.com/watch?v=abcdefghijk',
      'https://www.youtube.com/watch?v=abcdefghijk',
      'https://youtu.be/abcdefghijk',
      'http://youtube.com/watch?v=abcdefghijk',
      'http://youtu.be/abcdefghijk'
    ];
    for (const url of validUrls) {
      expect(scraper['isValidYouTubeUrl'](url)).toBe(true);
    }
  });

  it('should reject invalid YouTube URLs', () => {
    const invalidUrls = [
      'https://example.com/not-youtube',
      'https://youtube.com/',
      'https://youtube.com/watch?v=',
      'https://youtu.be/'
    ];
    for (const url of invalidUrls) {
      expect(scraper['isValidYouTubeUrl'](url)).toBe(false);
    }
  });

  it('should extract video ID from valid URLs', () => {
    expect(scraper['extractVideoId']('https://youtube.com/watch?v=abcdefghijk')).toBe('abcdefghijk');
    expect(scraper['extractVideoId']('https://youtu.be/abcdefghijk')).toBe('abcdefghijk');
  });

  it('should return null for invalid video ID', () => {
    expect(scraper['extractVideoId']('https://youtube.com/')).toBeNull();
    expect(scraper['extractVideoId']('https://youtu.be/')).toBeNull();
  });

  it('should parse recipe from description', () => {
    const description = `Amazing Pasta Recipe\n\nIngredients:\n- 200g pasta\n- 2 cups tomato sauce\n- 1 onion\n- 2 cloves garlic\n\nInstructions:\n1. Boil pasta\n2. Saute onion and garlic\n3. Add tomato sauce\n4. Mix with pasta\n\n#pasta #recipe #cooking`;
    const recipe = scraper['parseRecipeFromDescription'](description);
    expect(recipe.title).toBe('Amazing Pasta Recipe');
    expect(recipe.ingredients).toEqual([
      '200g pasta',
      '2 cups tomato sauce',
      '1 onion',
      '2 cloves garlic'
    ]);
    expect(recipe.instructions).toEqual([
      'Boil pasta',
      'Saute onion and garlic',
      'Add tomato sauce',
      'Mix with pasta'
    ]);
    expect(recipe.tags).toEqual(['pasta', 'recipe', 'cooking']);
    expect(recipe.difficulty).toBe('Medium');
  });

  it('should throw error for invalid YouTube URL', async () => {
    await expect(scraper.scrapeYouTubeRecipe('invalid-url')).rejects.toThrow('Invalid YouTube URL format');
  });

  it('should throw error when video ID cannot be extracted', async () => {
    await expect(scraper.scrapeYouTubeRecipe('https://youtube.com/watch?v=')).rejects.toThrow('Could not extract video ID from URL');
  });

  it('should throw error for insufficient recipe data', async () => {
    jest.spyOn(scraper as any, 'fetchVideoData').mockResolvedValue({
      description: 'No recipe here',
      channel: 'Test Channel',
      publishedAt: new Date().toISOString(),
      views: 100,
      likes: 10
    });
    await expect(scraper.scrapeYouTubeRecipe('https://youtube.com/watch?v=abcdefghijk')).rejects.toThrow('Insufficient recipe data found in video description');
  });
}); 