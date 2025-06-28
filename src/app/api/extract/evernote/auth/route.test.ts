import { GET } from './route';
import { EvernoteService } from '@/lib/evernote/evernote-service';

jest.mock('@/lib/evernote/evernote-service');

const mockGetAuthorizationUrl = jest.fn();
const mockGetAccessToken = jest.fn();

(EvernoteService as any).mockImplementation(() => ({
  getAuthorizationUrl: mockGetAuthorizationUrl,
  getAccessToken: mockGetAccessToken,
}));

describe('Evernote Auth API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url: string) {
    return { url } as any;
  }

  it('returns authorization URL for OAuth start', async () => {
    mockGetAuthorizationUrl.mockResolvedValue({
      url: 'https://evernote.com/auth',
      requestToken: 'token',
      requestTokenSecret: 'secret',
    });
    const req = makeRequest('http://localhost/api/extract/evernote/auth?callbackUrl=http://localhost/cb');
    const res = await GET(req);
    const json = await res.json();
    expect(json.url).toBe('https://evernote.com/auth');
    expect(json.requestToken).toBe('token');
    expect(json.requestTokenSecret).toBe('secret');
    expect(mockGetAuthorizationUrl).toHaveBeenCalledWith('http://localhost/cb');
  });

  it('returns access token for OAuth callback', async () => {
    mockGetAccessToken.mockResolvedValue({
      accessToken: 'access',
      accessTokenSecret: 'secret',
      userId: 123,
      shardId: 's1',
    });
    const req = makeRequest('http://localhost/api/extract/evernote/auth?oauth_token=tok&oauth_verifier=ver&requestTokenSecret=sec');
    const res = await GET(req);
    const json = await res.json();
    expect(json.accessToken).toBe('access');
    expect(json.accessTokenSecret).toBe('secret');
    expect(json.userId).toBe(123);
    expect(json.shardId).toBe('s1');
    expect(mockGetAccessToken).toHaveBeenCalledWith('tok', 'sec', 'ver');
  });

  it('returns 400 for invalid request', async () => {
    const req = makeRequest('http://localhost/api/extract/evernote/auth');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid request');
  });

  it('returns 500 for errors in getAuthorizationUrl', async () => {
    mockGetAuthorizationUrl.mockRejectedValue(new Error('fail auth'));
    const req = makeRequest('http://localhost/api/extract/evernote/auth?callbackUrl=http://localhost/cb');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('fail auth');
  });

  it('returns 500 for errors in getAccessToken', async () => {
    mockGetAccessToken.mockRejectedValue(new Error('fail token'));
    const req = makeRequest('http://localhost/api/extract/evernote/auth?oauth_token=tok&oauth_verifier=ver&requestTokenSecret=sec');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('fail token');
  });
}); 