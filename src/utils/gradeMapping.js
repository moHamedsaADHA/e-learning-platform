// Grade mapping للصفحات العامة (يستخدم في URLs)
const gradeMapping = {
  'الصف الأول الثانوي': '1st-secondary',
  'الصف الثاني الثانوي علمي': '2nd-secondary-science', 
  'الصف الثاني الثانوي ادبي': '2nd-secondary-arts',
  'الصف الثالث الثانوي علمي': '3rd-secondary-science',
  'الصف الثالث الثانوي ادبي': '3rd-secondary-arts'
};

// Grade mapping للدروس (lessons API routes)
const lessonsGradeMapping = {
  'الصف الأول الثانوي': '1st-secondary',
  'الصف الثاني الثانوي علمي': '2nd-secondary-science', 
  'الصف الثاني الثانوي ادبي': '2nd-secondary-literary',
  'الصف الثالث الثانوي علمي': '3rd-secondary-science',
  'الصف الثالث الثانوي ادبي': '3rd-secondary-literary'
};

// Grade mapping للمهام والكويزات (tasks & quizzes API routes)
const tasksQuizzesGradeMapping = {
  'الصف الأول الثانوي': 'first-secondary',
  'الصف الثاني الثانوي علمي': 'second-secondary-science', 
  'الصف الثاني الثانوي ادبي': 'second-secondary-literature',
  'الصف الثالث الثانوي علمي': 'third-secondary-science',
  'الصف الثالث الثانوي ادبي': 'third-secondary-literature'
};

// Grade mapping للجداول (schedule API routes)
const scheduleGradeMapping = {
  'الصف الأول الثانوي': '1st-secondary',
  'الصف الثاني الثانوي علمي': '2nd-secondary-science', 
  'الصف الثاني الثانوي ادبي': '2nd-secondary-arts',
  'الصف الثالث الثانوي علمي': '3rd-secondary-science',
  'الصف الثالث الثانوي ادبي': '3rd-secondary-arts'
};

const reverseGradeMapping = Object.fromEntries(
  Object.entries(gradeMapping).map(([key, value]) => [value, key])
);

export { 
  gradeMapping, 
  reverseGradeMapping,
  lessonsGradeMapping,
  tasksQuizzesGradeMapping,
  scheduleGradeMapping
};