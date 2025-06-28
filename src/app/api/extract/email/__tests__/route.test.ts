import { NextRequest } from 'next/server';
import { POST } from '../route';

jest.mock('@/lib/extractors/email-scraper', () => ({
  EmailScraper: jest.fn(),
}));

describe('Email Extraction API', () => {
  it('should return 400 for missing email content', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing email content');
  });

  it('should return 400 for empty email content', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: '' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email content. Please provide a non-empty string.');
  });

  it('should return 400 for invalid email content type', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: 123 })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email content. Please provide a non-empty string.');
  });

  it('should return 400 for invalid metadata format', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ 
        emailContent: 'Test recipe email',
        metadata: 'invalid-metadata'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid metadata format. Must be an object.');
  });

  it('should accept valid email content', async () => {
    const { EmailScraper } = await import('@/lib/extractors/email-scraper');
    
    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['2 cups flour', '1 cup sugar'],
      instructions: ['Mix ingredients', 'Bake at 350°F'],
      source: 'email-forward',
      sourceType: 'email' as const,
      extractedAt: '2024-01-01T00:00:00.000Z',
      metadata: {
        emailId: 'email_123456789',
        sender: 'test@example.com',
        subject: 'Amazing Recipe',
        timestamp: '2024-01-01T00:00:00.000Z',
        isForwarded: false,
        recipients: ['recipient@example.com']
      }
    };

    const mockScraper = {
      scrapeEmailRecipe: jest.fn().mockResolvedValue(mockRecipe),
    };

    (EmailScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ 
        emailContent: 'Test recipe email with ingredients and instructions',
        metadata: {
          sender: 'test@example.com',
          subject: 'Amazing Recipe',
          isForwarded: false
        }
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recipe).toEqual(mockRecipe);
    expect(data.recipe.sourceType).toBe('email');
    expect(mockScraper.scrapeEmailRecipe).toHaveBeenCalledWith(
      'Test recipe email with ingredients and instructions',
      {
        sender: 'test@example.com',
        subject: 'Amazing Recipe',
        isForwarded: false
      }
    );
  });

  it('should handle scraping errors gracefully', async () => {
    const { EmailScraper } = await import('@/lib/extractors/email-scraper');
    
    const mockScraper = {
      scrapeEmailRecipe: jest.fn().mockRejectedValue(new Error('Scraping failed')),
    };

    (EmailScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: 'Test email' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to extract recipe from email');
  });

  it('should handle empty email content errors', async () => {
    const { EmailScraper } = await import('@/lib/extractors/email-scraper');
    
    const mockScraper = {
      scrapeEmailRecipe: jest.fn().mockRejectedValue(new Error('Empty email content')),
    };

    (EmailScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: '   ' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Empty email content provided.');
  });

  it('should handle insufficient recipe data errors', async () => {
    const { EmailScraper } = await import('@/lib/extractors/email-scraper');
    
    const mockScraper = {
      scrapeEmailRecipe: jest.fn().mockRejectedValue(new Error('Insufficient recipe data found in email')),
    };

    (EmailScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: 'Just a regular email with no recipe' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe('No recipe data found in this email.');
  });

  it('should handle timeout errors', async () => {
    const { EmailScraper } = await import('@/lib/extractors/email-scraper');
    
    const mockScraper = {
      scrapeEmailRecipe: jest.fn().mockRejectedValue(new Error('timeout')),
    };

    (EmailScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: 'Test email' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(408);
    expect(data.error).toBe('Email processing took too long. Please try again.');
  });

  it('should handle rate limit errors', async () => {
    const { EmailScraper } = await import('@/lib/extractors/email-scraper');
    
    const mockScraper = {
      scrapeEmailRecipe: jest.fn().mockRejectedValue(new Error('rate limit exceeded')),
    };

    (EmailScraper as jest.MockedClass<any>).mockImplementation(() => mockScraper);

    const req = new NextRequest('http://localhost:3000/api/extract/email', {
      method: 'POST',
      body: JSON.stringify({ emailContent: 'Test email' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded. Please wait a moment before trying again.');
  });
}); 