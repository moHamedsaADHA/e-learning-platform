import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const location = useLocation();

  // إذا كان في وضع التحميل، إظهار شاشة تحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن مسجل دخول، إعادة توجيه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // إذا كانت الصفحة تتطلب صلاحيات مدير وليس مديراً
  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;