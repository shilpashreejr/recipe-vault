import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock the Apple Notes parsers
jest.mock('@/lib/apple-notes/apple-notes-parser', () => ({
  AppleNotesParser: {
    validateExport: jest.fn()
  }
}));

jest.mock('@/lib/apple-notes/html-parser', () => ({
  AppleNotesHtmlParser: {
    parseHtmlExport: jest.fn()
  }
}));

jest.mock('@/lib/apple-notes/metadata-preservation', () => ({
  AppleNotesMetadataPreservation: {
    preserveMetadata: jest.fn()
  }
}));

jest.mock('@/lib/apple-notes/folder-parser', () => ({
  AppleNotesFolderParser: {
    parseFolderStructure: jest.fn()
  }
}));

describe('/api/extract/apple-notes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for missing file', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost/api/extract/apple-notes', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('No file provided');
  });

  it('should return 400 for file too large', async () => {
    const formData = new FormData();
    const mockFile = new File(['test content'], 'test.html', { type: 'text/html' });
    Object.defineProperty(mockFile, 'size', { value: 100 * 1024 * 1024 }); // 100MB
    formData.append('file', mockFile);

    const req = new NextRequest('http://localhost/api/extract/apple-notes', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('File too large. Maximum size is 50MB.');
  });

  it('should return 400 for invalid file format', async () => {
    const { AppleNotesParser } = require('@/lib/apple-notes/apple-notes-parser');
    AppleNotesParser.validateExport.mockReturnValue({
      isValid: false,
      format: 'unknown',
      error: 'Invalid Apple Notes export file'
    });

    const formData = new FormData();
    const mockFile = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
    formData.append('file', mockFile);

    const req = new NextRequest('http://localhost/api/extract/apple-notes', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid Apple Notes export file');
  });

  it('should successfully process HTML export', async () => {
    const { AppleNotesParser } = require('@/lib/apple-notes/apple-notes-parser');
    const { AppleNotesHtmlParser } = require('@/lib/apple-notes/html-parser');
    const { AppleNotesMetadataPreservation } = require('@/lib/apple-notes/metadata-preservation');
    const { AppleNotesFolderParser } = require('@/lib/apple-notes/folder-parser');

    // Mock validation
    AppleNotesParser.validateExport.mockReturnValue({
      isValid: true,
      format: 'html'
    });

    // Mock HTML parsing
    AppleNotesHtmlParser.parseHtmlExport.mockResolvedValue({
      notes: [
        {
          id: 'note1',
          title: 'Chocolate Cake Recipe',
          content: 'Ingredients:\n2 cups flour\n1 cup sugar\n\nInstructions:\n1. Mix ingredients\n2. Bake at 350F',
          folder: 'Recipes',
          created: new Date(),
          modified: new Date(),
          images: [],
          attachments: [],
          tags: ['dessert', 'cake'],
          isPinned: false,
          isLocked: false
        }
      ],
      folders: ['Recipes'],
      metadata: {
        exportDate: new Date(),
        totalNotes: 1,
        totalFolders: 1
      }
    });

    // Mock folder structure
    AppleNotesFolderParser.parseFolderStructure.mockReturnValue({
      rootFolders: [],
      allFolders: new Map(),
      totalFolders: 1,
      totalNotes: 1,
      maxDepth: 1
    });

    // Mock metadata preservation
    AppleNotesMetadataPreservation.preserveMetadata.mockResolvedValue({
      notesMetadata: [],
      foldersMetadata: [],
      exportMetadata: {
        exportId: 'test-export',
        fileName: 'test.html',
        fileSize: 1024,
        exportDate: new Date(),
        format: 'html',
        totalNotes: 1,
        totalFolders: 1
      }
    });

    const formData = new FormData();
    const mockFile = new File(['<html><body><div class="note">Test content</div></body></html>'], 'test.html', { type: 'text/html' });
    formData.append('file', mockFile);

    const req = new NextRequest('http://localhost/api/extract/apple-notes', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.notes).toBe(1);
    expect(data.data.recipes).toBeGreaterThanOrEqual(0);
    expect(data.data.folders).toBe(1);
    expect(data.data.format).toBe('html');
  });
}); 