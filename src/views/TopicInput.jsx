import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Sparkles, Clock, History, Lightbulb } from 'lucide-react';

export default function TopicInput() {
  const [inputTopic, setInputTopic] = useState('');
  const [inputAudience, setInputAudience] = useState('');
  const [error, setError] = useState(null);
  const [audienceError, setAudienceError] = useState(null);
  const navigate = useNavigate();

  const { setTopic, setAudience, history, status, currentTask } = useStore();

  const handleGenerate = async (e) => {
    e.preventDefault();
    let hasError = false;

    if (!inputTopic.trim()) {
      setError('נא להזין נושא לסדנה');
      hasError = true;
    } else {
      setError(null);
    }

    if (!inputAudience.trim()) {
      setAudienceError('נא להזין קהל יעד');
      hasError = true;
    } else {
      setAudienceError(null);
    }

    if (hasError) return;

    setTopic(inputTopic);
    setAudience(inputAudience);
    navigate('/analysis');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f9f9ff] dark:bg-gray-950">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#a6f4b5]/20 dark:bg-[#a6f4b5]/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#b4c5ff]/20 dark:bg-[#b4c5ff]/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-[#01696f]/5 animate-reveal">
        {/* Card Header */}
        <div className="mb-8 text-right">
          <h2 className="text-2xl font-extrabold text-[#01696f] dark:text-[#8bd79b] mb-2">בניית סדנה חדשה</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">הגדירו את הנושא וקהל היעד כדי להתחיל בתהליך היצירה המודרך.</p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleGenerate} className="space-y-6 text-right">
          {/* Workshop Topic */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 pr-1" htmlFor="topic">
              נושא הסדנה
            </label>
            <input
              type="text"
              name="topic"
              id="topic"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#01696f] dark:focus:ring-[#8bd79b] focus:border-transparent transition-all outline-none text-right text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${error ? 'border-red-300 ring-red-500' : ''}`}
              placeholder="לדוגמה: ניהול לחץ במילואים"
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400 pr-1 mt-1">{error}</p>}
          </div>

          {/* Target Audience */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 pr-1" htmlFor="audience">
              קהל יעד
            </label>
            <input
              type="text"
              name="audience"
              id="audience"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#01696f] dark:focus:ring-[#8bd79b] focus:border-transparent transition-all outline-none text-right text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${audienceError ? 'border-red-300 ring-red-500' : ''}`}
              placeholder="לדוגמה: מילואימניקים"
              value={inputAudience}
              onChange={(e) => setInputAudience(e.target.value)}
            />
            {audienceError && <p className="text-xs text-red-600 dark:text-red-400 pr-1 mt-1">{audienceError}</p>}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={status === 'generating'}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#01696f] dark:bg-[#1c6938] hover:scale-[1.02] active:scale-95 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="h-5 w-5" />
            <span>{status === 'generating' ? 'מעבד...' : 'התחל בניית סילבוס'}</span>
          </button>
        </form>

        {/* Loading Progress State */}
        {status === 'generating' && currentTask && (
          <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 text-right">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">סטטוס יצירה:</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#01696f] dark:text-[#8bd79b] bg-[#01696f]/10 dark:bg-[#8bd79b]/10">
                    בתהליך
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold inline-block text-[#01696f] dark:text-[#8bd79b]">
                    {currentTask}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100 dark:bg-gray-800">
                <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#01696f] dark:bg-[#8bd79b] animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tip / Note Card */}
        <div className="mt-8 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-[#01696f]/10 dark:border-[#8bd79b]/10 flex items-start gap-3 text-right">
          <Lightbulb className="h-5 w-5 text-[#01696f] dark:text-[#8bd79b] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>טיפ המנחה:</strong> ככל שתהיו ספציפיים יותר בתיאור קהל היעד, כך המחולל יוכל להציע תכנים מותאמים ומשמעותיים יותר עבור המשתתפים שלכם.
          </p>
        </div>
      </div>

      {/* History List */}
      {history.length > 0 && (
        <div className="mt-16 w-full max-w-4xl px-4 animate-reveal">
          <div className="flex items-center mb-6 justify-start">
            <History className="ml-2 h-6 w-6 text-gray-400 dark:text-gray-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">היסטוריית סדנאות</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer p-6 text-right"
                onClick={() => { setTopic(item.topic); navigate('/materials'); }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                  {item.topic}
                </h3>
                <p className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
                  <span className="ml-1.5">{new Date(item.date).toLocaleDateString('he-IL')}</span>
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}