import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Settings, RefreshCw } from 'lucide-react';

export default function WorkshopCustomizer() {
  const { customization, setCustomization, setMaterialStatus } = useStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomization({ [name]: value });
  };

  const handleRegenerate = (e) => {
    e.preventDefault();
    // Reset generation status to trigger regeneration on the materials page
    setMaterialStatus('slideDeck', 'idle');
    setMaterialStatus('handout', 'idle');
    setMaterialStatus('brief', 'idle');
    navigate('/materials');
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <Settings className="h-8 w-8 text-green-600 dark:text-green-400 ml-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">התאמה אישית של הסדנה</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleRegenerate} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                משך הסדנה
              </label>
              <select
                id="duration"
                name="duration"
                value={customization.duration}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="90-min">90 דקות (הרצאה אקטיבית)</option>
                <option value="half-day">חצי יום (העמקה)</option>
                <option value="full-day">יום שלם (תהליך מלא)</option>
                <option value="2-day">יומיים (ריטריט/הכשרה)</option>
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                קהל יעד
              </label>
              <select
                id="audience"
                name="audience"
                value={customization.audience}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="individuals">אנשים פרטיים (קהל רחב)</option>
                <option value="managers">מנהלים / ארגונים</option>
                <option value="teams">צוותים אורגניים</option>
                <option value="hr">משאבי אנוש ורווחה</option>
                <option value="couples">זוגות</option>
                <option value="reservists">מילואימניקים</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                שפת התוצרים
              </label>
              <select
                id="language"
                name="language"
                value={customization.language}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label htmlFor="depth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                רמת העמקה
              </label>
              <select
                id="depth"
                name="depth"
                value={customization.depth}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="introductory">מבוא (היכרות ראשונית עם שיטת דרך)</option>
                <option value="intermediate">ביניים (תרגול מעשי)</option>
                <option value="advanced">מתקדם (לבוגרי סדנאות)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              שמור וצור מחדש
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}