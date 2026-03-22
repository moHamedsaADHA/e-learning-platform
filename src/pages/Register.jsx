import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signupUser } from '../redux/slices/authSlice';
import MathBackground from '../components/MathBackground';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    phone: '',
    location: '',
    code: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم الرباعي مطلوب';
    } else if (formData.name.trim().length < 5 || formData.name.trim().length > 100) {
      newErrors.name = 'الاسم يجب أن يكون بين 5 و 100 حرف';
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'يجب أن يحتوي الاسم على كلمتين على الأقل';
    }

    // التحقق من البريد الإلكتروني إذا تم إدخاله (اختياري)
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    if (!formData.grade) {
      newErrors.grade = 'الصف الدراسي مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else {
      // التحقق من طول الرقم أولاً
      if (formData.phone.length !== 11) {
        newErrors.phone = 'رقم الهاتف يجب أن يكون 11 رقم';
      } else if (!/^(010|011|012|015)\d{8}$/.test(formData.phone)) {
        newErrors.phone = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010, 011, 012, أو 015)';
      }
    }


    if (!formData.location) {
      newErrors.location ='المركز مطلوب';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'كود الطالب مطلوب';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({}); // مسح الأخطاء السابقة
    
    try {
      // إرسال البيانات المطلوبة فقط
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        grade: formData.grade,
        phone: formData.phone,
        location: formData.location,
        code: formData.code
      };
      
      await dispatch(signupUser(userData)).unwrap();
      
      // بما أن النظام الجديد يفعل الحساب تلقائياً، توجيه المستخدم لصفحة تسجيل الدخول
      navigate('/login', { 
        state: { 
          message: 'تم إنشاء الحساب وتفعيله بنجاح! يرجى تسجيل الدخول باستخدام الكود',
          code: formData.code
        }
      });
      
    } catch (error) {
      console.log('Registration error:', error);
      
      // الآن error سيحتوي على البيانات الصحيحة من authSlice
      if (error.errors && Array.isArray(error.errors)) {
        // أخطاء التحقق من صحة البيانات (validation errors)
        const backendErrors = {};
        error.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        // عرض رسالة الخطأ العامة
        setErrors({ submit: error.message || 'حدث خطأ أثناء إنشاء الحساب' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <MathBackground />
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إنشاء حساب جديد</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">انضم إلى منصة بداية التعليمية</p>
          </div>

          {errors.submit && (
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-800 dark:text-error-300 px-4 py-3 rounded-lg mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كود الطالب
              </label>
              <input
                id="code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.code 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="أدخل كود الطالب الذي حصلت عليه من الإدارة"
              />
              {errors.code && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.code}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الاسم الرباعي
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.name 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="أدخل الاسم الرباعي كاملاً"
              />
              {errors.name && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                البريد الإلكتروني <span className="text-gray-500 text-xs">(اختياري)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.email 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="أدخل البريد الإلكتروني (اختياري)"
              />
              {errors.email && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.phone 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="أدخل رقم الهاتف"
              />
              {errors.phone && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المركز
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.location 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              >
                <option value="">اختر المركز</option>
                <option value="العسيرات">العسيرات</option>
                <option value="المنشاة">المنشاة</option>
                <option value="الأحايوة">الأحايوة</option>
              </select>
              {errors.location && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.location}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الصف الدراسي
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                  errors.grade 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              >
                <option value="">اختر الصف الدراسي</option>
                <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                <option value="الصف الثاني الثانوي علمي">الصف الثاني الثانوي علمي</option>
                <option value="الصف الثاني الثانوي ادبي">الصف الثاني الثانوي ادبي</option>
                <option value="الصف الثالث الثانوي علمي">الصف الثالث الثانوي علمي</option>
                <option value="الصف الثالث الثانوي ادبي">الصف الثالث الثانوي ادبي</option>
              </select>
              {errors.grade && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.grade}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05m1.828 1.828l4.242 4.242m0 0L15.95 15.95M14.12 14.12L8.05 8.05m0 0l2.5-2.5M10.55 5.55L8.05 8.05" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                    errors.confirmPassword 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                  placeholder="أعد إدخال كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05m1.828 1.828l4.242 4.242m0 0L15.95 15.95M14.12 14.12L8.05 8.05m0 0l2.5-2.5M10.55 5.55L8.05 8.05" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-error-600 dark:text-error-400 text-sm mt-1 block">{errors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              لديك حساب بالفعل؟ <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;