import { detectPlatform, isSupportedUrl } from '../platform-detection';

describe('Platform Detection', () => {
  describe('detectPlatform', () => {
    it('should detect Instagram URLs', () => {
      expect(detectPlatform('https://instagram.com/p/abc123')).toBe('instagram');
      expect(detectPlatform('https://www.instagram.com/reel/xyz789')).toBe('instagram');
    });

    it('should detect TikTok URLs', () => {
      expect(detectPlatform('https://tiktok.com/@user/video/123456')).toBe('tiktok');
      expect(detectPlatform('https://vm.tiktok.com/abc123')).toBe('tiktok');
    });

    it('should detect Pinterest URLs', () => {
      expect(detectPlatform('https://pinterest.com/pin/123456')).toBe('pinterest');
      expect(detectPlatform('https://www.pinterest.com/user/board')).toBe('pinterest');
    });

    it('should detect Facebook URLs', () => {
      expect(detectPlatform('https://facebook.com/user/posts/123456')).toBe('facebook');
      expect(detectPlatform('https://www.facebook.com/groups/group/posts/123456')).toBe('facebook');
    });

    it('should detect Twitter/X URLs', () => {
      expect(detectPlatform('https://twitter.com/user/status/123456')).toBe('twitter');
      expect(detectPlatform('https://x.com/user/status/123456')).toBe('twitter');
    });

    it('should detect YouTube URLs', () => {
      expect(detectPlatform('https://youtube.com/watch?v=abc123')).toBe('youtube');
      expect(detectPlatform('https://youtu.be/abc123')).toBe('youtube');
    });

    it('should detect generic food blog URLs', () => {
      expect(detectPlatform('https://foodblog.com/recipe')).toBe('foodblog');
      expect(detectPlatform('https://www.cooking.com/recipe/123')).toBe('foodblog');
    });

    it('should return null for unsupported URLs', () => {
      expect(detectPlatform('https://unsupported.com/page')).toBeNull();
      expect(detectPlatform('https://example.com')).toBeNull();
      expect(detectPlatform('not-a-url')).toBeNull();
    });
  });

  describe('isSupportedUrl', () => {
    it('should return true for supported URLs', () => {
      expect(isSupportedUrl('https://instagram.com/p/abc123')).toBe(true);
      expect(isSupportedUrl('https://tiktok.com/@user/video/123456')).toBe(true);
      expect(isSupportedUrl('https://foodblog.com/recipe')).toBe(true);
    });

    it('should return false for unsupported URLs', () => {
      expect(isSupportedUrl('https://unsupported.com/page')).toBe(false);
      expect(isSupportedUrl('https://example.com')).toBe(false);
      expect(isSupportedUrl('not-a-url')).toBe(false);
    });
  });
}); 