export enum ScrapingErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_URL = 'INVALID_URL',
  UNSUPPORTED_SITE = 'UNSUPPORTED_SITE',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ScrapingError {
  type: ScrapingErrorType;
  message: string;
  url?: string;
  originalError?: Error;
  retryable: boolean;
  retryAfter?: number; // in milliseconds
}

export class ScrapingErrorHandler {
  static createError(
    type: ScrapingErrorType,
    message: string,
    url?: string,
    originalError?: Error
  ): ScrapingError {
    const retryable = this.isRetryableError(type);
    const retryAfter = this.getRetryAfter(type);
    
    return {
      type,
      message,
      url,
      originalError,
      retryable,
      retryAfter
    };
  }

  static isRetryableError(type: ScrapingErrorType): boolean {
    const retryableErrors = [
      ScrapingErrorType.NETWORK_ERROR,
      ScrapingErrorType.TIMEOUT_ERROR,
      ScrapingErrorType.RATE_LIMITED,
      ScrapingErrorType.ACCESS_DENIED
    ];
    
    return retryableErrors.includes(type);
  }

  static getRetryAfter(type: ScrapingErrorType): number | undefined {
    switch (type) {
      case ScrapingErrorType.RATE_LIMITED:
        return 60000; // 1 minute
      case ScrapingErrorType.ACCESS_DENIED:
        return 300000; // 5 minutes
      case ScrapingErrorType.TIMEOUT_ERROR:
        return 10000; // 10 seconds
      case ScrapingErrorType.NETWORK_ERROR:
        return 5000; // 5 seconds
      default:
        return undefined;
    }
  }

  static parseError(error: unknown, url?: string): ScrapingError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Network errors
      if (message.includes('net::') || message.includes('network') || message.includes('connection')) {
        return this.createError(ScrapingErrorType.NETWORK_ERROR, error.message, url, error);
      }
      
      // Timeout errors
      if (message.includes('timeout') || message.includes('timed out')) {
        return this.createError(ScrapingErrorType.TIMEOUT_ERROR, error.message, url, error);
      }
      
      // Rate limiting
      if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
        return this.createError(ScrapingErrorType.RATE_LIMITED, error.message, url, error);
      }
      
      // Access denied
      if (message.includes('access denied') || message.includes('forbidden') || message.includes('403')) {
        return this.createError(ScrapingErrorType.ACCESS_DENIED, error.message, url, error);
      }
      
      // Invalid URL
      if (message.includes('invalid url') || message.includes('url')) {
        return this.createError(ScrapingErrorType.INVALID_URL, error.message, url, error);
      }
      
      // Parse errors
      if (message.includes('parse') || message.includes('json') || message.includes('syntax')) {
        return this.createError(ScrapingErrorType.PARSE_ERROR, error.message, url, error);
      }
      
      // Unknown error
      return this.createError(ScrapingErrorType.UNKNOWN_ERROR, error.message, url, error);
    }
    
    // Non-Error objects
    return this.createError(
      ScrapingErrorType.UNKNOWN_ERROR,
      String(error),
      url
    );
  }

  static getErrorMessage(error: ScrapingError): string {
    switch (error.type) {
      case ScrapingErrorType.NETWORK_ERROR:
        return `Network error while scraping ${error.url}: ${error.message}`;
      case ScrapingErrorType.TIMEOUT_ERROR:
        return `Request timed out while scraping ${error.url}: ${error.message}`;
      case ScrapingErrorType.RATE_LIMITED:
        return `Rate limited while scraping ${error.url}. Please try again later.`;
      case ScrapingErrorType.ACCESS_DENIED:
        return `Access denied while scraping ${error.url}. The site may be blocking automated requests.`;
      case ScrapingErrorType.INVALID_URL:
        return `Invalid URL provided: ${error.url}`;
      case ScrapingErrorType.UNSUPPORTED_SITE:
        return `This site is not supported for recipe extraction: ${error.url}`;
      case ScrapingErrorType.PARSE_ERROR:
        return `Failed to parse recipe data from ${error.url}: ${error.message}`;
      case ScrapingErrorType.UNKNOWN_ERROR:
        return `Unknown error while scraping ${error.url}: ${error.message}`;
      default:
        return error.message;
    }
  }

  static shouldRetry(error: ScrapingError, attemptCount: number): boolean {
    const maxRetries = 3;
    
    if (attemptCount >= maxRetries) {
      return false;
    }
    
    return error.retryable;
  }

  static getRetryDelay(error: ScrapingError, attemptCount: number): number {
    const baseDelay = error.retryAfter || 5000;
    const exponentialBackoff = Math.pow(2, attemptCount);
    return Math.min(baseDelay * exponentialBackoff, 60000); // Max 1 minute
  }
} 