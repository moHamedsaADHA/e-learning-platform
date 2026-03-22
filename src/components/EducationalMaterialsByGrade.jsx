import { useEffect, useState } from 'react';
import { getEducationalMaterialsByGrade } from '../api/educationalMaterials.js';

const EducationalMaterialsByGrade = ({ grade }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!grade) return;
    setLoading(true);
    setError('');
    getEducationalMaterialsByGrade(grade)
      .then(res => {
        if (res.success && res.data) setMaterials(res.data);
        else setError('تعذر جلب المواد التعليمية');
      })
      .catch(() => setError('حدث خطأ أثناء جلب المواد'))
      .finally(() => setLoading(false));
  }, [grade]);

  if (!grade) return null;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-100 to-primary-100 dark:from-blue-900/40 dark:to-primary-900/40 rounded-xl shadow p-6 mb-4 flex items-center gap-3">
        <span className="text-2xl">📂</span>
        <h2 className="text-lg font-bold text-primary-700 dark:text-primary-300">المواد التعليمية للصف</h2>
        <span className="font-semibold text-gray-700 dark:text-gray-200">{grade}</span>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        {loading ? (
          <div className="text-center text-gray-500">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : materials.length === 0 ? (
          <div className="text-center text-gray-500">لا توجد مواد تعليمية لهذا الصف</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(material => (
              <div
                key={material._id || material.id}
                className="group bg-gradient-to-br from-primary-50 to-blue-100 dark:from-primary-900/60 dark:to-blue-900/40 rounded-2xl shadow-lg border border-primary-100 dark:border-primary-900 p-6 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full p-2 shadow">📚</span>
                  <div className="font-bold text-lg text-primary-800 dark:text-primary-200 truncate" title={material.title}>{material.title}</div>
                </div>
                <a
                  href={material.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition text-sm shadow-md w-fit"
                >
                  <span>رابط المادة</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 7h-6m6 0v6"/></svg>
                </a>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded px-2 py-1">{material.grade}</span>
                </div>
                <div className="absolute right-0 top-0 opacity-10 text-[6rem] pointer-events-none select-none">📂</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationalMaterialsByGrade;
