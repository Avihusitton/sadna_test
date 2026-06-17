import { useState, useEffect, useRef } from 'react';
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

  const slides_data = marketAnalysis?.slides || [];

  const slides = slides_data.length > 0 ? slides_data.map((slide, index) => ({
    id: `slide-${index}`,
    content: (
      <div className="h-full flex flex-col justify-center px-16 relative z-10" dir="rtl">
        {/* Slide type badge */}
        <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-4 slide-reveal">
          {slide.slide_type === 'opening' && 'פתיחה'}
          {slide.slide_type === 'pain' && 'האתגר'}
          {slide.slide_type === 'tool' && 'הכלי'}
          {slide.slide_type === 'exercise' && 'תרגיל'}
          {slide.slide_type === 'insight' && 'תובנה מהשטח'}
          {slide.slide_type === 'closing' && 'סגירה'}
        </span>

        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 slide-reveal">
          {slide.title}
        </h2>

        {/* Content bullets as human sentences */}
        <div className="space-y-4">
          {(slide.bullets || []).map((sentence, i) => (
            <p
              key={i}
              className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed slide-reveal"
              style={{ animationDelay: `${0.2 + i * 0.15}s` }}
            >
              {sentence}
            </p>
          ))}
        </div>

        {/* Facilitator note */}
        {slide.facilitator_note && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-xl slide-reveal" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-green-800 dark:text-green-400 font-medium">
              💡 למנחה: {slide.facilitator_note}
            </p>
          </div>
        )}
      </div>
    )
  })) : [
    {
      id: 'fallback',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
          <Particles />
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 slide-reveal">{topic}</h1>
          <p className="text-2xl text-green-800 dark:text-green-400 font-medium slide-reveal">סדנה מעשית בשיטת "דרך"</p>
          <p className="mt-8 text-lg text-gray-500 dark:text-gray-400 slide-reveal">בהנחיית אביהו סיטון</p>
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