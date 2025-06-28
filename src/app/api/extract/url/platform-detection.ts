export function detectPlatform(url: string): string | null {
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/pinterest\.com/.test(url)) return 'pinterest';
  if (/facebook\.com/.test(url)) return 'facebook';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/https?:\/\/(www\.)?[^\/]+\.(com|org|net|co|uk|ca|au)\/.*(recipe|cook|food|meal|dish)/i.test(url)) return 'foodblog';
  return null;
}

export function isSupportedUrl(url: string): boolean {
  return detectPlatform(url) !== null;
} 