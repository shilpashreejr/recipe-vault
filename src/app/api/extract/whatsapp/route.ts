import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppScraper } from '@/lib/extractors/whatsapp-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageContent, metadata } = body;

    if (!messageContent) {
      return NextResponse.json(
        { error: 'Missing WhatsApp message content' },
        { status: 400 }
      );
    }

    if (typeof messageContent !== 'string' || messageContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp message content. Please provide a non-empty string.' },
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

    const scraper = new WhatsAppScraper();
    const recipe = await scraper.scrapeWhatsAppRecipe(messageContent, metadata);

    return NextResponse.json({
      success: true,
      recipe
    });

  } catch (error) {
    console.error('WhatsApp extraction error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle specific error types
    if (errorMessage.includes('Empty WhatsApp message content')) {
      return NextResponse.json(
        { error: 'Empty WhatsApp message content provided.' },
        { status: 400 }
      );
    }
    
    if (errorMessage.includes('Insufficient recipe data found in WhatsApp message')) {
      return NextResponse.json(
        { error: 'No recipe data found in this WhatsApp message.' },
        { status: 422 }
      );
    }
    
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: 'WhatsApp message processing took too long. Please try again.' },
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
      { error: `Failed to extract recipe from WhatsApp message: ${errorMessage}` },
      { status: 500 }
    );
  }
} 