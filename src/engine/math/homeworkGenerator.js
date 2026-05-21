import { generateMathHomework as generateDynamicMathHomework } from '@/engine/homeworkEngine.js';
import { HomeworkCloner } from './homeworkCloner.js';

export function generateMathHomework(lessonResult) {
  const rankStr = (lessonResult.rank || []).join('');
  const lessonContent = lessonResult.lessonContent || {};
  const solvedProblems = lessonResult.solvedProblems || [];
  
  const core = lessonContent.core || "수학 필수 개념";

  let items = [];

  // 1. 등급별 개념/서술형 과제 (기존 로직 유지)
  if (rankStr.includes('1') || rankStr.includes('2')) {
      items = [
          { type: 'core', title: '[개념 증명] 오늘 다룬 핵심 공식 2개의 유도 과정을 서술하시오.' },
          { type: 'step', title: '[고난도 적용] 관련 단원의 킬러 문항 3문제를 풀고, 다른 풀이법 1가지를 고안하시오.' },
          { type: 'mock', title: '[모의고사] 심화 모의고사 타임어택 15문제를 30분 내로 풀이하시오.' }
      ];
  } else if (rankStr.includes('3')) {
      items = [
          { type: 'core', title: '[개념 응용] 배운 공식을 이용해야만 풀 수 있는 유형 문제 5개를 완성하시오.' },
          { type: 'step', title: '[단계별 풀이] 4점 기출 문제 5개의 오답 노트를 작성하시오.' },
          { type: 'mock', title: '[모의고사] 하프 모의고사 10문제를 풀고 채점하시오.' }
      ];
  } else {
      items = [
          { type: 'core', title: `[개념 암기] 수학 핵심 개념 노트를 3번 필사하시오.\n개념요약: ${core.substring(0, 50)}...` },
          { type: 'step', title: '[단계별 연습] 공식을 대입만 하면 풀리는 교과서 수준 예제 10문제를 푸시오.' },
          { type: 'mock', title: '[기초 점검] 2~3점짜리 기출 문제 10문제를 풀어보시오.' }
      ];
  }

  const homeworkId = `math_hw_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;
  
  // 🎯 2. [핵심] 오늘 푼 문제의 구조 복제 + 숫자 변형 (SSOT 반영)
  let dynamicProblems = HomeworkCloner.generateSet(lessonResult, solvedProblems);

  // 3. --- 취약단원 5문제 연결 시스템 (기존 로직 유지) ---
  const isMockExam = (lessonResult.unit || '').includes('모의고사') || (lessonResult.summary && lessonResult.summary.coveredTopics && lessonResult.summary.coveredTopics.some(t => t.includes('모평') || t.includes('수능')));
  const mistakeTags = lessonResult.mistakeTags || [];
  
  if (isMockExam || mistakeTags.length > 0) {
      const weaknessTarget = mistakeTags.length > 0 ? mistakeTags[0] : "극한과 미분법 (공통 취약)";
      items.push({
          type: 'weakness',
          title: '[취약단원 집중공략] 모의고사 오답 및 취약점 분석 기반 5문제 추가'
      });
      
      const weaknessProblems = Array.from({ length: 5 }, (_, i) => ({
          id: `weak_${Date.now()}_${i}`,
          type: "weakness_drill",
          questionText: `[${weaknessTarget}] 취약점 보완 문제 ${i+1}번: 모의고사 연계 문항을 푸시오.`,
          isHomework: true
      }));

      dynamicProblems = dynamicProblems ? [...dynamicProblems, ...weaknessProblems] : weaknessProblems;
  }

  const homework = {
    homeworkId: homeworkId,
    studentId: lessonResult.studentId,
    teacherId: lessonResult.teacherId,
    subject: "math",
    round: lessonResult.round,
    assignedAt: Date.now(),
    date: lessonResult.date,
    status: "assigned",
    items,
    problems: dynamicProblems && dynamicProblems.length > 0 ? dynamicProblems : null
  };

  lessonResult.homework = homework;
  
  const dbStr = localStorage.getItem('mentos_math_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  db.push(homework);
  localStorage.setItem('mentos_math_homework_db', JSON.stringify(db));

  console.log('[generateMathHomework] Structure-cloned homework assigned:', homework);

  return homework;
}
