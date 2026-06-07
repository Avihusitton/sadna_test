import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './index.js';

describe('useStore', () => {
  const initialState = useStore.getState();

  beforeEach(() => {
    useStore.setState(initialState, true);
  });

  it('should initialize with correct default state', () => {
    const state = useStore.getState();
    expect(state.topic).toBe('');
    expect(state.history).toEqual([]);
    expect(state.status).toBe('idle');
    expect(state.currentTask).toBeNull();
    expect(state.marketAnalysis).toBeNull();
    expect(state.materials).toEqual({
      slideDeck: { status: 'idle' },
      handout: { status: 'idle' },
      brief: { status: 'idle' }
    });
    expect(state.theme).toBe('light');
    expect(state.customization).toEqual({
      duration: 'half-day',
      audience: 'individuals',
      language: 'he',
      depth: 'introductory'
    });
  });

  it('should set topic', () => {
    useStore.getState().setTopic('React Performance');
    expect(useStore.getState().topic).toBe('React Performance');
  });

  it('should add history items', () => {
    const item1 = { id: 1, title: 'Item 1' };
    const item2 = { id: 2, title: 'Item 2' };

    useStore.getState().addHistory(item1);
    expect(useStore.getState().history).toEqual([item1]);

    useStore.getState().addHistory(item2);
    expect(useStore.getState().history).toEqual([item2, item1]);
  });

  it('should set status', () => {
    useStore.getState().setStatus('generating');
    expect(useStore.getState().status).toBe('generating');
  });

  it('should set current task', () => {
    const task = { id: 'task-1', name: 'Task 1' };
    useStore.getState().setCurrentTask(task);
    expect(useStore.getState().currentTask).toEqual(task);
  });

  it('should set market analysis', () => {
    const analysis = { insights: ['Insight 1'] };
    useStore.getState().setMarketAnalysis(analysis);
    expect(useStore.getState().marketAnalysis).toEqual(analysis);
  });

  it('should set material status', () => {
    useStore.getState().setMaterialStatus('slideDeck', 'generating');
    expect(useStore.getState().materials.slideDeck.status).toBe('generating');
    expect(useStore.getState().materials.handout.status).toBe('idle'); // Ensure others are unaffected
  });

  it('should toggle theme', () => {
    expect(useStore.getState().theme).toBe('light');

    useStore.getState().toggleTheme();
    expect(useStore.getState().theme).toBe('dark');

    useStore.getState().toggleTheme();
    expect(useStore.getState().theme).toBe('light');
  });

  it('should set customization partially', () => {
    useStore.getState().setCustomization({ duration: 'full-day' });
    expect(useStore.getState().customization).toEqual({
      duration: 'full-day',
      audience: 'individuals', // Unchanged
      language: 'he', // Unchanged
      depth: 'introductory' // Unchanged
    });

    useStore.getState().setCustomization({ audience: 'teams', depth: 'advanced' });
    expect(useStore.getState().customization).toEqual({
      duration: 'full-day',
      audience: 'teams',
      language: 'he',
      depth: 'advanced'
    });
  });
});
