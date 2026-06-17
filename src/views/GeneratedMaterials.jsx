import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Presentation, FileText, Briefcase, Settings, BookOpen, Clock, CheckCircle, Lightbulb } from 'lucide-react';
import SlideDeck from '../components/generators/SlideDeck';
import Handout from '../components/generators/Handout';
import WorkshopBrief from '../components/generators/WorkshopBrief';

function FacilitatorGuide() {
  const { marketAnalysis, facilitator_guide } = useStore();
  const guide = facilitator_guide?.length ? facilitator_guide : (marketAnalysis?.facilitator_guide || []);

  if (!guide || guide.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">לא נוצר מדריך מנחה עבור סדנה זו.</p>
      </div>
    );
  }

  const totalMinutes = guide.reduce((sum, item) => sum + parseInt(item.duration_minutes || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column (Main Content) */}
      <div className="lg:col-span-2 space-y-6">
        <header className="flex justify-between items-center mb-4 flex-row-reverse">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">מדריך מנחה מפורט</h3>
          <span className="bg-[#01696f]/10 text-[#01696f] dark:text-[#8bd79b] px-3 py-1 rounded-full font-bold text-xs flex items-center">
            <span className="ml-1">סה"כ {totalMinutes} דקות</span>
            <Clock className="h-3.5 w-3.5" />
          </span>
        </header>

        <div className="space-y-6">
          {guide.map((item, index) => (
            <section key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 text-right animate-reveal">
              <div className="flex items-start justify-between mb-6 flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="w-12 h-12 rounded-xl bg-[#01696f]/10 text-[#01696f] dark:text-[#8bd79b] flex items-center justify-center shadow-sm font-extrabold text-xl">
                    {index + 1}
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.chapter_title || `פרק ${index + 1}`}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">משך זמן: {item.duration_minutes} דקות</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Questions & Messages */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border-r-4 border-[#01696f]">
                    <h5 className="text-[#01696f] dark:text-[#8bd79b] font-bold text-sm mb-2 flex items-center justify-end gap-1.5">
                      <span>שאלת פתיחה בקול</span>
                      <span className="w-1.5 h-1.5 bg-[#01696f] rounded-full shrink-0"></span>
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200 text-sm italic">"{item.opening_question}"</p>
                  </div>

                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl border-r-4 border-emerald-600">
                    <h5 className="text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-2 flex items-center justify-end gap-1.5">
                      <span>מסר מרכזי</span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0"></span>
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{item.key_message}</p>
                  </div>
                </div>

                {/* Column 2: Instructions & Things to Watch for */}
                <div className="space-y-4">
                  <div className="p-4 bg-[#01696f]/5 dark:bg-[#01696f]/10 rounded-xl border border-[#01696f]/15">
                    <h5 className="text-[#01696f] dark:text-[#8bd79b] font-bold text-sm mb-2 flex items-center justify-end gap-1.5">
                      <span>הוראות לאביהו</span>
                      <span className="w-1.5 h-1.5 bg-[#01696f] rounded-full shrink-0"></span>
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">{item.exercise_instructions}</p>
                  </div>

                  <div className="p-4 bg-amber-50/40 dark:bg-amber-950/10 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                    <h5 className="text-amber-700 dark:text-amber-400 font-bold text-sm mb-2 flex items-center justify-end gap-1.5">
                      <span>שים לב ל-</span>
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{item.watch_for}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
                <button className="bg-[#01696f] text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 hover:bg-[#005a60] transition-colors shadow-md active:scale-95 duration-150">
                  <span>סמן כהושלם</span>
                </button>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Right Column (Sidebar with metadata & notes) */}
      <div className="space-y-6">
        <aside className="sticky top-24">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            {/* Header Image */}
            <div className="h-32 relative">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Workshop session"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-4 right-4 text-white text-right">
                <h5 className="font-bold text-base">פרטי הסדנה</h5>
              </div>
            </div>

            {/* Sidebar content */}
            <div className="p-6 space-y-6 text-right">
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="font-medium text-gray-700 dark:text-gray-300">סטטוס הכנה</span>
                <span className="text-[#01696f] dark:text-[#8bd79b] font-bold">75%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-[#01696f] dark:bg-[#8bd79b] h-full w-3/4 rounded-full"></div>
              </div>

              <ul className="space-y-3 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center justify-end gap-2 line-through opacity-60">
                  <span>הורדת מצגת</span>
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>הדפסת חוברות (40 עותקים)</span>
                  <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>סידור חדר (בצורת ח')</span>
                  <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                </li>
              </ul>

              <button className="w-full bg-[#01696f] hover:bg-[#005a60] text-white py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md flex items-center justify-center gap-2">
                <span>הדפס מדריך מלא (PDF)</span>
              </button>
            </div>
          </div>

          {/* Facilitator tip */}
          <div className="mt-6 bg-[#01696f]/5 dark:bg-[#01696f]/10 p-4 rounded-2xl border border-[#01696f]/10 text-right">
            <div className="flex items-center justify-end gap-2 mb-2 text-[#01696f] dark:text-[#8bd79b]">
              <h6 className="font-bold">טיפ מנחה:</h6>
              <Lightbulb className="h-4 w-4 shrink-0" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              התחברות רגשית מתחילה בפרטים הקטנים. שים לב לשמות של המשתתפים, הקשב לניואנסים ונסה ליצור סביבה בטוחה ומכילה לאורך כל הסדנה.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function GeneratedMaterials() {
  const { topic, marketAnalysis } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('slides');

  useEffect(() => {
    if (!topic || !marketAnalysis) {
      navigate('/');
    }
  }, [topic, marketAnalysis, navigate]);

  if (!topic || !marketAnalysis) return null;

  const title = marketAnalysis?.syllabus?.title || marketAnalysis?.syllabus?.workshop_title || topic;

  const tabs = [
    { id: 'slides', name: 'מצגת למנחה', icon: Presentation },
    { id: 'handout', name: 'חוברת למשתתף', icon: FileText },
    { id: 'brief', name: 'בריף שיווקי', icon: Briefcase },
    { id: 'guide', name: 'מדריך מנחה', icon: BookOpen },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f9f9ff] dark:bg-gray-950">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#a6f4b5]/20 dark:bg-[#a6f4b5]/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#b4c5ff]/20 dark:bg-[#b4c5ff]/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-[#01696f] dark:text-[#8bd79b]">חומרי הסדנה מוכנים</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">{title}</p>
          </div>
          <button
            onClick={() => navigate('/customize')}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0"
          >
            <Settings className="ml-2 h-4 w-4" />
            <span>הגדרות מתקדמות</span>
          </button>
        </div>

        {/* Navigation Tabs Area */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/40 dark:border-gray-700/40 overflow-hidden">
          <div className="border-b border-gray-200/40 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-950/20">
            <nav className="flex w-full overflow-x-auto no-scrollbar" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 flex flex-col items-center justify-center py-4 px-6 transition-all relative min-w-[120px] outline-none
                      ${activeTab === tab.id
                        ? 'text-[#01696f] dark:text-[#8bd79b] bg-gray-50/50 dark:bg-gray-800/50 font-bold'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50/20 dark:hover:bg-gray-800/20'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 mb-1.5 ${activeTab === tab.id ? 'text-[#01696f] dark:text-[#8bd79b]' : 'text-gray-400'}`} />
                    <span className="text-sm whitespace-nowrap">{tab.name}</span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 right-0 left-0 h-[3px] bg-[#01696f] dark:bg-[#8bd79b]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'slides' && <SlideDeck />}
            {activeTab === 'handout' && <Handout />}
            {activeTab === 'brief' && <WorkshopBrief />}
            {activeTab === 'guide' && <FacilitatorGuide />}
          </div>
        </div>
      </div>
    </div>
  );
}