import { NextRequest, NextResponse } from 'next/server';
import { handleSocialMediaExtraction } from './handler';

export async function POST(request: NextRequest) {
  const { url, platform, options = {} } = await request.json();
  const result = await handleSocialMediaExtraction({ url, platform, options });
  return NextResponse.json(result.body, { status: result.status });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (platform) {
      // Get platform-specific information
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
      // Get all supported social media platforms
      const platforms = socialMediaRateLimiter.getSupportedPlatforms();
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
        totalPlatforms: platforms.length
      });
    }

  } catch (error) {
    console.error('Social media info error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to get social media information: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function detectSocialMediaPlatform(url: string): string | null {
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/pinterest\.com/.test(url)) return 'pinterest';
  if (/facebook\.com/.test(url)) return 'facebook';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/whatsapp\.com/.test(url)) return 'whatsapp';
  return null;
}

function extractContentIdFromUrl(url: string, platform: string): string {
  const urlObj = new URL(url);
  
  switch (platform) {
    case 'instagram':
      // Extract from /p/ or /reel/ or /tv/
      const instagramMatch = url.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
      return instagramMatch ? instagramMatch[2] : urlObj.pathname;
      
    case 'tiktok':
      // Extract from /@username/video/ or /video/
      const tiktokMatch = url.match(/\/(?:@[^\/]+\/)?video\/(\d+)/);
      return tiktokMatch ? tiktokMatch[1] : urlObj.pathname;
      
    case 'pinterest':
      // Extract from /pin/
      const pinterestMatch = url.match(/\/pin\/(\d+)/);
      return pinterestMatch ? pinterestMatch[1] : urlObj.pathname;
      
    case 'facebook':
      // Extract from posts/ or photo.php?fbid=
      const facebookMatch = url.match(/(?:posts\/|fbid=)(\d+)/);
      return facebookMatch ? facebookMatch[1] : urlObj.pathname;
      
    case 'twitter':
      // Extract from /status/
      const twitterMatch = url.match(/\/status\/(\d+)/);
      return twitterMatch ? twitterMatch[1] : urlObj.pathname;
      
    case 'youtube':
      // Extract video ID from various YouTube URL formats
      const youtubeMatch = url.match(/(?:v=|\/embed\/|\/v\/|\/watch\?.*v=)([a-zA-Z0-9_-]{11})/);
      return youtubeMatch ? youtubeMatch[1] : urlObj.pathname;
      
    case 'whatsapp':
      // Extract from WhatsApp share links
      const whatsappMatch = url.match(/\/\?text=([^&]+)/);
      return whatsappMatch ? decodeURIComponent(whatsappMatch[1]) : urlObj.pathname;
      
    default:
      return urlObj.pathname;
  }
} 