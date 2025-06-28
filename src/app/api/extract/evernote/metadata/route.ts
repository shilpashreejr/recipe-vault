import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';
import { MetadataExtractor } from '@/lib/evernote/metadata-extractor';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

export async function POST(req: NextRequest) {
  try {
    const { accessToken, noteGuid, notebookName } = await req.json();

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
    
    // Extract metadata
    const metadata = MetadataExtractor.extractMetadata(note, notebookName);
    
    // Extract additional metadata from content
    const contentTags = MetadataExtractor.extractTagsFromContent(note.content);
    const sourceInfo = MetadataExtractor.extractSourceInfo(note.content);
    const locationInfo = MetadataExtractor.extractLocationInfo(note.content);
    const dateInfo = MetadataExtractor.extractDateInfo(note.content);
    const authorInfo = MetadataExtractor.extractAuthorInfo(note.content);

    // Combine all metadata
    const fullMetadata = {
      ...metadata,
      contentTags,
      ...sourceInfo,
      ...locationInfo,
      ...dateInfo,
      ...authorInfo,
    };

    return NextResponse.json({ metadata: fullMetadata });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 