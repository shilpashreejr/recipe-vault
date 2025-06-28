import { createWorker, Worker, ImageLike } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  language: string;
}

export interface OCROptions {
  language?: string;
  confidenceThreshold?: number;
  preprocessing?: {
    resize?: boolean;
    enhance?: boolean;
    denoise?: boolean;
  };
}

export class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;
  private defaultOptions: OCROptions = {
    language: 'eng',
    confidenceThreshold: 60,
    preprocessing: {
      resize: true,
      enhance: true,
      denoise: true,
    },
  };

  /**
   * Initialize the OCR worker
   */
  async initialize(options: OCROptions = {}): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const config = { ...this.defaultOptions, ...options };
      this.worker = await createWorker(config.language || 'eng');
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize OCR worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from an image
   */
  async extractText(image: ImageLike, options: OCROptions = {}): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize(options);
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    const startTime = Date.now();
    const config = { ...this.defaultOptions, ...options };

    try {
      // Apply preprocessing if enabled and canvas is available
      let processedImage = image;
      if (config.preprocessing?.resize || config.preprocessing?.enhance || config.preprocessing?.denoise) {
        try {
          processedImage = await this.preprocessImage(image, config.preprocessing);
        } catch (preprocessingError) {
          // If preprocessing fails, continue with original image
          console.warn('Image preprocessing failed, using original image:', preprocessingError);
          processedImage = image;
        }
      }

      // Perform OCR
      const result = await this.worker.recognize(processedImage);

      const processingTime = Date.now() - startTime;

      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        processingTime,
        language: config.language || 'eng',
      };
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  private async preprocessImage(image: ImageLike, options: any): Promise<ImageLike> {
    // Check if canvas is available
    if (typeof document === 'undefined' || !document.createElement) {
      throw new Error('Canvas not available in this environment');
    }

    // Create a canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context for image preprocessing');
    }

    // Create an image element from the input
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Apply preprocessing filters
          if (options.resize) {
            this.resizeImage(canvas, ctx);
          }

          if (options.enhance) {
            this.enhanceImage(canvas, ctx);
          }

          if (options.denoise) {
            this.denoiseImage(canvas, ctx);
          }

          // Convert back to image-like format
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert processed image to blob'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for preprocessing'));
      };

      // Handle different image input types
      if (image instanceof Blob) {
        img.src = URL.createObjectURL(image);
      } else if (typeof image === 'string') {
        img.src = image;
      } else {
        reject(new Error('Unsupported image format for preprocessing'));
      }
    });
  }

  /**
   * Resize image to optimal size for OCR
   */
  private resizeImage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const maxWidth = 2000;
    const maxHeight = 2000;
    
    let { width, height } = canvas;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
      
      const resizedCanvas = document.createElement('canvas');
      const resizedCtx = resizedCanvas.getContext('2d')!;
      
      resizedCanvas.width = width;
      resizedCanvas.height = height;
      
      resizedCtx.drawImage(canvas, 0, 0, width, height);
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(resizedCanvas, 0, 0);
    }
  }

  /**
   * Enhance image contrast and brightness
   */
  private enhanceImage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple contrast and brightness enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Enhance contrast
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));     // Red
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128)); // Green
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128)); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply denoising filter
   */
  private denoiseImage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Simple median filter for denoising
    const filteredData = new Uint8ClampedArray(data.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Get 3x3 neighborhood
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push({
              r: data[nIdx],
              g: data[nIdx + 1],
              b: data[nIdx + 2],
              a: data[nIdx + 3],
            });
          }
        }
        
        // Calculate median for each channel
        const sortedR = neighbors.map(n => n.r).sort((a, b) => a - b);
        const sortedG = neighbors.map(n => n.g).sort((a, b) => a - b);
        const sortedB = neighbors.map(n => n.b).sort((a, b) => a - b);
        const sortedA = neighbors.map(n => n.a).sort((a, b) => a - b);
        
        const medianIdx = Math.floor(neighbors.length / 2);
        
        filteredData[idx] = sortedR[medianIdx];
        filteredData[idx + 1] = sortedG[medianIdx];
        filteredData[idx + 2] = sortedB[medianIdx];
        filteredData[idx + 3] = sortedA[medianIdx];
      }
    }
    
    // Copy filtered data back
    for (let i = 0; i < data.length; i++) {
      data[i] = filteredData[i];
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      // For now, return common languages - in a real implementation,
      // you would query the worker for available languages
      return ['eng', 'fra', 'deu', 'spa', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi_sim'];
    } catch (error) {
      throw new Error(`Failed to get supported languages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Terminate the worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if the service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}

// Export a singleton instance
export const ocrService = new OCRService(); 