export interface RobotsTxtRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsTxtData {
  rules: RobotsTxtRule[];
  sitemap?: string[];
  host?: string;
}

export class RobotsTxtChecker {
  private cache = new Map<string, RobotsTxtData>();

  async checkRobotsTxt(url: string, userAgent: string = '*'): Promise<{
    allowed: boolean;
    crawlDelay?: number;
    reason?: string;
  }> {
    try {
      const robotsUrl = this.getRobotsTxtUrl(url);
      const robotsData = await this.fetchRobotsTxt(robotsUrl);
      
      // Check if we're allowed to crawl this URL
      const allowed = this.isUrlAllowed(robotsData, url, userAgent);
      const crawlDelay = this.getCrawlDelay(robotsData, userAgent);
      
      if (!allowed) {
        return {
          allowed: false,
          reason: `URL ${url} is disallowed by robots.txt`
        };
      }
      
      return {
        allowed: true,
        crawlDelay
      };
    } catch (error) {
      // If we can't fetch robots.txt, assume it's allowed but log the error
      console.warn(`Failed to fetch robots.txt for ${url}:`, error);
      return {
        allowed: true,
        reason: 'Could not fetch robots.txt, assuming allowed'
      };
    }
  }

  private getRobotsTxtUrl(url: string): string {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}/robots.txt`;
  }

  private async fetchRobotsTxt(robotsUrl: string): Promise<RobotsTxtData> {
    // Check cache first
    if (this.cache.has(robotsUrl)) {
      return this.cache.get(robotsUrl)!;
    }

    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'RecipeVault-Bot/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch robots.txt: ${response.status}`);
    }

    const text = await response.text();
    const robotsData = this.parseRobotsTxt(text);
    
    // Cache the result
    this.cache.set(robotsUrl, robotsData);
    
    return robotsData;
  }

  private parseRobotsTxt(text: string): RobotsTxtData {
    const lines = text.split('\n').map(line => line.trim());
    const rules: RobotsTxtRule[] = [];
    const sitemap: string[] = [];
    let host: string | undefined;
    
    let currentRule: Partial<RobotsTxtRule> = {};
    
    for (const line of lines) {
      if (line.startsWith('#')) continue; // Skip comments
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const directive = line.substring(0, colonIndex).toLowerCase().trim();
      const value = line.substring(colonIndex + 1).trim();
      
      switch (directive) {
        case 'user-agent':
          // Save previous rule if it exists
          if (currentRule.userAgent) {
            rules.push(currentRule as RobotsTxtRule);
          }
          currentRule = { userAgent: value, allow: [], disallow: [] };
          break;
          
        case 'allow':
          if (currentRule.userAgent) {
            currentRule.allow = currentRule.allow || [];
            currentRule.allow.push(value);
          }
          break;
          
        case 'disallow':
          if (currentRule.userAgent) {
            currentRule.disallow = currentRule.disallow || [];
            currentRule.disallow.push(value);
          }
          break;
          
        case 'crawl-delay':
          if (currentRule.userAgent) {
            const delay = parseFloat(value);
            if (!isNaN(delay)) {
              currentRule.crawlDelay = delay;
            }
          }
          break;
          
        case 'sitemap':
          sitemap.push(value);
          break;
          
        case 'host':
          host = value;
          break;
      }
    }
    
    // Add the last rule
    if (currentRule.userAgent) {
      rules.push(currentRule as RobotsTxtRule);
    }
    
    return { rules, sitemap, host };
  }

  private isUrlAllowed(robotsData: RobotsTxtData, url: string, userAgent: string): boolean {
    const urlPath = new URL(url).pathname;
    
    // Find matching rules for our user agent
    const matchingRules = robotsData.rules.filter(rule => 
      rule.userAgent === '*' || rule.userAgent.toLowerCase() === userAgent.toLowerCase()
    );
    
    // If no specific rules, check wildcard rules
    if (matchingRules.length === 0) {
      const wildcardRules = robotsData.rules.filter(rule => rule.userAgent === '*');
      if (wildcardRules.length === 0) {
        return true; // No rules found, assume allowed
      }
      matchingRules.push(...wildcardRules);
    }
    
    // Check each rule
    for (const rule of matchingRules) {
      // Check disallow rules first
      for (const disallowPath of rule.disallow) {
        if (this.pathMatches(urlPath, disallowPath)) {
          return false;
        }
      }
      
      // Check allow rules (they override disallow rules)
      for (const allowPath of rule.allow) {
        if (this.pathMatches(urlPath, allowPath)) {
          return true;
        }
      }
    }
    
    return true; // No rules matched, assume allowed
  }

  private pathMatches(urlPath: string, rulePath: string): boolean {
    // Handle wildcard patterns
    if (rulePath === '*') {
      return true;
    }
    
    if (rulePath === '/') {
      return urlPath === '/';
    }
    
    // Convert rule path to regex pattern
    let pattern = rulePath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special characters
      .replace(/\\\*/g, '.*') // Convert * to .*
      .replace(/\\\?/g, '.'); // Convert ? to .
    
    // Add start anchor if not present
    if (!pattern.startsWith('^')) {
      pattern = '^' + pattern;
    }
    
    // Add end anchor if not present
    if (!pattern.endsWith('$')) {
      pattern = pattern + '.*';
    }
    
    const regex = new RegExp(pattern, 'i');
    return regex.test(urlPath);
  }

  private getCrawlDelay(robotsData: RobotsTxtData, userAgent: string): number | undefined {
    // Find matching rules for our user agent
    const matchingRules = robotsData.rules.filter(rule => 
      rule.userAgent === '*' || rule.userAgent.toLowerCase() === userAgent.toLowerCase()
    );
    
    // If no specific rules, check wildcard rules
    if (matchingRules.length === 0) {
      const wildcardRules = robotsData.rules.filter(rule => rule.userAgent === '*');
      if (wildcardRules.length === 0) {
        return undefined;
      }
      matchingRules.push(...wildcardRules);
    }
    
    // Return the first crawl delay found
    for (const rule of matchingRules) {
      if (rule.crawlDelay !== undefined) {
        return rule.crawlDelay * 1000; // Convert to milliseconds
      }
    }
    
    return undefined;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
} 