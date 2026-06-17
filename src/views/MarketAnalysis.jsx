import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { runMarketAnalysisPipeline } from '../services/pipeline';
import { Target, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, Sparkles, Brain } from 'lucide-react';
import ProgressChecklist from '../components/ProgressChecklist';

export default function MarketAnalysis() {
  const { topic, audience, status, setStatus, setCurrentTask, marketAnalysis, setMarketAnalysis } = useStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState(null);
  const [editingAngle, setEditingAngle] = useState(false);
  const [editedAngleText, setEditedAngleText] = useState("");

  useEffect(() => {
    if (!topic) {
      navigate('/');
      return;
    }

    const runAnalysis = async () => {
      setStatus('generating');
      setLocalError(null);
      
      const store = useStore.getState();
      store.setStage1Done(false);
      store.setStage15Done(false);
      store.setStage2Done(false);
      store.setStage3Done(false);
      setCurrentTask('מחבר לשרת ומריץ אנליזת שוק...');

      try {
        const result = await runMarketAnalysisPipeline(topic, audience, setCurrentTask);
        
        if (result.error) {
          if (result.error === "NO_DIFFERENTIATION") {
             setLocalError("לא נמצאה זווית בידול חזקה מספיק. האם תרצה להמשיך עם הזווית הטובה ביותר או לשנות נושא?");
          } else {
             setLocalError(`שגיאה בתהליך: ${result.details ?? result.error ?? "לא ידועה"}`);
          }
          setStatus('error');
        } else {
          setMarketAnalysis(result);
          setStatus('done');
        }
      } catch (e) {
        console.error("Pipeline error:", e);
        setLocalError(`שגיאה בלתי צפויה: ${e?.message ?? e}`);
        setStatus('error');
      }
    };

    if (!marketAnalysis || marketAnalysis.topic !== topic) {
      runAnalysis();
    }
  }, [topic, navigate]);

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] relative overflow-hidden px-4">
        {/* Background Layer */}
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f9f9ff] dark:bg-gray-950">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#a6f4b5]/20 dark:bg-[#a6f4b5]/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#b4c5ff]/20 dark:bg-[#b4c5ff]/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="w-full max-w-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-[#01696f]/5 flex flex-col items-center animate-reveal">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#01696f] dark:border-[#8bd79b] mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">מבצע מחקר שוק ואנליזה...</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{useStore.getState().currentTask}</p>
          <ProgressChecklist />
        </div>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{localError}</h2>
        <div className="flex justify-center gap-4">
            <button onClick={() => { useStore.getState().resetWorkshop(); navigate('/'); }} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors">
              שינוי נושא
            </button>
            <button onClick={() => { setLocalError(null); setStatus('done'); }} className="px-6 py-3 bg-[#01696f] text-white rounded-xl font-bold hover:bg-[#005a60] transition-colors">
              המשך למרות הכל
            </button>
        </div>
      </div>
    );
  }

  if (!marketAnalysis) return null;

  const winnerAngle = marketAnalysis?.differentiationAngles?.find(a => a.isWinner) || null;

  const handleSaveAngle = () => {
    if (winnerAngle) {
       const updatedAngles = marketAnalysis.differentiationAngles.map(a =>
           a.id === winnerAngle.id ? { ...a, positioningStatement: editedAngleText } : a
       );
       setMarketAnalysis({ ...marketAnalysis, differentiationAngles: updatedAngles });
    }
    setEditingAngle(false);
  };

  const painPoints = marketAnalysis.stage1_raw?.pain_points || [];
  const objections = marketAnalysis.stage1_raw?.objections || [];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f9f9ff] dark:bg-gray-950">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#a6f4b5]/20 dark:bg-[#a6f4b5]/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#b4c5ff]/20 dark:bg-[#b4c5ff]/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Title & Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-[#01696f] dark:text-[#8bd79b]">תוצאות ניתוח השוק</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ממצאי מחקר ה-AI והמלצות אסטרטגיות לסדנה החדשה שלך
            </p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            {marketAnalysis.economicValidation?.decision === 'GO' ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-emerald-50 dark:bg-emerald-950/20 text-[#006b2c] dark:text-[#8bd79b] border border-emerald-200/50 dark:border-emerald-800/50">
                <CheckCircle className="ml-2 h-5 w-5" />
                החלטה: GO
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/50">
                <AlertTriangle className="ml-2 h-5 w-5" />
                החלטה: NO-GO
              </span>
            )}
          </div>
        </div>

        {/* AI Interpretation Banner */}
        <section className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 shadow-sm flex items-start gap-4 text-right animate-reveal">
          <div className="bg-[#01696f]/10 p-3 rounded-xl text-[#01696f] dark:text-[#8bd79b] shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#01696f] dark:text-[#8bd79b] mb-1">פרשנות ה-AI לנושא</h3>
            <div className="flex flex-col gap-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">נושא מקורי: <span className="font-normal">"{topic}"</span></p>
              {marketAnalysis.interpreted_topic && (
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">פרשנות ממוקדת: <span className="font-normal">"{marketAnalysis.interpreted_topic}"</span></p>
              )}
            </div>
          </div>
        </section>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (Bento Cards & Differentiation Angles) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pain Points */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/40 dark:border-gray-700/40 hover:shadow-md transition-all hover:scale-[1.02] duration-200 text-right animate-reveal">
                <div className="flex items-center justify-end gap-2 mb-4 text-[#1c6938] dark:text-[#8bd79b]">
                  <h4 className="font-bold text-lg">כאבי הלקוח</h4>
                  <Target className="h-6 w-6" />
                </div>
                {painPoints.length > 0 ? (
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    {painPoints.map((point, index) => (
                      <li key={index} className="flex items-center justify-end gap-2 text-right">
                        <span>{point}</span>
                        <span className="w-1.5 h-1.5 bg-[#1c6938] dark:bg-[#8bd79b] rounded-full shrink-0"></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">{marketAnalysis.marketResearch?.landscape || "מזהה כאבים מרכזיים בשוק..."}</p>
                )}
              </div>

              {/* Objections */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/40 dark:border-gray-700/40 hover:shadow-md transition-all hover:scale-[1.02] duration-200 text-right animate-reveal">
                <div className="flex items-center justify-end gap-2 mb-4 text-[#ba1a1a] dark:text-red-400">
                  <h4 className="font-bold text-lg">התנגדויות נפוצות</h4>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                {objections.length > 0 ? (
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    {objections.map((obj, index) => (
                      <li key={index} className="flex items-center justify-end gap-2 text-right">
                        <span>{obj}</span>
                        <span className="w-1.5 h-1.5 bg-[#ba1a1a] dark:bg-red-400 rounded-full shrink-0"></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">מזהה התנגדויות נפוצות של קהל היעד...</p>
                )}
              </div>

              {/* Opportunities */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/40 dark:border-gray-700/40 hover:shadow-md transition-all hover:scale-[1.02] duration-200 md:col-span-1 text-right animate-reveal">
                <div className="flex items-center justify-end gap-2 mb-4 text-[#01696f] dark:text-[#8bd79b]">
                  <h4 className="font-bold text-lg">הזדמנויות שוק ובידול</h4>
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {marketAnalysis.market_gap || marketAnalysis.marketResearch?.gaps || "מיקוד ייחודי במענה מקצועי המשלב כלים מעשיים וליווי רגשי עמוק."}
                </p>
              </div>

              {/* Economic Potential */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/40 dark:border-gray-700/40 hover:shadow-md transition-all hover:scale-[1.02] duration-200 md:col-span-1 text-right animate-reveal">
                <div className="flex items-center justify-end gap-2 mb-4 text-[#0051d5] dark:text-[#b4c5ff]">
                  <h4 className="font-bold text-lg">פוטנציאל כלכלי</h4>
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {marketAnalysis.economicValidation?.justification || "ביקוש גבוה מצד גופים וארגונים המעוניינים לתמוך בקהל יעד זה באופן יעיל וממוקד."}
                </p>
              </div>
            </div>

            {/* Differentiation Angles Section */}
            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/40 dark:border-gray-700/40 shadow-sm text-right animate-reveal">
              <div className="flex items-center justify-end gap-2 mb-6 text-[#01696f] dark:text-[#8bd79b]">
                <h2 className="text-xl font-bold">זוויות בידול מומלצות</h2>
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                {marketAnalysis.differentiationAngles?.map((angle) => {
                  const isWinner = angle.isWinner;
                  return (
                    <div
                      key={angle.id}
                      className={`p-5 rounded-xl border transition-all ${
                        isWinner
                          ? 'border-[#01696f] bg-[#01696f]/5 dark:bg-[#01696f]/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 bg-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 flex-row-reverse">
                        <h3 className={`font-bold text-lg ${isWinner ? 'text-[#01696f] dark:text-[#8bd79b]' : 'text-gray-900 dark:text-white'}`}>
                          {angle.title}
                        </h3>
                        {isWinner && (
                          <span className="text-xs bg-[#01696f] text-white dark:bg-[#8bd79b] dark:text-gray-950 py-1 px-3 rounded-full font-bold">
                            נבחרה כזווית המובילה
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">{angle.description}</p>
                      
                      {isWinner && editingAngle ? (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ערוך הצהרת מיצוב:</label>
                          <textarea
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#01696f] outline-none text-right"
                            rows="3"
                            value={editedAngleText}
                            onChange={(e) => setEditedAngleText(e.target.value)}
                          />
                          <div className="mt-3 flex gap-2 justify-end">
                            <button onClick={() => setEditingAngle(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors">ביטול</button>
                            <button onClick={handleSaveAngle} className="px-4 py-2 bg-[#01696f] text-white rounded-xl text-sm font-medium hover:bg-[#005a60] transition-colors">שמור שינויים</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center flex-row-reverse">
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            <span className="font-semibold not-italic">הצהרת מיצוב:</span> "{angle.positioningStatement}"
                          </p>
                          {isWinner && (
                            <button
                              onClick={() => { setEditedAngleText(angle.positioningStatement); setEditingAngle(true); }}
                              className="text-xs text-[#01696f] dark:text-[#8bd79b] hover:underline font-bold"
                            >
                              ערוך זווית
                            </button>
                          )}
                        </div>
                      )}
                      {angle.defensibility && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span className="font-semibold">חסינות להעתקה:</span> {angle.defensibility}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Right Column (Economic Validation Sidebar) */}
          <div className="space-y-6">
            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-right animate-reveal sticky top-24">
              <div className="flex items-center justify-end gap-2 mb-6 text-[#1c6938] dark:text-[#8bd79b]">
                <h2 className="text-xl font-bold">ולידציה כלכלית</h2>
                <TrendingUp className="h-6 w-6" />
              </div>

              <dl className="space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">פורמט מומלץ</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{marketAnalysis.economicValidation?.recommendedFormat}</dd>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{marketAnalysis.economicValidation?.justification}</p>
                </div>
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">הערכת מחיר (למשתתף)</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{marketAnalysis.economicValidation?.estimatedPricePerParticipant}</dd>
                </div>
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">הערכת מחיר (לארגון/קבוצה)</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{marketAnalysis.economicValidation?.estimatedPricePerGroup}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">נקודת איזון (Break-even)</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{marketAnalysis.economicValidation?.breakevenSize} משתתפים</dd>
                </div>
              </dl>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate('/materials')}
                  disabled={marketAnalysis.economicValidation?.decision !== 'GO'}
                  className="w-full flex justify-center items-center px-4 py-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#01696f] hover:bg-[#005a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01696f] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  <ArrowLeft className="ml-2 h-5 w-5" />
                  <span>המשך להתאמת הסדנה</span>
                </button>
                {marketAnalysis.economicValidation?.decision !== 'GO' && (
                  <p className="text-sm text-red-500 text-center mt-2">לא ניתן להמשיך - אין כדאיות כלכלית.</p>
                )}
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}