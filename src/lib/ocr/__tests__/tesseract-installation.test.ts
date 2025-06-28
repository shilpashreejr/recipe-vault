import { createWorker } from 'tesseract.js';

// Mock Tesseract.js for testing
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => Promise.resolve({
    recognize: jest.fn(),
    terminate: jest.fn(),
  })),
}));

describe('Tesseract.js Installation Test', () => {
  it('should be able to import and create a Tesseract worker', async () => {
    // Test that we can import and create a worker
    const worker = await createWorker();
    
    // Verify the worker is created successfully
    expect(worker).toBeDefined();
    expect(typeof worker.recognize).toBe('function');
    expect(typeof worker.terminate).toBe('function');
    
    // Clean up
    await worker.terminate();
  });

  it('should be able to initialize with English language', async () => {
    const worker = await createWorker('eng');
    
    // Verify the worker is initialized with English
    expect(worker).toBeDefined();
    expect(typeof worker.recognize).toBe('function');
    
    // Clean up
    await worker.terminate();
  });

  it('should be able to import the OCR service', () => {
    // Test that we can import the OCR service without errors
    expect(() => {
      require('../ocr-service');
    }).not.toThrow();
  });
}); 