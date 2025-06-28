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
  const stack = searchParams.get('stack');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing accessToken' },
      { status: 400 }
    );
  }

  try {
    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);

    // Get all notebooks
    const notebooks = await evernote.getNotebooks();
    
    // Filter by stack if provided
    let filteredNotebooks = notebooks;
    if (stack) {
      filteredNotebooks = notebooks.filter(notebook => notebook.stack === stack);
    }

    // Group notebooks by stack
    const notebooksByStack = filteredNotebooks.reduce((acc, notebook) => {
      const stackName = notebook.stack || 'No Stack';
      if (!acc[stackName]) {
        acc[stackName] = [];
      }
      acc[stackName].push(notebook);
      return acc;
    }, {} as Record<string, typeof notebooks>);

    // Get available stacks
    const stacks = [...new Set(notebooks.map(notebook => notebook.stack).filter(Boolean))];

    return NextResponse.json({
      notebooks: filteredNotebooks,
      notebooksByStack,
      stacks,
      totalCount: filteredNotebooks.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 