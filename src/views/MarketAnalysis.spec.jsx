import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketAnalysis from './MarketAnalysis';
import { useStore } from '../store';
import { runMarketAnalysisPipeline } from '../services/pipeline';
import { vi } from 'vitest';

vi.mock('../services/pipeline', () => ({
  runMarketAnalysisPipeline: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MarketAnalysis Error State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      topic: 'Test Topic',
      status: 'idle',
      marketAnalysis: null,
    });
  });

  it('renders generic error message and handles "שינוי נושא" button', async () => {
    runMarketAnalysisPipeline.mockResolvedValueOnce({
      error: 'SOME_ERROR',
      details: 'Test Error Details',
    });

    render(
      <BrowserRouter>
        <MarketAnalysis />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('שגיאה בתהליך: Test Error Details')).toBeInTheDocument();
    });

    const changeTopicButton = screen.getByRole('button', { name: /שינוי נושא/i });
    fireEvent.click(changeTopicButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders specific NO_DIFFERENTIATION error message and handles "המשך למרות הכל" button', async () => {
    runMarketAnalysisPipeline.mockResolvedValueOnce({
      error: 'NO_DIFFERENTIATION',
    });

    render(
      <BrowserRouter>
        <MarketAnalysis />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('לא נמצאה זווית בידול חזקה מספיק. האם תרצה להמשיך עם הזווית הטובה ביותר או לשנות נושא?')
      ).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: /המשך למרות הכל/i });
    fireEvent.click(continueButton);

    // The component sets status to 'done' and clears the error
    expect(useStore.getState().status).toBe('done');

    // We expect the localError to be null, which means it should render nothing
    // (since marketAnalysis is still null, it returns null)
    await waitFor(() => {
        expect(screen.queryByText('לא נמצאה זווית בידול חזקה מספיק. האם תרצה להמשיך עם הזווית הטובה ביותר או לשנות נושא?')).not.toBeInTheDocument();
    });
  });

  it('handles unexpected exceptions during pipeline execution', async () => {
    runMarketAnalysisPipeline.mockRejectedValueOnce(new Error('Unexpected crash'));

    render(
      <BrowserRouter>
        <MarketAnalysis />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('שגיאה בלתי צפויה.')).toBeInTheDocument();
    });

    expect(useStore.getState().status).toBe('error');
  });
});
