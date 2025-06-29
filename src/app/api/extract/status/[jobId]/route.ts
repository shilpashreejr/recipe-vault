import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from './job-status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { jobId } = context.params;
    const result = await getJobStatus(jobId);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to get job status: ${errorMessage}` },
      { status: 500 }
    );
  }
} 