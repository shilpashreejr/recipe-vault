import { NextRequest, NextResponse } from 'next/server';
import { PinterestScraper, PinterestScrapingOptions } from '@/lib/extractors';
import { RateLimiter, RateLimitPresets } from '@/lib/extractors';

export async function POST(req: NextRequest) {
  try {
    const { url, options = {} } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing Pinterest URL' },
        { status: 400 }
      );
    }

    // Validate Pinterest URL
    if (!isValidPinterestUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid Pinterest URL. Please provide a valid Pinterest pin URL.' },
        { status: 400 }
      );
    }

    // Initialize rate limiter for Pinterest
    const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
    await rateLimiter.waitForPermission();

    // Initialize Pinterest scraper
    const scraper = new PinterestScraper();
    
    try {
      // Extract recipe from Pinterest
      const scrapedRecipe = await scraper.scrapePinterestRecipe(url, options as PinterestScrapingOptions);
      
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
    console.error('Pinterest extraction error:', err);
    
    // Handle specific Pinterest-related errors
    if (err.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Pinterest pin took too long to load. Please try again.' },
        { status: 408 }
      );
    }
    
    if (err.message.includes('not found') || err.message.includes('404')) {
      return NextResponse.json(
        { error: 'Pinterest pin not found or may be private.' },
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
      { error: `Failed to extract recipe from Pinterest: ${err.message}` },
      { status: 500 }
    );
  }
}

function isValidPinterestUrl(url: string): boolean {
  const pinterestPatterns = [
    /^https?:\/\/(www\.)?pinterest\.com\/pin\/\d+\/?$/,
    /^https?:\/\/(www\.)?pinterest\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/
  ];
  
  return pinterestPatterns.some(pattern => pattern.test(url));
}

function transformScrapedRecipeToRecipe(scrapedRecipe: any) {
  return {
    title: scrapedRecipe.title || 'Pinterest Recipe',
    ingredients: scrapedRecipe.ingredients || [],
    instructions: scrapedRecipe.instructions || [],
    cookingTime: scrapedRecipe.cookingTime,
    servings: scrapedRecipe.servings,
    images: scrapedRecipe.images || [],
    source: scrapedRecipe.source,
    extractedAt: scrapedRecipe.extractedAt,
    // Pinterest-specific metadata
    metadata: {
      pinId: scrapedRecipe.pinId,
      author: scrapedRecipe.author,
      authorUsername: scrapedRecipe.authorUsername,
      boardName: scrapedRecipe.boardName,
      boardUrl: scrapedRecipe.boardUrl,
      saves: scrapedRecipe.saves,
      comments: scrapedRecipe.comments,
      relatedPins: scrapedRecipe.relatedPins || [],
      pinUrl: scrapedRecipe.pinUrl,
      imageUrl: scrapedRecipe.imageUrl,
      description: scrapedRecipe.description
    }
  };
} 