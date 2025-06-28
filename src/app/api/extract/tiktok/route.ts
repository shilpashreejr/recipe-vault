import { NextRequest, NextResponse } from 'next/server';
import { TikTokScraper, TikTokScrapingOptions } from '@/lib/extractors';
import { RateLimiter, RateLimitPresets } from '@/lib/extractors';

export async function POST(req: NextRequest) {
  try {
    const { url, options = {} } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing TikTok URL' },
        { status: 400 }
      );
    }

    // Validate TikTok URL
    if (!isValidTikTokUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid TikTok URL. Please provide a valid TikTok video URL.' },
        { status: 400 }
      );
    }

    // Initialize rate limiter for TikTok
    const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
    await rateLimiter.waitForPermission();

    // Initialize TikTok scraper
    const scraper = new TikTokScraper();
    
    try {
      // Extract recipe from TikTok
      const scrapedRecipe = await scraper.scrapeTikTokRecipe(url, options as TikTokScrapingOptions);
      
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
    console.error('TikTok extraction error:', err);
    
    // Handle specific TikTok-related errors
    if (err.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'TikTok video took too long to load. Please try again.' },
        { status: 408 }
      );
    }
    
    if (err.message.includes('not found') || err.message.includes('404')) {
      return NextResponse.json(
        { error: 'TikTok video not found or may be private.' },
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
      { error: `Failed to extract recipe from TikTok: ${err.message}` },
      { status: 500 }
    );
  }
}

function isValidTikTokUrl(url: string): boolean {
  const tiktokPatterns = [
    /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+\/video\/\d+\/?$/,
    /^https?:\/\/(www\.)?vm\.tiktok\.com\/[a-zA-Z0-9]+\/?$/,
    /^https?:\/\/(www\.)?tiktok\.com\/t\/[a-zA-Z0-9]+\/?$/
  ];
  
  return tiktokPatterns.some(pattern => pattern.test(url));
}

function transformScrapedRecipeToRecipe(scrapedRecipe: any) {
  return {
    title: scrapedRecipe.title || 'TikTok Recipe',
    ingredients: scrapedRecipe.ingredients || [],
    instructions: scrapedRecipe.instructions || [],
    cookingTime: scrapedRecipe.cookingTime,
    servings: scrapedRecipe.servings,
    images: scrapedRecipe.images || [],
    source: scrapedRecipe.source,
    extractedAt: scrapedRecipe.extractedAt,
    // TikTok-specific metadata
    metadata: {
      videoId: scrapedRecipe.videoId,
      author: scrapedRecipe.author,
      authorUsername: scrapedRecipe.authorUsername,
      likes: scrapedRecipe.likes,
      shares: scrapedRecipe.shares,
      comments: scrapedRecipe.comments,
      views: scrapedRecipe.views,
      hashtags: scrapedRecipe.hashtags || [],
      music: scrapedRecipe.music,
      duration: scrapedRecipe.duration,
      videoUrl: scrapedRecipe.videoUrl,
      thumbnailUrl: scrapedRecipe.thumbnailUrl
    }
  };
} 