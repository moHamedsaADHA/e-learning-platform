import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../api/users.js';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    code: '',
    role: '',
    grade: '',
    location: '',
    isVerified: '',
    page: 1,
    limit: 10
  });

  // خيارات الصفوف
  const gradeOptions = [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي علمي',
    'الصف الثاني الثانوي ادبي',
    'الصف الثالث الثانوي علمي',
    'الصف الثالث الثانوي ادبي'
  ];

  // خيارات الأدوار
  const roleOptions = [
    { value: 'student', label: 'طالب' },
    { value: 'instructor', label: 'مدرس' },
    { value: 'admin', label: 'مدير' }
  ];

  // جلب المستخدمين
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // تنظيف الفلاتر من القيم الفارغة
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
      );
      
      const response = await getAllUsers(cleanFilters);
      
      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination);
        setStatistics(response.statistics);
      } else {
        setError(response.message || 'حدث خطأ في جلب البيانات');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // تشغيل جلب البيانات عند تحميل الصفحة أو تغيير الفلاتر
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // تنظيف الفلاتر من القيم الفارغة
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
        );
        
        const response = await getAllUsers(cleanFilters);
        
        if (response.success) {
          setUsers(response.data || []);
          setPagination(response.pagination);
          setStatistics(response.statistics);
        } else {
          setError(response.message || 'حدث خطأ في جلب البيانات');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('حدث خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.page]); // تشغيل عند تغيير الصفحة فقط

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, []);

  // معالجة تغيير الفلاتر
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // إعادة تعيين للصفحة الأولى عند تغيير الفلتر
    }));
  };

  // معالجة البحث
  const handleSearch = () => {
    fetchUsers();
  };

  // معالجة تغيير الصفحة
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          إدارة المستخدمين
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            إجمالي: {statistics?.total || 0} مستخدم
          </span>
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">المجموع</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.total}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">مفعل</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics.verified}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">غير مفعل</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{statistics.unverified}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">طلاب</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{statistics.byRole?.student || 0}</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">مدرسين</div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{statistics.byRole?.instructor || 0}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">مديرين</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statistics.byRole?.admin || 0}</div>
          </div>
        </div>
      )}

      {/* فلاتر البحث */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">فلاتر البحث</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* البحث بالاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البحث بالاسم
            </label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="ادخل الاسم"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* البحث بالكود */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البحث بالكود
            </label>
            <input
              type="text"
              value={filters.code}
              onChange={(e) => handleFilterChange('code', e.target.value)}
              placeholder="ادخل الكود"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* فلتر الدور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الدور
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">جميع الأدوار</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {/* فلتر الصف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الصف الدراسي
            </label>
            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">جميع الصفوف</option>
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* فلتر حالة التفعيل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              حالة التفعيل
            </label>
            <select
              value={filters.isVerified}
              onChange={(e) => handleFilterChange('isVerified', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">الجميع</option>
              <option value="true">مفعل</option>
              <option value="false">غير مفعل</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
          <button
            onClick={() => {
              setFilters({
                name: '',
                code: '',
                role: '',
                grade: '',
                location: '',
                isVerified: '',
                page: 1,
                limit: 10
              });
              setTimeout(fetchUsers, 100);
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* جدول المستخدمين */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الكود
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  كلمة المرور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المنطقة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تاريخ التسجيل
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    لا توجد بيانات للعرض
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {user.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {user.password || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        user.role === 'instructor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {user.role === 'admin' ? 'مدير' : user.role === 'instructor' ? 'مدرس' : 'طالب'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {user.isVerified ? 'مفعل' : 'غير مفعل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* التنقل بين الصفحات */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                عرض{' '}
                <span className="font-medium">
                  {((pagination.page - 1) * pagination.limit) + 1}
                </span>{' '}
                إلى{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                من{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                نتيجة
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  السابق
                </button>
                
                {/* أرقام الصفحات */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === page
                          ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  التالي
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;