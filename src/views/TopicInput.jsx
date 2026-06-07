import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Sparkles, Clock, History } from 'lucide-react';

export default function TopicInput() {
  const [inputTopic, setInputTopic] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { setTopic, history, status, currentTask } = useStore();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!inputTopic.trim()) {
      setError('נא להזין נושא לסדנה');
      return;
    }
    setError(null);
    setTopic(inputTopic);
    navigate('/analysis');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
          מנוע יצירת סדנאות
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
          הכנס נושא, ונקבל מחקר שוק, זוויות בידול ועד לחומרים מוכנים להנחיה -
          הכל מותאם לגישה המקצועית ולערכים של דרך.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mb-12 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              נושא הסדנה (בעברית או באנגלית)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="topic"
                id="topic"
                className={`focus:ring-green-500 focus:border-green-500 block w-full text-lg sm:text-xl border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${error ? 'border-red-300 ring-red-500' : ''}`}
                placeholder="למשל: התמודדות עם חרדה בעבודה, תקשורת מקרבת לזוגות..."
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status === 'generating'}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              {status === 'generating' ? 'מייצר...' : 'ייצר סדנה'}
            </button>
          </div>
        </form>

        {status === 'generating' && currentTask && (
          <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">סטטוס יצירה:</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    בתהליך
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {currentTask}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
                <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <History className="ml-2 h-6 w-6 text-gray-400 dark:text-gray-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">היסטוריית סדנאות</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setTopic(item.topic); navigate('/materials'); }}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2 truncate">
                    {item.topic}
                  </h3>
                  <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="ml-1.5 h-4 w-4" />
                    {new Date(item.date).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}