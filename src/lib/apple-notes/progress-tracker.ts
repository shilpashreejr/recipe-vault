import { AppleNote } from './apple-notes-parser';
import { AppleNotesImportValidator, ValidationResult } from './import-validator';

export interface ImportProgress {
  id: string;
  status: 'pending' | 'validating' | 'parsing' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stage: 'validation' | 'parsing' | 'image_extraction' | 'folder_processing' | 'recipe_extraction' | 'database_save';
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  startTime: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number; // in seconds
  stats: ImportStats;
  errors: ImportError[];
  warnings: ImportWarning[];
  validationResult?: ValidationResult;
}

export interface ImportStats {
  totalNotes: number;
  processedNotes: number;
  successfulNotes: number;
  failedNotes: number;
  skippedNotes: number;
  totalImages: number;
  processedImages: number;
  totalFolders: number;
  processedFolders: number;
  totalRecipes: number;
  extractedRecipes: number;
  fileSize: number;
  processingSpeed: number; // notes per second
}

export interface ImportError {
  type: 'critical' | 'error' | 'warning';
  code: string;
  message: string;
  noteId?: string;
  folderId?: string;
  timestamp: Date;
  stage: string;
}

export interface ImportWarning {
  code: string;
  message: string;
  noteId?: string;
  folderId?: string;
  timestamp: Date;
  stage: string;
  suggestion?: string;
}

export interface ProgressCallback {
  (progress: ImportProgress): void;
}

export class AppleNotesProgressTracker {
  private progress: ImportProgress;
  private callbacks: ProgressCallback[] = [];
  private isCancelled = false;
  private startTime: number = 0;
  private lastUpdateTime: number = 0;
  private processingTimes: number[] = [];

  constructor(importId: string) {
    this.progress = {
      id: importId,
      status: 'pending',
      stage: 'validation',
      currentStep: 0,
      totalSteps: 0,
      progress: 0,
      startTime: new Date(),
      stats: {
        totalNotes: 0,
        processedNotes: 0,
        successfulNotes: 0,
        failedNotes: 0,
        skippedNotes: 0,
        totalImages: 0,
        processedImages: 0,
        totalFolders: 0,
        processedFolders: 0,
        totalRecipes: 0,
        extractedRecipes: 0,
        fileSize: 0,
        processingSpeed: 0
      },
      errors: [],
      warnings: []
    };
  }

  /**
   * Add progress callback
   */
  onProgress(callback: ProgressCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove progress callback
   */
  offProgress(callback: ProgressCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Start import process
   */
  async startImport(
    content: string,
    fileName: string,
    options: any = {}
  ): Promise<ImportProgress> {
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.isCancelled = false;

    try {
      // Stage 1: Validation
      await this.updateProgress({
        status: 'validating',
        stage: 'validation',
        currentStep: 1,
        totalSteps: 6
      });

      const validationResult = await AppleNotesImportValidator.validateExport(content, fileName, options);
      this.progress.validationResult = validationResult;

      if (!validationResult.isValid) {
        const criticalErrors = validationResult.errors.filter(e => e.type === 'critical');
        if (criticalErrors.length > 0) {
          throw new Error(`Validation failed: ${criticalErrors[0].message}`);
        }
      }

      // Add validation errors and warnings
      validationResult.errors.forEach(error => {
        this.addError(error.type, error.code, error.message, error.noteId, error.folderId, 'validation');
      });

      validationResult.warnings.forEach(warning => {
        this.addWarning(warning.code, warning.message, warning.noteId, warning.folderId, 'validation', warning.suggestion);
      });

      // Update stats from validation
      this.progress.stats.totalNotes = validationResult.stats.totalNotes;
      this.progress.stats.totalImages = validationResult.stats.totalImages;
      this.progress.stats.totalFolders = validationResult.stats.totalFolders;
      this.progress.stats.fileSize = validationResult.stats.totalSize;

      // Stage 2: Parsing
      await this.updateProgress({
        status: 'parsing',
        stage: 'parsing',
        currentStep: 2,
        totalSteps: 6
      });

      const { AppleNotesParser } = await import('./apple-notes-parser');
      const format = AppleNotesParser.detectFormat(content);
      
      let notes: AppleNote[] = [];
      if (format === 'html') {
        const { AppleNotesHtmlParser } = await import('./html-parser');
        const result = await AppleNotesHtmlParser.parseHtmlExport(content);
        notes = result.notes;
      } else if (format === 'txt') {
        const result = await AppleNotesParser.parseTxtExport(content);
        notes = result.notes;
      }

      // Stage 3: Image Extraction
      await this.updateProgress({
        status: 'processing',
        stage: 'image_extraction',
        currentStep: 3,
        totalSteps: 6
      });

      const { AppleNotesImageExtractor } = await import('./image-extractor');
      let processedImages = 0;
      
      for (let i = 0; i < notes.length; i++) {
        if (this.isCancelled) {
          throw new Error('Import cancelled by user');
        }

        const note = notes[i];
        if (note.images && note.images.length > 0) {
          try {
            const extractedImages = await AppleNotesImageExtractor.extractImages(
              note.content,
              note.id,
              { generateThumbnail: true }
            );
            processedImages += extractedImages.length;
          } catch (error) {
            this.addWarning(
              'IMAGE_EXTRACTION_FAILED',
              `Failed to extract images from note "${note.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
              note.id,
              undefined,
              'image_extraction'
            );
          }
        }

        // Update progress for image extraction
        this.progress.stats.processedImages = processedImages;
        await this.updateProgress({
          progress: (i / notes.length) * 20 + 40 // 40-60% for image extraction
        });
      }

      // Stage 4: Folder Processing
      await this.updateProgress({
        status: 'processing',
        stage: 'folder_processing',
        currentStep: 4,
        totalSteps: 6
      });

      const { AppleNotesFolderParser } = await import('./folder-parser');
      const folderStructure = AppleNotesFolderParser.parseFolderStructure(notes);
      this.progress.stats.processedFolders = folderStructure.totalFolders;

      // Stage 5: Recipe Extraction
      await this.updateProgress({
        status: 'processing',
        stage: 'recipe_extraction',
        currentStep: 5,
        totalSteps: 6
      });

      let extractedRecipes = 0;
      for (let i = 0; i < notes.length; i++) {
        if (this.isCancelled) {
          throw new Error('Import cancelled by user');
        }

        const note = notes[i];
        try {
          // Check if note contains recipe-like content
          const isRecipe = this.isRecipeNote(note);
          if (isRecipe) {
            extractedRecipes++;
            // Here you would extract recipe data and save to database
            // For now, we'll just count them
          }
        } catch (error) {
          this.addError(
            'error',
            'RECIPE_EXTRACTION_FAILED',
            `Failed to extract recipe from note "${note.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            note.id,
            undefined,
            'recipe_extraction'
          );
        }

        // Update progress for recipe extraction
        this.progress.stats.processedNotes = i + 1;
        this.progress.stats.extractedRecipes = extractedRecipes;
        await this.updateProgress({
          progress: (i / notes.length) * 20 + 60 // 60-80% for recipe extraction
        });
      }

      // Stage 6: Database Save
      await this.updateProgress({
        status: 'processing',
        stage: 'database_save',
        currentStep: 6,
        totalSteps: 6
      });

      // Simulate database save process
      await this.simulateDatabaseSave(notes);

      // Complete
      await this.updateProgress({
        status: 'completed',
        progress: 100,
        endTime: new Date()
      });

      return this.progress;

    } catch (error) {
      await this.updateProgress({
        status: 'failed',
        endTime: new Date()
      });

      this.addError(
        'critical',
        'IMPORT_FAILED',
        error instanceof Error ? error.message : 'Unknown error occurred during import',
        undefined,
        undefined,
        this.progress.stage
      );

      throw error;
    }
  }

  /**
   * Update progress
   */
  private async updateProgress(updates: Partial<ImportProgress>): Promise<void> {
    // Update progress object
    Object.assign(this.progress, updates);

    // Calculate processing speed
    const currentTime = Date.now();
    const timeDiff = (currentTime - this.lastUpdateTime) / 1000;
    if (timeDiff > 0) {
      this.progress.stats.processingSpeed = this.progress.stats.processedNotes / (timeDiff / 60); // notes per minute
    }

    // Calculate estimated time remaining
    if (this.progress.progress > 0 && this.progress.stats.processingSpeed > 0) {
      const remainingNotes = this.progress.stats.totalNotes - this.progress.stats.processedNotes;
      this.progress.estimatedTimeRemaining = remainingNotes / this.progress.stats.processingSpeed * 60; // in seconds
    }

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback({ ...this.progress });
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });

    this.lastUpdateTime = currentTime;
  }

  /**
   * Add error
   */
  private addError(
    type: 'critical' | 'error' | 'warning',
    code: string,
    message: string,
    noteId?: string,
    folderId?: string,
    stage: string = this.progress.stage
  ): void {
    this.progress.errors.push({
      type,
      code,
      message,
      noteId,
      folderId,
      timestamp: new Date(),
      stage
    });
  }

  /**
   * Add warning
   */
  private addWarning(
    code: string,
    message: string,
    noteId?: string,
    folderId?: string,
    stage: string = this.progress.stage,
    suggestion?: string
  ): void {
    this.progress.warnings.push({
      code,
      message,
      noteId,
      folderId,
      timestamp: new Date(),
      stage,
      suggestion
    });
  }

  /**
   * Check if note contains recipe-like content
   */
  private isRecipeNote(note: AppleNote): boolean {
    const content = note.content.toLowerCase();
    const title = note.title.toLowerCase();

    // Recipe indicators
    const recipeKeywords = [
      'ingredients', 'instructions', 'directions', 'prep time', 'cook time',
      'servings', 'yield', 'preheat', 'oven', 'stir', 'mix', 'bake', 'cook',
      'recipe', 'cuisine', 'dish', 'meal', 'food'
    ];

    const hasRecipeKeywords = recipeKeywords.some(keyword => 
      content.includes(keyword) || title.includes(keyword)
    );

    // Check for ingredient-like patterns
    const ingredientPattern = /\d+\s+(cup|tbsp|tsp|oz|lb|g|kg|ml|l|pound|ounce|gram|kilogram|teaspoon|tablespoon)/i;
    const hasIngredients = ingredientPattern.test(content);

    // Check for numbered instructions
    const instructionPattern = /\d+\.\s+[A-Z]/;
    const hasInstructions = instructionPattern.test(content);

    return hasRecipeKeywords || hasIngredients || hasInstructions;
  }

  /**
   * Simulate database save process
   */
  private async simulateDatabaseSave(notes: AppleNote[]): Promise<void> {
    const saveBatchSize = 10;
    const totalBatches = Math.ceil(notes.length / saveBatchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      if (this.isCancelled) {
        throw new Error('Import cancelled by user');
      }

      const startIndex = batch * saveBatchSize;
      const endIndex = Math.min(startIndex + saveBatchSize, notes.length);
      const batchNotes = notes.slice(startIndex, endIndex);

      // Simulate database save
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update progress
      this.progress.stats.successfulNotes += batchNotes.length;
      await this.updateProgress({
        progress: 80 + (batch / totalBatches) * 20 // 80-100% for database save
      });
    }
  }

  /**
   * Cancel import
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Get current progress
   */
  getProgress(): ImportProgress {
    return { ...this.progress };
  }

  /**
   * Get progress summary
   */
  getProgressSummary(): string {
    const { status, stage, progress, stats, errors, warnings } = this.progress;
    
    let summary = `Import Status: ${status.toUpperCase()}\n`;
    summary += `Current Stage: ${stage.replace('_', ' ').toUpperCase()}\n`;
    summary += `Progress: ${progress.toFixed(1)}%\n\n`;
    
    summary += `📊 Statistics:\n`;
    summary += `• Processed Notes: ${stats.processedNotes}/${stats.totalNotes}\n`;
    summary += `• Successful: ${stats.successfulNotes}\n`;
    summary += `• Failed: ${stats.failedNotes}\n`;
    summary += `• Extracted Recipes: ${stats.extractedRecipes}\n`;
    summary += `• Processed Images: ${stats.processedImages}/${stats.totalImages}\n`;
    summary += `• Processing Speed: ${stats.processingSpeed.toFixed(1)} notes/min\n\n`;
    
    if (errors.length > 0) {
      summary += `❌ Errors: ${errors.length}\n`;
    }
    if (warnings.length > 0) {
      summary += `⚠️  Warnings: ${warnings.length}\n`;
    }
    
    if (this.progress.estimatedTimeRemaining) {
      const minutes = Math.floor(this.progress.estimatedTimeRemaining / 60);
      const seconds = Math.floor(this.progress.estimatedTimeRemaining % 60);
      summary += `\n⏱️  Estimated Time Remaining: ${minutes}m ${seconds}s`;
    }
    
    return summary;
  }
} 