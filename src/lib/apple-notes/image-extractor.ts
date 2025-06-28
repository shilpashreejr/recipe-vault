import { AppleNoteImage } from './apple-notes-parser';

export interface ExtractedImage {
  id: string;
  originalSrc: string;
  processedSrc: string;
  alt: string;
  width?: number;
  height?: number;
  size: number;
  format: string;
  isBase64: boolean;
  isExternal: boolean;
  thumbnailUrl?: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export class AppleNotesImageExtractor {
  /**
   * Extract and process images from Apple Notes content
   */
  static async extractImages(
    content: string, 
    noteId: string,
    options: ImageProcessingOptions = {}
  ): Promise<ExtractedImage[]> {
    const images: ExtractedImage[] = [];
    
    // Extract image elements from HTML content
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const imgMatches = content.matchAll(imgRegex);
    
    for (const match of imgMatches) {
      const imgTag = match[0];
      const src = match[1];
      
      if (src) {
        try {
          const extractedImage = await this.processImage(src, noteId, imgTag, options);
          if (extractedImage) {
            images.push(extractedImage);
          }
        } catch (error) {
          console.error('Failed to process image:', error);
        }
      }
    }
    
    return images;
  }
  
  /**
   * Process a single image
   */
  private static async processImage(
    src: string, 
    noteId: string, 
    imgTag: string, 
    options: ImageProcessingOptions
  ): Promise<ExtractedImage | null> {
    const imageId = `img_${noteId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract alt text and dimensions from img tag
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
    
    const alt = altMatch ? altMatch[1] : '';
    const width = widthMatch ? parseInt(widthMatch[1]) : undefined;
    const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
    
    // Determine image type and process accordingly
    const isBase64 = src.startsWith('data:');
    const isExternal = src.startsWith('http://') || src.startsWith('https://');
    
    let processedSrc = src;
    let size = 0;
    let format = 'unknown';
    
    if (isBase64) {
      // Process base64 image
      const base64Data = await this.processBase64Image(src, options);
      if (base64Data) {
        processedSrc = base64Data.dataUrl;
        size = base64Data.size;
        format = base64Data.format;
      } else {
        return null; // Skip invalid base64 images
      }
    } else if (isExternal) {
      // Process external image
      const externalData = await this.processExternalImage(src, options);
      if (externalData) {
        processedSrc = externalData.url;
        size = externalData.size;
        format = externalData.format;
      } else {
        return null; // Skip invalid external images
      }
    } else {
      // Process relative/local image
      const localData = await this.processLocalImage(src, options);
      if (localData) {
        processedSrc = localData.url;
        size = localData.size;
        format = localData.format;
      } else {
        return null; // Skip invalid local images
      }
    }
    
    // Generate thumbnail if requested
    let thumbnailUrl: string | undefined;
    if (options.generateThumbnail && processedSrc) {
      thumbnailUrl = await this.generateThumbnail(processedSrc, options.thumbnailSize || 150);
    }
    
    return {
      id: imageId,
      originalSrc: src,
      processedSrc,
      alt,
      width,
      height,
      size,
      format,
      isBase64,
      isExternal,
      thumbnailUrl
    };
  }
  
  /**
   * Process base64 encoded image
   */
  private static async processBase64Image(
    dataUrl: string, 
    options: ImageProcessingOptions
  ): Promise<{ dataUrl: string; size: number; format: string } | null> {
    try {
      // Extract base64 data
      const base64Match = dataUrl.match(/data:([^;]+);base64,(.+)/);
      if (!base64Match) {
        return null;
      }
      
      const mimeType = base64Match[1];
      const base64Data = base64Match[2];
      
      // Decode base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      const size = buffer.length;
      
      // Determine format from mime type
      const format = this.getFormatFromMimeType(mimeType);
      
      // Process image if needed (resize, optimize, etc.)
      const processedBuffer = await this.processImageBuffer(buffer, options);
      const processedBase64 = processedBuffer.toString('base64');
      const processedDataUrl = `data:${mimeType};base64,${processedBase64}`;
      
      return {
        dataUrl: processedDataUrl,
        size: processedBuffer.length,
        format
      };
    } catch (error) {
      console.error('Failed to process base64 image:', error);
      return null;
    }
  }
  
  /**
   * Process external image URL
   */
  private static async processExternalImage(
    url: string, 
    options: ImageProcessingOptions
  ): Promise<{ url: string; size: number; format: string } | null> {
    try {
      // For external images, we'll return the URL as-is for now
      // In a production environment, you might want to:
      // 1. Download and cache the image
      // 2. Process and optimize it
      // 3. Store it in your own CDN
      
      // For now, we'll make a HEAD request to get basic info
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return null;
      }
      
      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength) : 0;
      const format = this.getFormatFromMimeType(contentType);
      
      return {
        url,
        size,
        format
      };
    } catch (error) {
      console.error('Failed to process external image:', error);
      return null;
    }
  }
  
  /**
   * Process local image (relative path)
   */
  private static async processLocalImage(
    path: string, 
    options: ImageProcessingOptions
  ): Promise<{ url: string; size: number; format: string } | null> {
    try {
      // For local images, we'll need to handle them based on the context
      // This might involve:
      // 1. Looking for the image in a specific directory
      // 2. Converting relative paths to absolute URLs
      // 3. Processing and storing the image
      
      // For now, we'll return basic info
      const format = this.getFormatFromPath(path);
      
      return {
        url: path,
        size: 0, // Would need to read file to get actual size
        format
      };
    } catch (error) {
      console.error('Failed to process local image:', error);
      return null;
    }
  }
  
  /**
   * Process image buffer (resize, optimize, etc.)
   */
  private static async processImageBuffer(
    buffer: Buffer, 
    options: ImageProcessingOptions
  ): Promise<Buffer> {
    // This is a placeholder for image processing
    // In a real implementation, you would use a library like Sharp or Jimp
    // to resize, optimize, and convert images
    
    // For now, return the original buffer
    return buffer;
  }
  
  /**
   * Generate thumbnail for an image
   */
  private static async generateThumbnail(
    imageSrc: string, 
    size: number
  ): Promise<string | undefined> {
    // This is a placeholder for thumbnail generation
    // In a real implementation, you would:
    // 1. Load the image
    // 2. Resize it to the thumbnail size
    // 3. Convert to base64 or save to storage
    // 4. Return the thumbnail URL
    
    // For now, return undefined
    return undefined;
  }
  
  /**
   * Get format from MIME type
   */
  private static getFormatFromMimeType(mimeType: string): string {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return 'jpeg';
    } else if (mimeType.includes('png')) {
      return 'png';
    } else if (mimeType.includes('gif')) {
      return 'gif';
    } else if (mimeType.includes('webp')) {
      return 'webp';
    } else if (mimeType.includes('svg')) {
      return 'svg';
    } else {
      return 'unknown';
    }
  }
  
  /**
   * Get format from file path
   */
  private static getFormatFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      case 'webp':
        return 'webp';
      case 'svg':
        return 'svg';
      default:
        return 'unknown';
    }
  }
  
  /**
   * Validate image URL
   */
  static isValidImageUrl(url: string): boolean {
    // Check if it's a valid image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    const isDataUrl = url.startsWith('data:image/');
    const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');
    
    return isImageExtension || isDataUrl || isHttpUrl;
  }
  
  /**
   * Get image statistics
   */
  static getImageStats(images: ExtractedImage[]): {
    totalImages: number;
    totalSize: number;
    formats: Record<string, number>;
    base64Count: number;
    externalCount: number;
    localCount: number;
  } {
    const stats = {
      totalImages: images.length,
      totalSize: 0,
      formats: {} as Record<string, number>,
      base64Count: 0,
      externalCount: 0,
      localCount: 0
    };
    
    images.forEach(image => {
      stats.totalSize += image.size;
      
      // Count formats
      stats.formats[image.format] = (stats.formats[image.format] || 0) + 1;
      
      // Count types
      if (image.isBase64) {
        stats.base64Count++;
      } else if (image.isExternal) {
        stats.externalCount++;
      } else {
        stats.localCount++;
      }
    });
    
    return stats;
  }
} 