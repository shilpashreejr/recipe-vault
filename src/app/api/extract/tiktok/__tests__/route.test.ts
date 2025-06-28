import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the TikTokScraper
jest.mock('@/lib/extractors', () => ({
  TikTokScraper: jest.fn(),
  RateLimiter: jest.fn(),
  RateLimitPresets: {
    conservative: {
      maxRequests: 10,
      timeWindow: 60000,
      delayBetweenRequests: 2000
    }
  }
}));

describe('TikTok Extraction API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for missing URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing TikTok URL');
  });

  it('should return 400 for invalid TikTok URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/not-tiktok' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid TikTok URL. Please provide a valid TikTok video URL.');
  });

  it('should accept valid TikTok URLs', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockResolvedValue({
        title: 'Test Recipe',
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        videoId: '123456789',
        author: 'Test User',
        authorUsername: 'testuser',
        likes: 1000,
        shares: 100,
        comments: 50,
        views: 5000,
        hashtags: ['#recipe', '#food'],
        source: 'https://tiktok.com/@testuser/video/123456789',
        extractedAt: new Date()
      }),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const validUrls = [
      'https://tiktok.com/@testuser/video/123456789',
      'https://www.tiktok.com/@testuser/video/123456789',
      'https://vm.tiktok.com/ABC123',
      'https://www.vm.tiktok.com/ABC123',
      'https://tiktok.com/t/ABC123',
      'https://www.tiktok.com/t/ABC123'
    ];

    for (const url of validUrls) {
      const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
        method: 'POST',
        body: JSON.stringify({ url })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recipe).toBeDefined();
      expect(data.recipe.title).toBe('Test Recipe');
      expect(data.recipe.metadata.videoId).toBe('123456789');
      expect(data.recipe.metadata.author).toBe('Test User');
    }
  });

  it('should handle scraper errors gracefully', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockRejectedValue(new Error('Scraping failed')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://tiktok.com/@testuser/video/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to extract recipe from TikTok');
  });

  it('should handle timeout errors', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockRejectedValue(new Error('timeout')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://tiktok.com/@testuser/video/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(408);
    expect(data.error).toBe('TikTok video took too long to load. Please try again.');
  });

  it('should handle not found errors', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockRejectedValue(new Error('not found')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://tiktok.com/@testuser/video/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('TikTok video not found or may be private.');
  });

  it('should handle rate limit errors', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockRejectedValue(new Error('rate limit exceeded')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://tiktok.com/@testuser/video/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded. Please wait a moment before trying again.');
  });

  it('should always close the scraper', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockRejectedValue(new Error('test error')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://tiktok.com/@testuser/video/123456789' })
    });

    await POST(req);

    expect(mockScraper.close).toHaveBeenCalled();
  });

  it('should pass options to the scraper', async () => {
    const { TikTokScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeTikTokRecipe: jest.fn().mockResolvedValue({
        title: 'Test Recipe',
        ingredients: [],
        instructions: [],
        videoId: '123456789',
        author: 'Test User',
        authorUsername: 'testuser',
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
        hashtags: [],
        source: 'https://tiktok.com/@testuser/video/123456789',
        extractedAt: new Date()
      }),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (TikTokScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const options = {
      extractComments: true,
      extractHashtags: true,
      extractMusic: true,
      timeout: 45000
    };

    const req = new NextRequest('http://localhost:3000/api/extract/tiktok', {
      method: 'POST',
      body: JSON.stringify({ 
        url: 'https://tiktok.com/@testuser/video/123456789',
        options 
      })
    });

    await POST(req);

    expect(mockScraper.scrapeTikTokRecipe).toHaveBeenCalledWith(
      'https://tiktok.com/@testuser/video/123456789',
      options
    );
  });
}); 