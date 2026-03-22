import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
        >
            العودة للرئيسية
          </Link>
        </div>
      </div>
  );
};

export default NotFound;