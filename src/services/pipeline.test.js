import { describe, it, expect, vi } from 'vitest';
import { runMarketAnalysisPipeline } from './pipeline';

describe('runMarketAnalysisPipeline', () => {
  it('should return NO_DIFFERENTIATION error for short topics lacking strong differentiation', async () => {
    const updateProgressMock = vi.fn();
    const result = await runMarketAnalysisPipeline('abc', updateProgressMock);

    expect(result).toEqual({ error: 'NO_DIFFERENTIATION' });
    // Check that it calls updateProgress up to the failing step
    expect(updateProgressMock).toHaveBeenCalledWith('2A - Market Research (Web Search simulation)...');
    expect(updateProgressMock).toHaveBeenCalledWith('2B - Differentiation Analysis (Cross-referencing constants)...');
  });

  it('should run successfully and return market analysis for a strong topic', async () => {
    const updateProgressMock = vi.fn();
    const result = await runMarketAnalysisPipeline('long topic that is valid', updateProgressMock);

    expect(result).toHaveProperty('topic', 'long topic that is valid');
    expect(result).toHaveProperty('marketResearch');
    expect(result).toHaveProperty('differentiationAngles');
    expect(result).toHaveProperty('economicValidation');

    expect(updateProgressMock).toHaveBeenCalledWith('2A - Market Research (Web Search simulation)...');
    expect(updateProgressMock).toHaveBeenCalledWith('2B - Differentiation Analysis (Cross-referencing constants)...');
    expect(updateProgressMock).toHaveBeenCalledWith('2C - Economic Validation...');
  });
});
