import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          اختبار كلاسات Tailwind CSS
        </h1>
        
        {/* اختبار الألوان */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">الألوان الأساسية</h2>
            <div className="space-y-3">
              <div className="bg-red-500 text-white p-3 rounded">أحمر</div>
              <div className="bg-blue-500 text-white p-3 rounded">أزرق</div>
              <div className="bg-green-500 text-white p-3 rounded">أخضر</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">الأزرار</h2>
            <div className="space-y-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
                زر أساسي
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full">
                زر أخضر
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded w-full">
                زر مفرغ
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">الألوان المخصصة</h2>
            <div className="space-y-3">
              <div className="bg-primary-600 text-white p-3 rounded">Primary 600</div>
              <div className="bg-primary-500 text-white p-3 rounded">Primary 500</div>
              <div className="bg-secondary-600 text-white p-3 rounded">Secondary 600</div>
            </div>
          </div>
        </div>
        
        {/* اختبار التخطيط */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">التخطيط والشبكة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 text-center rounded">عمود 1</div>
            <div className="bg-green-100 p-4 text-center rounded">عمود 2</div>
            <div className="bg-yellow-100 p-4 text-center rounded">عمود 3</div>
            <div className="bg-red-100 p-4 text-center rounded">عمود 4</div>
          </div>
        </div>
        
        {/* اختبار النماذج */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">النماذج</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسمك"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              إرسال
            </button>
          </form>
        </div>
        
        {/* اختبار الحركة */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">التأثيرات والحركة</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 text-white px-4 py-2 rounded-lg">
              تأثير التكبير
            </button>
            <button className="bg-pink-600 hover:bg-pink-700 hover:shadow-lg transition-shadow duration-300 text-white px-4 py-2 rounded-lg">
              تأثير الظل
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1 transition-transform duration-300 text-white px-4 py-2 rounded-lg">
              تأثير الرفع
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            إذا كنت ترى هذه الألوان والتنسيقات بشكل صحيح، فإن Tailwind CSS يعمل! ✅
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;