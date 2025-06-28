import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock the OCR service
jest.mock('@/lib/ocr/ocr-service', () => ({
  ocrService: {
    extractText: jest.fn(),
    getSupportedLanguages: jest.fn(),
  },
}));

describe('/api/extract/image', () => {
  const mockOcrService = require('@/lib/ocr/ocr-service').ocrService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should extract text from valid image file', async () => {
      const mockResult = {
        text: 'Sample recipe text',
        confidence: 85.5,
        processingTime: 1500,
        language: 'eng',
      };

      mockOcrService.extractText.mockResolvedValue(mockResult);

      const formData = new FormData();
      const file = new File(['test image content'], 'recipe.jpg', { type: 'image/jpeg' });
      formData.append('image', file);
      formData.append('language', 'eng');
      formData.append('confidenceThreshold', '70');
      formData.append('enablePreprocessing', 'true');

      const request = new NextRequest('http://localhost:3000/api/extract/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toBe('Sample recipe text');
      expect(data.data.confidence).toBe(85.5);
      expect(data.data.processingTime).toBe(1500);
      expect(data.data.language).toBe('eng');
      expect(data.data.originalFileName).toBe('recipe.jpg');
      expect(data.data.fileType).toBe('image/jpeg');

      expect(mockOcrService.extractText).toHaveBeenCalledWith(
        expect.any(Blob),
        {
          language: 'eng',
          confidenceThreshold: 70,
          preprocessing: {
            resize: true,
            enhance: true,
            denoise: true,
          },
        }
      );
    });

    it('should return error when no image file is provided', async () => {
      const formData = new FormData();
      formData.append('language', 'eng');

      const request = new NextRequest('http://localhost:3000/api/extract/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No image file provided');
    });

    it('should return error for unsupported file type', async () => {
      const formData = new FormData();
      const file = new File(['test'], 'document.txt', { type: 'text/plain' });
      formData.append('image', file);

      const request = new NextRequest('http://localhost:3000/api/extract/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Unsupported file type');
    });

    it('should return error for oversized file', async () => {
      const formData = new FormData();
      // Create a file larger than 10MB
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      formData.append('image', file);

      const request = new NextRequest('http://localhost:3000/api/extract/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File size too large. Maximum size is 10MB');
    });

    it('should use default options when not provided', async () => {
      const mockResult = {
        text: 'Default options text',
        confidence: 75.0,
        processingTime: 1000,
        language: 'eng',
      };

      mockOcrService.extractText.mockResolvedValue(mockResult);

      const formData = new FormData();
      const file = new File(['test'], 'recipe.png', { type: 'image/png' });
      formData.append('image', file);

      const request = new NextRequest('http://localhost:3000/api/extract/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockOcrService.extractText).toHaveBeenCalledWith(
        expect.any(Blob),
        {
          language: 'eng',
          confidenceThreshold: 60,
          preprocessing: {
            resize: false,
            enhance: false,
            denoise: false,
          },
        }
      );
    });

    it('should handle OCR service errors', async () => {
      mockOcrService.extractText.mockRejectedValue(new Error('OCR processing failed'));

      const formData = new FormData();
      const file = new File(['test'], 'recipe.jpg', { type: 'image/jpeg' });
      formData.append('image', file);

      const request = new NextRequest('http://localhost:3000/api/extract/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to extract text from image');
      expect(data.details).toBe('OCR processing failed');
    });

    it('should support different image formats', async () => {
      const mockResult = {
        text: 'Multi-format text',
        confidence: 80.0,
        processingTime: 1200,
        language: 'eng',
      };

      mockOcrService.extractText.mockResolvedValue(mockResult);

      const formats = [
        { type: 'image/jpeg', name: 'recipe.jpg' },
        { type: 'image/png', name: 'recipe.png' },
        { type: 'image/webp', name: 'recipe.webp' },
        { type: 'image/gif', name: 'recipe.gif' },
      ];

      for (const format of formats) {
        const formData = new FormData();
        const file = new File(['test'], format.name, { type: format.type });
        formData.append('image', file);

        const request = new NextRequest('http://localhost:3000/api/extract/image', {
          method: 'POST',
          body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.fileType).toBe(format.type);
        expect(data.data.originalFileName).toBe(format.name);
      }
    });
  });

  describe('GET', () => {
    it('should return OCR information and supported formats', async () => {
      const mockLanguages = ['eng', 'fra', 'deu', 'spa'];
      mockOcrService.getSupportedLanguages.mockResolvedValue(mockLanguages);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.supportedLanguages).toEqual(mockLanguages);
      expect(data.data.supportedFileTypes).toEqual([
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
      ]);
      expect(data.data.maxFileSize).toBe('10MB');
      expect(data.data.defaultLanguage).toBe('eng');
      expect(data.data.defaultConfidenceThreshold).toBe(60);

      expect(mockOcrService.getSupportedLanguages).toHaveBeenCalled();
    });

    it('should handle errors when getting OCR information', async () => {
      mockOcrService.getSupportedLanguages.mockRejectedValue(new Error('Service unavailable'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get OCR information');
      expect(data.details).toBe('Service unavailable');
    });
  });
}); 