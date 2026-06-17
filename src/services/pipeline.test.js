// [Category B: Logic / Services / Tests]
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMarketAnalysisPipeline } from './pipeline';
import { useStore } from '../store';

describe('runMarketAnalysisPipeline', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should run sequential API stage calls and assemble final result on success', async () => {
    const mockStage1 = { interpreted_topic: 'פרשנות', pain_points: ['כאב 1'], objections: ['התנגדות 1'], market_gap: 'פער' };
    const mockStage15 = { differentiation_angles: [{ id: 1, title: 'בידול', isWinner: true }] };
    const mockStage2 = { title: 'סילבוס', tagline: 'טקסט', chapters: [] };
    const mockStage3 = { slides: [{ slide_number: 1, title: 'שקף' }] };

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockStage1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockStage15 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockStage2 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockStage3 });

    const result = await runMarketAnalysisPipeline('test-topic', 'test-audience', vi.fn());

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:8000/api/stage1', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ topic: 'test-topic', audience: 'test-audience' })
    }));
    
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:8000/api/stage15', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ topic: 'test-topic', audience: 'test-audience', stage1: mockStage1 })
    }));

    expect(fetch).toHaveBeenNthCalledWith(3, 'http://localhost:8000/api/stage2', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        topic: 'test-topic',
        audience: 'test-audience',
        stage1: mockStage1,
        interpreted_topic: 'פרשנות'
      })
    }));

    expect(fetch).toHaveBeenNthCalledWith(4, 'http://localhost:8000/api/stage3', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        topic: 'test-topic',
        audience: 'test-audience',
        stage1: mockStage1,
        stage2: mockStage2,
        differentiation_angles: mockStage15.differentiation_angles,
        interpreted_topic: 'פרשנות'
      })
    }));

    expect(result.topic).toBe('test-topic');
    expect(result.interpreted_topic).toBe('פרשנות');
    expect(result.market_gap).toBe('פער');
    expect(result.differentiationAngles).toEqual(mockStage15.differentiation_angles);
    expect(result.syllabus).toEqual(mockStage2);
    expect(result.slides).toEqual(mockStage3.slides);
  });

  it('should throw error when HTTP status is not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    await expect(runMarketAnalysisPipeline('test-topic', 'test-audience', vi.fn()))
      .rejects.toThrow('Internal Server Error');
  });

  it('should throw error when fetch throws', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(runMarketAnalysisPipeline('test-topic', 'test-audience', vi.fn()))
      .rejects.toThrow('Network Error');
  });
});
