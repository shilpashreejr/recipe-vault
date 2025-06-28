import { extractRecipeFromUrl } from '../extract-recipe';

jest.mock('@/lib/extractors', () => {
  const actual = jest.requireActual('@/lib/extractors');
  return {
    ...actual,
    InstagramScraper: jest.fn().mockImplementation(() => ({
      scrapeInstagramRecipe: jest.fn().mockResolvedValue({ title: 'Test Recipe' }),
      close: jest.fn()
    })),
    RateLimiter: jest.fn().mockImplementation(() => ({ waitForPermission: jest.fn() })),
    RateLimitPresets: { instagram: {} }
  };
});

describe('/api/extract/url API', () => {
  it('should return 400 for missing URL', async () => {
    const result = await extractRecipeFromUrl(undefined as any);
    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/Missing URL/);
  });

  it('should return success for valid Instagram URL (mocked)', async () => {
    const result = await extractRecipeFromUrl('https://instagram.com/p/abc123');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.recipe).toBeDefined();
    if (result.body.recipe) {
      expect(result.body.recipe.title).toBe('Test Recipe');
    }
  });
}); 