import { PrismaClient } from '../../generated/prisma';
import { Recipe, Prisma } from '../../generated/prisma/client';
import { CreateRecipe, UpdateRecipe } from '../validation/recipe-schemas';
import { DuplicateDetectionService, DuplicateDetectionResult } from './duplicate-detection';

const prisma = new PrismaClient();

export class RecipeService {
  static async createRecipe(data: CreateRecipe, userId?: string): Promise<Recipe> {
    return prisma.recipe.create({
      data: {
        ...data,
        userId,
        ingredients: data.ingredients as Prisma.InputJsonValue,
        instructions: data.instructions as Prisma.InputJsonValue,
        nutritionalInfo: data.nutritionalInfo as Prisma.InputJsonValue,
        images: data.images
          ? {
              create: data.images.map(img => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary ?? false,
              })),
            }
          : undefined,
        categories: data.categoryIds
          ? {
              create: data.categoryIds.map(categoryId => ({ category: { connect: { id: categoryId } } })),
            }
          : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  /**
   * Create recipe with duplicate detection
   */
  static async createRecipeWithDuplicateCheck(
    data: CreateRecipe,
    userId?: string,
    duplicateOptions?: {
      checkDuplicates?: boolean;
      similarityThreshold?: number;
      allowDuplicates?: boolean;
    }
  ): Promise<{
    recipe: Recipe;
    duplicates: DuplicateDetectionResult;
    wasCreated: boolean;
  }> {
    const {
      checkDuplicates = true,
      similarityThreshold = 0.7,
      allowDuplicates = false,
    } = duplicateOptions || {};

    let duplicates: DuplicateDetectionResult = {
      duplicates: [],
      hasDuplicates: false,
      totalDuplicates: 0,
      highestSimilarityScore: 0,
    };

    // Check for duplicates if enabled
    if (checkDuplicates) {
      duplicates = await DuplicateDetectionService.detectDuplicates(data, userId, {
        similarityThreshold,
      });

      // If duplicates found and not allowed, throw error
      if (duplicates.hasDuplicates && !allowDuplicates) {
        throw new Error(`Duplicate recipe detected. Found ${duplicates.totalDuplicates} similar recipes.`);
      }
    }

    // Create the recipe
    const recipe = await this.createRecipe(data, userId);

    return {
      recipe,
      duplicates,
      wasCreated: true,
    };
  }

  static async getRecipeById(id: string): Promise<Recipe | null> {
    return prisma.recipe.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  static async updateRecipe(data: UpdateRecipe): Promise<Recipe | null> {
    const { id, images, categoryIds, ...updateData } = data;
    return prisma.recipe.update({
      where: { id },
      data: {
        ...updateData,
        ingredients: updateData.ingredients as Prisma.InputJsonValue,
        instructions: updateData.instructions as Prisma.InputJsonValue,
        nutritionalInfo: updateData.nutritionalInfo as Prisma.InputJsonValue,
        // images and categories should be updated via separate methods if needed
      },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  static async softDeleteRecipe(id: string): Promise<Recipe | null> {
    return prisma.recipe.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async listRecipes(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RecipeWhereInput;
    orderBy?: Prisma.RecipeOrderByWithRelationInput;
  } = {}): Promise<Recipe[]> {
    return prisma.recipe.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  /**
   * Check for duplicates of a specific recipe
   */
  static async checkRecipeDuplicates(
    recipeId: string,
    userId?: string,
    options?: {
      similarityThreshold?: number;
    }
  ): Promise<DuplicateDetectionResult> {
    const recipe = await this.getRecipeById(recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Convert Recipe to CreateRecipe format for duplicate detection
    const recipeData: CreateRecipe = {
      title: recipe.title,
      description: recipe.description || undefined,
      ingredients: recipe.ingredients as any,
      instructions: recipe.instructions as any,
      cookingTime: recipe.cookingTime || undefined,
      servings: recipe.servings || undefined,
      difficulty: recipe.difficulty as any,
      cuisine: recipe.cuisine || undefined,
      source: recipe.source || undefined,
      sourceType: recipe.sourceType as any,
      isVegetarian: recipe.isVegetarian,
      isGlutenFree: recipe.isGlutenFree,
      isVegan: recipe.isVegan,
      nutritionalInfo: recipe.nutritionalInfo as any,
    };

    return DuplicateDetectionService.detectDuplicates(recipeData, userId, options);
  }

  /**
   * Get duplicate statistics for a user
   */
  static async getDuplicateStats(userId?: string): Promise<{
    totalRecipes: number;
    potentialDuplicates: number;
    duplicatePercentage: number;
  }> {
    return DuplicateDetectionService.getDuplicateStats(userId);
  }

  /**
   * Find all duplicate recipes in the database
   */
  static async findAllDuplicates(
    userId?: string,
    options?: {
      similarityThreshold?: number;
      limit?: number;
    }
  ): Promise<{
    duplicateGroups: Array<{
      recipes: Recipe[];
      similarityScore: number;
      matchType: string;
    }>;
    totalGroups: number;
  }> {
    const { similarityThreshold = 0.7, limit = 50 } = options || {};
    const recipes = await this.listRecipes({
      where: userId ? { userId } : undefined,
      take: limit,
    });

    const duplicateGroups: Array<{
      recipes: Recipe[];
      similarityScore: number;
      matchType: string;
    }> = [];

    const processed = new Set<string>();

    for (const recipe of recipes) {
      if (processed.has(recipe.id)) continue;

      const duplicates = await DuplicateDetectionService.detectDuplicates(
        {
          title: recipe.title,
          description: recipe.description || undefined,
          ingredients: recipe.ingredients as any,
          instructions: recipe.instructions as any,
          cookingTime: recipe.cookingTime || undefined,
          servings: recipe.servings || undefined,
          difficulty: recipe.difficulty as any,
          cuisine: recipe.cuisine || undefined,
          source: recipe.source || undefined,
          sourceType: recipe.sourceType as any,
          isVegetarian: recipe.isVegetarian,
          isGlutenFree: recipe.isGlutenFree,
          isVegan: recipe.isVegan,
          nutritionalInfo: recipe.nutritionalInfo as any,
        },
        userId,
        { similarityThreshold }
      );

      if (duplicates.hasDuplicates) {
        const group = [recipe, ...duplicates.duplicates.map(d => d.recipe)];
        duplicateGroups.push({
          recipes: group,
          similarityScore: duplicates.highestSimilarityScore,
          matchType: duplicates.duplicates[0]?.matchType || 'unknown',
        });

        // Mark all recipes in this group as processed
        group.forEach(r => processed.add(r.id));
      }
    }

    return {
      duplicateGroups,
      totalGroups: duplicateGroups.length,
    };
  }

  /**
   * Merge duplicate recipes (keep the first one, delete others)
   */
  static async mergeDuplicateRecipes(
    recipeIds: string[],
    keepRecipeId: string
  ): Promise<{
    keptRecipe: Recipe;
    deletedRecipes: Recipe[];
  }> {
    if (!recipeIds.includes(keepRecipeId)) {
      throw new Error('Keep recipe ID must be in the list of recipe IDs');
    }

    const recipes = await Promise.all(
      recipeIds.map(id => this.getRecipeById(id))
    );

    const validRecipes = recipes.filter(r => r !== null) as Recipe[];
    const keepRecipe = validRecipes.find(r => r.id === keepRecipeId);

    if (!keepRecipe) {
      throw new Error('Keep recipe not found');
    }

    const recipesToDelete = validRecipes.filter(r => r.id !== keepRecipeId);

    // Soft delete the duplicate recipes
    const deletedRecipes = await Promise.all(
      recipesToDelete.map(recipe => this.softDeleteRecipe(recipe.id))
    );

    return {
      keptRecipe: keepRecipe,
      deletedRecipes: deletedRecipes.filter(r => r !== null) as Recipe[],
    };
  }
} 