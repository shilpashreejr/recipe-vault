import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

jest.mock('@/lib/extractors/social-media-metadata', () => ({
  SocialMediaMetadataPreservation: jest.fn(),
}));

describe('Metadata Preservation API', () => {
  let mockMetadataPreservation: any;

  beforeEach(() => {
    mockMetadataPreservation = {
      createMetadata: jest.fn(),
      updateMetadata: jest.fn(),
      validateMetadata: jest.fn(),
      getMetadataSummary: jest.fn(),
      isMetadataExpired: jest.fn(),
      updateConfig: jest.fn(),
      getConfig: jest.fn()
    };

    const { SocialMediaMetadataPreservation } = require('@/lib/extractors/social-media-metadata');
    (SocialMediaMetadataPreservation as jest.MockedClass<any>).mockImplementation(() => mockMetadataPreservation);
  });

  describe('POST /api/extract/metadata', () => {
    it('should create metadata', async () => {
      const mockMetadata = {
        platform: 'instagram',
        contentId: '123456',
        url: 'https://instagram.com/p/123456',
        author: { username: 'testuser' },
        engagement: { likes: 100 },
        timestamps: { published: '2024-01-01T00:00:00.000Z', scraped: '2024-01-01T00:00:00.000Z' },
        tags: [],
        platformSpecific: {},
        privacy: { isPublic: true },
        categories: []
      };

      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      mockMetadataPreservation.createMetadata.mockReturnValue(mockMetadata);
      mockMetadataPreservation.validateMetadata.mockReturnValue(mockValidation);

      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create_metadata',
          platform: 'instagram',
          contentId: '123456',
          url: 'https://instagram.com/p/123456',
          rawData: { likes: 100, author: { username: 'testuser' } }
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata).toEqual(mockMetadata);
      expect(data.validation).toEqual(mockValidation);
    });

    it('should return error when required fields are missing for create_metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create_metadata',
          platform: 'instagram'
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Platform, contentId, url, and rawData are required for create_metadata action');
    });

    it('should update metadata', async () => {
      const existingMetadata = {
        platform: 'instagram',
        contentId: '123456',
        url: 'https://instagram.com/p/123456',
        author: { username: 'testuser' },
        engagement: { likes: 100 },
        timestamps: { published: '2024-01-01T00:00:00.000Z', scraped: '2024-01-01T00:00:00.000Z' },
        tags: [],
        platformSpecific: {},
        privacy: { isPublic: true },
        categories: []
      };

      const updatedMetadata = { ...existingMetadata, engagement: { likes: 150 } };
      const mockValidation = { isValid: true, errors: [], warnings: [] };

      mockMetadataPreservation.updateMetadata.mockReturnValue(updatedMetadata);
      mockMetadataPreservation.validateMetadata.mockReturnValue(mockValidation);

      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_metadata',
          metadata: existingMetadata,
          rawData: { likes: 150 }
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata).toEqual(updatedMetadata);
      expect(data.validation).toEqual(mockValidation);
    });

    it('should validate metadata', async () => {
      const mockMetadata = {
        platform: 'instagram',
        contentId: '123456',
        url: 'https://instagram.com/p/123456',
        author: { username: 'testuser' },
        engagement: { likes: 100 },
        timestamps: { published: '2024-01-01T00:00:00.000Z', scraped: '2024-01-01T00:00:00.000Z' },
        tags: [],
        platformSpecific: {},
        privacy: { isPublic: true },
        categories: []
      };

      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: ['No tags provided']
      };

      mockMetadataPreservation.validateMetadata.mockReturnValue(mockValidation);

      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'validate_metadata',
          metadata: mockMetadata
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation).toEqual(mockValidation);
    });

    it('should get metadata summary', async () => {
      const mockMetadata = {
        platform: 'instagram',
        contentId: '123456',
        url: 'https://instagram.com/p/123456',
        author: { username: 'testuser' },
        engagement: { likes: 100, comments: 50 },
        timestamps: { published: '2024-01-01T00:00:00.000Z', scraped: '2024-01-01T00:00:00.000Z' },
        tags: [],
        platformSpecific: {},
        privacy: { isPublic: true },
        categories: [],
        contentQuality: 'high'
      };

      const mockSummary = {
        platform: 'instagram',
        contentId: '123456',
        author: 'testuser',
        engagement: 150,
        quality: 'high',
        age: 0
      };

      mockMetadataPreservation.getMetadataSummary.mockReturnValue(mockSummary);
      mockMetadataPreservation.isMetadataExpired.mockReturnValue(false);

      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'get_metadata_summary',
          metadata: mockMetadata
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary).toEqual(mockSummary);
      expect(data.isExpired).toBe(false);
    });

    it('should update configuration', async () => {
      const newConfig = {
        preserveEngagement: false,
        maxMetadataAge: 180
      };

      const updatedConfig = {
        preserveEngagement: false,
        preserveAuthorInfo: true,
        preserveMedia: true,
        preserveLocation: true,
        preserveTimestamps: true,
        preservePlatformSpecific: true,
        maxMetadataAge: 180,
        compressionEnabled: false,
        encryptionEnabled: false
      };

      mockMetadataPreservation.getConfig.mockReturnValue(updatedConfig);

      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_config',
          config: newConfig
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Configuration updated');
      expect(data.config).toEqual(updatedConfig);
      expect(mockMetadataPreservation.updateConfig).toHaveBeenCalledWith(newConfig);
    });

    it('should return error for unknown action', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({
          action: 'unknown_action'
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unknown action: unknown_action');
    });

    it('should return error when action is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/metadata', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing action parameter');
    });
  });

  describe('GET /api/extract/metadata', () => {
    it('should get configuration', async () => {
      const mockConfig = {
        preserveEngagement: true,
        preserveAuthorInfo: true,
        preserveMedia: true,
        preserveLocation: true,
        preserveTimestamps: true,
        preservePlatformSpecific: true,
        maxMetadataAge: 365,
        compressionEnabled: false,
        encryptionEnabled: false
      };

      mockMetadataPreservation.getConfig.mockReturnValue(mockConfig);

      const req = new NextRequest('http://localhost:3000/api/extract/metadata?action=get_config');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config).toEqual(mockConfig);
    });

    it('should return error for invalid action', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/metadata?action=invalid');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action parameter');
    });
  });
}); 