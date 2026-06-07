import React from 'react';
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
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200" dir="rtl">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold text-green-800 tracking-tight">Workshop<span className="text-green-500">Gen</span></span>
                </Link>
                <nav className="ml-6 flex space-x-8 space-x-reverse hidden sm:flex">
                  <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    בית
                  </Link>
                </nav>
              </div>
              <div className="flex items-center">
                 <button
                   onClick={toggleTheme}
                   className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                   aria-label="Toggle Dark Mode"
                 >
                   {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                 </button>
              </div>
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