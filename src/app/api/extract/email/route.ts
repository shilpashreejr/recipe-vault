import { NextRequest, NextResponse } from 'next/server';
import { EmailScraper } from '@/lib/extractors/email-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailContent, metadata } = body;

    if (!emailContent) {
      return NextResponse.json(
        { error: 'Missing email content' },
        { status: 400 }
      );
    }

    if (typeof emailContent !== 'string' || emailContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid email content. Please provide a non-empty string.' },
        { status: 400 }
      );
    }

    // Validate metadata if provided
    if (metadata && typeof metadata !== 'object') {
      return NextResponse.json(
        { error: 'Invalid metadata format. Must be an object.' },
        { status: 400 }
      );
    }

    const scraper = new EmailScraper();
    const recipe = await scraper.scrapeEmailRecipe(emailContent, metadata);

    return NextResponse.json({
      success: true,
      recipe
    });

  } catch (error) {
    console.error('Email extraction error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle specific error types
    if (errorMessage.includes('Empty email content')) {
      return NextResponse.json(
        { error: 'Empty email content provided.' },
        { status: 400 }
      );
    }
    
    if (errorMessage.includes('Insufficient recipe data found in email')) {
      return NextResponse.json(
        { error: 'No recipe data found in this email.' },
        { status: 422 }
      );
    }
    
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: 'Email processing took too long. Please try again.' },
        { status: 408 }
      );
    }
    
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Failed to extract recipe from email: ${errorMessage}` },
      { status: 500 }
    );
  }
} 