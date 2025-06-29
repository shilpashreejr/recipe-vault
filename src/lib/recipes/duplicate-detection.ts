import { PrismaClient } from '../../generated/prisma';
import { Recipe, Prisma } from '../../generated/prisma/client';
import { CreateRecipe, Ingredient, Instruction } from '../validation/recipe-schemas';
import crypto from 'crypto';

const defaultPrisma = new PrismaClient();

export interface DuplicateRecipe {
  recipe: Recipe;
  similarityScore: number;
  matchType: 'exact_title' | 'fuzzy_title' | 'ingredient_similarity' | 'source_url' | 'content_fingerprint';
  confidence: 'high' | 'medium' | 'low';
}

export interface DuplicateDetectionResult {
  duplicates: DuplicateRecipe[];
  hasDuplicates: boolean;
  totalDuplicates: number;
  highestSimilarityScore: number;
}

export class DuplicateDetectionService {
  // Configuration for similarity thresholds
  private static readonly SIMILARITY_THRESHOLDS = {
    EXACT_TITLE: 1.0,
    FUZZY_TITLE: 0.8,
    INGREDIENT_SIMILARITY: 0.7,
    SOURCE_URL: 1.0,
    CONTENT_FINGERPRINT: 1.0,
  };

  private static readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
  };

  /**
   * Main method to detect duplicates for a new recipe
   */
  static async detectDuplicates(
    newRecipe: CreateRecipe,
    userId?: string,
    options: {
      checkExactTitle?: boolean;
      checkFuzzyTitle?: boolean;
      checkIngredientSimilarity?: boolean;
      checkSourceUrl?: boolean;
      checkContentFingerprint?: boolean;
      similarityThreshold?: number;
    } = {},
    prisma: PrismaClient = defaultPrisma
  ): Promise<DuplicateDetectionResult> {
    const {
      checkExactTitle = true,
      checkFuzzyTitle = true,
      checkIngredientSimilarity = true,
      checkSourceUrl = true,
      checkContentFingerprint = true,
      similarityThreshold = 0.5,
    } = options;

    const duplicates: DuplicateRecipe[] = [];
    const existingRecipes = await this.getExistingRecipes(userId, prisma);

    // Check exact title matches
    if (checkExactTitle) {
      const exactMatches = await this.checkExactTitleMatch(newRecipe.title, existingRecipes);
      duplicates.push(...exactMatches);
    }

    // Check fuzzy title matches
    if (checkFuzzyTitle) {
      const fuzzyMatches = await this.checkFuzzyTitleMatch(newRecipe.title, existingRecipes);
      duplicates.push(...fuzzyMatches);
    }

    // Check ingredient similarity
    if (checkIngredientSimilarity) {
      const ingredientMatches = await this.checkIngredientSimilarity(newRecipe.ingredients, existingRecipes);
      duplicates.push(...ingredientMatches);
    }

    // Check source URL matches
    if (checkSourceUrl && newRecipe.source) {
      const sourceMatches = await this.checkSourceUrlMatch(newRecipe.source, existingRecipes);
      duplicates.push(...sourceMatches);
    }

    // Check content fingerprint
    if (checkContentFingerprint) {
      const fingerprintMatches = await this.checkContentFingerprint(newRecipe, existingRecipes);
      duplicates.push(...fingerprintMatches);
    }

    // Remove duplicates and filter by similarity threshold
    const uniqueDuplicates = this.removeDuplicateEntries(duplicates);
    const filteredDuplicates = uniqueDuplicates.filter(d => d.similarityScore >= similarityThreshold);

    // Sort by similarity score (highest first)
    filteredDuplicates.sort((a, b) => b.similarityScore - a.similarityScore);

    return {
      duplicates: filteredDuplicates,
      hasDuplicates: filteredDuplicates.length > 0,
      totalDuplicates: filteredDuplicates.length,
      highestSimilarityScore: filteredDuplicates.length > 0 ? filteredDuplicates[0].similarityScore : 0,
    };
  }

  /**
   * Get existing recipes for comparison
   */
  private static async getExistingRecipes(userId?: string, prisma: PrismaClient = defaultPrisma): Promise<Recipe[]> {
    const where: Prisma.RecipeWhereInput = {
      deletedAt: null,
    };

    if (userId) {
      where.userId = userId;
    }

    return prisma.recipe.findMany({
      where,
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });
  }

  /**
   * Check for exact title matches
   */
  private static async checkExactTitleMatch(
    title: string,
    existingRecipes: Recipe[]
  ): Promise<DuplicateRecipe[]> {
    const normalizedTitle = this.normalizeText(title);
    const matches: DuplicateRecipe[] = [];

    for (const recipe of existingRecipes) {
      const normalizedExistingTitle = this.normalizeText(recipe.title);
      if (normalizedTitle === normalizedExistingTitle) {
        matches.push({
          recipe,
          similarityScore: this.SIMILARITY_THRESHOLDS.EXACT_TITLE,
          matchType: 'exact_title',
          confidence: 'high',
        });
      }
    }

    return matches;
  }

  /**
   * Check for fuzzy title matches using string similarity
   */
  private static async checkFuzzyTitleMatch(
    title: string,
    existingRecipes: Recipe[]
  ): Promise<DuplicateRecipe[]> {
    const normalizedTitle = this.normalizeText(title);
    const matches: DuplicateRecipe[] = [];

    for (const recipe of existingRecipes) {
      const normalizedExistingTitle = this.normalizeText(recipe.title);
      const similarity = this.calculateStringSimilarity(normalizedTitle, normalizedExistingTitle);

      if (similarity >= this.SIMILARITY_THRESHOLDS.FUZZY_TITLE) {
        matches.push({
          recipe,
          similarityScore: similarity,
          matchType: 'fuzzy_title',
          confidence: this.getConfidenceLevel(similarity),
        });
      }
    }

    return matches;
  }

  /**
   * Check for ingredient similarity
   */
  private static async checkIngredientSimilarity(
    ingredients: Ingredient[],
    existingRecipes: Recipe[]
  ): Promise<DuplicateRecipe[]> {
    const matches: DuplicateRecipe[] = [];
    const normalizedIngredients = this.normalizeIngredients(ingredients);

    for (const recipe of existingRecipes) {
      const existingIngredients = recipe.ingredients as Ingredient[];
      const normalizedExistingIngredients = this.normalizeIngredients(existingIngredients);
      const similarity = this.calculateIngredientSimilarity(normalizedIngredients, normalizedExistingIngredients);

      if (similarity >= this.SIMILARITY_THRESHOLDS.INGREDIENT_SIMILARITY) {
        matches.push({
          recipe,
          similarityScore: similarity,
          matchType: 'ingredient_similarity',
          confidence: this.getConfidenceLevel(similarity),
        });
      }
    }

    return matches;
  }

  /**
   * Check for source URL matches
   */
  private static async checkSourceUrlMatch(
    source: string,
    existingRecipes: Recipe[]
  ): Promise<DuplicateRecipe[]> {
    const normalizedSource = this.normalizeUrl(source);
    const matches: DuplicateRecipe[] = [];

    for (const recipe of existingRecipes) {
      if (recipe.source) {
        const normalizedExistingSource = this.normalizeUrl(recipe.source);
        if (normalizedSource === normalizedExistingSource) {
          matches.push({
            recipe,
            similarityScore: this.SIMILARITY_THRESHOLDS.SOURCE_URL,
            matchType: 'source_url',
            confidence: 'high',
          });
        }
      }
    }

    return matches;
  }

  /**
   * Check for content fingerprint matches
   */
  private static async checkContentFingerprint(
    newRecipe: CreateRecipe,
    existingRecipes: Recipe[]
  ): Promise<DuplicateRecipe[]> {
    const newFingerprint = this.createContentFingerprint(newRecipe);
    const matches: DuplicateRecipe[] = [];

    for (const recipe of existingRecipes) {
      const existingFingerprint = this.createContentFingerprintFromRecipe(recipe);
      if (newFingerprint === existingFingerprint) {
        matches.push({
          recipe,
          similarityScore: this.SIMILARITY_THRESHOLDS.CONTENT_FINGERPRINT,
          matchType: 'content_fingerprint',
          confidence: 'high',
        });
      }
    }

    return matches;
  }

  /**
   * Normalize text for comparison
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Normalize URL for comparison
   */
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.toLowerCase();
    } catch {
      return url.toLowerCase().trim();
    }
  }

  /**
   * Normalize ingredients for comparison
   */
  private static normalizeIngredients(ingredients: Ingredient[]): string[] {
    return ingredients.map(ingredient => 
      this.normalizeText(ingredient.name)
    ).sort();
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate ingredient similarity using Jaccard similarity
   */
  private static calculateIngredientSimilarity(ingredients1: string[], ingredients2: string[]): number {
    const set1 = new Set(ingredients1);
    const set2 = new Set(ingredients2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Create content fingerprint for a recipe
   */
  private static createContentFingerprint(recipe: CreateRecipe): string {
    const content = {
      title: this.normalizeText(recipe.title),
      ingredients: this.normalizeIngredients(recipe.ingredients).join('|'),
      instructions: recipe.instructions.map((inst: Instruction) => 
        this.normalizeText(inst.instruction)
      ).join('|'),
      servings: recipe.servings,
      cookingTime: recipe.cookingTime,
    };

    const contentString = JSON.stringify(content);
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }

  /**
   * Create content fingerprint from existing recipe
   */
  private static createContentFingerprintFromRecipe(recipe: Recipe): string {
    const ingredients = recipe.ingredients as Ingredient[];
    const instructions = recipe.instructions as Instruction[];

    const content = {
      title: this.normalizeText(recipe.title),
      ingredients: this.normalizeIngredients(ingredients).join('|'),
      instructions: instructions.map(inst => 
        this.normalizeText(inst.instruction)
      ).join('|'),
      servings: recipe.servings,
      cookingTime: recipe.cookingTime,
    };

    const contentString = JSON.stringify(content);
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }

  /**
   * Remove duplicate entries based on recipe ID
   */
  private static removeDuplicateEntries(duplicates: DuplicateRecipe[]): DuplicateRecipe[] {
    const seen = new Set<string>();
    return duplicates.filter(duplicate => {
      if (seen.has(duplicate.recipe.id)) {
        return false;
      }
      seen.add(duplicate.recipe.id);
      return true;
    });
  }

  /**
   * Get confidence level based on similarity score
   */
  private static getConfidenceLevel(similarityScore: number): 'high' | 'medium' | 'low' {
    if (similarityScore >= this.CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (similarityScore >= this.CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  /**
   * Get duplicate detection statistics
   */
  static async getDuplicateStats(userId?: string): Promise<{
    totalRecipes: number;
    potentialDuplicates: number;
    duplicatePercentage: number;
  }> {
    const totalRecipes = await defaultPrisma.recipe.count({
      where: { deletedAt: null, ...(userId && { userId }) },
    });

    // This is a simplified approach - in a real implementation,
    // you might want to store duplicate detection results
    const potentialDuplicates = await this.countPotentialDuplicates(userId);

    return {
      totalRecipes,
      potentialDuplicates,
      duplicatePercentage: totalRecipes > 0 ? (potentialDuplicates / totalRecipes) * 100 : 0,
    };
  }

  /**
   * Count potential duplicates (simplified implementation)
   */
  private static async countPotentialDuplicates(userId?: string): Promise<number> {
    const where: Prisma.RecipeWhereInput = {
      deletedAt: null,
      ...(userId && { userId }),
    };

    // Count recipes with similar titles (exact matches)
    const similarTitles = await defaultPrisma.recipe.groupBy({
      by: ['title'],
      where,
      _count: {
        title: true,
      },
      having: {
        title: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    return similarTitles.reduce((sum, group) => sum + group._count.title - 1, 0);
  }
} 