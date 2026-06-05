import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { runMarketAnalysisPipeline } from '../services/pipeline';
import { Target, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';

export default function MarketAnalysis() {
  const { topic, status, setStatus, setCurrentTask, marketAnalysis, setMarketAnalysis } = useStore();
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
      try {
        const result = await runMarketAnalysisPipeline(topic, setCurrentTask);
        if (result.error) {
          if (result.error === "NO_DIFFERENTIATION") {
             setLocalError("לא נמצאה זווית בידול חזקה מספיק. האם תרצה להמשיך עם הזווית הטובה ביותר או לשנות נושא?");
          } else {
             setLocalError(`שגיאה בתהליך: ${result.details}`);
          }
          setStatus('error');
        } else {
          setMarketAnalysis(result);
          setStatus('done');
        }
      } catch (e) {
        setLocalError("שגיאה בלתי צפויה.");
        setStatus('error');
      }
    };

    if (!marketAnalysis || marketAnalysis.topic !== topic) {
      runAnalysis();
    }
  }, [topic, navigate]);

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-800">מבצע מחקר שוק ואנליזה...</h2>
        <p className="text-gray-500 mt-2">{useStore.getState().currentTask}</p>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{localError}</h2>
        <div className="flex justify-center space-x-4 space-x-reverse">
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">
              שינוי נושא
            </button>
            <button onClick={() => { setLocalError(null); setStatus('done'); }} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              המשך למרות הכל
            </button>
        </div>
      </div>
    );
  }

  if (!marketAnalysis) return null;

  const winnerAngle = marketAnalysis.differentiationAngles.find(a => a.isWinner);

  const handleSaveAngle = () => {
    if (winnerAngle) {
       const updatedAngles = marketAnalysis.differentiationAngles.map(a =>
           a.id === winnerAngle.id ? { ...a, positioningStatement: editedAngleText } : a
       );
       setMarketAnalysis({ ...marketAnalysis, differentiationAngles: updatedAngles });
    }
    setEditingAngle(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">דו״ח אנליזת שוק ובידול</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">עבור הסדנה: <span className="font-semibold">"{topic}"</span></p>
        </div>
        {marketAnalysis.economicValidation.decision === 'GO' ? (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="ml-2 h-5 w-5" />
            החלטה: GO
          </span>
        ) : (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="ml-2 h-5 w-5" />
            החלטה: NO-GO
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4 text-green-800 dark:text-green-400">
              <Target className="h-6 w-6 ml-2" />
              <h2 className="text-xl font-bold">2A: נוף תחרותי ומחקרי</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">מצב השוק:</h3>
                <p className="text-gray-600 dark:text-gray-400">{marketAnalysis.marketResearch.landscape}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">פערים קיימים:</h3>
                <p className="text-gray-600 dark:text-gray-400">{marketAnalysis.marketResearch.gaps}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">תמחור ממוצע: {marketAnalysis.marketResearch.pricing}</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4 text-green-800 dark:text-green-400">
              <Sparkles className="h-6 w-6 ml-2" />
              <h2 className="text-xl font-bold">2B: זוויות בידול אפשריות</h2>
            </div>
            <div className="space-y-4">
              {marketAnalysis.differentiationAngles.map((angle) => (
                <div key={angle.id} className={`p-4 rounded-xl border ${angle.isWinner ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg ${angle.isWinner ? 'text-green-900 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                      {angle.title}
                      {angle.isWinner && <span className="mr-2 text-xs bg-green-200 text-green-800 py-1 px-2 rounded-full">נבחר</span>}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2 dark:text-gray-300">{angle.description}</p>

                  {angle.isWinner && editingAngle ? (
                    <div className="mt-2 mb-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ערוך הצהרת מיצוב:</label>
                      <textarea
                        className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 text-sm"
                        rows="3"
                        value={editedAngleText}
                        onChange={(e) => setEditedAngleText(e.target.value)}
                      />
                      <div className="mt-2 flex space-x-2 space-x-reverse">
                         <button onClick={handleSaveAngle} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">שמור</button>
                         <button onClick={() => setEditingAngle(false)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300">ביטול</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">הצהרת מיצוב:</span> "{angle.positioningStatement}"
                      </p>
                      {angle.isWinner && (
                        <button
                           onClick={() => { setEditedAngleText(angle.positioningStatement); setEditingAngle(true); }}
                           className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
                        >
                          ערוך זווית
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"><span className="font-semibold">חסינות להעתקה:</span> {angle.defensibility}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
            <div className="flex items-center mb-6 text-green-700 dark:text-green-500">
              <TrendingUp className="h-6 w-6 ml-2" />
              <h2 className="text-xl font-bold">2C: ולידציה כלכלית</h2>
            </div>

            <dl className="space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">פורמט מומלץ</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{marketAnalysis.economicValidation.recommendedFormat}</dd>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{marketAnalysis.economicValidation.justification}</p>
              </div>
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">הערכת מחיר (למשתתף)</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{marketAnalysis.economicValidation.estimatedPricePerParticipant}</dd>
              </div>
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">הערכת מחיר (לארגון/קבוצה)</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{marketAnalysis.economicValidation.estimatedPricePerGroup}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">נקודת איזון (Break-even)</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{marketAnalysis.economicValidation.breakevenSize} משתתפים</dd>
              </div>
            </dl>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => navigate('/materials')}
                disabled={marketAnalysis.economicValidation.decision !== 'GO'}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                המשך ליצירת חומרים
                <ArrowLeft className="mr-2 h-5 w-5" />
              </button>
              {marketAnalysis.economicValidation.decision !== 'GO' && (
                <p className="text-sm text-red-500 text-center mt-2">לא ניתן להמשיך - אין כדאיות כלכלית.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}