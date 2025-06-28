import { z } from 'zod';

// Ingredient schema
export const IngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

// Instruction schema
export const InstructionSchema = z.object({
  step: z.number().int().positive('Step number must be a positive integer'),
  instruction: z.string().min(1, 'Instruction text is required'),
  time: z.number().positive('Time must be positive').optional(), // in minutes
  temperature: z.number().positive('Temperature must be positive').optional(), // in Celsius
  notes: z.string().optional(),
});

// Nutritional information schema
export const NutritionalInfoSchema = z.object({
  calories: z.number().min(0, 'Calories cannot be negative').optional(),
  protein: z.number().min(0, 'Protein cannot be negative').optional(),
  carbohydrates: z.number().min(0, 'Carbohydrates cannot be negative').optional(),
  fat: z.number().min(0, 'Fat cannot be negative').optional(),
  fiber: z.number().min(0, 'Fiber cannot be negative').optional(),
  sugar: z.number().min(0, 'Sugar cannot be negative').optional(),
  sodium: z.number().min(0, 'Sodium cannot be negative').optional(),
  cholesterol: z.number().min(0, 'Cholesterol cannot be negative').optional(),
  saturatedFat: z.number().min(0, 'Saturated fat cannot be negative').optional(),
  transFat: z.number().min(0, 'Trans fat cannot be negative').optional(),
  vitaminA: z.number().min(0, 'Vitamin A cannot be negative').optional(),
  vitaminC: z.number().min(0, 'Vitamin C cannot be negative').optional(),
  calcium: z.number().min(0, 'Calcium cannot be negative').optional(),
  iron: z.number().min(0, 'Iron cannot be negative').optional(),
});

// Recipe image schema
export const RecipeImageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  alt: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// Recipe creation schema
export const CreateRecipeSchema = z.object({
  title: z.string().min(1, 'Recipe title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  ingredients: z.array(IngredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(InstructionSchema).min(1, 'At least one instruction is required'),
  cookingTime: z.number().int().positive('Cooking time must be positive').optional(),
  servings: z.number().int().positive('Servings must be positive').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  cuisine: z.string().max(100, 'Cuisine name too long').optional(),
  source: z.string().url('Must be a valid URL').optional(),
  sourceType: z.enum(['instagram', 'blog', 'manual', 'evernote', 'apple-notes', 'email', 'facebook', 'twitter', 'youtube', 'tiktok', 'pinterest', 'whatsapp']).optional(),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  nutritionalInfo: NutritionalInfoSchema.optional(),
  images: z.array(RecipeImageSchema).optional(),
  categoryIds: z.array(z.string()).optional(),
});

// Recipe update schema (all fields optional)
export const UpdateRecipeSchema = CreateRecipeSchema.partial().extend({
  id: z.string().cuid('Invalid recipe ID'),
});

// Recipe response schema
export const RecipeResponseSchema = CreateRecipeSchema.extend({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  userId: z.string().cuid().nullable(),
  images: z.array(RecipeImageSchema.extend({
    id: z.string().cuid(),
    recipeId: z.string().cuid(),
    createdAt: z.date(),
  })),
  categories: z.array(z.object({
    id: z.string().cuid(),
    name: z.string(),
    description: z.string().nullable(),
  })),
});

// Recipe list response schema
export const RecipeListResponseSchema = z.object({
  recipes: z.array(RecipeResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

// Recipe search/filter schema
export const RecipeFilterSchema = z.object({
  search: z.string().optional(),
  cuisine: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  isVegetarian: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  maxCookingTime: z.number().int().positive().optional(),
  categoryIds: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['title', 'createdAt', 'cookingTime', 'servings']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;
export type NutritionalInfo = z.infer<typeof NutritionalInfoSchema>;
export type RecipeImage = z.infer<typeof RecipeImageSchema>;
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipe = z.infer<typeof UpdateRecipeSchema>;
export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
export type RecipeListResponse = z.infer<typeof RecipeListResponseSchema>;
export type RecipeFilter = z.infer<typeof RecipeFilterSchema>; 