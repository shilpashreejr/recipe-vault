import { POST } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';
import { RecipeExtractor } from '@/lib/evernote/recipe-extractor';

jest.mock('@/lib/evernote/evernote-service');
jest.mock('@/lib/evernote/recipe-extractor');

const mockSetAccessToken = jest.fn();
const mockGetNote = jest.fn();
const mockExtractFromEvernoteNote = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  getNote: mockGetNote,
}));

(RecipeExtractor as any).extractFromEvernoteNote = mockExtractFromEvernoteNote;

describe('Evernote Recipe Extraction API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(body: any) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as any;
  }

  it('returns 400 if accessToken is missing', async () => {
    const req = makeRequest({ noteGuid: 'note-1' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing accessToken or noteGuid');
  });

  it('returns 400 if noteGuid is missing', async () => {
    const req = makeRequest({ accessToken: 'token-1' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing accessToken or noteGuid');
  });

  it('returns extracted recipe for valid request', async () => {
    const mockNote = {
      guid: 'note-1',
      title: 'Test Recipe',
      content: 'Recipe content',
    };

    const mockRecipe = {
      title: 'Test Recipe',
      ingredients: ['1 cup flour'],
      instructions: ['Mix ingredients'],
      servings: 4,
    };

    mockGetNote.mockResolvedValue(mockNote);
    mockExtractFromEvernoteNote.mockReturnValue(mockRecipe);

    const req = makeRequest({ accessToken: 'token-1', noteGuid: 'note-1' });
    const res = await POST(req);

    expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(mockGetNote).toHaveBeenCalledWith('note-1');
    expect(mockExtractFromEvernoteNote).toHaveBeenCalledWith(mockNote);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.recipe).toEqual(mockRecipe);
  });

  it('returns 404 if no recipe found', async () => {
    const mockNote = {
      guid: 'note-1',
      title: 'Meeting Notes',
      content: 'Not a recipe',
    };

    mockGetNote.mockResolvedValue(mockNote);
    mockExtractFromEvernoteNote.mockReturnValue(null);

    const req = makeRequest({ accessToken: 'token-1', noteGuid: 'note-1' });
    const res = await POST(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('No recipe information found in this note');
  });

  it('returns 500 if EvernoteService throws', async () => {
    mockGetNote.mockRejectedValue(new Error('Evernote error'));

    const req = makeRequest({ accessToken: 'token-1', noteGuid: 'note-1' });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Evernote error');
  });
}); 