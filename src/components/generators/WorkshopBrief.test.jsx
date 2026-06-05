import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import WorkshopBrief from './WorkshopBrief';
import { useStore } from '../../store';

// Mock the store module
vi.mock('../../store', () => ({
  useStore: vi.fn(),
}));

describe('WorkshopBrief Component', () => {
  const mockSetMaterialStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders generating state when status is generating', () => {
    useStore.mockReturnValue({
      topic: 'Test Topic',
      marketAnalysis: null,
      materials: {
        brief: { status: 'generating' },
      },
      setMaterialStatus: mockSetMaterialStatus,
    });

    render(<WorkshopBrief />);

    expect(screen.getByText('מנסח בריף שיווקי...')).toBeInTheDocument();
    expect(mockSetMaterialStatus).not.toHaveBeenCalled();
  });

  it('simulates generation process by transitioning from idle to done', () => {
    vi.useFakeTimers();

    useStore.mockReturnValue({
      topic: 'Test Topic',
      marketAnalysis: null,
      materials: {
        brief: { status: 'idle' },
      },
      setMaterialStatus: mockSetMaterialStatus,
    });

    render(<WorkshopBrief />);

    // First useEffect should set status to 'generating'
    expect(mockSetMaterialStatus).toHaveBeenCalledWith('brief', 'generating');

    // Simulate the timeout
    act(() => {
      vi.runAllTimers();
    });

    // The timeout callback should then set status to 'done'
    expect(mockSetMaterialStatus).toHaveBeenCalledWith('brief', 'done');
  });

  it('renders the complete brief when generation is done', () => {
    const mockMarketAnalysis = {
      differentiationAngles: [
        { isWinner: true, title: 'Winner Angle Title', positioningStatement: 'We do things differently.' },
        { isWinner: false, title: 'Loser Angle Title' }
      ],
      economicValidation: {
        recommendedFormat: 'half-day',
        estimatedPricePerGroup: '5000 ILS'
      }
    };

    useStore.mockReturnValue({
      topic: 'Leadership',
      marketAnalysis: mockMarketAnalysis,
      materials: {
        brief: { status: 'done' },
      },
      setMaterialStatus: mockSetMaterialStatus,
    });

    render(<WorkshopBrief />);

    expect(screen.getByText('בריף שיווקי (ללקוח/ארגון)')).toBeInTheDocument();
    expect(screen.getByText('הצעת סדנה: Leadership')).toBeInTheDocument();
    expect(screen.getByText('Winner Angle Title')).toBeInTheDocument();
    expect(screen.getByText('We do things differently.')).toBeInTheDocument();
    expect(screen.getByText(/ארגונים ואנשים רבים מתמודדים עם הקושי סביב הנושא של "Leadership"/)).toBeInTheDocument();
    expect(screen.getByText('חצי יום מרוכז')).toBeInTheDocument();
    expect(screen.getByText('5000 ILS')).toBeInTheDocument();
  });

  it('handles the "Save as PDF" functionality', () => {
    const originalPrint = window.print;
    const originalReload = window.location.reload;
    const originalInnerHTML = document.body.innerHTML;

    window.print = vi.fn();

    // Using simple mock to avoid navigation errors during tests
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    });

    useStore.mockReturnValue({
      topic: 'Leadership',
      marketAnalysis: {
        differentiationAngles: [],
        economicValidation: {}
      },
      materials: {
        brief: { status: 'done' },
      },
      setMaterialStatus: mockSetMaterialStatus,
    });

    const { unmount } = render(<WorkshopBrief />);

    const downloadButton = screen.getByText('שמור כ-PDF לשליחה');
    fireEvent.click(downloadButton);

    expect(window.print).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();

    // Cleanup
    window.print = originalPrint;
    document.body.innerHTML = originalInnerHTML;
    unmount();
  });
});
