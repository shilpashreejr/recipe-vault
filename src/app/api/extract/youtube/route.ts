import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper } from '@/lib/extractors/youtube-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    if (!url) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }
    const youtubePatterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]{11}/i,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]{11}/i
    ];
    const isValidUrl = youtubePatterns.some(pattern => pattern.test(url));
    if (!isValidUrl) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.' }, { status: 400 });
    }
    const scraper = new YouTubeScraper();
    const recipe = await scraper.scrapeYouTubeRecipe(url);
    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (errorMessage.includes('timeout')) {
      return NextResponse.json({ error: 'YouTube video took too long to load. Please try again.' }, { status: 408 });
    }
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: 'YouTube video not found or may be private.' }, { status: 404 });
    }
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment before trying again.' }, { status: 429 });
    }
    if (errorMessage.includes('Invalid YouTube URL')) {
      return NextResponse.json({ error: 'Invalid YouTube URL format.' }, { status: 400 });
    }
    if (errorMessage.includes('Insufficient recipe data')) {
      return NextResponse.json({ error: 'No recipe data found in this YouTube video description.' }, { status: 422 });
    }
    return NextResponse.json({ error: `Failed to extract recipe from YouTube: ${errorMessage}` }, { status: 500 });
  }
} 