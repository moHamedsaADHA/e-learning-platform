import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { reverseGradeMapping } from '../utils/gradeMapping.js';

const GradeProtectedRoute = ({ children, requiredGradeSlug }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // إذا لم يكن المستخدم مسجل دخول
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            مطلوب تسجيل الدخول
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            يجب عليك تسجيل الدخول أولاً للوصول إلى محتوى الصف الدراسي
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/login" 
              className="block w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              تسجيل الدخول
            </Link>
            
            <Link 
              to="/register" 
              className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              إنشاء حساب جديد
            </Link>
            
            <Link 
              to="/" 
              className="block w-full text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 py-2 font-medium transition-colors duration-200"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان الأدمن أو المدرس - السماح بالوصول لكل الصفوف
  if (user?.role === 'admin' || user?.role === 'instructor') {
    return children;
  }

  // إذا كان طالب - فحص الصف المسجل به
  const userGrade = user?.grade;
  const requiredGradeName = reverseGradeMapping[requiredGradeSlug];
  
  // إذا كان الصف المطلوب مطابق للصف المسجل به المستخدم
  if (userGrade === requiredGradeName) {
    return children;
  }

  // إذا لم يكن له صلاحية للوصول للصف
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          غير مسموح بالدخول
        </h1>
        
        <div className="text-gray-600 dark:text-gray-400 mb-6 space-y-2">
          <p>
            أنت مسجل في: <strong className="text-primary-600 dark:text-primary-400">{userGrade || 'غير محدد'}</strong>
          </p>
          <p>
            الصف المطلوب: <strong className="text-secondary-600 dark:text-secondary-400">{requiredGradeName}</strong>
          </p>
          <p className="mt-4">
            يمكنك فقط الوصول للصف المسجل به. إذا كنت بحاجة للوصول لصفوف أخرى، يرجى التواصل مع الإدارة.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            to="/grades" 
            className="block w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
          >
            العودة للكورسات
          </Link>
          
          <Link 
            to="/profile" 
            className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
          >
            عرض الملف الشخصي
          </Link>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              هل تريد الانتقال للصف المسموح لك؟
            </p>
            
            {userGrade && (
              <Link 
                to={`/grades/${Object.keys(reverseGradeMapping).find(key => reverseGradeMapping[key] === userGrade)}`}
                className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                الذهاب إلى {userGrade}
              </Link>
            )}
          </div>
          
          <div className="pt-3 text-xs text-gray-400 dark:text-gray-500">
            للاستفسارات أو طلب تغيير الصف، تواصل مع الإدارة
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeProtectedRoute;