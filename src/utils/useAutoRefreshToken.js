import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { refreshTokenIfNeeded } from '../utils/tokenManager.js';

// هوك لتحديث التوكن تلقائياً
export const useAutoRefreshToken = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      // فحص التوكن كل دقيقة
      intervalRef.current = setInterval(() => {
        refreshTokenIfNeeded();
      }, 60 * 1000); // كل دقيقة

      // فحص أولي
      refreshTokenIfNeeded();
    } else {
      // مسح الـ interval عند تسجيل الخروج
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // تنظيف عند إلغاء تركيب المكون
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated]);

  // فحص التوكن عند focus على النافذة
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        refreshTokenIfNeeded();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  // فحص التوكن عند العودة من وضع التبويب المخفي
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        refreshTokenIfNeeded();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);
};

export default useAutoRefreshToken;