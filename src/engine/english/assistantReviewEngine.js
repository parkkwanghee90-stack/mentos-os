export function getPendingEnglishHomework(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwList = db.filter(h => h.studentId === studentId && h.teacherId === teacherId);
  return hwList[hwList.length - 1] || null;
}

export function getAllEnglishHomework(studentId) {
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  return db.filter(h => h.studentId === studentId);
}

export function getEnglishHomeworkByTeacher(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  return db.filter(h => h.studentId === studentId && h.teacherId === teacherId);
}

export function submitEnglishHomework(homeworkId) {
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwIndex = db.findIndex(h => h.homeworkId === homeworkId);
  if (hwIndex === -1) return null;

  db[hwIndex].status = "submitted";
  db[hwIndex].submittedAt = Date.now();
  db[hwIndex].submittedAnswers = "이미지 업로드 파일 내포됨 (Mock)";
  
  localStorage.setItem('mentos_eng_homework_db', JSON.stringify(db));
  console.log(`[AssistantReviewEngine-Eng] Homework ${homeworkId} submitted.`);
  
  setTimeout(() => reviewEnglishHomework(homeworkId), 1000);
  
  return db[hwIndex];
}

export function reviewEnglishHomework(homeworkId) {
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const hwIndex = db.findIndex(h => h.homeworkId === homeworkId);
  if (hwIndex === -1) return null;

  const hw = db[hwIndex];
  
  const assistantReview = {
    homeworkId: homeworkId,
    assistantId: "ast_mentor_01",
    scores: { reading: 80, hearing: 100, vocab: 90 },
    feedback: {
      reading: "주제 찾기는 완벽하나 세부 지칭 추론에서 실수가 있었습니다.",
      hearing: "스크립트 이해도가 높고 핵심 파악을 잘 했습니다.",
      vocab: "동의어 위주로 조금 더 묶어서 암기할 필요가 있습니다."
    },
    weakPoints: ["세부 지칭 추론", "동의어 암기"],
    strengths: ["주제 파악력", "듣기 정확도"],
    reviewedAt: Date.now(),
    status: "reviewed"
  };

  hw.status = "reviewed";
  hw.assistantReview = assistantReview;
  
  localStorage.setItem('mentos_eng_homework_db', JSON.stringify(db));
  console.log(`[AssistantReviewEngine-Eng] Homework ${homeworkId} reviewed.`);
  
  return hw;
}

export function getEnglishAssistantFeedbackForNextClass(studentId, teacherId) {
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  const reviewed = db.filter(h => h.studentId === studentId && h.teacherId === teacherId && h.status === 'reviewed');
  if (reviewed.length === 0) return null;
  return reviewed[reviewed.length - 1].assistantReview;
}
