import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { RefreshCw, Play } from 'lucide-react';
import Particles from './Particles';

export default function SlideDeck() {
  const { topic, marketAnalysis, materials, setMaterialStatus } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const deckRef = useRef(null);

  useEffect(() => {
    // Simulate generation time
    if (materials.slideDeck.status === 'idle') {
      setMaterialStatus('slideDeck', 'generating');
      setTimeout(() => {
        setMaterialStatus('slideDeck', 'done');
      }, 2000);
    }
  }, [materials.slideDeck.status, setMaterialStatus]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (materials.slideDeck.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">מייצר מצגת למנחה...</p>
      </div>
    );
  }

  if (materials.slideDeck.status === 'error') {
    return (
      <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-600 mb-4">שגיאה ביצירת המצגת.</p>
        <button
          onClick={() => setMaterialStatus('slideDeck', 'idle')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <RefreshCw className="ml-2 h-4 w-4" />
          נסה שוב
        </button>
      </div>
    );
  }

  const winningAngle = marketAnalysis?.differentiationAngles?.find(a => a.isWinner);

  const slides = [
    {
      id: 'title',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
          <Particles />
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 slide-reveal">
            {topic}
          </h1>
          <p className="text-2xl text-green-800 dark:text-green-400 font-medium slide-reveal" style={{ animationDelay: '0.2s' }}>
            סדנה מעשית בשיטת "דרך"
          </p>
          <div className="mt-12 w-24 h-1 bg-green-600 dark:bg-green-500 rounded slide-reveal" style={{ animationDelay: '0.4s' }}></div>
          <p className="mt-8 text-lg text-gray-600 dark:text-gray-300 slide-reveal" style={{ animationDelay: '0.6s' }}>
            בהנחיית אביהו סיטון
          </p>
        </div>
      )
    },
    {
      id: 'why',
      content: (
        <div className="h-full flex flex-col justify-center px-16 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">האתגר (למה אנחנו כאן?)</h2>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 slide-reveal" style={{ animationDelay: '0.2s' }}>
            <p className="text-2xl leading-relaxed text-gray-800 dark:text-gray-200">
              {marketAnalysis?.marketResearch.landscape || "ניתוח חסר"}
            </p>
          </div>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center text-xl text-gray-700 dark:text-gray-300 slide-reveal" style={{ animationDelay: '0.4s' }}>
              <span className="h-3 w-3 bg-green-500 rounded-full ml-4"></span>
              לא עוד "טיפים" או "תאוריה"
            </li>
            <li className="flex items-center text-xl text-gray-700 dark:text-gray-300 slide-reveal" style={{ animationDelay: '0.5s' }}>
              <span className="h-3 w-3 bg-green-500 rounded-full ml-4"></span>
              חסר חיבור אמיתי בין ידע לעבודה רגשית
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'agenda',
      content: (
        <div className="h-full flex flex-col justify-center px-16 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">אג'נדה</h2>
          <ol className="list-decimal list-inside space-y-6 text-2xl text-gray-800 dark:text-gray-200">
             <li className="slide-reveal" style={{ animationDelay: '0.2s' }}>מבוא והיכרות עם האתגר</li>
             <li className="slide-reveal" style={{ animationDelay: '0.3s' }}>{winningAngle?.title || "הגישה הייחודית"}</li>
             <li className="slide-reveal" style={{ animationDelay: '0.4s' }}>נהר החיים - מושגי יסוד</li>
             <li className="slide-reveal" style={{ animationDelay: '0.5s' }}>נקודת הבחירה - מושגי יסוד</li>
             <li className="slide-reveal" style={{ animationDelay: '0.6s' }}>עבודה מעשית (זיהוי הסלעים)</li>
             <li className="slide-reveal" style={{ animationDelay: '0.7s' }}>סיכום והטמעה</li>
          </ol>
        </div>
      )
    },
    {
      id: 'solution',
      content: (
        <div className="h-full flex flex-col justify-center px-16 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">הגישה שלנו</h2>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 slide-reveal" style={{ animationDelay: '0.2s' }}>
            <p className="text-2xl leading-relaxed text-gray-800 dark:text-gray-200">
              {winningAngle?.positioningStatement || "מיצוב חסר"}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'methodology1',
      content: (
        <div className="h-full flex flex-col justify-center px-16 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">מושגי יסוד: נהר החיים</h2>
          <div className="bg-green-50 dark:bg-gray-800 p-10 rounded-2xl border border-green-100 dark:border-gray-700 slide-reveal" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-3xl font-bold text-green-900 dark:text-green-400 mb-4">הנפש כנהר זורם</h3>
            <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
              הנפש היא כנהר שמחפש כל הזמן תנועה ואיזון. מכשולים אינם "בעיות" שצריך לסלק מיד, אלא הם ביטוי לניסיון של הנפש להתארגן מחדש ולהגן על עצמה מול אתגרי החיים.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'methodology2',
      content: (
        <div className="h-full flex flex-col justify-center px-16 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">מושגי יסוד: נקודת הבחירה</h2>
          <div className="bg-green-50 dark:bg-gray-800 p-10 rounded-2xl border border-green-100 dark:border-gray-700 slide-reveal" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-3xl font-bold text-green-900 dark:text-green-400 mb-4">יציאה מטייס אוטומטי</h3>
            <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
              זיהוי הרגע המדויק שבו אנו עוברים מתגובה אוטומטית כתוצאה מהאתגר, לבחירה מודעת. זו הנקודה שבה אנו לוקחים אחריות אישית מלאה.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'exercise',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center px-16 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">עבודה מעשית</h2>
          <div className="w-full max-w-3xl bg-white/90 dark:bg-gray-800/90 p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 slide-reveal" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-400 mb-6">תרגיל: זיהוי סלעים בנהר</h3>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              חשבו על אתגר אחד משמעותי הקשור ל{topic}.<br/>מהו ה"סלע" שחוסם את הזרימה? איך המים (הנפש) מנסים לעקוף אותו כרגע?
            </p>
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              10 דקות - כתיבה אישית
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'closing',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
          <Particles />
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-8 slide-reveal">סיכום וצידה לדרך</h2>
          <p className="text-2xl text-gray-700 dark:text-gray-300 max-w-2xl slide-reveal" style={{ animationDelay: '0.2s' }}>
            "המסע אל העצמאות הרגשית אינו נגמר, אבל היום קיבלתם מצפן."
          </p>
          <div className="mt-12 space-y-4 slide-reveal" style={{ animationDelay: '0.4s' }}>
            <p className="text-xl font-medium text-green-800 dark:text-green-400">אביהו סיטון | שיטת דרך</p>
            <p className="text-lg text-gray-500 dark:text-gray-400">avihusitton.com</p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">מצגת למנחה</h3>
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <Play className="ml-2 h-4 w-4 text-gray-500" />
          {isFullscreen ? 'סגור מסך מלא' : 'מסך מלא'}
        </button>
      </div>

      <div
        ref={deckRef}
        className={`relative overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 ease-in-out ${isFullscreen ? 'w-full h-screen fixed inset-0 z-50 rounded-none border-none' : 'w-full aspect-video'}`}
        dir="rtl"
        onClick={nextSlide}
      >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-green-200 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-green-100 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Slides Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${
                index === currentSlide
                  ? 'opacity-100 scale-100 z-20 pointer-events-auto'
                  : index < currentSlide
                    ? 'opacity-0 scale-110 -z-10 pointer-events-none'
                    : 'opacity-0 scale-90 -z-10 pointer-events-none'
              }`}
            >
              {/* Only render content if slide is current or adjacent for performance */}
              {Math.abs(index - currentSlide) <= 1 && slide.content}
            </div>
          ))}
        </div>

        {/* Navigation Controls (Visible on hover or mobile) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 space-x-reverse z-30 opacity-0 hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 backdrop-blur"
          >
            →
          </button>
          <span className="px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium backdrop-blur">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 backdrop-blur"
          >
            ←
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        לחץ על השקופית כדי להתקדם או השתמש בכפתורים
      </p>
    </div>
  );
}