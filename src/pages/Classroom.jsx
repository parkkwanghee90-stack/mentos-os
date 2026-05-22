import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Image as ImageIcon, FileText, BarChart2, AlertCircle, LogOut, ChevronRight, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAppContext } from '@/context/AppContext';
import { tutorChat } from '@/services/openaiChatApi';
import { buildSystemPrompt } from '@/engine/promptEngine';
import { getExamScope } from '@/services/examModeEngine';
import { canAdvancePhase } from '@/engine/studentState';
import { useSession } from '@/hooks/useSession';
import { formatTime, getGradeBand } from '@/engine/sessionEngine';
import { getTeacherById } from '@/data/teacherProfiles';
import { speakText, stopSpeaking, setMuted, getMuted, getVoiceForTeacher } from '@/services/ttsService';
import { useMic, MIC_STATE } from '@/hooks/useMic';
import {
  LESSON_PHASES,
  getPhaseById,
  getNextPhase,
  getPhaseProgress
} from '@/services/lessonPhaseEngine';
import '@/pages/Classroom.css';
import { BlockMath, InlineMath } from '@/components/KaTeXWrapper';
import WhiteFocusMode from '@/components/WhiteFocusMode';

export const normalizeMathText = (text) => {
  if (!text) return "";
  let n = text.replace(/\\\[/g, '$$$$');
  n = n.replace(/\\\]/g, '$$$$');
  n = n.replace(/\\\(/g, '$');
  n = n.replace(/\\\)/g, '$');
  return n;
};

// [cleaned comment]
const MathTextRenderer = ({ text, onRead, onExplain }) => {
  if (!text) return null;

  // [cleaned comment]
  const engParts = text.split(/'"'eng-reading\n([\s\S]*?)\n'"'/);

  return (
    <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
      {engParts.map((engPart, engIndex) => {
        if (engIndex % 2 === 1) {
          // eng-reading JSON 釉붾줉 ?곸뿭
          try {
            const sentences = JSON.parse(engPart);
            return (
              <div key={`eng-${engIndex}`} className="english-reading-block" style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                {sentences.map((s) => (
                  <div key={s.sentenceId || Math.random()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ flex: 1, paddingRight: '1rem', fontSize: '1.05rem', lineHeight: '1.5', color: '#f3f4f6' }}>
                      {s.englishText}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => onRead && onRead(s.englishText)} style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>???쎄린</button>
                      <button onClick={() => onExplain && onExplain(s.explanationText)} style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>?뮕 ?ㅻ챸</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          } catch(e) {
            return <div key={`err-${engIndex}'} style={{ color: 'red' }}>Error parsing English passage block</div>;
          }
        } else {
          // [cleaned comment]
          const normalized = normalizeMathText(engPart);
          const blockParts = normalized.split('$$');
          return (
            <span key={`text-part-${engIndex}`}>
              {blockParts.map((bPart, bIndex) => {
                if (bIndex % 2 === 1) {
                  return <div key={`block-${engIndex}-${bIndex}"} className='katex-block-wrapper" style={{ margin: '0.8rem 0' }}><BlockMath math={bPart} /></div>;
                }
                const inlineParts = bPart.split('$');
                return (
                  <span key={`inline-wrapper-${engIndex}-${bIndex}`}>
                    {inlineParts.map((iPart, iIndex) => {
                      if (iIndex % 2 === 1) {
                        return <InlineMath key={`inline-${engIndex}-${bIndex}-${iIndex}`} math={iPart} />;
                      }
                      let t = iPart.replace(/\[CORRECT_ANSWER_ACTION\]/g, '');
                      // [cleaned comment]
                      const engSentenceRegex = /([a-zA-Z"'][a-zA-Z0-9\s,.'"???\-();:]{10,}[.!?]+(?:["']?))/g;
                      const chunks = t.split(engSentenceRegex);

                      return (
                        <span key={`chunk-${engIndex}-${bIndex}-${iIndex}`}>
                           {chunks.map((chk, cIdx) => {
                             if (cIdx % 2 === 1) { // 罹≪쿂???곸뼱 臾몄옣
                               return (
                                 <span key={cIdx} style={{ display: 'inline', position: 'relative' }}>
                                   {chk}
                                   <button 
                                     onClick={() => onRead && onRead(chk)} 
                                     style={{ marginLeft: '4px', marginRight: '4px', background: '#3b82f6', color: 'white', borderRadius: '4px', padding: '0.1rem 0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', boxShadow: '0 2px 4px rgba(59,130,246,0.3)' }}
                                     title="???곸뼱 臾몄옣 ?ｊ린"
                                   >
                                     ???ｊ린
                                   </button>
                                 </span>
                               );
                             }
                             return <span key={cIdx}>{chk}</span>;
                           })}
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </span>
          );
        }
      })}
    </div>
  );
};

import { CONCEPT_05_SCRIPT } from '@/data/concept05Script';


export default function Classroom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, setMessages, studyMode, examInfo, diagnosisResult, repeatMistakes, studentState, handleStudentAnswer, advanceLessonPhase, resetClassroomSession, level: contextLevel } = useAppContext();

  const [sessionInfo, setSessionInfo] = useState(null);
  // [cleaned comment]
  const [isLessonStarted, setIsLessonStarted] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teacherState, setTeacherState] = useState('idle');
  const [videoError, setVideoError] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isFullAudioMode, setIsFullAudioMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [isConceptMode, setIsConceptMode] = useState(false);
  const [conceptStep, setConceptStep] = useState(0);
  const [conceptData, setConceptData] = useState(null);
  const conceptTimers = useRef([]);
  const [isWhiteFocusMode, setIsWhiteFocusMode] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- BASE INITIALIZATION ---
  const hardSubject = sessionInfo?.subject || location.state?.subject;
  const currentSubject = hardSubject || 'math';
  
  const tempTeacher = sessionInfo?.teacherProfile || sessionInfo?.teacher || location.state?.teacher || { name: 'AI', style: '기본 선생님', subject: currentSubject, id: '',  contentRules: ['기본적인 멘토스 AI 디버깅 수업을 진행합니다.'], targetGrades: ['전학년'], targetRanks: ['전등급'], hasHomeworkCheck: true, hasHomework: true, homeworkEngine: 'global' };
  let currentTeacher = (tempTeacher.id ? getTeacherById(tempTeacher.id) : null) || tempTeacher;
  
  // 브라우저의 localStorage에서 불러온 과거 데이터, 혹은 id 매칭 실패로 생성된 임시 객체 등의 경우 누락 속성을 보완하여 React Crash를 방지
  if (currentTeacher && !currentTeacher.hasHomeworkCheck && typeof currentTeacher === 'object') {
    currentTeacher.hasHomeworkCheck = true;
    currentTeacher.hasHomework = true;
    currentTeacher.homeworkEngine = 'global';
    currentTeacher.routeId = currentTeacher.routeId || 'legacy_recovered_route';
    currentTeacher.contentRules = currentTeacher.contentRules || ['?댁쟾 ?섏뾽 罹먯떆 蹂듦뎄 紐⑤뱶?낅땲?? 湲곕낯?곸씤 吏?꾨? 怨꾩냽?섏꽭??'];
  }
  console.log("[TEACHER INIT]", currentTeacher);
  console.log("[TEACHER SOURCE]", {
    fromRoute: location.state?.teacher,
    fromSessionInfo: sessionInfo?.teacherProfile || sessionInfo?.teacher,
    final: currentTeacher
  });

  if (!currentTeacher) {
    console.error("🚨 teacher 없음 → 수업 생성 중단");
    return <div style={{ color: "white", padding: "20px" }}>Teacher not loaded</div>;
  }

  const grade = sessionInfo?.grade || '怨?';

    useEffect(() => {
    const nextTeacherId = currentTeacher?.id || 'unknown';
    
    if (location.state?.isDirectLoad) {
      console.log('[SSOT LOADED]\n[SESSIONQUEUE BUILT]\n[RENDER CLASSROOM]');
    }

    localStorage.setItem('mentos_last_teacher_id', nextTeacherId);
    console.log('[CLASS INIT]', currentTeacher);
  }, [currentTeacher?.id]);

  console.log('[Classroom Init]', {
    passedSubject: hardSubject,
    finalSubject: currentSubject
  });

  useEffect(() => {
    if (currentSubject === 'english' || currentSubject === '영어') {
      if (currentTeacher?.contentProfile) {
        console.log(`[ENG ROUTE START]
teacher=${currentTeacher.name}
targetGrades=${currentTeacher.targetGrades ? currentTeacher.targetGrades.join(',') : '전학년'}
targetRanks=${currentTeacher.targetRanks ? currentTeacher.targetRanks.join(',') : '전등급'}
routeId=${currentTeacher.routeId}
contentProfile=${currentTeacher.contentProfile}
lessonSet=[Dynamic Generation based on contentRules: ${currentTeacher.contentRules?.[0]?.substring(0,10) || 'default'}...]');
      }
    }
  }, [currentSubject, currentTeacher]);

  const createLessonStart = ({ subject, mode, teacher, teacherMode, contentProfile, unit }) => {
    const isEng = (subject === 'eng' || subject === 'english' || subject === '영어');
    
    // Validate SSOT for English
    if (isEng) {
      const hasTeacher = !!teacher;
      const hasUnitTitle = !!unit && unit !== 'undefined';
      const hasSessionQueue = teacher?.sessionQueue?.length === 4;
      const hasContent = hasSessionQueue && !!teacher.sessionQueue[0]?.reading?.text;
      
      if (!hasTeacher || !hasUnitTitle || !hasSessionQueue || !hasContent) {
        const errorMsg = `[SSOT FATAL ERROR] 필수 수업 데이터 누락!
- Teacher ID: ${teacher?.id || 'N/A'} (Subject: ${subject})
- UnitTitle 존재 여부: ${hasUnitTitle}
- SessionQueue 구조 존재 여부: ${hasSessionQueue} (예상: 4, 실제: ${teacher?.sessionQueue?.length || 0})
- 실질 Content(지문/스크립트 등) 존재 여부: ${hasContent}

이 수업은 치명적인 데이터 누락 상태이므로 임의로 대체(Fallback) 실행할 수 없습니다.`;
        console.error(errorMsg);
        return errorMsg;
      }
      
      console.log("[FALLBACK BLOCKED] SSOT 정상 로드, 구버전 템플릿 사용을 차단합니다.");
      return "";
    }

    // For non-English fallback (since not fully migrated to strict offline static files yet)
    const subjectPrefix = (unit || '기본');
    const routeDesc = contentProfile ? `[${contentProfile} 기반 수업]` : `[${subjectPrefix} 수업 시작]`;
    
    return `${routeDesc}\n선생님: 안녕! 나는 ${teacher?.name || `선생님`}이야! 오늘은 ${subjectPrefix} 파트를 공부할 거야. 화면의 내용을 읽어보고 모르는 부분이 있으면 질문해줘!`;
  };

  const SUBJECT_DEFAULT_UNITS = {
    math: '다항식과 곱셈공식', '수학': '다항식과 곱셈공식',
    english: '비문학 독해 기초', '영어': '비문학 독해 기초',
    physics: '역학과 에너지', '물리': '역학과 에너지',
    chemistry: '물질의 변화', '화학': '물질의 변화',
    biology: '생명 시스템', '생명과학': '생명 시스템',
    earthScience: '지구의 역사', '지구과학': '지구의 역사',
    science: '통합과학', '과학': '통합과학'
  };
  const isEngEnv = currentSubject === 'english' || currentSubject === '영어';
  const [engPhase, setEngPhase] = useState('reading'); // reading | hearing | vocab
  const [engReadingElapsed, setEngReadingElapsed] = useState(0);
  const [engHearingElapsed, setEngHearingElapsed] = useState(0);
  const [engVocabCount, setEngVocabCount] = useState(0);

  const getDynamicUnit = (teacher) => {
    if (!teacher?.recommendedTextType || teacher.recommendedTextType.length === 0) return null;
    const types = teacher.recommendedTextType;
    const idx = (sessionInfo?.sessionId ? sessionInfo.sessionId.charCodeAt(0) : Math.floor(Math.random() * types.length)) % types.length;
    return types[idx];
  };

  const teacherUnit = (isEngEnv && engPhase === 'hearing' && currentTeacher?.listeningRouteTitle) 
        ? currentTeacher.listeningRouteTitle 
        : currentTeacher?.routeTitle;

  const unit = getDynamicUnit(currentTeacher) || teacherUnit || sessionInfo?.unit || location.state?.unit || SUBJECT_DEFAULT_UNITS[currentSubject] || (currentTeacher ? currentTeacher.routeTitle : '기본 정보 구조의 오류');
  const level = sessionInfo?.level || location.state?.level || contextLevel || 'F';


  // --- SSOT: 4 Session Queue Architecture ---
  const generateNextSession = (existing) => {
    const id = existing.length + 1;
    const isEng = (currentSubject === 'english' || currentSubject === '영어');
    const phases = isEng ? ['reading', 'hearing', 'vocabBlock'] : ['vocab', 'reading', 'concept', 'problem'];
    const phaseName = phases[(id - 1) % phases.length];
    
    // Construct real SSOT content based on currentTeacher
    let content = "";
    const routeTitle = currentTeacher?.routeTitle || '기본 구조';
    if (currentTeacher) {
      const { contentRules, features, listeningRules } = currentTeacher;
      const joinedRules = contentRules ? contentRules.join(' / ') : '';
      const joinedListen = listeningRules ? listeningRules.join(' / ') : '';
      const joinedFeatures = features ? features.join(' / ') : '';
      
      switch (phaseName) {
        case 'vocab':
          content = `핵심 어휘 학습: ${joinedRules}`;
          break;
        case `reading`:
          content = `[Reading 60분]\n지문 독해: ${routeTitle} / ${joinedRules}`;
          break;
        case `hearing`:
          content = `[Hearing 30분]\n듣기/킬러 전략: ${joinedListen}\n주제: ${routeTitle}`;
          break;
        case 'vocabBlock':
          content = '[Vocab Block 30분] (단일 테스트 구조 절대 금지)
1. [Venice Mode 3~5min] 몰입/흥미 유도 게임형 진입 (필수)
2. [Word 단계] 단어 먼저 제시 및 암기 → 직후 Word Test 진행 (뜻 매칭, 품사, 철자)
3. [Vocab 단계] 예문을 통한 문맥 학습 → 직후 Vocab Test 진행 (문장 삽입, 동의어/반의어, 실전 문제)
* 핵심 원칙: 그날 배운 단어를 그 자리에서 외우게 만드는 구조를 강제할 것.';
          break;
        case 'concept':
          content = `개념 정리: ${joinedFeatures}`;
          break;
        case `problem`:
          content = `문제 풀이: ${joinedRules} / ${joinedListen}`;
          break;
      }
    } else {
      content = "[SSOT 복원 대기 중]";
    }

    return {
      id,
      phase: phaseName,
      status: 'ready',
      content,
      unitTitle: routeTitle,
      teacherName: currentTeacher?.name || '멘토스 AI',
      level: currentTeacher?.level?.grade || level || 'Default',
      duration: phaseName === 'reading' ? 60 : 30 // Assign exact durations
    };
  };

  const ensureFourSessions = (state) => {
    let didGen = false;
    const newState = { sessions: [...state.sessions], currentSessionIndex: state.currentSessionIndex };
    while (newState.sessions.length < Math.max(newState.currentSessionIndex + 4, 4)) {
      const next = generateNextSession(newState.sessions);
      newState.sessions.push(next);
      didGen = true;
    }
    if (didGen) {
      console.log("SESSION QUEUE GENERATED", newState.sessions);
      if (newState.sessions.every(s => s.content && s.content.length > 0)) {
        console.log("선택된 teacher 이름:", currentTeacher?.name);
        console.log("4개 session content 출력:", newState.sessions.map(s => s.content));
      }
    }
    return newState;
  };

  const [sessionQueue, setSessionQueue] = useState(() => ensureFourSessions({
    sessions: [],
    currentSessionIndex: 0
  }));

  const nextSessionQueueItem = () => {
    setSessionQueue(prev => {
      const nextState = { ...prev, currentSessionIndex: prev.currentSessionIndex + 1 };
      return ensureFourSessions(nextState);
    });
  };

  const currentQueuePhase = sessionQueue.sessions[sessionQueue.currentSessionIndex]?.phase || 'reading';
  // ------------------------------------------
  const isMathSlideMode = currentSubject === 'math' || currentSubject === '수학';


  // Moved these debug handlers down below useSession hooks.

  const handleConceptModeStart = () => {
    // 개념 05 (페이지 8)에서만 상세 애니메이션 모드 실행
    if (currentSlideIndex === 8) {
      setIsConceptMode(true);
      setConceptStep(0);
      setConceptData(null);
      conceptTimers.current.forEach(clearTimeout);
      conceptTimers.current = [];

      CONCEPT_05_SCRIPT.forEach((item) => {
        const tid = setTimeout(() => {
          if (item.type === 'INIT_FORMULA') {
            setConceptData(item.data);
            setConceptStep(0);
          } else if (item.type === 'STEP') {
            setConceptStep(item.step);
            if (ttsEnabled) {
              speakText(item.text, { voice: getVoiceForTeacher(currentTeacher), isReplay: true });
            }
          }
        }, item.delay);
        conceptTimers.current.push(tid);
      });
    } else {
      // [cleaned comment]
      const text = "??媛쒕뀗?€ ?꾩쓽 臾몄옣???쎌뼱蹂댁떆硫?異⑸텇???댄빐?????덉쓣 ?뺣룄濡??ъ슫 媛쒕뀗?낅땲?? ?쎌뼱蹂닿퀬 ?댄빐 ???섎뒗 遺€遺꾨쭔 吏덈Ц?섏꽭??";
      const newMsg = { id: Date.now(), role: 'assistant', content: text };
      setMessages((prev) => [...prev, newMsg]);
      
      if (ttsEnabled) {
        speakText(text, { voice: getVoiceForTeacher(currentTeacher), isReplay: true });
      }
    }
  };

  const handleConceptModeExit = () => {
    setIsConceptMode(false);
    setConceptStep(0);
    conceptTimers.current.forEach(clearTimeout);
    conceptTimers.current = [];
    stopSpeaking();
  };

  const PAGE_DATA = {
    1: { type: 'concept', conceptText: '媛쒕뀗1?€ ?⑹뼱???뺤쓽?낅땲?? ?쎌뼱蹂닿퀬 ?댄빐 ???섎뒗 ?⑹뼱媛€ ?덉쑝硫?吏덈Ц?섏꽭??' },
    2: { type: 'concept', conceptText: '媛쒕뀗2???대┝李⑥닚怨??ㅻ쫫李⑥닚 媛쒕뀗?낅땲?? ?쎌뼱蹂닿퀬 ?댄빐?대낫?몄슂. 吏덈Ц???덉쑝硫??섏꽭??' },
    3: { type: 'concept', conceptText: '媛쒕뀗3?€ ?ъ슦?덇퉴 ?쎌뼱蹂닿퀬 ?댄빐?대낫?몄슂. 吏덈Ц ?덉쑝硫??섏꽭??' },
    4: { type: 'problem', problemText: '?좏삎?곗뒿 1. ?ㅽ빆??$A = x^3 - 2x^2 + 3x - 1$, $B = 2x^2 - x + 4$ ???€?섏뿬 $A - 2B$ 瑜?媛꾨떒???섏떆??', hintText: '?뚰듃: $A - 2B$???앹뿉 吏곸젒 ?€?낇븯???€?대낫?몄슂.', solutionText: '?€??\n$A - 2B = (x^3 - 2x^2 + 3x - 1) - 2(2x^2 - x + 4)$\n$= x^3 - 2x^2 + 3x - 1 - 4x^2 + 2x - 8$\n$= -3x^3 + 5x - 9$ ?낅땲??' },
    5: { type: 'problem', problemText: '?꾩닔?좏삎 2. ?ㅼ쓬 ?앹쓣 ?꾧컻?섏떆?? $(x+2)(x^2-2x+4)$', hintText: '?뚰듃: 怨듭떇 $(a+b)(a^2-ab+b^2) = a^3+b^3$ 援ъ“瑜??앷컖?대낫?몄슂.', solutionText: '?€??\n$x$ ?먮━??$x$, $2$ ?먮━??$b$瑜??ｌ쑝硫?$(x+2)(x^2-2x+2^2)$?대?濡?n怨깆뀍怨듭떇???섑빐 $x^3 + 2^3 = x^3 + 8$ ???⑸땲??' },
    6: { type: 'problem', problemText: '???ㅽ빆??$A$, $B$???€?섏뿬 $A+B=2x^2-xy+3y^2$, $A-B=x^2+3xy-2y^2$????$2A-3B$瑜?$y$???€???대┝李⑥닚?쇰줈 ?섑??댁떆??', hintText: '?뚰듃: $A+B$?€ $A-B$瑜??댁슜??$A$?€ $B$瑜??곕┰?댁꽌 援ы븳 ??$2A-3B$???앹쓣 ?€?낇빐蹂댁꽭??', solutionText: '?€??\n$(A+B) + (A-B) = 2A = 3x^2 + 2xy + y^2$ ?대?濡?$A = 1.5x^2 + xy + 0.5y^2$\n$(A+B) - (A-B) = 2B = x^2 - 4xy + 5y^2$ ?대?濡?$B = 0.5x^2 - 2xy + 2.5y^2$\n$2A - 3B = (3x^2 + 2xy + y^2) - (1.5x^2 - 6xy + 7.5y^2) = 1.5x^2 + 8xy - 6.5y^2$ ?낅땲??\n?대? $y$???€???대┝李⑥닚?쇰줈 ?곕㈃ $-6.5y^2 + 8xy + 1.5x^2$ ???⑸땲??' },
    7: { type: 'concept', conceptText: '媛쒕뀗4???ㅽ빆?앹쓽 怨깆뀍?낅땲??\n癒쇱? 吏€?섎쾿移숈쓣 ?댁슜??怨깊븯??諛⑹떇???쎌뼱蹂댁꽭??\n洹몃떎???ㅽ빆?앹쓽 怨깆뀍?€ 吏€?섎쾿移숆낵 遺꾨같踰뺤튃???댁슜???꾧컻????n媛숈? ??겮由?紐⑥븘???뺣━?쒕떎???먮쫫?쇰줈 ?댄빐?섎㈃ ?⑸땲??\n吏덈Ц???덉쑝硫??섏꽭??' },
    8: { type: 'concept', conceptText: '媛쒕뀗5??怨깆뀍 怨듭떇?낅땲??\n?ш린?쒕??곕뒗 怨듭떇???몄슦??寃껋씠 ?꾨땲??援ъ“濡??댄빐?댁빞 ?⑸땲??\n$(a+b)$???쒓낢?€ 移몄씠 ??媛쒖씠怨?媛?移몄뿉 $a$?€ $b$瑜??ｌ뼱 紐⑤뱺 寃쎌슦瑜?怨깊븯硫??⑸땲??\n?대윴 諛⑹떇?쇰줈 ?쎌뼱蹂닿퀬 ?댄빐?대낫?몄슂.' }
  };

  const handleNextSlide = () => {
    const next = currentSlideIndex + 1;
    setCurrentSlideIndex(next);
    // [cleaned comment]
    setMessages([]);
  };


  // [cleaned comment]
  useEffect(() => {
    // [cleaned comment]
    if (isMathSlideMode) {
      setMessages([]);
    }
  }, []);

  let selectedTeacherId =
    location.state?.teacher?.id ||
    sessionInfo?.teacher?.id ||
    (currentSubject === 'physics' || currentSubject === '臾쇰━' ? 'physics1' : 'eng1');

  if (currentSubject === 'math' || currentSubject === '?섑븰') {
    const mathBand = getGradeBand(level, 'math');
    const mathIdMap = {
      'F': 'math1', 'D': 'math2', 'C-': 'math3', 'C+': 'math4',
      'B-': 'math5', 'B+': 'math6', 'A-': 'math7', 'A+': 'math8'
    };
    if (!location.state?.teacher?.id && !sessionInfo?.teacher?.id && !sessionInfo?.teacherProfile?.id) {
      selectedTeacherId = mathIdMap[mathBand] || 'math1';
      currentTeacher = getTeacherById(selectedTeacherId) || currentTeacher;
    }
  }

  // [cleaned comment]
  if (currentSubject === 'physics' || currentSubject === '臾쇰━') {
    const physicsBand = getGradeBand(level, 'physics');
    const physicsIdMap = {
      'F': 'physics1', 'D': 'physics2', 'C-': 'physics3', 'C+': 'physics4',
      'B-': 'physics5', 'B+': 'physics6', 'A-': 'physics7', 'A+': 'physics8'
    };
    if (!location.state?.teacher?.id && !sessionInfo?.teacher?.id && !sessionInfo?.teacherProfile?.id) {
      selectedTeacherId = physicsIdMap[physicsBand] || 'physics1';
      currentTeacher = getTeacherById(selectedTeacherId) || currentTeacher;
    }
  }

  // [cleaned comment]
  if (currentSubject === 'chemistry' || currentSubject === '?뷀븰') {
    const chemBand = getGradeBand(level, 'chemistry');
    const chemIdMap = {
      'F': 'chemistry1', 'D': 'chemistry2', 'C-': 'chemistry3', 'C+': 'chemistry4',
      'B-': 'chemistry5', 'B+': 'chemistry6', 'A-': 'chemistry7', 'A+': 'chemistry8'
    };
    const mappedId = chemIdMap[chemBand];
    if (mappedId && !location.state?.teacher?.id) {
      selectedTeacherId = mappedId;
      currentTeacher = getTeacherById(selectedTeacherId) || currentTeacher;
    }
  }

  const messagesEndRef = useRef(null);
  const hasPlayedIntroRef = useRef(false);

  const isExamCarryOver = false;

  useEffect(() => {
    if (location.state && !sessionInfo) {
      setSessionInfo(location.state);
    }
  }, []);

  useEffect(() => {
    setVideoError(false);
  }, [selectedTeacherId]);

  let mode = currentTeacher?.mode || currentTeacher?.contentProfile || 'BASE';
  const isEngTeacherInfo = currentSubject === 'eng' || currentSubject === 'english' || currentSubject === '영어';
  const hasEngSSOTInfo = currentTeacher && (currentTeacher.routeTitle || currentTeacher.unitTitle || currentTeacher.contentRules || currentTeacher.listeningRules || currentTeacher.features || currentTeacher.sessionQueue);
  
  if (isEngTeacherInfo && hasEngSSOTInfo && (!mode || mode === 'BASE' || mode === 'GROWTH')) {
     mode = 'ENG_SSOT';
     console.log('[MODE FROM SSOT]');
  }

  console.log(`[MODE CHECK]\nteacher=${currentTeacher?.name}\nrawMode=${currentTeacher?.mode || currentTeacher?.contentProfile || `BASE`}\nfinalMode=${mode}\nunitTitle=${unit}`);
  // RUNTIME INPUT 로그
  // console.log('[Classroom] RUNTIME INPUT...');
  const currentPhase = studentState.lessonPhase;

  const SUBJECT_MAP = {
    physics: '물리', chemistry: '화학', biology: '생명과학', earthScience: '지구과학',
    earth_science: '지구과학', math: '수학', english: '영어'
  };
  const localizedSubject = SUBJECT_MAP[currentSubject] || currentSubject;
  const phaseData = getPhaseById(currentPhase);
  const phaseProgress = getPhaseProgress(currentPhase);
  const canAdvance = canAdvancePhase(studentState);
  const nextPhase = getNextPhase(currentPhase);
  const examScope = mode === 'EXAM' ? getExamScope({ grade, examType: examInfo?.examType }) : [];

  const { session, remaining, recommendedPhase, resumedFromCheckpoint, patchSession, finishSession } = useSession({
    subject: currentSubject,
    unit,
    grade,
    level,
    teacher: currentTeacher,
    studyMode: mode,
    isDirectLoad: location.state?.isDirectLoad === true,
    studentState,
    messages,
    onPhaseRecommend: handlePhaseRecommend,
    onNearEnd: handleNearEnd,
    onExpired: handleExpired,
  });

  const elapsed = session?.startTime ? Date.now() - session.startTime : 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0 && isLessonStarted) {
      patchSession({ messages });
    }
  }, [messages, loading, error, patchSession, isLessonStarted]);

  useEffect(() => {
    return () => {
      console.log("AUDIO CLEANUP");
      stopSpeaking();
    };
    }, []);


    

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // [cleaned comment]
    if (messages.length > 0 && isLessonStarted) {
      patchSession({ messages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading, error, patchSession, isLessonStarted]);

  useEffect(() => {
    return () => {
      console.log("AUDIO CLEANUP");
      stopSpeaking();
    };
  }, []);


  const startLesson = useCallback(async (isAppend = false, isPrintModeOverrides = false) => {
    if (!currentTeacher || !currentTeacher.routeId) {
      console.error('Teacher route not connected'); return;
    }
    
    setIsLessonStarted(true);
    stopSpeaking();  // clear TTS queue
    setLoading(true);
    setTeacherState('thinking');
    const isExam = mode.startsWith('EXAM');
    const modeDesc = isExam ? '시험 준비 기간입니다. 직접 핵심 문제를 위주로 빠르게 정리해야 합니다.' : '일상적 원리를 이해하는 방식으로 다뤄볼 거야.';
    
    const isEnglishTargetGrade = (localizedSubject === '영어' || localizedSubject === 'english') && !(level?.includes('1') || level?.includes('2'));

    const normalizedLocalized = String(localizedSubject || '')
  .trim()
  .toLowerCase();
const scienceSet = new Set(['physics', 'chemistry', 'biology', 'earth_science', 'earthscience', 'science', 'sci']);
const isScienceTargetGrade = scienceSet.has(normalizedLocalized) && !(level?.includes('1') || level?.includes('2'));
    const isMathTargetGrade = (normalizedLocalized === 'math') && (level?.includes('F') || level?.includes('4') || level?.includes('5') || level === 'beginner');

    // SSOT: unitTitle 강제 설정 (선생님 우선 기반)
    const activeUnit = currentTeacher.routeTitle || unit || "기본 단원";

    let kickoffInstruction = createLessonStart({
      subject: currentSubject,
      mode: mode,
      teacher: currentTeacher,
      teacherMode: currentTeacher?.mode,
      contentProfile: currentTeacher?.contentProfile,
      unit: activeUnit
    });

    if (isPrintModeOverrides) {
      if (localizedSubject === '영어' || localizedSubject === 'english') {
         kickoffInstruction += '\n추가 조건: "오늘은 학생이 업로드한 숙제를 바탕으로 독해 분석을 진행해줘!"라고 안내 포함.";
      } else {
         kickoffInstruction += "\n추가 조건: "업로드해 준 숙제의 핵심 내용으로 연상 문제를 같이 만들어보자"라고 안내 포함.';
      }
    }

    try {
      const sessionStateStart = {
        grade, subject: localizedSubject, unit: activeUnit, level,
        studyMode: mode,
        printMode: isPrintModeOverrides,
        elapsedMinutes: 0,
        remainingMinutes: remaining ? Math.floor(remaining / 60000) : 0,
        currentPhase: studentState.lessonPhase,
        studentHistory: '',
        sessionId: sessionInfo?.sessionId,
        understandingScore: studentState.conceptScore,
        applyScore: studentState.applyScore,
        mistakePatterns: studentState.recentMistakeTag ? [studentState.recentMistakeTag] : [],
        completedQuestions: 0,
      };

      const systemPromptContent = buildSystemPrompt({ sessionState: sessionStateStart, teacher: currentTeacher, examScope });

      let { reply, ok } = await tutorChat({
        teacher: currentTeacher,
        subject: localizedSubject,
        level,
        messages: [
          { role: 'system', content: systemPromptContent },
          { role: 'user', content: kickoffInstruction }
        ]
      });

      // 백도진 강제 개입 (패턴 문법/교과서 리마인더 차단)
      if (currentTeacher.name === "백도진") {
        let attempt = 0;
        while (attempt < 3 && reply && (reply.includes('현재완료') || reply.includes('문법') || reply.includes('배우는') || reply.includes('문제 사용법'))) {
          console.log("강제 개입 발동: 불필요한 문법/설명 감지 -> 재생성");
          const retryRes = await tutorChat({
            teacher: currentTeacher,
            subject: localizedSubject,
            level,
            messages: [
              { role: 'system', content: systemPromptContent + "\n\nCRITICAL: 아무 문법 현상이나 '현재완료'를 설명하지 말고 바로 스토리 기반만 이해로 들어가라" },
              { role: 'user', content: kickoffInstruction }
            ]
          });
          reply = retryRes.reply;
          ok = retryRes.ok;
          attempt++;
        }
      }
      
      if (ok) {
        const kickoff = { id: Date.now(), role: 'assistant', content: reply };
        setMessages(prev => isAppend ? [...prev, kickoff] : [kickoff]);
        if (ttsEnabled) {
          stopSpeaking(); // before playing, always call stop()
          speakText(reply, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject, isFullMode: isFullAudioMode, phase: currentPhase, onStart: () => setTeacherState('speaking'), onEnd: () => setTeacherState('idle') });
        } else {
          setTeacherState('idle');
        }
      } else {
        console.error('API 반환 실패'); return;
      }
    } catch (e) {
      setError(e.message || 'Teacher route not connected');
      setTeacherState('idle');
    } finally {
      setLoading(false);
    }
  }, [currentTeacher, localizedSubject, unit, level, studentState, grade, mode, examScope, ttsEnabled, setMessages]);

  const handleStartPrintMode = async (type) => { // type: 'pdf', 'image'
     setUploading(true);
     await new Promise(r => setTimeout(r, 1000));
     
     console.log(`[UPLOAD FLOW]
hasUpload=true
uploadType=${type}
studentId=student_001
subject=${currentSubject}`);

     await new Promise(r => setTimeout(r, 1500));
     console.log(`[DOCUMENT ANALYSIS]
text_length=3542
passage_count=${currentSubject.includes('eng') || currentSubject === '?곸뼱' ? 2 : 0}
question_count=4`);

     await new Promise(r => setTimeout(r, 1000));
     console.log(`[AI GENERATION]
generated_questions=5`);

     setIsPrintMode(true);
     setUploading(false);
     setShowUploadPrompt(false);
     setIsLessonStarted(true);
     startLesson(session?.messages?.length > 0, true);
  };

  const handleSkipUpload = () => {
     console.log("[UPLOAD FLOW]\nhasUpload=false');
     setShowUploadPrompt(false);
     setIsLessonStarted(true);
     startLesson(session?.messages?.length > 0, false);
  };

  useEffect(() => {
    if (!sessionInfo || !currentTeacher || !currentSubject || !session) return;

    if (!currentTeacher.hasHomeworkCheck) {
      console.error("?숈젣 寃€???쒖뒪??誘몄뿰寃?teacher"); return;
    }

    if (!isLessonStarted && !loading && !showUploadPrompt && session.messages?.length === 0) {
      if (currentTeacher?.hasHomework === true) {
         if (ttsEnabled) {
           speakText("오늘은 수업 전에 숙제를 먼저 검사할게요. 해온 숙제가 있다면 업로드해주세요.", { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject });
         }
      } else {
         if (ttsEnabled) {
           speakText("오늘은 이전 숙제가 없네요. 바로 오늘 수업을 시작해볼까요?", { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject });
         }
      }
      setShowUploadPrompt(true);
      return;
    } else if (showUploadPrompt || loading) {
        return; // wait for upload prompt decision
    }

    if (!isLessonStarted) {
      setIsLessonStarted(true); // 중복 실행 방지
      
      // [cleaned comment]
      if (session.messages?.length > 0 && messages.length === 0) {
        setMessages(session.messages);
      }

      if (location.state?.isResume) {
        setTeacherState('idle');
        return;
      }

      // [cleaned comment]
      const isAppend = session.messages?.length > 0;
      startLesson(isAppend);
    }
  }, [sessionInfo, currentTeacher, currentSubject, session, isLessonStarted, loading, startLesson, location.state, showUploadPrompt]);

  const handleSend = async (textOverride) => {
    const finalInput = typeof textOverride === 'string' ? textOverride : input;
    if (!finalInput.trim() || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: finalInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const sentInput = finalInput;
    if (typeof textOverride !== 'string') setInput('');
    setLoading(true);
    setError(null);
    setTeacherState('thinking');

    // Build sessionState payload for autonomous AI engine
    const sessionState = {
      grade, subject: currentSubject, unit, level,
      studyMode: mode,
      currentSlideIndex: isMathSlideMode ? currentSlideIndex : null,
      slideType: isMathSlideMode ? PAGE_DATA[currentSlideIndex]?.type : null,
      elapsedMinutes: Math.floor(elapsed / 60000) || 0,
      remainingMinutes: remaining ? Math.floor(remaining / 60000) : 0,
      currentPhase: studentState.lessonPhase,
      studentHistory: isMathSlideMode ? '' : messages.slice(-4).map(m => '${m.role}: ${m.content}').join('\n'), // ?섑븰 ?щ씪?대뱶 紐⑤뱶?먯꽌??怨쇨굅 ????꾨떖 李⑤떒
      sessionId: sessionInfo?.sessionId,
      understandingScore: studentState.conceptScore,
      applyScore: studentState.applyScore,
      mistakePatterns: studentState.recentMistakeTag ? [studentState.recentMistakeTag] : [],
      completedQuestions: studentState.phaseTurns,
      pendingReview: studentState.consecutiveWrong > 0,
      completedTests: [],
      inlineTestCount: studentState.phaseTurns || 0,
      mistakeRecovery: studentState.consecutiveWrong > 0 ? "필요" : "정상",
      // Adaptive English Time Allocation logic tracking
      listeningPerfectStreak: studentState.listeningPerfectStreak || 0,
      readingScore: studentState.readingScore || 0,
      vocabScore: studentState.vocabScore || 0,
      teacherProfile: currentTeacher,
    };

    // Update student state via SSOT transition engine
    handleStudentAnswer(sentInput);

    // Build SSOT-based system prompt and handle vision injection for Math Slide mode
    let payloadMessages = [];

    if (isMathSlideMode) {
      setLoading(true);
      try {
         const currentImageUrl = `/assets/${String(currentSlideIndex).padStart(3, `0')}.webp';

         payloadMessages = [
           {
             role: "user",
             content: [
               {
                 type: "text",
                 text: `현재 문제 번호: ${currentSlideIndex}. 이 이미지는 현재 학생이 보고 있는 수학 문제입니다. 반드시 이 이미지 위의 문제만 기준으로 답하세요.

[수학 문제 SSOT 규칙]
1. 교과서에 해당하는 개념(다항식의 정리, 조합, 생성함수, 일반적인 변환) 사용이 안 됩니다.
2. 불필요하고 무식한 방법은 금지합니다 (불필요한 모든 것 전개, 확인하지 않는 x^4, x^5 계산 등).
3. 추상적인 공식 형태 대입 금지합니다 (예: S = (1-x^n)/(1-x) 등).
4. 중간 단계에서 힌트(참고) 사용이 안 됩니다.

[강제 풀이 규칙: 다항식의 곱셈 (치환 우선 모델)]
곱셈 문제를 한 번에 풀지 않고 분리 벡터 기법으로 모두 전개하는 방식은 '이전 금지' 입니다.
반드시 직관적인 "치환 우선 모델"을 무조건 적용하십시오.
- (a + b + c)^2 구조이면, 각 항을 [ ][ ] 로 정상화하여 각각 전개.
- 출력 순서 강제:
  [치환 우선 설명] (직접적) "곱셈을 괄호 안 항을 만들어 합치는 것"
  [같은 것] a,a -> a^2, b,b -> b^2, c,c -> c^2
  [다른 것] 다른 것끼리의 조합을 순서(a,b / b,a)를 고려해 2ab, 2bc, 2ac 형태가 나옴을 제시
  [최종 정리] 모두 합한 결과를 인쇄

[강제 풀이 규칙: x + 1/x 유형 역합 수식]
문제 수식이 x와 1/x 형태가 모두 존재하면 무식한 거듭제곱 방법은 x^2 이후 치환 적용이 "안 됩니다"
반드시 아래 치환 구조 변환과 같이 마무리하세요.
1. 핵심 관찰: x와 1/x가 함께 있는 구조 파악
2. 원래 방정식을 x로 나누어 x + 1/x = 상수 구조로 먼저 변경, 3. 치환: a = x, b = 1/x 로 정의
4. 기본 조건: a + b = 상수, ab = 1 임을 확인
5. 목표와 변환: 구하려는 수식(예: x^3 - 1/x^3)을 a, b 형태(a^3 - b^3)로 치환
6. 인수분해 적용: a^3 - b^3 = (a-b)(a^2 + ab + b^2)
7. 계산: 실제 (a+b) 와 ab 의 값만으로 순서대로 이해 및 계산으로 마무리할 것
목표: 순수 계산이 아닌 "치환 변환 구조 발견"을 학습시키도록 설명 구성을 강제

[응답 형식 일반 규칙]
1. 단계별로 명확히 나누어 작성하세요. (예: [문제 확인], [1단계], [2단계], [최종 정리])
2. 수식은 반드시 LaTeX 기호로 감싸주세요. 독립적인 중요 수식은 $$를 사용하고, 문장 안의 수식은 $를 사용합니다.
3. 설명은 직관적 문장으로 최소화하고 수식 중심으로 학습이 직관적으로 따라가게 작성하세요. 상황에 따른 금지 사항이 있습니다.
異붽? ?숈깮 ?붿껌: ${sentInput}`
               },
               {
                 type: "image_url",
                 image_url: {
                   url: currentImageUrl
                 }
               }
             ]
           }
         ];
         
         console.log("Vision API Payload Message:", JSON.stringify(payloadMessages, null, 2));

         const { reply, ok, error: apiError } = await tutorChat({
           messages: payloadMessages
         });

         if (!ok) { console.error(apiError || 'API 호출 실패'); return; }
         setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }]);
         if (ttsEnabled) {
           speakText(reply, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject });
         }
      } catch (err) {
         setError("?대?吏 ?먮룆 ?듭떊 ?ㅻ쪟: " + err.message);
      } finally {
         setLoading(false);
         setTeacherState('idle');
      }
      return;
    } else {
      const systemPrompt = buildSystemPrompt({
        sessionState,
        teacher: currentTeacher,
        examScope
      });
      payloadMessages = [
        ...newMessages,
        { role: 'system', content: systemPrompt }
      ];
    }

    try {
      const { reply, ok, error: apiError } = await tutorChat({
        teacher: currentTeacher,
        subject: currentSubject,
        level,
        messages: payloadMessages
      });

      if (!ok) { console.error(apiError || 'API 호출 실패'); return; }

      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: reply };
      setTeacherState('speaking');
      setMessages(prev => [...prev, aiMsg]);

      if (ttsEnabled) {
        stopSpeaking();
        speakText(reply, {
          voice: getVoiceForTeacher(currentTeacher),
          subject: currentSubject,
          isFullMode: isFullAudioMode,
          phase: currentPhase,
          onStart: () => setTeacherState('speaking'),
          onEnd:   () => setTeacherState('idle'),
        });
      } else {
        setTimeout(() => setTeacherState('idle'), 3000);
      }

    } catch (e) {
      setError(e.message || '서버 통신 오류');
      setTeacherState('idle');
    } finally {
      setLoading(false);
    }
  };

  // [SSOT] STT Event-Driven Listening (useMic)
  const { micState, isRecording, isListening, startListening, stopListening, toggleMic, micError } = useMic({
    maxMs: 8000,
    onTranscribed: async (text) => {
      // transcript 없으면 다음 단계로 이동하지 않고 return (transition 차단)
      if (!text || text.trim() === '') {
        console.log('최종 확인: transcript 없음 - transition 차단');
        return;
      }

      const userMsg = { id: Date.now(), role: 'user', content: '🗣️ ${text}` };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      handleStudentAnswer(text);
      setLoading(true);
      setError(null);
      setTeacherState(`thinking`);

      const sessionState = {
        grade, subject: currentSubject, unit, level, studyMode: mode, currentSlideIndex: isMathSlideMode ? currentSlideIndex : null,
        elapsedMinutes: Math.floor(elapsed / 60000) || 0,
        remainingMinutes: remaining ? Math.floor(remaining / 60000) : 0,
        currentPhase: studentState.lessonPhase,
        studentHistory: messages.slice(-4).map(m => `${m.role}: ${m.content}').join('\n'),
        understandingScore: studentState.conceptScore,
        applyScore: studentState.applyScore,
        mistakePatterns: studentState.recentMistakeTag ? [studentState.recentMistakeTag] : [],
        completedQuestions: studentState.phaseTurns,
        pendingReview: studentState.consecutiveWrong > 0,
        completedTests: [],
        inlineTestCount: studentState.phaseTurns || 0,
        mistakeRecovery: studentState.consecutiveWrong > 0 ? "필요" : "정상",
        listeningPerfectStreak: studentState.listeningPerfectStreak || 0,
        readingScore: studentState.readingScore || 0,
        vocabScore: studentState.vocabScore || 0,
      };

      const systemPrompt = buildSystemPrompt({
        sessionState, teacher: currentTeacher, examScope
      });

      try {
        const { reply, ok, error: apiErr } = await tutorChat({
          teacher: currentTeacher, subject: currentSubject, level,
          messages: [...newMessages, { role: 'system', content: systemPrompt }],
        });

        if (!ok) { console.error(apiErr); return; }
        const aiMsg = { id: Date.now() + 1, role: 'assistant', content: reply };
        setTeacherState('speaking');
        setMessages(prev => [...prev, aiMsg]);
        if (ttsEnabled) {
          stopSpeaking(); // TTS 이전 중단 처리
          speakText(reply, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject, isFullMode: isFullAudioMode, phase: currentPhase, onEnd: () => setTeacherState('idle') });
        } else {
          setTimeout(() => setTeacherState('idle'), 3000);
        }
      } catch (err) {
        setError(err.message);
        setTeacherState('idle');
      } finally {
        setLoading(false);
      }
    }
  });

  // VAD(자동 음성) 완전 제거: STT는 버튼 클릭만 동작합니다.

  const handleMic = useCallback(() => {
    toggleMic();
  }, [toggleMic]);

  // if (!sessionInfo) return null;

  // if (!currentTeacher || !currentSubject) {
  //   return (
  //     <div className="classroom-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  //       <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px' }}>
  //         <h2>접근 오류</h2>
  //         <p>수업 진입 상태(state)가 누락되었습니다. 진단 화면에서 다시 시작해주세요.</p>
  //         <button className="btn-primary" onClick={() => navigate('/diagnosis')} style={{ marginTop: '1rem' }}>진단으로 돌아가기</button>
  //       </div>
  //     </div>
  //   );
  // }

  console.log(`[HEADER SYNC]
subject=${localizedSubject}
unitTitle=${unit}
phase=${currentPhase}
mode=${mode}
teacherSubject=${currentTeacher?.subject || currentSubject}`);

    const HomeworkGate = () => {
    if (!showUploadPrompt) return null;
    
    // Simulate homework existence logic (in a real app, this might check a backend or user profile)
    // For demo purposes, we can assume true if teacher hasHomework property exists.
    const hasPriorHomework = currentTeacher?.hasHomework === true;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e1e2e', padding: '3rem', borderRadius: '20px', border: '2px solid #3b82f6', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: '90%' }}>
          
          {hasPriorHomework ? (
            <>
              <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>숙제 검사 게이트</h2>
              <p style={{ color: '#a1a1aa', marginBottom: '2.5rem', lineHeight: '1.5', fontSize: '1.05rem' }}>
                이전 수업에서 부여된 숙제가 존재합니다.<br/>
                <strong style={{ color: '#60a5fa' }}>숙제를 업로드</strong>하시면 AI가 즉각 평가 및 점검을 진행합니다.
              </p>
              
              {uploading ? (
                <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.2rem' }}>숙제 채점 및 피드백 생성 중...</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button className="btn-primary" onClick={() => handleStartPrintMode('pdf')} style={{ background: '#3b82f6', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>PDF 파일 업로드</button>
                  <button onClick={() => handleStartPrintMode('image')} style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>숙제 사진 촬영 / 이미지 업로드</button>
                  <button onClick={handleSkipUpload} style={{ background: 'transparent', color: '#a1a1aa', padding: '1rem', borderRadius: '12px', border: '2px solid #52525b', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem', transition: 'all 0.2s' }}>제출 건너뛰기</button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>숙제 검사 게이트</h2>
              <div style={{ color: '#f87171', padding: '1.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                제출할 숙제가 없습니다
              </div>
              <button 
                onClick={handleSkipUpload} 
                style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', color: 'white', padding: '1rem 2rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(139,92,246,0.4)', width: '100%' }}
              >
                오늘 수업으로 바로 시작
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  const MathSlide = () => (
        <div className="unified-math-panel glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '90vh', borderRadius: '20px', overflow: 'hidden' }}>
          
          {/* =========================================
              새로운 통합 Annotation Layout (Math Slide Mode)
             ========================================= */}
          
           {/* 상단: 화면 PNG + Annotation Layer (85% 영역) */}
          <div style={{ flex: '1 1 85%', minHeight: 0, background: 'rgba(10, 10, 15, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            
            <div style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img 
                src={`/math_images/polynomial/${currentSlideIndex.toString().padStart(2, `0')}.webp'} 
                alt={`Slide ${currentSlideIndex}`} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', borderRadius: '12px' }} 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<div style="color:red">이미지 로드 실패 (경로 오류)</div>'; }}
              />
              
              {/* === AI Annotation Layer === */}
              <div className="annotation-layer" style={{ display: isConceptMode ? 'none' : 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                {currentSlideIndex === 5 && [
                    { id: 1, type: "box", x: 38, y: 44, width: 14, height: 6, color: "rgba(239, 68, 68, 0.2)", stroke: "#ef4444" },
                    { id: 2, type: "text", x: 55, y: 38, text: "먼저 B를 3에 공급합니다", color: "#3b82f6", fontSize: "1.2rem" },
                    { id: 3, type: "arrow", startX: 54, startY: 40, endX: 47, endY: 44, color: "#3b82f6", length: "8%" },
                    { id: 4, type: "underline", x: 28, y: 41, width: 22, height: 0, color: "#10b981" }
                ].map(ann => {
                  if (ann.type === 'box') {
                     return <div key={ann.id} style={{ position: 'absolute', left: '${ann.x}%`, top: `${ann.y}%`, width: `${ann.width}%`, height: `${ann.height}%`, backgroundColor: ann.color, border: `2px solid ${ann.stroke}`, borderRadius: '4px' }} />;
                  } else if (ann.type === 'text') {
                     return <div key={ann.id} style={{ position: 'absolute', left: '${ann.x}%`, top: `${ann.y}%', color: ann.color, fontSize: ann.fontSize, fontWeight: '800', textShadow: '0px 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>{ann.text}</div>;
                  } else if (ann.type === 'arrow') {
                     const angle = Math.atan2(ann.endY - ann.startY, ann.endX - ann.startX) * 180 / Math.PI;
                     return (
                       <div key={ann.id} style={{ position: 'absolute', left: '${ann.startX}%`, top: `${ann.startY}%', width: ann.length, height: '3px', backgroundColor: ann.color, transformOrigin: '0 0', transform: 'rotate(${angle}deg)` }}>
                         <div style={{ position: 'absolute', right: '-2px', top: '-5px', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid ${ann.color}` }} />
                       </div>
                     );
                  } else if (ann.type === 'underline') {
                     return <div key={ann.id} style={{ position: 'absolute', left: '${ann.x}%`, top: `${ann.y}%`, width: `${ann.width}%`, height: '2px', backgroundColor: ann.color }} />;
                  }
                  return null;
                })}
              </div>
              {/* ===================== */}
              {/* === AI Full Solution Overlay Layer === */}
              {!isConceptMode && messages.filter(m => m.role === 'assistant').length > 0 && currentSlideIndex > 0 && (
                <div className="solution-shell" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(15, 15, 20, 0.85)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0
                }}>
                  <div className="solution-scroll" style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '2.5rem',
                    color: 'white',
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    borderRadius: '12px'
                  }}>
                    {messages.filter(m => m.role === 'assistant').map((msg, idx) => {
                      return (
                        <div key={idx} style={{ marginBottom: '2rem' }}>
                          <MathTextRenderer 
                             text={msg.content} 
                             onRead={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                             onExplain={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* ================================== */}

              {/* === CONCEPT MODE OVERLAY === */}
              {isConceptMode && (
                <div className="concept-panel" style={{
                  position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
                  backgroundColor: 'white',
                  zIndex: 9999,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                  paddingTop: '60px', paddingBottom: '40px', gap: '32px', color: '#1e293b'
                }}>
                  <button onClick={handleConceptModeExit} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X 닫기</button>
                  
                  {/* Top Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', minHeight: '120px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#3b82f6', fontWeight: 'bold' }}>구조화 학습 영역</h2>
                    <div style={{ opacity: conceptStep >= 1 ? 1 : 0, transition: 'opacity 1s', textAlign: 'center', fontSize: '1.8rem' }}>
                      <BlockMath math={conceptData?.target || ""} />
                    </div>
                  </div>

                  {/* Middle Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '900px', flex: 1, justifyContent: 'center' }}>
                    {/* Step 2 */}
                    <div className="bracket-row" style={{ opacity: conceptStep >= 2 ? 1 : 0, transition: 'opacity 1s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', minHeight: '80px', color: '#8b5cf6', fontSize: '1.8rem' }}>
                      <BlockMath math={conceptData?.slot || "\\phantom{a}"} />
                    </div>

                    {/* Step 3 */}
                    <div className="case-row" style={{ opacity: conceptStep >= 3 ? 1 : 0, transition: 'opacity 1s', display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: '28px', minHeight: '140px', width: '100%', marginTop: '1rem' }}>
                      {conceptData?.combinations?.map(c => {
                        return (
                          <div key={c.id} style={{ background: `${c.color}11', padding: '1rem 2rem', borderRadius: '12px', border: '2px solid ${c.color}', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem', minWidth: '160px', textAlign: 'center' }}>
                             <BlockMath math={c.text} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Zone */}
                  <div className="result-row" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '140px', width: '100%', maxWidth: '800px' }}>
                    {/* Step 4 */}
                    <div style={{ opacity: conceptStep >= 4 ? 1 : 0, transition: 'opacity 1s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', fontSize: '1.6rem' }}>
                      {conceptData?.reductions?.map((r, idx) => {
                        return (
                          <React.Fragment key={r.id}>
                            {idx > 0 && r.text && !r.text.trim().startsWith('-') && (
                              <div style={{ color: '#64748b', fontSize: '2rem' }}>+</div>
                            )}
                            <div style={{ color: r.color, background: '#f8fafc', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                              <BlockMath math={r.text} />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Step 5 */}
                    <div style={{ opacity: conceptStep >= 5 ? 1 : 0, transition: 'opacity 1s', textAlign: 'center', marginTop: '1.5rem', background: '#ecfeff', padding: '1.2rem 3rem', borderRadius: '16px', border: '3px solid #06b6d4', fontSize: '2rem' }}>
                      <BlockMath math={conceptData?.final || "\\phantom{a}"} />
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.8rem', borderRadius: '12px', zIndex: 10 }}>
              Page {currentSlideIndex.toString().padStart(2, '0')} / 52
            </div>
          </div>
          
           {/* 하단: 채팅 + 최소 액션 영역 (15%) */}
          <div className="input-area" style={{ flex: '0 0 15%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,30,0.95)' }}>
            
            {/* 최근 AI 응답 표시 (요약 또는 빈칸 처리) */}
            <div style={{ fontSize: '1rem', color: '#a855f7', fontWeight: '600', marginBottom: '0.8rem', minHeight: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
               {loading ? (
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>AI 선생님이 최적의 내용을 작성하고 있습니다...</span>
               ) : (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>이전 문제에서 상세 내용을 확인하세요. 계속 질문하거나 다음 버튼을 눌러주세요.</span>
               )}
            </div>

            <div className="input-wrapper" style={{ display: 'flex', gap: '0.8rem', position: 'relative' }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="궁금한 부분을 직접 입력 (예: 'B가 왜 이렇게 되나요?')" onKeyPress={(e) => e.key === 'Enter' && handleSend()} style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem' }} />
              
              <div style={{ position: 'relative' }}>
                <button className="action-btn next-btn" onClick={() => setIsWhiteFocusMode(true)} disabled={loading} style={{ background: '#ffffff', color: '#000000', border: '1px solid #ccc', padding: '0 1.5rem', height: '100%', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginRight: '0.5rem' }}>
                  집중 모드
                </button>
                {currentSlideIndex === 8 && (
                  <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.9rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>NEW!</span>
                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>잘 듣고 가보세요!</span>
                  </div>
                )}
                <button className="action-btn next-btn" onClick={handleConceptModeStart} disabled={loading} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0 1.5rem', height: '100%', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: currentSlideIndex === 8 ? '0 0 15px rgba(139, 92, 246, 0.6)' : 'none' }}>
                  개념 설명하기
                </button>
              </div>

              <button className="action-btn next-btn" onClick={() => { setInput('모르겠어요'); setTimeout(handleSend, 10); }} disabled={loading} style={{ background: '#4b5563', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                힌트 줘              </button>
              <button className="action-btn next-btn" onClick={() => { setInput('모르겠어요'); setTimeout(handleSend, 10); }} disabled={loading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                이해했어              </button>
              <button className="action-btn next-btn" onClick={handleNextSlide} disabled={loading} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                완료 (다음)
              </button>
            </div>
          </div>
        </div>
  );

  const NormalClassroom = () => (
          <div className="chat-section glass-panel">
            {/* Top Sticky Study Bar */}
            <div style={{
              position: 'sticky', top: '0px', zIndex: 50,
              background: 'rgba(20, 20, 30, 0.85)', backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.2rem', marginBottom: '1rem', borderRadius: '10px 10px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <button onClick={() => setIsWhiteFocusMode(true)} style={{ background: '#ffffff', color: '#000000', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                  吏묒쨷 紐⑤뱶
                </button>
                <div style={{ fontSize: '0.85rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(192,132,252,0.1)', borderRadius: '4px' }}>{phaseData?.label}</span>
                </div>
                {remaining !== null && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700',
                    color: remaining <= 10 * 60 * 1000 ? '#ef4444' : '#10b981'
                  }}>
                    <Clock size={16} />
                    남은 시간: {formatTime(remaining)}
                  </div>
                )}
              </div>
            </div>

            {/* 콘솔 디버그 로그 출력 (UI에서 숨김) */}

            {/* Phase progress bar */}
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {LESSON_PHASES.map((p, i) => {
                  const idx = LESSON_PHASES.findIndex(ph => ph.id === currentPhase);
                  const done = i < idx;
                  const active = p.id === currentPhase;
                  return (
                    <div key={p.id} title={p.label} style={{
                      flex: 1, height: '5px', borderRadius: '3px',
                      background: done ? '#10b981' : active ? p.color : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.4s'
                    }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: phaseData?.color, fontWeight: '700' }}>
                  {phaseData?.emoji} {phaseData?.label} ({phaseProgress.current}/{phaseProgress.total})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {studentState.phaseTurns}회 / 최소 {studentState.phaseMinTurns?.[currentPhase] ?? 2}회                </span>
              </div>
            </div>

            <div className="chat-messages">
              {currentPhase === 'hearing' && !isEngEnv && (
                <div style={{ padding: '2rem', background: '#f5f3ff', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', border: '2px solid #8b5cf6' }}>
                  <h3 style={{ color: '#6d28d9', marginBottom: '1rem' }}>🎧 Listening Practice</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => {
                        const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
                        if (lastAssistantMsg) {
                          speakText(lastAssistantMsg.content, { 
                            voice: getVoiceForTeacher(currentTeacher), 
                            isReplay: true,
                            phase: currentPhase
                          });
                        }
                      }}
                      style={{ padding: '0.8rem 2rem', background: '#8b5cf6', color: 'white', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ▶ Play Audio
                    </button>
                    <div style={{ width: '200px', height: '4px', background: '#ddd', borderRadius: '2px', position: 'relative' }}>
                      <div style={{ width: '30%', height: '100%', background: '#8b5cf6', position: 'absolute', left: 0, top: 0, transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>선생님의 질문에 잘 듣고 이해해주세요!</p>
                </div>
              )}
              {currentPhase === 'vocab' && !isEngEnv && (
                <div style={{ padding: '2rem', background: '#ecfdf5', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', border: '2px solid #10b981', overflow: 'hidden', position: 'relative' }}>
                  {['4','5','6','F'].some(grade => level.includes(grade)) ? (
                    // VeniceWordTest (4~6?깃툒)
                    <>
                      <h3 style={{ color: '#047857', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎮</span> 베네치아 단어 연습
                      </h3>
                      <div style={{ fontSize: '1.2rem', color: '#065f46', marginBottom: '1rem' }}>제시어: <strong>"포기하다, 버리다"</strong></div>
                      
                      <div style={{ height: '200px', background: 'rgba(16, 185, 129, 0.1)', position: 'relative', borderRadius: '8px', border: '1px solid #10b981', overflow: 'hidden' }}>
                        {/* FallDown animation would be implemented in CSS, here simulated via inline position */}
                        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                          abandon
                        </div>
                      </div>
                      
                      <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>단어가 떨어지기 전에 정답을 입력하세요!</p>
                    </>
                  ) : (
                    // ContextWordTest (1~3?깃툒)
                    <>
                      <h3 style={{ color: '#047857', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>📖</span> 맥락 문맥 추론 연습
                      </h3>
                      <div style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '1.5rem', lineHeight: '1.6', textAlign: 'left', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        "The government decided to <input type="text" placeholder="[빈칸]" style={{ width: '100px', borderBottom: '2px solid #10b981', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', textAlign: 'center', fontSize: '1.2rem', color: '#047857', fontWeight: 'bold' }} /> their controversial policy due to heavy public criticism."
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#6b7280', textAlign: 'left', paddingLeft: '1rem' }}>
                        힌트: 정책이나 계획 등을 <strong>"철회하다, 포기하다"</strong> 와 유사한 뜻이 필요로 합니다.
                      </div>
                      <button style={{ marginTop: '2rem', padding: '0.8rem 2.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)' }}>정답 제출</button>
                    </>
                  )}
                </div>
              )}
              {messages.map((msg) => {
                 const hasCorrectAction = msg.content?.includes('[CORRECT_ANSWER_ACTION]');
                 return (
                <div key={msg.id || Math.random()} className={`message-wrapper ${msg.role === `user' ? 'student' : 'teacher'}'}>
                  {msg.role === 'assistant' && <div className="avatar min-avatar'>{currentTeacher.name[0]}</div>}
                  <div className={`message ${msg.role === `user' ? 'student' : 'teacher'}'}>
                    <MathTextRenderer 
                        text={msg.content} 
                        onRead={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                        onExplain={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                    />
                    {hasCorrectAction && msg.role === 'assistant' && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleSend("왜 맞는지 설명해줘")} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>왜 맞는지 설명해줘</button>
                            <button onClick={() => speakText(msg.content.replace(/\[CORRECT_ANSWER_ACTION\]/g, ''), { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })} style={{ padding: '0.5rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: '8px', border: '1px solid #10b981', cursor: 'pointer', fontWeight: 'bold' }}>이 문장 다시 듣기</button>
                            <button onClick={() => handleSend("다음 문제 진행해줘")} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 'bold' }}>다음 문제 주세요</button>
                        </div>
                    )}
                  </div>
                </div>
              )})}
              {loading && (
                <div className="message-wrapper teacher">
                  <div className="avatar min-avatar">{currentTeacher.name[0]}</div>
                  <div className="message teacher typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              {error && (
                <div className="error-notice">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
              <div className="input-actions">
                {/* 마이크 버튼 (음성 입력) */}
                <button
                  id="btn-mic"
                  className={`icon-btn ${isRecording ? `active' : ''}'}
                  onClick={handleMic}
                  title={isRecording ? '녹음 중...' : (isListening ? '음성 인식 중...' : '마이크 켜기')}
                  style={{ color: isRecording ? '#ef4444' : (isListening ? '#10b981' : undefined), position: 'relative' }}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  {isRecording && (
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  )}
                </button>

                {/* TTS 켜기/끄기 토글 */}
                <button
                  id="btn-tts-toggle"
                  className="icon-btn"
                  onClick={() => {
                    const next = !ttsEnabled;
                    setTtsEnabled(next);
                    setMuted(!next);
                    if (!next) stopSpeaking();
                  }}
                  title={ttsEnabled ? '음성 켜기' : '음성 끄기'}
                >
                  {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {/* 전체 듣기 모드 토글 */}
                {ttsEnabled && (
                  <button
                    className="icon-btn"
                    onClick={() => setIsFullAudioMode(!isFullAudioMode)}
                    title={isFullAudioMode ? 'TTS: 전체 설명 듣기 (ON)' : 'TTS: 핵심 부분만 듣기 (기본)'}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: 'none', background: isFullAudioMode ? 'rgba(59,130,246,0.1)' : 'transparent', color: isFullAudioMode ? '#3b82f6' : 'var(--text-muted)' }}
                  >
                    {isFullAudioMode ? '듣기: 전체' : '듣기: 핵심'}
                  </button>
                )}

                {micError && (
                  <span style={{ fontSize: '0.72rem', color: '#ef4444', maxWidth: '140px', lineHeight: 1.2 }}>{micError}</span>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`${phaseData?.label} 단계 - 자유롭게 답해보세요`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend} disabled={loading}><Send size={18} /></button>
              </div>
            </div>
          </div>
  );

  const TeacherPanel = () => (
          <div className="teacher-panel">
            <div className="teacher-visual glass-panel">
              <div className="teacher-video-container" style={{ 
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                width: '160px', height: '160px', borderRadius: '50%', 
                overflow: 'hidden', background: '#1a1a24', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 20 
              }}>
                {currentTeacher?.subject === 'english' && !videoError ? (
                  <video 
                    src={`/teachers/${currentTeacher?.subject || 'english'}/${selectedTeacherId}.mp4`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="teacher-video"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setVideoError(true)}
                  />
                ) : (
                  <img
                    src={currentTeacher?.image || `/hteachers/math/${selectedTeacherId}.webp`}
                    alt={currentTeacher?.name || 'Teacher'}
                    onError={(e) => {
                      e.currentTarget.src = '/icons/default-avatar.webp';
                    }}
                    className="teacher-video"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </div>
              <div className="teacher-info text-center">
                <h3>{currentTeacher.name}</h3>
                <p className="teacher-role">{currentTeacher.style}</p>
              </div>
              <div className="live-status">
                <span className={`live-dot ${teacherState !== `idle' ? 'pulse' : ''}'}></span>
                {teacherState === 'thinking' ? 'Thinking...' : teacherState === 'speaking' ? 'Speaking...' : 'Listening...'}
              </div>
            </div>

            {/* SSOT Stats panel */}
            <div className="stats-panel glass-panel">
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>현재 학습 상태</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>개념 이해</span>
                    <span style={{ color: '#a855f7', fontWeight: '700' }}>{studentState.conceptScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "${studentState.conceptScore}%` }} /></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>적용 능력</span>
                    <span style={{ color: '#3b82f6', fontWeight: '700' }}>{studentState.applyScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "${studentState.applyScore}%', background: '#3b82f6' }} /></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>자신감</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{studentState.confidence}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "${studentState.confidence}%', background: '#10b981' }} /></div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.78rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>다음 질문 유형(SSOT)</div>
                <div style={{ color: '#c084fc', fontWeight: '700' }}>
                  {studentState.currentQuestionType === 'concept' ? '📌 개념 확인' :
                   studentState.currentQuestionType === 'apply' ? '📖 적용 문제' :
                   studentState.currentQuestionType === 'misconception' ? '⚠️ 오개념 체크' :
                   studentState.currentQuestionType === 'retry' ? '🔁 재시도' :
                   studentState.currentQuestionType === 'reallife' ? '🌍 실생활 연결' :
                   studentState.currentQuestionType === 'exam_drill' ? '📝 시험 드릴' :
                   studentState.currentQuestionType}
                </div>
                {studentState.recentMistakeTag && (
                  <div style={{ marginTop: '0.4rem', color: '#ef4444', fontSize: '0.75rem' }}>
                    집중 교정 필요: {studentState.recentMistakeTag}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <BarChart2 size={12} /> 관리                </button>
                <button onClick={() => navigate('/test', { state: { unit } })} style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <LogOut size={12} /> 종료 테스트
                </button>
              </div>
            </div>
          </div>
  );

  const renderRouter = () => {
    switch (currentQueuePhase) {
      case 'vocab':
      case 'reading':
        if (isWhiteFocusMode) {
          return (
            <div className="classroom-layout" style={{ gridTemplateColumns: '1fr 350px', marginTop: '10px' }}>
              <WhiteFocusMode subject={currentSubject} teacher={currentTeacher} onClose={() => setIsWhiteFocusMode(false)} />
              <TeacherPanel />
            </div>
          );
        }
        return (
          <div className="classroom-layout" style={{ gridTemplateColumns: '1fr 350px', marginTop: '10px' }}>
            <NormalClassroom />
            <TeacherPanel />
          </div>
        );
      case 'concept':
      case 'problem':
        return (
          <div className="classroom-layout" style={{ gridTemplateColumns: '1fr', marginTop: '10px' }}>
            <MathSlide />
          </div>
        );
      default: return null;
    }
  };

  useEffect(() => {
    if (showUploadPrompt) {
      console.log("[RENDER: HOMEWORK] 게이트 활성화 상태");
    } else {
      console.log("[RENDER: SESSION] SSOT 챗베이스 실제 수업 세션 렌더링 중, phase:", currentQueuePhase);
    }
  }, [showUploadPrompt, currentQueuePhase]);

  return (
    <>
      <HomeworkGate />
      {renderRouter()}
    </>
  );
}
