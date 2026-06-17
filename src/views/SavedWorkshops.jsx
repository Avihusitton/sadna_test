import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Trash2, FolderOpen, ArrowRight, Loader2, Calendar, Sparkles } from 'lucide-react';

export default function SavedWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null); // tracking load/delete action per item
  const navigate = useNavigate();

  const { setTopic, setAudience, setMarketAnalysis, setFacilitatorGuide, setStatus } = useStore();

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:8000/api/workshops');
      if (!res.ok) {
        throw new Error('שגיאה בטעינת הרשימה מהשרת');
      }
      const data = await res.json();
      setWorkshops(data);
    } catch (err) {
      console.error(err);
      setError('לא ניתן היה לטעון את הסדנאות השמורות. אנא ודא שהשרת רץ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleLoadWorkshop = async (id) => {
    try {
      setActionId(id);
      const res = await fetch(`http://localhost:8000/api/workshops/${id}`);
      if (!res.ok) {
        throw new Error('שגיאה בטעינת פרטי הסדנה');
      }
      const workshop = await res.json();

      // Populate Zustand store
      setTopic(workshop.topic);
      setAudience(workshop.audience || '');
      setMarketAnalysis(workshop.data);
      setFacilitatorGuide(workshop.data.facilitator_guide || []);
      setStatus('done');

      navigate('/materials');
    } catch (err) {
      alert(err.message || 'טעינת הסדנה נכשלה');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteWorkshop = async (id, e) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm('האם אתה בטוח שברצונך למחוק סדנה זו לצמיתות?')) {
      return;
    }

    try {
      setActionId(id);
      const res = await fetch(`http://localhost:8000/api/workshops/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('שגיאה במחיקת הסדנה');
      }
      setWorkshops((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert(err.message || 'מחיקת הסדנה נכשלה');
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'תאריך לא ידוע';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 overflow-hidden text-right" dir="rtl">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f9f9ff] dark:bg-gray-950">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#a6f4b5]/20 dark:bg-[#a6f4b5]/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#b4c5ff]/20 dark:bg-[#b4c5ff]/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <div>
            <h1 className="text-3xl font-extrabold text-[#01696f] dark:text-[#8bd79b]">הסדנאות השמורות שלי</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              נהל ופתח מחדש סדנאות שחוללת בעבר
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-95 transition-all duration-150 gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            <span>חזרה למסך הבית</span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 text-[#01696f] dark:text-[#8bd79b] animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">טוען סדנאות שמורות...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-6 rounded-2xl text-center space-y-4">
            <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
            <button
              onClick={fetchWorkshops}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 duration-150"
            >
              נסה שוב
            </button>
          </div>
        ) : workshops.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/40 dark:border-gray-700/40 p-12 rounded-2xl text-center space-y-6 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#01696f] dark:text-[#8bd79b]">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">אין סדנאות שמורות עדיין</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                לאחר שתחולל סדנה, תוכל לשמור אותה ישירות ממסך חומרי הסדנה כדי שתופיע כאן.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#01696f] hover:bg-[#005a60] text-white rounded-xl font-bold transition-all shadow-md active:scale-95 duration-150 hover:scale-[1.02]"
            >
              חולל סדנה חדשה
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((workshop) => (
              <div
                key={workshop.id}
                onClick={() => handleLoadWorkshop(workshop.id)}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/40 dark:border-gray-700/40 shadow-sm hover:shadow-lg hover:border-[#01696f]/40 dark:hover:border-[#8bd79b]/40 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="space-y-4">
                  {/* Top: title and delete button */}
                  <div className="flex justify-between items-start gap-4">
                    <button
                      onClick={(e) => handleDeleteWorkshop(workshop.id, e)}
                      disabled={actionId === workshop.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                      title="מחק סדנה"
                    >
                      {actionId === workshop.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-extrabold text-xl text-gray-900 dark:text-white truncate group-hover:text-[#01696f] dark:group-hover:text-[#8bd79b] transition-colors">
                        {workshop.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body: topic description */}
                  <div className="bg-gray-50/50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-150 dark:border-gray-750/30">
                    <p className="text-xs font-bold text-gray-400 mb-1">נושא שנחקר:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {workshop.topic}
                    </p>
                  </div>
                </div>

                {/* Bottom: Date & action link */}
                <div className="mt-6 pt-4 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5 font-bold text-[#01696f] dark:text-[#8bd79b]">
                    <span>פתח סדנה</span>
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>{formatDate(workshop.date)}</span>
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
