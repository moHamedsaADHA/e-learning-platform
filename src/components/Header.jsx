import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';
import ThemeToggle from './ThemeToggle.jsx';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm dark:bg-gray-900/95 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 space-x-reverse font-bold text-xl text-gray-900 dark:text-white">
            <img src="/FirstLogo.jpg" alt="منصة البداية" className="h-12 w-12 rounded-lg object-cover shadow-md" />
            <span>منصة البداية</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-400">
              الرئيسية
            </Link>
            <Link to="/grades" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-400">
              الكورسات
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-400">
                  الملف الشخصي
                </Link>
              
                <Link to="/settings" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-400">
                  الإعدادات
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-400">
                    لوحة الإدارة
                  </Link>
                )}
                <button onClick={handleLogout} className="text-error-600 hover:text-error-700 font-medium transition-colors duration-200">
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-400">
                  تسجيل الدخول
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                  التسجيل
                </Link>
              </>
            )}
            
            <ThemeToggle />
          </nav>

          <button 
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 relative z-10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="قائمة التنقل"
          >
            <span className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700`}>
          <div className="px-4 py-2 space-y-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                الرئيسية
              </Link>
              <Link to="/grades" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                الكورسات
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                    الملف الشخصي
                  </Link>
                  {user?.role === 'student' && (
                    <Link to="/quiz-results" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                      نتائج الكويزات
                    </Link>
                  )}
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                    الإعدادات
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                      لوحة الإدارة
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-right px-3 py-2 text-error-600 hover:text-error-700 hover:bg-gray-50 rounded-md dark:hover:bg-gray-800">
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800">
                    تسجيل الدخول
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md mx-3 my-2 text-center">
                    التسجيل
                  </Link>
                </>
              )}
              
              {/* Theme Toggle for Mobile */}
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">تبديل الوضع</span>
                <ThemeToggle />
              </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;