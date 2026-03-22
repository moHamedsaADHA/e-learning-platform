/**
 * utility functions للتعامل مع صلاحيات المستخدمين والصفوف الدراسية
 */

/**
 * فحص ما إذا كان المستخدم يملك صلاحية الوصول للصف المحدد
 * @param {Object} user - بيانات المستخدم
 * @param {string} targetGrade - اسم الصف المستهدف
 * @returns {boolean}
 */
export const canUserAccessGrade = (user, targetGrade) => {
  if (!user) return false;
  
  // الأدمن والمدرس يستطيعان الوصول لكل الصفوف
  if (user.role === 'admin' || user.role === 'instructor') {
    return true;
  }
  
  // الطالب يستطيع الوصول فقط لصفه المسجل به
  return user.grade === targetGrade;
};

/**
 * فحص ما إذا كان المستخدم أدمن
 * @param {Object} user - بيانات المستخدم
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user?.role === 'admin';
};

/**
 * فحص ما إذا كان المستخدم مدرس
 * @param {Object} user - بيانات المستخدم  
 * @returns {boolean}
 */
export const isInstructor = (user) => {
  return user?.role === 'instructor';
};

/**
 * فحص ما إذا كان المستخدم طالب
 * @param {Object} user - بيانات المستخدم
 * @returns {boolean}
 */
export const isStudent = (user) => {
  return user?.role === 'student' || !user?.role; // افتراضي أن المستخدم طالب إذا لم يحدد دور
};

/**
 * فحص ما إذا كان للمستخدم صلاحيات إدارية (أدمن أو مدرس)
 * @param {Object} user - بيانات المستخدم
 * @returns {boolean}
 */
export const hasAdminPrivileges = (user) => {
  return isAdmin(user) || isInstructor(user);
};

/**
 * الحصول على قائمة الصفوف المتاحة للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {Array} allGrades - قائمة بجميع الصفوف المتاحة
 * @returns {Array}
 */
export const getUserAccessibleGrades = (user, allGrades) => {
  if (!user || !allGrades) return [];
  
  // إذا كان أدمن أو مدرس - كل الصفوف متاحة
  if (hasAdminPrivileges(user)) {
    return allGrades;
  }
  
  // إذا كان طالب - فقط صفه المسجل به
  if (user.grade) {
    return allGrades.filter(grade => grade === user.grade);
  }
  
  return [];
};

/**
 * فحص ما إذا كان المستخدم يحتاج لترقية الصف أو تسجيل دخول
 * @param {boolean} isAuthenticated - حالة تسجيل الدخول
 * @param {Object} user - بيانات المستخدم
 * @param {string} targetGrade - الصف المستهدف
 * @returns {Object} - {needsLogin: boolean, needsUpgrade: boolean, hasAccess: boolean}
 */
export const checkGradeAccess = (isAuthenticated, user, targetGrade) => {
  if (!isAuthenticated) {
    return {
      needsLogin: true,
      needsUpgrade: false,
      hasAccess: false,
      message: 'يجب تسجيل الدخول للوصول لهذا الصف'
    };
  }
  
  if (!canUserAccessGrade(user, targetGrade)) {
    return {
      needsLogin: false,
      needsUpgrade: true,
      hasAccess: false,
      message: `أنت مسجل في "${user?.grade || 'غير محدد'}" ولا يمكنك الوصول لـ "${targetGrade}"`
    };
  }
  
  return {
    needsLogin: false,
    needsUpgrade: false,
    hasAccess: true,
    message: 'يمكنك الوصول لهذا الصف'
  };
};

/**
 * الحصول على رسالة توضيحية لحالة الوصول للصف
 * @param {boolean} isAuthenticated - حالة تسجيل الدخول
 * @param {Object} user - بيانات المستخدم
 * @param {string} targetGrade - الصف المستهدف
 * @returns {Object} - {type: string, message: string, action: string}
 */
export const getGradeAccessMessage = (isAuthenticated, user, targetGrade) => {
  const accessCheck = checkGradeAccess(isAuthenticated, user, targetGrade);
  
  if (accessCheck.needsLogin) {
    return {
      type: 'login-required',
      message: 'مطلوب تسجيل الدخول',
      action: 'سجل دخول للوصول',
      color: 'gray'
    };
  }
  
  if (accessCheck.needsUpgrade) {
    return {
      type: 'access-denied',
      message: 'غير متاح لصفك',
      action: 'تواصل مع الإدارة',
      color: 'red'
    };
  }
  
  return {
    type: 'access-granted',
    message: 'متاح لك',
    action: 'ادخل الصف',
    color: 'green'
  };
};

/**
 * فلترة المحتوى بناء على صلاحيات المستخدم
 * @param {Array} content - المحتوى المراد فلترته
 * @param {Object} user - بيانات المستخدم
 * @param {string} gradeField - اسم الحقل الذي يحتوي على الصف في المحتوى
 * @returns {Array}
 */
export const filterContentByUserGrade = (content, user, gradeField = 'grade') => {
  if (!content || !Array.isArray(content)) return [];
  
  // الأدمن والمدرس يرون كل المحتوى
  if (hasAdminPrivileges(user)) {
    return content;
  }
  
  // الطلاب يرون فقط محتوى صفهم
  if (user?.grade) {
    return content.filter(item => item[gradeField] === user.grade);
  }
  
  return [];
};