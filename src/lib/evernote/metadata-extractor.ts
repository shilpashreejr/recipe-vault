import { EvernoteNote } from './evernote-service';

export interface NoteMetadata {
  guid: string;
  title: string;
  created: number;
  updated: number;
  notebookGuid?: string;
  notebookName?: string;
  tags: string[];
  author?: string;
  source?: string;
  sourceURL?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  reminderOrder?: number;
  reminderDoneTime?: number;
  reminderTime?: number;
  placeName?: string;
  contentClass?: string;
  applicationData?: any;
  lastEditedBy?: string;
  classifications?: any;
  creatorId?: number;
  lastEditorId?: number;
  sharedWithBusiness?: boolean;
  conflictSourceNoteGuid?: string;
  noteTitleQuality?: number;
}

export class MetadataExtractor {
  /**
   * Extract metadata from Evernote note
   */
  static extractMetadata(note: EvernoteNote, notebookName?: string): NoteMetadata {
    const metadata: NoteMetadata = {
      guid: note.guid,
      title: note.title,
      created: note.created,
      updated: note.updated,
      notebookGuid: note.notebookGuid,
      notebookName,
      tags: [],
      author: undefined,
      source: undefined,
      sourceURL: undefined,
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      reminderOrder: undefined,
      reminderDoneTime: undefined,
      reminderTime: undefined,
      placeName: undefined,
      contentClass: undefined,
      applicationData: undefined,
      lastEditedBy: undefined,
      classifications: undefined,
      creatorId: undefined,
      lastEditorId: undefined,
      sharedWithBusiness: undefined,
      conflictSourceNoteGuid: undefined,
      noteTitleQuality: undefined,
    };

    // Extract attributes if available
    if (note.attributes) {
      metadata.author = note.attributes.author;
      metadata.sourceURL = note.attributes.sourceURL;
      metadata.latitude = note.attributes.latitude;
      metadata.longitude = note.attributes.longitude;
      metadata.altitude = note.attributes.altitude;
      metadata.reminderOrder = note.attributes.reminderOrder;
      metadata.reminderDoneTime = note.attributes.reminderDoneTime;
      metadata.reminderTime = note.attributes.reminderTime;
      metadata.placeName = note.attributes.placeName;
      metadata.contentClass = note.attributes.contentClass;
      metadata.applicationData = note.attributes.applicationData;
      metadata.lastEditedBy = note.attributes.lastEditedBy;
      metadata.classifications = note.attributes.classifications;
      metadata.creatorId = note.attributes.creatorId;
      metadata.lastEditorId = note.attributes.lastEditorId;
      metadata.sharedWithBusiness = note.attributes.sharedWithBusiness;
      metadata.conflictSourceNoteGuid = note.attributes.conflictSourceNoteGuid;
      metadata.noteTitleQuality = note.attributes.noteTitleQuality;
    }

    // Extract tags if available
    if (note.tagGuids && note.tagGuids.length > 0) {
      // In a real implementation, you'd need to fetch tag names from Evernote
      // For now, we'll just store the GUIDs
      metadata.tags = note.tagGuids;
    }

    return metadata;
  }

  /**
   * Extract tags from note content using common patterns
   */
  static extractTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    
    // Look for hashtags
    const hashtagPattern = /#(\w+)/g;
    let match;
    while ((match = hashtagPattern.exec(content)) !== null) {
      tags.push(match[1]);
    }
    
    // Look for tag patterns like [tag] or (tag)
    const bracketTagPattern = /[\[\(](\w+)[\]\)]/g;
    while ((match = bracketTagPattern.exec(content)) !== null) {
      tags.push(match[1]);
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Extract source information from note content
   */
  static extractSourceInfo(content: string): { source?: string; sourceURL?: string } {
    const sourceInfo: { source?: string; sourceURL?: string } = {};
    
    // Look for URL patterns
    const urlPattern = /https?:\/\/[^\s<>"]+/g;
    const urls = content.match(urlPattern);
    if (urls && urls.length > 0) {
      sourceInfo.sourceURL = urls[0];
      
      // Try to extract domain as source
      try {
        const url = new URL(urls[0]);
        sourceInfo.source = url.hostname.replace('www.', '');
      } catch (e) {
        // Invalid URL, ignore
      }
    }
    
    // Look for common source indicators
    const sourcePatterns = [
      /source:\s*([^\n]+)/i,
      /from:\s*([^\n]+)/i,
      /recipe from:\s*([^\n]+)/i,
      /adapted from:\s*([^\n]+)/i,
    ];
    
    for (const pattern of sourcePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        sourceInfo.source = match[1].trim();
        break;
      }
    }
    
    return sourceInfo;
  }

  /**
   * Extract location information from note content
   */
  static extractLocationInfo(content: string): { placeName?: string; latitude?: number; longitude?: number } {
    const locationInfo: { placeName?: string; latitude?: number; longitude?: number } = {};
    
    // Look for location patterns
    const locationPatterns = [
      /location:\s*([^\n]+)/i,
      /place:\s*([^\n]+)/i,
      /restaurant:\s*([^\n]+)/i,
      /cafe:\s*([^\n]+)/i,
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        locationInfo.placeName = match[1].trim();
        break;
      }
    }
    
    // Look for coordinates
    const coordPattern = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const coordMatch = content.match(coordPattern);
    if (coordMatch) {
      locationInfo.latitude = parseFloat(coordMatch[1]);
      locationInfo.longitude = parseFloat(coordMatch[2]);
    }
    
    return locationInfo;
  }

  /**
   * Extract date information from note content
   */
  static extractDateInfo(content: string): { created?: Date; updated?: Date } {
    const dateInfo: { created?: Date; updated?: Date } = {};
    
    // Look for date patterns
    const datePatterns = [
      /created:\s*([^\n]+)/i,
      /date:\s*([^\n]+)/i,
      /when:\s*([^\n]+)/i,
    ];
    
    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          dateInfo.created = date;
          break;
        }
      }
    }
    
    return dateInfo;
  }

  /**
   * Extract author information from note content
   */
  static extractAuthorInfo(content: string): { author?: string; lastEditedBy?: string } {
    const authorInfo: { author?: string; lastEditedBy?: string } = {};
    
    // Look for author patterns
    const authorPatterns = [
      /author:\s*([^\n]+)/i,
      /by:\s*([^\n]+)/i,
      /chef:\s*([^\n]+)/i,
      /recipe by:\s*([^\n]+)/i,
    ];
    
    for (const pattern of authorPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        authorInfo.author = match[1].trim();
        break;
      }
    }
    
    return authorInfo;
  }
} 