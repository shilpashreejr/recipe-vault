import { PrismaClient } from '../../generated/prisma';
import { RecipeImage } from '../../generated/prisma/client';

const prisma = new PrismaClient();

export interface ImageUploadData {
  url: string;
  alt: string;
  isPrimary?: boolean;
  recipeId?: string;
}

export interface ImageStorageConfig {
  baseUrl: string;
  uploadPath: string;
  allowedFormats: string[];
  maxFileSize: number; // in bytes
  generateThumbnails: boolean;
}

export class ImageService {
  private static config: ImageStorageConfig = {
    baseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://images.recipe-vault.com',
    uploadPath: '/uploads/recipes',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    generateThumbnails: true,
  };

  static async uploadImage(file: File, recipeId: string): Promise<RecipeImage> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const filename = this.generateUniqueFilename(file.name);
    
    // Generate URL (in a real implementation, this would upload to cloud storage)
    const url = this.generateImageUrl(filename);
    
    // Create image record in database
    const imageData = {
      url,
      alt: file.name,
      isPrimary: false,
      recipeId,
    };

    return prisma.recipeImage.create({
      data: imageData,
    });
  }

  static async uploadMultipleImages(files: File[], recipeId: string): Promise<RecipeImage[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, recipeId).then(image => ({
        ...image,
        isPrimary: index === 0, // First image is primary
      }))
    );

    return Promise.all(uploadPromises);
  }

  static async getImageById(id: string): Promise<RecipeImage | null> {
    return prisma.recipeImage.findUnique({
      where: { id },
    });
  }

  static async getImagesByRecipeId(recipeId: string): Promise<RecipeImage[]> {
    return prisma.recipeImage.findMany({
      where: { recipeId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  static async updateImage(id: string, data: Partial<ImageUploadData>): Promise<RecipeImage | null> {
    return prisma.recipeImage.update({
      where: { id },
      data,
    });
  }

  static async deleteImage(id: string): Promise<boolean> {
    try {
      await prisma.recipeImage.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async setPrimaryImage(recipeId: string, imageId: string): Promise<boolean> {
    try {
      // First, unset all primary images for this recipe
      await prisma.recipeImage.updateMany({
        where: { recipeId, isPrimary: true },
        data: { isPrimary: false },
      });

      // Then set the specified image as primary
      await prisma.recipeImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  static generateThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: '150x150',
      medium: '300x300',
      large: '600x600',
    };

    // In a real implementation, this would generate thumbnail URLs
    // For now, we'll just append the size to the URL
    const urlParts = originalUrl.split('.');
    const extension = urlParts.pop();
    const baseUrl = urlParts.join('.');
    
    return `${baseUrl}_${sizes[size]}.${extension}`;
  }

  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async cleanupOrphanedImages(): Promise<number> {
    // This is a simplified approach - in a real implementation,
    // you might want to use a more sophisticated query
    // For now, we'll return 0 as this is a placeholder
    return 0;
  }

  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.config.allowedFormats.includes(extension)) {
      throw new Error(`File format not allowed. Allowed formats: ${this.config.allowedFormats.join(', ')}`);
    }
  }

  private static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    
    return `${timestamp}_${randomString}.${extension}`;
  }

  private static generateImageUrl(filename: string): string {
    return `${this.config.baseUrl}${this.config.uploadPath}/${filename}`;
  }

  static updateConfig(newConfig: Partial<ImageStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
} 