import { NextRequest, NextResponse } from 'next/server';
import { TwitterScraper } from '@/lib/extractors/twitter-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    // Validate input
    if (!url) {
      return NextResponse.json(
        { error: 'Missing Twitter/X URL' },
        { status: 400 }
      );
    }

    // Validate URL format
    const twitterPatterns = [
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/i,
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/i\/web\/status\/\d+/i,
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/status\/\d+/i
    ];

    const isValidUrl = twitterPatterns.some(pattern => pattern.test(url));
    if (!isValidUrl) {
      return NextResponse.json(
        { error: 'Invalid Twitter/X URL. Please provide a valid Twitter/X post URL.' },
        { status: 400 }
      );
    }

    // Initialize scraper and extract recipe
    const scraper = new TwitterScraper();
    const recipe = await scraper.scrapeTwitterRecipe(url);

    return NextResponse.json({
      success: true,
      recipe
    });

  } catch (error) {
    console.error('Twitter extraction error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle specific error types
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: 'Twitter/X post took too long to load. Please try again.' },
        { status: 408 }
      );
    }
    
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Twitter/X post not found or may be private.' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
    
    if (errorMessage.includes('Invalid Twitter/X URL')) {
      return NextResponse.json(
        { error: 'Invalid Twitter/X URL format.' },
        { status: 400 }
      );
    }
    
    if (errorMessage.includes('Insufficient recipe data')) {
      return NextResponse.json(
        { error: 'No recipe data found in this Twitter/X post.' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: `Failed to extract recipe from Twitter/X: ${errorMessage}` },
      { status: 500 }
    );
  }
} 