import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hero from '../components/Hero.jsx';
import TeacherIntro from '../components/TeacherIntro.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { fetchCourses } from '../redux/slices/coursesSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const { list: courses, loading } = useSelector(state => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Debug logging
  console.log('Home component - courses:', courses, 'isArray:', Array.isArray(courses), 'type:', typeof courses);

  const grades = [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي علمي', 
    'الصف الثاني الثانوي ادبي',
    'الصف الثالث الثانوي علمي',
    'الصف الثالث الثانوي ادبي'
  ];

  return (
    <div className="home">
      <Hero />
      <TeacherIntro />
      
      <section id="courses" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📚 الصفوف الدراسية المتاحة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              اختر صفك الدراسي وابدأ رحلة التعلم مع دروس الرياضيات التفاعلية
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mt-4"></div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <span className="mr-3 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {grades.map(grade => {
                // Ensure courses is an array before using find
                const coursesArray = Array.isArray(courses) ? courses : [];
                const course = coursesArray.find(c => c.grade === grade);
                return (
                  <CourseCard
                    key={grade}
                    grade={grade}
                    description={course?.description}
                    lessonCount={course?.lessonCount || 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;