export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  delayBetweenRequests: number; // in milliseconds
}

export class RateLimiter {
  private requestCount = 0;
  private windowStart = Date.now();
  private lastRequestTime = 0;

  constructor(private config: RateLimitConfig) {}

  async waitForPermission(): Promise<void> {
    const now = Date.now();
    
    // Reset window if time has passed
    if (now - this.windowStart >= this.config.timeWindow) {
      this.requestCount = 0;
      this.windowStart = now;
    }
    
    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.config.maxRequests) {
      const waitTime = this.config.timeWindow - (now - this.windowStart);
      if (waitTime > 0) {
        await this.sleep(waitTime);
        this.requestCount = 0;
        this.windowStart = Date.now();
      }
    }
    
    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.delayBetweenRequests) {
      const delay = this.config.delayBetweenRequests - timeSinceLastRequest;
      await this.sleep(delay);
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset(): void {
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.lastRequestTime = 0;
  }
}

// Predefined rate limit configurations for different types of sites
export const RateLimitPresets = {
  // Conservative settings for most websites
  conservative: {
    maxRequests: 10,
    timeWindow: 60000, // 1 minute
    delayBetweenRequests: 2000 // 2 seconds
  },
  
  // Moderate settings for food blogs
  moderate: {
    maxRequests: 20,
    timeWindow: 60000, // 1 minute
    delayBetweenRequests: 1000 // 1 second
  },
  
  // Aggressive settings for sites that can handle more traffic
  aggressive: {
    maxRequests: 50,
    timeWindow: 60000, // 1 minute
    delayBetweenRequests: 500 // 0.5 seconds
  },
  
  // Instagram-specific settings (more conservative due to anti-bot measures)
  instagram: {
    maxRequests: 5,
    timeWindow: 60000, // 1 minute
    delayBetweenRequests: 5000 // 5 seconds
  }
}; 