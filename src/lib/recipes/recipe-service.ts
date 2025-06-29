import { PrismaClient } from '../../generated/prisma';
import { Recipe, Prisma } from '../../generated/prisma/client';
import { CreateRecipe, UpdateRecipe } from '../validation/recipe-schemas';

const prisma = new PrismaClient();

export class RecipeService {
  static async createRecipe(data: CreateRecipe): Promise<Recipe> {
    return prisma.recipe.create({
      data: {
        ...data,
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
} 