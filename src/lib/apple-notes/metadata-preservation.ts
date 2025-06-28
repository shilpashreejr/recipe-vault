import { AppleNote } from './apple-notes-parser';
import { AppleNotesFolderParser, AppleNotesFolder } from './folder-parser';

export interface AppleNotesMetadata {
  noteId: string;
  title: string;
  folder: string;
  folderPath: string[];
  created: Date;
  modified: Date;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  color?: string;
  icon?: string;
  source: 'apple_notes';
  exportDate: Date;
  originalFormat: 'html' | 'txt';
  contentHash: string;
  metadataHash: string;
  customFields: Record<string, any>;
}

export interface FolderMetadata {
  folderId: string;
  name: string;
  path: string;
  parentId?: string;
  noteCount: number;
  created: Date;
  modified: Date;
  color?: string;
  icon?: string;
  isSystem: boolean;
  children: string[];
  metadataHash: string;
}

export interface ExportMetadata {
  exportId: string;
  fileName: string;
  fileSize: number;
  exportDate: Date;
  format: 'html' | 'txt';
  totalNotes: number;
  totalFolders: number;
  totalImages: number;
  version?: string;
  deviceInfo?: {
    device: string;
    os: string;
    appVersion: string;
  };
  customFields: Record<string, any>;
}

export interface MetadataPreservationOptions {
  preserveTimestamps?: boolean;
  preserveFolderStructure?: boolean;
  preserveTags?: boolean;
  preserveColors?: boolean;
  preserveCustomFields?: boolean;
  generateHashes?: boolean;
  includeDeviceInfo?: boolean;
}

export class AppleNotesMetadataPreservation {
  /**
   * Extract and preserve metadata from Apple Notes export
   */
  static async preserveMetadata(
    notes: AppleNote[],
    folderStructure: any,
    fileName: string,
    fileSize: number,
    format: 'html' | 'txt',
    options: MetadataPreservationOptions = {}
  ): Promise<{
    notesMetadata: AppleNotesMetadata[];
    foldersMetadata: FolderMetadata[];
    exportMetadata: ExportMetadata;
  }> {
    const defaultOptions: MetadataPreservationOptions = {
      preserveTimestamps: true,
      preserveFolderStructure: true,
      preserveTags: true,
      preserveColors: true,
      preserveCustomFields: true,
      generateHashes: true,
      includeDeviceInfo: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Extract notes metadata
    const notesMetadata = await Promise.all(
      notes.map(note => this.extractNoteMetadata(note, finalOptions))
    );

    // Extract folders metadata
    const foldersMetadata = this.extractFoldersMetadata(folderStructure, finalOptions);

    // Create export metadata
    const exportMetadata = this.createExportMetadata(
      fileName,
      fileSize,
      format,
      notes,
      folderStructure,
      finalOptions
    );

    return {
      notesMetadata,
      foldersMetadata,
      exportMetadata
    };
  }

  /**
   * Extract metadata from a single note
   */
  private static async extractNoteMetadata(
    note: AppleNote,
    options: MetadataPreservationOptions
  ): Promise<AppleNotesMetadata> {
    const metadata: AppleNotesMetadata = {
      noteId: note.id,
      title: note.title || 'Untitled Note',
      folder: note.folder || 'Default',
      folderPath: this.extractFolderPath(note.folder),
      created: options.preserveTimestamps ? note.created : new Date(),
      modified: options.preserveTimestamps ? note.modified : new Date(),
      tags: options.preserveTags ? note.tags : [],
      isPinned: note.isPinned,
      isLocked: note.isLocked,
      color: options.preserveColors ? this.extractNoteColor(note) : undefined,
      icon: this.extractNoteIcon(note),
      source: 'apple_notes',
      exportDate: new Date(),
      originalFormat: 'html', // Will be set by caller
      contentHash: options.generateHashes ? await this.generateContentHash(note.content) : '',
      metadataHash: options.generateHashes ? await this.generateMetadataHash(note) : '',
      customFields: options.preserveCustomFields ? this.extractCustomFields(note) : {}
    };

    return metadata;
  }

  /**
   * Extract folder path as array
   */
  private static extractFolderPath(folderName: string): string[] {
    if (!folderName) return ['Default'];
    
    const pathParts = folderName.split('/').map(part => part.trim()).filter(part => part);
    return pathParts.length > 0 ? pathParts : ['Default'];
  }

  /**
   * Extract note color
   */
  private static extractNoteColor(note: AppleNote): string | undefined {
    // Look for color indicators in note content or title
    const content = (note.title + ' ' + note.content).toLowerCase();
    
    const colorPatterns = [
      { pattern: /red|🔴/, color: '#ff3b30' },
      { pattern: /orange|🟠/, color: '#ff9500' },
      { pattern: /yellow|🟡/, color: '#ffcc00' },
      { pattern: /green|🟢/, color: '#34c759' },
      { pattern: /blue|🔵/, color: '#007aff' },
      { pattern: /purple|🟣/, color: '#af52de' },
      { pattern: /pink|🩷/, color: '#ff2d92' },
      { pattern: /brown|🟤/, color: '#a2845e' },
      { pattern: /gray|grey|⚪/, color: '#8e8e93' }
    ];

    for (const { pattern, color } of colorPatterns) {
      if (pattern.test(content)) {
        return color;
      }
    }

    return undefined;
  }

  /**
   * Extract note icon
   */
  private static extractNoteIcon(note: AppleNote): string | undefined {
    const content = (note.title + ' ' + note.content).toLowerCase();
    
    const iconPatterns = [
      { pattern: /recipe|cook|food|🍳/, icon: '🍳' },
      { pattern: /work|business|💼/, icon: '💼' },
      { pattern: /personal|private|🔒/, icon: '🔒' },
      { pattern: /shared|collaboration|👥/, icon: '👥' },
      { pattern: /important|priority|⭐/, icon: '⭐' },
      { pattern: /archive|old|📦/, icon: '📦' },
      { pattern: /draft|temp|📝/, icon: '📝' },
      { pattern: /favorite|star|❤️/, icon: '❤️' },
      { pattern: /note|memo|📄/, icon: '📄' }
    ];

    for (const { pattern, icon } of iconPatterns) {
      if (pattern.test(content)) {
        return icon;
      }
    }

    return undefined;
  }

  /**
   * Generate content hash
   */
  private static async generateContentHash(content: string): Promise<string> {
    // Simple hash function for content
    let hash = 0;
    if (content.length === 0) return hash.toString();
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate metadata hash
   */
  private static async generateMetadataHash(note: AppleNote): Promise<string> {
    const metadataString = JSON.stringify({
      title: note.title,
      folder: note.folder,
      created: note.created,
      modified: note.modified,
      tags: note.tags,
      isPinned: note.isPinned,
      isLocked: note.isLocked
    });
    
    return this.generateContentHash(metadataString);
  }

  /**
   * Extract custom fields from note
   */
  private static extractCustomFields(note: AppleNote): Record<string, any> {
    const customFields: Record<string, any> = {};

    // Extract potential custom fields from content
    const content = note.content;
    
    // Look for key-value patterns
    const keyValuePattern = /([A-Za-z\s]+):\s*([^\n]+)/g;
    let match;
    while ((match = keyValuePattern.exec(content)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      
      // Skip common fields that are already captured
      if (!['title', 'folder', 'created', 'modified', 'tags'].includes(key)) {
        customFields[key] = value;
      }
    }

    // Extract hashtags as custom fields
    const hashtagPattern = /#(\w+)/g;
    const hashtags: string[] = [];
    while ((match = hashtagPattern.exec(content)) !== null) {
      hashtags.push(match[1]);
    }
    if (hashtags.length > 0) {
      customFields.hashtags = hashtags;
    }

    // Extract URLs as custom fields
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls: string[] = [];
    while ((match = urlPattern.exec(content)) !== null) {
      urls.push(match[0]);
    }
    if (urls.length > 0) {
      customFields.urls = urls;
    }

    return customFields;
  }

  /**
   * Extract folders metadata
   */
  private static extractFoldersMetadata(
    folderStructure: any,
    options: MetadataPreservationOptions
  ): FolderMetadata[] {
    const foldersMetadata: FolderMetadata[] = [];

    if (!folderStructure || !folderStructure.allFolders) {
      return foldersMetadata;
    }

    folderStructure.allFolders.forEach((folder: AppleNotesFolder) => {
      const metadata: FolderMetadata = {
        folderId: folder.id,
        name: folder.name,
        path: folder.path,
        parentId: folder.parentId,
        noteCount: folder.noteCount,
        created: options.preserveTimestamps ? folder.created : new Date(),
        modified: options.preserveTimestamps ? folder.modified : new Date(),
        color: options.preserveColors ? folder.color : undefined,
        icon: folder.icon,
        isSystem: folder.isSystem,
        children: folder.children.map(child => child.id),
        metadataHash: '' // Will be set later if needed
      };

      foldersMetadata.push(metadata);
    });

    return foldersMetadata;
  }

  /**
   * Generate folder metadata hash
   */
  private static async generateFolderMetadataHash(folder: AppleNotesFolder): Promise<string> {
    const metadataString = JSON.stringify({
      name: folder.name,
      path: folder.path,
      parentId: folder.parentId,
      noteCount: folder.noteCount,
      created: folder.created,
      modified: folder.modified,
      color: folder.color,
      icon: folder.icon,
      isSystem: folder.isSystem
    });
    
    return this.generateContentHash(metadataString);
  }

  /**
   * Create export metadata
   */
  private static createExportMetadata(
    fileName: string,
    fileSize: number,
    format: 'html' | 'txt',
    notes: AppleNote[],
    folderStructure: any,
    options: MetadataPreservationOptions
  ): ExportMetadata {
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metadata: ExportMetadata = {
      exportId,
      fileName,
      fileSize,
      exportDate: new Date(),
      format,
      totalNotes: notes.length,
      totalFolders: folderStructure?.totalFolders || 0,
      totalImages: notes.reduce((sum, note) => sum + (note.images?.length || 0), 0),
      version: this.extractVersion(folderStructure),
      deviceInfo: options.includeDeviceInfo ? this.extractDeviceInfo() : undefined,
      customFields: {}
    };

    return metadata;
  }

  /**
   * Extract version information
   */
  private static extractVersion(folderStructure: any): string | undefined {
    // This would typically be extracted from the export file
    // For now, return a default version
    return '1.0.0';
  }

  /**
   * Extract device information
   */
  private static extractDeviceInfo(): {
    device: string;
    os: string;
    appVersion: string;
  } | undefined {
    // This would typically be extracted from the export file
    // For now, return undefined
    return undefined;
  }

  /**
   * Save metadata to storage
   */
  static async saveMetadata(
    metadata: {
      notesMetadata: AppleNotesMetadata[];
      foldersMetadata: FolderMetadata[];
      exportMetadata: ExportMetadata;
    },
    storageKey: string
  ): Promise<void> {
    try {
      // In a real implementation, this would save to a database
      // For now, we'll just log the metadata
      console.log('Saving metadata:', {
        storageKey,
        notesCount: metadata.notesMetadata.length,
        foldersCount: metadata.foldersMetadata.length,
        exportId: metadata.exportMetadata.exportId
      });
    } catch (error) {
      console.error('Failed to save metadata:', error);
      throw error;
    }
  }

  /**
   * Load metadata from storage
   */
  static async loadMetadata(storageKey: string): Promise<{
    notesMetadata: AppleNotesMetadata[];
    foldersMetadata: FolderMetadata[];
    exportMetadata: ExportMetadata;
  } | null> {
    try {
      // In a real implementation, this would load from a database
      // For now, return null
      return null;
    } catch (error) {
      console.error('Failed to load metadata:', error);
      return null;
    }
  }

  /**
   * Get metadata summary
   */
  static getMetadataSummary(metadata: {
    notesMetadata: AppleNotesMetadata[];
    foldersMetadata: FolderMetadata[];
    exportMetadata: ExportMetadata;
  }): string {
    const { notesMetadata, foldersMetadata, exportMetadata } = metadata;
    
    let summary = `📋 Metadata Summary\n\n`;
    summary += `📁 Export Information:\n`;
    summary += `• Export ID: ${exportMetadata.exportId}\n`;
    summary += `• File: ${exportMetadata.fileName}\n`;
    summary += `• Format: ${exportMetadata.format.toUpperCase()}\n`;
    summary += `• Size: ${(exportMetadata.fileSize / 1024 / 1024).toFixed(2)}MB\n`;
    summary += `• Export Date: ${exportMetadata.exportDate.toLocaleDateString()}\n\n`;
    
    summary += `📊 Statistics:\n`;
    summary += `• Total Notes: ${exportMetadata.totalNotes}\n`;
    summary += `• Total Folders: ${exportMetadata.totalFolders}\n`;
    summary += `• Total Images: ${exportMetadata.totalImages}\n\n`;
    
    summary += `🏷️  Notes with Tags: ${notesMetadata.filter(n => n.tags.length > 0).length}\n`;
    summary += `📌 Pinned Notes: ${notesMetadata.filter(n => n.isPinned).length}\n`;
    summary += `🔒 Locked Notes: ${notesMetadata.filter(n => n.isLocked).length}\n`;
    summary += `🎨 Colored Notes: ${notesMetadata.filter(n => n.color).length}\n`;
    summary += `📱 Notes with Icons: ${notesMetadata.filter(n => n.icon).length}\n`;
    
    return summary;
  }

  /**
   * Validate metadata integrity
   */
  static validateMetadataIntegrity(metadata: {
    notesMetadata: AppleNotesMetadata[];
    foldersMetadata: FolderMetadata[];
    exportMetadata: ExportMetadata;
  }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate notes metadata
    metadata.notesMetadata.forEach((noteMeta, index) => {
      if (!noteMeta.noteId) {
        errors.push(`Note ${index}: Missing note ID`);
      }
      if (!noteMeta.title) {
        warnings.push(`Note ${index}: Missing title`);
      }
      if (!noteMeta.created || isNaN(noteMeta.created.getTime())) {
        errors.push(`Note ${index}: Invalid creation date`);
      }
      if (!noteMeta.modified || isNaN(noteMeta.modified.getTime())) {
        errors.push(`Note ${index}: Invalid modification date`);
      }
    });

    // Validate folders metadata
    metadata.foldersMetadata.forEach((folderMeta, index) => {
      if (!folderMeta.folderId) {
        errors.push(`Folder ${index}: Missing folder ID`);
      }
      if (!folderMeta.name) {
        errors.push(`Folder ${index}: Missing name`);
      }
    });

    // Validate export metadata
    if (!metadata.exportMetadata.exportId) {
      errors.push('Missing export ID');
    }
    if (!metadata.exportMetadata.fileName) {
      errors.push('Missing file name');
    }
    if (metadata.exportMetadata.fileSize <= 0) {
      errors.push('Invalid file size');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 