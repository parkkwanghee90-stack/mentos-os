// src/engine/studentProfileEngine.js

const STUDENT_DATA_KEY = 'mentos_student_data';

export const generateStudentId = () => {
  return 'stu_' + Math.random().toString(36).substr(2, 9);
};

export const initStudentProfile = () => {
  let studentId = localStorage.getItem('studentId');
  if (!studentId) {
    studentId = generateStudentId();
    localStorage.setItem('studentId', studentId);
  }

  let studentDataStr = localStorage.getItem(STUDENT_DATA_KEY);
  if (!studentDataStr) {
    const initialData = {
      studentId: studentId,
      teachers: {}, // teacherName: { currentSession, progress, lastAccess }
      homework: []  // { homeworkId, teacherId, submittedAt, imageUrl, ... }
    };
    localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(initialData));
    return initialData;
  }
  
  return JSON.parse(studentDataStr);
};

export const getStudentProfile = () => {
  const str = localStorage.getItem(STUDENT_DATA_KEY);
  return str ? JSON.parse(str) : initStudentProfile();
};

export const updateTeacherProgress = (teacherName, progressData) => {
  if (!teacherName) return;
  const data = getStudentProfile();
  if (!data.teachers) data.teachers = {};
  
  data.teachers[teacherName] = {
    ...data.teachers[teacherName],
    ...progressData,
    lastAccess: Date.now()
  };
  
  localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(data));
};

export const saveHomeworkSubmission = (homeworkData) => {
  const data = getStudentProfile();
  if (!data.homework) data.homework = [];
  
  data.homework.push({
    ...homeworkData,
    submittedAt: Date.now()
  });
  
  localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(data));
};
