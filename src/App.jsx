// [Category A: UI / Layout]

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import TopicInput from './views/TopicInput';
import MarketAnalysis from './views/MarketAnalysis';
import GeneratedMaterials from './views/GeneratedMaterials';
import WorkshopCustomizer from './views/WorkshopCustomizer';
import { Moon, Sun } from 'lucide-react';
import { useStore } from './store';

function App() {
  const { theme, toggleTheme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router basename="/sadna_test">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200" dir="rtl">
        <header className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors duration-200 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-extrabold text-[#01696f] dark:text-[#8bd79b] tracking-tight">
                  מחולל הסדנאות של אביהו
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
          <Routes>
            <Route path="/" element={<TopicInput />} />
            <Route path="/analysis" element={<MarketAnalysis />} />
            <Route path="/materials" element={<GeneratedMaterials />} />
            <Route path="/customize" element={<WorkshopCustomizer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;