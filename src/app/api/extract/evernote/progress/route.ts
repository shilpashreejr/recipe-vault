import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for progress tracking (in production, use Redis or database)
const importProgress = new Map<string, any>();

export interface ImportProgress {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalNotes: number;
  processedNotes: number;
  successfulImports: number;
  failedImports: number;
  currentNote?: string;
  errors: string[];
  startTime: string;
  endTime?: string;
  estimatedTimeRemaining?: number;
  summary?: any;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken, notebookGuid, maxNotes = 50 } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing accessToken' },
        { status: 400 }
      );
    }

    // Generate unique import ID
    const importId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize progress
    const progress: ImportProgress = {
      id: importId,
      status: 'pending',
      totalNotes: 0,
      processedNotes: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      startTime: new Date().toISOString(),
    };

    // Store progress
    importProgress.set(importId, progress);

    // Start import process in background
    processImportInBackground(importId, accessToken, notebookGuid, maxNotes);

    return NextResponse.json({ 
      importId,
      status: 'started',
      progressUrl: `/api/extract/evernote/progress/${importId}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const importId = searchParams.get('importId');

  if (!importId) {
    return NextResponse.json(
      { error: 'Missing importId' },
      { status: 400 }
    );
  }

  const progress = importProgress.get(importId);
  
  if (!progress) {
    return NextResponse.json(
      { error: 'Import not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ progress });
}

async function processImportInBackground(
  importId: string, 
  accessToken: string, 
  notebookGuid?: string, 
  maxNotes: number = 50
) {
  const progress = importProgress.get(importId);
  if (!progress) return;

  try {
    // Update status to running
    progress.status = 'running';
    progress.startTime = new Date().toISOString();

    // Simulate import process (in real implementation, this would be the actual import logic)
    const totalNotes = Math.min(maxNotes, 100); // Simulate total notes
    progress.totalNotes = totalNotes;

    for (let i = 0; i < totalNotes; i++) {
      // Update current note being processed
      progress.currentNote = `Note ${i + 1}`;
      progress.processedNotes = i + 1;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate success/failure
      if (Math.random() > 0.1) { // 90% success rate
        progress.successfulImports++;
      } else {
        progress.failedImports++;
        progress.errors.push(`Failed to process Note ${i + 1}`);
      }

      // Calculate estimated time remaining
      const elapsed = Date.now() - new Date(progress.startTime).getTime();
      const avgTimePerNote = elapsed / (i + 1);
      const remainingNotes = totalNotes - (i + 1);
      progress.estimatedTimeRemaining = Math.round(avgTimePerNote * remainingNotes);

      // Update progress
      importProgress.set(importId, progress);
    }

    // Mark as completed
    progress.status = 'completed';
    progress.endTime = new Date().toISOString();
    progress.currentNote = undefined;
    progress.estimatedTimeRemaining = 0;

    // Add summary
    progress.summary = {
      totalRecipes: progress.successfulImports,
      successRate: Math.round((progress.successfulImports / progress.totalNotes) * 100),
      totalErrors: progress.errors.length,
    };

    importProgress.set(importId, progress);
  } catch (error: any) {
    // Mark as failed
    progress.status = 'failed';
    progress.endTime = new Date().toISOString();
    progress.errors.push(`Import failed: ${error.message}`);
    importProgress.set(importId, progress);
  }
}

// Cleanup old progress entries (older than 24 hours)
setInterval(() => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (const [id, progress] of importProgress.entries()) {
    const startTime = new Date(progress.startTime).getTime();
    if (now - startTime > oneDay) {
      importProgress.delete(id);
    }
  }
}, 60 * 60 * 1000); // Run every hour
 