import React from 'react';
import { getYouTubeEmbedUrl } from '../utils/helpers.js';

const LessonPlayer = ({ lesson, onMarkComplete, onDownloadNotes }) => {
  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
      <div className="relative aspect-video">
        <iframe
          src={embedUrl}
          title={lesson.title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{lesson.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{lesson.description}</p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onMarkComplete}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
              lesson.completed 
                ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300 cursor-default'
                : 'bg-success-600 text-white hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2'
            }`}
            disabled={lesson.completed}
          >
            {lesson.completed ? '✅ مكتمل' : 'علامة كمُنجَز'}
          </button>
          
          {lesson.materials && (
            <button 
              onClick={onDownloadNotes} 
              className="px-6 py-3 bg-secondary-600 text-white rounded-lg font-semibold hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              تحميل الملاحظات
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;