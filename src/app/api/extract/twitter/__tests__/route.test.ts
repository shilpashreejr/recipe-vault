import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock NextRequest for testing
jest.mock('next/server', () => ({
  NextRequest: class extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input, init);
    }
  },
  NextResponse: {
    json: (data: any, options?: any) => ({
      status: options?.status || 200,
      json: async () => data
    })
  }
}));

// Mock the TwitterScraper
jest.mock('@/lib/extractors/twitter-scraper', () => ({
  TwitterScraper: jest.fn(),
}));

describe('Twitter Extraction API', () => {
  it('should return 400 for missing URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing Twitter/X URL');
  });

  it('should return 400 for invalid Twitter URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/not-twitter' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid Twitter/X URL. Please provide a valid Twitter/X post URL.');
  });

  it('should accept valid Twitter URLs', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['2 cups flour', '1 cup sugar'],
      instructions: ['Mix ingredients', 'Bake at 350°F'],
      source: 'https://twitter.com/testuser/status/123456789',
      sourceType: 'twitter' as const,
      extractedAt: '2024-01-01T00:00:00.000Z',
      metadata: {
        postId: '123456789',
        author: 'testuser',
        postedAt: '2024-01-01T00:00:00.000Z',
        likes: 100,
        retweets: 20,
        replies: 5
      }
    };

    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockResolvedValue(mockRecipe),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    // Test various valid Twitter URL formats
    const validUrls = [
      'https://twitter.com/testuser/status/123456789',
      'https://www.twitter.com/testuser/status/123456789',
      'https://x.com/testuser/status/123456789',
      'https://www.x.com/testuser/status/123456789',
      'https://twitter.com/i/web/status/123456789',
      'https://x.com/i/web/status/123456789'
    ];

    for (const url of validUrls) {
      const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
        method: 'POST',
        body: JSON.stringify({ url })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recipe).toEqual(mockRecipe);
      expect(data.recipe.sourceType).toBe('twitter');
      expect(mockScraper.scrapeTwitterRecipe).toHaveBeenCalledWith(url);
    }
  });

  it('should handle scraping errors gracefully', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockRejectedValue(new Error('Scraping failed')),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://twitter.com/testuser/status/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to extract recipe from Twitter/X');
  });

  it('should handle timeout errors', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockRejectedValue(new Error('timeout')),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://twitter.com/testuser/status/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(408);
    expect(data.error).toBe('Twitter/X post took too long to load. Please try again.');
  });

  it('should handle not found errors', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockRejectedValue(new Error('not found')),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://twitter.com/testuser/status/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Twitter/X post not found or may be private.');
  });

  it('should handle rate limit errors', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockRejectedValue(new Error('rate limit exceeded')),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://twitter.com/testuser/status/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded. Please wait a moment before trying again.');
  });

  it('should handle insufficient recipe data errors', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockRejectedValue(new Error('Insufficient recipe data found in post')),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://twitter.com/testuser/status/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe('No recipe data found in this Twitter/X post.');
  });

  it('should handle invalid URL format errors', async () => {
    const { TwitterScraper } = await import('@/lib/extractors/twitter-scraper');
    
    const mockScraper = {
      scrapeTwitterRecipe: jest.fn().mockRejectedValue(new Error('Invalid Twitter/X URL format')),
    };

    (TwitterScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/twitter', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://twitter.com/testuser/status/123456789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid Twitter/X URL format.');
  });
}); 