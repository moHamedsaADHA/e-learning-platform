import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessonById } from '../redux/slices/lessonsSlice.js';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const LessonPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentLesson, loading, error } = useSelector(state => state.lessons);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchLessonById(id));
    }
  }, [dispatch, id]);

  // استخراج معلومات الدرس من الـ response
  const lesson = currentLesson?.lesson || currentLesson;
  const youtubeVideoId = getYouTubeVideoId(lesson?.videoUrl);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الدرس...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <span className="text-6xl mb-4 block">❌</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            الدرس غير موجود
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'لم يتم العثور على الدرس المطلوب'}
          </p>
          <Link 
            to="/grades" 
            className="inline-block bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            العودة للكورسات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">الرئيسية</Link>
              <span>/</span>
              <Link to="/grades" className="hover:text-primary-600 dark:hover:text-primary-400">الكورسات</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">{lesson.lessonTitle}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {lesson.lessonTitle}
                </h1>
                <h2 className="text-xl text-primary-600 dark:text-primary-400 font-semibold mb-3">
                  {lesson.unitTitle}
                </h2>
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full w-fit">
                  <span className="text-2xl ml-2">🎓</span>
                  <span className="font-medium text-gray-900 dark:text-white">{lesson.grade}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate(-1)}
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors duration-200"
              >
                ← رجوع
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Video Player */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Video Container */}
            <div className="relative bg-black aspect-video">
              {youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.lessonTitle}
                />
              ) : lesson.videoUrl && !youtubeVideoId ? (
                <video 
                  controls 
                  className="w-full h-full"
                  poster="/placeholder-video.jpg"
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🎥</span>
                    <p className="text-xl font-semibold">قريباً: فيديو الدرس</p>
                    <p className="text-sm text-gray-300 mt-2">سيتم إضافة الفيديو قريباً</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LessonPage;