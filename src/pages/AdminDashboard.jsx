import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { hasAdminPrivileges } from '../utils/permissions.js';
import LessonsManagement from '../components/LessonsManagement.jsx';
import TasksManagement from '../components/TasksManagement.jsx';
import QuizzesManagement from '../components/QuizzesManagement.jsx';
import ScheduleManagement from '../components/ScheduleManagement.jsx';
import Analytics from '../components/Analytics.jsx';
import EducationalMaterialsManagement from '../components/EducationalMaterialsManagement.jsx';
import UsersManagement from '../components/UsersManagement.jsx';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // إغلاق القائمة المحمولة عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user || !hasAdminPrivileges(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <span className="text-6xl mb-4 block">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">غير مصرح بالدخول</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            هذه الصفحة مخصصة للمديرين والمدرسين فقط
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'lessons', label: 'إدارة الدروس', icon: '📚' },
    { id: 'tasks', label: 'إدارة المهام', icon: '📝' },
    { id: 'quizzes', label: 'إدارة الكويزات', icon: '🧠' },
    { id: 'schedule', label: 'إدارة الجدول', icon: '📅' },
    { id: 'materials', label: 'المواد التعليمية', icon: '📂' },
    { id: 'users', label: 'إدارة المستخدمين', icon: '👥' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'lessons':
        return renderLessonsContent();
      case 'tasks':
        return renderTasksContent();
      case 'quizzes':
        return renderQuizzesContent();
      case 'schedule':
        return renderScheduleContent();
      case 'materials':
        return <EducationalMaterialsManagement />;
      case 'users':
        return <UsersManagement />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          مرحباً بك، {user?.name || 'المدير'}! 👋
        </h2>
        <p className="text-primary-100">
          لوحة التحكم الخاصة بك لإدارة المنصة التعليمية. تابع الإحصائيات والأنشطة الحديثة هنا.
        </p>
      </div>

      {/* Analytics Component */}
      <Analytics />
    </div>
  );

  const renderLessonsContent = () => (
    <LessonsManagement />
  );

  const renderTasksContent = () => (
    <TasksManagement />
  );

  const renderQuizzesContent = () => (
    <QuizzesManagement />
  );

  const renderScheduleContent = () => (
    <ScheduleManagement />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">لوحة التحكم الإدارية</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
            مرحباً {user?.name}، إليك نظرة عامة على المنصة
            <span className="md:hidden block mt-1 text-primary-600 dark:text-primary-400 font-medium">
              {tabs.find(tab => tab.id === activeTab)?.icon} {tabs.find(tab => tab.id === activeTab)?.label}
            </span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 space-x-reverse bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center md:justify-start space-x-2 space-x-reverse px-2 md:px-4 py-2 rounded-md font-medium transition-colors duration-200 whitespace-nowrap min-w-0 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={tab.label}
              >
                <span className="text-lg md:text-base">{tab.icon}</span>
                <span className="hidden lg:inline text-sm lg:text-base">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <span>{tabs.find(tab => tab.id === activeTab)?.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <nav className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-md font-medium transition-colors duration-200 text-right ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full overflow-hidden">
          {renderTabContent()}
        </div>




      </div>
    </div>
  );
};

export default AdminDashboard;