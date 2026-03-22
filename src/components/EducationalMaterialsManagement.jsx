import { useEffect, useState } from 'react';
import {
  getAllEducationalMaterials,
  createEducationalMaterial,
  updateEducationalMaterial,
  deleteEducationalMaterial
} from '../api/educationalMaterials.js';

const initialForm = { title: '', link: '', grade: '' };
const grades = [
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي علمي',
  'الصف الثاني الثانوي ادبي',
  'الصف الثالث الثانوي علمي',
  'الصف الثالث الثانوي ادبي'
];

const EducationalMaterialsManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllEducationalMaterials();
      if (res.success && res.data) setMaterials(res.data);
      else setError('تعذر جلب المواد التعليمية');
    } catch (e) {
      setError('حدث خطأ أثناء جلب المواد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title || !form.link || !form.grade) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    try {
      if (editingId) {
        const res = await updateEducationalMaterial(editingId, form);
        if (res.success) {
          setSuccess('تم التعديل بنجاح');
          setEditingId(null);
        } else setError(res.message || 'فشل التعديل');
      } else {
        const res = await createEducationalMaterial(form);
        if (res.success) setSuccess('تمت الإضافة بنجاح');
        else setError(res.message || 'فشل الإضافة');
      }
      setForm(initialForm);
      fetchMaterials();
    } catch (e) {
      setError('حدث خطأ أثناء الحفظ');
    }
  };

  const handleEdit = material => {
    setForm({ title: material.title, link: material.link, grade: material.grade });
    setEditingId(material._id || material.id);
    setEditRow(material._id || material.id);
    setShowEditModal(true);
    setSuccess('');
    setError('');
  };

  const handleDelete = async id => {
    if (!window.confirm('هل أنت متأكد من حذف المادة؟')) return;
    setError('');
    setSuccess('');
    try {
      const res = await deleteEducationalMaterial(id);
      if (res.success) {
        setSuccess('تم الحذف بنجاح');
        fetchMaterials();
      } else setError(res.message || 'فشل الحذف');
    } catch (e) {
      setError('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-100 to-primary-100 dark:from-blue-900/40 dark:to-primary-900/40 rounded-xl shadow p-6 mb-4">
        <h2 className="text-xl font-bold mb-2 text-primary-700 dark:text-primary-300">إضافة مادة تعليمية جديدة</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={e => { setEditingId(null); setEditRow(null); handleSubmit(e); }}>
          <div>
            <label className="block mb-1 text-sm font-medium">العنوان</label>
            <input name="title" value={editingId ? '' : form.title} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:text-white" disabled={!!editingId} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">الرابط</label>
            <input name="link" value={editingId ? '' : form.link} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:text-white" disabled={!!editingId} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">الصف</label>
            <select name="grade" value={editingId ? '' : form.grade} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:text-white" disabled={!!editingId}>
              <option value="">اختر الصف</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-primary-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-primary-700 transition" disabled={!!editingId}>
            إضافة
          </button>
        </form>
        {error && !editingId && <div className="text-red-600 mt-2">{error}</div>}
        {success && !editingId && <div className="text-green-600 mt-2">{success}</div>}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">قائمة المواد التعليمية</h3>
        {loading ? (
          <div className="text-center text-gray-500">جاري التحميل...</div>
        ) : materials.length === 0 ? (
          <div className="text-center text-gray-500">لا توجد مواد تعليمية</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-right">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-3">العنوان</th>
                  <th className="py-2 px-3">الرابط</th>
                  <th className="py-2 px-3">الصف</th>
                  <th className="py-2 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(material => (
                  <tr key={material._id || material.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-3 font-medium">{material.title}</td>
                    <td className="py-2 px-3">
                      <a href={material.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">رابط</a>
                    </td>
                    <td className="py-2 px-3">{material.grade}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button onClick={() => handleEdit(material)} className="bg-yellow-400 text-white rounded px-3 py-1 hover:bg-yellow-500">تعديل</button>
                      <button onClick={() => handleDelete(material._id || material.id)} className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editingId && error && <div className="text-red-600 mt-2">{error}</div>}
            {editingId && success && <div className="text-green-600 mt-2">{success}</div>}
          </div>
        )}
      </div>

      {/* Modal for editing */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 w-full max-w-lg relative animate-fadeIn border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/40 dark:to-blue-900/40">
              <h2 className="text-xl font-bold text-primary-700 dark:text-primary-300">تعديل المادة التعليمية</h2>
              <button onClick={() => { setShowEditModal(false); setEditingId(null); setEditRow(null); setForm(initialForm); }} className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 text-3xl font-bold leading-none">×</button>
            </div>
            <form onSubmit={async e => { e.preventDefault(); await handleSubmit(e); setShowEditModal(false); setEditRow(null); }} className="px-6 py-6 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">العنوان</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="اكتب عنوان المادة..." className="w-full rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">رابط المادة</label>
                <input name="link" value={form.link} onChange={handleChange} placeholder="https://..." className="w-full rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">الصف الدراسي</label>
                <select name="grade" value={form.grade} onChange={handleChange} className="w-full rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                  <option value="">اختر الصف</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingId(null); setEditRow(null); setForm(initialForm); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-5 py-2 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">إلغاء</button>
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-bold shadow transition">حفظ التعديلات</button>
              </div>
              {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
              {success && <div className="text-green-600 mt-2 text-center">{success}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalMaterialsManagement;
