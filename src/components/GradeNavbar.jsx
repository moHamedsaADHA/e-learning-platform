import React from 'react';

const GradeNavbar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'lessons', label: 'الحصص', icon: '📚' },
    { id: 'schedule', label: 'الجدول الدراسي', icon: '📅' },
    { id: 'tasks', label: 'الواجبات', icon: '📝' },
    { id: 'materials', label: 'المواد التعليمية', icon: '📂' },
    { id: 'quizzes', label: 'الكوويزات', icon: '🧠' }
  ];

  return (
    <nav className="mb-8 border-b border-gray-200 dark:border-gray-700">
      <div className="flex overflow-x-auto space-x-1 space-x-reverse">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex items-center space-x-2 space-x-reverse px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-500'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default GradeNavbar;