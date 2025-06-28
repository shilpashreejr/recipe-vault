import { NextRequest, NextResponse } from 'next/server';
import { InstagramScraper, InstagramScrapingOptions } from '@/lib/extractors';
import { RateLimiter, RateLimitPresets } from '@/lib/extractors';

export async function POST(req: NextRequest) {
  try {
    const { url, options = {} } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing Instagram URL' },
        { status: 400 }
      );
    }

    // Validate Instagram URL
    if (!isValidInstagramUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid Instagram URL. Please provide a valid Instagram post or reel URL.' },
        { status: 400 }
      );
    }

    // Initialize rate limiter for Instagram
    const rateLimiter = new RateLimiter(RateLimitPresets.instagram);
    await rateLimiter.waitForPermission();

    // Initialize Instagram scraper
    const scraper = new InstagramScraper();
    
    try {
      // Extract recipe from Instagram
      const scrapedRecipe = await scraper.scrapeInstagramRecipe(url, options as InstagramScrapingOptions);
      
      // Transform ScrapedRecipe to Recipe format
      const recipe = transformScrapedRecipeToRecipe(scrapedRecipe);
      
      return NextResponse.json({ 
        success: true,
        recipe,
        source: url,
        extractedAt: new Date()
      });
    } finally {
      // Always close the scraper to free resources
      await scraper.close();
    }
  } catch (err: any) {
    console.error('Instagram extraction error:', err);
    
    // Handle specific Instagram-related errors
    if (err.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Instagram post took too long to load. Please try again.' },
        { status: 408 }
      );
    }
    
    if (err.message.includes('not found') || err.message.includes('404')) {
      return NextResponse.json(
        { error: 'Instagram post not found or may be private.' },
        { status: 404 }
      );
    }
    
    if (err.message.includes('rate limit') || err.message.includes('too many requests')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to extract recipe from Instagram: ${err.message}` },
      { status: 500 }
    );
  }
}

function isValidInstagramUrl(url: string): boolean {
  const instagramPatterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?$/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?$/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[a-zA-Z0-9_-]+\/?$/
  ];
  
  return instagramPatterns.some(pattern => pattern.test(url));
}

function transformScrapedRecipeToRecipe(scrapedRecipe: any) {
  return {
    title: scrapedRecipe.title || 'Instagram Recipe',
    description: scrapedRecipe.caption || '',
    ingredients: scrapedRecipe.ingredients.map((ingredient: string) => ({
      name: ingredient,
      quantity: '',
      unit: '',
      notes: ''
    })),
    instructions: scrapedRecipe.instructions,
    prepTime: extractTimeInMinutes(scrapedRecipe.cookingTime),
    cookTime: undefined,
    servings: extractServingsNumber(scrapedRecipe.servings),
    difficulty: 'medium',
    cuisineType: undefined,
    dietaryTags: [],
    macros: undefined,
    sourceUrl: scrapedRecipe.source,
    sourceType: 'instagram' as const,
    extractedAt: scrapedRecipe.extractedAt,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: scrapedRecipe.images.map((url: string, index: number) => ({
      id: `img-${index}`,
      url,
      altText: `Recipe image ${index + 1}`,
      isPrimary: index === 0
    })),
    categories: []
  };
}

function extractTimeInMinutes(timeString?: string): number | undefined {
  if (!timeString) return undefined;
  
  const timeMatch = timeString.match(/(\d+)/);
  if (!timeMatch) return undefined;
  
  const value = parseInt(timeMatch[1]);
  
  if (timeString.toLowerCase().includes('hour')) {
    return value * 60;
  }
  
  return value;
}

function extractServingsNumber(servingsString?: string): number | undefined {
  if (!servingsString) return undefined;
  
  const servingsMatch = servingsString.match(/(\d+)/);
  if (!servingsMatch) return undefined;
  
  return parseInt(servingsMatch[1]);
} 