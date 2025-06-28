import { AppleNote } from './apple-notes-parser';
import { AppleNotesParser } from './apple-notes-parser';
import { AppleNotesImageExtractor } from './image-extractor';
import { AppleNotesFolderParser, FolderStructure } from './folder-parser';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

export interface ValidationError {
  type: 'critical' | 'error' | 'warning';
  code: string;
  message: string;
  field?: string;
  noteId?: string;
  folderId?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  noteId?: string;
  folderId?: string;
  suggestion?: string;
}

export interface ValidationStats {
  totalNotes: number;
  validNotes: number;
  invalidNotes: number;
  totalFolders: number;
  validFolders: number;
  totalImages: number;
  validImages: number;
  totalSize: number;
  averageNoteSize: number;
  duplicateTitles: number;
  emptyNotes: number;
  notesWithImages: number;
  notesWithLinks: number;
}

export interface ValidationOptions {
  maxFileSize?: number; // in MB
  maxNotes?: number;
  maxImages?: number;
  allowedFormats?: string[];
  validateImages?: boolean;
  checkDuplicates?: boolean;
  strictMode?: boolean;
}

export class AppleNotesImportValidator {
  /**
   * Validate Apple Notes export file
   */
  static async validateExport(
    content: string, 
    fileName: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Set default options
    const defaultOptions: ValidationOptions = {
      maxFileSize: 50,
      maxNotes: 1000,
      maxImages: 100,
      allowedFormats: ['.html', '.txt', '.htm'],
      validateImages: true,
      checkDuplicates: true,
      strictMode: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Validate file format
    const formatValidation = this.validateFileFormat(fileName, content, finalOptions);
    errors.push(...formatValidation.errors);
    warnings.push(...formatValidation.warnings);
    
    // Validate file size
    const sizeValidation = this.validateFileSize(content, finalOptions);
    errors.push(...sizeValidation.errors);
    warnings.push(...sizeValidation.warnings);
    
    // Parse and validate content
    let notes: AppleNote[] = [];
    let folderStructure: FolderStructure | null = null;
    
    try {
      const format = AppleNotesParser.detectFormat(content);
      
      if (format === 'html') {
        const { AppleNotesHtmlParser } = await import('./html-parser');
        const result = await AppleNotesHtmlParser.parseHtmlExport(content);
        notes = result.notes;
      } else if (format === 'txt') {
        const result = await AppleNotesParser.parseTxtExport(content);
        notes = result.notes;
      } else {
        errors.push({
          type: 'critical',
          code: 'INVALID_FORMAT',
          message: 'Unable to detect file format. Please ensure this is a valid Apple Notes export file.'
        });
      }
    } catch (error) {
      errors.push({
        type: 'critical',
        code: 'PARSE_ERROR',
        message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Validate notes if parsing was successful
    if (notes.length > 0) {
      const notesValidation = this.validateNotes(notes, finalOptions);
      errors.push(...notesValidation.errors);
      warnings.push(...notesValidation.warnings);
      
      // Validate folder structure
      folderStructure = AppleNotesFolderParser.parseFolderStructure(notes);
      const folderValidation = this.validateFolderStructure(folderStructure, finalOptions);
      errors.push(...folderValidation.errors);
      warnings.push(...folderValidation.warnings);
    }
    
    // Calculate statistics
    const stats = this.calculateValidationStats(notes, folderStructure, content);
    
    // Determine overall validity
    const isValid = errors.filter(error => error.type === 'critical' || error.type === 'error').length === 0;
    
    return {
      isValid,
      errors,
      warnings,
      stats
    };
  }
  
  /**
   * Validate file format
   */
  private static validateFileFormat(
    fileName: string, 
    content: string, 
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check file extension
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!options.allowedFormats?.includes(fileExtension)) {
      errors.push({
        type: 'error',
        code: 'INVALID_EXTENSION',
        message: `File extension '${fileExtension}' is not supported. Allowed formats: ${options.allowedFormats?.join(', ')}`
      });
    }
    
    // Check content format
    const format = AppleNotesParser.detectFormat(content);
    if (format === 'unknown') {
      errors.push({
        type: 'error',
        code: 'UNKNOWN_FORMAT',
        message: 'Unable to detect file format. Content does not appear to be a valid Apple Notes export.'
      });
    }
    
    // Check for minimum content
    if (content.trim().length < 10) {
      errors.push({
        type: 'error',
        code: 'EMPTY_FILE',
        message: 'File appears to be empty or contains insufficient content.'
      });
    }
    
    return { errors, warnings };
  }
  
  /**
   * Validate file size
   */
  private static validateFileSize(
    content: string, 
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const sizeInMB = content.length / (1024 * 1024);
    
    if (options.maxFileSize && sizeInMB > options.maxFileSize) {
      errors.push({
        type: 'error',
        code: 'FILE_TOO_LARGE',
        message: `File size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${options.maxFileSize}MB).`
      });
    }
    
    if (sizeInMB > 10) {
      warnings.push({
        code: 'LARGE_FILE',
        message: `File is quite large (${sizeInMB.toFixed(2)}MB). Processing may take longer than usual.`,
        suggestion: 'Consider splitting the export into smaller files if possible.'
      });
    }
    
    return { errors, warnings };
  }
  
  /**
   * Validate individual notes
   */
  private static validateNotes(
    notes: AppleNote[], 
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check note count
    if (options.maxNotes && notes.length > options.maxNotes) {
      errors.push({
        type: 'error',
        code: 'TOO_MANY_NOTES',
        message: `Number of notes (${notes.length}) exceeds maximum allowed (${options.maxNotes}).`
      });
    }
    
    // Validate each note
    const titles = new Set<string>();
    const duplicateTitles: string[] = [];
    
    notes.forEach((note, index) => {
      const noteErrors = this.validateNote(note, index, options);
      errors.push(...noteErrors.errors);
      warnings.push(...noteErrors.warnings);
      
      // Check for duplicate titles
      if (options.checkDuplicates && note.title) {
        if (titles.has(note.title)) {
          duplicateTitles.push(note.title);
          warnings.push({
            code: 'DUPLICATE_TITLE',
            message: `Duplicate title found: "${note.title}"`,
            noteId: note.id,
            suggestion: 'Consider renaming one of the notes to avoid confusion.'
          });
        } else {
          titles.add(note.title);
        }
      }
    });
    
    // Check for empty notes
    const emptyNotes = notes.filter(note => !note.title && !note.content.trim());
    if (emptyNotes.length > 0) {
      warnings.push({
        code: 'EMPTY_NOTES',
        message: `Found ${emptyNotes.length} empty notes.`,
        suggestion: 'Empty notes will be skipped during import.'
      });
    }
    
    return { errors, warnings };
  }
  
  /**
   * Validate a single note
   */
  private static validateNote(
    note: AppleNote, 
    index: number, 
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate note ID
    if (!note.id || note.id.trim() === '') {
      errors.push({
        type: 'error',
        code: 'MISSING_NOTE_ID',
        message: `Note at index ${index} is missing an ID.`,
        noteId: note.id
      });
    }
    
    // Validate title
    if (!note.title || note.title.trim() === '') {
      warnings.push({
        code: 'MISSING_TITLE',
        message: `Note at index ${index} has no title.`,
        noteId: note.id,
        suggestion: 'Consider adding a descriptive title.'
      });
    } else if (note.title.length > 200) {
      warnings.push({
        code: 'TITLE_TOO_LONG',
        message: `Note title is very long (${note.title.length} characters).`,
        noteId: note.id,
        field: 'title',
        suggestion: 'Consider shortening the title for better readability.'
      });
    }
    
    // Validate content
    if (!note.content || note.content.trim() === '') {
      warnings.push({
        code: 'EMPTY_CONTENT',
        message: `Note at index ${index} has no content.`,
        noteId: note.id,
        suggestion: 'Empty notes may not be useful for recipe extraction.'
      });
    } else if (note.content.length > 10000) {
      warnings.push({
        code: 'CONTENT_TOO_LONG',
        message: `Note content is very long (${note.content.length} characters).`,
        noteId: note.id,
        field: 'content',
        suggestion: 'Very long notes may be difficult to process.'
      });
    }
    
    // Validate dates
    if (note.created && isNaN(note.created.getTime())) {
      errors.push({
        type: 'error',
        code: 'INVALID_CREATED_DATE',
        message: `Note at index ${index} has an invalid creation date.`,
        noteId: note.id,
        field: 'created'
      });
    }
    
    if (note.modified && isNaN(note.modified.getTime())) {
      errors.push({
        type: 'error',
        code: 'INVALID_MODIFIED_DATE',
        message: `Note at index ${index} has an invalid modification date.`,
        noteId: note.id,
        field: 'modified'
      });
    }
    
    // Validate images
    if (note.images && note.images.length > 0) {
      if (options.maxImages && note.images.length > options.maxImages) {
        warnings.push({
          code: 'TOO_MANY_IMAGES',
          message: `Note has ${note.images.length} images, which is more than recommended.`,
          noteId: note.id,
          suggestion: 'Consider reducing the number of images for better performance.'
        });
      }
      
      // Validate individual images
      note.images.forEach((image, imageIndex) => {
        if (!AppleNotesImageExtractor.isValidImageUrl(image.src)) {
          warnings.push({
            code: 'INVALID_IMAGE_URL',
            message: `Image ${imageIndex + 1} has an invalid URL.`,
            noteId: note.id,
            field: 'images'
          });
        }
      });
    }
    
    // Validate folder
    if (!note.folder || note.folder.trim() === '') {
      warnings.push({
        code: 'MISSING_FOLDER',
        message: `Note at index ${index} has no folder assignment.`,
        noteId: note.id,
        field: 'folder',
        suggestion: 'Note will be placed in the default folder.'
      });
    }
    
    return { errors, warnings };
  }
  
  /**
   * Validate folder structure
   */
  private static validateFolderStructure(
    structure: FolderStructure, 
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check folder count
    if (structure.totalFolders > 100) {
      warnings.push({
        code: 'TOO_MANY_FOLDERS',
        message: `Large number of folders (${structure.totalFolders}) detected.`,
        suggestion: 'Consider consolidating folders for better organization.'
      });
    }
    
    // Check folder depth
    if (structure.maxDepth > 5) {
      warnings.push({
        code: 'DEEP_FOLDER_STRUCTURE',
        message: `Deep folder structure detected (${structure.maxDepth} levels).`,
        suggestion: 'Very deep folder structures may be difficult to navigate.'
      });
    }
    
    // Validate individual folders
    structure.allFolders.forEach(folder => {
      const folderErrors = this.validateFolder(folder, options);
      errors.push(...folderErrors.errors);
      warnings.push(...folderErrors.warnings);
    });
    
    return { errors, warnings };
  }
  
  /**
   * Validate a single folder
   */
  private static validateFolder(
    folder: any, 
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate folder name
    if (!folder.name || folder.name.trim() === '') {
      errors.push({
        type: 'error',
        code: 'MISSING_FOLDER_NAME',
        message: 'Folder is missing a name.',
        folderId: folder.id
      });
    } else if (folder.name.length > 100) {
      warnings.push({
        code: 'FOLDER_NAME_TOO_LONG',
        message: `Folder name is very long (${folder.name.length} characters).`,
        folderId: folder.id,
        field: 'name',
        suggestion: 'Consider shortening the folder name.'
      });
    }
    
    // Check for empty folders
    if (folder.noteCount === 0) {
      warnings.push({
        code: 'EMPTY_FOLDER',
        message: `Folder "${folder.name}" contains no notes.`,
        folderId: folder.id,
        suggestion: 'Empty folders will be skipped during import.'
      });
    }
    
    // Validate folder path
    if (folder.path && folder.path.length > 500) {
      warnings.push({
        code: 'FOLDER_PATH_TOO_LONG',
        message: `Folder path is very long (${folder.path.length} characters).`,
        folderId: folder.id,
        field: 'path',
        suggestion: 'Consider using shorter folder names.'
      });
    }
    
    return { errors, warnings };
  }
  
  /**
   * Calculate validation statistics
   */
  private static calculateValidationStats(
    notes: AppleNote[], 
    folderStructure: FolderStructure | null, 
    content: string
  ): ValidationStats {
    const totalNotes = notes.length;
    const validNotes = notes.filter(note => 
      note.title && note.content && note.id
    ).length;
    const invalidNotes = totalNotes - validNotes;
    
    const totalFolders = folderStructure?.totalFolders || 0;
    const validFolders = folderStructure ? 
      Array.from(folderStructure.allFolders.values()).filter(folder => 
        folder.name && folder.noteCount > 0
      ).length : 0;
    
    const totalImages = notes.reduce((sum, note) => sum + (note.images?.length || 0), 0);
    const validImages = notes.reduce((sum, note) => {
      if (!note.images) return sum;
      return sum + note.images.filter(img => 
        AppleNotesImageExtractor.isValidImageUrl(img.src)
      ).length;
    }, 0);
    
    const totalSize = content.length;
    const averageNoteSize = totalNotes > 0 ? totalSize / totalNotes : 0;
    
    const titles = notes.map(note => note.title).filter(Boolean);
    const duplicateTitles = titles.length - new Set(titles).size;
    
    const emptyNotes = notes.filter(note => !note.title && !note.content.trim()).length;
    const notesWithImages = notes.filter(note => note.images && note.images.length > 0).length;
    const notesWithLinks = notes.filter(note => 
      note.content && note.content.includes('<a href=')
    ).length;
    
    return {
      totalNotes,
      validNotes,
      invalidNotes,
      totalFolders,
      validFolders,
      totalImages,
      validImages,
      totalSize,
      averageNoteSize,
      duplicateTitles,
      emptyNotes,
      notesWithImages,
      notesWithLinks
    };
  }
  
  /**
   * Get validation summary
   */
  static getValidationSummary(result: ValidationResult): string {
    const { isValid, errors, warnings, stats } = result;
    
    const criticalErrors = errors.filter(e => e.type === 'critical').length;
    const regularErrors = errors.filter(e => e.type === 'error').length;
    const errorWarnings = errors.filter(e => e.type === 'warning').length;
    
    let summary = `Validation ${isValid ? 'PASSED' : 'FAILED'}\n\n`;
    summary += `📊 Statistics:\n`;
    summary += `• Total Notes: ${stats.totalNotes}\n`;
    summary += `• Valid Notes: ${stats.validNotes}\n`;
    summary += `• Total Folders: ${stats.totalFolders}\n`;
    summary += `• Total Images: ${stats.totalImages}\n`;
    summary += `• File Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB\n\n`;
    
    if (criticalErrors > 0) {
      summary += `❌ Critical Errors: ${criticalErrors}\n`;
    }
    if (regularErrors > 0) {
      summary += `❌ Errors: ${regularErrors}\n`;
    }
    if (errorWarnings > 0) {
      summary += `⚠️  Error Warnings: ${errorWarnings}\n`;
    }
    if (warnings.length > 0) {
      summary += `⚠️  Warnings: ${warnings.length}\n`;
    }
    
    return summary;
  }
} 