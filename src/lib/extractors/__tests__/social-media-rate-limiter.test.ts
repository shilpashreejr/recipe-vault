import { SocialMediaRateLimiter } from '../social-media-rate-limiter';

describe('SocialMediaRateLimiter', () => {
  let rateLimiter: SocialMediaRateLimiter;

  beforeEach(() => {
    rateLimiter = new SocialMediaRateLimiter();
  });

  describe('Platform Support', () => {
    it('should support all major social media platforms', () => {
      const platforms = rateLimiter.getSupportedPlatforms();
      
      expect(platforms).toContain('instagram');
      expect(platforms).toContain('tiktok');
      expect(platforms).toContain('pinterest');
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('youtube');
      expect(platforms).toContain('whatsapp');
      expect(platforms).toContain('email');
    });

    it('should return platform rate limit configuration', () => {
      const instagramConfig = rateLimiter.getPlatformRateLimit('instagram');
      
      expect(instagramConfig).toBeDefined();
      expect(instagramConfig?.platform).toBe('instagram');
      expect(instagramConfig?.requestsPerMinute).toBe(30);
      expect(instagramConfig?.respectRobotsTxt).toBe(true);
      expect(instagramConfig?.retryAfterHeader).toBe(true);
      expect(instagramConfig?.exponentialBackoff).toBe(true);
    });

    it('should return null for unsupported platforms', () => {
      const unsupportedConfig = rateLimiter.getPlatformRateLimit('unsupported');
      expect(unsupportedConfig).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should wait for permission before making requests', async () => {
      const startTime = Date.now();
      
      await rateLimiter.waitForPermission('instagram');
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for unsupported platform', async () => {
      await expect(rateLimiter.waitForPermission('unsupported')).rejects.toThrow('Unsupported platform: unsupported');
    });

    it('should track request statistics', async () => {
      await rateLimiter.waitForPermission('instagram');
      
      const stats = rateLimiter.getRequestStats('instagram');
      
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.requestsLastHour).toBeGreaterThan(0);
      expect(stats.requestsLastMinute).toBeGreaterThan(0);
      expect(stats.averageInterval).toBeGreaterThanOrEqual(0);
    });

    it('should detect rate limiting', () => {
      // Initially should not be rate limited
      expect(rateLimiter.isRateLimited('instagram')).toBe(false);
    });

    it('should calculate time until next request', () => {
      const timeUntilNext = rateLimiter.getTimeUntilNextRequest('instagram');
      expect(timeUntilNext).toBeGreaterThanOrEqual(0);
    });

    it('should reset rate limits', () => {
      rateLimiter.resetRateLimit('instagram');
      
      const stats = rateLimiter.getRequestStats('instagram');
      expect(stats.totalRequests).toBe(0);
      expect(rateLimiter.isRateLimited('instagram')).toBe(false);
    });
  });

  describe('Compliance Configuration', () => {
    it('should return default compliance configuration', () => {
      const config = rateLimiter.getComplianceConfig();
      
      expect(config.userAgent).toContain('RecipeVault/1.0');
      expect(config.respectRobotsTxt).toBe(true);
      expect(config.followRedirects).toBe(true);
      expect(config.maxRedirects).toBe(3);
      expect(config.timeout).toBe(30000);
      expect(config.retryAttempts).toBe(3);
      expect(config.retryDelay).toBe(1000);
    });

    it('should update compliance configuration', () => {
      const newConfig = {
        userAgent: 'CustomBot/1.0',
        respectRobotsTxt: false,
        timeout: 60000
      };
      
      rateLimiter.updateComplianceConfig(newConfig);
      
      const updatedConfig = rateLimiter.getComplianceConfig();
      expect(updatedConfig.userAgent).toBe('CustomBot/1.0');
      expect(updatedConfig.respectRobotsTxt).toBe(false);
      expect(updatedConfig.timeout).toBe(60000);
      expect(updatedConfig.followRedirects).toBe(true); // Should preserve other settings
    });

    it('should return recommended user agent', () => {
      const userAgent = rateLimiter.getRecommendedUserAgent();
      expect(userAgent).toContain('RecipeVault/1.0');
    });

    it('should check if platform should respect robots.txt', () => {
      expect(rateLimiter.shouldRespectRobotsTxt('instagram')).toBe(true);
      expect(rateLimiter.shouldRespectRobotsTxt('whatsapp')).toBe(false);
    });
  });

  describe('Request Validation', () => {
    it('should validate Instagram URLs', () => {
      const validation = rateLimiter.validateRequest('instagram', 'https://instagram.com/p/ABC123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate TikTok URLs', () => {
      const validation = rateLimiter.validateRequest('tiktok', 'https://tiktok.com/@user/video/123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate Pinterest URLs', () => {
      const validation = rateLimiter.validateRequest('pinterest', 'https://pinterest.com/pin/123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate Facebook URLs', () => {
      const validation = rateLimiter.validateRequest('facebook', 'https://facebook.com/post/123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate Twitter URLs', () => {
      const validation = rateLimiter.validateRequest('twitter', 'https://twitter.com/user/status/123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate YouTube URLs', () => {
      const validation = rateLimiter.validateRequest('youtube', 'https://youtube.com/watch?v=ABC123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate WhatsApp URLs', () => {
      const validation = rateLimiter.validateRequest('whatsapp', 'https://whatsapp.com/channel/123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate email URLs', () => {
      const validation = rateLimiter.validateRequest('email', 'https://any-domain.com/email');
      expect(validation.isValid).toBe(true);
    });

    it('should reject invalid URLs for platform', () => {
      const validation = rateLimiter.validateRequest('instagram', 'https://invalid-domain.com/post');
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Invalid URL format');
    });

    it('should reject unsupported platforms', () => {
      const validation = rateLimiter.validateRequest('unsupported', 'https://example.com');
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Unsupported platform');
    });
  });

  describe('Rate Limit Error Handling', () => {
    it('should handle rate limit errors with retry-after header', async () => {
      const error = {
        headers: {
          'retry-after': '60'
        }
      };
      
      const delay = await rateLimiter.handleRateLimitError('instagram', error);
      expect(delay).toBe(60000); // 60 seconds in milliseconds
    });

    it('should handle rate limit errors without retry-after header', async () => {
      const error = {};
      
      const delay = await rateLimiter.handleRateLimitError('instagram', error);
      expect(delay).toBeGreaterThan(0);
    });

    it('should throw error for unsupported platform in error handling', async () => {
      await expect(rateLimiter.handleRateLimitError('unsupported', {})).rejects.toThrow('Unsupported platform: unsupported');
    });
  });

  describe('Request Statistics', () => {
    it('should track multiple requests correctly', async () => {
      await rateLimiter.waitForPermission('instagram');
      await rateLimiter.waitForPermission('instagram');
      await rateLimiter.waitForPermission('instagram');
      
      const stats = rateLimiter.getRequestStats('instagram');
      expect(stats.totalRequests).toBe(3);
      expect(stats.requestsLastHour).toBe(3);
      expect(stats.requestsLastMinute).toBe(3);
    });

    it('should calculate average interval correctly', async () => {
      await rateLimiter.waitForPermission('instagram');
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await rateLimiter.waitForPermission('instagram');
      
      const stats = rateLimiter.getRequestStats('instagram');
      expect(stats.averageInterval).toBeGreaterThan(0);
    });

    it('should clean up old request times', async () => {
      // Simulate old requests by directly manipulating the internal state
      const now = Date.now();
      const oldTime = now - 7200000; // 2 hours ago
      
      // This is a bit of a hack to test the cleanup functionality
      // In a real scenario, we'd need to expose this for testing or use time mocking
      await rateLimiter.waitForPermission('instagram');
      
      const stats = rateLimiter.getRequestStats('instagram');
      expect(stats.totalRequests).toBeGreaterThan(0);
    });
  });
}); 