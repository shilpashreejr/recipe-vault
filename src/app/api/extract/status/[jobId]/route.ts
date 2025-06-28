import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from './job-status';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
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