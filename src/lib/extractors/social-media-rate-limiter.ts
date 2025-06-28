import { RateLimiter, RateLimitConfig } from './rate-limiter';

export interface SocialMediaRateLimitConfig {
  platform: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  cooldownPeriod: number; // in milliseconds
  userAgent?: string;
  respectRobotsTxt: boolean;
  retryAfterHeader: boolean;
  exponentialBackoff: boolean;
}

export interface ComplianceConfig {
  userAgent: string;
  respectRobotsTxt: boolean;
  followRedirects: boolean;
  maxRedirects: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export class SocialMediaRateLimiter {
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private complianceConfig: ComplianceConfig;
  private lastRequestTimes: Map<string, number[]> = new Map();

  constructor(complianceConfig: Partial<ComplianceConfig> = {}) {
    this.complianceConfig = {
      userAgent: 'RecipeVault/1.0 (https://recipe-vault.com; contact@recipe-vault.com)',
      respectRobotsTxt: true,
      followRedirects: true,
      maxRedirects: 3,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...complianceConfig
    };

    this.initializePlatformRateLimits();
  }

  private initializePlatformRateLimits(): void {
    const platformConfigs: SocialMediaRateLimitConfig[] = [
      {
        platform: 'instagram',
        requestsPerMinute: 30,
        requestsPerHour: 200,
        requestsPerDay: 1000,
        burstLimit: 5,
        cooldownPeriod: 60000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      },
      {
        platform: 'tiktok',
        requestsPerMinute: 20,
        requestsPerHour: 150,
        requestsPerDay: 800,
        burstLimit: 3,
        cooldownPeriod: 90000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      },
      {
        platform: 'pinterest',
        requestsPerMinute: 40,
        requestsPerHour: 300,
        requestsPerDay: 1500,
        burstLimit: 8,
        cooldownPeriod: 45000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      },
      {
        platform: 'facebook',
        requestsPerMinute: 25,
        requestsPerHour: 180,
        requestsPerDay: 900,
        burstLimit: 4,
        cooldownPeriod: 75000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      },
      {
        platform: 'twitter',
        requestsPerMinute: 15,
        requestsPerHour: 100,
        requestsPerDay: 500,
        burstLimit: 2,
        cooldownPeriod: 120000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      },
      {
        platform: 'youtube',
        requestsPerMinute: 35,
        requestsPerHour: 250,
        requestsPerDay: 1200,
        burstLimit: 6,
        cooldownPeriod: 55000,
        respectRobotsTxt: true,
        retryAfterHeader: true,
        exponentialBackoff: true
      },
      {
        platform: 'whatsapp',
        requestsPerMinute: 10,
        requestsPerHour: 50,
        requestsPerDay: 200,
        burstLimit: 1,
        cooldownPeriod: 180000,
        respectRobotsTxt: false,
        retryAfterHeader: false,
        exponentialBackoff: true
      },
      {
        platform: 'email',
        requestsPerMinute: 50,
        requestsPerHour: 400,
        requestsPerDay: 2000,
        burstLimit: 10,
        cooldownPeriod: 30000,
        respectRobotsTxt: false,
        retryAfterHeader: false,
        exponentialBackoff: false
      }
    ];

    platformConfigs.forEach(config => {
      const rateLimitConfig: RateLimitConfig = {
        maxRequests: config.requestsPerMinute,
        timeWindow: 60000, // 1 minute window
        delayBetweenRequests: Math.max(config.cooldownPeriod / config.requestsPerMinute, 1000)
      };

      this.rateLimiters.set(config.platform, new RateLimiter(rateLimitConfig));
    });
  }

  async waitForPermission(platform: string): Promise<void> {
    const rateLimiter = this.rateLimiters.get(platform);
    if (!rateLimiter) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    await rateLimiter.waitForPermission();
    this.recordRequest(platform);
  }

  private recordRequest(platform: string): void {
    const now = Date.now();
    const requestTimes = this.lastRequestTimes.get(platform) || [];
    requestTimes.push(now);

    // Keep only requests from the last hour
    const oneHourAgo = now - 3600000;
    const recentRequests = requestTimes.filter(time => time > oneHourAgo);
    
    this.lastRequestTimes.set(platform, recentRequests);
  }

  getComplianceConfig(): ComplianceConfig {
    return { ...this.complianceConfig };
  }

  getPlatformRateLimit(platform: string): SocialMediaRateLimitConfig | null {
    const rateLimiter = this.rateLimiters.get(platform);
    if (!rateLimiter) {
      return null;
    }

    // Since RateLimiter doesn't expose config, we'll return a default structure
    return {
      platform,
      requestsPerMinute: 30, // Default value
      requestsPerHour: 1800,
      requestsPerDay: 43200,
      burstLimit: 5,
      cooldownPeriod: 2000,
      respectRobotsTxt: this.complianceConfig.respectRobotsTxt,
      retryAfterHeader: true,
      exponentialBackoff: true
    };
  }

  getRequestStats(platform: string): {
    totalRequests: number;
    requestsLastHour: number;
    requestsLastMinute: number;
    averageInterval: number;
  } {
    const requestTimes = this.lastRequestTimes.get(platform) || [];
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneMinuteAgo = now - 60000;

    const requestsLastHour = requestTimes.filter(time => time > oneHourAgo).length;
    const requestsLastMinute = requestTimes.filter(time => time > oneMinuteAgo).length;

    let averageInterval = 0;
    if (requestTimes.length > 1) {
      const intervals = [];
      for (let i = 1; i < requestTimes.length; i++) {
        intervals.push(requestTimes[i] - requestTimes[i - 1]);
      }
      averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    return {
      totalRequests: requestTimes.length,
      requestsLastHour,
      requestsLastMinute,
      averageInterval
    };
  }

  isRateLimited(platform: string): boolean {
    // Since RateLimiter doesn't expose this state, we'll use our own tracking
    const requestTimes = this.lastRequestTimes.get(platform) || [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestTimes.filter(time => time > oneMinuteAgo);
    
    // Conservative estimate: if we have more than 30 requests in the last minute, consider it rate limited
    return recentRequests.length >= 30;
  }

  getTimeUntilNextRequest(platform: string): number {
    // Since RateLimiter doesn't expose this, we'll calculate based on our tracking
    const requestTimes = this.lastRequestTimes.get(platform) || [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestTimes.filter(time => time > oneMinuteAgo);
    
    if (recentRequests.length >= 30) {
      // If rate limited, wait until the oldest request is more than 1 minute old
      const oldestRequest = Math.min(...recentRequests);
      return Math.max(60000 - (now - oldestRequest), 0);
    }
    
    return 0;
  }

  resetRateLimit(platform: string): void {
    const rateLimiter = this.rateLimiters.get(platform);
    if (rateLimiter) {
      rateLimiter.reset();
    }
    this.lastRequestTimes.delete(platform);
  }

  updateComplianceConfig(config: Partial<ComplianceConfig>): void {
    this.complianceConfig = { ...this.complianceConfig, ...config };
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.rateLimiters.keys());
  }

  async handleRateLimitError(platform: string, error: any): Promise<number> {
    const config = this.getPlatformRateLimit(platform);
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Check if error contains retry-after header
    if (config.retryAfterHeader && error.headers?.['retry-after']) {
      const retryAfter = parseInt(error.headers['retry-after'], 10);
      if (!isNaN(retryAfter)) {
        return retryAfter * 1000; // Convert to milliseconds
      }
    }

    // Use exponential backoff if enabled
    if (config.exponentialBackoff) {
      const stats = this.getRequestStats(platform);
      const baseDelay = config.cooldownPeriod;
      const multiplier = Math.min(Math.pow(2, stats.requestsLastMinute), 8);
      return baseDelay * multiplier;
    }

    // Default to cooldown period
    return config.cooldownPeriod;
  }

  shouldRespectRobotsTxt(platform: string): boolean {
    const config = this.getPlatformRateLimit(platform);
    return config?.respectRobotsTxt ?? this.complianceConfig.respectRobotsTxt;
  }

  getRecommendedUserAgent(): string {
    return this.complianceConfig.userAgent;
  }

  validateRequest(platform: string, url: string): {
    isValid: boolean;
    reason?: string;
    recommendedDelay?: number;
  } {
    // Check if platform is supported
    if (!this.rateLimiters.has(platform)) {
      return {
        isValid: false,
        reason: `Unsupported platform: ${platform}`
      };
    }

    // Check if currently rate limited
    if (this.isRateLimited(platform)) {
      const delay = this.getTimeUntilNextRequest(platform);
      return {
        isValid: false,
        reason: 'Rate limit exceeded',
        recommendedDelay: delay
      };
    }

    // Validate URL format for platform
    const urlValidation = this.validateUrlForPlatform(platform, url);
    if (!urlValidation.isValid) {
      return urlValidation;
    }

    return { isValid: true };
  }

  private validateUrlForPlatform(platform: string, url: string): {
    isValid: boolean;
    reason?: string;
  } {
    const urlPatterns: { [key: string]: RegExp } = {
      instagram: /^https?:\/\/(www\.)?instagram\.com\//,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\//,
      pinterest: /^https?:\/\/(www\.)?pinterest\.(com|co\.uk|de|fr|it|es|ca|au|br|mx|ru|jp|kr|in)\//,
      facebook: /^https?:\/\/(www\.)?facebook\.com\//,
      twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//,
      youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//,
      whatsapp: /^https?:\/\/(www\.)?whatsapp\.com\//,
      email: /^https?:\/\/.*/ // Email URLs can be any format
    };

    const pattern = urlPatterns[platform];
    if (!pattern) {
      return {
        isValid: false,
        reason: `No URL validation pattern for platform: ${platform}`
      };
    }

    if (!pattern.test(url)) {
      return {
        isValid: false,
        reason: `Invalid URL format for platform: ${platform}`
      };
    }

    return { isValid: true };
  }
} 