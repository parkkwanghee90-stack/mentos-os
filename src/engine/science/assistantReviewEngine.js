export function getPendingScienceHomework(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwList = db.filter(h => h.studentId === studentId && h.teacherId === teacherId);
  return hwList[hwList.length - 1] || null;
}

export function getAllScienceHomework(studentId) {
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  return db.filter(h => h.studentId === studentId);
}

export function getScienceHomeworkByTeacher(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  return db.filter(h => h.studentId === studentId && h.teacherId === teacherId);
}

export function submitScienceHomework(homeworkId) {
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwIndex = db.findIndex(h => h.homeworkId === homeworkId);
  if (hwIndex === -1) return null;

  db[hwIndex].status = "submitted";
  db[hwIndex].submittedAt = Date.now();
  db[hwIndex].submittedAnswers = "이미지 업로드 파일 내포됨 (Mock)";
  
  localStorage.setItem('mentos_sci_homework_db', JSON.stringify(db));
  console.log(`[AssistantReviewEngine-Sci] Homework ${homeworkId} submitted.`);
  
  setTimeout(() => reviewScienceHomework(homeworkId), 1000);
  
  return db[hwIndex];
}

export function reviewScienceHomework(homeworkId) {
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwIndex = db.findIndex(h => h.homeworkId === homeworkId);
  if (hwIndex === -1) return null;

  const hw = db[hwIndex];
  
  const assistantReview = {
    homeworkId: homeworkId,
    assistantId: "ast_mentor_02",
    scores: { concept: 90, problem: 70 },
    feedback: {
      concept: "기초 개념은 완벽하나 응용 방식 설명이 부족했습니다.",
      problem: "자주 틀리는 유형에서 오답률이 높았습니다."
    },
    weakPoints: ["응용 방식 설명", "자주 틀리는 유형 오답"],
    strengths: ["기초 개념 완벽"],
    reviewedAt: Date.now(),
    status: "reviewed"
  };

  hw.status = "reviewed";
  hw.assistantReview = assistantReview;
  
  localStorage.setItem('mentos_sci_homework_db', JSON.stringify(db));
  console.log(`[AssistantReviewEngine-Sci] Homework ${homeworkId} reviewed.`);
  
  return hw;
}

export function getScienceAssistantFeedbackForNextClass(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const reviewed = db.filter(h => h.studentId === studentId && h.teacherId === teacherId && h.status === 'reviewed');
  if (reviewed.length === 0) return null;
  return reviewed[reviewed.length - 1].assistantReview;
}
