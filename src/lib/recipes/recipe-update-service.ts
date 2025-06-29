import { PrismaClient, Recipe, Prisma } from '../../generated/prisma';
import { UpdateRecipe } from '../validation/recipe-schemas';
import { ImageService } from './image-service';

const prisma = new PrismaClient();

export interface RecipeUpdateOptions {
  validateBeforeUpdate?: boolean;
  updateImages?: boolean;
  updateCategories?: boolean;
  preserveExistingData?: boolean;
}

export interface RecipeUpdateResult {
  success: boolean;
  recipe?: Recipe;
  errors?: string[];
  warnings?: string[];
}

export class RecipeUpdateService {
  static async updateRecipe(
    recipeId: string,
    updateData: Partial<UpdateRecipe>,
    options: RecipeUpdateOptions = {}
  ): Promise<RecipeUpdateResult> {
    const {
      validateBeforeUpdate = true,
      updateImages = true,
      updateCategories = true,
      preserveExistingData = true,
    } = options;

    try {
      // Check if recipe exists
      const existingRecipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      if (!existingRecipe) {
        return {
          success: false,
          errors: ['Recipe not found'],
        };
      }

      // Validate update data if requested
      if (validateBeforeUpdate) {
        const validationResult = await this.validateUpdateData(updateData, existingRecipe);
        if (!validationResult.isValid) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }

      // Prepare update data
      const preparedData = await this.prepareUpdateData(updateData, existingRecipe, preserveExistingData);

      // Update recipe
      const updatedRecipe = await prisma.recipe.update({
        where: { id: recipeId },
        data: preparedData,
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      // Handle image updates
      if (updateImages && updateData.images) {
        await this.updateRecipeImages(recipeId, updateData.images);
      }

      // Handle category updates
      if (updateCategories && updateData.categoryIds) {
        await this.updateRecipeCategories(recipeId, updateData.categoryIds);
      }

      // Get final updated recipe
      const finalRecipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          images: true,
          categories: { include: { category: true } },
        },
      });

      return {
        success: true,
        recipe: finalRecipe!,
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      };
    }
  }

  static async updateRecipePartial(
    recipeId: string,
    field: keyof UpdateRecipe,
    value: any
  ): Promise<RecipeUpdateResult> {
    const updateData = { [field]: value } as Partial<UpdateRecipe>;
    return this.updateRecipe(recipeId, updateData, { validateBeforeUpdate: false });
  }

  static async updateRecipeImages(recipeId: string, images: any[]): Promise<void> {
    // Remove existing images
    await prisma.recipeImage.deleteMany({
      where: { recipeId },
    });

    // Add new images
    for (const image of images) {
      await prisma.recipeImage.create({
        data: {
          url: image.url,
          alt: image.alt,
          isPrimary: image.isPrimary || false,
          recipeId,
        },
      });
    }
  }

  static async updateRecipeCategories(recipeId: string, categoryIds: string[]): Promise<void> {
    // Remove existing category associations
    await prisma.recipeCategory.deleteMany({
      where: { recipeId },
    });

    // Add new category associations
    for (const categoryId of categoryIds) {
      await prisma.recipeCategory.create({
        data: {
          recipeId,
          categoryId,
        },
      });
    }
  }

  static async addRecipeImage(recipeId: string, imageData: any): Promise<RecipeUpdateResult> {
    try {
      const image = await prisma.recipeImage.create({
        data: {
          url: imageData.url,
          alt: imageData.alt,
          isPrimary: imageData.isPrimary || false,
          recipeId,
        },
      });

      const recipe = await this.getRecipeWithRelations(recipeId);
      return {
        success: true,
        recipe: recipe || undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to add image'],
      };
    }
  }

  static async removeRecipeImage(recipeId: string, imageId: string): Promise<RecipeUpdateResult> {
    try {
      await prisma.recipeImage.delete({
        where: { id: imageId, recipeId },
      });

      const recipe = await this.getRecipeWithRelations(recipeId);
      return {
        success: true,
        recipe: recipe || undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to remove image'],
      };
    }
  }

  static async addRecipeCategory(recipeId: string, categoryId: string): Promise<RecipeUpdateResult> {
    try {
      await prisma.recipeCategory.create({
        data: {
          recipeId,
          categoryId,
        },
      });

      const recipe = await this.getRecipeWithRelations(recipeId);
      return {
        success: true,
        recipe: recipe || undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to add category'],
      };
    }
  }

  static async removeRecipeCategory(recipeId: string, categoryId: string): Promise<RecipeUpdateResult> {
    try {
      await prisma.recipeCategory.delete({
        where: {
          recipeId_categoryId: {
            recipeId,
            categoryId,
          },
        },
      });

      const recipe = await this.getRecipeWithRelations(recipeId);
      return {
        success: true,
        recipe: recipe || undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to remove category'],
      };
    }
  }

  // Note: updateRecipeStatus method removed as isPublished field doesn't exist in schema
  // static async updateRecipeStatus(recipeId: string, isPublished: boolean): Promise<RecipeUpdateResult> {
  //   // Implementation removed due to schema mismatch
  // }

  private static async validateUpdateData(
    updateData: Partial<UpdateRecipe>,
    existingRecipe: any
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate title length
    if (updateData.title && updateData.title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (updateData.title && updateData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Validate cooking time
    if (updateData.cookingTime !== undefined && updateData.cookingTime < 0) {
      errors.push('Cooking time must be positive');
    }

    // Validate servings
    if (updateData.servings !== undefined && updateData.servings < 1) {
      errors.push('Servings must be at least 1');
    }

    // Validate difficulty
    if (updateData.difficulty && !['easy', 'medium', 'hard'].includes(updateData.difficulty)) {
      errors.push('Difficulty must be one of: easy, medium, hard');
    }

    // Validate ingredients
    if (updateData.ingredients && (!Array.isArray(updateData.ingredients) || updateData.ingredients.length === 0)) {
      errors.push('Recipe must have at least one ingredient');
    }

    // Validate instructions
    if (updateData.instructions && (!Array.isArray(updateData.instructions) || updateData.instructions.length === 0)) {
      errors.push('Recipe must have at least one instruction');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static async prepareUpdateData(
    updateData: Partial<UpdateRecipe>,
    existingRecipe: any,
    preserveExistingData: boolean
  ): Promise<any> {
    const preparedData: any = {};

    // Handle scalar fields
    const scalarFields = [
      'title', 'description', 'cookingTime', 'servings', 'difficulty',
      'cuisine', 'source', 'sourceType', 'isVegetarian', 'isGlutenFree', 'isVegan'
    ];

    for (const field of scalarFields) {
      if (updateData[field as keyof UpdateRecipe] !== undefined) {
        preparedData[field] = updateData[field as keyof UpdateRecipe];
      } else if (preserveExistingData) {
        preparedData[field] = existingRecipe[field];
      }
    }

    // Handle JSON fields
    if (updateData.ingredients) {
      preparedData.ingredients = updateData.ingredients as Prisma.InputJsonValue;
    } else if (preserveExistingData) {
      preparedData.ingredients = existingRecipe.ingredients;
    }

    if (updateData.instructions) {
      preparedData.instructions = updateData.instructions as Prisma.InputJsonValue;
    } else if (preserveExistingData) {
      preparedData.instructions = existingRecipe.instructions;
    }

    if (updateData.nutritionalInfo) {
      preparedData.nutritionalInfo = updateData.nutritionalInfo as Prisma.InputJsonValue;
    } else if (preserveExistingData) {
      preparedData.nutritionalInfo = existingRecipe.nutritionalInfo;
    }

    return preparedData;
  }

  private static async getRecipeWithRelations(recipeId: string): Promise<Recipe | null> {
    return prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }
} 