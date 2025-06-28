import { getJobStatus, createMockJob, updateMockJob } from '../job-status';

describe('/api/extract/status/[jobId] API', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    jest.clearAllMocks();
  });

  it('should return 400 for missing job ID', async () => {
    const result = await getJobStatus('');
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Missing job ID');
  });

  it('should return 404 for non-existent job', async () => {
    const result = await getJobStatus('non-existent');
    expect(result.status).toBe(404);
    expect(result.body.error).toBe('Job not found');
  });

  it('should return job status for existing job', async () => {
    const jobId = 'test-job-123';
    const mockJob = createMockJob(jobId, 'processing');
    updateMockJob(jobId, { progress: 50 });

    const result = await getJobStatus(jobId);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.job).toBeDefined();
    if (result.body.job) {
      expect(result.body.job.id).toBe(jobId);
      expect(result.body.job.status).toBe('processing');
      expect(result.body.job.progress).toBe(50);
      expect(result.body.job.createdAt).toBeDefined();
      expect(result.body.job.updatedAt).toBeDefined();
    }
  });

  it('should return completed job with result', async () => {
    const jobId = 'completed-job-456';
    const mockResult = { recipe: { title: 'Test Recipe' } };
    const mockJob = createMockJob(jobId, 'completed');
    updateMockJob(jobId, { 
      progress: 100, 
      result: mockResult,
      estimatedCompletion: new Date()
    });

    const result = await getJobStatus(jobId);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.job).toBeDefined();
    if (result.body.job) {
      expect(result.body.job.status).toBe('completed');
      expect(result.body.job.progress).toBe(100);
      expect(result.body.job.result).toEqual(mockResult);
      expect(result.body.job.estimatedCompletion).toBeDefined();
    }
  });

  it('should return failed job with error', async () => {
    const jobId = 'failed-job-789';
    const mockError = 'Extraction failed due to invalid URL';
    const mockJob = createMockJob(jobId, 'failed');
    updateMockJob(jobId, { 
      progress: 25, 
      error: mockError
    });

    const result = await getJobStatus(jobId);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.job).toBeDefined();
    if (result.body.job) {
      expect(result.body.job.status).toBe('failed');
      expect(result.body.job.progress).toBe(25);
      expect(result.body.job.error).toBe(mockError);
    }
  });
}); 