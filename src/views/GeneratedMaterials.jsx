import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Presentation, FileText, Briefcase, Settings } from 'lucide-react';
import SlideDeck from '../components/generators/SlideDeck';
import Handout from '../components/generators/Handout';
import WorkshopBrief from '../components/generators/WorkshopBrief';

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

  const tabs = [
    { id: 'slides', name: 'מצגת למנחה', icon: Presentation },
    { id: 'handout', name: 'חוברת למשתתף', icon: FileText },
    { id: 'brief', name: 'בריף שיווקי', icon: Briefcase },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">חומרי הסדנה מוכנים</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{topic}</p>
        </div>
        <button
          onClick={() => navigate('/customize')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
        >
          <Settings className="ml-2 h-4 w-4" />
          הגדרות מתקדמות
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <nav className="-mb-px flex space-x-8 space-x-reverse px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className={`
                    ml-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-green-500 dark:text-green-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}
                  `} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'slides' && <SlideDeck />}
          {activeTab === 'handout' && <Handout />}
          {activeTab === 'brief' && <WorkshopBrief />}
        </div>
      </div>
    </div>
  );
}