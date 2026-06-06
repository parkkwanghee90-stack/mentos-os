import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Camera, Send, ChevronRight, CheckCircle, Smartphone, Mic, Volume2, Upload, Paperclip, Clock, BookOpen, X as CloseIcon, ChevronDown, UploadCloud, Award, Target, Menu, LogOut, Sparkles, Crown, XCircle, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTeacherById } from '@/data/teacherProfiles';
import { useMathLessonSession } from '@/hooks/useMathLessonSession';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
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

// KaTeX visibility fix: force black only for white-background containers.
const katexStyle = `
  .white-bg-katex .katex { color: #000000 !important; }
  .white-bg-katex .katex-display { color: #000000 !important; }
`;
import SineRuleAnimation from '@/components/SineRuleAnimation';
import CosineRuleAnimation from '@/components/CosineRuleAnimation';
import TriangleAreaAnimation from '@/components/TriangleAreaAnimation';
import PremiumLectureModal from '@/components/lectures/PremiumLectureModal';
import DynamicProblemAnimation from '@/components/DynamicProblemAnimation';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';
import ProblemCard from '@/components/ProblemCard';
import PremiumLecturePlayer from '@/components/lectures/PremiumLecturePlayer';
import MathProblemRenderer from '@/components/MathProblemRenderer';
import { mathTextsData, answersMasterData, avsAnswersData, loadMathData } from '@/services/mathDataLoader';
import { URL_PREFIX } from '@/config/assets';
import FreeTrialBanner from '@/components/FreeTrialBanner';
import { generateMathHomework } from '@/services/homeworkGenerator';

const TRIG_ANSWERS = {};

const formatQuestionText = (text) => {
  if (!text) return '';
  
  // Case 1: Options already on separate lines (from vision extraction)
  // e.g. "문제\n\n① a\n② b\n③ c\n④ d\n⑤ e"
  const hasNewlineOptions = /\n[\n ]*[①②③④⑤]/.test(text);
  if (hasNewlineOptions) {
    // Already has proper line breaks - just ensure options are grouped 3+2
    const [body, ...rest] = text.split(/\n[\n ]*(?=①)/);
    const optionBlock = rest.join('');
    if (!optionBlock) return text;
    
    // Extract each option
    const regex = /(①|②|③|④|⑤)([^\n①②③④⑤]*)/g;
    let match;
    const options = [];
    while ((match = regex.exec(optionBlock)) !== null) {
      options.push(`${match[1]}${match[2].trim()}`);
    }
    if (options.length === 5) {
      return `${body.trim()}\n\n${options[0]} $\\qquad$ ${options[1]} $\\qquad$ ${options[2]}\n\n${options[3]} $\\qquad$ ${options[4]}`;
    }
    return text;
  }
  
  // Case 2: Options inline with no line breaks
  const idx = text.indexOf('①');
  if (idx === -1) return text;
  
  const body = text.substring(0, idx).trim();
  const optionsStr = text.substring(idx);
  
  const regex2 = /(①|②|③|④|⑤)\s*(.*?)(?=(?:①|②|③|④|⑤|$))/g;
  let match2;
  const options = [];
  while ((match2 = regex2.exec(optionsStr)) !== null) {
    options.push(`${match2[1]} ${match2[2].trim()}`);
  }
  
  if (options.length === 5) {
    return `${body}\n\n${options[0]} $\\qquad$ ${options[1]} $\\qquad$ ${options[2]}\n\n${options[3]} $\\qquad$ ${options[4]}`;
  }
  return `${body}\n\n${optionsStr}`;
};

const ErrorComponent = ({ text }) => <div style={{ color: 'red', padding: '2rem', background: 'var(--bg-base)', color: 'var(--text-main)', height: '100vh' }}>🚨 {text}</div>;
const Loading = () => <div style={{ color: 'var(--text-main)', padding: '2rem', background: 'var(--bg-base)', height: '100vh' }}>Loading V2 Engine...</div>;

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



function LessonRenderer({ session, setSession, ssot, timeLeft, selectedUnit, setSelectedUnit, testProblemIdx, setTestProblemIdx, selectedCourse, showReport, setShowReport, getSidebarData, problemTimeLeft, setShowEndEarlyModal }) {
  const location = useLocation();
  
  // 고1 선생님들(1,2,3번) 강제 고정 여부 확인
  const isG1Teacher = (ssot?.id === 'h_math1' || ssot?.id === 'h_math2' || ssot?.id === 'h_math3' || ssot?.id === 'math1' || ssot?.id === 'math2' || ssot?.id === 'math3') || 
                      (ssot?.targetGrades?.some(g => g.includes('고1')));

  // 고2 선생님들(4,5,6번) 확인 (h_math_calc 제외하여 고3 락 격리)
  const isG2Teacher = (ssot?.id === 'h_math4' || ssot?.id === 'h_math5' || ssot?.id === 'h_math6' || ssot?.id === 'math4' || ssot?.id === 'math5' || ssot?.id === 'math6') || 
                      (ssot?.targetGrades?.some(g => g.includes('고2')) && !ssot?.id?.includes('calc') && !ssot?.targetGrades?.some(g => g.includes('고3'))) ||
                      (ssot?.courseName?.includes('대수') && !ssot?.id?.includes('calc'));
  
  // ── 현재 단원명(unit) 및 문제 에셋 선언부 (TDZ 에러 방지를 위해 컴포넌트 최상단 호이스팅 선언) ──
  let currentUnit = null;
  let currentProblemImage = null;
  let currentProblemTitle = null;
  let currentProblemText = null;

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
  const [showPremiumLecture, setShowPremiumLecture] = useState(false);
  const [premiumLectures, setPremiumLectures] = useState({}); // Object structure for categories
  const [selectedPremiumLecture, setSelectedPremiumLecture] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({}); // Track expanded dropdowns

  const [mathDataReady, setMathDataReady] = useState(false);

  useEffect(() => {
    fetch(window.resolveAsset('/concept_cards/premium_lectures.json'))
      .then(res => res.json())
      .then(data => setPremiumLectures(data))
      .catch(e => console.error(e));
      
    loadMathData().then(() => setMathDataReady(true));
  }, []);

  // ── 개념카드 전역 상태 및 모달 제어 ──
  const [globalCards, setGlobalCards] = useState([]);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [selectedExpandedCard, setSelectedExpandedCard] = useState(null);
  const [expandedProblemImage, setExpandedProblemImage] = useState(null);
  const [precomputedAnims, setPrecomputedAnims] = useState({});
  const [chalkboardData, setChalkboardData] = useState(null);

  const [currentProblemRawData, setCurrentProblemRawData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);

  // ── 칠판형 문제 카드 데이터 로딩 ──
  function getHintFolder(unitName) {
    if (!unitName) return null;

    // 모의고사/학평/수능 처리
    if (selectedCourse === '모의고사' || unitName.includes('제 ') || unitName.includes('모의고사') || unitName.includes('학평') || unitName.includes('수능')) {
      const yearMatch = unitName.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : '2025';
      const monthMatch = unitName.match(/(3|6|9)월/);
      const examType = monthMatch ? monthMatch[1] + '월' : (unitName.includes('수능') ? '수능' : '6월');
      
      let subject = '미적분';
      const lastMathElective = localStorage.getItem('last_math_elective') || localStorage.getItem(`last_elective_${ssot?.id}`) || '';
      if (location.state?.elective === 'statistics' || window.location.href.includes('statistics') || lastMathElective === 'statistics') {
          subject = '확통';
      }

      if (year === '2025' && examType === '6월') {
        return subject === '미적분' ? '20260504모의고사1회미적분' : '20260504모의고사1회확통';
      }
      if (year === '2024' && examType === '6월') {
        return subject === '미적분' ? 'CSAT_2024_6월_미적분' : 'CSAT_2024_6월_확통';
      }
      if (year === '2023' && examType === '6월') {
        return subject === '미적분' ? 'CSAT_2023_6월_미적분' : 'CSAT_2023_6월_확통';
      }
      
      // 수능은 폴더명에 언더스코어 없음: CSAT_YYYY수능_과목
      if (examType === '수능') {
        return `CSAT_${year}수능_${subject}`;
      }
      return `CSAT_${year}_${examType}_${subject}`;
    }

    const clean = unitName.replace(/\s+/g, '');
    const stepMatch = clean.match(/(2|3|4)단계/);
    const stepStr = stepMatch ? stepMatch[0] : '2단계';
    const stepNum = stepMatch ? stepMatch[1] : '2';

    // 고2 (수학2) 처리 — 폴더명의 공백이 정확해야 하므로 명시적 매핑
    if (selectedCourse === '수2' || selectedCourse === '수학2') {
      if (clean.includes('함수의극한')) {
        if (stepStr === '2단계') return '(7)수학2/함수의 극한 2단계';
        return `(7)수학2/함수의극한${stepStr}`;
      }
      if (clean.includes('함수의연속')) {
        if (stepStr === '2단계') return '(7)수학2/함수의 연속 2단계';
        return `(7)수학2/함수의연속${stepStr}`;
      }
      if (clean.includes('미분계수')) {
        if (stepStr === '2단계') return '(7)수학2/미분계수 2단계';
        return `(7)수학2/미분계수${stepStr}`;
      }
      if (clean.includes('미분의활용') || clean.includes('미분활용')) return '(7)수학2/미분의활용 2단계';
      if (clean.includes('도함수의활용')) {
        if (stepStr === '4단계') return '(7)수학2/도함수의 활용 4단계';
        if (clean.includes('활용1')) return '(7)수학2/도함수의 활용1 2단계';
        if (clean.includes('활용2')) return '(7)수학2/도함수의활용2 2단계';
        if (stepStr === '3단계') return '(7)수학2/도함수의활용3단계';
        return `(7)수학2/도함수의활용${stepStr}`;
      }
      if (clean.includes('부정적분') || clean.includes('정적분과')) {
        return `(7)수학2/부정적분과 정적분 ${stepStr}`;
      }
      if (clean.includes('정적분의활용') || clean.includes('정적분활용')) {
        return `(7)수학2/정적분의 활용 ${stepStr}`;
      }
      if (clean.includes('정적분')) {
        return '(7)수학2/정적분 2단계';
      }
      return `(7)수학2/${unitName}`;
    }

    // 고3 (미적분) 처리
    if (selectedCourse === '미적분') {
      if (clean.includes('수열의극한')) return stepStr === '4단계' ? '1)극한4단계' : `1)극한${stepNum}`;
      if (clean.includes(`급수`)) return stepStr === '4단계' ? '2)급수4단계' : `2)급수${stepNum}`;
      if (clean.includes('지수로그함수의극한')) return '3)지수로그함수의극한';
      if (clean.includes('지수로그삼각함수')) return '3)지수로그삼각함수의 미분법 4단계';
      if (clean.includes('삼각함수합성')) return '4)삼각함수합성과미분';
      if (clean.includes('여러가지미분법2')) return '5)여러가지미분법2';
      if (clean.includes('여러가지미분법')) return '4)여러가지 미분법 4단계';
      if (clean.includes('도함수의활용1')) return '6)도함수의활용1';
      if (clean.includes('도함수의활용2')) return '7)도함수의활용2';
      if (clean.includes('도함수의활용')) return '5)도함수의 활용 4단계';
      if (clean.includes('여러가지적분')) return '7)여러가지적분';
      if (clean.includes('여러가지함수의적분')) return '6)여러가지 함수의 적분4단계';
      if (clean.includes('초월함수의정적분')) return '8)정적분';
      if (clean.includes('정적분의활용')) return '7)정적분의 활용 4단계';
    }

    // 확통수능 처리 — 확통수능/ 서브폴더 아래에 있음
    if (selectedCourse === '확률과통계' || selectedCourse === '확통수능' || selectedCourse === '확통') {
      if (clean.includes('순열')) return '확통수능/1)순열';
      if (clean.includes('중복조합') || (clean.includes('중복') && clean.includes('조합'))) return '확통수능/2)중복조합';
      if (clean.includes('이항정리')) return '확통수능/3)이항정리';
      if (clean.includes('확률의뜻') || (clean.includes('확률') && !clean.includes('변수') && !clean.includes('분포') && !clean.includes('조건부') && !clean.includes('덧셈'))) return '확통수능/4)확률의뜻';
      if (clean.includes('덧셈정리') || clean.includes('조건부확률') || clean.includes('조건부') || clean.includes('독립시행')) return '확통수능/5)덧셈정리_조건부확률_독립시행';
      if (clean.includes('확률변수') || clean.includes('이항분포')) return '확통수능/6)확률변수와이항분포';
      if (clean.includes('연속확률') || clean.includes('정규분포')) return '확통수능/7)연속확률분포와정규분포';
      if (clean.includes('표본평균') || clean.includes('모평균')) return '확통수능/8)표본평균과모평균';
    }

    // ── 수학(상) 신규 챕터 (한글 폴더명) ──
    if (clean.includes('다항식')) return `다항식${stepStr}`;
    if (clean.includes('항등식') || clean.includes('나머지정리')) return `항등식과나머지정리${stepStr}`;
    if (clean.includes('인수분해')) return `인수분해${stepStr}`;
    if (clean.includes('복소수')) return `복소수${stepStr}`;
    if (clean.includes('이차방정식과이차함수') || clean.includes('이차방정식과 이차함수')) return `이차방정식과이차함수${stepStr}`;
    if (clean.includes('이차방정식')) return `이차방정식${stepStr}`;

    // ── 수학(상) 기존 챕터 ──
    if (clean.includes('고차방정식')) return `고차방정식${stepStr}`;
    if (clean.includes('일차부등식')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(1)일차부등식 개념2단계(26) 1+1(쌍둥이)';
      return `일차부등식${stepStr}`;
    }
    if (clean.includes('이차부등식')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)';
      return `이차부등식${stepStr}`;
    }
    if (clean.includes('경우의수')) {
      if (stepStr === '2단계') return 'cases_step2';
      if (stepStr === '3단계') return 'cases_step3';
      if (stepStr === '4단계') return 'cases_step4';
      return `경우의수${stepStr}`;
    }
    if (clean.includes('행렬')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(4)행렬2단계';
      return `행렬${stepStr}`;
    }
    if (clean.includes('점과좌표')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)';
      return `점과좌표${stepStr}`;
    }
    if (clean.includes('직선의방정식') || clean.includes('직선의 방정식')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)';
      return `직선의방정식${stepStr}`;
    }
    if (clean.includes('원의방정식') || clean.includes('원의 방정식')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)';
      return `원의방정식${stepStr}`;
    }
    if (clean.includes('도형의이동') || clean.includes('도형의 이동')) {
      if (stepStr === '2단계') return '(2)수학(상)기말/(8)도형의이동 개념2단계(46)p21 1+1(쌍둥이)';
      return `도형의이동${stepStr}`;
    }

    // ── 수학1 (삼각함수, 수열, 지수/로그) ──
    if (clean.includes('삼각함수') && clean.includes('활용')) return stepStr === '4단계' ? '삼각함수활용 4단계(68)' : `삼각함수활용${stepStr}`;
    if (clean.includes('삼각함수') && clean.includes('그래프')) return stepStr === '4단계' ? '삼각함수그래프' : `삼각함수그래프${stepStr}`;
    if (clean.includes('삼각함수') && (clean.includes('정의') || clean.includes('성질'))) return stepStr !== '2단계' ? `삼각함수${stepStr}` : `삼각함수성질${stepStr}`;
    if (clean.includes('등차') || clean.includes('등비')) return stepStr === '4단계' ? '등차등비수열4단계' : `등차등비${stepStr}`;
    if (clean.includes('시그마')) { if (stepStr === '3단계') return '여러가지수열3단계'; if (stepStr === '4단계') return '수열의합4단계'; return `시그마용법${stepStr}`; }
    if (clean.includes('귀납적')) return stepStr === '2단계' ? '귀납적정의2단계' : `수학적귀납법${stepStr}`;
    if (clean.includes('지수함수')) return `지수함수${stepStr}`;
    if (clean.includes('로그함수')) return `로그함수${stepStr}`;
    if (clean.includes('지수')) return `지수${stepStr}`;
    if (clean.includes('로그')) return `로그${stepStr}`;
    
    return unitName;
  }

  useEffect(() => {
    const targetUnit = selectedUnit || currentUnit;
    if (!targetUnit || !testProblemIdx) { setChalkboardData(null); return; }
    const folder = getHintFolder(targetUnit);
    if (!folder) { setChalkboardData(null); return; }
    
    const pid = String(testProblemIdx).padStart(3, '0');
    // 힌트 JSON은 로컬/배포 모두 Supabase 공개 버킷에서 서빙된다(public/math_hints 는 비어 있음).
    // 한글 폴더명은 resolveAsset 내부의 getSafePath 가 영문/숫자 경로로 변환한다.
    const directUrl = window.resolveAsset(`/math_hints/${folder}/${pid}.json?v=cb_${Date.now()}`);

    fetch(directUrl)
      .then(r => { 
        if (!r.ok) throw new Error(`Fetch failed ${r.status}`); 
        return r.json(); 
      })
      .then(d => {
        setChalkboardData(null); // Force White KaTeX Card Mode always to prevent broken dark chalkboard layout
        setCurrentProblemRawData(d);
      })
      .catch(err => {
        console.error(`[Chalkboard] Load failed for ${folder}/${pid}:`, err);
        setChalkboardData(null);
        setCurrentProblemRawData(null);
      });
  }, [selectedUnit, currentUnit, testProblemIdx]);

  useEffect(() => {
    setUserAnswer('');
    setSelectedAnswer(null);
    setGradingResult(null);
  }, [testProblemIdx, selectedUnit, session?.currentPhaseIndex]);

  // ── 모바일 상태 및 리스너 추가 ──
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAvsAccordion, setShowAvsAccordion] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowAvsAccordion(false);
  }, [testProblemIdx, selectedUnit]);

  // AVS 아코디언 핸들러
  const handleAvsClick = () => {
    const targetUnit = selectedUnit || currentUnit;
    if (targetUnit) {
      // 사용자 요청: AVS 버튼 클릭 시 "나:" 채팅 메시지는 띄우지 않음 (해설 영상만 표시)
      setTimeout(() => {
        const pid = String(testProblemIdx).padStart(3, '0');
        setMessages(prev => {
          const cleaned = prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m);
          return [...cleaned, { 
            role: 'assistant', 
            content: '',
            hintPlayer: { unit: targetUnit, problemId: pid }
          }];
        });
        setShowAvsAccordion(true);
      }, 500);
    } else {
      alert("선택된 단원이 없습니다. 좌측 메뉴에서 세부 단원/단계를 선택해주세요.");
    }
  };

  // 로컬 채점 핸들러 (PC & 모바일 공유)
  const handleGradeAnswer = () => {
    const targetUnitFolder = getHintFolder(selectedUnit || currentUnit);
    const targetProblemNum = Number(testProblemIdx);
    
    // [데이터 확인용] 정답 연결 로그 출력
    const stepStrLog = (selectedUnit || currentUnit || '').match(/(1|2|3|4|5)단계/)?.[0] || 'N/A';
    console.log('--- Answer Lookup Key ---');
    console.log('Subject/Course:', selectedCourse);
    console.log('UnitName:', selectedUnit || currentUnit);
    console.log('Stage/Level:', stepStrLog);
    console.log('ProblemNumber:', testProblemIdx);
    console.log('Generated AnswerKey:', targetUnitFolder);

    const targetUnits = ['다항식', '항등식', '인수분해', '복소수', '이차방정식', '이차함수', 'higher_order', 'linear_ineq', 'quadratic_ineq', 'cases_step', 'matrix_step', 'point_coord', 'line_eq', 'circle_eq', 'shape_move', '고차방정식', '이차부등식', '일차부등식', '도형', '원의', '삼각함수그래프', '삼각함수 그래프', '수열', '등차등비', '시그마', '귀납적', '삼각함수활용', '경우의수', '점과좌표', '직선의방정식', '행렬', '지수함수', '로그함수', '지수', '로그', '삼각함수성질', '삼각함수', '수학적귀납법', '지수로그', '극한', '연속', '미분', '도함수', '적분', '정적분', '급수', '확률', '통계', '조건부', '독립시행', '이항분포', '순열', '조합', '이항정리', '표본', '정규분포', '덧셈정리'];
    const isTargetUnit = targetUnits.some(u => targetUnitFolder && targetUnitFolder.includes(u));

    let rawAnswer = null;

    if (isTargetUnit) {
       // 1. 하드코딩된 정답 우선 (캐시 문제 방지)
       if (TRIG_ANSWERS[targetUnitFolder] && TRIG_ANSWERS[targetUnitFolder][targetProblemNum]) {
          rawAnswer = TRIG_ANSWERS[targetUnitFolder][targetProblemNum];
       }
       
       // 2. 마스터 데이터 및 AVS 검색 (개선된 정규화/매핑 로직)
       if (!rawAnswer) {
         const normalizeUnitAndStage = (rawUnit) => {
           if (!rawUnit) return { baseUnit: '', stage: null };
           let clean = rawUnit.replace(/\s+/g, '');
           if (clean.includes('/')) clean = clean.split('/').pop();
           clean = clean.replace(/_/g, '');
           let stage = null;
           const sMatch = clean.match(/(1|2|3|4|5)단계/);
           if (sMatch) {
             stage = Number(sMatch[1]);
             clean = clean.replace(sMatch[0], '');
           }
           clean = clean.replace(/\//g, '');
           clean = clean.replace(/\([^)]*\)/g, '');
           const aliasMap = {  };
           if (aliasMap[clean]) clean = aliasMap[clean];
           return { baseUnit: clean, stage };
         };

         const normalizeProblemNum = (n) => {
           if (n == null) return null;
           const match = String(n).match(/\d+/);
           return match ? Number(match[0]) : null;
         };

         const tUnit = normalizeUnitAndStage(targetUnitFolder);
         const tProb = normalizeProblemNum(targetProblemNum);
         console.log('answers_master.json에서 찾는 key:', { baseUnit: tUnit.baseUnit, stage: tUnit.stage, problem: tProb });

         // AVS 검색
         const avsKeyConstructed = tUnit.stage ? `${tUnit.baseUnit}${tUnit.stage}단계` : tUnit.baseUnit;
         const cleanTarget1 = avsKeyConstructed.replace(/\s+/g, '');
         const cleanTarget2 = targetUnitFolder.replace(/\s+/g, '');
         let avsUnitData = null;
         if (avsAnswersData) {
            const matchedKey = Object.keys(avsAnswersData).find(k => {
               const cleanK = k.replace(/\s+/g, '').replace(/\//g, '');
               return cleanK === cleanTarget1 || cleanK === cleanTarget2;
            });
            if (matchedKey) {
               avsUnitData = avsAnswersData[matchedKey];
            }
         }
         if (avsUnitData) {
            const pKey1 = String(tProb);
            const pKey2 = String(tProb).padStart(3, '0');
            if (avsUnitData[pKey1] !== undefined || avsUnitData[pKey2] !== undefined) {
               rawAnswer = avsUnitData[pKey1] !== undefined ? avsUnitData[pKey1] : avsUnitData[pKey2];
            }
         }

         // 마스터 DB 검색
         if (!rawAnswer) {
           if (currentProblemRawData) {
             rawAnswer = currentProblemRawData.correctAnswer || currentProblemRawData.A;
           }
         }

         if (!rawAnswer) {
            const masterItem = answersMasterData.find(m => {
              const mUnit = normalizeUnitAndStage(m.unit);
              const isUnitMatch = mUnit.baseUnit === tUnit.baseUnit || mUnit.baseUnit.includes(tUnit.baseUnit) || tUnit.baseUnit.includes(mUnit.baseUnit);
              const isStageMatch = (tUnit.stage && mUnit.stage !== null) ? mUnit.stage === tUnit.stage : true;
              const mProb = normalizeProblemNum(m.problem);
              return isUnitMatch && isStageMatch && mProb === tProb;
            });
            if (masterItem) {
               rawAnswer = masterItem.answer;
            }
          }
       }
    }
    console.log('-------------------------');

    if (!rawAnswer) {
      if (currentProblemRawData) {
         const d = currentProblemRawData;
         rawAnswer = d.correctAnswer || d.answer || d.finalAnswer || d.solution?.finalAnswer || d.avs?.finalAnswer || d.problem_render?.answer;
      }
      if (!rawAnswer && session?.curriculumData?.lessonContent) {
          const phaseKey = (currentPhaseFlow?.phase || 'core').toLowerCase();
          const phaseProbs = session.curriculumData.lessonContent[phaseKey]?.problems;
          if (phaseProbs && phaseProbs.length >= testProblemIdx) {
              rawAnswer = phaseProbs[testProblemIdx - 1]?.answer || phaseProbs[testProblemIdx - 1]?.finalAnswer;
          }
      }
    }

    if (!rawAnswer) {
      alert(`[데이터 확인용] 정답 데이터 없음: ${targetUnitFolder} / ${targetProblemNum}번`);
      return;
    }

    const normalizeAnswer = (ans) => {
      if (!ans) return '';
      let clean = String(ans)
        .replace(/\s+/g, '')
        .replace(/\[|\{/g, '(')
        .replace(/\]|\}/g, ')')
        .replace(/\\pi/gi, 'π')
        .replace(/\\sqrt/gi, '√')
        .replace(/\\frac\{\s*([^}]+)\s*\}\{\s*([^}]+)\s*\}/g, '$1/$2')
        .replace(/\^/g, '')
        .replace(/,/g, '')
        .replace(/\\/g, '')
        .replace(/\$/g, '')
        .replace(/①|②|③|④|⑤/, (match) => ({'①':'1','②':'2','③':'3','④':'4','⑤':'5'}[match]))
        .toLowerCase();
      
      clean = clean.replace(/^[a-z]+[:=]/, '');
      
      if (!isNaN(clean) && clean.includes('.')) {
          const num = parseFloat(clean);
          if (Number.isInteger(num)) clean = String(num);
      }

      if (clean.startsWith('+') && !isNaN(clean.substring(1))) {
          clean = clean.substring(1);
      }

      return clean;
    };

    const normUser = normalizeAnswer(userAnswer);
    const normCorrect = normalizeAnswer(rawAnswer);

    let optionValueMatch = false;
    if (selectedAnswer !== null && currentProblemText) {
        const mapCircle = { 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤' };
        const selectedCircle = mapCircle[selectedAnswer] || selectedAnswer;
        const regex = new RegExp(selectedCircle + '\\s*([^①②③④⑤\\n]+)');
        const match = currentProblemText.match(regex);
        if (match) {
            const extracted = match[1].replace(/\\$/g, '').trim();
            const normExtracted = normalizeAnswer(extracted);
            if (normExtracted === normCorrect || normCorrect.includes(normExtracted)) {
                optionValueMatch = true;
            }
        }
    }

    const isCorrect = (selectedAnswer !== null && normUser === normCorrect) || 
                      (normUser === normCorrect) || 
                      (normCorrect.includes(normUser) && normUser.length > 0) ||
                      optionValueMatch;

    setGradingResult(isCorrect ? 'correct' : 'incorrect');

    if (selectedAnswer !== null || userAnswer.trim() !== '') {
      console.log('\n[ANSWER]');
      console.log(`problemId: ${targetUnitFolder}/${targetProblemNum}`);
      console.log(`selected: ${normUser}`);
      console.log(`correct: ${normCorrect}`);
      console.log(`result: ${isCorrect ? 'correct' : 'incorrect'}\n`);

      if (isCorrect) {
        console.log(`[SUCCESS] 정답입니다. 다음 문제로 이동합니다.`);
        console.log(`[HOMEWORK] Queue pushed: 1 problem for ${targetUnitFolder}/${targetProblemNum}`);
        setTimeout(() => {
          testAdvance();
        }, 1000);
      } else {
        console.log(`[WRONG_ANSWER] 오답 기록: 학생 dashboard 데이터 저장 (${targetUnitFolder}/${targetProblemNum})`);
        console.log(`[HOMEWORK] Queue pushed: 2 problems (similar type) for ${targetUnitFolder}/${targetProblemNum}`);
      }
    }

    const resultToSave = {
      problemId: testProblemIdx,
      unit: selectedUnit || currentUnit,
      userAnswer: userAnswer,
      correctAnswer: rawAnswer,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };
    
    const history = JSON.parse(localStorage.getItem('localGradingHistory') || '[]');
    history.push(resultToSave);
    localStorage.setItem('localGradingHistory', JSON.stringify(history));

    if (user) {
      if (!isCorrect) {
        console.log('[Supabase DB] Detected wrong answer. Saving to cloud database...');
        supabase.from('wrong_answers').insert({
          student_id: user.id,
          subject: '수학',
          unit_folder: targetUnitFolder || selectedUnit || currentUnit || '수학상',
          problem_id: String(testProblemIdx).padStart(3, '0'),
          problem_num: String(testProblemIdx).padStart(3, '0'),
          correct_answer: rawAnswer != null ? String(rawAnswer) : null,
          wrong_answer_text: userAnswer
        }).then(({ error }) => {
          if (error) console.error('[Supabase DB] Failed to record wrong answer:', error);
          else console.log('[Supabase DB] Wrong answer recorded successfully.');
        });
      }
    }
  };

  useEffect(() => {
    Promise.all([
      fetch(window.resolveAsset('/concept_cards/global_metadata.json')).then(res => res.json()).catch(() => []),
      fetch(window.resolveAsset('/concept_cards/dynamic_concepts.json')).then(res => res.json()).catch(() => []),
      fetch(window.resolveAsset('/concept_cards/precomputed_animations.json')).then(res => res.json()).catch(() => ({}))
    ]).then(([globalData, dynamicData, animsData]) => {
      setPrecomputedAnims(animsData);
      const dynamicUnits = new Set(Array.isArray(dynamicData) ? dynamicData.map(d => d.unit) : []);
      const safeGlobal = Array.isArray(globalData) ? globalData : [];
      const safeDynamic = Array.isArray(dynamicData) ? dynamicData : [];
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
      
      // 학습 이력 집계 및 적재 (로컬 스토리지 및 Supabase)
      const history = JSON.parse(localStorage.getItem('localGradingHistory') || '[]');
      const correctCount = history.filter(h => h.isCorrect).length;
      const totalCount = history.length;
      const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const unitName = selectedUnit || currentUnit || '수학상';

      if (totalCount > 0) {
        const results = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
        const isAlreadyAdded = results.some(r => r.unit === unitName && Math.abs(Date.now() - new Date(r.date).getTime()) < 10000);
        if (!isAlreadyAdded) {
          results.push({
            id: 'session_' + Date.now(),
            date: new Date().toISOString(),
            subject: '수학',
            grade: teacher?.targetGrades?.[0] || '고1',
            unit: unitName,
            totalQuestions: totalCount,
            correctCount: correctCount,
            accuracy: accuracy,
            duration: Math.max(1, Math.round((Date.now() - (window.__mentosSessionStart || Date.now())) / 60000)) || 120,
            endedEarly: false,
            wrongQuestions: history.filter(h => !h.isCorrect).map(h => ({ problemId: h.problemId, id: h.problemId, isCorrect: false })),
            nextLessonFocus: '개념 강화 및 맞춤 숙제 풀이 진행'
          });
          localStorage.setItem('mentos_lesson_results', JSON.stringify(results));
          console.log('[LessonResult] Saved normal lesson result:', results[results.length - 1]);
        }
      }

      if (user) {
        console.log('[Supabase DB] Saving study log record to cloud database...');
        supabase.from('study_logs').insert({
          student_id: user.id,
          subject: '수학',
          unit: unitName,
          duration_minutes: 120, // 의도된 설계: 주2회 2시간 고정 과외 모델(계약 수업시간)
          score: accuracy
        }).then(({ error }) => {
          if (error) console.error('[Supabase DB] Failed to save study log:', error);
          else console.log('[Supabase DB] Study log saved successfully.');
        });
      }

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
        setMessages(prev => [...prev, { role: 'user', content: '[시스템 호출] AVS풀이 요청' }]);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '문제 풀이가 막히셨나요? 걱정하지 마세요! AI가 방금 회원님이 푸시는 문제에 맞춰 **라이브 다이내믹 AVS풀이**를 준비해 두었습니다. 영상을 통해 돌파구를 찾아보세요!',
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
            content: '문제 풀이가 막히셨나요? 전혀 걱정하지 마세요! AI가 이 실전 문제의 해설지 흐름을 **라이브 다이내믹 AVS풀이**로 준비해 두었습니다. 시각적 풀이 과정을 보며 힌트를 얻어보세요!',
            dynamicData: precomputedAnims[animKey]
          }]);
          setLoading(false);
        }, 1500);
        return; 
      } else if (currentUnit) {
        // 벡터 애니메이션이 없으면 칠판식 힌트 플레이어(hintPlayer)로 대체
        setTimeout(() => {
          const pid = String(testProblemIdx).padStart(3, '0');
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '해당 문제에 대한 **대형 칠판 애니메이션 해설**을 준비했습니다. 단계별로 차근차근 확인하며 돌파구를 찾아보세요!',
            hintPlayer: { unit: currentUnit, problemId: pid }
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

  // ── 현재 단원명(unit) 추출 로직 (선언부는 컴포넌트 최상단으로 호이스팅 완료) ──
  currentUnit = null;
  currentProblemImage = null;
  currentProblemTitle = null;
  currentProblemText = null;

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
        const match = strData.match(/math_(?:indexed|crops)\/.*?\/(?:2단계|3단계|4단계)?\/?([^/]+)/);
        if (match) currentUnit = match[1];
      }
      
      // 만약 동적으로 overrides에서 넘겨받은 원본 유닛 이름이 있다면 그걸 우선 사용!
      if (phaseData.original_unit) {
         currentUnit = phaseData.original_unit;
      }
    }
  }

  // 사용자가 사이드바에서 특정 단원을 강제로 선택하거나 세션에서 단원이 감지된 경우 이미지 및 텍스트 매핑
  const activeUnit = selectedUnit || currentUnit;
  if (activeUnit) {
     currentUnit = activeUnit;
     const formattedIdx = String(testProblemIdx).padStart(3, '0');
     
     // 단계 추출 (예: '삼각함수활용4단계' -> '4단계'). 없으면 기본 '2단계'
     const stepMatch = currentUnit.match(/(2|3|4)단계/);
     const stepStr = stepMatch ? stepMatch[0] : '2단계';
     
     // === 미적분 (고3 전용) 이미지 라우팅 예외 처리 ===
     const calcMapping = {
        '[2단계] 수열의극한': '1)극한2',
        '[4단계] 수열의극한': '1)극한4단계',
        '[2단계] 급수': '2)급수2',
        '[4단계] 급수': '2)급수4단계',
        '[2단계] 지수로그함수의극한': '3)지수로그함수의극한',
        '[2단계] 삼각함수합성과 여러 가지 공식': '4)삼각함수합성과미분',
        '[2단계] 삼각함수합성과미분': '4)삼각함수합성과미분',
        '[4단계] 지수로그삼각함수 미분': '3)지수로그삼각함수의 미분법 4단계',
        '[2단계] 여러가지미분법2': '5)여러가지미분법2',
        '[4단계] 여러가지 미분법': '4)여러가지 미분법 4단계',
        '[2단계] 도함수의활용1': '6)도함수의활용1',
        '[2단계] 도함수의활용2': '7)도함수의활용2',
        '[4단계] 도함수의 활용': '5)도함수의 활용 4단계',
        '[2단계] 여러가지 적분법': '7)여러가지적분',
        '[4단계] 여러가지 함수의 적분': '6)여러가지 함수의 적분4단계',
        '[2단계] 초월함수의 정적분': '8)정적분',
        '[4단계] 정적분의 활용': '7)정적분의 활용 4단계'
     };

     const mappedUnit = calcMapping[currentUnit] || currentUnit;

     if (['1)극한2', '2)급수2', '3)지수로그함수의극한', '4)삼각함수합성과미분', '5)여러가지미분법2', '6)도함수의활용1', '7)도함수의활용2', '7)여러가지적분', '8)정적분'].includes(mappedUnit)) {
        const calcSymlinks = {
           '1)극한2': 'calc1',
           '2)급수2': 'calc2',
           '3)지수로그함수의극한': 'calc3',
           '4)삼각함수합성과미분': 'calc4',
           '5)여러가지미분법2': 'calc5',
           '6)도함수의활용1': 'calc6',
           '7)도함수의활용2': 'calc7_1',
           '7)여러가지적분': 'calc7_2',
           '8)정적분': 'calc8'
        };
        const imgFolder = calcSymlinks[mappedUnit] || mappedUnit;
        currentProblemImage = window.resolveAsset(`/math_crops/미적분/2단계/${imgFolder}/${formattedIdx}.webp`)
     }
     else if (['1)극한4단계', '2)급수4단계', '3)지수로그삼각함수의 미분법 4단계', '4)여러가지 미분법 4단계', '5)도함수의 활용 4단계', '6)여러가지 함수의 적분4단계', '7)정적분의 활용 4단계'].includes(mappedUnit)) {
        currentProblemImage = window.resolveAsset(`/math_crops/미적분/4단계/${mappedUnit}/${formattedIdx}.webp`)
     }
     // === 확률과 통계 이미지 라우팅 예외 처리 ===
     else if (selectedCourse === '확률과통계' || mappedUnit.includes('확률') || mappedUnit.includes('통계')) {
        currentProblemImage = window.resolveAsset(`/math_crops/확통수능/${mappedUnit}/${formattedIdx}.webp`)
     }
     // [대수 매핑]
     else if (mappedUnit.includes('등차') || mappedUnit.includes('등비')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/등차등비수열4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/등차등비${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('시그마')) {
        if (stepStr === '3단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/3단계/여러가지수열3단계/${formattedIdx}.webp`)
        else if (stepStr === `4단계`) currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/수열의합4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/2단계/시그마용법2단계/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('귀납적')) {
        if (stepStr === '2단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/2단계/귀납적정의2단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/수학적귀납법${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('삼각함수') && currentUnit.includes('활용')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/삼각함수활용 4단계(68)/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/삼각함수활용${stepStr}/${formattedIdx}.webp`)
      }
     else if (currentUnit.includes('삼각함수') && currentUnit.includes('그래프')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/삼각함수그래프/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/삼각함수그래프${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('삼각함수') && (currentUnit.includes('정의') || currentUnit.includes('성질'))) currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/삼각함수성질${stepStr}/${formattedIdx}.webp`)
     else if (currentUnit.includes('지수함수')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/지수로그함수4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/지수함수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('로그함수')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/지수로그함수4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/로그함수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('지수')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/지수로그4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/지수${stepStr}/${formattedIdx}.webp`)
     }
     else if (currentUnit.includes('로그')) {
        if (stepStr === '4단계') currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/4단계/지수로그4단계/${formattedIdx}.webp`)
        else currentProblemImage = window.resolveAsset(`/math_crops/수학1 중간/${stepStr}/로그${stepStr}/${formattedIdx}.webp`)
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
     // [수학2 매핑]
     else if (selectedCourse === '수2' || selectedCourse === '수학2') {
        currentProblemImage = window.resolveAsset(`/math_crops/(7)수학2/${currentUnit}/${formattedIdx}.webp`)
     }
     // [모의고사 매핑]
     else if (selectedCourse === '모의고사' && currentUnit.includes('제 ')) {
        const yearMatch = currentUnit.match(/\((\d{4})\)/);
        const year = yearMatch ? yearMatch[1] : '2025';
        const monthMatch = currentUnit.match(/(3|6|9)월/);
        const examType = monthMatch ? monthMatch[1] + '월' : (currentUnit.includes('수능') ? '수능' : '6월');
        
        let subjectLabel = '미적분';
        if (location.state?.elective === 'statistics' || window.location.href.includes('statistics')) {
            subjectLabel = '확통';
        }
        
        if (examType === '수능') {
           currentProblemImage = window.resolveAsset(`/math_crops/고3수능및모의고사/${subjectLabel}/${year}수능/${formattedIdx}.webp`);
        } else {
           currentProblemImage = window.resolveAsset(`/math_crops/고3수능및모의고사/월별모의고사/${examType}/${subjectLabel}_${year}_${examType}/${formattedIdx}.webp`);
        }
     }
     else currentProblemImage = window.resolveAsset(`/math_crops/${currentUnit}/${formattedIdx}.webp`)
     
     if (currentProblemImage && !currentProblemImage.startsWith('http') && !currentProblemImage.startsWith('data:')) {
        currentProblemImage = `${URL_PREFIX}${currentProblemImage}`;
     }
     // 강제 캐시 우회 (크롭 변경사항 반영)
     currentProblemImage += `?v=20260429_v4`;
     currentProblemTitle = `${currentUnit} [${testProblemIdx}번]`;
     
      // JSON 파일에서 추출한 KaTeX 텍스트 매핑 시도
      const cleanCurrent = currentUnit ? currentUnit.replace(/\s+/g, '').replace(/[(]\d+[)]/g, '').replace(/개념/g, '') : '';
      const cleanOriginal = (session.curriculumData?.lessonContent?.core?.original_unit || '').replace(/\s+/g, '').replace(/[(]\d+[)]/g, '').replace(/개념/g, '');
      if (cleanCurrent && cleanCurrent === cleanOriginal && session.curriculumData?.lessonContent?.core?.problems) {
          const probs = session.curriculumData.lessonContent.core.problems;
          if (probs.length >= testProblemIdx) {
              currentProblemText = probs[testProblemIdx - 1]?.questionText || null;
          }
      }
      
      // 동적으로 추출된 글로벌 문제 텍스트 딕셔너리 매핑 (우선)
      if (currentProblemImage) {
          let imgKey = currentProblemImage;
          if (imgKey.includes('?')) imgKey = imgKey.split('?')[0];
          const parts = imgKey.split('/');
          
          if (parts.length >= 2) {
              const dirName = parts[parts.length - 2];
              const fileName = parts[parts.length - 1]; // e.g. "001.webp" or "001.png"
              const cleanDirName = decodeURIComponent(dirName).replace(/\s+/g, '');
              
              // 1. koToEng 테이블을 사용하여 디렉토리명을 영어 키로 변환 시도
              const koToEngDict = {
                '지수2단계':'exp_step2','지수3단계':'exp_step3','지수4단계':'explog_step4',
                '지수로그4단계':'explog_step4','지수함수2단계':'exp_func_step2','지수함수3단계':'exp_func_step3','지수함수4단계':'log_func_step4',
                '로그2단계':'log_step2','로그3단계':'log_step3','로그4단계':'explog_step4',
                '로그함수2단계':'log_func_step2','로그함수3단계':'log_func_step3','로그함수4단계':'log_func_step4',
                '삼각함수성질2단계':'trig_prop_step2','삼각함수3단계':'trig_step3','삼각함수성질3단계':'trig_step3','삼각함수그래프2단계':'trig_graph_step2',
                '삼각함수그래프3단계':'trig_graph_step3','삼각함수그래프4단계':'trig_graph',
                '삼각함수활용2단계':'trig_util_step2','삼각함수활용3단계':'trig_util_step3','삼각함수활용4단계':'trig_util_step4','삼각함수활용4단계(68)':'trig_util_step4',
                '등차등비2단계':'seq_apgp_step2','등차등비3단계':'seq_misc_step3','등차등비4단계':'seq_sum_step4','등차등비수열4단계':'seq_sum_step4',
                '시그마용법2단계':'seq_apgp_step2','시그마용법3단계':'seq_misc_step3','여러가지수열3단계':'seq_misc_step3','시그마용법4단계':'seq_sum_step4','수열의합4단계':'seq_sum_step4',
                '귀납적정의2단계':'induction_def_step2','귀납적정의3단계':'induction_step3','수학적귀납법3단계':'induction_step3','귀납적정의4단계':'induction_step4','수학적귀납법4단계':'induction_step4',
                '다항식2단계':'poly_s2','다항식3단계':'poly_s3','다항식4단계':'poly_s4',
                '항등식과나머지정리2단계':'remain_s2','항등식과나머지정리3단계':'remain_s3','항등식과나머지정리4단계':'remain_s4',
                '인수분해2단계':'factor_s2','인수분해3단계':'factor_s3','인수분해4단계':'factor_s4',
                '복소수2단계':'complex_s2','복소수3단계':'complex_s3','복소수4단계':'complex_s4',
                '이차방정식2단계':'quad_eq_s2','이차방정식3단계':'quad_eq_s3','이차방정식4단계':'quad_eq_s4',
                '이차방정식과이차함수2단계':'quad_func_s2','이차방정식과이차함수3단계':'quad_func_s3','이차방정식과이차함수4단계':'quad_func_s4'
              };
              
              const matchedEngDirKey = Object.keys(koToEngDict).find(k => k.replace(/\s+/g, '') === cleanDirName);
              const engDirName = matchedEngDirKey ? koToEngDict[matchedEngDirKey] : cleanDirName;
              
              const tryKey1 = `${engDirName}/${fileName}`;
              const tryKey2 = `${engDirName}/${fileName.replace(/\.webp$/, '.png')}`;
              const tryKey3 = `${engDirName}/${fileName.replace(/\.png$/, '.webp')}`;
              
              if (mathTextsData && mathTextsData[tryKey1]) {
                currentProblemText = mathTextsData[tryKey1];
              } else if (mathTextsData && mathTextsData[tryKey2]) {
                currentProblemText = mathTextsData[tryKey2];
              } else if (mathTextsData && mathTextsData[tryKey3]) {
                currentProblemText = mathTextsData[tryKey3];
              }
          }

          // [FALLBACK] 만약 여전히 매핑에 실패했다면, mathTextsData의 모든 키들을 뒤져서 
          // 현재 formattedIdx가 매칭되고, 폴더명이 cleanCurrent를 포함하는 키를 동적으로 찾아낸다!
          if (!currentProblemText && mathTextsData) {
              const matchedKey = Object.keys(mathTextsData).find(k => {
                  const kDecoded = decodeURIComponent(k);
                  const cleanK = kDecoded.replace(/\s+/g, '').replace(/[(]\d+[)]/g, '').replace(/개념/g, '');
                  return cleanK.includes(cleanCurrent) && 
                         (kDecoded.endsWith(`/${formattedIdx}.webp`) || kDecoded.endsWith(`/${formattedIdx}.png`));
              });
              if (matchedKey) {
                  currentProblemText = mathTextsData[matchedKey];
              }
          }
      }
      
      // [STRICT RULE] 수학2(수2)의 모든 문제는 KaTeX 텍스트가 아닌 WEBP 이미지 크롭으로 렌더링되도록 처리
      const isMath2 = selectedCourse === '수2' || selectedCourse === '수학2' || 
                      (currentUnit && (
                        currentUnit.includes('도함수') || 
                        currentUnit.includes('정적분') || 
                        currentUnit.includes('부정적분') || 
                        currentUnit.includes('함수의극한') || 
                        currentUnit.includes('함수의연속') ||
                        currentUnit.includes('함수의 극한') ||
                        currentUnit.includes('함수의 연속') ||
                        currentUnit.includes('미분계수') ||
                        currentUnit.includes('미분의활용')
                      ) && !currentUnit.includes('여러가지') && !currentUnit.includes('초월함수') && !currentUnit.includes('극한2') && !currentUnit.includes('극한4단계') && !currentUnit.includes('급수4단계') && !currentUnit.includes('적분4단계'));
      
      // [STRICT RULE] 미적분 4단계도 KaTeX가 불완전하므로 WEBP 이미지로 강제
      const isCalc4 = currentUnit && (
        currentUnit.includes('4단계') && (
          selectedCourse === '미적분' ||
          currentUnit.includes('극한4단계') || currentUnit.includes('급수4단계') ||
          currentUnit.includes('미분법 4단계') || currentUnit.includes('미분법4단계') ||
          currentUnit.includes('도함수의 활용 4단계') ||
          currentUnit.includes('적분4단계') || currentUnit.includes('적분 4단계') ||
          currentUnit.includes('정적분의 활용 4단계')
        )
      );

      if (isMath2 || isCalc4) {
          currentProblemText = null;
      }
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

  if (isMobile) {
    const sidebarData = getSidebarData();
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="classroom-main-mobile" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', color: 'var(--mc-text)', overflowY: 'visible', overflowX: 'hidden' }}>
        
        {/* 1. 상단 수업 헤더 */}
        <div style={{ padding: '0.8rem', background: 'var(--mc-surface)', borderBottom: '1px solid var(--mc-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {(() => {
              let stageText = '';
              let limitText = '';
              if (selectedUnit) {
                if (selectedUnit.includes('2단계')) {
                  stageText = '2단계';
                  limitText = '4분';
                } else if (selectedUnit.includes('3단계')) {
                  stageText = '3단계';
                  limitText = '5분';
                } else if (selectedUnit.includes('4단계')) {
                  stageText = '4단계';
                  limitText = '6분';
                }
              }
              let displayTitle = currentPhaseFlow.title;
              if (displayTitle.includes('개필수') || displayTitle.includes('명확한')) {
                displayTitle = '훈련 단계';
              }
              const formattedTitle = stageText ? `${stageText} 훈련 (${limitText})` : (displayTitle + (currentPhaseFlow.duration ? ` (${currentPhaseFlow.duration}분)` : ''));
              
              return (
                <span style={{ fontSize: '0.8rem', color: 'var(--mc-primary)', fontWeight: 'bold', letterSpacing: '0.3px' }}>
                  {formattedTitle.toUpperCase()}
                </span>
              );
            })()}
            
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {/* Global Session Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '12px' }}>
                <Clock size={11} color="var(--mc-danger)" />
                <span style={{ fontSize: '0.68rem', color: 'var(--mc-danger)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>수업 {formatTime(timeLeft)}</span>
              </div>
              {/* Problem Countdown Timer */}
              {problemTimeLeft > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  background: problemTimeLeft <= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)', 
                  border: problemTimeLeft <= 60 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', 
                  padding: '3px 8px', 
                  borderRadius: '12px' 
                }}>
                  <Clock size={11} color={problemTimeLeft <= 60 ? '#D97706' : 'var(--mc-primary)'} />
                  <span style={{ color: problemTimeLeft <= 60 ? '#D97706' : 'var(--mc-primary)', fontWeight: 'bold', fontSize: '0.68rem' }}>{formatTime(problemTimeLeft)}</span>
                  <span style={{ fontSize: '0.65rem', color: problemTimeLeft <= 60 ? '#D97706' : 'var(--mc-primary)', whiteSpace: 'nowrap', fontWeight: 'bold', opacity: 0.8 }}>(1문)</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 모바일용 과목(selectedCourse) 변경 드롭다운 추가 */}
          <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--mc-text-muted)', marginBottom: '0.2rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}><BookOpen size={13} /> 과목 선택</div>
          {isG1Teacher ? (
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ width: '100%', background: 'var(--mc-surface)', border: '1px solid var(--mc-border-strong)', color: 'var(--mc-text)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.3rem' }}
            >
              <option value="수학상">고1 수학(상/하)</option>
            </select>
          ) : isG2Teacher ? (
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ width: '100%', background: 'var(--mc-surface)', border: '1px solid var(--mc-border-strong)', color: 'var(--mc-text)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.3rem' }}
            >
              <option value="수학1" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학1 (대수)</option>
              <option value="수2" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학2</option>
            </select>
          ) : (
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ width: '100%', background: 'var(--mc-surface)', border: '1px solid var(--mc-border-strong)', color: 'var(--mc-text)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.3rem' }}
            >
              <option value="수학1" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학1 (대수)</option>
              <option value="수2" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학2</option>
              <option value="미적분">미적분 (심화)</option>
              <option value="확률과통계">확률과 통계 (수능)</option>
              <option value="모의고사">멘토스 모의고사</option>
            </select>
          )}

          <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--mc-text-muted)', marginBottom: '0.2rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Hash size={13} /> 단원 · 문제번호</div>
          <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
            <select
              value={selectedUnit || ''}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setTestProblemIdx(1);
              }}
              style={{ flex: 1, background: 'var(--mc-surface)', border: '1px solid var(--mc-border-strong)', color: 'var(--mc-text)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <option value="">단원 선택</option>
              {sidebarData.sections.map(sec => (
                <optgroup key={sec.name} label={sec.name} style={{ background: '#FFFFFF', color: '#1A1A1A', fontWeight: 'bold' }}>
                  {sec.items.map(item => (
                    <option key={item} value={item} style={{ background: '#FFFFFF', color: '#1A1A1A' }}>{item}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
              value={testProblemIdx}
              onChange={(e) => setTestProblemIdx(Number(e.target.value))}
              style={{ width: '80px', background: 'var(--mc-surface)', border: '1px solid var(--mc-border-strong)', color: 'var(--mc-text)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                <option key={n} value={n} style={{ background: '#FFFFFF', color: '#1A1A1A' }}>{n}번</option>
              ))}
            </select>
          </div>


        </div>

        <div style={{ flex: 1, padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', boxSizing: 'border-box' }}>
          
          <FreeTrialBanner />

          {/* 2. 문제 카드 크게 표시 & 3. 문제 이미지/KaTeX 전체 표시 */}
          <div
            className="math-problem-card-mobile-container mc-animate-in"
            style={{ 
              width: 'calc(100% + 1.6rem)', 
              marginLeft: '-0.8rem', 
              marginRight: '-0.8rem',
              boxSizing: 'border-box', 
              height: 'auto', 
              minHeight: '220px',
              maxHeight: '46vh',
              overflowY: 'auto', 
              background: 'var(--bg-glass)', 
              padding: '1rem 0.8rem', 
              borderRadius: '0px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'stretch', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
              color: 'var(--text-main)',
              borderBottom: '2px solid var(--border-glass)',
              position: 'relative'
            }}
          >
            {!chalkboardData && (
              <h3 style={{ margin: '0 0 0.6rem 0', color: 'var(--accent-primary)', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', flexShrink: 0 }}>
                [{currentProblemTitle || '오늘의 실전 문제'}]
              </h3>
            )}
            
            {chalkboardData ? (
              <ProblemCard data={chalkboardData} sourceImage={currentProblemImage} title={currentProblemTitle} fallbackText={currentProblemText} />
            ) : currentProblemText ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <MathProblemRenderer 
                  text={currentProblemText} 
                  title={currentProblemTitle} 
                  sourceImage={currentProblemImage} 
                  choices={currentProblemRawData?.choices}
                />
              </div>
            ) : currentProblemImage ? (
              <img 
                 key={currentProblemImage}
                 src={currentProblemImage} 
                 alt="오늘의 문제" 
                 onClick={() => setExpandedProblemImage(currentProblemImage)}
                 style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain', borderRadius: '8px', cursor: 'zoom-in' }} 
                 onError={(e) => { 
                   e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><rect width='600' height='200' fill='%23f8fafc' rx='8' stroke='%23cbd5e1' stroke-width='2' stroke-dasharray='4'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='14'>⚠ 문제 서버 준비 중</text></svg>";
                   e.target.onclick = null;
                 }}
              />
            ) : (
              <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>문제를 불러오는 중입니다...</div>
            )}
          </div>

          {/* 4. 정답 선택/입력 & 5. 정답 제출 버튼 */}
          <div style={{ padding: '0.7rem 0.8rem', background: 'var(--mc-surface-sunken)', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ color: 'var(--mc-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={15} /> 정답 채점</strong>
              <div style={{ display: 'flex', gap: '6px', flex: '1 1 100%', marginTop: '0.15rem' }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedAnswer(num);
                      setUserAnswer(String(num));
                    }}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: 'var(--mc-r-md)',
                      background: selectedAnswer === num ? 'var(--mc-primary)' : 'var(--mc-surface)',
                      color: selectedAnswer === num ? '#FFFFFF' : 'var(--mc-text)',
                      border: selectedAnswer === num ? '2px solid var(--mc-primary)' : '1px solid var(--mc-border-strong)',
                      cursor: 'pointer',
                      fontWeight: 'bold', fontSize: '1.05rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background .15s ease, border-color .15s ease, transform .12s ease'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <input 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="주관식 직접 입력" 
              value={userAnswer}
              onChange={(e) => { 
                const filtered = e.target.value.replace(/[^0-9]/g, '');
                setUserAnswer(filtered); 
                setSelectedAnswer(null); 
              }}
              style={{ width: '100%', padding: '0.6rem 0.7rem', borderRadius: 'var(--mc-r-sm)', border: '1px solid var(--mc-border-strong)', background: 'var(--mc-surface)', color: 'var(--mc-text)', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />

            <button
              className="mc-btn mc-btn--success"
              onClick={handleGradeAnswer} style={{ width: '100%', fontSize: '0.9rem' }}
            >
              <CheckCircle size={16} /> 정답 제출
            </button>

            {gradingResult === 'correct' && (
              <div style={{ color: 'var(--mc-secondary)', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle size={15} /> 정답입니다! AVS풀이로 풀이 과정을 확인해보세요.
              </div>
            )}
            {gradingResult === 'incorrect' && (
              <div style={{ color: 'var(--mc-danger)', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <XCircle size={15} /> 다시 풀어보세요. 필요하면 AVS풀이를 확인하세요.
              </div>
            )}
          </div>

          {/* 6. AVS풀이 버튼 */}
          {(['core', 'step', 'mock'].includes(currentPhaseFlow?.phase) || selectedUnit) && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="mc-btn mc-btn--avs"
              onClick={handleAvsClick} style={{ width: '100%', fontSize: '0.95rem' }}
            >
              <Sparkles size={17} /> AVS풀이
            </motion.button>
          )}

          {/* 7. AVS 클릭 시 문제 아래에 큰 AVS 영역 펼침 (아코디언 형태로) */}
          {showAvsAccordion && (
            <div style={{ padding: '0.8rem', background: 'var(--mc-avs-weak)', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-avs)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--mc-border)', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--mc-avs)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Sparkles size={15} /> AVS풀이 영역</span>
                <button
                  onClick={() => setShowAvsAccordion(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--mc-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  닫기
                </button>
              </div>

              <div style={{ color: 'var(--mc-text)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {messages
                  .filter(m => m.role === 'assistant' && (m.hintPlayer || m.dynamicData || m.animationId))
                  .slice(-1)
                  .map((m, idx) => (
                    <div key={idx} style={{ width: '100%' }}>
                      <div style={{ marginBottom: '0.5rem', color: 'var(--mc-text-muted)' }}>{m.content}</div>
                      
                      {m.animationId === 'sine_rule' && <div style={{width: '100%'}}><SineRuleAnimation /></div>}
                      {m.animationId === 'cosine_rule' && <div style={{width: '100%'}}><CosineRuleAnimation /></div>}
                      {m.animationId === 'triangle_area' && <div style={{width: '100%'}}><TriangleAreaAnimation /></div>}
                      {m.dynamicData && <div style={{width: '100%'}}><DynamicProblemAnimation data={m.dynamicData} /></div>}
                      {m.hintPlayer && (() => {
                        let mappedU = m.hintPlayer.unit;
                        const calcMapping = {
                          '[2단계] 수열의극한': '1)극한2',
                          '[4단계] 수열의극한': '1)극한4단계',
                          '[2단계] 급수': '2)급수2',
                          '[4단계] 급수': '2)급수4단계',
                          '[2단계] 지수로그함수의극한': '3)지수로그함수의극한',
                          '[2단계] 삼각함수합성과 여러 가지 공식': '4)삼각함수합성과미분',
                          '[2단계] 삼각함수합성과미분': '4)삼각함수합성과미분',
                          '[4단계] 지수로그삼각함수 미분': '3)지수로그삼각함수의 미분법 4단계',
                          '[2단계] 여러가지미분법2': '5)여러가지미분법2',
                          '[4단계] 여러가지 미분법': '4)여러가지 미분법 4단계',
                          '[2단계] 도함수의활용1': '6)도함수의활용1',
                          '[2단계] 도함수의활용2': '7)도함수의활용2',
                          '[4단계] 도함수의 활용': '5)도함수의 활용 4단계',
                          '[2단계] 여러가지 적분법': '7)여러가지적분',
                          '[4단계] 여러가지 함수의 적분': '6)여러가지 함수의 적분4단계',
                          '[2단계] 초월함수의 정적분': '8)정적분',
                          '[4단계] 정적분의 활용': '7)정적분의 활용 4단계'
                        };
                        mappedU = calcMapping[mappedU] || mappedU;
                        
                        let msgProblemImage = null;
                        if (['1)극한2', '2)급수2', '3)지수로그함수의극한', '4)삼각함수합성과미분', '5)여러가지미분법2', '6)도함수의활용1', '7)도함수의활용2', '7)여러가지적분', '8)정적분'].includes(mappedU)) {
                           const calcSymlinksMsg = {
                              '1)극한2': 'calc1',
                              '2)급수2': 'calc2',
                              '3)지수로그함수의극한': 'calc3',
                              '4)삼각함수합성과미분': 'calc4',
                              '5)여러가지미분법2': 'calc5',
                              '6)도함수의활용1': 'calc6',
                              '7)도함수의활용2': 'calc7_1',
                              '7)여러가지적분': 'calc7_2',
                              '8)정적분': 'calc8'
                           };
                           const imgF = calcSymlinksMsg[mappedU] || mappedU;
                           msgProblemImage = window.resolveAsset(`/math_crops/미적분/2단계/${imgF}/${m.hintPlayer.problemId}.webp`)
                        } else if (['1)극한4단계', '2)급수4단계', '3)지수로그삼각함수의 미분법 4단계', '4)여러가지 미분법 4단계', '5)도함수의 활용 4단계', '6)여러가지 함수의 적분4단계', '7)정적분의 활용 4단계'].includes(mappedU)) {
                           msgProblemImage = window.resolveAsset(`/math_crops/미적분/4단계/${mappedU}/${m.hintPlayer.problemId}.webp`)
                        } else if (mappedU && (mappedU.includes('등차') || mappedU.includes('등비'))) {
                           msgProblemImage = window.resolveAsset(`/math_crops/수학1 중간/2단계/등차등비2단계/${m.hintPlayer.problemId}.webp`)
                        } else if (['1)순열', '2)중복조합', '3)이항정리', '4)확률의뜻', '5)덧셈정리_조건부확률_독립시행', '6)확률변수와이항분포', '7)연속확률분포와정규분포', '8)표본평균과모평균'].includes(mappedU)) {
                           msgProblemImage = window.resolveAsset(`/math_crops/확통수능/${mappedU}/${m.hintPlayer.problemId}.webp`)
                        } else if (selectedCourse === `수2`) {
                           msgProblemImage = window.resolveAsset(`/math_crops/(7)수학2/${mappedU}/${m.hintPlayer.problemId}.webp`)
                        }

                        return (
                          <div style={{marginTop: '0.5rem', width: '100%'}}>
                            <HintPlayerRouter unit={m.hintPlayer.unit} problemId={m.hintPlayer.problemId} problemImage={msgProblemImage} showQA={false} />
                          </div>
                        );
                      })()}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 8. 보조 액션 (다음 문제 · 프리미엄) 2열 그룹 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              className="mc-btn mc-btn--ghost"
              onClick={testAdvance} style={{ width: '100%', fontSize: '0.88rem' }}
            >
              다음 문제 <ChevronRight size={16} />
            </button>
            <button
              className="mc-btn mc-btn--ghost"
              onClick={() => setShowPremiumLecture(true)}
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              <Crown size={16} color="var(--mc-secondary)" /> 프리미엄 강의
            </button>
          </div>

          {/* 9. 질문 입력창 (화면 하단 = 엄지 도달 영역) */}
          <div style={{ padding: '0.55rem 0.7rem', background: 'var(--mc-surface)', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: 'var(--mc-shadow-sm)' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
               <label style={{ cursor: 'pointer', padding: '0.55rem', borderRadius: 'var(--mc-r-sm)', background: 'var(--mc-surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--mc-border)' }} title="문제 올리기">
                 <Paperclip size={16} color="var(--mc-text-muted)" />
                 <input type="file" hidden accept="image/*,.pdf" onChange={handleProblemUpload} />
               </label>

               <input
                  type="text"
                  placeholder="질문 또는 의견 입력..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit(); }}
                  style={{ flex: 1, minWidth: 0, padding: '0.6rem 0.7rem', borderRadius: 'var(--mc-r-sm)', border: '1px solid var(--mc-border-strong)', background: 'var(--mc-surface)', color: 'var(--mc-text)', fontSize: '0.85rem' }}
               />

               <button
                  title="음성 입력"
                  style={{ padding: '0.55rem', borderRadius: 'var(--mc-r-sm)', background: isRecording ? 'var(--mc-danger)' : 'var(--mc-surface)', border: isRecording ? 'none' : '1px solid var(--mc-border-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={toggleRecording}
               >
                 <Mic size={16} color={isRecording ? "white" : "var(--mc-text-muted)"} />
               </button>

               <button onClick={handleSubmit} disabled={loading} style={{ padding: '0 1rem', borderRadius: 'var(--mc-r-sm)', height: '40px', display: 'flex', alignItems: 'center', fontSize: '0.85rem', background: 'var(--mc-primary)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                 {loading ? '...' : '전송'}
               </button>
            </div>
          </div>

        </div>

        {showConceptModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-glass)', borderRadius: '16px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} color="#3b82f6" /> 
                  [{isSenior ? '통합 수학' : currentUnit}] 개념카드
                </h3>
                <button onClick={() => setShowConceptModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mc-text-muted)' }}>
                  <CloseIcon size={20} />
                </button>
              </div>
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {filteredCards.length > 0 ? (
                  filteredCards.map((card, idx) => (
                    <div 
                      key={card.id || idx} 
                      style={{ background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                      onClick={() => setSelectedExpandedCard(card)}
                    >
                      <div style={{ padding: '0.6rem', background: 'var(--bg-glass)', borderBottom: '1px solid var(--border-glass)', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-main)' }}>
                        [{card.unit || '공통'}] {card.title || card.card_title || '개념'}
                      </div>
                      <div style={{ background: 'white', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                        {card.content ? (
                          <div style={{ width: '100%', pointerEvents: 'none', fontSize: '0.8rem' }}>
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{card.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <img src={window.resolveAsset(`/concept_cards/${card.image_path}`)} alt={card.card_title} style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'contain' }} />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--mc-text-muted)', fontSize: '0.85rem' }}>개념카드가 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedExpandedCard && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedExpandedCard(null)}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', width: '90%', maxHeight: '90vh', overflowY: 'auto', color: 'black' }} onClick={(e) => e.stopPropagation()}>
              {selectedExpandedCard.content ? (
                <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  <h3>{selectedExpandedCard.title || selectedExpandedCard.card_title}</h3>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedExpandedCard.content}</ReactMarkdown>
                </div>
              ) : (
                <img src={window.resolveAsset(`/concept_cards/${selectedExpandedCard.image_path}`)} alt={selectedExpandedCard.card_title} style={{ width: '100%', height: 'auto' }} />
              )}
            </div>
          </div>
        )}

        {expandedProblemImage && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExpandedProblemImage(null)}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', maxWidth: '95vw', maxHeight: '95vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <img src={expandedProblemImage} alt="확대" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>
        )}

        {showPremiumLecture && (
          <PremiumLectureModal onClose={() => setShowPremiumLecture(false)} />
        )}

        {showReport && (() => {
          const history = JSON.parse(localStorage.getItem('localGradingHistory') || '[]');
          const correctCount = history.filter(h => h.isCorrect).length;
          const totalCount = history.length;
          const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
          
          return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--mc-surface)', borderRadius: 'var(--mc-r-lg)', width: '90%', maxWidth: '420px', border: '1px solid var(--mc-border)', overflow: 'hidden', boxShadow: 'var(--mc-shadow-lg)' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), #059669)', padding: '1.2rem', textAlign: 'center', color: '#FFFFFF' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>오늘의 학습 리포트</h3>
                </div>
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <div style={{ background: 'var(--mc-surface-sunken)', border: '1px solid var(--mc-border)', padding: '0.8rem', borderRadius: 'var(--mc-r-md)', textAlign: 'center' }}>
                      <div style={{ color: 'var(--mc-text-muted)', fontSize: '0.75rem' }}>푼 문제 / 정답</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--mc-secondary)' }}>{totalCount} / {correctCount}</div>
                    </div>
                    <div style={{ background: 'var(--mc-surface-sunken)', border: '1px solid var(--mc-border)', padding: '0.8rem', borderRadius: 'var(--mc-r-md)', textAlign: 'center' }}>
                      <div style={{ color: 'var(--mc-text-muted)', fontSize: '0.75rem' }}>정답률</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--mc-primary)' }}>{accuracy}%</div>
                    </div>
                  </div>
                  <button
                    className="mc-btn mc-btn--success"
                    onClick={() => {
                      setShowReport(false);
                      navigate('/dashboard');
                    }}
                    style={{ width: '100%' }}
                  >
                    수업 종료 및 대시보드로 이동
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    );
  }

  return (
    <div className="classroom-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', color: 'var(--text-main)' }}>
      <div className="math-top-bar" style={{ padding: '0.7rem 1.25rem', background: 'var(--mc-surface)', borderBottom: '1px solid var(--mc-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--mc-text)' }}>
        {/* Left: brand + breadcrumb */}
        <div className="math-top-info" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: '11px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.32)', flexShrink: 0 }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0, lineHeight: 1.15 }}>
              <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--mc-text)' }}>AVS 풀이</div>
              <div style={{ fontSize: '0.71rem', color: 'var(--mc-text-subtle)', fontWeight: 600, letterSpacing: '0.3px' }}>AI Math Tutor</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--mc-text-muted)', fontSize: '0.84rem', fontWeight: 600, minWidth: 0, paddingLeft: '4px', borderLeft: '1px solid var(--mc-border)', marginLeft: '2px' }}>
            <span style={{ whiteSpace: 'nowrap', paddingLeft: '10px' }}>{selectedCourse || '수학'}</span>
            <ChevronRight size={13} color="var(--mc-text-subtle)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '230px' }}>{selectedUnit || currentUnit || '단원 선택'}</span>
            {currentPhaseFlow?.title && (
              <>
                <ChevronRight size={13} color="var(--mc-text-subtle)" />
                <span style={{ color: 'var(--mc-primary)', whiteSpace: 'nowrap', fontWeight: 700 }}>{currentPhaseFlow.title}</span>
              </>
            )}
          </div>
        </div>
        {/* Right: timer chip + actions */}
        <div className="math-top-actions" style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.9rem', background: 'var(--mc-surface-sunken)', border: '1px solid var(--mc-border)', borderRadius: 'var(--mc-r-pill)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--mc-text)', whiteSpace: 'nowrap' }}>
              <Clock size={15} color="var(--mc-danger)" />
              <span style={{ color: 'var(--mc-text-subtle)', fontSize: '0.72rem', fontWeight: 600 }}>수업 시간</span>
              <span style={{ fontFamily: 'monospace' }}>{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
              {problemTimeLeft > 0 && (
                <span style={{ color: problemTimeLeft <= 60 ? '#D97706' : 'var(--mc-primary)', fontFamily: 'monospace', fontWeight: 700, paddingLeft: '6px', marginLeft: '2px', borderLeft: '1px solid var(--mc-border)' }}>{String(Math.floor(problemTimeLeft / 60)).padStart(2, '0')}:{String(problemTimeLeft % 60).padStart(2, '0')}</span>
              )}
            </span>
            {/* AVS풀이 버튼 추가 */}
            {(['core', 'step', 'mock'].includes(currentPhaseFlow?.phase) || selectedUnit) && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onClick={() => {
                  const targetUnit = selectedUnit || currentUnit;
                  if (targetUnit) {
                    // 사용자 요청: AVS 버튼 클릭 시 "나:" 채팅 메시지는 띄우지 않음
                    setTimeout(() => {
                      const pid = String(testProblemIdx).padStart(3, '0');
                      setMessages(prev => {
                        const cleaned = prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m);
                        return [...cleaned, { 
                          role: 'assistant', 
                          content: '',
                          hintPlayer: { unit: targetUnit, problemId: pid }
                        }];
                      });
                    }, 500);
                  } else {
                    alert("선택된 단원이 없습니다. 좌측 메뉴에서 세부 단원/단계를 선택해주세요.");
                  }
                }}
                className="mc-btn mc-btn--avs"
                style={{ padding: '0.78rem 1.6rem', fontSize: '1.02rem', letterSpacing: '0.2px' }}
              >
                <Sparkles size={18} /> AVS풀이
              </motion.button>
            )}

            <button
              className="mc-btn mc-btn--ghost"
              onClick={() => setShowPremiumLecture(true)}
            >
              <Crown size={16} color="var(--mc-secondary)" /> 프리미엄
            </button>
            <button
              className="mc-btn mc-btn--ghost"
              onClick={() => setShowEndEarlyModal && setShowEndEarlyModal(true)}
              title="수업 종료"
              style={{ padding: '0.72rem 0.85rem' }}
            >
              <LogOut size={16} />
            </button>
        </div>
      </div>

      <motion.div
        className="mc-stage-scroll"
        style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── 칠판형 문제 카드 (problem_render가 있으면 우선) ── */}
        {chalkboardData ? (
          <ProblemCard data={chalkboardData} sourceImage={currentProblemImage} title={currentProblemTitle} fallbackText={currentProblemText} />
        ) : (currentProblemImage || currentProblemTitle) ? (
          <div className="mc-animate-in" style={{ padding: '1.25rem 1.5rem', background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 'var(--mc-r-lg)', marginBottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'stretch', boxShadow: 'var(--mc-shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '0.35rem 0.85rem', background: 'var(--mc-primary-weak)', color: 'var(--mc-primary)', borderRadius: 'var(--mc-r-pill)', fontWeight: 700, fontSize: '0.8rem' }}>
                <BookOpen size={14} /> {currentProblemTitle || '오늘의 실전 문제'}
              </span>
              {currentProblemImage && (
                <button onClick={() => setExpandedProblemImage(currentProblemImage)} className="mc-btn mc-btn--ghost" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                  <Camera size={15} /> 원본 이미지 보기
                </button>
              )}
            </div>

            {/* KaTeX 수식 기반 문제 텍스트 렌더링 (우선순위) - MathProblemRenderer 전용 컴포넌트 */}
            {currentProblemText ? (
              <div style={{ width: '100%', padding: '0.5rem 1rem' }}>
                <MathProblemRenderer 
                  text={currentProblemText} 
                  title={currentProblemTitle} 
                  sourceImage={currentProblemImage} 
                  choices={currentProblemRawData?.choices}
                />
              </div>
            ) : currentProblemImage && (
              <img 
                 key={currentProblemImage}
                 src={currentProblemImage} 
                 alt="오늘의 문제" 
                 onClick={() => setExpandedProblemImage(currentProblemImage)}
                 className="hover-scale"
                 style={{ width: '100%', height: 'auto', maxHeight: '550px', objectFit: 'contain', borderRadius: '8px', cursor: 'zoom-in', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                 onError={(e) => { 
                   e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><rect width='600' height='200' fill='%23f8fafc' rx='8' stroke='%23cbd5e1' stroke-width='2' stroke-dasharray='4'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='16'>⚠ 해당 단계의 문제 이미지가 서버에 아직 업로드되지 않았습니다. (데이터 구축 예정)</text></svg>";
                   e.target.style.cursor = 'default';
                   e.target.onclick = null;
                 }}
              />
            )}
          </div>
        ) : null}

        {/* 상시 노출 AVS 풀이 보드 (레퍼런스 lecture.png — 중앙 고정 패널). 사용자가 AVS풀이를 눌러 스레드에 띄우면 중복 방지를 위해 숨김 */}
        {(selectedUnit || currentUnit) && !messages.some(m => m.hintPlayer) && (
          <div className="mc-animate-in" style={{ width: '100%' }}>
            <HintPlayerRouter
              unit={selectedUnit || currentUnit}
              problemId={String(testProblemIdx).padStart(3, '0')}
              problemImage={null}
              showQA={false}
            />
          </div>
        )}

        {uploadedProblem && (
          <div style={{ padding: '1rem', background: 'var(--mc-primary-weak)', border: '1px dashed var(--mc-primary)', borderRadius: 'var(--mc-r-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={uploadedProblem} alt="Upload Preview" style={{ height: '80px', borderRadius: 'var(--mc-r-sm)' }} />
            <div>
              <p style={{ color: 'var(--mc-primary)', fontWeight: 'bold', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Upload size={16} /> 외부 문제 업로드 대기중</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--mc-text-muted)', margin: 0 }}>메시지를 전송하면 선생님이 해당 문제를 기준으로 해설을 시작합니다.</p>
            </div>
          </div>
        )}

        {messages
          .filter((m, i, arr) => {
            if (m.role === 'system') return true; // Keep system notifications (like initial hints or file uploads)
            // Count how many non-system messages appear AFTER this message
            const laterNonSystemCount = arr.slice(i + 1).filter(msg => msg.role !== 'system').length;
            // Only show the most recent 2 non-system messages (1 user, 1 assistant)
            return laterNonSystemCount < 2;
          })
          .map((m, idx) => {
          if (m.role === 'system') {
             return <div key={idx} style={{ textAlign: 'center', color: 'var(--mc-text-muted)', fontSize: '0.85rem', margin: '1rem 0' }}>{m.content}</div>;
          }
          return (
            <div key={idx} className="mc-animate-in" style={{ textAlign: m.role === 'user' ? 'right' : 'left', marginBottom: '1.5rem', width: '100%' }}>
              <div style={{
                display: 'inline-block',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--mc-r-md)',
                background: m.role === 'user' ? 'var(--mc-primary)' : 'var(--mc-surface)',
                color: m.role === 'user' ? '#fff' : 'var(--mc-text)',
                border: m.role === 'user' ? 'none' : '1px solid var(--mc-border)',
                boxShadow: (m.animationId || m.dynamicData || m.hintPlayer) ? 'none' : 'var(--mc-shadow-sm)',
                maxWidth: (m.animationId || m.dynamicData || m.hintPlayer) ? '100%' : '80%',
                width: (m.animationId || m.dynamicData || m.hintPlayer) ? '100%' : 'auto',
                lineHeight: '1.55',
                whiteSpace: 'pre-wrap',
                textAlign: 'left',
                boxSizing: 'border-box'
              }}>
                {m.content && (<><strong style={{ color: m.role === 'user' ? 'rgba(255,255,255,0.85)' : 'var(--mc-primary)' }}>{m.role === 'user' ? '나' : ssot.name}:</strong><br/>{m.content}</>)}
                {m.animationId === 'sine_rule' && <div style={{marginTop: '1.5rem', width: '100%'}}><SineRuleAnimation /></div>}
                {m.animationId === 'cosine_rule' && <div style={{marginTop: '1.5rem', width: '100%'}}><CosineRuleAnimation /></div>}
                {m.animationId === 'triangle_area' && <div style={{marginTop: '1.5rem', width: '100%'}}><TriangleAreaAnimation /></div>}
                {m.dynamicData && <div style={{marginTop: '1.5rem', width: '100%'}}><DynamicProblemAnimation data={m.dynamicData} /></div>}
                {m.hintPlayer && (() => {
                  let mappedU = m.hintPlayer.unit;
                  const calcMapping = {
                    '[2단계] 수열의극한': '1)극한2',
                    '[4단계] 수열의극한': '1)극한4단계',
                    '[2단계] 급수': '2)급수2',
                    '[4단계] 급수': '2)급수4단계',
                    '[2단계] 지수로그함수의극한': '3)지수로그함수의극한',
                    '[2단계] 삼각함수합성과 여러 가지 공식': '4)삼각함수합성과미분',
                    '[2단계] 삼각함수합성과미분': '4)삼각함수합성과미분',
                    '[4단계] 지수로그삼각함수 미분': '3)지수로그삼각함수의 미분법 4단계',
                    '[2단계] 여러가지미분법2': '5)여러가지미분법2',
                    '[4단계] 여러가지 미분법': '4)여러가지 미분법 4단계',
                    '[2단계] 도함수의활용1': '6)도함수의활용1',
                    '[2단계] 도함수의활용2': '7)도함수의활용2',
                    '[4단계] 도함수의 활용': '5)도함수의 활용 4단계',
                    '[2단계] 여러가지 적분법': '7)여러가지적분',
                    '[4단계] 여러가지 함수의 적분': '6)여러가지 함수의 적분4단계',
                    '[2단계] 초월함수의 정적분': '8)정적분',
                    '[4단계] 정적분의 활용': '7)정적분의 활용 4단계',
                    '[2단계] 삼각함수합성과 여러 가지 공식': '4)삼각함수합성과미분'
                  };
                  mappedU = calcMapping[mappedU] || mappedU;
                  
                  let msgProblemImage = null;
                  if (['1)극한2', '2)급수2', '3)지수로그함수의극한', '4)삼각함수합성과미분', '5)여러가지미분법2', '6)도함수의활용1', '7)도함수의활용2', '7)여러가지적분', '8)정적분'].includes(mappedU)) {
                     const calcSymlinksMsg = {
                        '1)극한2': 'calc1',
                        '2)급수2': 'calc2',
                        '3)지수로그함수의극한': 'calc3',
                        '4)삼각함수합성과미분': 'calc4',
                        '5)여러가지미분법2': 'calc5',
                        '6)도함수의활용1': 'calc6',
                        '7)도함수의활용2': 'calc7_1',
                        '7)여러가지적분': 'calc7_2',
                        '8)정적분': 'calc8'
                     };
                     const imgF = calcSymlinksMsg[mappedU] || mappedU;
                     msgProblemImage = window.resolveAsset(`/math_crops/미적분/2단계/${imgF}/${m.hintPlayer.problemId}.webp`)
                  } else if (['1)극한4단계', '2)급수4단계', '3)지수로그삼각함수의 미분법 4단계', '4)여러가지 미분법 4단계', '5)도함수의 활용 4단계', '6)여러가지 함수의 적분4단계', '7)정적분의 활용 4단계'].includes(mappedU)) {
                     msgProblemImage = window.resolveAsset(`/math_crops/미적분/4단계/${mappedU}/${m.hintPlayer.problemId}.webp`)
                  } else if (mappedU && (mappedU.includes('등차') || mappedU.includes('등비'))) {
                     msgProblemImage = window.resolveAsset(`/math_crops/수학1 중간/2단계/등차등비2단계/${m.hintPlayer.problemId}.webp`) // fallback
                  } else if (['1)순열', '2)중복조합', '3)이항정리', '4)확률의뜻', '5)덧셈정리_조건부확률_독립시행', '6)확률변수와이항분포', '7)연속확률분포와정규분포', '8)표본평균과모평균'].includes(mappedU)) {
                     msgProblemImage = window.resolveAsset(`/math_crops/확통수능/${mappedU}/${m.hintPlayer.problemId}.webp`)
                  } else if (selectedCourse === `수2`) {
                     msgProblemImage = window.resolveAsset(`/math_crops/(7)수학2/${mappedU}/${m.hintPlayer.problemId}.webp`)
                  }

                  return (
                    <div style={{marginTop: '1.5rem', width: '100%'}}>
                      <HintPlayerRouter unit={m.hintPlayer.unit} problemId={m.hintPlayer.problemId} problemImage={msgProblemImage} showQA={false} />
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* 로컬 채점 시스템 */}
      <div className="math-grading-area math-input-bar mc-tray" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="math-grading-row-1" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--mc-secondary)', fontSize: '1rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '7px' }}><CheckCircle size={18} /> 정답 채점</strong>

          <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                className="mc-lift"
                onClick={() => {
                  setSelectedAnswer(num);
                  setUserAnswer(String(num));
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--mc-r-pill)',
                  background: selectedAnswer === num ? 'var(--mc-primary)' : 'var(--mc-surface)',
                  color: selectedAnswer === num ? '#FFFFFF' : 'var(--mc-text)',
                  border: selectedAnswer === num ? '2px solid var(--mc-primary)' : '1px solid var(--mc-border-strong)',
                  cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '1.05rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {num}
              </button>
            ))}
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="주관식은 직접 입력"
            value={userAnswer}
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^0-9]/g, '');
              setUserAnswer(filtered);
              setSelectedAnswer(null);
            }}
            style={{ padding: '0.78rem 0.9rem', borderRadius: 'var(--mc-r-sm)', border: '1px solid var(--mc-border-strong)', background: 'var(--mc-surface)', color: 'var(--mc-text)', flex: 1, minWidth: '120px', fontSize: '0.95rem' }}
          />
        </div>
        <div className="math-grading-row-2" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', width: '100%' }}>
          <button
            className="mc-btn mc-btn--success"
            onClick={handleGradeAnswer}
          >
            <CheckCircle size={17} /> 정답 제출
          </button>
          <button
            className="mc-btn mc-btn--avs"
            onClick={() => {
              const targetUnit = selectedUnit || currentUnit;
              if (targetUnit) {
                // 사용자 요청: AVS 버튼 클릭 시 "나:" 채팅 메시지는 띄우지 않음
                setTimeout(() => {
                  const pid = String(testProblemIdx).padStart(3, '0');
                  setMessages(prev => {
                    const cleaned = prev.map(m => m.dynamicData || m.hintPlayer ? { ...m, dynamicData: undefined, hintPlayer: undefined } : m);
                    return [...cleaned, {
                      role: 'assistant',
                      content: '',
                      hintPlayer: { unit: targetUnit, problemId: pid }
                    }];
                  });
                }, 500);
              } else {
                alert("선택된 단원이 없습니다.");
              }
            }}
          >
            <Sparkles size={17} /> AVS풀이 보기
          </button>
          <button
            className="mc-btn mc-btn--ghost"
            onClick={testAdvance}
          >
            다음 문제 <ChevronRight size={17} />
          </button>
        </div>
        {gradingResult === 'correct' && (
          <div style={{ color: 'var(--mc-secondary)', fontWeight: 'bold', marginTop: '0.7rem', marginLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <CheckCircle size={17} /> 정답입니다. AVS풀이로 풀이 과정을 확인해보세요.
          </div>
        )}
        {gradingResult === 'incorrect' && (
          <div style={{ color: 'var(--mc-danger)', fontWeight: 'bold', marginTop: '0.7rem', marginLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <XCircle size={17} /> 다시 풀어보세요. 필요하면 AVS풀이를 확인하세요.
          </div>
        )}
      </div>

      {/* 하단 고정 입력 바 */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--mc-border)', background: 'var(--mc-surface)' }}>
        <div style={{ marginBottom: '0.8rem', color: 'var(--mc-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          <BookOpen size={16} style={{ marginRight: '6px', color: 'var(--mc-primary)' }}/>
          <strong style={{ color: 'var(--mc-text)', marginRight: '4px' }}>안내:</strong> 현재 단계({currentPhaseFlow.title})의 문제를 확인하고 풀이 과정이나 단서를 질문(입력)하세요.
        </div>

        <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
           <label className="mc-lift" style={{ cursor: 'pointer', padding: '0.8rem', borderRadius: 'var(--mc-r-md)', background: 'var(--mc-surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--mc-border)' }} title="문제 올리기">
             <Paperclip size={20} color="var(--mc-text-muted)" />
             <input type="file" hidden accept="image/*,.pdf" onChange={handleProblemUpload} />
           </label>

           <input
              type="text"
              placeholder="답변을 입력하세요..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit(); }}
              style={{ flex: 1, padding: '0.95rem 1rem', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-border-strong)', background: 'var(--mc-surface)', color: 'var(--mc-text)', fontSize: '0.95rem' }}
           />

           <button
              title="음성 입력 마이크"
              className="mc-lift"
              style={{ padding: '0.8rem', borderRadius: 'var(--mc-r-md)', background: isRecording ? 'var(--mc-danger)' : 'var(--mc-surface)', border: isRecording ? 'none' : '1px solid var(--mc-border-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={toggleRecording}
           >
             <Mic size={20} color={isRecording ? "white" : "var(--mc-text-muted)"} />
           </button>

            <button className="mc-btn mc-btn--primary" onClick={handleSubmit} disabled={loading} style={{ padding: '0 1.5rem', alignSelf: 'stretch', opacity: loading ? 0.6 : 1 }}>
             {loading ? '전송 중…' : <><Send size={18} /> 전송</>}
           </button>
        </div>
      </div>

      {/* ── 개념카드 전용 오버레이 모달 ── */}
      {showConceptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--mc-surface)', borderRadius: 'var(--mc-r-lg)', width: '80%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--mc-border)', overflow: 'hidden', boxShadow: 'var(--mc-shadow-lg)' }}>
            <div style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--mc-border)', background: 'var(--mc-surface-2)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mc-text)', fontSize: '1.1rem' }}>
                <BookOpen size={20} color="var(--mc-primary)" />
                [{isSenior ? '통합 수학 전체' : currentUnit}] 개념카드
              </h3>
              <button 
                onClick={() => setShowConceptModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--mc-text-muted)', cursor: 'pointer' }}
              >
                <CloseIcon size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredCards.length > 0 ? (
                filteredCards.map((card, idx) => (
                  <div 
                    key={card.id || idx} 
                    className="mc-lift"
                    style={{ background: 'var(--mc-surface)', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'zoom-in', boxShadow: 'var(--mc-shadow-sm)' }}
                    onClick={() => setSelectedExpandedCard(card)}
                  >
                    <div style={{ padding: '0.7rem 0.8rem', background: 'var(--mc-surface-2)', borderBottom: '1px solid var(--mc-border)', color: 'var(--mc-text)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
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
                        style={{ width: '100%', height: '300px', objectFit: 'contain' }} 
                        loading="lazy"
                      />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--mc-text-muted)' }}>
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
            <CloseIcon size={36} />
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
            <CloseIcon size={32} />
          </button>
        </div>
      )}

      {/* ── 프리미엄 AI 강의 모달 ── */}
      {showPremiumLecture && (
        <PremiumLectureModal onClose={() => setShowPremiumLecture(false)} />
      )}

      {/* ── 학습 결과 리포트 (대시보드 미리보기) ── */}
      {showReport && (() => {
        const history = JSON.parse(localStorage.getItem('localGradingHistory') || '[]');
        const correctCount = history.filter(h => h.isCorrect).length;
        const totalCount = history.length;
        const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        const avsCount = messages.filter(m => m.hintPlayer).length;
        
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ background: 'var(--mc-surface)', borderRadius: 'var(--mc-r-lg)', width: '90%', maxWidth: '600px', border: '1px solid var(--mc-border)', overflow: 'hidden', boxShadow: 'var(--mc-shadow-lg)' }}>
              <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '2rem', textAlign: 'center', color: 'white' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Award size={32} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>오늘의 학습 리포트</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{teacher.name} 선생님과 함께한 {session.round}회차 수업이 종료되었습니다.</p>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'var(--mc-surface-sunken)', padding: '1.2rem', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-border)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--mc-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>푼 문제 / 정답</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--mc-secondary)' }}>{totalCount} / {correctCount}</div>
                  </div>
                  <div style={{ background: 'var(--mc-surface-sunken)', padding: '1.2rem', borderRadius: 'var(--mc-r-md)', border: '1px solid var(--mc-border)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--mc-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>정답률</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--mc-primary)' }}>{accuracy}%</div>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--mc-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="var(--mc-secondary)" /> 실시간 기록 데이터 (Dashboard)
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.95rem' }}>
                      <span>학습 단원</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--mc-text)' }}>{selectedUnit || '수학 전범위'}</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.95rem' }}>
                      <span>AVS풀이 활용</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--mc-text)' }}>{avsCount}회</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.95rem' }}>
                      <span>취약 개념 추출</span>
                      <span style={{ color: totalCount - correctCount > 0 ? '#D97706' : 'var(--mc-secondary)', fontWeight: 'bold' }}>{totalCount - correctCount > 0 ? '집중 보강 필요' : '매우 양호'}</span>
                    </li>
                  </ul>
                </div>

                {(() => {
                  const correctHwCount = history.filter(h => h.isCorrect).length;
                  const incorrectHwCount = history.filter(h => !h.isCorrect).length;
                  const totalHwCount = (correctHwCount * 1) + (incorrectHwCount * 2);

                  return (
                    <div style={{ background: 'var(--mc-primary-weak)', padding: '1.4rem', borderRadius: 'var(--mc-r-md)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                      <h4 style={{ color: 'var(--mc-primary)', marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '7px' }}><BookOpen size={17} /> 자동 배정된 개인 복습 숙제 ({totalHwCount}문제)</h4>
                      <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.6' }}>
                        수업 데이터 분석 결과, 틀린 문제는 <b>쌍둥이 문제 2개씩</b>, 맞춘 문제는 <b>쌍둥이 문제 1개씩</b> 자동 변형되어 숙제함에 전송되었습니다. 대시보드의 숙제함에서 복습 과제를 해결해보세요!
                      </p>
                    </div>
                  );
                })()}

                <button
                  className="mc-btn mc-btn--success"
                  onClick={() => {
                    setShowReport(false);
                    navigate('/dashboard');
                  }}
                  style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
                >
                  수업 종료 및 대시보드로 이동
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: 'black', height: '100vh', whiteSpace: 'pre-wrap' }}>
          <h2>Crash Detected!</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
          <p>{this.state.error?.stack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function MathClassroomScreenContent() {
  // 세션 시작 시간 기록 (학습시간 계산용)
  if (!window.__mentosSessionStart) window.__mentosSessionStart = Date.now();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { teacherId } = useParams();
  const rawTeacher = location.state?.teacher || (teacherId ? getTeacherById(teacherId) : null) || { id: 'h_math6', name: '윤수아 선생님', courseName: '수학2 (미적분 기초)', targetGrades: ['고2'], targetRanks: ['3등급'] };
  const teacher = rawTeacher.id ? getTeacherById(rawTeacher.id) : rawTeacher;

  const overrides = useMemo(() => ({
    unitOverride: location.state?.unitOverride,
    phaseIndexOverride: location.state?.phaseIndexOverride
  }), [location.state?.unitOverride, location.state?.phaseIndexOverride]);

  // Hook 내부는 SSOT 객체를 받음
  const { session, setSession } = useMathLessonSession(teacher, overrides);

  const navigate = useNavigate();

  useEffect(() => {
    console.log('[MATH SCREEN LOADED]', teacher);
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

  const [showReport, setShowReport] = useState(false); // 리포트 표시 상태 추가
  const [sessionStartTime] = useState(() => Date.now());
  const [showEndEarlyModal, setShowEndEarlyModal] = useState(false);

  useEffect(() => {
    console.log('[TIMER_START]');
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          console.log('[TIMER_TICK] 00:00');
          setShowReport(true); // 시간 종료 시 리포트 팝업
          return 0;
        }
        return Math.max(0, prev - 1);
      });
      setProblemTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── [수학상 / 수학1] 맞춤 숙제 자동 생성 연동 ──
  useEffect(() => {
    if (showReport) {
      const sessionRoundKey = `hw_generated_flag_${teacher?.id || 'default'}_${session?.round || 1}`;
      const isAlreadyGenerated = localStorage.getItem(sessionRoundKey);
      if (!isAlreadyGenerated) {
        const history = JSON.parse(localStorage.getItem('localGradingHistory') || '[]');
        if (history.length > 0) {
          const courseName = teacher?.courseName || '고등 수학';
          const teacherName = teacher?.name || 'AI 튜터';
          const result = generateMathHomework(history, courseName, teacherName);
          if (result) {
            console.log(`[MATH HOMEWORK DISPATCHED] Assigned ${result.problemsCount} questions under ID ${result.homeworkId}`);
            localStorage.setItem(sessionRoundKey, 'true');
          }
        }
      }
    }
  }, [showReport, teacher, session]);

  // 고1 선생님들(1,2,3번) 강제 고정 여부 확인
  const isG1Teacher = (teacher?.id === 'h_math1' || teacher?.id === 'h_math2' || teacher?.id === 'h_math3' || teacher?.id === 'math1' || teacher?.id === 'math2' || teacher?.id === 'math3') || 
                      (teacher?.targetGrades?.some(g => g.includes('고1')));

  // 고2 선생님들(4,5,6번) 확인 (h_math_calc 제외하여 고3 락 격리)
  const isG2Teacher = (teacher?.id === 'h_math4' || teacher?.id === 'h_math5' || teacher?.id === 'h_math6' || teacher?.id === 'math4' || teacher?.id === 'math5' || teacher?.id === 'math6') || 
                      (teacher?.targetGrades?.some(g => g.includes('고2')) && !teacher?.id?.includes('calc') && !teacher?.targetGrades?.some(g => g.includes('고3'))) ||
                      (teacher?.courseName?.includes('대수') && !teacher?.id?.includes('calc'));

  // 고3 선생님들(7,8,9번 및 h_math_calc) 확인
  const isG3Teacher = (teacher?.id === 'h_math7' || teacher?.id === 'h_math8' || teacher?.id === 'h_math9' || teacher?.id === 'h_math_calc' || teacher?.id === 'math7' || teacher?.id === 'math8' || teacher?.id === 'math9') || 
                      (teacher?.targetGrades?.some(g => g.includes('고3') || g.includes('N수')));

  const [openSections, setOpenSections] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(() => {
    if (location.state?.unitOverride) return location.state.unitOverride;
    return null;
  });
  const [testProblemIdx, setTestProblemIdx] = useState(1);

  // 문제 전환 시 문제 타이머 리셋
  useEffect(() => {
    setProblemTimeLeft(getProblemTimeLimit(selectedUnit));
  }, [testProblemIdx, selectedUnit]);
  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (location.state?.elective) return location.state.elective;
    
    // [STRICT RULE] 고1 선생님들(1,2,3번) → 수학상
    if (isG1Teacher) return '수학상';

    // [STRICT RULE] 고2 선생님들(4,5,6번) → unitOverride로 수학1/수2 판별
    if (isG2Teacher) {
      const uo = location.state?.unitOverride || '';
      // 수2 단원명이면 수2, 아니면 수학1
      const math2Units = ['함수의 극한', '함수의 연속', '함수의극한', '함수의연속', '미분계수', '도함수', '부정적분', '정적분'];
      if (math2Units.some(u => uo.includes(u))) return '수2';
      const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
      if (saved) return saved;
      return '수학1';
    }

    // [STRICT RULE] 고3 선생님들(7,8,9번) → 미적분 (고3 선택과목, 수2는 고2 2학기)
    if (isG3Teacher) {
      const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
      if (saved) return saved;
      return '미적분';
    }

    const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
    if (saved) return saved;

    const tId = teacher?.id || '';
    if (tId === 'h_math7' || tId === 'h_math8' || tId === 'h_math9') return '미적분';
    if (tId === 'h_math1' || tId === 'h_math2' || tId === 'h_math3' || tId === 'math1' || tId === 'math2' || tId === 'math3') return '수학상';
    
    // 학년 정보가 있을 경우 우선 순위
    if (teacher?.targetGrades?.some(g => g.includes('고3') || g.includes('N수'))) return '미적분';
    if (teacher?.targetGrades?.some(g => g.includes('고1'))) return '수학상';

    return '수학상'; 
  });
  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  useEffect(() => {
    if (location.state?.unitOverride) {
      const u = location.state.unitOverride;
      
      const cleanStr = (s) => {
        if (!s) return '';
        return String(s)
          .replace(/^\d{2}\./, '')
          .replace(/^\d+\)/, '')
          .replace(/\d+단계/, '')
          .replace(/\[\d+단계\]/, '')
          .replace(/\[(미적분|확통)\]/, '')
          .replace(/\s+/g, '')
          .replace(/\//g, '')
          .replace(/\d+/, '');
      };

      const targetClean = cleanStr(u);
      const sb = getSidebarData();
      const sec = sb.sections.find(s => 
        s.items.some(i => typeof i === 'string' && (cleanStr(i).includes(targetClean) || targetClean.includes(cleanStr(i))))
      );
      if (sec) {
        setOpenSections(prev => ({ ...prev, [sec.name]: true }));
        const item = sec.items.find(i => typeof i === 'string' && (cleanStr(i).includes(targetClean) || targetClean.includes(cleanStr(i))));
        if (item) {
           setSelectedUnit(item);
           setTestProblemIdx(1);
        }
      }
    }
  }, [location.state?.unitOverride, session?.curriculumData, selectedCourse]);



  const isG3 = session?.grade?.some(g => g.includes('고3') || g.includes('N수')) || teacher?.targetGrades?.some(g => g.includes('고3') || g.includes('N수'));
  const isG2 = session?.grade?.some(g => g.includes('고2')) || teacher?.targetGrades?.some(g => g.includes('고2'));
  const isG1 = session?.grade?.some(g => g.includes('고1')) || teacher?.targetGrades?.some(g => g.includes('고1'));

  useEffect(() => {
    if (isG3) {
      if (teacher?.routeId === 'h_math_calc') {
         setSelectedCourse('미적분');
      } else if (!selectedCourse || selectedCourse === '수학상') {
         const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
         setSelectedCourse(saved || '미적분');
      }
    } else if (isG2) {
      if (!selectedCourse || selectedCourse === '수학상') {
         const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
         setSelectedCourse(saved || '수학1');
      }
    } else if (isG1) {
      if (!selectedCourse || selectedCourse !== '수학상') {
         setSelectedCourse('수학상');
      }
    }
  }, [isG1, isG2, isG3, teacher?.id, teacher?.routeId]);

  function getSidebarData() {
    if (!session) return { title: '', sections: [] };
    const ranks = session.rank || [];
    const isTopRank = ranks.some(r => r.includes('1등급') || r.includes('2등급'));
    const isMidRank = ranks.some(r => r.includes('3등급') || r.includes('4등급') || r.includes('5등급'));

    let levels = ['2단계', '3단계', '4단계'];
    if (isTopRank && !ranks.includes('4등급') && !ranks.includes('5등급')) {
      levels = ['3단계', '4단계']; // 최상위권은 3단계부터
    } else {
      levels = ['2단계', '3단계', '4단계']; // 테스트를 위해 4단계도 보이도록 수정
    }

    const isGrade3 = session.grade?.some(g => g.includes('고3') || g.includes('N수')) || teacher?.targetGrades?.some(g => g.includes('고3') || g.includes('N수'));
    const isGrade2 = session.grade?.some(g => g.includes('고2')) || teacher?.courseName?.includes('대수') || teacher?.targetGrades?.some(g => g.includes('고2'));
    
    // Course-based curriculum mapping (Primary)
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
    
    if (selectedCourse === '확률과통계') {
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

    if (selectedCourse === '수1' || selectedCourse === '수학1' || selectedCourse === '대수') {
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

    // Default for Lower Grades or unselected
    return {
      title: teacher.courseName || '수학(상)(1학기 기말)',
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
        { name: '도형의이동', items: levels.map(l => `도형의이동${l}`) }
      ]
    };
  }
  const sidebarData = getSidebarData();

  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem(`last_course_${teacher?.id || 'default'}`, selectedCourse); if (selectedCourse === '미적분') localStorage.setItem('last_math_elective', 'calculus'); else if (selectedCourse === '확률과통계') localStorage.setItem('last_math_elective', 'statistics');
    }
  }, [selectedCourse, teacher?.id]);

  // 코스(selectedCourse) 변경 시 해당 코스의 첫 번째 단원으로 자동으로 selectedUnit을 변경해주는 반응형 로직 추가
  useEffect(() => {
    if (!selectedCourse || !session) return;
    // unitOverride가 있으면 코스 변경 시 첫 단원 리셋 건너뜀 (진도 선택이 의미있게 작동)
    if (location.state?.unitOverride) return;
    const sb = getSidebarData();
    if (sb && sb.sections && sb.sections.length > 0) {
      const firstSection = sb.sections[0];
      if (firstSection && firstSection.items && firstSection.items.length > 0) {
        const firstItem = firstSection.items[0];
        const allItems = sb.sections.flatMap(s => s.items);
        if (!selectedUnit || !allItems.includes(selectedUnit)) {
          setSelectedUnit(firstItem);
          setTestProblemIdx(1);
        }
      }
    }
  }, [selectedCourse, !!session]);

  useEffect(() => {
    if (session) {
      console.log("[MathClassroomScreen] Pure SSOT Session Started");
    }
  }, [!!session]);

  if (!session) return <div style={{ color: 'var(--text-main)', padding: '2rem', background: 'var(--bg-base)', height: '100vh' }}>Loading V2 Engine... (Session is null). Teacher: {JSON.stringify(teacher)}</div>;
  if (session.flow.length === 0) return <div style={{ color: 'var(--text-main)', padding: '2rem', background: 'var(--bg-base)', height: '100vh' }}>Loading V2 Engine... (Flow is 0). Teacher ID: {teacher?.id}. ssot.id: {teacher?.id}</div>;
  
  // 1. flow의 첫 단계 상태가 homework_gate 이면 Gate UI 렌더
  const currentPhase = session.flow[session.currentPhaseIndex]?.phase;
  
  return (
    <div className="classroom-layout math-classroom-root" style={{ background: 'var(--bg-base)', color: 'var(--text-main)', position: 'relative' }}>
      
      {/* 모바일 상단 헤더바 */}
      <div className="header-mobile">
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: 'transparent', border: 'none', color: 'var(--mc-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
        >
          <Menu size={24} style={{ marginRight: '8px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{teacher.name} 수업</span>
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--mc-text)' }}>
          <Clock size={18} color="var(--mc-danger)" />
          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Free Trial / Paywall Gate */}
      <FreeTrialBanner gradeFlow={location.state?.gradeFlow || '고1'} />
      
      {/* Dual Timer Overlay */}
      <style>{`
        @keyframes timerPulse {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
          100% { transform: scale(1.05); box-shadow: 0 0 24px rgba(245, 158, 11, 0.95); }
        }
      `}</style>
      <div className="math-timer-overlay-desktop" style={{ position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', zIndex: 99999, pointerEvents: 'none' }}>
        {/* Global Session Timer */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(239, 68, 68, 0.5)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.25)',
          color: '#fee2e2',
          padding: '0.5rem 2.2rem',
          borderRadius: '30px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          letterSpacing: '1px',
          textShadow: '0 0 6px rgba(239, 68, 68, 0.5)'
        }}>
          <Clock size={20} color="#f87171" />
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fca5a5', fontFamily: 'sans-serif', marginRight: '4px', whiteSpace: 'nowrap' }}>수업시간</span>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        
        {/* Problem Timer */}
        {problemTimeLeft > 0 && (
          <div style={{
            background: problemTimeLeft <= 60 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            border: problemTimeLeft <= 60 ? '1.5px solid rgba(245, 158, 11, 0.9)' : '1.5px solid rgba(59, 130, 246, 0.5)',
            boxShadow: problemTimeLeft <= 60 ? '0 8px 32px rgba(245, 158, 11, 0.4)' : '0 8px 32px rgba(59, 130, 246, 0.25)',
            color: problemTimeLeft <= 60 ? '#ffffff' : '#dbeafe',
            padding: '0.5rem 2.2rem',
            borderRadius: '30px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            letterSpacing: '1px',
            textShadow: problemTimeLeft <= 60 ? '0 0 6px rgba(255,255,255,0.6)' : '0 0 6px rgba(59, 130, 246, 0.5)',
            animation: problemTimeLeft <= 60 ? 'timerPulse 0.8s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <Clock size={20} color={problemTimeLeft <= 60 ? '#ffffff' : '#60a5fa'} />
            {String(Math.floor(problemTimeLeft / 60)).padStart(2, '0')}:{String(problemTimeLeft % 60).padStart(2, '0')}
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: problemTimeLeft <= 60 ? '#ffffff' : '#93c5fd', fontFamily: 'sans-serif', marginLeft: '6px', whiteSpace: 'nowrap' }}>(1문항)</span>
          </div>
        )}
      </div>

      {/* 여기까지 끝내기 버튼 (모바일 전용 — 데스크톱은 상단바로 이동) */}
      <button
        className="mc-endpill-fixed"
        onClick={() => setShowEndEarlyModal(true)}
        style={{ position: 'fixed', top: '15px', right: '20px', background: 'var(--mc-surface)', border: '1px solid var(--mc-border-strong)', padding: '0.45rem 1rem', borderRadius: 'var(--mc-r-pill)', color: 'var(--mc-text-muted)', cursor: 'pointer', zIndex: 99999, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(8px)', boxShadow: 'var(--mc-shadow-sm)', transition: 'all 0.2s', pointerEvents: 'auto' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--mc-danger-weak)'; e.currentTarget.style.color = 'var(--mc-danger)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--mc-surface)'; e.currentTarget.style.color = 'var(--mc-text-muted)'; e.currentTarget.style.borderColor = 'var(--mc-border-strong)'; }}
      >
        <LogOut size={16} /> 여기까지 끝내기
      </button>

      {/* 여기까지 끝내기 확인 모달 */}
      {showEndEarlyModal && (() => {
        const elapsedMs = Date.now() - sessionStartTime;
        const elapsedMin = Math.round(elapsedMs / 60000);
        const history = JSON.parse(localStorage.getItem('localGradingHistory') || '[]');
        const totalSolved = history.length;
        const correctCount = history.filter(h => h.isCorrect).length;
        const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
        const unitName = selectedUnit || '수학 수업';
        const problemNum = testProblemIdx;
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowEndEarlyModal(false)}>
            <div style={{ background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 'var(--mc-r-lg)', padding: '1.75rem', maxWidth: '420px', width: '90%', boxShadow: 'var(--mc-shadow-lg)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: 'var(--mc-text)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}><LogOut size={18} color="var(--mc-text-muted)" /> 수업 종료 확인</h3>
                <button onClick={() => setShowEndEarlyModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mc-text-subtle)', cursor: 'pointer' }}><CloseIcon size={20} /></button>
              </div>
              <div style={{ background: 'var(--mc-surface-sunken)', borderRadius: 'var(--mc-r-md)', padding: '1.1rem 1.2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.9rem' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} /> 단원</span><span style={{ color: 'var(--mc-text)', fontWeight: '600' }}>{unitName}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.9rem' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Hash size={14} /> 현재 문제</span><span style={{ color: 'var(--mc-text)', fontWeight: '600' }}>{problemNum}번까지 풀었음</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.9rem' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> 총 학습시간</span><span style={{ color: 'var(--mc-text)', fontWeight: '600' }}>{elapsedMin}분</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mc-text-muted)', fontSize: '0.9rem' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> 정답률</span><span style={{ color: accuracy >= 70 ? 'var(--mc-secondary)' : accuracy >= 40 ? '#D97706' : 'var(--mc-danger)', fontWeight: '700' }}>{correctCount}/{totalSolved} ({accuracy}%)</span></div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button className="mc-btn mc-btn--ghost" onClick={() => setShowEndEarlyModal(false)} style={{ flex: 1 }}>계속하기</button>
                <button onClick={() => {
                  const record = { 
                    id: 'session_' + Date.now(), 
                    date: new Date().toISOString(), 
                    subject: '수학', 
                    grade: teacher?.targetGrades?.[0] || '고1',
                    unit: unitName, 
                    totalQuestions: totalSolved, 
                    correctCount: correctCount, 
                    accuracy: accuracy, 
                    duration: elapsedMin, 
                    endedEarly: true,
                    wrongQuestions: history.filter(h => !h.isCorrect).map(h => ({ problemId: h.problemId, id: h.problemId, isCorrect: false })),
                    nextLessonFocus: '조기 종료 단원 복습 및 오답 정리'
                  };
                  const prev = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
                  prev.push(record);
                  localStorage.setItem('mentos_lesson_results', JSON.stringify(prev));

                  // 조기 종료 맞춤 숙제 생성 (15~20문항)
                  const courseName = teacher?.courseName || '고등 수학';
                  const teacherName = teacher?.name || 'AI 튜터';
                  const sessionRoundKey = `hw_generated_flag_${teacher?.id || 'default'}_${session?.round || 1}`;
                  const isAlreadyGenerated = localStorage.getItem(sessionRoundKey);
                  if (!isAlreadyGenerated) {
                    const result = generateMathHomework(history, courseName, teacherName, { earlyExit: true, currentUnit: selectedUnit });
                    if (result) {
                      console.log(`[MATH HOMEWORK DISPATCHED - EARLY EXIT] Assigned ${result.problemsCount} questions under ID ${result.homeworkId}`);
                      localStorage.setItem(sessionRoundKey, 'true');
                    }
                  }

                  navigate('/dashboard');
                }} className="mc-btn mc-btn--primary" style={{ flex: 1 }}>수업 종료</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 사이드바 UI (옵션) */}
      <div className={`classroom-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ borderRight: '1px solid var(--mc-border)', padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.4rem' }}>
          <div style={{ width: '92px', height: '92px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--mc-primary)', marginBottom: '0.8rem', boxShadow: '0 4px 16px rgba(167, 139, 250, 0.35)' }}>
            <img
              src={teacher.image}
              alt={teacher.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              onError={(e) => { e.target.src = '/icons/default-avatar.webp'; }}
            />
          </div>
          <h2 style={{ color: 'var(--mc-text)', margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{teacher.name} 선생님</h2>
          <div style={{ fontSize: '0.74rem', color: 'var(--mc-primary)', marginTop: '4px', fontWeight: 600, letterSpacing: '0.3px' }}>Mentos AI Partner</div>
        </div>

        {/* 현재 학습 정보 */}
        <div style={{ marginBottom: '1.4rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mc-text-subtle)', letterSpacing: '0.5px', marginBottom: '0.55rem' }}>현재 학습 정보</div>
          <div style={{ background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 'var(--mc-r-md)', padding: '0.85rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '8px' }}>
              <span style={{ color: 'var(--mc-text-muted)', whiteSpace: 'nowrap' }}>대단원</span>
              <span style={{ color: 'var(--mc-text)', fontWeight: 700, textAlign: 'right' }}>{session.grade?.[0] || '고1'} {({ '수학상': '수학(상/하)', '수학1': '수학1', '수2': '수학2', '미적분': '미적분', '확률과통계': '확률과 통계', '모의고사': '모의고사' }[selectedCourse] || selectedCourse || '수학')}</span>
            </div>
            <div style={{ height: 1, background: 'var(--mc-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '8px' }}>
              <span style={{ color: 'var(--mc-text-muted)', whiteSpace: 'nowrap' }}>학습 단원</span>
              <span style={{ color: 'var(--mc-text)', fontWeight: 700, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '135px' }}>{selectedUnit || '미선택'}</span>
            </div>
            <div style={{ height: 1, background: 'var(--mc-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--mc-text-muted)' }}>학습 진도</span>
              <span style={{ color: 'var(--mc-primary)', fontWeight: 700 }}>{session.round}회차</span>
            </div>
          </div>
        </div>

        <button
          className="mc-btn mc-btn--success"
          onClick={() => navigate('/homework', { state: { teacher } })}
          style={{ width: '100%', marginBottom: '2rem' }}
        >
          <CheckCircle size={18} /> 숙제함 가기
        </button>

        {/* 커리큘럼 아코디언 드롭다운 (학생/강사 네비게이션) */}
        <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mc-text-subtle)', letterSpacing: '0.5px', marginBottom: '0.55rem' }}>학습 목차</div>
            {isG1Teacher ? (
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.7rem', marginBottom: '1rem', background: 'var(--mc-surface)', color: 'var(--mc-text)', border: '1px solid var(--mc-border-strong)', borderRadius: 'var(--mc-r-sm)', fontWeight: 'bold' }}
              >
                <option value="수학상">고1 수학(상/하)</option>
              </select>
            ) : isG2Teacher ? (
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.7rem', marginBottom: '1rem', background: 'var(--mc-surface)', color: 'var(--mc-text)', border: '1px solid var(--mc-border-strong)', borderRadius: 'var(--mc-r-sm)', fontWeight: 'bold' }}
              >
                <option value="수학1" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학1 (대수)</option>
                <option value="수2" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학2</option>
              </select>
            ) : (
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.7rem', marginBottom: '1rem', background: 'var(--mc-surface)', color: 'var(--mc-text)', border: '1px solid var(--mc-border-strong)', borderRadius: 'var(--mc-r-sm)', fontWeight: 'bold' }}
              >
                <option value="수학1" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학1 (대수)</option>
                <option value="수2" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>수학2</option>
                <option value="미적분">미적분 (심화)</option>
                <option value="확률과통계">확률과 통계 (수능)</option>
                <option value="모의고사">멘토스 모의고사</option>
              </select>
            )}

          <h3 style={{ fontSize: '0.95rem', color: 'var(--mc-text)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--mc-border)' }}>
            {sidebarData.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {sidebarData.sections.map((sec, i) => (
              <div key={i}>
                <div
                  onClick={() => {
                    if (sec.items.length === 0) setSelectedUnit(sec.name);
                    else toggleSection(sec.name);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.55rem 0.6rem', cursor: 'pointer', borderRadius: 'var(--mc-r-sm)',
                    background: selectedUnit === sec.name ? 'var(--mc-primary-weak)' : (openSections[sec.name] ? 'var(--mc-primary-weak)' : 'transparent'),
                    color: (selectedUnit === sec.name || openSections[sec.name]) ? 'var(--mc-primary)' : 'var(--mc-text)',
                    transition: 'background .15s ease, color .15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'inherit', fontWeight: 'bold' }}>{sec.name}</span>
                  {sec.items.length > 0 && (
                    <ChevronDown size={14} style={{ transform: openSections[sec.name] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
                  )}
                </div>

                {/* 하위 레벨(Levels) 렌더링 */}
                {sec.items.length > 0 && openSections[sec.name] && (
                  <div style={{ marginLeft: '0.85rem', borderLeft: '1px solid var(--mc-border)', paddingLeft: '0.6rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {sec.items.map((subLevel, j) => (
                      <div
                        key={j}
                        onClick={() => {
                          if (selectedCourse === '모의고사') {
                             navigate('/class/mock-exam', { state: { title: subLevel, elective: localStorage.getItem('last_math_elective') || 'calculus' } });
                          } else {
                             setSelectedUnit(subLevel);
                             setTestProblemIdx(1);
                          }
                        }}
                        style={{
                          fontSize: '0.85rem', padding: '0.42rem 0.55rem', cursor: 'pointer', borderRadius: 'var(--mc-r-sm)',
                          color: selectedUnit === subLevel ? 'var(--mc-primary)' : 'var(--mc-text-muted)',
                          background: selectedUnit === subLevel ? 'var(--mc-primary-weak)' : 'transparent',
                          fontWeight: selectedUnit === subLevel ? 'bold' : 500,
                          transition: 'background .15s ease, color .15s ease'
                        }}
                      >
                        - {subLevel}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <LessonRenderer session={session} setSession={setSession} ssot={teacher} timeLeft={timeLeft} selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit} testProblemIdx={testProblemIdx} setTestProblemIdx={setTestProblemIdx} selectedCourse={selectedCourse} showReport={showReport} setShowReport={setShowReport} getSidebarData={getSidebarData} problemTimeLeft={problemTimeLeft} setShowEndEarlyModal={setShowEndEarlyModal} />
      <style>{katexStyle}</style>
    </div>
  );
}

export default function MathClassroomScreen() {
  return (
    <ErrorBoundary>
      <MathClassroomScreenContent />
    </ErrorBoundary>
  );
}

// trigger reload

// force reload
