import { getEnglishHomeworkByTeacher, submitEnglishHomework } from './english/assistantReviewEngine';
import { getScienceHomeworkByTeacher, submitScienceHomework } from './science/assistantReviewEngine';
import { getMathHomeworkByTeacher, submitMathHomework } from './math/assistantReviewEngine';

export function getHomeworkByTeacher(studentId, teacherId) {
  const eng = getEnglishHomeworkByTeacher(studentId, teacherId);
  const sci = getScienceHomeworkByTeacher(studentId, teacherId);
  const math = getMathHomeworkByTeacher(studentId, teacherId);
  
  // Return combined and sort by assignedAt
  const combined = [...eng, ...sci, ...math];
  combined.sort((a, b) => a.assignedAt - b.assignedAt);
  return combined;
}

export function submitHomework(homeworkId) {
  // Try all three. Since homeworkId is unique (e.g. eng_hw_..., sci_hw_...) only one will succeed.
  if (homeworkId.startsWith('eng_')) {
    return submitEnglishHomework(homeworkId);
  } else if (homeworkId.startsWith('sci_')) {
    return submitScienceHomework(homeworkId);
  } else if (homeworkId.startsWith('math_')) {
    return submitMathHomework(homeworkId);
  } else {
    console.error("Unknown homework ID prefix:", homeworkId);
    return null;
  }
}

// In HomeworkDetail.jsx they also parse the db directly in useEffect:
// const dbStr = localStorage.getItem('mentos_homework_db') || '[]';
// So we must also export a function to get a specific homework or we must update HomeworkDetail.jsx to use a getter.
export function getHomeworkById(homeworkId) {
    if (homeworkId.startsWith('eng_')) {
        const db = JSON.parse(localStorage.getItem('mentos_eng_homework_db') || '[]');
        return db.find(h => h.homeworkId === homeworkId) || null;
    } else if (homeworkId.startsWith('sci_')) {
        const db = JSON.parse(localStorage.getItem('mentos_sci_homework_db') || '[]');
        return db.find(h => h.homeworkId === homeworkId) || null;
    } else if (homeworkId.startsWith('math_')) {
        const db = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
        return db.find(h => h.homeworkId === homeworkId) || null;
    }
    return null;
}
