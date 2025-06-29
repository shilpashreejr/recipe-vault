import { NextRequest, NextResponse } from 'next/server';
import { RecipeService } from '../../../../../lib/recipes/recipe-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const stats = await RecipeService.getDuplicateStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting duplicate stats:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to get duplicate statistics' },
      { status: 500 }
    );
  }
} 