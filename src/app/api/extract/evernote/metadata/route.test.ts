import { POST } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';
import { MetadataExtractor } from '@/lib/evernote/metadata-extractor';

jest.mock('@/lib/evernote/evernote-service');
jest.mock('@/lib/evernote/metadata-extractor');

const mockSetAccessToken = jest.fn();
const mockGetNote = jest.fn();
const mockExtractMetadata = jest.fn();
const mockExtractTagsFromContent = jest.fn();
const mockExtractSourceInfo = jest.fn();
const mockExtractLocationInfo = jest.fn();
const mockExtractDateInfo = jest.fn();
const mockExtractAuthorInfo = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  setAccessToken: mockSetAccessToken,
  getNote: mockGetNote,
}));

(MetadataExtractor as any).extractMetadata = mockExtractMetadata;
(MetadataExtractor as any).extractTagsFromContent = mockExtractTagsFromContent;
(MetadataExtractor as any).extractSourceInfo = mockExtractSourceInfo;
(MetadataExtractor as any).extractLocationInfo = mockExtractLocationInfo;
(MetadataExtractor as any).extractDateInfo = mockExtractDateInfo;
(MetadataExtractor as any).extractAuthorInfo = mockExtractAuthorInfo;

describe('Evernote Metadata Extraction API Route', () => {
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

  it('returns extracted metadata for valid request', async () => {
    const mockNote = {
      guid: 'note-1',
      title: 'Test Recipe',
      content: '<en-note>Recipe content with #recipe #italian</en-note>',
      created: 1234567890,
      updated: 1234567891,
    };

    const mockMetadata = {
      guid: 'note-1',
      title: 'Test Recipe',
      created: 1234567890,
      updated: 1234567891,
      tags: [],
    };

    const mockContentTags = ['recipe', 'italian'];
    const mockSourceInfo = { source: 'example.com', sourceURL: 'https://example.com' };
    const mockLocationInfo = { placeName: 'New York' };
    const mockDateInfo = { created: new Date('2023-01-15') };
    const mockAuthorInfo = { author: 'John Doe' };

    mockGetNote.mockResolvedValue(mockNote);
    mockExtractMetadata.mockReturnValue(mockMetadata);
    mockExtractTagsFromContent.mockReturnValue(mockContentTags);
    mockExtractSourceInfo.mockReturnValue(mockSourceInfo);
    mockExtractLocationInfo.mockReturnValue(mockLocationInfo);
    mockExtractDateInfo.mockReturnValue(mockDateInfo);
    mockExtractAuthorInfo.mockReturnValue(mockAuthorInfo);

    const req = makeRequest({ accessToken: 'token-1', noteGuid: 'note-1', notebookName: 'Recipes' });
    const res = await POST(req);

    expect(mockSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(mockGetNote).toHaveBeenCalledWith('note-1');
    expect(mockExtractMetadata).toHaveBeenCalledWith(mockNote, 'Recipes');
    expect(mockExtractTagsFromContent).toHaveBeenCalledWith(mockNote.content);
    expect(mockExtractSourceInfo).toHaveBeenCalledWith(mockNote.content);
    expect(mockExtractLocationInfo).toHaveBeenCalledWith(mockNote.content);
    expect(mockExtractDateInfo).toHaveBeenCalledWith(mockNote.content);
    expect(mockExtractAuthorInfo).toHaveBeenCalledWith(mockNote.content);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.metadata).toEqual({
      ...mockMetadata,
      contentTags: mockContentTags,
      ...mockSourceInfo,
      ...mockLocationInfo,
      ...mockDateInfo,
      ...mockAuthorInfo,
    });
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