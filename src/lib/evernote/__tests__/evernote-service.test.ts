import { EvernoteService, EvernoteConfig } from '../evernote-service';

// Mock the Evernote SDK
jest.mock('evernote', () => ({
  Client: jest.fn().mockImplementation(() => ({
    getRequestToken: jest.fn(),
    getAuthorizeUrl: jest.fn(),
    getAccessToken: jest.fn(),
    getUserStore: jest.fn(),
    getNoteStore: jest.fn(),
  })),
}));

describe('EvernoteService', () => {
  let evernoteService: EvernoteService;
  let mockClient: any;

  const mockConfig: EvernoteConfig = {
    consumerKey: 'test-consumer-key',
    consumerSecret: 'test-consumer-secret',
    sandbox: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    evernoteService = new EvernoteService(mockConfig);
    mockClient = (evernoteService as any).client;
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(evernoteService).toBeInstanceOf(EvernoteService);
      expect(mockClient).toBeDefined();
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization URL with tokens', async () => {
      const mockRequestToken = 'request-token';
      const mockRequestTokenSecret = 'request-token-secret';
      const mockUrl = 'https://sandbox.evernote.com/OAuth.action?oauth_token=request-token';

      mockClient.getRequestToken.mockImplementation((callbackUrl: string, callback: any) => {
        callback(null, mockRequestToken, mockRequestTokenSecret, {});
      });

      mockClient.getAuthorizeUrl.mockReturnValue(mockUrl);

      const result = await evernoteService.getAuthorizationUrl('http://localhost:3000/callback');

      expect(result).toEqual({
        url: mockUrl,
        requestToken: mockRequestToken,
        requestTokenSecret: mockRequestTokenSecret,
      });
    });

    it('should handle errors in authorization URL generation', async () => {
      const mockError = new Error('OAuth error');

      mockClient.getRequestToken.mockImplementation((callbackUrl: string, callback: any) => {
        callback(mockError, null, null, null);
      });

      await expect(
        evernoteService.getAuthorizationUrl('http://localhost:3000/callback')
      ).rejects.toThrow('OAuth error');
    });
  });

  describe('getAccessToken', () => {
    it('should exchange request token for access token', async () => {
      const mockAccessToken = 'access-token';
      const mockAccessTokenSecret = 'access-token-secret';
      const mockResults = {
        edam_userId: 12345,
        edam_shard: 's1',
      };

      mockClient.getAccessToken.mockImplementation((
        requestToken: string,
        requestTokenSecret: string,
        verifier: string,
        callback: any
      ) => {
        callback(null, mockAccessToken, mockAccessTokenSecret, mockResults);
      });

      const result = await evernoteService.getAccessToken(
        'request-token',
        'request-token-secret',
        'verifier'
      );

      expect(result).toEqual({
        accessToken: mockAccessToken,
        accessTokenSecret: mockAccessTokenSecret,
        userId: mockResults.edam_userId,
        shardId: mockResults.edam_shard,
      });
    });

    it('should handle errors in access token exchange', async () => {
      const mockError = new Error('Token exchange failed');

      mockClient.getAccessToken.mockImplementation((
        requestToken: string,
        requestTokenSecret: string,
        verifier: string,
        callback: any
      ) => {
        callback(mockError, null, null, null);
      });

      await expect(
        evernoteService.getAccessToken('request-token', 'request-token-secret', 'verifier')
      ).rejects.toThrow('Token exchange failed');
    });
  });

  describe('setAccessToken', () => {
    it('should set access token for authenticated requests', () => {
      const accessToken = 'test-access-token';
      
      evernoteService.setAccessToken(accessToken);
      
      expect((evernoteService as any).accessToken).toBe(accessToken);
      expect((mockClient as any).token).toBe(accessToken);
    });
  });

  describe('getUserInfo', () => {
    it('should get user information', async () => {
      const mockUser = {
        id: 12345,
        username: 'testuser',
        email: 'test@example.com',
      };

      const mockUserStore = {
        getUser: jest.fn().mockResolvedValue(mockUser),
      };

      mockClient.getUserStore.mockReturnValue(mockUserStore);

      const result = await evernoteService.getUserInfo();

      expect(result).toEqual(mockUser);
      expect(mockUserStore.getUser).toHaveBeenCalled();
    });
  });

  describe('getNotebooks', () => {
    it('should get all notebooks', async () => {
      const mockNotebooks = [
        {
          guid: 'notebook-1',
          name: 'Recipes',
          updateSequenceNum: 1,
          defaultNotebook: true,
          serviceCreated: 1234567890,
          serviceUpdated: 1234567890,
        },
        {
          guid: 'notebook-2',
          name: 'Work Notes',
          updateSequenceNum: 2,
          defaultNotebook: false,
          serviceCreated: 1234567891,
          serviceUpdated: 1234567891,
        },
      ];

      const mockNoteStore = {
        listNotebooks: jest.fn().mockResolvedValue(mockNotebooks),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getNotebooks();

      expect(result).toHaveLength(2);
      expect(result[0].guid).toBe('notebook-1');
      expect(result[0].name).toBe('Recipes');
      expect(result[1].guid).toBe('notebook-2');
      expect(result[1].name).toBe('Work Notes');
      expect(mockNoteStore.listNotebooks).toHaveBeenCalled();
    });

    it('should handle notebooks with missing properties', async () => {
      const mockNotebooks = [
        {
          guid: undefined,
          name: undefined,
          updateSequenceNum: undefined,
          defaultNotebook: undefined,
          serviceCreated: undefined,
          serviceUpdated: undefined,
        },
      ];

      const mockNoteStore = {
        listNotebooks: jest.fn().mockResolvedValue(mockNotebooks),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getNotebooks();

      expect(result[0].guid).toBe('');
      expect(result[0].name).toBe('');
      expect(result[0].updateSequenceNum).toBe(0);
      expect(result[0].defaultNotebook).toBe(false);
      expect(result[0].serviceCreated).toBe(0);
      expect(result[0].serviceUpdated).toBe(0);
    });
  });

  describe('searchNotes', () => {
    it('should search notes with query', async () => {
      const mockNotes = [
        {
          guid: 'note-1',
          title: 'Chocolate Cake Recipe',
          created: 1234567890,
          updated: 1234567890,
          notebookGuid: 'notebook-1',
          tagGuids: ['tag-1'],
          attributes: {},
        },
      ];

      const mockResult = { notes: mockNotes };

      const mockNoteStore = {
        findNotesMetadata: jest.fn().mockResolvedValue(mockResult),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.searchNotes('recipe', 'notebook-1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].guid).toBe('note-1');
      expect(result[0].title).toBe('Chocolate Cake Recipe');
      expect(mockNoteStore.findNotesMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          words: 'recipe',
          notebookGuid: 'notebook-1',
          order: 3,
          ascending: false,
        }),
        0,
        10,
        expect.objectContaining({
          includeTitle: true,
          includeCreated: true,
          includeUpdated: true,
          includeNotebookGuid: true,
          includeTagGuids: true,
          includeAttributes: true,
        })
      );
    });

    it('should search notes without notebook filter', async () => {
      const mockResult = { notes: [] };
      const mockNoteStore = {
        findNotesMetadata: jest.fn().mockResolvedValue(mockResult),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      await evernoteService.searchNotes('recipe');

      expect(mockNoteStore.findNotesMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          words: 'recipe',
          order: 3,
          ascending: false,
        }),
        0,
        50,
        expect.any(Object)
      );
    });
  });

  describe('getNote', () => {
    it('should get full note content', async () => {
      const mockNote = {
        guid: 'note-1',
        title: 'Chocolate Cake Recipe',
        content: '<en-note>Ingredients: flour, sugar, eggs...</en-note>',
        created: 1234567890,
        updated: 1234567890,
        notebookGuid: 'notebook-1',
        tagGuids: ['tag-1'],
        attributes: {},
        resources: [],
      };

      const mockNoteStore = {
        getNote: jest.fn().mockResolvedValue(mockNote),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getNote('note-1');

      expect(result.guid).toBe('note-1');
      expect(result.title).toBe('Chocolate Cake Recipe');
      expect(result.content).toBe('<en-note>Ingredients: flour, sugar, eggs...</en-note>');
      expect(mockNoteStore.getNote).toHaveBeenCalledWith('note-1', true, false, false, false);
    });

    it('should throw error when note not found', async () => {
      const mockNoteStore = {
        getNote: jest.fn().mockResolvedValue(null),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      await expect(evernoteService.getNote('non-existent')).rejects.toThrow('Note not found');
    });
  });

  describe('findRecipeNotes', () => {
    it('should find recipe-related notes', async () => {
      const mockNotes = [
        {
          guid: 'note-1',
          title: 'Chocolate Cake Recipe',
          created: 1234567890,
          updated: 1234567890,
        },
      ];

      const mockResult = { notes: mockNotes };
      const mockNoteStore = {
        findNotesMetadata: jest.fn().mockResolvedValue(mockResult),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.findRecipeNotes('notebook-1');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Chocolate Cake Recipe');
      
      // Check that the search query includes recipe keywords
      expect(mockNoteStore.findNotesMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          words: expect.stringContaining('recipe OR ingredients OR instructions'),
        }),
        0,
        100,
        expect.any(Object)
      );
    });
  });

  describe('getNoteResources', () => {
    it('should get note resources', async () => {
      const mockNote = {
        guid: 'note-1',
        title: 'Recipe with Image',
        content: '<en-note>Recipe content</en-note>',
        created: 1234567890,
        updated: 1234567890,
        resources: [
          {
            guid: 'resource-1',
            noteGuid: 'note-1',
            mime: 'image/jpeg',
            width: 800,
            height: 600,
          },
        ],
      };

      const mockNoteStore = {
        getNote: jest.fn().mockResolvedValue(mockNote),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getNoteResources('note-1');

      expect(result).toHaveLength(1);
      expect(result[0].guid).toBe('resource-1');
      expect(result[0].mime).toBe('image/jpeg');
      expect(result[0].width).toBe(800);
      expect(result[0].height).toBe(600);
    });
  });

  describe('getResourceData', () => {
    it('should get resource data', async () => {
      const mockResource = {
        guid: 'resource-1',
        data: {
          bodyHash: 'hash123',
          size: 1024,
          body: 'base64-encoded-data',
        },
      };

      const mockNoteStore = {
        getResource: jest.fn().mockResolvedValue(mockResource),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getResourceData('resource-1');

      expect(result).toEqual({
        bodyHash: 'hash123',
        size: 1024,
        body: 'base64-encoded-data',
      });
      expect(mockNoteStore.getResource).toHaveBeenCalledWith('resource-1', true, false, false, false);
    });

    it('should return null when resource not found', async () => {
      const mockNoteStore = {
        getResource: jest.fn().mockResolvedValue(null),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getResourceData('non-existent');

      expect(result).toBeNull();
    });

    it('should return null when resource has no data', async () => {
      const mockResource = {
        guid: 'resource-1',
        data: null,
      };

      const mockNoteStore = {
        getResource: jest.fn().mockResolvedValue(mockResource),
      };

      mockClient.getNoteStore.mockReturnValue(mockNoteStore);

      const result = await evernoteService.getResourceData('resource-1');

      expect(result).toBeNull();
    });
  });
}); 