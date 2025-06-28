import { NextRequest } from 'next/server';
import { POST } from '../route';

jest.mock('@/lib/extractors/whatsapp-scraper', () => ({
  WhatsAppScraper: jest.fn(),
}));

describe('WhatsApp Extraction API', () => {
  it('should return 400 for missing message content', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing WhatsApp message content');
  });

  it('should return 400 for empty message content', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: '' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid WhatsApp message content. Please provide a non-empty string.');
  });

  it('should return 400 for invalid message content type', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: 123 })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid WhatsApp message content. Please provide a non-empty string.');
  });

  it('should return 400 for invalid metadata format', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ 
        messageContent: 'Test recipe message',
        metadata: 'invalid-metadata'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid metadata format. Must be an object.');
  });

  it('should accept valid WhatsApp message content', async () => {
    const { WhatsAppScraper } = await import('@/lib/extractors/whatsapp-scraper');
    
    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['2 cups flour', '1 cup sugar'],
      instructions: ['Mix ingredients', 'Bake at 350°F'],
      source: 'whatsapp-message',
      sourceType: 'whatsapp' as const,
      extractedAt: '2024-01-01T00:00:00.000Z',
      metadata: {
        messageId: 'whatsapp_123456789',
        sender: 'Test User',
        timestamp: '2024-01-01T00:00:00.000Z',
        isForwarded: false
      }
    };

    const mockScraper = {
      scrapeWhatsAppRecipe: jest.fn().mockResolvedValue(mockRecipe),
    };

    (WhatsAppScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ 
        messageContent: 'Test recipe message with ingredients and instructions',
        metadata: {
          sender: 'Test User',
          isForwarded: false
        }
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recipe).toEqual(mockRecipe);
    expect(data.recipe.sourceType).toBe('whatsapp');
    expect(mockScraper.scrapeWhatsAppRecipe).toHaveBeenCalledWith(
      'Test recipe message with ingredients and instructions',
      {
        sender: 'Test User',
        isForwarded: false
      }
    );
  });

  it('should handle scraping errors gracefully', async () => {
    const { WhatsAppScraper } = await import('@/lib/extractors/whatsapp-scraper');
    
    const mockScraper = {
      scrapeWhatsAppRecipe: jest.fn().mockRejectedValue(new Error('Scraping failed')),
    };

    (WhatsAppScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: 'Test message' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to extract recipe from WhatsApp message');
  });

  it('should handle empty message content errors', async () => {
    const { WhatsAppScraper } = await import('@/lib/extractors/whatsapp-scraper');
    
    const mockScraper = {
      scrapeWhatsAppRecipe: jest.fn().mockRejectedValue(new Error('Empty WhatsApp message content')),
    };

    (WhatsAppScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: '   ' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Empty WhatsApp message content provided.');
  });

  it('should handle insufficient recipe data errors', async () => {
    const { WhatsAppScraper } = await import('@/lib/extractors/whatsapp-scraper');
    
    const mockScraper = {
      scrapeWhatsAppRecipe: jest.fn().mockRejectedValue(new Error('Insufficient recipe data found in WhatsApp message')),
    };

    (WhatsAppScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: 'Just a regular message with no recipe' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe('No recipe data found in this WhatsApp message.');
  });

  it('should handle timeout errors', async () => {
    const { WhatsAppScraper } = await import('@/lib/extractors/whatsapp-scraper');
    
    const mockScraper = {
      scrapeWhatsAppRecipe: jest.fn().mockRejectedValue(new Error('timeout')),
    };

    (WhatsAppScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: 'Test message' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(408);
    expect(data.error).toBe('WhatsApp message processing took too long. Please try again.');
  });

  it('should handle rate limit errors', async () => {
    const { WhatsAppScraper } = await import('@/lib/extractors/whatsapp-scraper');
    
    const mockScraper = {
      scrapeWhatsAppRecipe: jest.fn().mockRejectedValue(new Error('rate limit exceeded')),
    };

    (WhatsAppScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ messageContent: 'Test message' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded. Please wait a moment before trying again.');
  });
}); 