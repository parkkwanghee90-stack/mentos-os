import { useState, useEffect } from 'react';

export function useMathLessonSession(ssot, overrides) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!ssot) return;
    try {
      const lesson = { flow: [], units: [ssot.routeTitle || '1단원'], meta: { targetGrades: ssot.targetGrades, targetRanks: ssot.targetRanks, contentProfile: ssot.contentProfile } };
      let userId = localStorage.getItem('studentId') || ('student_' + Math.random().toString(36).substr(2, 9));
      localStorage.setItem('studentId', userId);

      const storageKey = `math_progress_${userId}_${ssot.id}`;
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
        userId, teacher: ssot.name, teacherId: ssot.id, subject: 'math',
        grade: lesson.meta.targetGrades, rank: lesson.meta.targetRanks,
        contentProfile: lesson.meta.contentProfile, flow: lesson.flow, units: lesson.units,
        round: initialRound, currentPhaseIndex: initialPhaseIndex
      });
    } catch (e) {
      console.error(e);
    }
  }, [ssot?.id]);

  useEffect(() => {
    if (!session || !ssot?.id) return;
    if (session.curriculumData && session.curriculumData.round === session.round && session.curriculumData.teacherId === ssot?.id) return;

    async function doLoad() {
      try {
        const roundNum = ((session.round - 1) % 8) + 1; 
        const weekNum = Math.ceil(roundNum / 2);
        const lessonNum = (roundNum % 2 === 1) ? 1 : 2;
        
        let lessonContent = {};

        // 만약 넘겨받은 overrides가 있다면(진단/모의고사 보강에서 넘어온 경우), 파일 대신 동적으로 문제 구조를 생성!
        if (overrides && (overrides.unitOverride || overrides.remediation)) {
          const unit = overrides.unitOverride;
          const remediation = overrides.remediation; // { score, unit, levels: [2,2,2,3,3] }
          
          if (remediation) {
            // 모의고사 보강 모드: 고정 범위 (001~005) 또는 혼합 레벨 처리
            const problems = remediation.levels.map((lvl, idx) => {
              const pid = String(idx + 1).padStart(3, '0');
              // 단원명에 따른 폴더 매핑 (예: 사인법칙 -> 삼각함수활용2단계)
              const folderBase = remediation.unit; // 이미 정규화된 단원명 (예: 삼각함수활용)
              const folder = `${folderBase}${lvl}단계`;
              
              return {
                number: idx + 1,
                questionImage: window.resolveAsset(`/math_crops/(5)수학1 중간/${lvl}단계/${folder}/${pid}.webp`),
                questionText: `[보강 학습] ${folderBase} ${lvl}단계 ${idx + 1}번 문제`,
                answer: "1", // Master 데이터에서 가져오도록 MathClassroom에서 처리됨
                matchScore: 1
              };
            });

            lessonContent = {
              core: { 
                original_unit: `${remediation.unit}${remediation.levels[0]}단계`, 
                title: `${remediation.unit} 보강 - 핵심 훈련`,
                problems: problems
              },
              step: { 
                original_unit: `${remediation.unit}${remediation.levels[2]}단계`, 
                title: `${remediation.unit} 보강 - 실전 응용`,
                problems: problems
              },
              mock: { 
                original_unit: `${remediation.unit}${remediation.levels[4]}단계`, 
                title: `${remediation.unit} 보강 - 최종 점검`,
                problems: problems
              }
            };
          } else {
            // 기존 진단 오버라이드
            const levelMap = { 1: 1, 2: 2, 3: 3 }; 
            const phaseLevel = levelMap[overrides.phaseIndexOverride] || 2; 
            
            const prefixMapping = {
              '고차방정식': 'f_7',
              '이차부등식': 'f_2',
              '일차부등식': 'f_1',
              '점과좌표': 'f_3',
              '직선의방정식': 'f_4',
              '원의방정식': 'f_5',
              '도형의이동': 'f_6'
            };
            const p = prefixMapping[unit] ? prefixMapping[unit] + '_' : '';

            lessonContent = {
              core: { title: `${unit} ${phaseLevel}단계 - 필수 로직 훈련` },
              step: { title: `${unit} ${phaseLevel}단계 - 실전 응용 문제` },
              mock: { title: `${unit} ${phaseLevel}단계 - 미니 모의고사` }
            };
          }
        } else {
          // 기존 정적 로딩 방식 폴백
        // 기존 정적 로딩 방식
          const modules = import.meta.glob('/src/data/lessons/math/**/*.json');
          const targetPath = `/src/data/lessons/math/${ssot.id}/week_${weekNum}/lesson_0${lessonNum}.json`;
          
          if (modules[targetPath]) {
            const module = await modules[targetPath]();
            lessonContent = module.default || module;
          }

          // 폴백 데이터 제공 (JSON이 없거나 비어있는 경우)
          if (!lessonContent || !lessonContent.core) {
            const isGrade3 = ssot.targetGrades?.some(g => g.includes('고3') || g.includes('N수'));
            const isGrade2Fallback = ssot.targetGrades?.some(g => g.includes('고2')) || ssot.courseName?.includes('대수');
            
            if (isGrade3) {
               lessonContent = {
                 core: { original_unit: '[2단계] 지수로그함수의극한', title: '지수로그함수의극한 2단계 - 필수 로직 훈련' },
                 step: { original_unit: '[2단계] 지수로그함수의극한', title: '지수로그함수의극한 2단계 - 실전 응용 문제' },
                 mock: { original_unit: '[2단계] 지수로그함수의극한', title: '지수로그함수의극한 2단계 - 미니 모의고사' }
               };
            } else if (isGrade2Fallback) {
               lessonContent = {
                 core: { original_unit: '삼각함수활용2단계', title: '삼각함수활용 2단계 - 필수 로직 훈련' },
                 step: { original_unit: '삼각함수활용2단계', title: '삼각함수활용 2단계 - 실전 응용 문제' },
                 mock: { original_unit: '삼각함수활용2단계', title: '삼각함수활용 2단계 - 미니 모의고사' }
               };
            } else {
               lessonContent = {
                 core: { original_unit: '점과좌표2단계', title: '점과좌표 2단계 - 필수 로직 훈련' },
                 step: { original_unit: '점과좌표2단계', title: '점과좌표 2단계 - 실전 응용 문제' },
                 mock: { original_unit: '점과좌표2단계', title: '점과좌표 2단계 - 미니 모의고사' }
               };
            }
          }
        }

        const mathFlow = [
            { phase: 'core', title: '필수 유형 훈련' },
            { phase: 'step', title: '단계별 문제 풀이' },
            { phase: 'mock', title: '미니 모의고사' },
            { phase: 'homework', title: '과제 안내' },
            { phase: 'finalize', title: '수업 완료' }
        ];

        setSession(prev => ({ 
          ...prev, flow: mathFlow, currentPhaseIndex: overrides && overrides.phaseIndexOverride !== undefined ? 0 : 0,
          curriculumData: { teacherId: ssot.id, round: roundNum, week: weekNum, lesson: lessonNum, lessonContent } 
        }));
      } catch (e) {
        console.error(e);
      }
    }
    doLoad();
  }, [session?.round, ssot?.id, overrides]);

  useEffect(() => {
    if (!session || !session.userId || !session.teacherId) return;
    const storageKey = `math_progress_${session.userId}_${session.teacherId}`;
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
