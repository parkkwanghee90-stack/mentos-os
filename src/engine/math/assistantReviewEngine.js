export function getPendingMathHomework(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwList = db.filter(h => h.studentId === studentId && h.teacherId === teacherId);
  return hwList[hwList.length - 1] || null;
}

export function getAllMathHomework(studentId) {
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  return db.filter(h => h.studentId === studentId);
}

export function getMathHomeworkByTeacher(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  return db.filter(h => h.studentId === studentId && h.teacherId === teacherId);
}

export function submitMathHomework(homeworkId) {
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwIndex = db.findIndex(h => h.homeworkId === homeworkId);
  if (hwIndex === -1) return null;

  db[hwIndex].status = "submitted";
  db[hwIndex].submittedAt = Date.now();
  db[hwIndex].submittedAnswers = "이미지 업로드 파일 내포됨 (Mock)";
  
  localStorage.setItem('mentos_math_homework_db', JSON.stringify(db));
  console.log(`[AssistantReviewEngine-Math] Homework ${homeworkId} submitted.`);
  
  setTimeout(() => reviewMathHomework(homeworkId), 1000);
  
  return db[hwIndex];
}

export function reviewMathHomework(homeworkId) {
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwIndex = db.findIndex(h => h.homeworkId === homeworkId);
  if (hwIndex === -1) return null;

  const hw = db[hwIndex];
  
  const assistantReview = {
    homeworkId: homeworkId,
    assistantId: "ast_mentor_03",
    scores: { core: 100, step: 85, mock: 60 },
    feedback: {
      core: "공식 유도는 완벽하게 서술했습니다.",
      step: "풀이 단계 누락은 없으나 계산 실수가 있습니다.",
      mock: "타임어택 내에서 집중력이 떨어져 후반부 오답률이 높습니다."
    },
    weakPoints: ["계산 주의", "타임어택 멘탈 관리"],
    strengths: ["기초 공식 이해 우수"],
    reviewedAt: Date.now(),
    status: "reviewed"
  };

  hw.status = "reviewed";
  hw.assistantReview = assistantReview;
  
  localStorage.setItem('mentos_math_homework_db', JSON.stringify(db));
  console.log(`[AssistantReviewEngine-Math] Homework ${homeworkId} reviewed.`);
  
  return hw;
}

export function getMathAssistantFeedbackForNextClass(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const reviewed = db.filter(h => h.studentId === studentId && h.teacherId === teacherId && h.status === 'reviewed');
  if (reviewed.length === 0) return null;
  return reviewed[reviewed.length - 1].assistantReview;
}
