import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeFromUrl } from './extract-recipe';

export async function POST(req: NextRequest) {
  const { url, options = {} } = await req.json();
  const result = await extractRecipeFromUrl(url, options);
  return NextResponse.json(result.body, { status: result.status });
}

// TODO: Add background job support for long-running extractions 