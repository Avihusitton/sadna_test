import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runMarketAnalysisPipeline } from './pipeline';

describe('runMarketAnalysisPipeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('runs successfully for a valid topic', async () => {
    const updateProgress = vi.fn();
    const promise = runMarketAnalysisPipeline('Valid Topic', updateProgress);

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result.topic).toBe('Valid Topic');
    expect(result.marketResearch).toBeDefined();
    expect(result.differentiationAngles).toBeDefined();
    expect(result.economicValidation).toBeDefined();
    expect(updateProgress).toHaveBeenCalledTimes(3);
  });

  it('returns NO_DIFFERENTIATION error for a short topic', async () => {
    const updateProgress = vi.fn();
    const promise = runMarketAnalysisPipeline('123', updateProgress);

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toEqual({ error: 'NO_DIFFERENTIATION' });
  });

  it('retries and returns PIPELINE_FAILED on unexpected errors', async () => {
    const updateProgress = vi.fn().mockImplementation(() => {
      throw new Error('Unexpected Error');
    });

    const promise = runMarketAnalysisPipeline('Valid', updateProgress);

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toEqual({ error: 'PIPELINE_FAILED', details: 'Unexpected Error' });
    expect(updateProgress).toHaveBeenCalledTimes(2);
  });
});
