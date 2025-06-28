import { detectPlatform } from './platform-detection';

export async function extractRecipeFromUrl(url: string, options: any = {}) {
  if (!url) {
    return { status: 400, body: { error: 'Missing URL' } };
  }
  const platform = detectPlatform(url);
  if (!platform) {
    return { status: 400, body: { error: 'Unsupported URL/platform' } };
  }
  // Only import extractors if platform is supported
  const { InstagramScraper, TikTokScraper, PinterestScraper, FacebookScraper, TwitterScraper, YouTubeScraper, FoodBlogScraper } = await import('@/lib/extractors');
  const { RateLimiter, RateLimitPresets } = await import('@/lib/extractors');
  let scraper, recipe;
  try {
    switch (platform) {
      case 'instagram':
        scraper = new InstagramScraper();
        await new RateLimiter(RateLimitPresets.instagram).waitForPermission();
        recipe = await scraper.scrapeInstagramRecipe(url, options);
        await scraper.close();
        break;
      case 'tiktok':
        scraper = new TikTokScraper();
        await new RateLimiter(RateLimitPresets.conservative).waitForPermission();
        recipe = await scraper.scrapeTikTokRecipe(url, options);
        await scraper.close();
        break;
      case 'pinterest':
        scraper = new PinterestScraper();
        await new RateLimiter(RateLimitPresets.conservative).waitForPermission();
        recipe = await scraper.scrapePinterestRecipe(url, options);
        await scraper.close();
        break;
      case 'facebook':
        scraper = new FacebookScraper();
        await new RateLimiter(RateLimitPresets.conservative).waitForPermission();
        recipe = await scraper.scrapeFacebookRecipe(url, options);
        await scraper.close();
        break;
      case 'twitter':
        scraper = new TwitterScraper();
        recipe = await scraper.scrapeTwitterRecipe(url);
        break;
      case 'youtube':
        scraper = new YouTubeScraper();
        recipe = await scraper.scrapeYouTubeRecipe(url);
        break;
      case 'foodblog':
        scraper = new FoodBlogScraper();
        recipe = await scraper.scrapeFoodBlogRecipe(url);
        break;
      default:
        return { status: 400, body: { error: 'Unsupported platform' } };
    }
    return { status: 200, body: { success: true, recipe, source: url, extractedAt: new Date() } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { status: 500, body: { error: `Failed to extract recipe: ${errorMessage}` } };
  }
} 