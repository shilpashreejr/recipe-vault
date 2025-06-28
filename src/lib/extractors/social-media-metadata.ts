export interface SocialMediaMetadata {
  platform: string;
  contentId: string;
  url: string;
  title?: string;
  description?: string;
  author: {
    username: string;
    displayName?: string;
    profileUrl?: string;
    verified?: boolean;
    followersCount?: number;
  };
  engagement: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    saves?: number;
  };
  timestamps: {
    published: string;
    scraped: string;
    lastUpdated?: string;
  };
  media: {
    images?: string[];
    videos?: string[];
    thumbnails?: string[];
  };
  tags: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  platformSpecific: {
    [key: string]: any;
  };
  privacy: {
    isPublic: boolean;
    isPrivate?: boolean;
    isArchived?: boolean;
  };
  categories: string[];
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  contentQuality?: 'high' | 'medium' | 'low';
}

export interface MetadataPreservationConfig {
  preserveEngagement: boolean;
  preserveAuthorInfo: boolean;
  preserveMedia: boolean;
  preserveLocation: boolean;
  preserveTimestamps: boolean;
  preservePlatformSpecific: boolean;
  maxMetadataAge: number; // in days
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export class SocialMediaMetadataPreservation {
  private config: MetadataPreservationConfig;

  constructor(config: Partial<MetadataPreservationConfig> = {}) {
    this.config = {
      preserveEngagement: true,
      preserveAuthorInfo: true,
      preserveMedia: true,
      preserveLocation: true,
      preserveTimestamps: true,
      preservePlatformSpecific: true,
      maxMetadataAge: 365, // 1 year
      compressionEnabled: false,
      encryptionEnabled: false,
      ...config
    };
  }

  createMetadata(
    platform: string,
    contentId: string,
    url: string,
    rawData: any
  ): SocialMediaMetadata {
    const now = new Date().toISOString();
    
    const metadata: SocialMediaMetadata = {
      platform,
      contentId,
      url,
      author: this.extractAuthorInfo(rawData),
      engagement: this.extractEngagementInfo(rawData),
      timestamps: {
        published: this.extractPublishedTime(rawData) || now,
        scraped: now
      },
      media: this.extractMediaInfo(rawData),
      tags: this.extractTags(rawData),
      location: this.extractLocationInfo(rawData),
      platformSpecific: this.extractPlatformSpecificData(rawData),
      privacy: this.extractPrivacyInfo(rawData),
      categories: this.extractCategories(rawData),
      language: this.extractLanguage(rawData),
      sentiment: this.analyzeSentiment(rawData),
      contentQuality: this.assessContentQuality(rawData)
    };

    return this.applyConfig(metadata);
  }

  private extractAuthorInfo(rawData: any): SocialMediaMetadata['author'] {
    if (!this.config.preserveAuthorInfo) {
      return { username: 'unknown' };
    }

    const author: SocialMediaMetadata['author'] = {
      username: rawData.author?.username || rawData.username || rawData.user?.username || 'unknown',
      displayName: rawData.author?.displayName || rawData.displayName || rawData.user?.displayName,
      profileUrl: rawData.author?.profileUrl || rawData.profileUrl || rawData.user?.profileUrl,
      verified: rawData.author?.verified || rawData.verified || rawData.user?.verified,
      followersCount: rawData.author?.followersCount || rawData.followersCount || rawData.user?.followersCount
    };

    return author;
  }

  private extractEngagementInfo(rawData: any): SocialMediaMetadata['engagement'] {
    if (!this.config.preserveEngagement) {
      return {};
    }

    return {
      likes: rawData.likes || rawData.favoriteCount || rawData.heartCount,
      comments: rawData.comments || rawData.commentCount || rawData.replyCount,
      shares: rawData.shares || rawData.retweetCount || rawData.repostCount,
      views: rawData.views || rawData.viewCount || rawData.playCount,
      saves: rawData.saves || rawData.saveCount || rawData.bookmarkCount
    };
  }

  private extractPublishedTime(rawData: any): string | null {
    if (!this.config.preserveTimestamps) {
      return null;
    }

    return rawData.publishedAt || 
           rawData.createdAt || 
           rawData.timestamp || 
           rawData.date || 
           rawData.time ||
           null;
  }

  private extractMediaInfo(rawData: any): SocialMediaMetadata['media'] {
    if (!this.config.preserveMedia) {
      return {};
    }

    return {
      images: rawData.images || rawData.imageUrls || rawData.media?.images || [],
      videos: rawData.videos || rawData.videoUrls || rawData.media?.videos || [],
      thumbnails: rawData.thumbnails || rawData.thumbnailUrls || rawData.media?.thumbnails || []
    };
  }

  private extractTags(rawData: any): string[] {
    const tags = rawData.tags || rawData.hashtags || rawData.categories || [];
    return Array.isArray(tags) ? tags : [];
  }

  private extractLocationInfo(rawData: any): SocialMediaMetadata['location'] {
    if (!this.config.preserveLocation) {
      return undefined;
    }

    if (!rawData.location && !rawData.coordinates) {
      return undefined;
    }

    return {
      name: rawData.location?.name || rawData.locationName,
      coordinates: rawData.location?.coordinates || rawData.coordinates
    };
  }

  private extractPlatformSpecificData(rawData: any): { [key: string]: any } {
    if (!this.config.preservePlatformSpecific) {
      return {};
    }

    const platformSpecific: { [key: string]: any } = {};

    // Extract platform-specific fields
    Object.keys(rawData).forEach(key => {
      if (key.startsWith('platform_') || 
          key.includes('_id') || 
          key.includes('_url') ||
          key.includes('_type') ||
          key.includes('_format')) {
        platformSpecific[key] = rawData[key];
      }
    });

    return platformSpecific;
  }

  private extractPrivacyInfo(rawData: any): SocialMediaMetadata['privacy'] {
    return {
      isPublic: rawData.isPublic !== false,
      isPrivate: rawData.isPrivate || false,
      isArchived: rawData.isArchived || false
    };
  }

  private extractCategories(rawData: any): string[] {
    const categories = rawData.categories || rawData.tags || [];
    return Array.isArray(categories) ? categories : [];
  }

  private extractLanguage(rawData: any): string | undefined {
    return rawData.language || rawData.lang || undefined;
  }

  private analyzeSentiment(rawData: any): 'positive' | 'negative' | 'neutral' | undefined {
    // Simple sentiment analysis based on keywords
    const text = (rawData.description || rawData.title || rawData.content || '').toLowerCase();
    
    const positiveWords = ['delicious', 'amazing', 'love', 'great', 'best', 'perfect', 'wonderful', 'fantastic'];
    const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'disgusting', 'bad', 'horrible'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private assessContentQuality(rawData: any): 'high' | 'medium' | 'low' {
    const text = rawData.description || rawData.title || rawData.content || '';
    const mediaCount = (rawData.images?.length || 0) + (rawData.videos?.length || 0);
    const engagement = rawData.likes || rawData.comments || 0;
    
    let score = 0;
    
    // Text quality
    if (text.length > 100) score += 2;
    else if (text.length > 50) score += 1;
    
    // Media quality
    if (mediaCount > 2) score += 2;
    else if (mediaCount > 0) score += 1;
    
    // Engagement quality
    if (engagement > 1000) score += 2;
    else if (engagement > 100) score += 1;
    
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private applyConfig(metadata: SocialMediaMetadata): SocialMediaMetadata {
    const filtered: SocialMediaMetadata = { ...metadata };

    if (!this.config.preserveEngagement) {
      filtered.engagement = {};
    }

    if (!this.config.preserveAuthorInfo) {
      filtered.author = { username: 'anonymous' };
    }

    if (!this.config.preserveMedia) {
      filtered.media = {};
    }

    if (!this.config.preserveLocation) {
      filtered.location = undefined;
    }

    if (!this.config.preserveTimestamps) {
      filtered.timestamps = {
        published: new Date().toISOString(),
        scraped: new Date().toISOString()
      };
    }

    if (!this.config.preservePlatformSpecific) {
      filtered.platformSpecific = {};
    }

    return filtered;
  }

  updateMetadata(
    existingMetadata: SocialMediaMetadata,
    newData: any
  ): SocialMediaMetadata {
    const updated: SocialMediaMetadata = { ...existingMetadata };

    // Update engagement metrics
    if (this.config.preserveEngagement) {
      updated.engagement = {
        ...updated.engagement,
        ...this.extractEngagementInfo(newData)
      };
    }

    // Update timestamps
    if (this.config.preserveTimestamps) {
      updated.timestamps.lastUpdated = new Date().toISOString();
    }

    // Update platform-specific data
    if (this.config.preservePlatformSpecific) {
      updated.platformSpecific = {
        ...updated.platformSpecific,
        ...this.extractPlatformSpecificData(newData)
      };
    }

    return updated;
  }

  validateMetadata(metadata: SocialMediaMetadata): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!metadata.platform) {
      errors.push('Platform is required');
    }

    if (!metadata.contentId) {
      errors.push('Content ID is required');
    }

    if (!metadata.url) {
      errors.push('URL is required');
    }

    if (!metadata.author?.username) {
      errors.push('Author username is required');
    }

    // URL validation
    try {
      new URL(metadata.url);
    } catch {
      errors.push('Invalid URL format');
    }

    // Timestamp validation
    if (metadata.timestamps.published) {
      const publishedDate = new Date(metadata.timestamps.published);
      if (isNaN(publishedDate.getTime())) {
        errors.push('Invalid published timestamp');
      }
    }

    if (metadata.timestamps.scraped) {
      const scrapedDate = new Date(metadata.timestamps.scraped);
      if (isNaN(scrapedDate.getTime())) {
        errors.push('Invalid scraped timestamp');
      }
    }

    // Engagement validation
    if (metadata.engagement) {
      Object.entries(metadata.engagement).forEach(([key, value]) => {
        if (value !== undefined && (typeof value !== 'number' || value < 0)) {
          errors.push(`Invalid engagement value for ${key}`);
        }
      });
    }

    // Location validation
    if (metadata.location?.coordinates) {
      const { latitude, longitude } = metadata.location.coordinates;
      if (latitude < -90 || latitude > 90) {
        errors.push('Invalid latitude value');
      }
      if (longitude < -180 || longitude > 180) {
        errors.push('Invalid longitude value');
      }
    }

    // Warnings for missing optional data
    if (!metadata.description && !metadata.title) {
      warnings.push('No description or title provided');
    }

    if (!metadata.media.images?.length && !metadata.media.videos?.length) {
      warnings.push('No media content found');
    }

    if (!metadata.tags.length) {
      warnings.push('No tags provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  isMetadataExpired(metadata: SocialMediaMetadata): boolean {
    const scrapedDate = new Date(metadata.timestamps.scraped);
    const now = new Date();
    const daysDiff = (now.getTime() - scrapedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > this.config.maxMetadataAge;
  }

  getMetadataSummary(metadata: SocialMediaMetadata): {
    platform: string;
    contentId: string;
    author: string;
    engagement: number;
    quality: string;
    age: number;
  } {
    const totalEngagement = Object.values(metadata.engagement).reduce((sum, val) => sum + (val || 0), 0);
    const age = (new Date().getTime() - new Date(metadata.timestamps.scraped).getTime()) / (1000 * 60 * 60 * 24);

    return {
      platform: metadata.platform,
      contentId: metadata.contentId,
      author: metadata.author.username,
      engagement: totalEngagement,
      quality: metadata.contentQuality || 'unknown',
      age: Math.round(age)
    };
  }

  getConfig(): MetadataPreservationConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<MetadataPreservationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
} 