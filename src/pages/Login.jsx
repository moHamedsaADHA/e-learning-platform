import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice.js';
import { validatePassword } from '../utils/helpers.js';
import MathBackground from '../components/MathBackground';

const Login = () => {
  const [formData, setFormData] = useState({
    code: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // عرض رسالة النجاح إذا جاء من صفحة التسجيل
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.code) {
        setFormData(prev => ({ ...prev, code: location.state.code }));
      }
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code) {
      newErrors.code = 'كود الطالب مطلوب';
    } else if (formData.code.trim().length < 3) {
      newErrors.code = 'كود الطالب غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(loginUser(formData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <MathBackground />
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تسجيل الدخول</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">مرحباً بك في منصة البداية</p>
          </div>
          
          {successMessage && (
            <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-800 dark:text-success-300 px-4 py-3 rounded-lg mb-4">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-800 dark:text-error-300 px-4 py-3 rounded-lg mb-4">
              {typeof error === 'string' ? error : error.message || 'حدث خطأ في تسجيل الدخول'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كود الطالب</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.code 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="أدخل كود الطالب"
              />
              {errors.code && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.code}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                    errors.password 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.password}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ليس لديك حساب؟ <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">سجل الآن</Link>
            </p>
            <p className="text-sm">
              <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">نسيت كلمة المرور؟</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
