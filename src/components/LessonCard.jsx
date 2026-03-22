import React from 'react';
import { Link } from 'react-router-dom';

const LessonCard = ({ lesson }) => {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transform hover:-translate-y-1">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1 line-clamp-2">{lesson.lessonTitle || lesson.title}</h3>
            <p className="text-primary-100 text-sm font-medium">{lesson.unitTitle}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium">📚 درس</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {lesson.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{lesson.description}</p>
        )}
        
        {/* Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1 space-x-reverse">
              <span>📅</span>
              <span>{new Date(lesson.createdAt).toLocaleDateString('ar-EG')}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {lesson.videoUrl && (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                🎥 فيديو
              </span>
            )}
            {lesson.completed && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                ✅ مكتمل
              </span>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <Link 
          to={`/lessons/${lesson._id || lesson.id}`} 
          className="group/btn w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
        >
          <span>مشاهدة الدرس</span>
          <span className="transform transition-transform group-hover/btn:translate-x-1">▶️</span>
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;