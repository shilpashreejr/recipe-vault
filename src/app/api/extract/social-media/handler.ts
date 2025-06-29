import { SocialMediaRateLimiter } from '@/lib/extractors/social-media-rate-limiter';
import { SocialMediaMetadataPreservation } from '@/lib/extractors/social-media-metadata';
import { extractRecipeFromUrl } from '../url/extract-recipe';

const defaultRateLimiter = new SocialMediaRateLimiter();
const defaultMetadataPreservation = new SocialMediaMetadataPreservation();

export async function handleSocialMediaExtraction(
  { url, platform, options = {} }: { url: string, platform?: string, options?: any },
  rateLimiter = defaultRateLimiter,
  metadataPreservation = defaultMetadataPreservation
) {
  if (!url) {
    return { status: 400, body: { error: 'Missing URL' } };
  }
  const detectedPlatform = platform || detectSocialMediaPlatform(url);
  if (!detectedPlatform) {
    return { status: 400, body: { error: 'URL is not from a supported social media platform' } };
  }
  const supportedPlatforms = rateLimiter.getSupportedPlatforms();
  if (!supportedPlatforms.includes(detectedPlatform)) {
    return { status: 400, body: { error: `Unsupported social media platform: ${detectedPlatform}` } };
  }
  if (rateLimiter.isRateLimited(detectedPlatform)) {
    const timeUntilNext = rateLimiter.getTimeUntilNextRequest(detectedPlatform);
    return {
      status: 429,
      body: {
        error: 'Rate limit exceeded for this platform',
        timeUntilNext,
        retryAfter: Math.ceil(timeUntilNext / 1000)
      }
    };
  }
  const complianceValidation = rateLimiter.validateRequest(detectedPlatform, url);
  if (!complianceValidation.isValid) {
    return {
      status: 422,
      body: {
        error: 'Request does not comply with platform policies',
        details: complianceValidation.reason
      }
    };
  }
  try {
    await rateLimiter.waitForPermission(detectedPlatform);
    const extractionResult = await extractRecipeFromUrl(url, options);
    if (extractionResult.status !== 200) {
      return { status: extractionResult.status, body: extractionResult.body };
    }
    const contentId = extractContentIdFromUrl(url, detectedPlatform);
    const metadata = metadataPreservation.createMetadata(
      detectedPlatform,
      contentId,
      url,
      extractionResult.body
    );
    return {
      status: 200,
      body: {
        success: true,
        platform: detectedPlatform,
        recipe: extractionResult.body.recipe,
        metadata,
        compliance: {
          rateLimit: rateLimiter.getPlatformRateLimit(detectedPlatform),
          stats: rateLimiter.getRequestStats(detectedPlatform),
          validation: complianceValidation
        },
        extractedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Social media extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (errorMessage.includes('rate limit')) {
      return { status: 429, body: { error: 'Rate limit exceeded. Please wait before trying again.' } };
    }
    if (errorMessage.includes('compliance')) {
      return { status: 422, body: { error: 'Request does not comply with platform policies.' } };
    }
    if (errorMessage.includes('unsupported platform')) {
      return { status: 400, body: { error: 'Unsupported social media platform.' } };
    }
    return { status: 500, body: { error: `Failed to extract recipe from social media: ${errorMessage}` } };
  }
}

export function detectSocialMediaPlatform(url: string): string | null {
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/pinterest\.com/.test(url)) return 'pinterest';
  if (/facebook\.com/.test(url)) return 'facebook';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/whatsapp\.com/.test(url)) return 'whatsapp';
  return null;
}

export function extractContentIdFromUrl(url: string, platform: string): string {
  const urlObj = new URL(url);
  switch (platform) {
    case 'instagram': {
      const instagramMatch = url.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
      return instagramMatch ? instagramMatch[2] : urlObj.pathname;
    }
    case 'tiktok': {
      const tiktokMatch = url.match(/\/(?:@[^\/]+\/)?video\/(\d+)/);
      return tiktokMatch ? tiktokMatch[1] : urlObj.pathname;
    }
    case 'pinterest': {
      const pinterestMatch = url.match(/\/pin\/(\d+)/);
      return pinterestMatch ? pinterestMatch[1] : urlObj.pathname;
    }
    case 'facebook': {
      const facebookMatch = url.match(/(?:posts\/|fbid=)(\d+)/);
      return facebookMatch ? facebookMatch[1] : urlObj.pathname;
    }
    case 'twitter': {
      const twitterMatch = url.match(/\/status\/(\d+)/);
      return twitterMatch ? twitterMatch[1] : urlObj.pathname;
    }
    case 'youtube': {
      const youtubeMatch = url.match(/(?:v=|\/embed\/|\/v\/|\/watch\?.*v=)([a-zA-Z0-9_-]{11})/);
      return youtubeMatch ? youtubeMatch[1] : urlObj.pathname;
    }
    case 'whatsapp': {
      const whatsappMatch = url.match(/\/\?text=([^&]+)/);
      return whatsappMatch ? decodeURIComponent(whatsappMatch[1]) : urlObj.pathname;
    }
    default:
      return urlObj.pathname;
  }
} 