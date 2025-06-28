import { POST } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';
import { RecipeExtractor } from '@/lib/evernote/recipe-extractor';
import { MetadataExtractor } from '@/lib/evernote/metadata-extractor';

jest.mock('@/lib/evernote/evernote-service');
jest.mock('@/lib/evernote/recipe-extractor');
jest.mock('@/lib/evernote/metadata-extractor');

const mockSetAccessToken = jest.fn();
const mockGetNotesFromNotebook = jest.fn();
const mockSearchNotes = jest.fn();
const mockGetNote = jest.fn();
const mockExtractFromEvernoteNote = jest.fn();
const mockExtractMetadata = jest.fn();
const mockExtractTagsFromContent = jest.fn();
const mockExtractSourceInfo = jest.fn();
const mockExtractLocationInfo = jest.fn();
const mockExtractDateInfo = jest.fn();
const mockExtractAuthorInfo = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  getNotesFromNotebook: mockGetNotesFromNotebook,
  searchNotes: mockSearchNotes,
  getNote: mockGetNote,
}));

(RecipeExtractor as any).extractFromEvernoteNote = mockExtractFromEvernoteNote;
(MetadataExtractor as any).extractMetadata = mockExtractMetadata;
(MetadataExtractor as any).extractTagsFromContent = mockExtractTagsFromContent;
(MetadataExtractor as any).extractSourceInfo = mockExtractSourceInfo;
(MetadataExtractor as any).extractLocationInfo = mockExtractLocationInfo;
(MetadataExtractor as any).extractDateInfo = mockExtractDateInfo;
(MetadataExtractor as any).extractAuthorInfo = mockExtractAuthorInfo;

describe('Evernote Batch Import API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(body: any) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as any;
  }

  it('returns 400 if accessToken is missing', async () => {
    const req = makeRequest({ notebookGuid: 'notebook-1' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing accessToken');
  });

  it('processes batch import from specific notebook', async () => {
    const mockNotes = [
      {
        guid: 'note-1',
        title: 'Recipe 1',
        content: '',
        created: 1234567890,
        updated: 1234567890,
      },
      {
        guid: 'note-2',
        title: 'Recipe 2',
        content: '',
        created: 1234567891,
        updated: 1234567891,
      },
    ];

    const mockFullNote = {
      guid: 'note-1',
      title: 'Recipe 1',
      content: '<en-note>Recipe content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      resources: [],
    };

    const mockRecipe = {
      title: 'Recipe 1',
      ingredients: ['1 cup flour', '1 cup sugar'],
      instructions: ['Mix ingredients', 'Bake'],
      servings: 4,
      cuisine: 'Italian',
      difficulty: 'easy',
      isVegetarian: true,
    };

    const mockMetadata = {
      guid: 'note-1',
      title: 'Recipe 1',
      tags: [],
    };

    mockGetNotesFromNotebook.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);
    mockExtractFromEvernoteNote.mockReturnValue(mockRecipe);
    mockExtractMetadata.mockReturnValue(mockMetadata);
    mockExtractTagsFromContent.mockReturnValue([]);
    mockExtractSourceInfo.mockReturnValue({});
    mockExtractLocationInfo.mockReturnValue({});
    mockExtractDateInfo.mockReturnValue({});
    mockExtractAuthorInfo.mockReturnValue({});

    const req = makeRequest({ 
      accessToken: 'token-1', 
      notebookGuid: 'notebook-1',
      maxNotes: 10,
      includeMetadata: true,
      includeAttachments: true,
    });
    const res = await POST(req);

    expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(mockGetNotesFromNotebook).toHaveBeenCalledWith('notebook-1', 10);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.totalNotes).toBe(2);
    expect(json.successfulImports).toBe(2);
    expect(json.failedImports).toBe(0);
    expect(json.recipes).toHaveLength(2);
    expect(json.summary.totalRecipes).toBe(2);
    expect(json.summary.totalIngredients).toBe(4);
    expect(json.summary.totalInstructions).toBe(4);
    expect(json.summary.cuisines['Italian']).toBe(2);
    expect(json.summary.difficulties['easy']).toBe(2);
    expect(json.summary.dietaryInfo.vegetarian).toBe(2);
    expect(json.summary.successRate).toBe(100);
  });

  it('processes batch import from all notebooks when no notebookGuid provided', async () => {
    const mockNotes = [
      {
        guid: 'note-1',
        title: 'Recipe 1',
        content: '',
        created: 1234567890,
        updated: 1234567890,
      },
    ];

    const mockFullNote = {
      guid: 'note-1',
      title: 'Recipe 1',
      content: '<en-note>Recipe content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      resources: [],
    };

    const mockRecipe = {
      title: 'Recipe 1',
      ingredients: ['1 cup flour'],
      instructions: ['Mix ingredients'],
      servings: 2,
    };

    mockSearchNotes.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);
    mockExtractFromEvernoteNote.mockReturnValue(mockRecipe);
    mockExtractMetadata.mockReturnValue({});
    mockExtractTagsFromContent.mockReturnValue([]);
    mockExtractSourceInfo.mockReturnValue({});
    mockExtractLocationInfo.mockReturnValue({});
    mockExtractDateInfo.mockReturnValue({});
    mockExtractAuthorInfo.mockReturnValue({});

    const req = makeRequest({ accessToken: 'token-1' });
    const res = await POST(req);

    expect(mockSearchNotes).toHaveBeenCalledWith('', undefined, 50);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.totalNotes).toBe(1);
    expect(json.successfulImports).toBe(1);
  });

  it('handles notes that are not recipes', async () => {
    const mockNotes = [
      {
        guid: 'note-1',
        title: 'Meeting Notes',
        content: '',
        created: 1234567890,
        updated: 1234567890,
      },
    ];

    const mockFullNote = {
      guid: 'note-1',
      title: 'Meeting Notes',
      content: '<en-note>Meeting content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      resources: [],
    };

    mockGetNotesFromNotebook.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);
    mockExtractFromEvernoteNote.mockReturnValue(null);

    const req = makeRequest({ accessToken: 'token-1', notebookGuid: 'notebook-1' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.totalNotes).toBe(1);
    expect(json.successfulImports).toBe(0);
    expect(json.failedImports).toBe(1);
    expect(json.errors).toContain('Note "Meeting Notes" does not contain recipe information');
    expect(json.summary.successRate).toBe(0);
  });

  it('handles errors during note processing', async () => {
    const mockNotes = [
      {
        guid: 'note-1',
        title: 'Recipe 1',
        content: '',
        created: 1234567890,
        updated: 1234567890,
      },
    ];

    mockGetNotesFromNotebook.mockResolvedValue(mockNotes);
    mockGetNote.mockRejectedValue(new Error('Note not found'));

    const req = makeRequest({ accessToken: 'token-1', notebookGuid: 'notebook-1' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.totalNotes).toBe(1);
    expect(json.successfulImports).toBe(0);
    expect(json.failedImports).toBe(1);
    expect(json.errors).toContain('Failed to process note "Recipe 1": Note not found');
  });

  it('skips metadata extraction when includeMetadata is false', async () => {
    const mockNotes = [
      {
        guid: 'note-1',
        title: 'Recipe 1',
        content: '',
        created: 1234567890,
        updated: 1234567890,
      },
    ];

    const mockFullNote = {
      guid: 'note-1',
      title: 'Recipe 1',
      content: '<en-note>Recipe content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      resources: [],
    };

    const mockRecipe = {
      title: 'Recipe 1',
      ingredients: ['1 cup flour'],
      instructions: ['Mix ingredients'],
    };

    mockGetNotesFromNotebook.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);
    mockExtractFromEvernoteNote.mockReturnValue(mockRecipe);

    const req = makeRequest({ 
      accessToken: 'token-1', 
      notebookGuid: 'notebook-1',
      includeMetadata: false,
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.recipes[0].metadata).toBeNull();
    expect(mockExtractMetadata).not.toHaveBeenCalled();
  });

  it('returns 500 if EvernoteService throws', async () => {
    mockGetNotesFromNotebook.mockRejectedValue(new Error('Evernote error'));

    const req = makeRequest({ accessToken: 'token-1', notebookGuid: 'notebook-1' });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Evernote error');
  });
}); 