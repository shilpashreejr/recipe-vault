import { createWorker } from 'tesseract.js';

describe('Tesseract.js Installation Test', () => {
  it('should be able to import and create a Tesseract worker', async () => {
    // Test that we can import and create a worker
    const worker = await createWorker();
    
    // Verify the worker is created successfully
    expect(worker).toBeDefined();
    expect(typeof worker.recognize).toBe('function');
    
    // Clean up
    await worker.terminate();
  });

  it('should be able to initialize with English language', async () => {
    const worker = await createWorker('eng');
    
    // Verify the worker is initialized with English
    expect(worker).toBeDefined();
    
    // Clean up
    await worker.terminate();
  });
}); 