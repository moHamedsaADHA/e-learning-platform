import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.js';
import MathBackground from '../components/MathBackground.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 relative overflow-hidden">
      {/* خلفية الرياضيات */}
      <MathBackground />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">🔒</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">نسيت كلمة المرور؟</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
            </p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400">
              <div className="flex items-center">
                <span className="text-lg ml-2">✅</span>
                <span>{message}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400">
              <div className="flex items-center">
                <span className="text-lg ml-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                placeholder="أدخل بريدك الإلكتروني"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                  جاري الإرسال...
                </div>
              ) : (
                'إرسال رابط إعادة التعيين'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
            >
              ← العودة لتسجيل الدخول
            </Link>
            
            <div className="text-gray-500 dark:text-gray-400">
              ليس لديك حساب؟{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors duration-200"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;