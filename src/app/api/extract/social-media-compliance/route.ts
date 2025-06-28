import { NextRequest, NextResponse } from 'next/server';
import { SocialMediaRateLimiter } from '@/lib/extractors/social-media-rate-limiter';

// Global instance of the social media rate limiter
const socialMediaRateLimiter = new SocialMediaRateLimiter();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (platform) {
      // Get specific platform rate limit info
      const rateLimit = socialMediaRateLimiter.getPlatformRateLimit(platform);
      const stats = socialMediaRateLimiter.getRequestStats(platform);
      const isRateLimited = socialMediaRateLimiter.isRateLimited(platform);
      const timeUntilNext = socialMediaRateLimiter.getTimeUntilNextRequest(platform);

      if (!rateLimit) {
        return NextResponse.json(
          { error: `Unsupported platform: ${platform}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        platform,
        rateLimit,
        stats,
        isRateLimited,
        timeUntilNext
      });
    } else {
      // Get all supported platforms
      const platforms = socialMediaRateLimiter.getSupportedPlatforms();
      const complianceConfig = socialMediaRateLimiter.getComplianceConfig();
      
      const platformInfo = platforms.map(platform => {
        const rateLimit = socialMediaRateLimiter.getPlatformRateLimit(platform);
        const stats = socialMediaRateLimiter.getRequestStats(platform);
        const isRateLimited = socialMediaRateLimiter.isRateLimited(platform);
        
        return {
          platform,
          rateLimit,
          stats,
          isRateLimited
        };
      });

      return NextResponse.json({
        success: true,
        platforms: platformInfo,
        complianceConfig
      });
    }

  } catch (error) {
    console.error('Social media compliance error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to get social media compliance info: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, platform, config } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'reset_rate_limit':
        if (!platform) {
          return NextResponse.json(
            { error: 'Platform is required for reset_rate_limit action' },
            { status: 400 }
          );
        }
        
        socialMediaRateLimiter.resetRateLimit(platform);
        
        return NextResponse.json({
          success: true,
          message: `Rate limit reset for platform: ${platform}`
        });

      case 'update_compliance_config':
        if (!config || typeof config !== 'object') {
          return NextResponse.json(
            { error: 'Valid compliance config is required' },
            { status: 400 }
          );
        }
        
        socialMediaRateLimiter.updateComplianceConfig(config);
        
        return NextResponse.json({
          success: true,
          message: 'Compliance configuration updated',
          complianceConfig: socialMediaRateLimiter.getComplianceConfig()
        });

      case 'validate_request':
        if (!platform || !config?.url) {
          return NextResponse.json(
            { error: 'Platform and URL are required for validate_request action' },
            { status: 400 }
          );
        }
        
        const validation = socialMediaRateLimiter.validateRequest(platform, config.url);
        
        return NextResponse.json({
          success: true,
          validation
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Social media compliance error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to perform social media compliance action: ${errorMessage}` },
      { status: 500 }
    );
  }
} 