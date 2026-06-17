import React from 'react';
import { useStore } from '../store';
import { CheckCircle, Circle, Loader } from 'lucide-react';

const STEPS = [
  { id: 'research',   label: 'מחקר שוק ואנליזה',        storeKey: 'stage1Done'  },
  { id: 'strategy',   label: 'מיצוב ובידול',            storeKey: 'stage15Done' },
  { id: 'syllabus',   label: 'בניית סילבוס',            storeKey: 'stage2Done'  },
  { id: 'slides',     label: 'יצירת שקפים ותוכן',       storeKey: 'stage3Done'  },
];

export default function ProgressChecklist() {
  const store = useStore();
  const status = store.status;

  // Active step = first step where storeKey is false
  const activeStep = STEPS.find(step => !store[step.storeKey]);

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
      <ul className="space-y-4">
        {STEPS.map((step) => {
          const isDone = store[step.storeKey];
          const isActive = status === 'generating' && activeStep && activeStep.id === step.id;
          
          let Icon;
          let iconClass;
          let textClass;

          if (isDone) {
            Icon = CheckCircle;
            iconClass = "text-green-500 w-5 h-5 transition-all duration-300";
            textClass = "text-gray-500 dark:text-gray-400 line-through transition-all duration-300";
          } else if (isActive) {
            Icon = Loader;
            iconClass = "text-blue-500 w-5 h-5 animate-spin transition-all duration-300";
            textClass = "text-blue-600 dark:text-blue-400 font-medium transition-all duration-300";
          } else {
            Icon = Circle;
            iconClass = "text-gray-300 dark:text-gray-600 w-5 h-5 transition-all duration-300";
            textClass = "text-gray-400 dark:text-gray-500 transition-all duration-300";
          }

          return (
            <li
              key={step.id}
              className="flex items-center space-x-3 space-x-reverse transition-all duration-300"
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                <Icon className={iconClass} />
              </div>
              <span className={`text-base ${textClass}`}>{step.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
