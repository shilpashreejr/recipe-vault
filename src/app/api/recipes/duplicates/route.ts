import { NextRequest, NextResponse } from 'next/server';
import { RecipeService } from '../../../../lib/recipes/recipe-service';
import { DuplicateDetectionService } from '../../../../lib/recipes/duplicate-detection';
import { CreateRecipeSchema } from '../../../../lib/validation/recipe-schemas';
import { z } from 'zod';

// Schema for duplicate check request
const DuplicateCheckSchema = z.object({
  recipe: CreateRecipeSchema,
  userId: z.string().cuid().optional(),
  similarityThreshold: z.number().min(0).max(1).default(0.7),
  checkExactTitle: z.boolean().default(true),
  checkFuzzyTitle: z.boolean().default(true),
  checkIngredientSimilarity: z.boolean().default(true),
  checkSourceUrl: z.boolean().default(true),
  checkContentFingerprint: z.boolean().default(true),
});

// Schema for find all duplicates request
const FindAllDuplicatesSchema = z.object({
  userId: z.string().cuid().optional(),
  similarityThreshold: z.number().min(0).max(1).default(0.7),
  limit: z.number().int().min(1).max(100).default(50),
});

// Schema for merge duplicates request
const MergeDuplicatesSchema = z.object({
  recipeIds: z.array(z.string().cuid()).min(2),
  keepRecipeId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe, userId, similarityThreshold, ...options } = DuplicateCheckSchema.parse(body);

    const duplicates = await DuplicateDetectionService.detectDuplicates(recipe, userId, {
      similarityThreshold,
      ...options,
    });

    return NextResponse.json({
      success: true,
      data: duplicates,
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const similarityThreshold = parseFloat(searchParams.get('similarityThreshold') || '0.7');
    const limit = parseInt(searchParams.get('limit') || '50');

    const params = FindAllDuplicatesSchema.parse({
      userId,
      similarityThreshold,
      limit,
    });

    const duplicates = await RecipeService.findAllDuplicates(
      params.userId,
      {
        similarityThreshold: params.similarityThreshold,
        limit: params.limit,
      }
    );

    return NextResponse.json({
      success: true,
      data: duplicates,
    });
  } catch (error) {
    console.error('Error finding duplicates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to find duplicates' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeIds, keepRecipeId } = MergeDuplicatesSchema.parse(body);

    const result = await RecipeService.mergeDuplicateRecipes(recipeIds, keepRecipeId);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully merged ${result.deletedRecipes.length} duplicate recipes`,
    });
  } catch (error) {
    console.error('Error merging duplicates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to merge duplicates' },
      { status: 500 }
    );
  }
} 