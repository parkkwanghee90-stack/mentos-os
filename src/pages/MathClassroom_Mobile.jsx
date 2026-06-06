import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Search, Camera, Send, ChevronRight, CheckCircle, Smartphone, Mic, Volume2, Upload, Paperclip, Clock, BookOpen, X, ChevronDown, UploadCloud } from 'lucide-react';
import { getTeacherById } from '@/data/teacherProfiles';
import { useMathLessonSession } from '@/hooks/useMathLessonSession';
import { getPendingMathHomework, getMathAssistantFeedbackForNextClass } from '@/engine/math/assistantReviewEngine';
import { queueParentPush } from '@/services/pushService';
import { HomeworkEngine } from '@/engine/homeworkEngine';
import { tutorChat } from '@/services/openaiChatApi';
import { saveResult } from '@/services/lessonResultStore';
import { finalizeMathSession } from '@/engine/math/finalizeSession';
import { buildMathSystemPrompt, PCBS_INITIAL_STATE, PCBS_SSOT } from '@/data/mathPCBS_SSOT';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '@/pages/Classroom.css';
import SineRuleAnimation from '@/components/SineRuleAnimation';
import CosineRuleAnimation from '@/components/CosineRuleAnimation';
import TriangleAreaAnimation from '@/components/TriangleAreaAnimation';
import DynamicProblemAnimation from '@/components/DynamicProblemAnimation';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';
import PremiumLecturePlayer from '@/components/lectures/PremiumLecturePlayer';

const ErrorComponent = ({ text }) => <div style={{ color: 'red', padding: '2rem', background: 'var(--bg-base)', color: 'var(--text-main)', height: '100vh' }}>🚨 {text}</div>;
const Loading = () => <div style={{ color: 'var(--text-main)', padding: '2rem', background: 'var(--bg-base)', height: '100vh' }}>Loading V2 Engine...</div>;

function useSTT(setInput) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('model', 'whisper-1');
          formData.append('language', 'ko');

          const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
          
          try {
            setInput(prev => prev + (prev ? ' ' : '') + '(음성 변환 중...)');
            const res = await fetch('/api/openai/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${API_KEY}`
              },
              body: formData
            });
            const data = await res.json();
            
            if (data.text) {
              setInput(prev => {
                const cleaned = prev.replace('(음성 변환 중...)', '').trim();
                return cleaned + (cleaned ? ' ' : '') + data.text;
              });
            } else {
              setInput(prev => prev.replace('(음성 변환 중...)', '').trim());
            }
          } catch (error) {
            console.error('Whisper API Error:', error);
            setInput(prev => prev.replace('(음성 변환 중...)', '').trim());
          }
          
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('마이크 접근 권한이 없습니다.', err);
        alert('마이크 접근 권한을 허용해주세요.');
      }
    }
  };

  return { isRecording, toggleRecording };
}



function LessonRenderer({ session, setSession, ssot, timeLeft, selectedUnit, setSelectedUnit, testProblemIdx, setTestProblemIdx, selectedCourse, setSelectedCourse, sidebarData, isG1Teacher, isG2Teacher, isG3Teacher }) {
  const currentPhaseFlow = session.flow[session.currentPhaseIndex];
  
  const [readingState, setReadingState] = useState({
    subPhase: 'intro', // intro -> passage_1 -> passage_2 -> passage_3 -> summary -> complete
    questionCount: 0
  });

  // ── PCBS 단계 상태 (P → C → B → SOLVE → S) ──
  const [pcbsPhase, setPcbsPhase] = useState('P');
  const [learningStep, setLearningStep] = useState('problem');
  // 각 문제마다 PCBS 진행 턴 수 추적
  const [pcbsTurnCount, setPcbsTurnCount] = useState(0);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploadedProblem, setUploadedProblem] = useState(null);
  const { isRecording, toggleRecording } = useSTT(setInput);
  const navigate = useNavigate();

  // ── 개념카드 전역 상태 및 모달 제어 ──
  const [globalCards, setGlobalCards] = useState([]);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showPremiumLecture, setShowPremiumLecture] = useState(false);
  const [selectedExpandedCard, setSelectedExpandedCard] = useState(null);
  const [expandedProblemImage, setExpandedProblemImage] = useState(null);
  const [precomputedAnims, setPrecomputedAnims] = useState({});

  useEffect(() => {
    Promise.all([
      fetch(window.resolveAsset('/concept_cards/global_metadata.json')).then(res => res.json()).catch(() => []),
      fetch(window.resolveAsset('/concept_cards/dynamic_concepts.json')).then(res => res.json()).catch(() => []),
      fetch(window.resolveAsset('/concept_cards/precomputed_animations.json')).then(res => res.json()).catch(() => ({}))
    ]).then(([globalData, dynamicData, animsData]) => {
      setPrecomputedAnims(animsData);
      const safeDynamic = Array.isArray(dynamicData) ? dynamicData : [];
      const safeGlobal = Array.isArray(globalData) ? globalData : [];
      const dynamicUnits = new Set(safeDynamic.map(d => d.unit));
      const filteredGlobal = safeGlobal.filter(d => {
        if (!d.linked_problem_folders) return true;
        // Exclude if ANY of its linked folders starts with a dynamic unit (e.g. "일차부등식/2" overlaps "일차부등식")
        return !d.linked_problem_folders.some(folder => {
          const baseUnit = folder.split('/')[0];
          return dynamicUnits.has(baseUnit) || dynamicUnits.has(folder);
        });
      });
      setGlobalCards([...filteredGlobal, ...safeDynamic]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleProblemUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setUploadedProblem(fileUrl);
      setMessages(prev => [...prev, { role: 'system', content: '[업로드 확인] 문제가 업로드되었습니다. 제출 시 선생님이 이 문제에 대해 설명합니다.' }]);
    }
  };

  // Phase 바뀔 때 초기 메세지 처리 및 자동 로직 실행
  useEffect(() => {
    const phaseName = currentPhaseFlow?.phase;
    if (!phaseName) return;

    console.log(`[STEP 3] first content built for phase: ${phaseName}`);

    let initialMessages = [];
    const introConfig = ssot.introPhase;

    // ── Phase 시작 시 PCBS 초기화 ──
    if (phaseName === 'core' || phaseName === 'step' || phaseName === 'mock') {
      setPcbsPhase('P');
      setPcbsTurnCount(0);
      // 인트로 안내 메시지 제거 (사용자 요청) — 채팅은 빈 상태로 시작
    } else if (phaseName === 'homework') {
      initialMessages.push({ role: 'assistant', content: '[과제 안내]\n오늘 배운 단원의 복습 과제를 안내합니다.' });
    } else if (phaseName === 'finalize') {
      initialMessages.push({ role: 'assistant', content: '[시스템] 수업을 종료하고 결과 데이터를 집계 중입니다...' });
    }

    if (initialMessages.length > 0) {
      setMessages(initialMessages);
      console.log(`[STEP 4] messages injected: ${initialMessages.length} messages`);
    }

    // 자동 실행 페이즈 로직 (finalize)
    if (phaseName === 'finalize') {
      setLoading(true);
      setTimeout(() => {
        const pendingHw = getPendingMathHomework(session.userId, ssot.id);
        const result = finalizeMathSession(session);
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: '[시스템] 숙제가 생성되고 학부모 전송용 메시지 준비가 완료되었습니다.' },
          { role: 'system', content: result.pushMsg }
        ]);
        
        setTimeout(() => alert("전 과목(SSOT) 공통 수업 종료: 대시보드로 이동합니다."), 1000);
        setTimeout(() => navigate('/dashboard'), 3000);
      }, 1500);
    }
  }, [currentPhaseFlow?.phase, session.vocabSubPhaseIndex]);

  const advance = () => {
    if (timeLeft > 0) {
      alert(`[절대 종료 금지] 수업 타이머가 0이 될 때까지는 조기 종료나 완전 스킵이 불가능합니다. (남은 시간: ${Math.floor(timeLeft/60)}분)`);
      if (currentPhaseFlow?.phase === 'finalize' || session.currentPhaseIndex === session.flow.length - 1) return;
    }
    setSession({ ...session, currentPhaseIndex: session.currentPhaseIndex + 1 });
  };

  // ── [슈퍼 관리자 검수용] 강제 스킵 ──
  const testAdvance = () => {
    setMessages(prev => prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m));
    setTestProblemIdx(prev => prev + 1);
  };

  // ── PCBS 단계 자동 전진 로직 ──
  // 학생이 답변을 보낼 때마다 호출. 충분한 답변이 있으면 다음 PCBS 단계로 넘어감.
  const advancePcbsPhase = (studentAnswer) => {
    const hasAnswer = studentAnswer && studentAnswer.trim().length >= 3;
    const newTurn = pcbsTurnCount + 1;
    setPcbsTurnCount(newTurn);

    // P → C → B → SOLVE → S 자동 전진
    // 학생이 실질적인 답을 했을 때만 전진
    if (hasAnswer) {
      if (pcbsPhase === 'P') {
        console.log('[PCBS] P 완료 → C 이동');
        setPcbsPhase('C');
      } else if (pcbsPhase === 'C') {
        console.log('[PCBS] C 완료 → B 이동');
        setPcbsPhase('B');
      } else if (pcbsPhase === 'B') {
        console.log('[PCBS] B 완료 → SOLVE 이동 (P+C+B 구조 완성)');
        setPcbsPhase('SOLVE');
      } else if (pcbsPhase === 'SOLVE') {
        // SOLVE 단계는 2턴 이상 지속 후 S로 전환
        if (newTurn >= 3) {
          console.log('[PCBS] SOLVE 완료 → S(Survey) 이동');
          setPcbsPhase('S');
        }
      }
      // S는 마지막 단계 — 유지
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !isRecording) return;
    if (loading) return;

    if (isRecording) {
      toggleRecording();
    }
    // 강제 SSOT 체크: 정보가 완벽하지 않으면 호출 금지
    if (!ssot.name || !ssot.targetGrades || !ssot.targetRanks || (!ssot.contentProfile && !ssot.routeId)) {
      console.error("SSOT 무결성 위반: LLM 호출을 차단합니다.", ssot);
      alert("선생님 데이터(SSOT)가 불완전하여 수업을 진행할 수 없습니다.");
      return;
    }

    // 커리큘럼 데이터(lessonContent)가 없으면 호출 금지
    const lessonContent = session.curriculumData?.lessonContent;
    if (!lessonContent) {
      console.error("Curriculum 무결성 위반: 현재 회차의 lessonContent가 없습니다.", session.curriculumData);
      alert("현재 회차의 수업 콘텐츠가 준비되지 않아 수업을 진행할 수 없습니다.");
      return;
    }

    const isMathPhase = ['core', 'step', 'mock'].includes(currentPhaseFlow?.phase);
    if (isMathPhase) {
      advancePcbsPhase(input);
    }

    const userMessage = { 
      role: 'user', 
      content: uploadedProblem ? `[문제 이미지 첨부됨]\n${input}` : input 
    };
    setInput('');
    setUploadedProblem(null);
    setLoading(true);

    const subPhase = '';
    
    // 현재 단계에 맞는 학습 콘텐츠(지문/단어) 추출
    let curriculumText = "학습 콘텐츠가 로딩되지 않았습니다.";
    if (lessonContent) {
      const phaseKey = currentPhaseFlow.phase.toLowerCase();
      const phaseData = lessonContent[phaseKey];
      if (phaseData) {
        curriculumText = JSON.stringify(phaseData, null, 2);
      }
    }

    // ── SSOT: PCBS 기반 시스템 프롬프트 빌드 ──
    const isMathPcbsPhase = ['core', 'step', 'mock'].includes(currentPhaseFlow?.phase);
    const systemPrompt = isMathPcbsPhase
      ? buildMathSystemPrompt({
          ssot,
          session,
          pcbsPhase,
          curriculumText,
        })
      : `당신은 ${ssot.name} 선생님입니다. 현재 단계: ${currentPhaseFlow.phase.toUpperCase()} ${subPhase}\n현재 회차: ${session.round}회차\n수업 방식: ${ssot.contentProfile}\n\n[오늘의 학습 콘텐츠]\n${curriculumText}\n\n[수업 규칙]\n${ssot.contentRules ? ssot.contentRules.join('\n') : '규칙 없음'}`;

    const triggerAnimationHint = () => {
      let rankSuffix = '';
      if (ssot.targetRanks.some(r => r.includes('1') || r.includes('2') || r.includes('최상위'))) rankSuffix = '_rank1';
      else if (ssot.targetRanks.some(r => r.includes('4') || r.includes('5') || r.includes('하위'))) rankSuffix = '_rank4';

      const specificAnimKey = `${currentUnit}_${currentPhaseFlow?.phase}${rankSuffix}`;
      const genericAnimKey = `${currentUnit}_${currentPhaseFlow?.phase}`;
      const animKey = precomputedAnims[specificAnimKey] ? specificAnimKey : genericAnimKey;

      if (precomputedAnims[animKey]) {
        setMessages(prev => [...prev, { role: 'user', content: '[시스템 호출] 애니메이션 힌트 요청' }]);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '문제 풀이가 막히셨나요? 걱정하지 마세요! AI가 방금 회원님이 푸시는 문제에 맞춰 **라이브 다이내믹 힌트 애니메이션**을 준비해 두었습니다. 영상을 통해 돌파구를 찾아보세요!',
            dynamicData: precomputedAnims[animKey]
          }]);
        }, 500);
      } else {
        alert("해당 문제에 대한 맞춤형 애니메이션 힌트는 아직 전처리(Precompute)되지 않았습니다.");
      }
    };

    const payload = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6), // 최근 문맥 유지
      userMessage
    ];
    
    // UI 업데이트
    setMessages(prev => [...prev, userMessage]);

    // 1. 사용자가 힌트를 요구하거나 "모르겠어요" 라고 할 때, 미리 준비둔 애니메이션 해설이 있다면 즉시 띄워줍니다!
    const isHintReq = input.includes('모르') || input.includes('어렵') || input.includes('힌트') || input.includes('안 풀');
    if (isHintReq) {
      const animKey = `${currentUnit}_${currentPhaseFlow?.phase}`;
      if (precomputedAnims[animKey]) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '문제 풀이가 막히셨나요? 전혀 걱정하지 마세요! AI가 이 실전 문제의 해설지 흐름을 **라이브 다이내믹 애니메이션**으로 준비해 두었습니다. 시각적 풀이 과정을 보며 힌트를 얻어보세요!',
            dynamicData: precomputedAnims[animKey]
          }]);
          setLoading(false);
        }, 1500);
        return; 
      }
    }

    // 2. 삼각함수의 활용 단원이면서, 학생이 C(단서)를 제출하여 B(개념) 단계로 넘어가게 될 때,
    // 랜덤으로 API 호출을 아끼고 시각적 증명 애니메이션을 대화창에 직접 꽂아줍니다!
    if (curriculumText.includes('삼각함수의 활용') && pcbsPhase === 'C') {
      const animations = ['sine_rule', 'cosine_rule', 'triangle_area'];
      const randomId = animations[Math.floor(Math.random() * animations.length)];
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '해당 단계(Background)를 완벽히 풀기 위해서는 매우 중요한 실전 핵심 도형 개념이 필요합니다! 다음 **시각적 증명 애니메이션**을 보며 직관적으로 원리를 파악해 보세요.',
          animationId: randomId
        }]);
        setLoading(false);
      }, 1500); // 인간처럼 1.5초 딜레이
      return; 
    }

    try {
      const response = await tutorChat({ messages: payload });
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      }
    } catch (e) {
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: `[에러 발생] 통신 실패: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // ── 현재 단원명(unit) 추출 로직 ──
  let currentUnit = null;
  let currentProblemImage = null;
  let currentProblemTitle = null;

  if (session.curriculumData?.lessonContent) {
    const phaseKey = currentPhaseFlow?.phase?.toLowerCase();
    const phaseData = session.curriculumData.lessonContent[phaseKey];
    if (phaseData) {
      if (phaseData.problem_image) {
         currentProblemImage = phaseData.problem_image;
      }
      if (phaseData.title) {
         currentProblemTitle = phaseData.title;
      }
      // 유닛 추출 로직 개선: 구조적 경로 분리/추출 알고리즘 적용 (정규식 엣지케이스 우회)
      let extractedUnit = null;
      const strData = JSON.stringify(phaseData);
      const pathMatch = strData.match(/math_(?:indexed|crops)\/[^"']+/);
      if (pathMatch) {
        const fullPath = pathMatch[0];
        const parts = fullPath.split('/');
        let targetIndex = parts.length - 1;
        
        // 파일명 세그먼트 스킵 (확장자 존재하거나 순수 숫자명인 경우)
        if (targetIndex >= 0 && (
          parts[targetIndex].endsWith('.webp') || 
          parts[targetIndex].endsWith('.png') || 
          parts[targetIndex].endsWith('.jpg') || 
          parts[targetIndex].endsWith('.json') || 
          /^\d+$/.test(parts[targetIndex])
        )) {
          targetIndex--;
        }
        
        // 단독 단계명 세그먼트 스킵 (2단계, 3단계, 4단계 등)
        if (targetIndex >= 0) {
          const seg = parts[targetIndex].trim();
          if (seg === '2단계' || seg === '3단계' || seg === '4단계' || seg === '개념2단계') {
            targetIndex--;
          }
        }
        
        if (targetIndex >= 1) {
          extractedUnit = parts[targetIndex];
        }
      }
      
      if (extractedUnit) {
        currentUnit = extractedUnit;
      } else {
        // 기존 정규식 Fallback
        const match = strData.match(/math_indexed\/([^/]+)/);
        if (match) currentUnit = match[1];
      }
      
      // 만약 동적으로 overrides에서 넘겨받은 원본 유닛 이름이 있다면 그걸 우선 사용!
      if (phaseData.original_unit) {
         currentUnit = phaseData.original_unit;
      }
    }
  }

  // 사용자가 사이드바에서 특정 단원을 강제로 선택한 경우 이미지 파싱
  if (selectedUnit) {
     currentUnit = selectedUnit;
     const formattedIdx = String(testProblemIdx).padStart(3, '0');
     
     // 단계 추출 (예: '삼각함수활용4단계' -> '4단계'). 없으면 기본 '2단계'
     const stepMatch = currentUnit.match(/(2|3|4)단계/);
     const stepStr = stepMatch ? stepMatch[0] : '2단계';
     
     // [대수 매핑]
     if (currentUnit.includes('등차') || currentUnit.includes('등비')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/등차등비수열4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/등차등비${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('시그마')) {
        if (stepStr === '3단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/3단계/여러가지수열3단계/${formattedIdx}.webp`)
        else if (stepStr === `4단계`) currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/수열의합4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/2단계/시그마용법2단계/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('귀납적')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/2단계/귀납적정의2단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/수학적귀납법${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('삼각함수') && currentUnit.includes('활용')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수활용${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('삼각함수') && currentUnit.includes('그래프')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/삼각함수그래프/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수그래프${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('삼각함수') && (currentUnit.includes('정의') || currentUnit.includes('성질'))) currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수성질${stepStr}/${formattedIdx}.webp`)
     else if (currentUnit.includes('지수함수')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그함수4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/지수함수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('로그함수')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그함수4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/로그함수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('지수')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/지수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('로그')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/로그${stepStr}/${formattedIdx}.webp`)
     }
     
     // [수학상 매핑]
     else if (currentUnit.includes('다항식')) currentProblemImage = window.resolveAsset(`/math_crops/(001)다항식/${stepStr}/${formattedIdx}.webp`)
      else if (currentUnit.includes('항등식') || currentUnit.includes('나머지정리')) currentProblemImage = window.resolveAsset(`/math_crops/(002)항등식과나머지정리/${stepStr}/${formattedIdx}.webp`)
      else if (currentUnit.includes('인수분해')) currentProblemImage = window.resolveAsset(`/math_crops/(003)인수분해/${stepStr}/${formattedIdx}.webp`)
      else if (currentUnit.includes('복소수')) currentProblemImage = window.resolveAsset(`/math_crops/(004)복소수/${stepStr}/${formattedIdx}.webp`)
      else if (currentUnit.includes('이차방정식과이차함수') || currentUnit.includes('이차방정식과 이차함수')) currentProblemImage = window.resolveAsset(`/math_crops/(006)이차방정식과이차함수/${stepStr}/${formattedIdx}.webp`)
      else if (currentUnit.includes('이차방정식')) currentProblemImage = window.resolveAsset(`/math_crops/(005)이차방정식/${stepStr}/${formattedIdx}.webp`)
      else if (currentUnit.includes(`고차방정식`)) currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/고차방정식${stepStr}/${formattedIdx}.webp`)
     else if (currentUnit.includes('일차부등식')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(1)일차부등식 개념2단계(26) 1+1(쌍둥이)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/일차부등식${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('이차부등식')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/이차부등식${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('경우의 수') || currentUnit.includes('경우의수')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(3)경우의수2단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/경우의수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('행렬')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(4)행렬2단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/행렬${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('점과좌표')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/점과좌표${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('직선의방정식') || currentUnit.includes('직선의 방정식')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/직선의방정식${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('원의방정식') || currentUnit.includes('원의 방정식')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/원의방정식${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('도형의이동') || currentUnit.includes('도형의 이동')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/(8)도형의이동 개념2단계(46)p21 1+1(쌍둥이)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(2)수학(상)기말/도형의이동${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('함수의 극한') || currentUnit.includes('함수의극한')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/함수의 극한 2단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/함수의극한${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('함수의 연속') || currentUnit.includes('함수의연속')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/함수의 연속 2단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/함수의연속${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('미분계수')) {
        if (stepStr === '3단계' || stepStr === '4단계') {
            currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/미분계수${stepStr}/${formattedIdx}.webp`)
        } else {
            currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/미분계수 ${stepStr}/${formattedIdx}.webp`)
        }
     }
     else if (currentUnit.includes('미분의 활용') || currentUnit.includes('도함수의 활용')) {
        if (stepStr === '2단계') {
            currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/미분의활용 2단계/${formattedIdx}.webp`)
        } else if (stepStr === `3단계`) {
            currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/도함수의활용3단계/${formattedIdx}.webp`)
        } else if (stepStr === `4단계`) {
            currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/도함수의 활용 4단계/${formattedIdx}.webp`)
        } else {
            currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/도함수의 활용1 ${stepStr}/${formattedIdx}.webp`)
        }
     }
     else if (currentUnit.includes(`부정적분과 정적분`)) {
        currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/부정적분과 정적분 ${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes(`정적분의 활용`)) {
        currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/정적분의 활용 ${stepStr}/${formattedIdx}.webp`)
     }
     else currentProblemImage = window.resolveAsset(`/math_crops/${currentUnit}/${formattedIdx}.webp`)
     
     currentProblemImage += `?v=20260429_v4`;
     currentProblemTitle = `${currentUnit} [${testProblemIdx}번]`;
  }

  // ── 개념카드 필터 로직 ──
  const getFilteredCards = () => {
    if (!currentUnit) return [];
    return globalCards.filter(card => {
      const overrideUnit = card.override?.unit;
      if (overrideUnit) return overrideUnit === currentUnit;
      
      return card.unit === currentUnit || 
             (card.linked_problem_folders && card.linked_problem_folders.some(f => f.startsWith(currentUnit + '/'))) ||
             (card.source_file && card.source_file.includes(currentUnit));
    });
  };

  const filteredCards = getFilteredCards();
  const isSenior = session?.grade?.some(g => g.includes('고3') || g.includes('N수'));

      return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', overflow: 'hidden', background: 'var(--bg-base)', color: 'var(--text-main)', position: 'relative' }}>
      
      {/* 1. Header & Main Content (상단/중앙) - Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg-base)', padding: '1rem' }}>
        
        {/* ── 모바일 코스/단원 선택 카드 ── */}
        {selectedCourse !== undefined && sidebarData && (
          <div style={{ marginBottom: '1rem', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)', borderRadius: '14px', border: '1px solid var(--border-glass)', padding: '0.8rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {/* 코스 선택 */}
            {isG1Teacher ? (
              <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.3rem 0' }}>📐 고1 수학(상/하) 전용</div>
            ) : isG2Teacher ? (
              <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.3rem 0' }}>📐 수학1 (대수) 전용</div>
            ) : (
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.7rem', background: '#18181b', color: 'white', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath d=%27M2 4l4 4 4-4%27 fill=%27none%27 stroke=%27%23a1a1aa%27 stroke-width=%271.5%27/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center' }}
              >
                <option value="수2">수2</option>
                <option value="미적분">미적분</option>
                <option value="확률과통계">수능확통</option>
                <option value="모의고사">모의고사</option>
                <option value="수1">수1</option>
              </select>
            )}
            {/* 단원/모의고사 목록 (수평 스크롤 칩) */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginTop: '0.6rem', paddingBottom: '0.3rem', scrollbarWidth: 'none' }}>
              {sidebarData.sections.flatMap(sec => sec.items).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (selectedCourse === '모의고사') {
                      navigate('/class/mock-exam', { state: { title: item, elective: localStorage.getItem('last_math_elective') || 'calculus' } });
                    } else {
                      setSelectedUnit(item);
                      setTestProblemIdx(1);
                    }
                  }}
                  style={{
                    whiteSpace: 'nowrap', padding: '0.35rem 0.7rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: selectedUnit === item ? '700' : '500', flexShrink: 0,
                    background: selectedUnit === item ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(63,63,70,0.5)',
                    color: selectedUnit === item ? '#fff' : '#a1a1aa',
                    boxShadow: selectedUnit === item ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
                  }}
                >
                  {item.length > 14 ? item.slice(0, 14) + '…' : item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 상단 타이머 등 정보 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: '#a1a1aa' }}>
          <span>{currentPhaseFlow?.title || '문제 풀이'}</span>
          {(['core', 'step', 'mock'].includes(currentPhaseFlow?.phase) || selectedUnit) && (
            <button 
              onClick={() => {
                const targetUnit = selectedUnit || currentUnit;
                const pid = String(testProblemIdx).padStart(3, '0');
                if (targetUnit) {
                  setLearningStep('solve');
                  setMessages(prev => {
                    return [...prev, { 
                      role: 'assistant',
                      content: '',
                      hintPlayer: { unit: targetUnit, problemId: pid }
                    }];
                  });
                } else {
                  alert("선택된 단원이 없습니다. 좌측 메뉴에서 세부 단원/단계를 선택해주세요.");
                }
              }}
              style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}
            >
              ✨ AI Vision
            </button>
          )}
        </div>

        {/* 메인 화면 (문제 풀이/힌트/강의 모드 분기) */}
        {learningStep === 'problem' || learningStep === 'solve' ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            {/* 상단: 문제 영역 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              {currentProblemImage ? (
                <>
                  <img src={currentProblemImage} style={{ maxWidth: '100%', maxHeight: '40vh', objectFit: 'contain', borderRadius: '8px', marginBottom: '1rem' }} />
                  <button onClick={() => setExpandedProblemImage(currentProblemImage)} style={{ padding: '0.6rem 1.5rem', background: '#27272a', color: 'white', border: 'none', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <Search size={16} /> 돋보기 (크게 보기)
                  </button>
                </>
              ) : (
                <div style={{ color: '#a1a1aa', padding: '2rem' }}>문제 이미지가 없습니다.</div>
              )}
            </div>

            {/* 중간: 여백 및 풀이 대화내역 (겹침 없음) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {messages.map((m, idx) => {
                if (m.role === 'system') return null;
                // 내용·애니메이션이 없는 메시지(예: AVS 안내 제거분)는 빈 버블 방지로 건너뜀
                if (!m.content && !m.animationId && !m.dynamicData) return null;
                return (
                  <div key={idx} style={{ textAlign: m.role === 'user' ? 'right' : 'left', marginBottom: '1.5rem', width: '100%' }}>
                    <div style={{ 
                      display: 'inline-block', padding: '1rem', borderRadius: '12px', 
                      background: m.role === 'user' ? '#3b82f6' : 'var(--bg-glass)', 
                      border: m.role === 'assistant' ? '1px solid var(--border-glass)' : 'none',
                      maxWidth: '90%', textAlign: 'left', lineHeight: '1.6',
                      overflowWrap: 'break-word', wordBreak: 'break-word',
                      color: m.role === 'user' ? 'white' : 'var(--text-main)'
                    }}>
                      <div className="math-content">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.content}</ReactMarkdown>
                      </div>
                      {m.animationId === 'sine_rule' && <div style={{marginTop: '1.5rem', width: '100%'}}><SineRuleAnimation /></div>}
                      {m.animationId === 'cosine_rule' && <div style={{marginTop: '1.5rem', width: '100%'}}><CosineRuleAnimation /></div>}
                      {m.animationId === 'triangle_area' && <div style={{marginTop: '1.5rem', width: '100%'}}><TriangleAreaAnimation /></div>}
                      {m.dynamicData && <div style={{marginTop: '1.5rem', width: '100%'}}><DynamicProblemAnimation data={m.dynamicData} /></div>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

          </div>
        ) : learningStep === 'hint' ? (
          /* A 버튼 눌렀을 때 힌트 화면 (단독) */
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setLearningStep('solve')} style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', background: '#3f3f46', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }}>← 문제로 돌아가기</button>
            <div style={{ flex: 1 }}>
              <HintPlayerRouter unit={selectedUnit || currentUnit} problemId={String(testProblemIdx).padStart(3, '0')} problemImage={currentProblemImage} />
            </div>
          </div>
        ) : learningStep === 'lecture' ? (
          /* P 버튼 눌렀을 때 강의 화면 (단독) */
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setLearningStep('solve')} style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', background: '#3f3f46', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }}>← 문제로 돌아가기</button>
            <div style={{ flex: 1 }}>
              <PremiumLecturePlayer lectureId={currentUnit} onClose={() => setLearningStep('solve')} />
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. 핵심 버튼 영역 & 하단 입력 영역 (하단 고정) */}
      <div style={{ background: 'var(--bg-glass)', borderTop: '1px solid var(--border-glass)', padding: '1rem', flexShrink: 0 }}>
        
        {/* 이전 문제 / 다음 문제 네비게이션 */}
        {(learningStep === 'problem' || learningStep === 'solve') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', width: '100%' }}>
             <button 
               onClick={() => {
                 setMessages(prev => prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m));
                 setTestProblemIdx(Math.max(1, testProblemIdx - 1));
                 setLearningStep('problem');
               }}
               disabled={testProblemIdx === 1}
               style={{ width: '48%', height: '48px', background: testProblemIdx === 1 ? '#3f3f46' : '#27272a', color: testProblemIdx === 1 ? '#71717a' : 'white', border: '1px solid #3f3f46', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.95rem', cursor: testProblemIdx === 1 ? 'not-allowed' : 'pointer' }}
             >
               이전 문제
             </button>
             <button 
               onClick={() => {
                 if (testProblemIdx >= 10) {
                   alert("단원 학습을 모두 완료했습니다!");
                 } else {
                   testAdvance();
                   setLearningStep('problem');
                 }
               }}
               style={{ width: '48%', height: '48px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}
             >
               {testProblemIdx >= 10 ? '단원 완료' : '다음 문제 ▶'}
             </button>
          </div>
        )}

        {/* A/P 버튼 (가로 48% 배치) */}
        {(learningStep === 'problem' || learningStep === 'solve') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: learningStep === 'solve' ? '1rem' : '0', width: '100%' }}>
            <button 
              onClick={() => setLearningStep('hint')} 
              style={{ width: '48%', height: '56px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
            >
              🎬 Ai Vision Solution 보기
            </button>
            <button 
              onClick={() => setLearningStep('lecture')} 
              style={{ width: '48%', height: '56px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
            >
              🎓 AI 프리미엄 강의 시작
            </button>
          </div>
        )}

        {/* 문제 풀이 진입 버튼 (problem 상태일 때만 보임) */}
        {learningStep === 'problem' && (
          <button 
            onClick={() => setLearningStep('solve')} 
            style={{ width: '100%', height: '48px', background: '#3f3f46', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '0.8rem', cursor: 'pointer' }}
          >
            💬 스스로 풀이 시작하기 (질문 모드)
          </button>
        )}

        {/* 하단 입력창 (solve 상태일 때만 보임) */}
        {learningStep === 'solve' && (
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button onClick={toggleRecording} style={{ background: isRecording ? '#ef4444' : '#27272a', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Mic size={20} />
            </button>
            <input 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="풀이 과정에 대해 질문하세요..." 
              style={{ flex: 1, background: '#27272a', border: 'none', color: 'white', padding: '1rem', borderRadius: '24px', outline: 'none', fontSize: '1rem' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit(); }}
            />
            <button onClick={handleSubmit} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Send size={20} />
            </button>
          </div>
        )}

      </div>

      {/* ── 문제지 확대보기 풀스크린 모달 ── */}
      {expandedProblemImage && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setExpandedProblemImage(null)}
        >
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 3001 }}>
            <button 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => setExpandedProblemImage(null)}
            >
              <X size={24} />
            </button>
          </div>
          <div 
             style={{ width: '100%', height: '100%', padding: '3.5rem 1rem 1.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
             onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={expandedProblemImage} 
              alt="확대된 문제" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MathClassroomScreen() {
  const location = useLocation();
  const { teacherId } = useParams();
  const rawTeacherId = location.state?.teacher?.id || teacherId || 'h_math6';
  
  // Memoize teacher to prevent infinite loop since getTeacherById can return a new object (with resolved image) on every call
  const teacher = React.useMemo(() => {
    let t = location.state?.teacher || (teacherId ? getTeacherById(teacherId) : null);
    if (!t) {
      t = getTeacherById('h_math6') || { id: 'h_math6', name: '윤수아 선생님', courseName: '수학2 (미적분 기초)', targetGrades: ['고2'], targetRanks: ['3등급'] };
    }
    return t.id ? getTeacherById(t.id) : t;
  }, [rawTeacherId, location.state?.teacher, teacherId]);

  useEffect(() => {
    console.log('[MATH SCREEN LOADED]', teacher?.id);
  }, [teacher]);

  const [timeLeft, setTimeLeft] = useState(120 * 60);

  // 문제별 제한시간: 2단계=4분, 3단계=5분, 4단계=6분
  const getProblemTimeLimit = (unitName) => {
    if (!unitName) return 0;
    if (unitName.includes('2단계')) return 4 * 60;
    if (unitName.includes('3단계')) return 5 * 60;
    if (unitName.includes('4단계')) return 6 * 60;
    return 120; // default 2 minutes
  };
  const [problemTimeLeft, setProblemTimeLeft] = useState(0);

  useEffect(() => {
    console.log('[TIMER_START]');
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          console.log('[TIMER_TICK] 00:00');
          return 0;
        }
        const next = Math.max(0, prev - 1);
        const mins = String(Math.floor(next / 60)).padStart(2, '0');
        const secs = String(next % 60).padStart(2, '0');
        console.log(`[TIMER_TICK] ${mins}:${secs}`);
        return next;
      });
      setProblemTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);



  const overrides = React.useMemo(() => ({
    unitOverride: location.state?.unitOverride,
    phaseIndexOverride: location.state?.phaseIndexOverride
  }), [location.state?.unitOverride, location.state?.phaseIndexOverride]);

  // Hook 내부는 SSOT 객체를 받음
  const { session, setSession } = useMathLessonSession(teacher, overrides);
  const navigate = useNavigate();

  // 고1 선생님들(1,2,3번) 강제 고정 여부 확인
  const isG1Teacher = (teacher?.id === 'h_math1' || teacher?.id === 'h_math2' || teacher?.id === 'h_math3' || teacher?.id === 'math1' || teacher?.id === 'math2' || teacher?.id === 'math3') || 
                      (teacher?.targetGrades?.some(g => g.includes('고1')));

  // 고2 선생님들(4,5,6번) 강제 고정 여부 확인
  const isG2Teacher = (teacher?.id === 'h_math4' || teacher?.id === 'h_math5' || teacher?.id === 'h_math6' || teacher?.id === 'h_math_calc' || teacher?.id === 'math4' || teacher?.id === 'math5' || teacher?.id === 'math6') || 
                      (teacher?.targetGrades?.some(g => g.includes('고2'))) ||
                      (teacher?.courseName?.includes('대수'));

  // 고3 선생님들(7,8,9번) 확인
  const isG3Teacher = (teacher?.id === 'h_math7' || teacher?.id === 'h_math8' || teacher?.id === 'h_math9' || teacher?.id === 'math7' || teacher?.id === 'math8' || teacher?.id === 'math9') || 
                      (teacher?.targetGrades?.some(g => g.includes('고3') || g.includes('N수')));

  // 강좌 정보 및 등급별 UI State
  const [openSections, setOpenSections] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [testProblemIdx, setTestProblemIdx] = useState(1);

  // 문제 전환 시 문제 타이머 리셋
  useEffect(() => {
    setProblemTimeLeft(getProblemTimeLimit(selectedUnit));
  }, [testProblemIdx, selectedUnit]);

  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (location.state?.elective) return location.state.elective;
    if (isG2Teacher) return '수1';
    if (isG1Teacher) return '수학상';
    if (isG3Teacher) {
      const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
      if (saved) return saved;
      return '수2';
    }
    const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
    if (saved) return saved;
    return '수1';
  });

  // ── getSidebarData 함수 및 sidebarData 선언 (TDZ 방지 위해 일반 function 호이스팅 및 상단 배치) ──
  function getSidebarData() {
    if (!session) return { title: '', sections: [] };
    const ranks = session.rank || [];
    const isTopRank = ranks.some(r => r.includes('1등급') || r.includes('2등급'));
    const isMidRank = ranks.some(r => r.includes('3등급') || r.includes('4등급') || r.includes('5등급'));

    let levels = ['2단계', '3단계', '4단계'];
    const tId = teacher?.id || '';
    if (tId === 'h_math1' || tId === 'math1' || tId === 'h_math4' || tId === 'math4') {
      levels = ['3단계', '4단계'];
    } else if (tId === 'h_math2' || tId === 'math2' || tId === 'h_math5' || tId === 'math5') {
      levels = ['2단계', '3단계', '4단계'];
    } else if (tId === 'h_math3' || tId === 'math3' || tId === 'h_math6' || tId === 'math6') {
      levels = ['2단계', '3단계'];
    } else if (isTopRank && !ranks.includes('4등급') && !ranks.includes('5등급')) {
      levels = ['3단계', '4단계']; // 최상위권은 3단계부터
    }

    if (selectedCourse === '미적분') {
      return {
        title: 'Premium 미적분 (고3 전용)',
        sections: [
          { name: '1. 수열의 극한', items: ['[2단계] 수열의극한', '[4단계] 수열의극한'] },
          { name: '2. 급수', items: ['[2단계] 급수', '[4단계] 급수'] },
          { name: '3. 지수/로그/삼각함수 극한과 미분', items: ['[2단계] 지수로그함수의극한', '[2단계] 삼각함수합성과 여러 가지 공식', '[4단계] 지수로그삼각함수 미분'] },
          { name: '4. 여러가지 미분법', items: ['[2단계] 여러가지미분법2', '[4단계] 여러가지 미분법'] },
          { name: '5. 도함수의 활용', items: ['[2단계] 도함수의활용1', '[2단계] 도함수의활용2', '[4단계] 도함수의 활용'] },
          { name: '6. 여러가지 함수의 적분', items: ['[2단계] 여러가지 적분법', '[4단계] 여러가지 함수의 적분'] },
          { name: '7. 초월함수의 정적분 및 활용', items: ['[2단계] 초월함수의 정적분', '[4단계] 정적분의 활용'] }
        ]
      };
    } 
    
    if (selectedCourse === '확률과통계' || selectedCourse === '수능확통') {
      return {
        title: '확률과 통계 (고3 수능 전용)',
        sections: [
          { name: '수능 대비 실전', items: [
             '1)순열', '2)중복조합', '3)이항정리', '4)확률의뜻', '5)덧셈정리_조건부확률_독립시행', '6)확률변수와이항분포', '7)연속확률분포와정규분포', '8)표본평균과모평균'
          ]}
        ]
      };
    }

    if (selectedCourse === '모의고사') {
      return {
        title: '멘토스 모의고사 (총 12회)',
        sections: [
          { name: '제 1~3회 (6월 모평)', items: ['제 1회 고3 6월 모의고사 (2025)', '제 2회 고3 6월 모의고사 (2024)', '제 3회 고3 6월 모의고사 (2023)'] },
          { name: '제 4~6회 (수능 기출)', items: ['제 4회 고3 수능 기출 (2025)', '제 5회 고3 수능 기출 (2024)', '제 6회 고3 수능 기출 (2023)'] },
          { name: '제 7~9회 (9월 모평)', items: ['제 7회 고3 9월 모의고사 (2025)', '제 8회 고3 9월 모의고사 (2024)', '제 9회 고3 9월 모의고사 (2023)'] },
          { name: '제 10~12회 (3월 학평)', items: ['제 10회 고3 3월 학평 (2026)', '제 11회 고3 3월 학평 (2025)', '제 12회 고3 3월 학평 (2024)'] }
        ]
      };
    }

    if (selectedCourse === '수2' || selectedCourse === '수학2') {
      return {
        title: '수학2 (미적분 기초)',
        sections: [
          { name: '1. 함수의 극한', items: ['함수의 극한 2단계', '함수의극한3단계', '함수의극한4단계'] },
          { name: '2. 함수의 연속', items: ['함수의 연속 2단계', '함수의연속3단계', '함수의연속4단계', '연속까자 모의고사'] },
          { name: '3. 미분계수', items: ['미분계수 2단계', '미분계수3단계', '미분계수4단계'] },
          { name: '4. 도함수의 활용', items: ['도함수의 활용1 2단계', '미분의활용 2단계', '도함수의활용3단계', '도함수의 활용 4단계'] },
          { name: '5. 부정적분과 정적분', items: ['부정적분과 정적분 2단계', '부정적분과 정적분 3단계', '부정적분과 정적분 4단계'] },
          { name: '6. 정적분의 활용', items: ['정적분의 활용 3단계', '정적분의 활용 4단계'] }
        ]
      };
    }

    if (selectedCourse === '수학상') {
      return {
        title: '고1 수학(상) 전체',
        sections: [
          { name: '다항식', items: levels.map(l => `다항식${l}`) },
          { name: '항등식과 나머지정리', items: levels.map(l => `항등식과나머지정리${l}`) },
          { name: '인수분해', items: levels.map(l => `인수분해${l}`) },
          { name: '복소수', items: levels.map(l => `복소수${l}`) },
          { name: '이차방정식', items: levels.map(l => `이차방정식${l}`) },
          { name: '이차방정식과 이차함수', items: levels.map(l => `이차방정식과이차함수${l}`) },
          { name: '고차방정식', items: levels.map(l => `고차방정식${l}`) },
          { name: `일차부등식`, items: levels.map(l => `일차부등식${l}`) },
          { name: `이차부등식`, items: levels.map(l => `이차부등식${l}`) },
          { name: `경우의수`, items: levels.map(l => `경우의수${l}`) },
          { name: `행렬`, items: levels.map(l => `행렬${l}`) },
          { name: `점과좌표`, items: levels.map(l => `점과좌표${l}`) },
          { name: `직선의방정식`, items: levels.map(l => `직선의방정식${l}`) },
          { name: `원의방정식`, items: levels.map(l => `원의방정식${l}`) },
          { name: `도형의이동`, items: levels.map(l => `도형의이동${l}`) }
        ]
      };
    }

    return {
      title: '수학1 (대수) 전체',
      sections: [
        { name: '지수', items: levels.map(l => `지수${l}`) },
        { name: `로그`, items: levels.map(l => `로그${l}`) },
        { name: `지수함수`, items: levels.map(l => `지수함수${l}`) },
        { name: `로그함수`, items: levels.map(l => `로그함수${l}`) },
        { name: '삼각함수성질', items: levels.filter(l => l !== '4단계').map(l => `삼각함수성질${l}`) },
        { name: `삼각함수그래프`, items: levels.map(l => `삼각함수그래프${l}`) },
        { name: '삼각함수의 활용', items: levels.map(l => l === '4단계' ? '삼각함수활용 4단계(68)' : `삼각함수활용${l}`) },
        { name: `등차등비수열`, items: levels.map(l => `등차등비${l}`) },
        { name: `시그마용법`, items: levels.map(l => `시그마용법${l}`) },
        { name: `귀납적정의`, items: levels.map(l => `귀납적정의${l}`) }
      ]
    };
  }

  const sidebarData = getSidebarData();

  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem(`last_course_${teacher?.id || 'default'}`, selectedCourse);
    }
  }, [selectedCourse, teacher]);

  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  useEffect(() => {
    if (session) {
      console.log("[MathClassroomScreen] Pure SSOT Session Started");
    }
  }, [!!session]);

  if (!session) return <Loading />;
  if (session.flow.length === 0) return <Loading />;

  // 1. flow의 첫 단계 상태가 homework_gate 이면 Gate UI 렌더
  const currentPhase = session.flow[session.currentPhaseIndex]?.phase;
  
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', position: 'relative' }}>
      
      {/* Dual Timer Overlay */}
      <style>{`
        @keyframes timerPulseMobile {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
          100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(245, 158, 11, 0.9); }
        }
      `}</style>
      <div style={{ position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 99999, pointerEvents: 'none' }}>
        {/* Global Session Timer */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(239, 68, 68, 0.5)',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
          color: '#fee2e2',
          padding: '0.4rem 1.6rem',
          borderRadius: '30px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'monospace',
          fontSize: '0.95rem',
          letterSpacing: '0.5px',
          textShadow: '0 0 6px rgba(239, 68, 68, 0.5)'
        }}>
          <Clock size={15} color="#f87171" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fca5a5', fontFamily: 'sans-serif', marginRight: '2px', whiteSpace: 'nowrap' }}>수업시간</span>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        
        {/* Problem Timer */}
        {problemTimeLeft > 0 && (
          <div style={{
            background: problemTimeLeft <= 60 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            border: problemTimeLeft <= 60 ? '1.5px solid rgba(245, 158, 11, 0.9)' : '1.5px solid rgba(59, 130, 246, 0.5)',
            boxShadow: problemTimeLeft <= 60 ? '0 8px 24px rgba(245, 158, 11, 0.4)' : '0 8px 24px rgba(59, 130, 246, 0.25)',
            color: problemTimeLeft <= 60 ? '#ffffff' : '#dbeafe',
            padding: '0.4rem 1.6rem',
            borderRadius: '30px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'monospace',
            fontSize: '0.95rem',
            letterSpacing: '0.5px',
            textShadow: problemTimeLeft <= 60 ? '0 0 6px rgba(255,255,255,0.6)' : '0 0 6px rgba(59, 130, 246, 0.5)',
            animation: problemTimeLeft <= 60 ? 'timerPulseMobile 0.8s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <Clock size={15} color={problemTimeLeft <= 60 ? '#ffffff' : '#60a5fa'} />
            {String(Math.floor(problemTimeLeft / 60)).padStart(2, '0')}:{String(problemTimeLeft % 60).padStart(2, '0')}
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: problemTimeLeft <= 60 ? '#ffffff' : '#93c5fd', fontFamily: 'sans-serif', marginLeft: '4px', whiteSpace: 'nowrap' }}>(1문항)</span>
          </div>
        )}
      </div>

      <LessonRenderer 
        session={session} 
        setSession={setSession} 
        ssot={teacher} 
        timeLeft={timeLeft} 
        selectedUnit={selectedUnit} 
        setSelectedUnit={setSelectedUnit} 
        testProblemIdx={testProblemIdx} 
        setTestProblemIdx={setTestProblemIdx} 
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        sidebarData={sidebarData}
        isG1Teacher={isG1Teacher}
        isG2Teacher={isG2Teacher}
        isG3Teacher={isG3Teacher}
      />
    </div>
  );
}