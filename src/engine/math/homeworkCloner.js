/**
 * homeworkCloner.js
 * [PROJECT GOAL] 숙제 = 오늘 푼 문제의 “구조 복제 + 숫자 변형”
 * 
 * 🚀 핵심 로직:
 * 1. 문제 구조 (Template) 100% 유지
 * 2. 숫자/조건만 랜덤 변형
 * 3. 정답 문제 -> 1개 복제 / 오답 문제 -> 2개 복제
 */

export const cloneProblemWithVariation = (problem) => {
  if (!problem) return null;

  // 1. 템플릿 기반 변형 (SSOT 지향)
  // 만약 데이터에 latexTemplate과 variables가 정의되어 있다면 이를 우선 사용
  if (problem.latexTemplate && problem.variables) {
    const newVariables = {};
    for (const [key, value] of Object.entries(problem.variables)) {
      if (typeof value === 'number') {
        // 숫자 변형: 원본값 기준 ±4 범위 내 랜덤 변형 (0 제외, 양수 위주)
        const delta = Math.floor(Math.random() * 9) - 4; // -4 ~ +4
        let newValue = value + delta;
        if (newValue === 0) newValue = value + 2; 
        newVariables[key] = newValue;
      } else {
        newVariables[key] = value;
      }
    }
    
    // 템플릿 치환
    let newQuestionText = problem.latexTemplate;
    Object.entries(newVariables).forEach(([key, val]) => {
      // {a} 또는 a 형태의 placeholder 치환
      newQuestionText = newQuestionText.replace(new RegExp(`\\{${key}\\}`, `g`), val);
      newQuestionText = newQuestionText.replace(new RegExp(`\\b${key}\\b`, `g`), val);
    });

    return {
      ...problem,
      problemId: `${problem.problemId || problem.number}_hw_${Math.random().toString(36).substring(2, 7)}`,
      sourceProblemId: problem.problemId || problem.number,
      variables: newVariables,
      questionText: newQuestionText,
      isHomework: true,
      clonedAt: new Date().toISOString()
    };
  }

  // 2. Fallback: 정규식 기반 지능형 숫자 변형
  // 템플릿이 없는 기존 데이터의 경우, 문제 텍스트 내 숫자를 구조를 깨지 않는 선에서 변경
  const newText = (problem.questionText || "").replace(/\b(\d+)\b/g, (match, p1, offset, string) => {
    const num = parseInt(match, 10);
    
    // 0, 1, 2는 수학적 구조(지수, 계수 등)일 확률이 높으므로 보존
    if (num <= 2) return match;
    
    // 문항 번호(Problem 1 등) 또는 선택지 번호(①, ② 등)와 겹칠 수 있는 패턴 제외 로직 (간소화)
    if (offset < 5 && string.indexOf('\n') === -1) return match; 

    const delta = Math.floor(Math.random() * 5) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const newNum = Math.max(1, num + (sign * delta));
    return newNum;
  });

  return {
    ...problem,
    problemId: `${problem.number || `p`}_hw_${Math.random().toString(36).substring(2, 7)}`,
    sourceProblemId: problem.number,
    questionText: newText,
    isHomework: true,
    clonedAt: new Date().toISOString()
  };
};

/**
 * 수업 결과를 바탕으로 숙제 세트를 생성합니다.
 * @param {Object} lessonResult - aggregateMathLessonResult의 결과물
 * @param {Array} sessionProblemResults - [{ number: 1, isCorrect: true }, ...] 형태의 실제 풀이 데이터
 */
export const generateHomeworkFromLesson = (lessonResult, sessionProblemResults = []) => {
  const problems = lessonResult.lessonContent?.core?.problems || [];
  const homeworkProblems = [];

  problems.forEach(prob => {
    const result = sessionProblemResults.find(r => r.number === prob.number);
    if (!result) return; // 풀지 않은 문제는 숙제 제외 (또는 기본 1개 생성 정책 가능)

    if (result.isCorrect) {
      // 🎯 정답 문제 -> 1개 복제
      homeworkProblems.push(cloneProblemWithVariation(prob));
    } else {
      // 💣 오답 문제 -> 2개 복제 (반복 학습)
      homeworkProblems.push(cloneProblemWithVariation(prob));
      homeworkProblems.push(cloneProblemWithVariation(prob));
    }
  });

  // 최대 60개 제한 (수업 2시간 기준 정책 반영)
  return homeworkProblems.slice(0, 60);
};

export const HomeworkCloner = {
  clone: cloneProblemWithVariation,
  generateSet: generateHomeworkFromLesson
};
