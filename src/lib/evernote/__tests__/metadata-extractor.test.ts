import { MetadataExtractor, NoteMetadata } from '../metadata-extractor';
import { EvernoteNote } from '../evernote-service';

describe('MetadataExtractor', () => {
  describe('extractMetadata', () => {
    it('should extract basic metadata from note', () => {
      const note: EvernoteNote = {
        guid: 'test-note-1',
        title: 'Test Recipe',
        content: '<en-note>Recipe content</en-note>',
        created: 1234567890,
        updated: 1234567891,
        notebookGuid: 'notebook-1',
        tagGuids: ['tag-1', 'tag-2'],
        attributes: {
          author: 'John Doe',
          sourceURL: 'https://example.com/recipe',
          latitude: 40.7128,
          longitude: -74.0060,
          placeName: 'New York',
        },
      };

      const metadata = MetadataExtractor.extractMetadata(note, 'Recipes');

      expect(metadata.guid).toBe('test-note-1');
      expect(metadata.title).toBe('Test Recipe');
      expect(metadata.created).toBe(1234567890);
      expect(metadata.updated).toBe(1234567891);
      expect(metadata.notebookGuid).toBe('notebook-1');
      expect(metadata.notebookName).toBe('Recipes');
      expect(metadata.tags).toEqual(['tag-1', 'tag-2']);
      expect(metadata.author).toBe('John Doe');
      expect(metadata.sourceURL).toBe('https://example.com/recipe');
      expect(metadata.latitude).toBe(40.7128);
      expect(metadata.longitude).toBe(-74.0060);
      expect(metadata.placeName).toBe('New York');
    });

    it('should handle note without attributes', () => {
      const note: EvernoteNote = {
        guid: 'test-note-2',
        title: 'Simple Note',
        content: '<en-note>Content</en-note>',
        created: 1234567890,
        updated: 1234567891,
      };

      const metadata = MetadataExtractor.extractMetadata(note);

      expect(metadata.guid).toBe('test-note-2');
      expect(metadata.title).toBe('Simple Note');
      expect(metadata.author).toBeUndefined();
      expect(metadata.sourceURL).toBeUndefined();
      expect(metadata.tags).toEqual([]);
    });
  });

  describe('extractTagsFromContent', () => {
    it('should extract hashtags from content', () => {
      const content = 'This is a #recipe with #italian #pasta';
      const tags = MetadataExtractor.extractTagsFromContent(content);
      expect(tags).toEqual(['recipe', 'italian', 'pasta']);
    });

    it('should extract bracket tags from content', () => {
      const content = 'This is a [recipe] with (italian) [pasta]';
      const tags = MetadataExtractor.extractTagsFromContent(content);
      expect(tags).toEqual(['recipe', 'italian', 'pasta']);
    });

    it('should remove duplicate tags', () => {
      const content = 'This is a #recipe with #recipe and #italian';
      const tags = MetadataExtractor.extractTagsFromContent(content);
      expect(tags).toEqual(['recipe', 'italian']);
    });

    it('should return empty array for content without tags', () => {
      const content = 'This is plain text without any tags';
      const tags = MetadataExtractor.extractTagsFromContent(content);
      expect(tags).toEqual([]);
    });
  });

  describe('extractSourceInfo', () => {
    it('should extract URL and domain from content', () => {
      const content = 'Recipe from https://www.example.com/recipe';
      const sourceInfo = MetadataExtractor.extractSourceInfo(content);
      expect(sourceInfo.sourceURL).toBe('https://www.example.com/recipe');
      expect(sourceInfo.source).toBe('example.com');
    });

    it('should extract source from text patterns', () => {
      const content = 'Recipe from: Food Network\nIngredients:...';
      const sourceInfo = MetadataExtractor.extractSourceInfo(content);
      expect(sourceInfo.source).toBe('Food Network');
    });

    it('should handle multiple source patterns', () => {
      const content = 'Adapted from: Chef John\nSource: Cookbook';
      const sourceInfo = MetadataExtractor.extractSourceInfo(content);
      expect(sourceInfo.source).toBe('Cookbook');
    });

    it('should return empty object for content without source info', () => {
      const content = 'Plain recipe content without source';
      const sourceInfo = MetadataExtractor.extractSourceInfo(content);
      expect(sourceInfo.source).toBeUndefined();
      expect(sourceInfo.sourceURL).toBeUndefined();
    });
  });

  describe('extractLocationInfo', () => {
    it('should extract location from text patterns', () => {
      const content = 'Location: Central Park\nRestaurant: Joe\'s Pizza';
      const locationInfo = MetadataExtractor.extractLocationInfo(content);
      expect(locationInfo.placeName).toBe('Central Park');
    });

    it('should extract coordinates from content', () => {
      const content = 'Coordinates: 40.7128, -74.0060';
      const locationInfo = MetadataExtractor.extractLocationInfo(content);
      expect(locationInfo.latitude).toBe(40.7128);
      expect(locationInfo.longitude).toBe(-74.0060);
    });

    it('should handle restaurant patterns', () => {
      const content = 'Restaurant: Le Bernardin\nCafe: Starbucks';
      const locationInfo = MetadataExtractor.extractLocationInfo(content);
      expect(locationInfo.placeName).toBe('Le Bernardin');
    });

    it('should return empty object for content without location info', () => {
      const content = 'Plain recipe content without location';
      const locationInfo = MetadataExtractor.extractLocationInfo(content);
      expect(locationInfo.placeName).toBeUndefined();
      expect(locationInfo.latitude).toBeUndefined();
      expect(locationInfo.longitude).toBeUndefined();
    });
  });

  describe('extractDateInfo', () => {
    it('should extract date from text patterns', () => {
      const content = 'Created: 2023-01-15\nDate: 2023-01-15';
      const dateInfo = MetadataExtractor.extractDateInfo(content);
      expect(dateInfo.created).toBeInstanceOf(Date);
      expect(dateInfo.created!.getFullYear()).toBe(2023);
    });

    it('should handle different date formats', () => {
      const content = 'When: January 15, 2023';
      const dateInfo = MetadataExtractor.extractDateInfo(content);
      expect(dateInfo.created).toBeInstanceOf(Date);
    });

    it('should return empty object for invalid dates', () => {
      const content = 'Created: invalid-date';
      const dateInfo = MetadataExtractor.extractDateInfo(content);
      expect(dateInfo.created).toBeUndefined();
    });

    it('should return empty object for content without date info', () => {
      const content = 'Plain recipe content without dates';
      const dateInfo = MetadataExtractor.extractDateInfo(content);
      expect(dateInfo.created).toBeUndefined();
      expect(dateInfo.updated).toBeUndefined();
    });
  });

  describe('extractAuthorInfo', () => {
    it('should extract author from text patterns', () => {
      const content = 'Author: Julia Child\nChef: Gordon Ramsay';
      const authorInfo = MetadataExtractor.extractAuthorInfo(content);
      expect(authorInfo.author).toBe('Julia Child');
    });

    it('should handle different author patterns', () => {
      const content = 'Recipe by: Ina Garten\nBy: Martha Stewart';
      const authorInfo = MetadataExtractor.extractAuthorInfo(content);
      expect(authorInfo.author).toBe('Ina Garten');
    });

    it('should return empty object for content without author info', () => {
      const content = 'Plain recipe content without author';
      const authorInfo = MetadataExtractor.extractAuthorInfo(content);
      expect(authorInfo.author).toBeUndefined();
      expect(authorInfo.lastEditedBy).toBeUndefined();
    });
  });
}); 