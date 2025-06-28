import { AppleNote } from './apple-notes-parser';

export interface AppleNotesFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  children: AppleNotesFolder[];
  noteCount: number;
  notes: AppleNote[];
  created: Date;
  modified: Date;
  isSystem: boolean;
  color?: string;
  icon?: string;
}

export interface FolderStructure {
  rootFolders: AppleNotesFolder[];
  allFolders: Map<string, AppleNotesFolder>;
  totalFolders: number;
  totalNotes: number;
  maxDepth: number;
}

export class AppleNotesFolderParser {
  /**
   * Parse folder structure from Apple Notes export
   */
  static parseFolderStructure(notes: AppleNote[]): FolderStructure {
    const allFolders = new Map<string, AppleNotesFolder>();
    const rootFolders: AppleNotesFolder[] = [];
    
    // Group notes by folder
    const notesByFolder = new Map<string, AppleNote[]>();
    
    notes.forEach(note => {
      const folderName = note.folder || 'Default';
      if (!notesByFolder.has(folderName)) {
        notesByFolder.set(folderName, []);
      }
      notesByFolder.get(folderName)!.push(note);
    });
    
    // Create folder objects
    notesByFolder.forEach((folderNotes, folderName) => {
      const folder = this.createFolder(folderName, folderNotes);
      allFolders.set(folder.id, folder);
    });
    
    // Build folder hierarchy
    this.buildFolderHierarchy(allFolders);
    
    // Find root folders
    allFolders.forEach(folder => {
      if (!folder.parentId) {
        rootFolders.push(folder);
      }
    });
    
    // Calculate statistics
    const totalNotes = notes.length;
    const maxDepth = this.calculateMaxDepth(rootFolders);
    
    return {
      rootFolders,
      allFolders,
      totalFolders: allFolders.size,
      totalNotes,
      maxDepth
    };
  }
  
  /**
   * Create a folder object from folder name and notes
   */
  private static createFolder(name: string, notes: AppleNote[]): AppleNotesFolder {
    const folderId = this.generateFolderId(name);
    const path = this.parseFolderPath(name);
    
    // Calculate folder metadata
    const created = this.getEarliestDate(notes.map(note => note.created));
    const modified = this.getLatestDate(notes.map(note => note.modified));
    const isSystem = this.isSystemFolder(name);
    
    return {
      id: folderId,
      name: this.getFolderDisplayName(name),
      path: path,
      children: [],
      noteCount: notes.length,
      notes: notes,
      created,
      modified,
      isSystem,
      color: this.extractFolderColor(name),
      icon: this.extractFolderIcon(name)
    };
  }
  
  /**
   * Generate unique folder ID
   */
  private static generateFolderId(name: string): string {
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `folder_${sanitizedName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Parse folder path to detect hierarchy
   */
  private static parseFolderPath(folderName: string): string {
    // Handle common Apple Notes folder naming patterns
    const pathParts = folderName.split('/').map(part => part.trim()).filter(part => part);
    
    if (pathParts.length === 1) {
      return pathParts[0];
    }
    
    return pathParts.join('/');
  }
  
  /**
   * Get folder display name (remove system prefixes, etc.)
   */
  private static getFolderDisplayName(name: string): string {
    // Remove common system prefixes
    const systemPrefixes = ['📁', '📂', '📄', '📝', '📌', '🏷️', '⭐'];
    let displayName = name;
    
    systemPrefixes.forEach(prefix => {
      if (displayName.startsWith(prefix)) {
        displayName = displayName.substring(prefix.length).trim();
      }
    });
    
    // Handle nested folder names
    const pathParts = displayName.split('/');
    return pathParts[pathParts.length - 1] || displayName;
  }
  
  /**
   * Check if folder is a system folder
   */
  private static isSystemFolder(name: string): boolean {
    const systemFolders = [
      'Default',
      'All Notes',
      'Recently Deleted',
      'Trash',
      'Drafts',
      'Archive',
      'Shared',
      'iCloud',
      'On My iPhone',
      'On My iPad',
      'On My Mac'
    ];
    
    return systemFolders.some(systemFolder => 
      name.toLowerCase().includes(systemFolder.toLowerCase())
    );
  }
  
  /**
   * Extract folder color from name or metadata
   */
  private static extractFolderColor(name: string): string | undefined {
    // Look for color indicators in folder name
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
      if (pattern.test(name.toLowerCase())) {
        return color;
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract folder icon from name or metadata
   */
  private static extractFolderIcon(name: string): string | undefined {
    // Look for icon indicators in folder name
    const iconPatterns = [
      { pattern: /recipe|cook|food|🍳/, icon: '🍳' },
      { pattern: /work|business|💼/, icon: '💼' },
      { pattern: /personal|private|🔒/, icon: '🔒' },
      { pattern: /shared|collaboration|👥/, icon: '👥' },
      { pattern: /important|priority|⭐/, icon: '⭐' },
      { pattern: /archive|old|📦/, icon: '📦' },
      { pattern: /draft|temp|📝/, icon: '📝' },
      { pattern: /favorite|star|❤️/, icon: '❤️' }
    ];
    
    for (const { pattern, icon } of iconPatterns) {
      if (pattern.test(name.toLowerCase())) {
        return icon;
      }
    }
    
    return undefined;
  }
  
  /**
   * Build folder hierarchy from flat folder list
   */
  private static buildFolderHierarchy(allFolders: Map<string, AppleNotesFolder>): void {
    const folders = Array.from(allFolders.values());
    
    // Sort folders by path depth (shallowest first)
    folders.sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      return aDepth - bDepth;
    });
    
    // Build parent-child relationships
    folders.forEach(folder => {
      const pathParts = folder.path.split('/');
      
      if (pathParts.length > 1) {
        // This is a nested folder
        const parentPath = pathParts.slice(0, -1).join('/');
        const parentFolder = this.findFolderByPath(folders, parentPath);
        
        if (parentFolder) {
          folder.parentId = parentFolder.id;
          parentFolder.children.push(folder);
        }
      }
    });
  }
  
  /**
   * Find folder by path
   */
  private static findFolderByPath(folders: AppleNotesFolder[], path: string): AppleNotesFolder | undefined {
    return folders.find(folder => folder.path === path);
  }
  
  /**
   * Calculate maximum folder depth
   */
  private static calculateMaxDepth(folders: AppleNotesFolder[]): number {
    let maxDepth = 0;
    
    const calculateDepth = (folder: AppleNotesFolder, currentDepth: number): void => {
      maxDepth = Math.max(maxDepth, currentDepth);
      
      folder.children.forEach(child => {
        calculateDepth(child, currentDepth + 1);
      });
    };
    
    folders.forEach(folder => {
      calculateDepth(folder, 1);
    });
    
    return maxDepth;
  }
  
  /**
   * Get earliest date from array of dates
   */
  private static getEarliestDate(dates: Date[]): Date {
    if (dates.length === 0) return new Date();
    return new Date(Math.min(...dates.map(date => date.getTime())));
  }
  
  /**
   * Get latest date from array of dates
   */
  private static getLatestDate(dates: Date[]): Date {
    if (dates.length === 0) return new Date();
    return new Date(Math.max(...dates.map(date => date.getTime())));
  }
  
  /**
   * Get folder statistics
   */
  static getFolderStats(structure: FolderStructure): {
    totalFolders: number;
    totalNotes: number;
    maxDepth: number;
    systemFolders: number;
    userFolders: number;
    emptyFolders: number;
    averageNotesPerFolder: number;
    folderDistribution: Record<string, number>;
  } {
    const folders = Array.from(structure.allFolders.values());
    
    const systemFolders = folders.filter(folder => folder.isSystem).length;
    const userFolders = folders.filter(folder => !folder.isSystem).length;
    const emptyFolders = folders.filter(folder => folder.noteCount === 0).length;
    const averageNotesPerFolder = structure.totalNotes / structure.totalFolders;
    
    // Calculate folder distribution by depth
    const folderDistribution: Record<string, number> = {};
    folders.forEach(folder => {
      const depth = folder.path.split('/').length;
      const depthKey = `depth_${depth}`;
      folderDistribution[depthKey] = (folderDistribution[depthKey] || 0) + 1;
    });
    
    return {
      totalFolders: structure.totalFolders,
      totalNotes: structure.totalNotes,
      maxDepth: structure.maxDepth,
      systemFolders,
      userFolders,
      emptyFolders,
      averageNotesPerFolder,
      folderDistribution
    };
  }
  
  /**
   * Find folder by ID
   */
  static findFolderById(structure: FolderStructure, folderId: string): AppleNotesFolder | undefined {
    return structure.allFolders.get(folderId);
  }
  
  /**
   * Find folder by name
   */
  static findFolderByName(structure: FolderStructure, name: string): AppleNotesFolder | undefined {
    return Array.from(structure.allFolders.values()).find(folder => 
      folder.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  /**
   * Get all notes from a folder and its subfolders
   */
  static getAllNotesFromFolder(folder: AppleNotesFolder): AppleNote[] {
    const allNotes: AppleNote[] = [...folder.notes];
    
    folder.children.forEach(child => {
      allNotes.push(...this.getAllNotesFromFolder(child));
    });
    
    return allNotes;
  }
  
  /**
   * Get folder path as array
   */
  static getFolderPathArray(folder: AppleNotesFolder, structure: FolderStructure): string[] {
    const path: string[] = [folder.name];
    let currentFolder = folder;
    
    while (currentFolder.parentId) {
      const parent = structure.allFolders.get(currentFolder.parentId);
      if (parent) {
        path.unshift(parent.name);
        currentFolder = parent;
      } else {
        break;
      }
    }
    
    return path;
  }
} 