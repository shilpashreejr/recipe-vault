import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';
import { RecipeExtractor } from '@/lib/evernote/recipe-extractor';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

export async function POST(req: NextRequest) {
  try {
    const { accessToken, noteGuid } = await req.json();

    if (!accessToken || !noteGuid) {
      return NextResponse.json(
        { error: 'Missing accessToken or noteGuid' },
        { status: 400 }
      );
    }

    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);

    // Get the full note content
    const note = await evernote.getNote(noteGuid);
    
    // Extract recipe information
    const recipe = RecipeExtractor.extractFromEvernoteNote(note);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'No recipe information found in this note' },
        { status: 404 }
      );
    }

    return NextResponse.json({ recipe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 