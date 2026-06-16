// [Category B: Logic / Services / Tests]
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMarketAnalysisPipeline } from './pipeline';
import { useStore } from '../store';

describe('runMarketAnalysisPipeline', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call /api/generate with correct body and return data on success', async () => {
    const mockData = { success: true, topic: 'test-topic' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await runMarketAnalysisPipeline('test-topic', vi.fn());

    expect(fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'test-topic',
        audience: 'individuals',
        customization: useStore.getState().customization,
      }),
    }));
    
    expect(result).toEqual(mockData);
  });

  it('should return PIPELINE_FAILED error when HTTP status is not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal Server Error' }),
    });

    const result = await runMarketAnalysisPipeline('test-topic', vi.fn());

    expect(result).toEqual({
      error: 'PIPELINE_FAILED',
      details: 'Internal Server Error',
    });
  });

  it('should return PIPELINE_FAILED error when fetch throws', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));

    const result = await runMarketAnalysisPipeline('test-topic', vi.fn());

    expect(result).toEqual({
      error: 'PIPELINE_FAILED',
      details: 'Network Error',
    });
  });
});

