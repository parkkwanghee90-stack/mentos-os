import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Send, ChevronRight, CheckCircle, Smartphone, Mic, Volume2, Upload, Paperclip, Clock, BookOpen, X } from 'lucide-react';
import { getTeacherById } from '@/data/teacherProfiles';
import { useMathLessonSession } from '@/hooks/useMathLessonSession';
import { getPendingMathHomework, getMathAssistantFeedbackForNextClass } from '@/engine/math/assistantReviewEngine';
import { queueParentPush } from '@/services/pushService';
import { HomeworkEngine } from '@/engine/homeworkEngine';
import { tutorChat } from '@/services/openaiChatApi';
import { saveResult } from '@/services/lessonResultStore';
import { finalizeMathSession } from '@/engine/math/finalizeSession';
import { buildMathSystemPrompt, PCBS_INITIAL_STATE, PCBS_SSOT } from '@/data/mathPCBS_SSOT';
import { ChevronDown } from 'lucide-react';
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
import PremiumLectureModal from '@/components/lectures/PremiumLectureModal';

// Trigger fresh Vercel build

const ErrorScreen = ({ text }) => <div style={{ color: 'red', padding: '2rem', background: '#09090b', height: '100vh' }}>🚨 {text}</div>;
const Loading = () => <div style={{ color: 'white', padding: '2rem', background: '#09090b', height: '100vh' }}>Loading V2 Engine...</div>;

function useSTT(setInput) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (e) => {
        console.error("STT Error:", e);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setInput]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return { isRecording, toggleRecording };
}



function LessonRenderer({ session, setSession, ssot, timeLeft, selectedUnit }) {
  const currentPhaseFlow = session.flow[session.currentPhaseIndex];
  
  const [readingState, setReadingState] = useState({
    subPhase: 'intro', // intro -> passage_1 -> passage_2 -> passage_3 -> summary -> complete
    questionCount: 0
  });

  // ── PCBS 단계 상태 (P → C → B → SOLVE → S) ──
  const [pcbsPhase, setPcbsPhase] = useState('P');
  // 각 문제마다 PCBS 진행 턴 수 추적
  const [pcbsTurnCount, setPcbsTurnCount] = useState(0);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploadedProblem, setUploadedProblem] = useState(null);
  const { isRecording, toggleRecording } = useSTT(setInput);
  const navigate = useNavigate();
  const [testProblemIdx, setTestProblemIdx] = useState(1);

  // 개념카드 전역 상태 및 모달 제어
  const [globalCards, setGlobalCards] = useState([]);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [selectedExpandedCard, setSelectedExpandedCard] = useState(null);
  const [showPremiumLecture, setShowPremiumLecture] = useState(false);

  // 제로-코스트 루프용 상태
  const [currentPcbsData, setCurrentPcbsData] = useState(null);
  const [problemStatus, setProblemStatus] = useState('solving'); // solving, hinted, asking
  const [showFireworks, setShowFireworks] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  const [expandedProblemImage, setExpandedProblemImage] = useState(null);
  const [precomputedAnims, setPrecomputedAnims] = useState({});

  // ── 현재 단원명(unit) 추출 로직 ──
  let currentUnit = null;
  let currentProblemImage = null;
  let currentProblemTitle = null;

  if (session.curriculumData?.lessonContent) {
    const phaseKey = currentPhaseFlow?.phase?.toLowerCase();
    const phaseData = session.curriculumData.lessonContent[phaseKey];
    if (phaseData) {
      const strData = JSON.stringify(phaseData);
      const match = strData.match(/math_indexed\/([^/]+)/);
      if (match) currentUnit = match[1];
      
      // 만약 동적으로 overrides에서 넘겨받은 원본 유닛 이름이 있다면 그걸 우선 사용!
      if (phaseData.original_unit) {
         currentUnit = phaseData.original_unit;
      }

      const formattedIdx = String(testProblemIdx).padStart(3, '0');
      if (typeof currentUnit === 'string' && (currentUnit.includes('삼각함수의 활용') || currentUnit.includes('삼각함수활용'))) {
         const stepMatch = currentUnit.match(/(\d+)단계/);
         const stepStr = stepMatch ? stepMatch[0] : '3단계';
         currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수활용${stepStr}/${formattedIdx}.webp`)
      } else if (phaseData.problem_image) {
         currentProblemImage = phaseData.problem_image.replace(/\d{3}\./, `${formattedIdx}.`);
      }
      if (phaseData.title) {
         currentProblemTitle = phaseData.title + ` [${testProblemIdx}번]`;
      }
    }
  }

  // 사용자가 사이드바에서 특정 단원을 강제로 선택한 경우 이미지 파싱
  if (selectedUnit) {
     currentUnit = selectedUnit;
     const formattedIdx = String(testProblemIdx).padStart(3, '0');
     // [대수 매핑]
     // 단계 추출 (예: '삼각함수활용4단계' -> '4단계'). 없으면 기본 '2단계'
     const stepMatch = currentUnit.match(/(\d+)단계/);
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
     else if (currentUnit.includes('활용')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수활용${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('그래프')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/삼각함수그래프/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수그래프${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('정의') || currentUnit.includes('성질')) currentProblemImage = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수성질${stepStr}/${formattedIdx}.webp`)
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
     else currentProblemImage = window.resolveAsset(`/math_crops/${currentUnit}/${formattedIdx}.webp`)
     
     if (currentProblemImage) {
        if (!currentProblemImage.includes('?')) {
           currentProblemImage += `?v=20260429_v4`;
        }
     } else {
        currentProblemImage = null;
     }
     currentProblemTitle = `${currentUnit} [${testProblemIdx}번]`;
  }

  useEffect(() => {
    Promise.all([
      fetch(window.resolveAsset('/concept_cards/global_metadata.json')).then(res => res.json()).catch(() => []),
      fetch(window.resolveAsset('/concept_cards/dynamic_concepts.json')).then(res => res.json()).catch(() => []),
      fetch(window.resolveAsset('/concept_cards/animations_math4.json')).then(res => res.json()).catch(() => ({}))
    ]).then(([globalData, dynamicData, animsData]) => {
      setPrecomputedAnims(animsData);
      const dynamicUnits = new Set(dynamicData.map(d => d.unit));
      const filteredGlobal = globalData.filter(d => {
        if (!d.linked_problem_folders) return true;
        // Exclude if ANY of its linked folders starts with a dynamic unit (e.g. "일차부등식/2" overlaps "일차부등식")
        return !d.linked_problem_folders.some(folder => {
          const baseUnit = folder.split('/')[0];
          return dynamicUnits.has(baseUnit) || dynamicUnits.has(folder);
        });
      });
      setGlobalCards([...filteredGlobal, ...dynamicData]);
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
      const phaseLabel = phaseName === 'core' ? '핵심 개념' : phaseName === 'step' ? '단계별 문제 풀이' : '미니 모의고사';
      initialMessages.push({
        role: 'assistant',
        content: `[${phaseLabel}] 새 문제를 시작합니다.\n\n구하고자 하는 것이 무엇인가요?`,
      });
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

    // 다음 상태로 진행
    setSession({ ...session, currentPhaseIndex: session.currentPhaseIndex + 1 });
  };

  // ── [슈퍼 관리자 검수용] 강제 스킵 ──
  const testAdvance = () => {
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

  useEffect(() => {
    if (!currentUnit || !currentPhaseFlow?.phase) return;
    const loadPcbs = async () => {
      try {
        const levelMap = { 'core': 1, 'step': 2, 'mock': 3 }; 
        const phaseLevel = levelMap[currentPhaseFlow.phase] || 2; 
        const folderName = `${currentUnit}${phaseLevel}단계`;
        const pid = String(testProblemIdx).padStart(3, `0`);
        const url = `/math_pcbs_cache/${folderName}/${pid}_pcbs.json`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCurrentPcbsData(data);
          setUsedHint(false);
          setPcbsPhase('P');
          const phaseLabel = currentPhaseFlow.phase === 'core' ? '핵심 개념' : currentPhaseFlow.phase === 'step' ? '단계별 문제 풀이' : '미니 모의고사';
          setMessages([{ role: 'assistant', content: `[${phaseLabel}] 새 문제를 시작합니다.\n\n구하고자 하는 것이 무엇인가요?` }]);
        } else {
          setCurrentPcbsData(null);
          const phaseLabel = currentPhaseFlow.phase === 'core' ? '핵심 개념' : currentPhaseFlow.phase === 'step' ? '단계별 문제 풀이' : '미니 모의고사';
          setMessages([{ role: 'assistant', content: `[${phaseLabel}] 새 문제를 시작합니다.\n\n구하고자 하는 것이 무엇인가요?` }]);
        }
      } catch (e) {
        setCurrentPcbsData(null);
      }
    };
    loadPcbs();
  }, [testProblemIdx, currentPhaseFlow?.phase, currentUnit]);

  const handeSubmit = async () => {
    if (!input.trim() && !isRecording) return;
    if (loading) return;

    if (isRecording) {
      toggleRecording();
    }

    const rawInput = input.trim();
    const skipMatch = rawInput.replace(/\s+/g, '').match(/^(다음|다음문제|다음거|넘어가|패스|스킵|다른문제|풀었어다음)$/i) || rawInput.includes('다음 문제 보여줘');
    if (skipMatch && !rawInput.includes('?')) {
      setInput('');
      setUploadedProblem(null);
      setMessages(prev => [...prev, { role: 'user', content: rawInput }, { role: 'assistant', content: '알겠어! 요청에 따라 다음 문제로 넘어갈게.' }]);
      setTimeout(() => {
        testAdvance();
      }, 1000);
      return;
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
    if (isMathPhase && !currentPcbsData) {
      advancePcbsPhase(input);
    }

    const userMessage = { 
      role: 'user', 
      content: uploadedProblem ? `[문제 이미지 첨부됨]\n${input}` : input 
    };
    setInput('');
    setUploadedProblem(null);
    setLoading(true);

    // UI 업데이트
    setMessages(prev => [...prev, userMessage]);

    // ── 제로 코스트 오토롤링 채점 로직 ──
    if (currentPcbsData) {
      if (pcbsPhase === 'P') {
        setMessages(prev => [...prev, { role: 'assistant', content: '주어진 것은 무엇인가요?' }]);
        setPcbsPhase('C');
        setLoading(false);
        return;
      } else if (pcbsPhase === 'C') {
        setMessages(prev => [...prev, { role: 'assistant', content: '배경 단원(개념)은 어디인가요?' }]);
        setPcbsPhase('B');
        setLoading(false);
        return;
      } else if (pcbsPhase === 'B') {
        setMessages(prev => [...prev, { role: 'assistant', content: '그럼 이제 이걸 생각하면서 문제를 풀어볼까요? 잘 모르겠으면 오른쪽 위 ✨애니메이션 힌트를 누르고, 힌트를 보지 않고 문제를 풀 수 있다면 답을 주세요.' }]);
        setPcbsPhase('SOLVE');
        setProblemStatus('solving');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const evalSys = `실제정답:[${currentPcbsData.final_answer || '없음'}]. 학생답변:[${input}]. 입력이 수학적 동치 수식이거나 정답이 틀림없이 맞으면 'CORRECT', 답을 적었는데 틀렸으면 'INCORRECT', 질문이나 도움 요청(모르겠어요 등)이면 'QUESTION', 학생이 정답 제출 없이 '다음 문제 보여줘', '패스' 등으로 넘어가기를 원하면 'NEXT'만을 출력하라. 부가설명 금지.`;
        const res = await tutorChat({ messages: [{ role: 'system', content: evalSys }] });
        const evalStr = (res.reply || '').toUpperCase();
        
        if (evalStr.includes('CORRECT')) {
           if (!usedHint) {
             setMessages(prev => [...prev, { role: 'assistant', content: '🎉 완벽합니다!! 힌트 없이 정답을 맞추셨습니다! 정답 처리됩니다. (잠시 후 다음 문제로 처리 및 이동합니다)' }]);
             saveResult({ subject: '수학', unit: currentUnit, totalQuestions: 1, correctCount: 1, grade: session.grade?.[0] });
             setShowFireworks(true);
             setTimeout(() => {
                setShowFireworks(false);
                testAdvance();
             }, 3500);
           } else {
             setMessages(prev => [...prev, { role: 'assistant', content: '정답입니다! 하지만 힌트를 시청했으므로 이번 문제는 오답(세모)으로 시스템에 기록됩니다. (잠시 후 다음 문제로 자동 이동합니다)' }]);
             saveResult({ subject: '수학', unit: currentUnit, totalQuestions: 1, correctCount: 0, mistakeTags: ['힌트의존'], grade: session.grade?.[0] });
             setTimeout(() => {
                testAdvance();
             }, 3500);
           }
           return;
        } else if (evalStr.includes('NEXT')) {
           setMessages(prev => [...prev, { role: 'assistant', content: '알겠어! 다음 문제로 넘어갈게.' }]);
           setTimeout(() => {
              testAdvance();
           }, 1000);
           return;
        } else if (evalStr.includes('INCORRECT')) {
           if (problemStatus === 'solving') {
             setProblemStatus('hinted');
             const pid = String(testProblemIdx).padStart(3, '0');
             const stepMatch = currentUnit?.match(/(\d+)단계/);
             const stepStr = stepMatch ? stepMatch[0] : '3단계';
             const correctHintUnit = currentUnit?.includes('삼각함수') && currentUnit?.includes('활용') ? `삼각함수활용${stepStr}` : currentUnit;
             setMessages(prev => {
                const cleaned = prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m);
                return [...cleaned, { 
                  role: 'assistant', 
                  content: '앗, 아쉽게도 오답입니다! 😅\n\nAI가 생성한 단계별 해설 애니메이션 영상을 띄워드릴게요. 과정을 보고 스스로 교정해보세요! 영상을 봐도 이해가 안 간다면 선생님에게 질문하세요.',
                  hintPlayer: { unit: correctHintUnit, problemId: pid }
                }];
             });
             return;
           } else {
             setMessages(prev => [...prev, { role: 'assistant', content: '또 틀렸네요. 구체적으로 어떤 식을 세웠는지 저에게 질문 형태로 알려주시면 선생님이 교정해줄게요!' }]);
             return;
           }
        } else {
           // QUESTION 인 경우
           setProblemStatus('asking');
        }
      } catch (e) {
         console.warn("오토롤링 채점 에러 -> 풀 API 호출로 fallback", e);
      } finally {
        setLoading(false);
      }
    }

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
      const animKey = `${currentUnit}_${currentPhaseFlow?.phase}`;

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

    // 1. 사용자가 힌트를 요구하거나 "모르겠어요" 라고 할 때, HintPlayer 최우선
    const isHintReq = input.includes('모르') || input.includes('어렵') || input.includes('힌트') || input.includes('안 풀');
    if (isHintReq) {
      setTimeout(() => {
        const pid = String(testProblemIdx).padStart(3, '0');
        const stepMatch = currentUnit?.match(/(\d+)단계/);
        const stepStr = stepMatch ? stepMatch[0] : '3단계';
        const correctHintUnit = currentUnit?.includes('삼각함수') && currentUnit?.includes('활용') ? `삼각함수활용${stepStr}` : currentUnit;
        setUsedHint(true);
        setMessages(prev => {
          const cleaned = prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m);
          return [...cleaned, { 
            role: 'assistant', 
            content: '문제 풀이가 막히셨나요? 전혀 걱정하지 마세요! AI가 이 실전 문제의 해설지 흐름을 **라이브 다이내믹 힌트 플레이어**로 준비해 두었습니다. 영상을 유심히 보고 힌트를 얻어보세요!',
            hintPlayer: { unit: correctHintUnit, problemId: pid }
          }];
        });
        setLoading(false);
      }, 1500);
      return; 
    }

    // 2. 랜덤 애니메이션 강제 주입 로직 제거됨 (PCBS 흐름 붕괴 원인)

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#09090b', color: 'white' }}>
      <div style={{ padding: '1rem', background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        </div>
        {/* 폭죽 이펙트 오버레이 */}
        {showFireworks && (
          <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', pointerEvents:'none', zIndex:99999, display:'flex', justifyContent:'center', alignItems:'center', background:'rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '10rem', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}>🎉</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {(['core', 'step', 'mock'].includes(currentPhaseFlow?.phase) || selectedUnit) && (
              <button 
                onClick={() => {
                  const targetUnit = selectedUnit || currentUnit;
                  if (targetUnit) {
                    setUsedHint(true);
                    setMessages(prev => {
                      const cleaned = prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m);
                      const pid = String(testProblemIdx).padStart(3, '0');
                      return [...cleaned, { 
                        role: 'assistant', 
                        content: '', 
                        hintPlayer: { unit: targetUnit, problemId: pid }
                      }];
                    });
                  } else {
                    setMessages(prev => [...prev, { role: 'system', content: '선택된 단원이 없습니다. 좌측 메뉴에서 학습할 세부 단원을 먼저 선택해주세요.' }]);
                  }
                }}
                className="hover-scale"
                style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
              >
                <span role="img" aria-label="sparkles">✨</span> AI Vision Solution
              </button>
            )}

            <button 
              className="btn-primary hover-scale" 
              onClick={() => setShowPremiumLecture(true)}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              👑 프리미엄 AI 강의 노트
            </button>

            <button className="btn-secondary" onClick={testAdvance} style={{ background: '#ef4444', color: 'white', fontWeight: 'bold' }}>
              다음 ({testProblemIdx+1}번) <ChevronRight size={14}/>
            </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {(currentProblemImage || currentProblemTitle) && (
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
              [{currentProblemTitle || '오늘의 실전 문제'}]
            </h3>
            {currentProblemImage && (
              <img 
                 src={currentProblemImage} 
                 alt="오늘의 문제" 
                 onClick={() => setExpandedProblemImage(currentProblemImage)}
                 className="hover-scale"
                 style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', cursor: 'zoom-in', transition: 'transform 0.2s' }} 
                 onError={(e) => { 
                   e.target.style.display = 'none'; 
                   e.target.parentElement.insertAdjacentHTML('beforeend', '<div style="padding: 3rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; color: #64748b; text-align: center; width: 100%;">⚠️ 해당 단계의 문제 이미지가 서버에 아직 업로드되지 않았습니다. (데이터 구축 예정)</div>');
                 }}
              />
            )}
          </div>
        )}

        {uploadedProblem && (
          <div style={{ padding: '1rem', background: '#1e1b4b', border: '1px dashed #6366f1', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={uploadedProblem} alt="Upload Preview" style={{ height: '80px', borderRadius: '4px' }} />
            <div>
              <p style={{ color: '#818cf8', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>📤 외부 문제 업로드 대기중</p>
              <p style={{ fontSize: '0.85rem', color: '#a5b4fc', margin: 0 }}>메시지를 전송하면 선생님이 해당 문제를 기준으로 해설을 시작합니다.</p>
            </div>
          </div>
        )}

        {(() => {
          const lastAssistantIdx = messages.findLastIndex(m => m.role === 'assistant');
          const relevantMessages = lastAssistantIdx >= 0 ? messages.slice(lastAssistantIdx) : messages;
          
          // 전역으로 유지해야 할 애니메이션 데이터를 탐색 (채팅 텍스트가 덮어써져도 힌트는 화면 하단 고정)
          const activeHintMsg = messages.findLast(m => m.hintPlayer || m.animationId || m.dynamicData);

          return (
            <>
              {relevantMessages.map((m, idx) => {
                if (m.role === 'system') {
                   return <div key={idx} style={{ textAlign: 'center', color: '#818cf8', fontSize: '0.85rem', margin: '1rem 0' }}>{m.content}</div>;
                }
                return (
                  <div key={idx} style={{ textAlign: m.role === 'user' ? 'right' : 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '1rem 1.5rem', 
                      borderRadius: '12px', 
                      background: m.role === 'user' ? '#3b82f6' : '#27272a', 
                      maxWidth: '85%', 
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      textAlign: 'left'
                    }}>
                      {m.content ? (
                        <>
                          <strong>{m.role === 'user' ? '나' : ssot.name}:</strong><br/>
                          {m.content}
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              
              {/* 애니메이션 힌트 플레이어 단일 고정 렌더링 */}
              {activeHintMsg && (
                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                  {activeHintMsg.animationId === 'sine_rule' && <div style={{marginTop: '0.5rem'}}><SineRuleAnimation /></div>}
                  {activeHintMsg.animationId === 'cosine_rule' && <div style={{marginTop: '0.5rem'}}><CosineRuleAnimation /></div>}
                  {activeHintMsg.animationId === 'triangle_area' && <div style={{marginTop: '0.5rem'}}><TriangleAreaAnimation /></div>}
                  {activeHintMsg.dynamicData && <div style={{marginTop: '0.5rem'}}><DynamicProblemAnimation data={activeHintMsg.dynamicData} /></div>}
                  {activeHintMsg.hintPlayer && <div style={{marginTop: '0.5rem'}} key={`hint-${activeHintMsg.hintPlayer.problemId}`}><HintPlayerRouter unit={activeHintMsg.hintPlayer.unit} problemId={activeHintMsg.hintPlayer.problemId} showQA={false} /></div>}
                </div>
              )}
            </>
          );
        })()}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 하단 고정 입력 바 */}
      <div className="math-input-bar" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #27272a', background: '#18181b' }}>
        <div style={{ marginBottom: '0.8rem', color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          <BookOpen size={16} style={{ marginRight: '6px', color: '#3b82f6' }}/>
          <strong>안내:</strong> 현재 단계({currentPhaseFlow.title})의 문제를 확인하고 풀이 과정이나 단서를 질문(입력)하세요.
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
           <label style={{ cursor: 'pointer', padding: '0.8rem', borderRadius: '12px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', border: '1px solid transparent' }} title="문제 올리기">
             <Paperclip size={20} color="#a1a1aa" />
             <input type="file" hidden accept="image/*,.pdf" onChange={handleProblemUpload} />
           </label>
           
           <input 
              type="text" 
              placeholder="답변을 입력하세요..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handeSubmit()}
              style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff' }} 
           />
           
           <button 
              title="음성 입력 마이크"
              style={{ padding: '0.8rem', borderRadius: '12px', background: isRecording ? '#ef4444' : '#27272a', border: isRecording ? 'none' : '1px solid #3f3f46', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
              onClick={toggleRecording}
           >
             <Mic size={20} color={isRecording ? "white" : "#a1a1aa"} />
           </button>

            <button className="btn-primary" onClick={handeSubmit} disabled={loading} style={{ padding: '0 1.5rem', borderRadius: '12px', height: '100%', display: 'flex', alignItems: 'center' }}>
             {loading ? '...' : <><Send size={18} style={{marginRight: '6px'}}/> 전송</>}
           </button>
        </div>
      </div>

      {/* ── 개념카드 전용 오버레이 모달 ── */}
      {showConceptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#18181b', borderRadius: '16px', width: '80%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid #3f3f46', overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', background: '#27272a' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#3b82f6" /> 
                [{isSenior ? '통합 수학 전체' : currentUnit}] 개념카드
              </h3>
              <button 
                onClick={() => setShowConceptModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredCards.length > 0 ? (
                filteredCards.map((card, idx) => (
                  <div 
                    key={card.id || idx} 
                    style={{ background: '#09090b', borderRadius: '12px', border: '1px solid #3f3f46', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'zoom-in', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => setSelectedExpandedCard(card)}
                  >
                    <div style={{ padding: '0.8rem', background: '#27272a', borderBottom: '1px solid #3f3f46', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                      [{card.unit || '공통'}] {card.title || card.card_title || '무제 개념'}
                    </div>
                    <div style={{ flex: 1, background: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '0.9rem', overflow: 'hidden' }}>
                      {card.content ? (
                        <div style={{ width: '100%', pointerEvents: 'none' }}>
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{card.content}</ReactMarkdown>
                        </div>
                      ) : (
                      <img 
                        src={window.resolveAsset(`/concept_cards/${card.image_path}`)} 
                        alt={card.card_title} 
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} 
                        loading="lazy"
                      />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                  현재 단원({currentUnit})에 매칭되는 개념카드가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 개념카드 1장 전체화면 확대 모달 ── */}
      {selectedExpandedCard && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelectedExpandedCard(null)}
        >
          <div 
             style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto', color: 'black', position: 'relative', cursor: 'auto' }}
             onClick={(e) => e.stopPropagation()}
          >
            {selectedExpandedCard.content ? (
              <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
                <h2>{selectedExpandedCard.title || selectedExpandedCard.card_title}</h2>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedExpandedCard.content}</ReactMarkdown>
                {selectedExpandedCard.id === 'trig_app_01_proof' && <SineRuleAnimation />}
                {selectedExpandedCard.id === 'trig_app_02_proof' && <CosineRuleAnimation />}
                {selectedExpandedCard.id === 'trig_app_03_proof' && <TriangleAreaAnimation />}
              </div>
            ) : (
              <img 
                src={window.resolveAsset(`/concept_cards/${selectedExpandedCard.image_path}`)} 
                alt={selectedExpandedCard.card_title} 
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
              />
            )}
          </div>
          <button 
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onClick={(e) => { e.stopPropagation(); setSelectedExpandedCard(null); }}
            title="닫기"
          >
            <X size={36} />
          </button>
        </div>
      )}

      {/* ── 문제지 확대보기 풀스크린 모달 ── */}
      {expandedProblemImage && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setExpandedProblemImage(null)}
        >
          <div 
             style={{ background: 'white', padding: '1rem', borderRadius: '12px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto', position: 'relative', cursor: 'auto' }}
             onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={expandedProblemImage} 
              alt="확대된 문제" 
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
            />
          </div>
          <button 
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onClick={() => setExpandedProblemImage(null)}
          >
            <X size={32} />
          </button>
        </div>
      )}
      {/* ── 프리미엄 AI 강의 모달 ── */}
      {showPremiumLecture && (
        <PremiumLectureModal onClose={() => setShowPremiumLecture(false)} />
      )}

    </div>
  );
}

export default function MathClassroomScreen() {
  const location = useLocation();
  const teacher = location.state?.teacher;

  useEffect(() => {
    console.log('[MATH SCREEN LOADED]');
  }, []);

  const [timeLeft, setTimeLeft] = useState(60 * 60);

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
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!teacher) {
    return <ErrorScreen text="선생님(teacher) 세션 정보가 없습니다. 정상적인 경로로 진입해주세요." />;
  }

  // Hook 내부는 SSOT 객체를 받음
  const { session, setSession } = useMathLessonSession(teacher, {
    unitOverride: location.state?.unitOverride,
    phaseIndexOverride: location.state?.phaseIndexOverride
  });
  const navigate = useNavigate();

  // 사이드바 구조 관리를 위한 UI State
  const [openSections, setOpenSections] = useState({ '삼각함수': true, '수열': true });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('수1'); // 수1/수2 선택 상태 추가
  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  const getSidebarData = () => {
    if (!session) return { title: '', sections: [] };
    const ranks = session.rank || [];
    const isTopRank = ranks.some(r => r.includes('1등급') || r.includes('2등급'));

    let levels = ['2단계', '3단계'];
    if (isTopRank && !ranks.includes('4등급') && !ranks.includes('5등급')) {
      levels = ['3단계', '4단계'];
    } else {
      levels = ['2단계', '3단계', '4단계'];
    }

    if (selectedCourse === '수2') {
        return {
          title: '수학2 (미적분 기초)',
          sections: [
            { name: '함수의 극한', items: levels.map(l => `함수의 극한${l}`) },
            { name: `함수의 연속`, items: levels.map(l => `함수의 연속${l}`) },
            { name: `미분계수`, items: levels.map(l => `미분계수${l}`) },
            { name: `미분의 활용`, items: levels.map(l => `미분의 활용 ${l}`) },
            { name: `부정적분과 정적분`, items: levels.map(l => `부정적분과 정적분 ${l}`) },
            { name: `정적분의 활용`, items: levels.map(l => `정적분의 활용${l}`) }
          ]
        };
    } else {
        return {
          title: teacher?.courseName || '수학1 (대수) 전체',
          sections: [
            { name: '지수', items: levels.map(l => `지수${l}`) },
            { name: `로그`, items: levels.map(l => `로그${l}`) },
            { name: `지수함수`, items: levels.map(l => `지수함수${l}`) },
            { name: `로그함수`, items: levels.map(l => `로그함수${l}`) },
            { name: '삼각함수성질', items: levels.filter(l => l !== '4단계').map(l => `삼각함수성질${l}`) },
            { name: '삼각함수그래프', items: levels.map(l => l === '4단계' ? '삼각함수그래프' : `삼각함수그래프${l}`) },
            { name: '삼각함수의 활용', items: levels.map(l => l === '4단계' ? '삼각함수활용 4단계(68)' : `삼각함수활용${l}`) },
            { name: `등차등비수열`, items: levels.map(l => `등차등비${l}`) },
            { name: `시그마용법`, items: levels.map(l => `시그마용법${l}`) },
            { name: `귀납적정의`, items: levels.map(l => `귀납적정의${l}`) }
          ]
        };
    }
  };

  const sidebarData = getSidebarData();

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
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: 'white', position: 'relative' }}>
      
      {/* Global Timer Overlay */}
      <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '0.5rem 2.2rem', borderRadius: '30px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '1px' }}>
        <Clock size={20} />
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fca5a5', fontFamily: 'sans-serif', marginRight: '4px', whiteSpace: 'nowrap' }}>수업시간</span>
        {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
      </div>

      {/* 사이드바 UI (옵션) */}
      <div style={{ width: '250px', borderRight: '1px solid #27272a', padding: '1.5rem' }}>
        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>{teacher.name}</h2>
        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.3rem' }}><strong>Target Grades:</strong> {session.grade?.join(', ')}</p>
        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '1rem' }}><strong>Target Ranks:</strong> {session.rank?.join(', ')}</p>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <p style={{ color: '#f3f4f6', fontWeight: 'bold' }}>Session Info</p>
          <hr style={{ borderColor: '#3f3f46', margin: '0.5rem 0' }} />
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Round: <strong style={{color:'#3b82f6'}}>{session.round}회차</strong></p>
        </div>

        <button 
          onClick={() => navigate('/homework', { state: { teacher } })} 
          style={{ width: '100%', padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}
        >
          <CheckCircle size={18} /> 숙제함 가기
        </button>

        {/* 커리큘럼 아코디언 드롭다운 (학생/강사 네비게이션) */}
        <div>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', background: '#27272a', color: 'white', border: '1px solid #3f3f46', borderRadius: '4px' }}
          >
            <option value="수1">수학1 (대수)</option>
            <option value="수2">수학2 (미적분 기초)</option>
          </select>
          <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #3f3f46' }}>
            {sidebarData.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sidebarData.sections.map((sec, i) => (
              <div key={i}>
                <div 
                  onClick={() => {
                    // 하위 아이템이 없으면 이것이 바로 연결 노드
                    if (sec.items.length === 0) setSelectedUnit(sec.name);
                    else toggleSection(sec.name);
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '0.5rem 0.5rem', cursor: 'pointer', borderRadius: '4px',
                    background: selectedUnit === sec.name ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: selectedUnit === sec.name ? '#60a5fa' : '#d4d4d8',
                    fontWeight: selectedUnit === sec.name ? 'bold' : 'normal'
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{sec.name}</span>
                  {sec.items.length > 0 && (
                    <ChevronDown size={14} style={{ transform: openSections[sec.name] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
                  )}
                </div>
                
                {/* 하위 단원(sub-items) 랜더링 */}
                {sec.items.length > 0 && openSections[sec.name] && (
                  <div style={{ marginLeft: '1rem', borderLeft: '1px solid #3f3f46', paddingLeft: '0.5rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {sec.items.map((sub, j) => (
                      <div 
                        key={j}
                        onClick={() => {
                          setSelectedUnit(sub);
                          setTestProblemIdx(1); // 문제 1번(idx 1)부터 시작하도록 수정
                          setMessages(prev => [...prev, { role: 'system', content: `[단원 이동] ${sub} 과목으로 이동했습니다. 애니메이션 버튼을 클릭하여 확인하세요.`}]);
                        }}
                        style={{
                          fontSize: '0.85rem', padding: '0.4rem 0.5rem', cursor: 'pointer', borderRadius: '4px',
                          color: selectedUnit === sub ? '#3b82f6' : '#a1a1aa',
                          background: selectedUnit === sub ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          fontWeight: selectedUnit === sub ? 'bold' : 'normal'
                        }}
                      >
                        - {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <LessonRenderer session={session} setSession={setSession} ssot={teacher} timeLeft={timeLeft} selectedUnit={selectedUnit} />
    </div>
  );
}
