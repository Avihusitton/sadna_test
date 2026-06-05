import { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { Printer } from 'lucide-react';

export default function Handout() {
  const { topic, materials, setMaterialStatus } = useStore();
  const printRef = useRef(null);

  useEffect(() => {
    // Simulate generation time
    if (materials.handout.status === 'idle') {
      setMaterialStatus('handout', 'generating');
      setTimeout(() => {
        setMaterialStatus('handout', 'done');
      }, 1500);
    }
  }, [materials.handout.status, setMaterialStatus]);

  const handlePrint = () => {
    const originalChildren = Array.from(document.body.children);
    originalChildren.forEach(child => {
      if (child.style) child.style.display = 'none';
    });

    const printContainer = document.createElement('div');
    printContainer.dir = 'rtl';
    printContainer.style.cssText = "font-family: 'Heebo', sans-serif; max-width: 21cm; margin: 0 auto; padding: 2cm; color: black; background: white;";

    const clonedContent = printRef.current.cloneNode(true);
    printContainer.appendChild(clonedContent);
    document.body.appendChild(printContainer);

    window.print();

    document.body.removeChild(printContainer);
    originalChildren.forEach(child => {
      if (child.style) child.style.display = '';
    });
  };

  if (materials.handout.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">מייצר חוברת למשתתף...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">חוברת למשתתף (פורמט הדפסה)</h3>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
        >
          <Printer className="ml-2 h-4 w-4" />
          הדפס / שמור כ-PDF
        </button>
      </div>

      <div className="bg-gray-200 p-8 rounded-xl overflow-auto h-[600px] flex justify-center border border-gray-300">
        {/* A4 Page Simulation */}
        <div
          ref={printRef}
          className="bg-white w-[21cm] min-h-[29.7cm] p-[2cm] shadow-lg text-gray-900 shrink-0"
        >
          {/* Header */}
          <header className="border-b-2 border-blue-800 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{topic}</h1>
            <p className="text-xl text-gray-600">מדריך אישי למשתתף | בהנחיית אביהו סיטון</p>
          </header>

          {/* Intro */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b border-gray-200 pb-2">מטרות הסדנה</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-800 text-lg">
              <li>להבין את המנגנון הפנימי שפועל בנו סביב הנושא.</li>
              <li>לרכוש כלים מ"שיטת דרך" לעבודה רגשית עצמאית.</li>
              <li>להפוך קושי נחווה להזדמנות לצמיחה ושינוי פרספקטיבה.</li>
            </ul>
          </section>

          {/* Methodology */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b border-gray-200 pb-2">מושגי מפתח משיטת דרך</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">נהר החיים</h3>
                <p className="text-gray-700 leading-relaxed mt-1">
                  הנפש היא כנהר זורם. כשיש מחסום, המים (כוח החיים) ימצאו דרך לעקוף אותו - לפעמים בצורה שמייצרת "תסמינים" או קושי. התסמין אינו הבעיה, אלא ניסיון ההתמודדות.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">נקודת הבחירה</h3>
                <p className="text-gray-700 leading-relaxed mt-1">
                  היכולת לעצור את התגובה האוטומטית ("טייס אוטומטי") ולבחור כיצד לפעול מתוך חיבור עמוק ואחריות אישית.
                </p>
              </div>
            </div>
          </section>

          {/* Exercise Space */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b border-gray-200 pb-2">תרגיל אישי: זיהוי הסלע</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[200px]">
              <p className="font-semibold text-gray-800 mb-4">מהו "הסלע" המרכזי שמפריע לזרימה שלך כרגע הקשור ל{topic}?</p>
              {/* Lines for writing */}
              <div className="space-y-8 mt-8">
                <div className="border-b border-gray-300 w-full"></div>
                <div className="border-b border-gray-300 w-full"></div>
                <div className="border-b border-gray-300 w-full"></div>
                <div className="border-b border-gray-300 w-full"></div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>אביהו סיטון | קליניקה ברתמים ובזום | avihusitton.com</p>
            <p>המרחב ליצירת שינוי מבפנים</p>
          </footer>
        </div>
      </div>
    </div>
  );
}