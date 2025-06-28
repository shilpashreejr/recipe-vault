import { JSDOM } from 'jsdom';

export interface AppleNote {
  id: string;
  title: string;
  content: string;
  folder: string;
  created: Date;
  modified: Date;
  images: AppleNoteImage[];
  attachments: AppleNoteAttachment[];
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
}

export interface AppleNoteImage {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface AppleNoteAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Buffer;
}

export interface AppleNotesExport {
  notes: AppleNote[];
  folders: string[];
  totalNotes: number;
  exportDate: Date;
}

export class AppleNotesParser {
  /**
   * Parse Apple Notes export file (.html format)
   */
  static async parseHtmlExport(htmlContent: string): Promise<AppleNotesExport> {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    const notes: AppleNote[] = [];
    const folders = new Set<string>();
    
    // Find all note elements
    const noteElements = document.querySelectorAll('.note, [data-note-id]');
    
    for (const noteElement of noteElements) {
      try {
        const note = this.parseNoteElement(noteElement as Element);
        if (note) {
          notes.push(note);
          if (note.folder) {
            folders.add(note.folder);
          }
        }
      } catch (error) {
        console.error('Failed to parse note element:', error);
      }
    }
    
    return {
      notes,
      folders: Array.from(folders),
      totalNotes: notes.length,
      exportDate: new Date()
    };
  }
  
  /**
   * Parse Apple Notes export file (.txt format)
   */
  static async parseTxtExport(txtContent: string): Promise<AppleNotesExport> {
    const notes: AppleNote[] = [];
    const folders = new Set<string>();
    
    // Split content by note separators
    const noteBlocks = txtContent.split(/\n\s*={3,}\s*\n/);
    
    for (const block of noteBlocks) {
      if (block.trim()) {
        try {
          const note = this.parseTxtNoteBlock(block);
          if (note) {
            notes.push(note);
            if (note.folder) {
              folders.add(note.folder);
            }
          }
        } catch (error) {
          console.error('Failed to parse text note block:', error);
        }
      }
    }
    
    return {
      notes,
      folders: Array.from(folders),
      totalNotes: notes.length,
      exportDate: new Date()
    };
  }
  
  /**
   * Parse a single note element from HTML
   */
  private static parseNoteElement(element: Element): AppleNote | null {
    const noteId = element.getAttribute('data-note-id') || 
                   element.getAttribute('id') || 
                   `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract title
    const titleElement = element.querySelector('.note-title, h1, h2, .title');
    const title = titleElement?.textContent?.trim() || 'Untitled Note';
    
    // Extract content
    const contentElement = element.querySelector('.note-content, .content, .body');
    const content = contentElement?.innerHTML || element.innerHTML;
    
    // Extract folder
    const folderElement = element.querySelector('.folder, .category, [data-folder]');
    const folder = folderElement?.textContent?.trim() || 
                   folderElement?.getAttribute('data-folder') || 
                   'Default';
    
    // Extract images
    const images: AppleNoteImage[] = [];
    const imgElements = element.querySelectorAll('img');
    imgElements.forEach((img, index) => {
      images.push({
        id: `img_${noteId}_${index}`,
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        width: img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : undefined,
        height: img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : undefined,
      });
    });
    
    // Extract metadata
    const created = this.extractDate(element, '.created, .date-created, [data-created]') || new Date();
    const modified = this.extractDate(element, '.modified, .date-modified, [data-modified]') || new Date();
    
    // Extract tags
    const tags: string[] = [];
    const tagElements = element.querySelectorAll('.tag, .label, [data-tag]');
    tagElements.forEach(tag => {
      const tagText = tag.textContent?.trim();
      if (tagText) {
        tags.push(tagText);
      }
    });
    
    // Extract flags
    const isPinned = element.querySelector('.pinned, .starred, [data-pinned]') !== null;
    const isLocked = element.querySelector('.locked, .secure, [data-locked]') !== null;
    
    return {
      id: noteId,
      title,
      content,
      folder,
      created,
      modified,
      images,
      attachments: [], // Attachments would need special handling
      tags,
      isPinned,
      isLocked
    };
  }
  
  /**
   * Parse a single note block from text format
   */
  private static parseTxtNoteBlock(block: string): AppleNote | null {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) return null;
    
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract title (first line)
    const title = lines[0] || 'Untitled Note';
    
    // Extract folder (look for folder indicator)
    let folder = 'Default';
    let contentStartIndex = 1;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('Folder:') || line.startsWith('Category:')) {
        folder = line.split(':')[1]?.trim() || 'Default';
        contentStartIndex = i + 1;
        break;
      }
    }
    
    // Extract content (remaining lines)
    const content = lines.slice(contentStartIndex).join('\n');
    
    // Extract tags (look for tag indicators)
    const tags: string[] = [];
    const tagMatches = content.match(/#(\w+)/g);
    if (tagMatches) {
      tags.push(...tagMatches.map(tag => tag.substring(1)));
    }
    
    return {
      id: noteId,
      title,
      content,
      folder,
      created: new Date(),
      modified: new Date(),
      images: [],
      attachments: [],
      tags,
      isPinned: false,
      isLocked: false
    };
  }
  
  /**
   * Extract date from element
   */
  private static extractDate(element: Element, selector: string): Date | null {
    const dateElement = element.querySelector(selector);
    if (!dateElement) return null;
    
    const dateText = dateElement.textContent?.trim() || 
                     dateElement.getAttribute('datetime') ||
                     dateElement.getAttribute('data-date');
    
    if (!dateText) return null;
    
    const date = new Date(dateText);
    return isNaN(date.getTime()) ? null : date;
  }
  
  /**
   * Detect export format from content
   */
  static detectFormat(content: string): 'html' | 'txt' | 'unknown' {
    if (content.includes('<html') || content.includes('<body') || content.includes('<div')) {
      return 'html';
    }
    
    if (content.includes('===') || content.includes('---') || content.includes('***')) {
      return 'txt';
    }
    
    return 'unknown';
  }
  
  /**
   * Validate Apple Notes export file
   */
  static validateExport(content: string): { isValid: boolean; format: string; error?: string } {
    const format = this.detectFormat(content);
    
    if (format === 'unknown') {
      return {
        isValid: false,
        format: 'unknown',
        error: 'Unable to detect export format. Please ensure this is a valid Apple Notes export file.'
      };
    }
    
    if (format === 'html') {
      if (!content.includes('note') && !content.includes('data-note-id')) {
        return {
          isValid: false,
          format: 'html',
          error: 'HTML file does not appear to contain Apple Notes data.'
        };
      }
    }
    
    if (format === 'txt') {
      if (content.trim().length < 10) {
        return {
          isValid: false,
          format: 'txt',
          error: 'Text file appears to be empty or too short to be a valid Apple Notes export.'
        };
      }
    }
    
    return {
      isValid: true,
      format
    };
  }
} 