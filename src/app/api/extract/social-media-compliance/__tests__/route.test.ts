import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

jest.mock('@/lib/extractors/social-media-rate-limiter', () => ({
  SocialMediaRateLimiter: jest.fn(),
}));

describe('Social Media Compliance API', () => {
  let mockRateLimiter: any;

  beforeEach(() => {
    mockRateLimiter = {
      getPlatformRateLimit: jest.fn(),
      getRequestStats: jest.fn(),
      isRateLimited: jest.fn(),
      getTimeUntilNextRequest: jest.fn(),
      getSupportedPlatforms: jest.fn(),
      getComplianceConfig: jest.fn(),
      resetRateLimit: jest.fn(),
      updateComplianceConfig: jest.fn(),
      validateRequest: jest.fn()
    };

    const { SocialMediaRateLimiter } = require('@/lib/extractors/social-media-rate-limiter');
    (SocialMediaRateLimiter as jest.MockedClass<any>).mockImplementation(() => mockRateLimiter);
  });

  describe('GET /api/extract/social-media-compliance', () => {
    it('should return platform-specific info when platform is provided', async () => {
      const mockRateLimit = {
        platform: 'instagram',
        requestsPerMinute: 30,
        requestsPerHour: 1800,
        requestsPerDay: 43200,
        burstLimit: 5,
        cooldownPeriod: 2000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      };

      const mockStats = {
        totalRequests: 10,
        requestsLastHour: 5,
        requestsLastMinute: 1,
        averageInterval: 5000
      };

      mockRateLimiter.getPlatformRateLimit.mockReturnValue(mockRateLimit);
      mockRateLimiter.getRequestStats.mockReturnValue(mockStats);
      mockRateLimiter.isRateLimited.mockReturnValue(false);
      mockRateLimiter.getTimeUntilNextRequest.mockReturnValue(0);

      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance?platform=instagram');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.platform).toBe('instagram');
      expect(data.rateLimit).toEqual(mockRateLimit);
      expect(data.stats).toEqual(mockStats);
      expect(data.isRateLimited).toBe(false);
      expect(data.timeUntilNext).toBe(0);
    });

    it('should return error for unsupported platform', async () => {
      mockRateLimiter.getPlatformRateLimit.mockReturnValue(null);

      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance?platform=unsupported');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsupported platform: unsupported');
    });

    it('should return all platforms info when no platform is specified', async () => {
      const mockPlatforms = ['instagram', 'tiktok', 'pinterest'];
      const mockComplianceConfig = {
        userAgent: 'RecipeVault/1.0',
        respectRobotsTxt: true,
        followRedirects: true,
        maxRedirects: 3,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      };

      mockRateLimiter.getSupportedPlatforms.mockReturnValue(mockPlatforms);
      mockRateLimiter.getComplianceConfig.mockReturnValue(mockComplianceConfig);
      mockRateLimiter.getPlatformRateLimit.mockReturnValue({ platform: 'test' });
      mockRateLimiter.getRequestStats.mockReturnValue({ totalRequests: 0 });
      mockRateLimiter.isRateLimited.mockReturnValue(false);

      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.platforms).toHaveLength(3);
      expect(data.complianceConfig).toEqual(mockComplianceConfig);
    });
  });

  describe('POST /api/extract/social-media-compliance', () => {
    it('should reset rate limit for platform', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reset_rate_limit',
          platform: 'instagram'
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Rate limit reset for platform: instagram');
      expect(mockRateLimiter.resetRateLimit).toHaveBeenCalledWith('instagram');
    });

    it('should return error when platform is missing for reset action', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reset_rate_limit'
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Platform is required for reset_rate_limit action');
    });

    it('should update compliance configuration', async () => {
      const mockConfig = {
        userAgent: 'CustomBot/1.0',
        respectRobotsTxt: false
      };

      const mockUpdatedConfig = {
        userAgent: 'CustomBot/1.0',
        respectRobotsTxt: false,
        followRedirects: true,
        maxRedirects: 3,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      };

      mockRateLimiter.getComplianceConfig.mockReturnValue(mockUpdatedConfig);

      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_compliance_config',
          config: mockConfig
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Compliance configuration updated');
      expect(mockRateLimiter.updateComplianceConfig).toHaveBeenCalledWith(mockConfig);
      expect(data.complianceConfig).toEqual(mockUpdatedConfig);
    });

    it('should return error when config is missing for update action', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_compliance_config'
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Valid compliance config is required');
    });

    it('should validate request', async () => {
      const mockValidation = {
        isValid: true
      };

      mockRateLimiter.validateRequest.mockReturnValue(mockValidation);

      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'validate_request',
          platform: 'instagram',
          config: { url: 'https://instagram.com/post/123' }
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation).toEqual(mockValidation);
      expect(mockRateLimiter.validateRequest).toHaveBeenCalledWith('instagram', 'https://instagram.com/post/123');
    });

    it('should return error when platform or URL is missing for validate action', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'validate_request',
          platform: 'instagram'
        })
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Platform and URL are required for validate_request action');
    });

    it('should return error for unknown action', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
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
      const req = new NextRequest('http://localhost:3000/api/extract/social-media-compliance', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing action parameter');
    });
  });
}); 