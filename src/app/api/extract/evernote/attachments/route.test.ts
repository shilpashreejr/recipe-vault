import { GET, POST } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';

jest.mock('@/lib/evernote/evernote-service');

const mockSetAccessToken = jest.fn();
const mockGetResourceData = jest.fn();
const mockGetNoteResources = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  getResourceData: mockGetResourceData,
  getNoteResources: mockGetNoteResources,
}));

describe('Evernote Attachments API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url: string) {
    return { url } as any;
  }

  function makePostRequest(body: any) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as any;
  }

  describe('GET', () => {
    it('returns 400 if accessToken is missing', async () => {
      const req = makeRequest('http://localhost/api/extract/evernote/attachments?resourceGuid=res-1');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing accessToken or resourceGuid');
    });

    it('returns 400 if resourceGuid is missing', async () => {
      const req = makeRequest('http://localhost/api/extract/evernote/attachments?accessToken=token-1');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing accessToken or resourceGuid');
    });

    it('returns image data for valid request', async () => {
      const mockResourceData = {
        bodyHash: 'hash123',
        size: 1024,
        body: 'base64-encoded-image-data',
      };

      mockGetResourceData.mockResolvedValue(mockResourceData);

      const req = makeRequest('http://localhost/api/extract/evernote/attachments?accessToken=token-1&resourceGuid=res-1');
      const res = await GET(req);

      expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
      expect(mockGetResourceData).toHaveBeenCalledWith('res-1');
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/jpeg');
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600');
    });

    it('returns 404 if resource not found', async () => {
      mockGetResourceData.mockResolvedValue(null);

      const req = makeRequest('http://localhost/api/extract/evernote/attachments?accessToken=token-1&resourceGuid=res-1');
      const res = await GET(req);

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Resource not found');
    });

    it('returns 500 if EvernoteService throws', async () => {
      mockGetResourceData.mockRejectedValue(new Error('Evernote error'));

      const req = makeRequest('http://localhost/api/extract/evernote/attachments?accessToken=token-1&resourceGuid=res-1');
      const res = await GET(req);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Evernote error');
    });
  });

  describe('POST', () => {
    it('returns 400 if accessToken is missing', async () => {
      const req = makePostRequest({ noteGuid: 'note-1' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing accessToken or noteGuid');
    });

    it('returns 400 if noteGuid is missing', async () => {
      const req = makePostRequest({ accessToken: 'token-1' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing accessToken or noteGuid');
    });

    it('returns image metadata for valid request', async () => {
      const mockResources = [
        {
          guid: 'res-1',
          mime: 'image/jpeg',
          width: 800,
          height: 600,
        },
        {
          guid: 'res-2',
          mime: 'text/plain',
          width: undefined,
          height: undefined,
        },
        {
          guid: 'res-3',
          mime: 'image/png',
          width: 1200,
          height: 800,
        },
      ];

      mockGetNoteResources.mockResolvedValue(mockResources);

      const req = makePostRequest({ accessToken: 'token-1', noteGuid: 'note-1' });
      const res = await POST(req);

      expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
      expect(mockGetNoteResources).toHaveBeenCalledWith('note-1');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.images).toHaveLength(2); // Only image resources
      expect(json.images[0].guid).toBe('res-1');
      expect(json.images[0].mime).toBe('image/jpeg');
      expect(json.images[0].width).toBe(800);
      expect(json.images[0].height).toBe(600);
      expect(json.images[0].url).toContain('accessToken=token-1');
      expect(json.images[0].url).toContain('resourceGuid=res-1');
    });

    it('returns empty array if no image resources', async () => {
      const mockResources = [
        {
          guid: 'res-1',
          mime: 'text/plain',
          width: undefined,
          height: undefined,
        },
      ];

      mockGetNoteResources.mockResolvedValue(mockResources);

      const req = makePostRequest({ accessToken: 'token-1', noteGuid: 'note-1' });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.images).toHaveLength(0);
    });

    it('returns 500 if EvernoteService throws', async () => {
      mockGetNoteResources.mockRejectedValue(new Error('Evernote error'));

      const req = makePostRequest({ accessToken: 'token-1', noteGuid: 'note-1' });
      const res = await POST(req);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Evernote error');
    });
  });
}); 