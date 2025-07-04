// Main web scraper
export { WebScraper } from './web-scraper';
export type { ScrapedRecipe, ScrapingOptions } from './web-scraper';

// Specialized scrapers
export { InstagramScraper } from './instagram-scraper';
export type { InstagramScrapingOptions } from './instagram-scraper';
export { TikTokScraper } from './tiktok-scraper';
export type { TikTokScrapingOptions, TikTokRecipe } from './tiktok-scraper';
export { PinterestScraper } from './pinterest-scraper';
export type { PinterestScrapingOptions, PinterestRecipe } from './pinterest-scraper';
export { FacebookScraper } from './facebook-scraper';
export type { FacebookScrapingOptions, FacebookRecipe } from './facebook-scraper';
export { TwitterScraper } from './twitter-scraper';
export type { TwitterRecipeData } from './twitter-scraper';
export { FoodBlogScraper } from './food-blog-scraper';
export type { FoodBlogScrapingOptions, FoodBlogRecipe } from './food-blog-scraper';
export { YouTubeScraper } from './youtube-scraper';
export type { YouTubeRecipeData } from './youtube-scraper';
export { WhatsAppScraper } from './whatsapp-scraper';
export type { WhatsAppRecipeData } from './whatsapp-scraper';
export { EmailScraper } from './email-scraper';
export type { EmailRecipeData } from './email-scraper';

// Rate limiting and error handling
export { RateLimiter } from './rate-limiter';
export type { RateLimitConfig } from './rate-limiter';
export { RateLimitPresets } from './rate-limiter';
export { ScrapingErrorHandler } from './error-handler';
export type { ScrapingError } from './error-handler';
export { ScrapingErrorType } from './error-handler';

// Robots.txt compliance
export { RobotsTxtChecker } from './robots-txt';
export type { RobotsTxtData, RobotsTxtRule } from './robots-txt';

// Manual extraction fallback
export { ManualExtractor } from './manual-extractor';
export type { ManualRecipeInput, ManualExtractionValidation } from './manual-extractor';

export { SocialMediaRateLimiter } from './social-media-rate-limiter';
export type { SocialMediaRateLimitConfig, ComplianceConfig } from './social-media-rate-limiter';

export { SocialMediaMetadataPreservation } from './social-media-metadata';
export type { SocialMediaMetadata, MetadataPreservationConfig } from './social-media-metadata'; 