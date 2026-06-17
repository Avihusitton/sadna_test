// [Category B: Logic / Services]
import { useStore } from '../store';

function assembleFinalResult(topic, stage1, stage15, stage2, stage3) {
  const store = useStore.getState();
  const audience = store.audience || 'individuals';
  const interpreted_topic = stage1.interpreted_topic || topic;
  const pain_points = stage1.pain_points || [];
  const objections = stage1.objections || [];
  
  const pains_str = pain_points.join(', ');
  const objs_str = objections.join(', ');
  
  const landscape = `ניתוח שוק עבור סדנת "${interpreted_topic}" לקהל היעד "${audience}" מראה כי נקודות הכאב המרכזיות הן: ${pains_str}. המשתתפים מביעים חששות והתנגדויות בעיקר סביב: ${objs_str}.`;
  const gaps = stage1.market_gap || "חסר חיבור אמיתי בין ידע תיאורטי לעבודה רגשית עמוקה שיורדת לחיי היומיום. רוב התכנים נשארים ברמת התיאוריה.";
  const pricing = "150-300 ש״ח למשתתף, 3000-5000 ש״ח לארגון (מפגש חד פעמי)";
  
  const marketResearch = {
    landscape,
    formats: ["הרצאות זום בנות שעה", "סדנאות יום למנהלים", "קורסים דיגיטליים"],
    pricing,
    gaps
  };
  
  const duration = store.customization?.duration || 'half-day';
  const duration_map = {
    "90-min": "90 דקות (הרצאה אקטיבית)",
    "half-day": "חצי יום (העמקה)",
    "full-day": "יום שלם (תהליך מלא)",
    "2-day": "יומיים (ריטריט/הכשרה)"
  };
  const recommendedFormat = duration_map[duration] || "חצי יום (העמקה)";
  
  const economicValidation = {
    decision: "GO",
    recommendedFormat,
    justification: "נושא עמוק שדורש זמן לעיבוד, בניית אמון ותרגול מעשי של נקודת הבחירה.",
    estimatedPricePerParticipant: "350-500 ש״ח",
    estimatedPricePerGroup: "6,000-8,000 ש״ח",
    breakevenSize: 12
  };
  
  return {
    topic,
    interpreted_topic,
    market_gap: gaps,
    marketResearch,
    differentiationAngles: stage15.differentiation_angles || [],
    economicValidation,
    syllabus: stage2,
    slides: stage3.slides || [],
    stage1_raw: stage1
  };
}

export async function runMarketAnalysisPipeline(topic, audience, setCurrentTask) {
  const base = 'http://localhost:8000/api';

  // Stage 1
  setCurrentTask('מבצע חקר שוק עמוק...');
  const r1 = await fetch(`${base}/stage1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, audience })
  });
  if (!r1.ok) throw new Error(await r1.text());
  const stage1 = await r1.json();
  useStore.getState().setStage1Done(true);

  // Stage 1.5
  setCurrentTask('מנתח זוויות בידול...');
  const r15 = await fetch(`${base}/stage15`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, audience, stage1 })
  });
  if (!r15.ok) throw new Error(await r15.text());
  const stage15 = await r15.json();
  useStore.getState().setStage15Done(true);

  // Stage 2
  setCurrentTask('בונה סילבוס...');
  const r2 = await fetch(`${base}/stage2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic, audience, stage1,
      interpreted_topic: stage1.interpreted_topic
    })
  });
  if (!r2.ok) throw new Error(await r2.text());
  const stage2 = await r2.json();
  useStore.getState().setStage2Done(true);

  // Stage 3
  setCurrentTask('יוצר שקפים ותוכן...');
  const r3 = await fetch(`${base}/stage3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic, audience, stage1, stage2,
      differentiation_angles: stage15.differentiation_angles,
      interpreted_topic: stage1.interpreted_topic
    })
  });
  if (!r3.ok) throw new Error(await r3.text());
  const stage3 = await r3.json();
  useStore.getState().setStage3Done(true);

  // Assemble final result (same shape as before)
  return assembleFinalResult(topic, stage1, stage15, stage2, stage3);
}