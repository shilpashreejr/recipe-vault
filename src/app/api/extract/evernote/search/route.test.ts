import { GET } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';

jest.mock('@/lib/evernote/evernote-service');

const mockSetAccessToken = jest.fn();
const mockSearchNotes = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  searchNotes: mockSearchNotes,
}));

describe('Evernote Note Search API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url: string) {
    return { url } as any;
  }

  it('returns 400 if accessToken is missing', async () => {
    const req = makeRequest('http://localhost/api/extract/evernote/search?query=recipe');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing accessToken');
  });

  it('returns notes for valid request', async () => {
    mockSearchNotes.mockResolvedValue([
      { guid: 'note-1', title: 'Recipe', content: '', created: 1, updated: 1 },
    ]);
    const req = makeRequest('http://localhost/api/extract/evernote/search?accessToken=abc&query=recipe');
    const res = await GET(req);
    expect(mockSetAccessToken).toHaveBeenCalledWith('abc');
    expect(mockSearchNotes).toHaveBeenCalledWith('recipe', undefined, 50);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notes).toHaveLength(1);
    expect(json.notes[0].guid).toBe('note-1');
  });

  it('returns notes for valid request with notebookGuid', async () => {
    mockSearchNotes.mockResolvedValue([
      { guid: 'note-2', title: 'Cake', content: '', created: 2, updated: 2 },
    ]);
    const req = makeRequest('http://localhost/api/extract/evernote/search?accessToken=abc&query=recipe&notebookGuid=nb1');
    const res = await GET(req);
    expect(mockSetAccessToken).toHaveBeenCalledWith('abc');
    expect(mockSearchNotes).toHaveBeenCalledWith('recipe', 'nb1', 50);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notes).toHaveLength(1);
    expect(json.notes[0].guid).toBe('note-2');
  });

  it('returns 500 if EvernoteService throws', async () => {
    mockSearchNotes.mockRejectedValue(new Error('fail search'));
    const req = makeRequest('http://localhost/api/extract/evernote/search?accessToken=abc&query=fail');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('fail search');
  });
}); 