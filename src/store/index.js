import { create } from 'zustand';

export const useStore = create((set) => ({
  topic: '',
  setTopic: (topic) => set({ topic }),

  history: [],
  addHistory: (item) => set((state) => ({ history: [item, ...state.history] })),

  status: 'idle', // idle, generating, done, error
  setStatus: (status) => set({ status }),

  stage1Done: false,
  stage15Done: false,
  stage2Done: false,
  stage3Done: false,

  setStage1Done: (v) => set({ stage1Done: v }),
  setStage15Done: (v) => set({ stage15Done: v }),
  setStage2Done: (v) => set({ stage2Done: v }),
  setStage3Done: (v) => set({ stage3Done: v }),

  currentTask: null,
  setCurrentTask: (task) => set({ currentTask: task }),

  marketAnalysis: null,
  setMarketAnalysis: (data) => set({ marketAnalysis: data }),

  materials: {
    slideDeck: { status: 'idle' },
    handout: { status: 'idle' },
    brief: { status: 'idle' }
  },
  setMaterialStatus: (type, status) => set((state) => ({
    materials: {
      ...state.materials,
      [type]: { status }
    }
  })),

  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  customization: {
    duration: 'half-day',
    audience: 'individuals',
    language: 'he',
    depth: 'introductory'
  },
  setCustomization: (updates) => set((state) => ({
    customization: { ...state.customization, ...updates }
  })),

  resetWorkshop: () => set({
    marketAnalysis: null,
    status: 'idle',
    currentTask: '',
    stage1Done: false,
    stage15Done: false,
    stage2Done: false,
    stage3Done: false,
  })
}));