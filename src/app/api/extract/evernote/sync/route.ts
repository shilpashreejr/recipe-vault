import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

export async function POST(req: NextRequest) {
  try {
    const { accessToken, notebookGuid, lastSyncTime } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing accessToken' },
        { status: 400 }
      );
    }

    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);

    // Get notes from the specified notebook or all notebooks
    const notes = notebookGuid 
      ? await evernote.getNotesFromNotebook(notebookGuid, 100)
      : await evernote.searchNotes('', undefined, 100);

    // Filter notes by last sync time if provided
    let filteredNotes = notes;
    if (lastSyncTime) {
      const syncTimestamp = new Date(lastSyncTime).getTime();
      filteredNotes = notes.filter(note => note.updated > syncTimestamp);
    }

    // Get full note content for each note
    const notesWithContent = await Promise.all(
      filteredNotes.map(async (note) => {
        try {
          const fullNote = await evernote.getNote(note.guid);
          return {
            guid: fullNote.guid,
            title: fullNote.title,
            content: fullNote.content,
            created: fullNote.created,
            updated: fullNote.updated,
            notebookGuid: fullNote.notebookGuid,
            tagGuids: fullNote.tagGuids,
            attributes: fullNote.attributes,
            resources: fullNote.resources,
          };
        } catch (error) {
          console.error(`Failed to get full content for note ${note.guid}:`, error);
          return note; // Return metadata-only note if full content fails
        }
      })
    );

    return NextResponse.json({
      notes: notesWithContent,
      totalCount: notesWithContent.length,
      syncTime: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 