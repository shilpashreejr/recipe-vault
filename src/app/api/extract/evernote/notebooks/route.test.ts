import { GET } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';

jest.mock('@/lib/evernote/evernote-service');

const mockSetAccessToken = jest.fn();
const mockGetNotebooks = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  getNotebooks: mockGetNotebooks,
}));

describe('Evernote Notebooks API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url: string) {
    return { url } as any;
  }

  it('returns 400 if accessToken is missing', async () => {
    const req = makeRequest('http://localhost/api/extract/evernote/notebooks');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing accessToken');
  });

  it('returns all notebooks when no stack filter provided', async () => {
    const mockNotebooks = [
      {
        guid: 'notebook-1',
        name: 'Recipes',
        stack: 'Food',
        updateSequenceNum: 1,
        defaultNotebook: true,
        serviceCreated: 1234567890,
        serviceUpdated: 1234567890,
      },
      {
        guid: 'notebook-2',
        name: 'Work Notes',
        stack: 'Work',
        updateSequenceNum: 2,
        defaultNotebook: false,
        serviceCreated: 1234567891,
        serviceUpdated: 1234567891,
      },
      {
        guid: 'notebook-3',
        name: 'Personal',
        stack: undefined,
        updateSequenceNum: 3,
        defaultNotebook: false,
        serviceCreated: 1234567892,
        serviceUpdated: 1234567892,
      },
    ];

    mockGetNotebooks.mockResolvedValue(mockNotebooks);

    const req = makeRequest('http://localhost/api/extract/evernote/notebooks?accessToken=token-1');
    const res = await GET(req);

    expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(mockGetNotebooks).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notebooks).toHaveLength(3);
    expect(json.totalCount).toBe(3);
    expect(json.stacks).toEqual(['Food', 'Work']);
    expect(json.notebooksByStack['Food']).toHaveLength(1);
    expect(json.notebooksByStack['Work']).toHaveLength(1);
    expect(json.notebooksByStack['No Stack']).toHaveLength(1);
  });

  it('filters notebooks by stack', async () => {
    const mockNotebooks = [
      {
        guid: 'notebook-1',
        name: 'Recipes',
        stack: 'Food',
        updateSequenceNum: 1,
        defaultNotebook: true,
        serviceCreated: 1234567890,
        serviceUpdated: 1234567890,
      },
      {
        guid: 'notebook-2',
        name: 'Desserts',
        stack: 'Food',
        updateSequenceNum: 2,
        defaultNotebook: false,
        serviceCreated: 1234567891,
        serviceUpdated: 1234567891,
      },
      {
        guid: 'notebook-3',
        name: 'Work Notes',
        stack: 'Work',
        updateSequenceNum: 3,
        defaultNotebook: false,
        serviceCreated: 1234567892,
        serviceUpdated: 1234567892,
      },
    ];

    mockGetNotebooks.mockResolvedValue(mockNotebooks);

    const req = makeRequest('http://localhost/api/extract/evernote/notebooks?accessToken=token-1&stack=Food');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notebooks).toHaveLength(2);
    expect(json.totalCount).toBe(2);
    expect(json.notebooks[0].stack).toBe('Food');
    expect(json.notebooks[1].stack).toBe('Food');
    expect(json.notebooksByStack['Food']).toHaveLength(2);
  });

  it('returns empty arrays when no notebooks found', async () => {
    mockGetNotebooks.mockResolvedValue([]);

    const req = makeRequest('http://localhost/api/extract/evernote/notebooks?accessToken=token-1');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notebooks).toHaveLength(0);
    expect(json.totalCount).toBe(0);
    expect(json.stacks).toHaveLength(0);
    expect(Object.keys(json.notebooksByStack)).toHaveLength(0);
  });

  it('returns 500 if EvernoteService throws', async () => {
    mockGetNotebooks.mockRejectedValue(new Error('Evernote error'));

    const req = makeRequest('http://localhost/api/extract/evernote/notebooks?accessToken=token-1');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Evernote error');
  });
}); 