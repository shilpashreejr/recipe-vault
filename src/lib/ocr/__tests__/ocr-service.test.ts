import { OCRService, ocrService, OCRResult, OCROptions } from '../ocr-service';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(),
}));

// Mock canvas and image APIs for browser environment
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock canvas
const mockCanvas = {
  width: 100,
  height: 100,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(400), // 100x100x4
    })),
    putImageData: jest.fn(),
  })),
  toBlob: jest.fn((callback) => callback(new Blob(['test'], { type: 'image/png' }))),
};

// Mock document.createElement
const originalCreateElement = global.document?.createElement;
global.document = {
  ...global.document,
  createElement: jest.fn((tag) => {
    if (tag === 'canvas') return mockCanvas;
    return originalCreateElement ? originalCreateElement.call(global.document, tag) : {};
  }),
} as any;

// Mock Image constructor
const MockImage = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  width: number = 100;
  height: number = 100;
} as any;

global.Image = MockImage;

describe('OCRService', () => {
  let service: OCRService;
  let mockWorker: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock worker
    mockWorker = {
      recognize: jest.fn(),
      terminate: jest.fn(),
    };

    // Mock createWorker to return our mock worker
    const { createWorker } = require('tesseract.js');
    createWorker.mockResolvedValue(mockWorker);

    service = new OCRService();
  });

  afterEach(async () => {
    await service.terminate();
  });

  describe('initialization', () => {
    it('should initialize successfully with default options', async () => {
      await service.initialize();

      expect(service.isReady()).toBe(true);
      expect(require('tesseract.js').createWorker).toHaveBeenCalledWith('eng');
    });

    it('should initialize with custom language', async () => {
      await service.initialize({ language: 'fra' });

      expect(service.isReady()).toBe(true);
      expect(require('tesseract.js').createWorker).toHaveBeenCalledWith('fra');
    });

    it('should not reinitialize if already initialized', async () => {
      await service.initialize();
      const firstWorker = mockWorker;

      await service.initialize();

      expect(require('tesseract.js').createWorker).toHaveBeenCalledTimes(1);
      expect(service.isReady()).toBe(true);
    });

    it('should throw error if worker creation fails', async () => {
      const { createWorker } = require('tesseract.js');
      createWorker.mockRejectedValue(new Error('Worker creation failed'));

      await expect(service.initialize()).rejects.toThrow('Failed to initialize OCR worker: Worker creation failed');
      expect(service.isReady()).toBe(false);
    });
  });

  describe('text extraction', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should extract text from image successfully', async () => {
      const mockResult = {
        data: {
          text: 'Sample recipe text',
          confidence: 85.5,
        },
      };

      mockWorker.recognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      const result = await service.extractText(imageBlob, {
        preprocessing: {
          resize: false,
          enhance: false,
          denoise: false,
        },
      });

      expect(result).toEqual({
        text: 'Sample recipe text',
        confidence: 85.5,
        processingTime: expect.any(Number),
        language: 'eng',
      });

      expect(mockWorker.recognize).toHaveBeenCalledWith(imageBlob);
    });

    it('should extract text with custom options', async () => {
      const mockResult = {
        data: {
          text: 'Custom recipe text',
          confidence: 90.0,
        },
      };

      mockWorker.recognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      const options: OCROptions = {
        language: 'fra',
        confidenceThreshold: 80,
        preprocessing: {
          resize: false,
          enhance: false,
          denoise: false,
        },
      };

      const result = await service.extractText(imageBlob, options);

      expect(result.language).toBe('fra');
      expect(result.confidence).toBe(90.0);
    });

    it('should auto-initialize if not initialized', async () => {
      const newService = new OCRService();
      const mockResult = {
        data: {
          text: 'Auto-initialized text',
          confidence: 75.0,
        },
      };

      mockWorker.recognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      const result = await newService.extractText(imageBlob, {
        preprocessing: {
          resize: false,
          enhance: false,
          denoise: false,
        },
      });

      expect(result.text).toBe('Auto-initialized text');
      expect(newService.isReady()).toBe(true);

      await newService.terminate();
    });

    it('should throw error if worker is not available', async () => {
      const uninitializedService = new OCRService();
      
      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      // Mock createWorker to return null
      const { createWorker } = require('tesseract.js');
      createWorker.mockResolvedValue(null);

      await expect(uninitializedService.extractText(imageBlob)).rejects.toThrow('OCR worker not initialized');
    });

    it('should throw error if OCR recognition fails', async () => {
      mockWorker.recognize.mockRejectedValue(new Error('Recognition failed'));

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      await expect(service.extractText(imageBlob, {
        preprocessing: {
          resize: false,
          enhance: false,
          denoise: false,
        },
      })).rejects.toThrow('OCR extraction failed: Recognition failed');
    });

    it('should handle preprocessing failure gracefully', async () => {
      const mockResult = {
        data: {
          text: 'Text without preprocessing',
          confidence: 80.0,
        },
      };

      mockWorker.recognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      // Test with preprocessing enabled (should fail gracefully)
      const result = await service.extractText(imageBlob, {
        preprocessing: {
          resize: true,
          enhance: true,
          denoise: true,
        },
      });

      expect(result.text).toBe('Text without preprocessing');
      expect(result.confidence).toBe(80.0);
    });
  });

  describe('image preprocessing', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should skip preprocessing when disabled', async () => {
      const mockResult = {
        data: {
          text: 'Original text',
          confidence: 82.0,
        },
      };

      mockWorker.recognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      const options: OCROptions = {
        preprocessing: {
          resize: false,
          enhance: false,
          denoise: false,
        },
      };

      await service.extractText(imageBlob, options);

      // Should call recognize with the original image
      expect(mockWorker.recognize).toHaveBeenCalledWith(imageBlob);
    });

    it('should handle canvas unavailability gracefully', async () => {
      const mockResult = {
        data: {
          text: 'Text with canvas fallback',
          confidence: 85.0,
        },
      };

      mockWorker.recognize.mockResolvedValue(mockResult);

      // Mock canvas to be unavailable
      const originalDocument = global.document;
      global.document = undefined as any;

      const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
      
      try {
        const result = await service.extractText(imageBlob, {
          preprocessing: {
            resize: true,
            enhance: true,
            denoise: true,
          },
        });

        expect(result.text).toBe('Text with canvas fallback');
        expect(result.confidence).toBe(85.0);
      } finally {
        // Restore document
        global.document = originalDocument;
      }
    });
  });

  describe('supported languages', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return list of supported languages', async () => {
      const languages = await service.getSupportedLanguages();

      expect(languages).toEqual([
        'eng', 'fra', 'deu', 'spa', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi_sim'
      ]);
    });

    it('should auto-initialize if not initialized', async () => {
      const newService = new OCRService();
      
      const languages = await newService.getSupportedLanguages();

      expect(languages).toEqual([
        'eng', 'fra', 'deu', 'spa', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi_sim'
      ]);
      expect(newService.isReady()).toBe(true);

      await newService.terminate();
    });

    it('should throw error if worker is not available', async () => {
      const uninitializedService = new OCRService();
      
      // Mock createWorker to return null
      const { createWorker } = require('tesseract.js');
      createWorker.mockResolvedValue(null);

      await expect(uninitializedService.getSupportedLanguages()).rejects.toThrow('OCR worker not initialized');
    });
  });

  describe('termination', () => {
    it('should terminate worker successfully', async () => {
      await service.initialize();
      expect(service.isReady()).toBe(true);

      await service.terminate();

      expect(mockWorker.terminate).toHaveBeenCalled();
      expect(service.isReady()).toBe(false);
    });

    it('should handle termination when not initialized', async () => {
      await service.terminate();
      expect(mockWorker.terminate).not.toHaveBeenCalled();
    });
  });

  describe('ready state', () => {
    it('should return false when not initialized', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should return true when initialized', async () => {
      await service.initialize();
      expect(service.isReady()).toBe(true);
    });

    it('should return false after termination', async () => {
      await service.initialize();
      await service.terminate();
      expect(service.isReady()).toBe(false);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(ocrService).toBeInstanceOf(OCRService);
    });

    it('should be the same instance across imports', () => {
      const { ocrService: importedOcrService } = require('../ocr-service');
      expect(ocrService).toBe(importedOcrService);
    });
  });
}); 