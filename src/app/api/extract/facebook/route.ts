import { NextRequest, NextResponse } from 'next/server';
import { FacebookScraper, FacebookScrapingOptions } from '@/lib/extractors';
import { RateLimiter, RateLimitPresets } from '@/lib/extractors';

export async function POST(req: NextRequest) {
  try {
    const { url, options = {} } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing Facebook URL' },
        { status: 400 }
      );
    }

    // Validate Facebook URL
    if (!isValidFacebookUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid Facebook URL. Please provide a valid Facebook post URL.' },
        { status: 400 }
      );
    }

    // Initialize rate limiter for Facebook
    const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
    await rateLimiter.waitForPermission();

    // Initialize Facebook scraper
    const scraper = new FacebookScraper();
    
    try {
      // Extract recipe from Facebook
      const scrapedRecipe = await scraper.scrapeFacebookRecipe(url, options as FacebookScrapingOptions);
      
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
    console.error('Facebook extraction error:', err);
    
    // Handle specific Facebook-related errors
    if (err.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Facebook post took too long to load. Please try again.' },
        { status: 408 }
      );
    }
    
    if (err.message.includes('not found') || err.message.includes('404')) {
      return NextResponse.json(
        { error: 'Facebook post not found or may be private.' },
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
      { error: `Failed to extract recipe from Facebook: ${err.message}` },
      { status: 500 }
    );
  }
}

function isValidFacebookUrl(url: string): boolean {
  const facebookPatterns = [
    /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+\/posts\/\d+\/?$/,
    /^https?:\/\/(www\.)?facebook\.com\/groups\/[a-zA-Z0-9._-]+\/posts\/\d+\/?$/,
    /^https?:\/\/(www\.)?facebook\.com\/photo\.php\?fbid=\d+/,
    /^https?:\/\/(www\.)?facebook\.com\/permalink\.php\?story_fbid=\d+/
  ];
  
  return facebookPatterns.some(pattern => pattern.test(url));
}

function transformScrapedRecipeToRecipe(scrapedRecipe: any) {
  return {
    title: scrapedRecipe.title || 'Facebook Recipe',
    ingredients: scrapedRecipe.ingredients || [],
    instructions: scrapedRecipe.instructions || [],
    cookingTime: scrapedRecipe.cookingTime,
    servings: scrapedRecipe.servings,
    images: scrapedRecipe.images || [],
    source: scrapedRecipe.source,
    extractedAt: scrapedRecipe.extractedAt,
    // Facebook-specific metadata
    metadata: {
      postId: scrapedRecipe.postId,
      author: scrapedRecipe.author,
      authorUsername: scrapedRecipe.authorUsername,
      groupName: scrapedRecipe.groupName,
      groupUrl: scrapedRecipe.groupUrl,
      likes: scrapedRecipe.likes,
      comments: scrapedRecipe.comments,
      shares: scrapedRecipe.shares,
      reactions: scrapedRecipe.reactions || {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      postUrl: scrapedRecipe.postUrl,
      imageUrl: scrapedRecipe.imageUrl,
      content: scrapedRecipe.content,
      timestamp: scrapedRecipe.timestamp
    }
  };
} 