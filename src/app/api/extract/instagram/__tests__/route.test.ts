import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the InstagramScraper
jest.mock('@/lib/extractors', () => ({
  InstagramScraper: jest.fn(),
  RateLimiter: jest.fn(),
  RateLimitPresets: {
    instagram: {
      maxRequests: 5,
      timeWindow: 60000,
      delayBetweenRequests: 5000
    }
  }
}));

describe('Instagram Extraction API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for missing URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing Instagram URL');
  });

  it('should return 400 for invalid Instagram URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/not-instagram' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid Instagram URL. Please provide a valid Instagram post or reel URL.');
  });

  it('should accept valid Instagram post URL', async () => {
    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['2 cups flour', '1 cup sugar'],
      instructions: ['Mix ingredients', 'Bake at 350F'],
      cookingTime: '30 minutes',
      servings: '4 servings',
      images: ['https://example.com/image1.jpg'],
      source: 'https://instagram.com/p/ABC123',
      extractedAt: new Date()
    };

    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockResolvedValue(mockRecipe),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ 
        url: 'https://instagram.com/p/ABC123',
        options: { extractComments: true }
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recipe.title).toBe('Test Recipe');
    expect(data.recipe.sourceType).toBe('instagram');
    expect(mockScraper.scrapeInstagramRecipe).toHaveBeenCalledWith(
      'https://instagram.com/p/ABC123',
      { extractComments: true }
    );
    expect(mockScraper.close).toHaveBeenCalled();
  });

  it('should accept valid Instagram reel URL', async () => {
    const mockRecipe = {
      title: 'Reel Recipe',
      ingredients: ['1 cup milk', '2 eggs'],
      instructions: ['Whisk ingredients', 'Cook on medium heat'],
      cookingTime: '15 minutes',
      servings: '2 servings',
      images: ['https://example.com/reel-image.jpg'],
      source: 'https://instagram.com/reel/XYZ789',
      extractedAt: new Date()
    };

    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockResolvedValue(mockRecipe),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://instagram.com/reel/XYZ789' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recipe.title).toBe('Reel Recipe');
  });

  it('should handle timeout errors', async () => {
    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockRejectedValue(new Error('timeout')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://instagram.com/p/ABC123' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(408);
    expect(data.error).toBe('Instagram post took too long to load. Please try again.');
  });

  it('should handle not found errors', async () => {
    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockRejectedValue(new Error('not found')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://instagram.com/p/ABC123' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Instagram post not found or may be private.');
  });

  it('should handle rate limit errors', async () => {
    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockRejectedValue(new Error('rate limit exceeded')),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://instagram.com/p/ABC123' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded. Please wait a moment before trying again.');
  });

  it('should transform scraped recipe correctly', async () => {
    const mockRecipe = {
      title: 'Pasta Carbonara',
      ingredients: ['200g spaghetti', '100g pancetta', '2 eggs'],
      instructions: ['Boil pasta', 'Cook pancetta', 'Mix with eggs'],
      cookingTime: '20 minutes',
      servings: '2 servings',
      images: ['https://example.com/pasta1.jpg', 'https://example.com/pasta2.jpg'],
      source: 'https://instagram.com/p/PASTA123',
      extractedAt: new Date()
    };

    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockResolvedValue(mockRecipe),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://instagram.com/p/PASTA123' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recipe.title).toBe('Pasta Carbonara');
    expect(data.recipe.ingredients).toHaveLength(3);
    expect(data.recipe.ingredients[0].name).toBe('200g spaghetti');
    expect(data.recipe.instructions).toHaveLength(3);
    expect(data.recipe.prepTime).toBe(20);
    expect(data.recipe.servings).toBe(2);
    expect(data.recipe.images).toHaveLength(2);
    expect(data.recipe.images[0].isPrimary).toBe(true);
    expect(data.recipe.images[1].isPrimary).toBe(false);
  });

  it('should handle hours in cooking time', async () => {
    const mockRecipe = {
      title: 'Slow Cooker Beef',
      ingredients: ['1kg beef', '2 onions'],
      instructions: ['Brown beef', 'Add to slow cooker', 'Cook for hours'],
      cookingTime: '4 hours',
      servings: '6 servings',
      images: ['https://example.com/beef.jpg'],
      source: 'https://instagram.com/p/BEEF123',
      extractedAt: new Date()
    };

    const { InstagramScraper, RateLimiter } = await import('@/lib/extractors');
    const mockScraper = {
      scrapeInstagramRecipe: jest.fn().mockResolvedValue(mockRecipe),
      close: jest.fn()
    };
    const mockRateLimiter = {
      waitForPermission: jest.fn().mockResolvedValue(undefined)
    };
    
    (InstagramScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    (RateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);

    const req = new NextRequest('http://localhost:3000/api/extract/instagram', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://instagram.com/p/BEEF123' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recipe.prepTime).toBe(240); // 4 hours * 60 minutes
  });
}); 