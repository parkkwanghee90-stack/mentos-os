import { useState, useEffect } from 'react';

export function useScienceLessonSession(ssot) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!ssot) return;
    try {
      const lesson = { flow: [], units: [ssot.routeTitle || '1단원'], meta: { targetGrades: ssot.targetGrades, targetRanks: ssot.targetRanks, contentProfile: ssot.contentProfile } };
      let userId = localStorage.getItem('studentId') || ('student_' + Math.random().toString(36).substr(2, 9));
      localStorage.setItem('studentId', userId);

      const storageKey = `sci_progress_${userId}_${ssot.id}`;
      const savedProgressStr = localStorage.getItem(storageKey);
      let initialRound = 1, initialPhaseIndex = 0;
      if (savedProgressStr) {
        try {
          const savedProgress = JSON.parse(savedProgressStr);
          initialRound = savedProgress.round || 1;
          initialPhaseIndex = savedProgress.currentPhaseIndex || 0;
        } catch (e) {}
      }

      setSession({
        userId, teacher: ssot.name, teacherId: ssot.id, subject: ssot.subject,
        grade: lesson.meta.targetGrades, rank: lesson.meta.targetRanks,
        contentProfile: lesson.meta.contentProfile, flow: lesson.flow, units: lesson.units,
        round: initialRound, currentPhaseIndex: initialPhaseIndex
      });
    } catch (e) {
      console.error(e);
    }
  }, [ssot]);

  useEffect(() => {
    if (!session || !ssot.id) return;
    if (session.curriculumData && session.curriculumData.round === session.round && session.curriculumData.teacherId === ssot.id) return;

    async function doLoad() {
      try {
        const roundNum = ((session.round - 1) % 8) + 1; 
        const weekNum = Math.ceil(roundNum / 2);
        const lessonNum = (roundNum % 2 === 1) ? 1 : 2;
        
        const modules = import.meta.glob(`/src/data/lessons/{physics,chemistry,biology,earth}/**/*.json`);
        const targetPath = `/src/data/lessons/${ssot.subject}/${ssot.id}/week_${weekNum}/lesson_0${lessonNum}.json`;
        
        let lessonContent = {};
        if (modules[targetPath]) {
          const module = await modules[targetPath]();
          lessonContent = module.default || module;
        }

        const isFirstClass = (weekNum === 1 && lessonNum === 1);
        let scienceFlow;
        if (isFirstClass) {
          scienceFlow = [
            { phase: 'diagnosis', title: '진단 및 수준 파악 [0~15분]' },
            { phase: 'frame', title: '개념 프레임 세팅 [15~40분]' },
            { phase: 'core_exam', title: '핵심 기출 풀이 [40~80분]' },
            { phase: 'error_pattern', title: '오답 패턴 분석 [80~100분]' },
            { phase: 'application', title: '적용 문제 훈련 [100~120분]' },
            { phase: 'finalize', title: '수업 종료' }
          ];
        } else {
          scienceFlow = [
              { phase: 'intro', title: '학습 목표' },
              { phase: 'concept', title: '개념 이해' },
              { phase: 'exam', title: '문제 풀이' },
              { phase: 'homework', title: '과제' },
              { phase: 'finalize', title: '수업 종료' }
          ];
        }

        setSession(prev => ({ 
          ...prev, flow: scienceFlow, currentPhaseIndex: 0,
          curriculumData: { teacherId: ssot.id, round: roundNum, week: weekNum, lesson: lessonNum, lessonContent } 
        }));
      } catch (e) {
        console.error(e);
      }
    }
    doLoad();
  }, [session?.round, ssot.id]);

  useEffect(() => {
    if (!session || !session.userId || !session.teacherId) return;
    const storageKey = `sci_progress_${session.userId}_${session.teacherId}`;
    localStorage.setItem(storageKey, JSON.stringify({
      round: session.round, currentPhaseIndex: session.currentPhaseIndex, lastAccess: Date.now()
    }));
  }, [session?.round, session?.currentPhaseIndex]);

  const advanceSessionProgress = (newSession) => {
    if (!newSession) return;
    if (newSession.currentPhaseIndex >= newSession.flow.length) {
      newSession.round += 1;
      newSession.currentPhaseIndex = 0;
    }
    setSession(newSession);
  };

  return { session, setSession: advanceSessionProgress };
}
