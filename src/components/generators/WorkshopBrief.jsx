import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { FileText, Download } from 'lucide-react';

export default function WorkshopBrief() {
  const { topic, marketAnalysis, materials, setMaterialStatus } = useStore();
  const briefRef = useRef(null);

  useEffect(() => {
    // Simulate generation time
    if (materials.brief.status === 'idle') {
      setMaterialStatus('brief', 'generating');
      setTimeout(() => {
        setMaterialStatus('brief', 'done');
      }, 1000);
    }
  }, [materials.brief.status, setMaterialStatus]);

  const handleDownload = () => {
    const printContent = briefRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <div dir="rtl" style="font-family: 'Heebo', sans-serif; max-width: 800px; margin: 0 auto; padding: 2cm; color: black; background: white;">
        ${printContent}
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (materials.brief.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">מנסח בריף שיווקי...</p>
      </div>
    );
  }

  const winnerAngle = marketAnalysis?.differentiationAngles.find(a => a.isWinner);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">בריף שיווקי (ללקוח/ארגון)</h3>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
        >
          <Download className="ml-2 h-4 w-4" />
          שמור כ-PDF לשליחה
        </button>
      </div>

      <div className="bg-gray-100 p-8 rounded-xl flex justify-center border border-gray-200">
        <div
          ref={briefRef}
          className="bg-white w-full max-w-3xl p-10 shadow-sm text-gray-900 rounded-lg"
        >
          {/* Header */}
          <div className="text-center mb-10 pb-6 border-b-2 border-green-100">
            <h1 className="text-3xl font-extrabold text-green-900 mb-3">הצעת סדנה: {topic}</h1>
            <p className="text-xl text-gray-600">{winnerAngle?.title || "סדנה מעשית"}</p>
          </div>

          <div className="space-y-8">
            {/* The Problem */}
            <section>
              <h2 className="flex items-center text-xl font-bold text-gray-800 mb-3">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center ml-3">1</span>
                האתגר
              </h2>
              <p className="text-gray-700 leading-relaxed pr-11">
                ארגונים ואנשים רבים מתמודדים עם הקושי סביב הנושא של "{topic}". לרוב, הפתרונות המוצעים נשארים ברמת התיאוריה, ולא מספקים כלים פרקטיים לעבודה אישית שיוצרת שינוי אמיתי ובר-קיימא בשטח.
              </p>
            </section>

            {/* The Solution */}
            <section>
              <h2 className="flex items-center text-xl font-bold text-gray-800 mb-3">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center ml-3">2</span>
                הגישה שלנו
              </h2>
              <p className="text-gray-700 leading-relaxed pr-11 font-medium">
                {winnerAngle?.positioningStatement || "גישה מעשית מבוססת שיטת דרך."}
              </p>
              <p className="text-gray-700 leading-relaxed pr-11 mt-2">
                אנו משלבים ידע פסיכולוגי, רוח וכלים מעשיים כדי להקנות למשתתפים "עצמאות רגשית" – היכולת להפוך למטפלים של עצמם ברגעי האמת.
              </p>
            </section>

            {/* Outcomes */}
            <section>
              <h2 className="flex items-center text-xl font-bold text-gray-800 mb-3">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center ml-3">3</span>
                תוצאות מצופות
              </h2>
              <ul className="list-disc list-outside space-y-2 text-gray-700 pr-16">
                <li>מעבר מתגובתיות (טייס אוטומטי) לפרואקטיביות ובחירה.</li>
                <li>שיפור החוסן האישי והארגוני אל מול משברים.</li>
                <li>שפה חדשה ומשותפת המבוססת על אחריות אישית וראיית הטוב.</li>
              </ul>
            </section>

            {/* Logistics */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">פרטים טכניים</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-semibold block text-gray-500">פורמט מומלץ:</span>
                  {marketAnalysis?.economicValidation.recommendedFormat === 'half-day' ? 'חצי יום מרוכז' : 'מפגש מעמיק'}
                </div>
                <div>
                  <span className="font-semibold block text-gray-500">השקעה למשולב/ארגון:</span>
                  {marketAnalysis?.economicValidation.estimatedPricePerGroup}
                </div>
                <div>
                  <span className="font-semibold block text-gray-500">קהל יעד:</span>
                  מנהלים, צוותים או אנשים פרטיים (מותאם אישית)
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-bold text-gray-900">אביהו סיטון</p>
            <p className="text-gray-500">פסיכותרפיסט ומנחה קבוצות | 053-2853235 | avihusitton.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}