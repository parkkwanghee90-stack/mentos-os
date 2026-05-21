import { saveHomeworkSubmission } from '@/engine/studentProfileEngine';
// src/engine/homeworkEngine.js

// src/engine/homeworkEngine.js

export const randomizeMathProblemText = (text) => {
  if (!text) return text;
  // Replace integers with slight variations (except 0, 1, 2)
  return text.replace(/\b(\d+)\b/g, (match) => {
    const num = parseInt(match, 10);
    if (num <= 2) return match; // Keep small structural numbers
    
    // Add or subtract 1 to 3
    const delta = Math.floor(Math.random() * 3) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const newNum = num + (sign * delta);
    return newNum <= 2 ? num + 1 : newNum; // Ensure it stays positive and > 2
  });
};

export const generateMathHomework = (lessonData, startIndex = 20, endIndex = 35) => {
  if (!lessonData || !lessonData.core || !lessonData.core.problems) return [];
  
  const homeworkProbs = lessonData.core.problems.slice(startIndex, endIndex);
  
  return homeworkProbs.map(prob => {
    return {
      ...prob,
      isHomework: true,
      originalText: prob.questionText || '',
      questionText: randomizeMathProblemText(prob.questionText || '')
    };
  });
};

export const HomeworkEngine = {
  run: async ({ teacherId, subject, grade, rank, homeworkType, image }) => {
    
    const now = new Date().toISOString();
    let effectiveSubject = subject || '영어';

    // 1. 제출 상태 디버그 출력
    console.log(`[HOMEWORK SUBMIT]
teacher=${teacherId}
subject=${effectiveSubject}
imageUploaded=true`);

    // 제출 기록 스키마 생성
    const submissionData = {
      studentId: 'student_001',
      teacherId,
      subject: effectiveSubject,
      homeworkId: `hw_${Date.now()}`,
      homeworkType: homeworkType || 'reading',
      imageUrl: image ? "uploaded_photo.jpg" : null,
      submittedAt: now,
      status: "submitted"
    };

    // 2. 공통 딜레이 (모의 체점 - OCR 등)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 가상의 채점 기준치
    const readingScore = Math.floor(Math.random() * 20) + 70;
    const vocabScore = Math.floor(Math.random() * 20) + 70;
    const totalScore = Math.round((readingScore + vocabScore) / 2);

    let wrongParts = [];
    let feedback = "";
    if (vocabScore < 80) {
      wrongParts.push("핵심 어휘 부분");
      feedback = "단어 철자 및 의미 숙지 보완 필요";
    } else if (readingScore < 80) {
      wrongParts.push("시제");
      feedback = "문장 내 시제 해석 능력 보완 필요";
    } else {
      wrongParts.push("일부 구문");
      feedback = "전반적으로 우수하나 구조 파악 약간 보완 필요";
    }

    const checkData = {
      readingScore,
      vocabScore,
      totalScore,
      wrongParts,
      feedback,
      checkedAt: new Date().toISOString()
    };

    // 4. 로컬 DB 통합 저장 (다음 수업 연동용)
    const resultData = { ...submissionData, ...checkData };
    const pastHomeworks = JSON.parse(localStorage.getItem('mentos_homework_results') || '[]');
    pastHomeworks.push(resultData);
    localStorage.setItem('mentos_homework_results', JSON.stringify(pastHomeworks));
    
    // 학생 통합 진행도에 추가 저장
    saveHomeworkSubmission(resultData);

    // 5. 학부모 푸시 발송
    const joinedWrongs = wrongParts.join('와(과) ');
    const parentMsg = `오늘 ${effectiveSubject} 숙제가 제출되었고 검사까지 완료되었습니다.\n점수는 ${totalScore}점이며, ${joinedWrongs} 보완이 필요합니다.`;
    
    console.log(`[HOMEWORK CHECK]
ocrSuccess=true
score=${totalScore}
feedbackGenerated=true
parentPushSent=true`);
    console.log('[PUSH → 학부모]', parentMsg);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('[멘토스 OS 숙제 알림]', { body: `숙제 검사 완료! ${totalScore}점`, icon: `/favicon.ico` });
    }

    return resultData;
  }
};

// 미제출 자동화 스케줄러 (누적 경고 및 퇴소 처리)
export const processUnsubmittedHomework = (studentId, studentName) => {
  let strikes = parseInt(localStorage.getItem(`strikes_${studentId}`) || `0`);
  strikes += 1;
  localStorage.setItem(`strikes_${studentId}`, strikes.toString());

  let pushMsg = '';
  let isExpelled = false;

  if (strikes >= 4) {
    pushMsg = `[퇴소 통보] ${studentName} 학생은 과제 미제출 누적 4회로 규정에 의해 자동 퇴소 처리되었습니다.`;
    isExpelled = true;
  } else {
    pushMsg = `[미제출 경고] ${studentName} 학생 금일 과제 미제출 (누적 ${strikes}회). 누적 4회 시 자동 퇴소 처리됩니다.`;
  }

  // 실시간 푸시 기록용 로컬 스토리지 저장 (AdminDashboard에서 사용)
  const pushLogs = JSON.parse(localStorage.getItem('admin_push_logs') || '[]');
  pushLogs.unshift({
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    target: `${studentName} 학부모`,
    content: pushMsg
  });
  localStorage.setItem(`admin_push_logs`, JSON.stringify(pushLogs));

  console.log(`[AUTOMATED PUSH → ${studentName} 학부모]`, pushMsg);
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('[멘토스 OS 경고]', { body: pushMsg, icon: '/favicon.ico' });
  }

  return { strikes, pushMsg, isExpelled };
};

// 뒤로 호환성을 위해 기존 processHomeworkSubmission도 감싸줍니다
export const processHomeworkSubmission = async (args) => {
  return await HomeworkEngine.run({
    teacherId: args.teacherId,
    subject: args.subject,
    grade: '고1',
    rank: '3등급',
    homeworkType: 'reading',
    image: args.imageFile
  });
};
