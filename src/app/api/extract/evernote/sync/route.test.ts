import { POST } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';

jest.mock('@/lib/evernote/evernote-service');

const mockSetAccessToken = jest.fn();
const mockGetNotesFromNotebook = jest.fn();
const mockSearchNotes = jest.fn();
const mockGetNote = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  getNotesFromNotebook: mockGetNotesFromNotebook,
  searchNotes: mockSearchNotes,
  getNote: mockGetNote,
}));

describe('Evernote Note Synchronization API Route', () => {
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

  it('syncs notes from specific notebook', async () => {
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
      content: '<en-note>Full content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      notebookGuid: 'notebook-1',
      tagGuids: [],
      attributes: {},
      resources: [],
    };

    mockGetNotesFromNotebook.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);

    const req = makeRequest({ accessToken: 'token-1', notebookGuid: 'notebook-1' });
    const res = await POST(req);

    expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(mockGetNotesFromNotebook).toHaveBeenCalledWith('notebook-1', 100);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notes).toHaveLength(2);
    expect(json.totalCount).toBe(2);
    expect(json.syncTime).toBeDefined();
  });

  it('syncs notes from all notebooks when no notebookGuid provided', async () => {
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
      content: '<en-note>Full content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      notebookGuid: 'notebook-1',
      tagGuids: [],
      attributes: {},
      resources: [],
    };

    mockSearchNotes.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);

    const req = makeRequest({ accessToken: 'token-1' });
    const res = await POST(req);

    expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(mockSearchNotes).toHaveBeenCalledWith('', undefined, 100);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notes).toHaveLength(1);
  });

  it('filters notes by lastSyncTime', async () => {
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
      content: '<en-note>Full content</en-note>',
      created: 1234567890,
      updated: 1234567890,
      notebookGuid: 'notebook-1',
      tagGuids: [],
      attributes: {},
      resources: [],
    };

    mockGetNotesFromNotebook.mockResolvedValue(mockNotes);
    mockGetNote.mockResolvedValue(mockFullNote);

    const lastSyncTime = new Date(1234567880).toISOString(); // Before note-1 but after note-2
    const req = makeRequest({ accessToken: 'token-1', notebookGuid: 'notebook-1', lastSyncTime });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notes).toHaveLength(2); // Both notes should be included as they're both newer
  });

  it('handles errors when getting full note content', async () => {
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
    expect(json.notes).toHaveLength(1);
    expect(json.notes[0].content).toBe(''); // Should return metadata-only note
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