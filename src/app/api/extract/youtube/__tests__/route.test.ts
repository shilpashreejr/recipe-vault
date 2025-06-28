import { NextRequest } from 'next/server';
import { POST } from '../route';

jest.mock('@/lib/extractors/youtube-scraper', () => ({
  YouTubeScraper: jest.fn(),
}));

describe('YouTube Extraction API', () => {
  it('should return 400 for missing URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/youtube', {
      method: 'POST',
      body: JSON.stringify({})
    });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing YouTube URL');
  });

  it('should return 400 for invalid YouTube URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/youtube', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/not-youtube' })
    });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid YouTube URL. Please provide a valid YouTube video URL.');
  });

  it('should accept valid YouTube URLs', async () => {
    const { YouTubeScraper } = await import('@/lib/extractors/youtube-scraper');
    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['200g pasta', '2 cups tomato sauce'],
      instructions: ['Boil pasta', 'Add sauce'],
      source: 'https://youtube.com/watch?v=abcdefghijk',
      sourceType: 'youtube' as const,
      extractedAt: '2024-01-01T00:00:00.000Z',
      metadata: {
        videoId: 'abcdefghijk',
        channel: 'Test Channel',
        publishedAt: '2024-01-01T00:00:00.000Z',
        views: 1000,
        likes: 100
      }
    };
    const mockScraper = {
      scrapeYouTubeRecipe: jest.fn().mockResolvedValue(mockRecipe),
    };
    (YouTubeScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    const validUrls = [
      'https://youtube.com/watch?v=abcdefghijk',
      'https://www.youtube.com/watch?v=abcdefghijk',
      'https://youtu.be/abcdefghijk',
      'http://youtube.com/watch?v=abcdefghijk',
      'http://youtu.be/abcdefghijk'
    ];
    for (const url of validUrls) {
      const req = new NextRequest('http://localhost:3000/api/extract/youtube', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      const response = await POST(req);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recipe).toEqual(mockRecipe);
      expect(data.recipe.sourceType).toBe('youtube');
      expect(mockScraper.scrapeYouTubeRecipe).toHaveBeenCalledWith(url);
    }
  });

  it('should handle scraping errors gracefully', async () => {
    const { YouTubeScraper } = await import('@/lib/extractors/youtube-scraper');
    const mockScraper = {
      scrapeYouTubeRecipe: jest.fn().mockRejectedValue(new Error('Scraping failed')),
    };
    (YouTubeScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    const req = new NextRequest('http://localhost:3000/api/extract/youtube', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://youtube.com/watch?v=abcdefghijk' })
    });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to extract recipe from YouTube');
  });

  it('should handle insufficient recipe data errors', async () => {
    const { YouTubeScraper } = await import('@/lib/extractors/youtube-scraper');
    const mockScraper = {
      scrapeYouTubeRecipe: jest.fn().mockRejectedValue(new Error('Insufficient recipe data found in video description')),
    };
    (YouTubeScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);
    const req = new NextRequest('http://localhost:3000/api/extract/youtube', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://youtube.com/watch?v=abcdefghijk' })
    });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(422);
    expect(data.error).toBe('No recipe data found in this YouTube video description.');
  });
}); 