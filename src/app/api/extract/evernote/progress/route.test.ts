import { POST, GET } from './route';

describe('Evernote Import Progress API Route', () => {
  beforeEach(() => {
    // Clear any existing progress data
    jest.clearAllMocks();
  });

  function makeRequest(body: any) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as any;
  }

  function makeGetRequest(url: string) {
    return { url } as any;
  }

  describe('POST', () => {
    it('returns 400 if accessToken is missing', async () => {
      const req = makeRequest({ notebookGuid: 'notebook-1' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing accessToken');
    });

    it('starts import process and returns import ID', async () => {
      const req = makeRequest({ 
        accessToken: 'token-1', 
        notebookGuid: 'notebook-1',
        maxNotes: 25,
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importId).toMatch(/^import_\d+_[a-z0-9]+$/);
      expect(json.status).toBe('started');
      expect(json.progressUrl).toContain('/api/extract/evernote/progress/');
    });

    it('handles import without notebookGuid', async () => {
      const req = makeRequest({ 
        accessToken: 'token-1',
        maxNotes: 10,
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importId).toBeDefined();
      expect(json.status).toBe('started');
    });
  });

  describe('GET', () => {
    it('returns 400 if importId is missing', async () => {
      const req = makeGetRequest('http://localhost/api/extract/evernote/progress');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing importId');
    });

    it('returns 404 if import not found', async () => {
      const req = makeGetRequest('http://localhost/api/extract/evernote/progress?importId=nonexistent');
      const res = await GET(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Import not found');
    });

    it('returns progress for existing import', async () => {
      // First, start an import
      const startReq = makeRequest({ 
        accessToken: 'token-1', 
        notebookGuid: 'notebook-1',
      });
      const startRes = await POST(startReq);
      const { importId } = await startRes.json();

      // Wait a bit for the background process to start
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check progress
      const progressReq = makeGetRequest(`http://localhost/api/extract/evernote/progress?importId=${importId}`);
      const progressRes = await GET(progressReq);

      expect(progressRes.status).toBe(200);
      const json = await progressRes.json();
      expect(json.progress).toBeDefined();
      expect(json.progress.id).toBe(importId);
      expect(['pending', 'running']).toContain(json.progress.status);
      expect(json.progress.totalNotes).toBeGreaterThan(0);
      expect(json.progress.processedNotes).toBeGreaterThanOrEqual(0);
      expect(json.progress.successfulImports).toBeGreaterThanOrEqual(0);
      expect(json.progress.failedImports).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(json.progress.errors)).toBe(true);
      expect(json.progress.startTime).toBeDefined();
    });
  });

  describe('Progress tracking', () => {
    it('tracks progress through different states', async () => {
      // Start import
      const startReq = makeRequest({ 
        accessToken: 'token-1', 
        maxNotes: 5, // Small number for faster testing
      });
      const startRes = await POST(startReq);
      const { importId } = await startRes.json();

      // Check initial state
      await new Promise(resolve => setTimeout(resolve, 100));
      let progressReq = makeGetRequest(`http://localhost/api/extract/evernote/progress?importId=${importId}`);
      let progressRes = await GET(progressReq);
      let json = await progressRes.json();
      
      expect(json.progress.status).toBe('running');
      expect(json.progress.totalNotes).toBe(5);
      expect(json.progress.processedNotes).toBeGreaterThan(0);

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check final state
      progressReq = makeGetRequest(`http://localhost/api/extract/evernote/progress?importId=${importId}`);
      progressRes = await GET(progressReq);
      json = await progressRes.json();

      expect(json.progress.status).toBe('completed');
      expect(json.progress.processedNotes).toBe(5);
      expect(json.progress.endTime).toBeDefined();
      expect(json.progress.summary).toBeDefined();
      expect(json.progress.summary.totalRecipes).toBeGreaterThanOrEqual(0);
      expect(json.progress.summary.successRate).toBeGreaterThanOrEqual(0);
    });

    it('calculates estimated time remaining', async () => {
      // Start import
      const startReq = makeRequest({ 
        accessToken: 'token-1', 
        maxNotes: 10,
      });
      const startRes = await POST(startReq);
      const { importId } = await startRes.json();

      // Wait a bit and check progress
      await new Promise(resolve => setTimeout(resolve, 300));
      const progressReq = makeGetRequest(`http://localhost/api/extract/evernote/progress?importId=${importId}`);
      const progressRes = await GET(progressReq);
      const json = await progressRes.json();

      expect(json.progress.estimatedTimeRemaining).toBeGreaterThanOrEqual(0);
      expect(json.progress.currentNote).toBeDefined();
    });
  });
}); 