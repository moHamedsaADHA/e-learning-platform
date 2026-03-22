import { store } from '../redux/store.js';
import { refreshToken as refreshTokenAction, logout } from '../redux/slices/authSlice.js';

// فترة انتهاء الصلاحية (افتراضية: ساعة واحدة)
const TOKEN_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

// حفظ وقت الحصول على التوكن
const setTokenTimestamp = () => {
  localStorage.setItem('tokenTimestamp', Date.now().toString());
};

// الحصول على وقت الحصول على التوكن
const getTokenTimestamp = () => {
  const timestamp = localStorage.getItem('tokenTimestamp');
  return timestamp ? parseInt(timestamp) : null;
};

// فحص ما إذا كان التوكن منتهي الصلاحية
export const isTokenExpired = () => {
  const timestamp = getTokenTimestamp();
  if (!timestamp) return true;
  
  const currentTime = Date.now();
  return (currentTime - timestamp) > TOKEN_EXPIRY_TIME;
};

// فحص ما إذا كان التوكن سينتهي قريباً (خلال 5 دقائق)
export const isTokenExpiringSoon = () => {
  const timestamp = getTokenTimestamp();
  if (!timestamp) return true;
  
  const currentTime = Date.now();
  const timeLeft = TOKEN_EXPIRY_TIME - (currentTime - timestamp);
  return timeLeft < (5 * 60 * 1000); // 5 minutes
};

// تحديث التوكن تلقائياً
export const refreshTokenIfNeeded = async () => {
  const state = store.getState();
  const { isAuthenticated, token } = state.auth;
  
  if (!isAuthenticated || !token) {
    return false;
  }
  
  if (isTokenExpired()) {
    // التوكن منتهي الصلاحية، محاولة تجديده
    try {
      await store.dispatch(refreshTokenAction()).unwrap();
      setTokenTimestamp();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      store.dispatch(logout());
      return false;
    }
  } else if (isTokenExpiringSoon()) {
    // التوكن سينتهي قريباً، تجديده في الخلفية
    try {
      await store.dispatch(refreshTokenAction()).unwrap();
      setTokenTimestamp();
      return true;
    } catch (error) {
      console.warn('Failed to refresh token in background:', error);
      return false;
    }
  }
  
  return true;
};

// تعيين timestamp عند تسجيل الدخول أو التحقق من OTP
export const setTokenOnLogin = () => {
  setTokenTimestamp();
};

// مسح timestamp عند تسجيل الخروج
export const clearTokenTimestamp = () => {
  localStorage.removeItem('tokenTimestamp');
};

// إضافة interceptor للـ API requests
export const setupTokenInterceptor = (apiClient) => {
  // Request interceptor
  apiClient.interceptors.request.use(
    async (config) => {
      await refreshTokenIfNeeded();
      
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          await store.dispatch(refreshTokenAction()).unwrap();
          setTokenTimestamp();
          
          // إعادة المحاولة مع التوكن الجديد
          const token = localStorage.getItem('authToken');
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};