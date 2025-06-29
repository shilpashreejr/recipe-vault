import { handleSocialMediaExtraction } from '../handler';

// Mock the dependencies
jest.mock('@/lib/extractors/social-media-rate-limiter', () => ({
  SocialMediaRateLimiter: jest.fn(),
}));

jest.mock('@/lib/extractors/social-media-metadata', () => ({
  SocialMediaMetadataPreservation: jest.fn(),
}));

jest.mock('../../url/extract-recipe', () => ({
  extractRecipeFromUrl: jest.fn(),
}));

describe('handleSocialMediaExtraction', () => {
  let mockRateLimiter: any;
  let mockMetadataPreservation: any;
  let mockExtractRecipeFromUrl: any;

  beforeEach(() => {
    mockRateLimiter = {
      getSupportedPlatforms: jest.fn(),
      isRateLimited: jest.fn(),
      getTimeUntilNextRequest: jest.fn(),
      validateRequest: jest.fn(),
      waitForPermission: jest.fn(),
      getPlatformRateLimit: jest.fn(),
      getRequestStats: jest.fn(),
    };

    mockMetadataPreservation = {
      createMetadata: jest.fn(),
    };

    mockExtractRecipeFromUrl = jest.fn();

    const { SocialMediaRateLimiter } = require('@/lib/extractors/social-media-rate-limiter');
    const { SocialMediaMetadataPreservation } = require('@/lib/extractors/social-media-metadata');
    const { extractRecipeFromUrl } = require('../../url/extract-recipe');

    (SocialMediaRateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);
    (SocialMediaMetadataPreservation as jest.MockedClass<any>).mockImplementation(() => mockMetadataPreservation);
    (extractRecipeFromUrl as jest.MockedFunction<any>).mockImplementation(mockExtractRecipeFromUrl);
  });

  it('should return 400 for missing URL', async () => {
    const result = await handleSocialMediaExtraction({ url: '' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Missing URL');
  });

  it('should return 400 for unsupported social media platform', async () => {
    const result = await handleSocialMediaExtraction({ url: 'https://example.com/not-social-media' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('URL is not from a supported social media platform');
  });

  it('should return 400 for unsupported platform in supported platforms list', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram', 'tiktok']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });

    const result = await handleSocialMediaExtraction({ url: 'https://unsupported.com/post/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('URL is not from a supported social media platform');
  });

  it('should return 429 when rate limited', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(true);
    mockRateLimiter.getTimeUntilNextRequest.mockReturnValue(30000);

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(429);
    if (result.status === 429) {
      const body = result.body as { error: string; timeUntilNext: number; retryAfter: number };
      expect(body.error).toBe('Rate limit exceeded for this platform');
      expect(body.timeUntilNext).toBe(30000);
      expect(body.retryAfter).toBe(30);
    }
  });

  it('should return 422 when request does not comply with platform policies', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({
      isValid: false,
      reason: 'Invalid URL format'
    });

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(422);
    if (result.status === 422) {
      const body = result.body as { error: string; details: string };
      expect(body.error).toBe('Request does not comply with platform policies');
      expect(body.details).toBe('Invalid URL format');
    }
  });

  it('should successfully extract recipe from Instagram', async () => {
    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2']
    };

    const mockMetadata = {
      platform: 'instagram',
      contentId: '123',
      url: 'https://instagram.com/p/123',
      author: { username: 'testuser' },
      engagement: { likes: 100 },
      timestamps: { published: '2024-01-01T00:00:00.000Z', scraped: '2024-01-01T00:00:00.000Z' },
      tags: [],
      platformSpecific: {},
      privacy: { isPublic: true },
      categories: []
    };

    const mockRateLimit = {
      platform: 'instagram',
      requestsPerMinute: 30,
      requestsPerHour: 200,
      requestsPerDay: 1000,
      burstLimit: 5,
      cooldownPeriod: 60000,
      respectRobotsTxt: true,
      retryAfterHeader: true,
      exponentialBackoff: true
    };

    const mockStats = {
      totalRequests: 10,
      requestsLastHour: 5,
      requestsLastMinute: 1,
      averageInterval: 5000
    };

    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockResolvedValue(undefined);
    mockRateLimiter.getPlatformRateLimit.mockReturnValue(mockRateLimit);
    mockRateLimiter.getRequestStats.mockReturnValue(mockStats);

    mockExtractRecipeFromUrl.mockResolvedValue({
      status: 200,
      body: { recipe: mockRecipe }
    });

    mockMetadataPreservation.createMetadata.mockReturnValue(mockMetadata);

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(200);
    if (result.status === 200) {
      const body = result.body as {
        success: boolean;
        platform: string;
        recipe: any;
        metadata: any;
        compliance: any;
        extractedAt: string;
      };
      expect(body.success).toBe(true);
      expect(body.platform).toBe('instagram');
      expect(body.recipe).toEqual(mockRecipe);
      expect(body.metadata).toEqual(mockMetadata);
      expect(body.compliance.rateLimit).toEqual(mockRateLimit);
      expect(body.compliance.stats).toEqual(mockStats);
      expect(body.compliance.validation).toEqual({ isValid: true });
      expect(body.extractedAt).toBeDefined();
    }
    expect(mockRateLimiter.waitForPermission).toHaveBeenCalledWith('instagram');
    expect(mockExtractRecipeFromUrl).toHaveBeenCalledWith('https://instagram.com/p/123', {});
    expect(mockMetadataPreservation.createMetadata).toHaveBeenCalledWith(
      'instagram',
      '123',
      'https://instagram.com/p/123',
      { recipe: mockRecipe }
    );
  });

  it('should use provided platform instead of auto-detection', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockResolvedValue(undefined);
    mockRateLimiter.getPlatformRateLimit.mockReturnValue({ platform: 'instagram' });
    mockRateLimiter.getRequestStats.mockReturnValue({ totalRequests: 0 });

    mockExtractRecipeFromUrl.mockResolvedValue({
      status: 200,
      body: { recipe: { title: 'Test Recipe' } }
    });

    mockMetadataPreservation.createMetadata.mockReturnValue({ platform: 'instagram' });

    const result = await handleSocialMediaExtraction({ 
      url: 'https://instagram.com/p/123',
      platform: 'instagram'
    }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(200);
    if (result.status === 200) {
      const body = result.body as { platform: string };
      expect(body.platform).toBe('instagram');
    }
  });

  it('should handle extraction errors from extractRecipeFromUrl', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockResolvedValue(undefined);

    mockExtractRecipeFromUrl.mockResolvedValue({
      status: 404,
      body: { error: 'Recipe not found' }
    });

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(404);
    if (result.status === 404) {
      const body = result.body as { error: string };
      expect(body.error).toBe('Recipe not found');
    }
  });

  it('should handle rate limit errors', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockRejectedValue(new Error('rate limit exceeded'));

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(429);
    if (result.status === 429) {
      const body = result.body as { error: string };
      expect(body.error).toBe('Rate limit exceeded. Please wait before trying again.');
    }
  });

  it('should handle compliance errors', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockRejectedValue(new Error('compliance violation'));

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(422);
    if (result.status === 422) {
      const body = result.body as { error: string };
      expect(body.error).toBe('Request does not comply with platform policies.');
    }
  });

  it('should handle unsupported platform errors', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockRejectedValue(new Error('unsupported platform'));

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(400);
    if (result.status === 400) {
      const body = result.body as { error: string };
      expect(body.error).toBe('Unsupported social media platform.');
    }
  });

  it('should handle general errors', async () => {
    mockRateLimiter.getSupportedPlatforms.mockReturnValue(['instagram']);
    mockRateLimiter.isRateLimited.mockReturnValue(false);
    mockRateLimiter.validateRequest.mockReturnValue({ isValid: true });
    mockRateLimiter.waitForPermission.mockRejectedValue(new Error('general error'));

    const result = await handleSocialMediaExtraction({ url: 'https://instagram.com/p/123' }, mockRateLimiter, mockMetadataPreservation);
    expect(result.status).toBe(500);
    if (result.status === 500) {
      const body = result.body as { error: string };
      expect(body.error).toBe('Failed to extract recipe from social media: general error');
    }
  });
}); 