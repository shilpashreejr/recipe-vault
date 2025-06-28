import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');
  const query = searchParams.get('query') || '';
  const notebookGuid = searchParams.get('notebookGuid') || undefined;

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
  }

  try {
    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);
    const notes = await evernote.searchNotes(query, notebookGuid, 50);
    return NextResponse.json({ notes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 