import { JSDOM } from 'jsdom';
import { AppleNote, AppleNoteImage, AppleNoteAttachment } from './apple-notes-parser';

export interface AppleNotesHtmlStructure {
  notes: AppleNote[];
  folders: string[];
  metadata: {
    exportDate: Date;
    totalNotes: number;
    totalFolders: number;
    version?: string;
  };
}

export class AppleNotesHtmlParser {
  /**
   * Parse Apple Notes HTML export with enhanced structure detection
   */
  static async parseHtmlExport(htmlContent: string): Promise<AppleNotesHtmlStructure> {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    const notes: AppleNote[] = [];
    const folders = new Set<string>();
    
    // Try multiple selectors for Apple Notes structure
    const noteSelectors = [
      '.note',
      '[data-note-id]',
      '.apple-notes-note',
      '.notes-note',
      'div[class*="note"]',
      'article',
      '.entry'
    ];
    
    let noteElements: Element[] = [];
    
    // Find notes using different selectors
    for (const selector of noteSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        noteElements = Array.from(elements);
        break;
      }
    }
    
    // If no specific note elements found, try to parse the entire document
    if (noteElements.length === 0) {
      noteElements = this.extractNotesFromDocument(document);
    }
    
    // Parse each note
    for (const noteElement of noteElements) {
      try {
        const note = this.parseNoteElement(noteElement);
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
    
    // Extract metadata
    const metadata = this.extractMetadata(document);
    
    return {
      notes,
      folders: Array.from(folders),
      metadata: {
        exportDate: metadata.exportDate || new Date(),
        totalNotes: notes.length,
        totalFolders: folders.size,
        version: metadata.version || undefined
      }
    };
  }
  
  /**
   * Extract notes from document when no specific structure is found
   */
  private static extractNotesFromDocument(document: Document): Element[] {
    const notes: Element[] = [];
    
    // Look for potential note containers
    const potentialContainers = document.querySelectorAll('div, section, article');
    
    for (const container of potentialContainers) {
      // Check if this looks like a note container
      if (this.looksLikeNoteContainer(container)) {
        notes.push(container);
      }
    }
    
    return notes;
  }
  
  /**
   * Check if an element looks like a note container
   */
  private static looksLikeNoteContainer(element: Element): boolean {
    const text = element.textContent || '';
    const html = element.innerHTML || '';
    
    // Check for note-like content patterns
    const hasTitle = element.querySelector('h1, h2, h3, .title, .note-title');
    const hasContent = text.length > 50; // Reasonable content length
    const hasDate = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/.test(text);
    const hasList = element.querySelector('ul, ol, li');
    const hasImages = element.querySelector('img');
    
    // Score the likelihood of being a note
    let score = 0;
    if (hasTitle) score += 2;
    if (hasContent) score += 2;
    if (hasDate) score += 1;
    if (hasList) score += 1;
    if (hasImages) score += 1;
    
    // Check for Apple Notes specific patterns
    if (html.includes('apple-notes') || html.includes('notes-app')) score += 3;
    if (text.includes('Created:') || text.includes('Modified:')) score += 2;
    
    return score >= 3; // Threshold for considering it a note
  }
  
  /**
   * Parse a single note element with enhanced Apple Notes detection
   */
  private static parseNoteElement(element: Element): AppleNote | null {
    const noteId = this.extractNoteId(element);
    const title = this.extractTitle(element);
    const content = this.extractContent(element);
    const folder = this.extractFolder(element);
    const images = this.extractImages(element);
    const attachments = this.extractAttachments(element);
    const tags = this.extractTags(element);
    const metadata = this.extractNoteMetadata(element);
    
    if (!title && !content) {
      return null; // Skip empty notes
    }
    
    return {
      id: noteId,
      title: title || 'Untitled Note',
      content,
      folder: folder || 'Default',
      created: metadata.created,
      modified: metadata.modified,
      images,
      attachments,
      tags,
      isPinned: metadata.isPinned,
      isLocked: metadata.isLocked
    };
  }
  
  /**
   * Extract note ID with multiple fallback strategies
   */
  private static extractNoteId(element: Element): string {
    return element.getAttribute('data-note-id') || 
           element.getAttribute('id') || 
           element.getAttribute('data-id') ||
           `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Extract title with enhanced detection
   */
  private static extractTitle(element: Element): string {
    const titleSelectors = [
      '.note-title',
      '.title',
      'h1',
      'h2',
      'h3',
      '[class*="title"]',
      '[class*="heading"]',
      '.apple-notes-title'
    ];
    
    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
        const text = titleElement.textContent?.trim();
        if (text && text.length > 0) {
          return text;
        }
      }
    }
    
    // Fallback: look for first heading or strong text
    const firstHeading = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (firstHeading) {
      const text = firstHeading.textContent?.trim();
      if (text) return text;
    }
    
    const firstStrong = element.querySelector('strong, b');
    if (firstStrong) {
      const text = firstStrong.textContent?.trim();
      if (text) return text;
    }
    
    return '';
  }
  
  /**
   * Extract content with rich text preservation
   */
  private static extractContent(element: Element): string {
    // Try to find content container
    const contentSelectors = [
      '.note-content',
      '.content',
      '.body',
      '.text',
      '.description',
      '.apple-notes-content'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = element.querySelector(selector);
      if (contentElement) break;
    }
    
    // If no specific content container, use the element itself
    if (!contentElement) {
      contentElement = element;
    }
    
    // Remove title and metadata from content
    const titleSelectors = ['.note-title', '.title', 'h1', 'h2', 'h3'];
    const clone = contentElement.cloneNode(true) as Element;
    
    titleSelectors.forEach(selector => {
      const titleElement = clone.querySelector(selector);
      if (titleElement) {
        titleElement.remove();
      }
    });
    
    // Remove metadata elements
    const metadataSelectors = ['.metadata', '.date', '.created', '.modified'];
    metadataSelectors.forEach(selector => {
      const metadataElement = clone.querySelector(selector);
      if (metadataElement) {
        metadataElement.remove();
      }
    });
    
    return clone.innerHTML.trim();
  }
  
  /**
   * Extract folder information
   */
  private static extractFolder(element: Element): string {
    const folderSelectors = [
      '.folder',
      '.category',
      '.notebook',
      '[data-folder]',
      '[data-category]',
      '.apple-notes-folder'
    ];
    
    for (const selector of folderSelectors) {
      const folderElement = element.querySelector(selector);
      if (folderElement) {
        const text = folderElement.textContent?.trim();
        if (text) return text;
      }
    }
    
    // Look for folder in parent elements
    let parent = element.parentElement;
    while (parent) {
      const folderAttr = parent.getAttribute('data-folder') || 
                         parent.getAttribute('data-category') ||
                         parent.getAttribute('data-notebook');
      if (folderAttr) return folderAttr;
      
      const folderClass = parent.className;
      if (folderClass && folderClass.includes('folder')) {
        const text = parent.textContent?.trim();
        if (text) return text;
      }
      
      parent = parent.parentElement;
    }
    
    return '';
  }
  
  /**
   * Extract images with enhanced detection
   */
  private static extractImages(element: Element): AppleNoteImage[] {
    const images: AppleNoteImage[] = [];
    const imgElements = element.querySelectorAll('img');
    
    imgElements.forEach((img, index) => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      
      // Skip empty or invalid images
      if (!src || src.startsWith('data:')) return;
      
      images.push({
        id: `img_${Date.now()}_${index}`,
        src,
        alt,
        width: img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : undefined,
        height: img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : undefined,
      });
    });
    
    return images;
  }
  
  /**
   * Extract attachments (placeholder for future implementation)
   */
  private static extractAttachments(element: Element): AppleNoteAttachment[] {
    // This would need to handle actual file attachments
    // For now, return empty array
    return [];
  }
  
  /**
   * Extract tags with multiple detection methods
   */
  private static extractTags(element: Element): string[] {
    const tags: string[] = [];
    
    // Look for tag elements
    const tagSelectors = [
      '.tag',
      '.label',
      '[data-tag]',
      '.apple-notes-tag'
    ];
    
    tagSelectors.forEach(selector => {
      const tagElements = element.querySelectorAll(selector);
      tagElements.forEach(tag => {
        const tagText = tag.textContent?.trim();
        if (tagText) {
          tags.push(tagText);
        }
      });
    });
    
    // Look for hashtags in content
    const content = element.textContent || '';
    const hashtagMatches = content.match(/#(\w+)/g);
    if (hashtagMatches) {
      hashtagMatches.forEach(tag => {
        const tagText = tag.substring(1); // Remove #
        if (!tags.includes(tagText)) {
          tags.push(tagText);
        }
      });
    }
    
    return tags;
  }
  
  /**
   * Extract note metadata
   */
  private static extractNoteMetadata(element: Element): {
    created: Date;
    modified: Date;
    isPinned: boolean;
    isLocked: boolean;
  } {
    const created = this.extractDate(element, '.created, .date-created, [data-created]') || new Date();
    const modified = this.extractDate(element, '.modified, .date-modified, [data-modified]') || new Date();
    const isPinned = element.querySelector('.pinned, .starred, [data-pinned]') !== null;
    const isLocked = element.querySelector('.locked, .secure, [data-locked]') !== null;
    
    return {
      created,
      modified,
      isPinned,
      isLocked
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
   * Extract document metadata
   */
  private static extractMetadata(document: Document): {
    exportDate: Date | null;
    version: string | null;
  } {
    // Look for metadata in head or body
    const metaElements = document.querySelectorAll('meta');
    let exportDate: Date | null = null;
    let version: string | null = null;
    
    metaElements.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        if (name.includes('date') || name.includes('export')) {
          const date = new Date(content);
          if (!isNaN(date.getTime())) {
            exportDate = date;
          }
        }
        if (name.includes('version')) {
          version = content;
        }
      }
    });
    
    return { exportDate, version };
  }
} 