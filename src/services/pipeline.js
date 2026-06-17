// [Category B: Logic / Services]
import { BRAND_VOICE, STRENGTHS, TARGET_AUDIENCE } from '../constants/brand';
import { useStore } from '../store';

export const runFullPipeline = async (topic, audience, customization) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        audience,
        customization,
      }),
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const store = useStore.getState();
    if (data.stage1_raw || data.marketResearch) {
      store.setStage1Done(true);
      store.setCurrentTask('מיצוב ובידול');
    }
    if (data.differentiationAngles) {
      store.setStage15Done(true);
      store.setCurrentTask('בניית סילבוס');
    }
    if (data.syllabus) {
      store.setStage2Done(true);
      store.setCurrentTask('יצירת שקפים ותוכן');
    }
    if (data.slides) {
      store.setStage3Done(true);
      store.setCurrentTask('הושלם');
    }
    
    return data;
  } catch (error) {
    console.error("Pipeline Error:", error);
    return { error: 'PIPELINE_FAILED', details: error.message };
  }
};

export const runMarketAnalysisPipeline = async (topic, updateProgress) => {
  if (updateProgress) {
    updateProgress('מחבר לשרת ומריץ אנליזת שוק...');
  }
  
  const state = useStore.getState();
  const audience = state.customization.audience || 'individuals';
  const customization = state.customization;
  
  return runFullPipeline(topic, audience, customization);
};