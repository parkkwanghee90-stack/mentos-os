import { useState, useEffect } from 'react';


export function useEnglishLessonSession(ssot) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!ssot) return;
    try {
      const lesson = { flow: [], units: [ssot.routeTitle || '1단원'], meta: { targetGrades: ssot.targetGrades, targetRanks: ssot.targetRanks, contentProfile: ssot.contentProfile } };
      let userId = localStorage.getItem('studentId') || ('student_' + Math.random().toString(36).substr(2, 9));
      localStorage.setItem('studentId', userId);

      const storageKey = `eng_progress_${userId}_${ssot.id}`;
      const savedProgressStr = localStorage.getItem(storageKey);
      let initialRound = 1, initialPhaseIndex = 0, initialVocabIndex = 0;
      if (savedProgressStr) {
        try {
          const savedProgress = JSON.parse(savedProgressStr);
          initialRound = savedProgress.round || 1;
          initialPhaseIndex = savedProgress.currentPhaseIndex || 0;
          initialVocabIndex = savedProgress.vocabSubPhaseIndex || 0;
        } catch (e) {}
      }

      setSession({
        userId, teacher: ssot.name, teacherId: ssot.id, subject: 'english',
        grade: lesson.meta.targetGrades, rank: lesson.meta.targetRanks,
        contentProfile: lesson.meta.contentProfile, flow: lesson.flow, units: lesson.units,
        round: initialRound, currentPhaseIndex: initialPhaseIndex, vocabSubPhaseIndex: initialVocabIndex
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
        
        const modules = import.meta.glob('/src/data/lessons/english/**/*.json');
        const targetPath = `/src/data/lessons/english/${ssot.id}/week_${weekNum}/lesson_0${lessonNum}.json`;
        
        let lessonContent = {};
        if (modules[targetPath]) {
          const module = await modules[targetPath]();
          lessonContent = module.default || module;
        }

        const englishFlow = [
            { phase: 'reading', title: 'Reading (독해)', duration: 60 },
            { phase: 'hearing', title: 'Hearing (듣기)', duration: 30 },
            { phase: 'vocab', title: 'Vocab (단어)', duration: 30, subFlow: lessonContent.vocab?.sequence || ['venice', 'wordLearn', 'wordTest', 'vocabLearn', 'vocabTest'] },
            { phase: 'finalize', title: '수업 종료', duration: 0 }
        ];

        setSession(prev => ({ 
          ...prev, flow: englishFlow, currentPhaseIndex: 0, vocabSubPhaseIndex: 0,
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
    const storageKey = `eng_progress_${session.userId}_${session.teacherId}`;
    localStorage.setItem(storageKey, JSON.stringify({
      round: session.round, currentPhaseIndex: session.currentPhaseIndex, vocabSubPhaseIndex: session.vocabSubPhaseIndex, lastAccess: Date.now()
    }));
  }, [session?.round, session?.currentPhaseIndex, session?.vocabSubPhaseIndex]);

  const advanceSessionProgress = (newSession) => {
    if (!newSession) return;
    if (newSession.currentPhaseIndex >= newSession.flow.length) {
      newSession.round += 1;
      newSession.currentPhaseIndex = 0;
      newSession.vocabSubPhaseIndex = 0;
    }
    setSession(newSession);
  };

  return { session, setSession: advanceSessionProgress };
}
