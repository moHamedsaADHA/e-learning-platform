import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice.js';
import { showToast, validatePassword } from '../utils/helpers.js';
import { changePassword } from '../api/auth.js';
import ThemeToggle from '../components/ThemeToggle.jsx';

const Settings = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setErrors({});
      
      await dispatch(updateProfile(profileData)).unwrap();
      showToast('تم حفظ بيانات الحساب بنجاح', 'success');
    } catch (error) {
      console.error('خطأ في تحديث البيانات:', error);
      
      // معالجة أخطاء التحقق من الخادم
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else if (error.message?.includes('validation failed')) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast('حدث خطأ أثناء تحديث البيانات', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    // التحقق من وجود المستخدم
    if (!user?.email) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      return;
    }

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتان';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      const passwordChangeData = {
        email: user?.email,
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      
      console.log('إرسال بيانات تغيير كلمة المرور:', passwordChangeData);
      
      await changePassword(passwordChangeData);

      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      console.error('تفاصيل الخطأ:', error.response?.data);
      
      // معالجة أخطاء التحقق من الخادم
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message === "User not found") {
          showToast('المستخدم غير موجود', 'error');
        } else if (message === "Incorrect old password") {
          showToast('كلمة المرور الحالية غير صحيحة', 'error');
        } else if (message === "email, oldPassword and newPassword are required") {
          showToast('جميع الحقول مطلوبة', 'error');
        } else {
          showToast(message, 'error');
        }
      } else if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        showToast('حدث خطأ أثناء تغيير كلمة المرور', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">الإعدادات</h1>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2 space-x-reverse">
              <span>👤</span>
              <span>تعديل الاسم</span>
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل اسمك"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2 space-x-reverse"
              >
                <span>💾</span>
                <span>حفظ التغييرات</span>
              </button>
            </form>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2 space-x-reverse">
              <span>🔒</span>
              <span>تغيير كلمة المرور</span>
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                    errors.currentPassword 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="أدخل كلمة المرور الحالية"
                />
                {errors.currentPassword && (
                  <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.currentPassword}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                      errors.newPassword 
                        ? 'border-error-500 focus:ring-error-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  {errors.newPassword && (
                    <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.newPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                      errors.confirmPassword 
                        ? 'border-error-500 focus:ring-error-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  {errors.confirmPassword && (
                    <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? '⏳' : '🔒'}</span>
                <span>{isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}</span>
              </button>
            </form>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2 space-x-reverse">
              <span>🎨</span>
              <span>المظهر</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2 space-x-reverse">
                  <span>🌓</span>
                  <span>تبديل المظهر</span>
                </label>
                <ThemeToggle />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;