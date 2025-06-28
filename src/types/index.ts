// RecipeVault Type Definitions

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisineType?: string;
  dietaryTags: string[]; // ['vegetarian', 'gluten-free', etc.]
  macros?: NutritionalInfo;
  sourceUrl?: string;
  sourceType: 'blog' | 'instagram' | 'image' | 'manual';
  extractedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  images: RecipeImage[];
  categories: Category[];
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface RecipeImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractionJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceUrl?: string;
  imageFile?: File;
  result?: Recipe;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  dietaryTags?: string[];
  cookingTime?: {
    min?: number;
    max?: number;
  };
  difficulty?: string[];
  cuisineType?: string[];
  servings?: {
    min?: number;
    max?: number;
  };
} 