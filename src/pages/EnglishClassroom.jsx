import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Send, ChevronRight, CheckCircle, Smartphone, Mic, Volume2, Upload, Paperclip, Clock } from 'lucide-react';
import { getTeacherById } from '@/data/teacherProfiles';
import { useEnglishLessonSession } from '@/hooks/useEnglishLessonSession';
import { getPendingEnglishHomework, getEnglishAssistantFeedbackForNextClass } from '@/engine/english/assistantReviewEngine';
import { queueParentPush } from '@/services/pushService';
import { HomeworkEngine } from '@/engine/homeworkEngine';
import { tutorChat } from '@/services/openaiChatApi';
import { saveResult } from '@/services/lessonResultStore';
import { finalizeEnglishSession } from '@/engine/english/finalizeSession';
import '@/pages/Classroom.css';
import FreeTrialBanner from '@/components/FreeTrialBanner';

const Error = ({ text }) => <div style={{ color: 'red', padding: '2rem', background: '#09090b', height: '100vh' }}>🚨 {text}</div>;
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



function LessonRenderer({ session, setSession, ssot, timeLeft }) {
  const currentPhaseFlow = session.flow[session.currentPhaseIndex];
  
  const [readingState, setReadingState] = useState({
    subPhase: 'intro', // intro -> passage_1 -> passage_2 -> passage_3 -> summary -> complete
    questionCount: 0
  });
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploadedProblem, setUploadedProblem] = useState(null);
  const { isRecording, toggleRecording } = useSTT(setInput);
  const navigate = useNavigate();

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

    if (phaseName === 'reading') {
      const assistantReview = getEnglishAssistantFeedbackForNextClass(session.userId, ssot.id);
      
      if (assistantReview) {
        initialMessages.push({ role: 'system', content: `[조교 채점 리포트 연동] 약점: ${assistantReview.weakPoints.join(', ')}` });
        initialMessages.push({ role: `assistant`, content: `방금 조교 쌤한테 채점 리포트 받았다. 저번에 ${assistantReview.weakPoints[0]} 부분이 약했다고 하더라? 오늘 그 부분 확실히 메꾸고 갈 테니까 따라와.`});
      } else {
        if (introConfig) {
          if (session.round === 1) {
            initialMessages.push({ role: 'assistant', content: introConfig.firstClass.introMessage });
            initialMessages.push({ role: 'assistant', content: introConfig.firstClass.styleMessage });
            initialMessages.push({ role: 'assistant', content: introConfig.firstClass.motivationMessage });
          } else {
            initialMessages.push({ role: 'assistant', content: introConfig.repeatClass.checkMessage });
            initialMessages.push({ role: 'assistant', content: introConfig.repeatClass.reviewMessage });
          }
        }
      }

      const pendingHw = getPendingEnglishHomework(session.userId, ssot.id);
      if (pendingHw && pendingHw.status === 'assigned') {
        initialMessages.push({ role: 'system', content: '[학부모 푸시 발송] 숙제 미제출 상태로 수업이 시작되었습니다.' });
        initialMessages.push({ role: 'assistant', content: '어? 그런데 너 숙제 아직 안 냈더라. 일단 오늘의 진도는 나가겠는데, 수업 다 끝나면 사이드바 [숙제함] 들어가서 무조건 제출하고 가라. 학부모님한테도 알림 갔다.' });
        queueParentPush(`[숙제 미제출 안내] 자녀가 ${ssot.name} 선생님의 수업에 입장했으나, 아직 지난번 숙제를 제출하지 않았습니다. 수업 후 제출할 수 있도록 지도 부탁드립니다.`);
      }

      const readingData = session.curriculumData?.lessonContent?.reading;
      const firstPassage = readingData?.passages?.[0];
      const firstContent = firstPassage?.text || readingData?.passage || "[지문 누락]";
      const firstQuestion = firstPassage?.question || "";
      const isTopTier = session.rank?.join('')?.includes('1') || session.rank?.join('')?.includes('2');
      
      initialMessages.push({ role: 'assistant', content: `[오늘의 본문 타겟]\n${firstContent}` });
      if (isTopTier && firstQuestion) {
        initialMessages.push({ role: 'assistant', content: `자, 지문 다 읽었으면 다음 문제 풀어봐. 느낌으로 찍지 말고 반드시 '지문 구조, 핵심 단어, 역접 논리, 정답 근거' 4가지를 정확히 말해야 인정해준다.\n\n[문제]\n${firstQuestion}` });
      } else {
        initialMessages.push({ role: 'assistant', content: "자, 지금부터 이 지문의 첫 줄을 구조적으로 파악해볼까? 주제가 뭘까?" });
      }
    } else if (phaseName === 'hearing') {
      const firstContent = session.curriculumData?.lessonContent?.hearing?.script || "리스닝 스크립트를 듣습니다.";
      initialMessages.push({ role: 'assistant', content: `[Hearing 시작] 집중해라. 아래 지문의 구조를 들을 거다.\n\n${firstContent}` });
      initialMessages.push({ role: 'assistant', content: "방금 들은 대화에서 주인공이 처음에 던진 해결책이 뭐였는지 말해봐." });
    } else if (phaseName === 'vocab') {
      const modeName = currentPhaseFlow.subFlow[session.vocabSubPhaseIndex];
      if (modeName === 'venice') {
        initialMessages.push({ role: 'assistant', content: "[Vocab - Venice Mode] 눈을 감고 오늘의 단어가 쓰일 상황을 머릿속에 그려봐. 단어는 맥락이야." });
      } else {
        const firstVocab = session.curriculumData?.lessonContent?.vocab?.words?.[0] || { word: "Sample", meaning: "샘플" };
        initialMessages.push({ role: 'assistant', content: `[Vocab - ${modeName}]\n첫 번째 타겟 단어: ${firstVocab.word} (${firstVocab.meaning})` });
        initialMessages.push({ role: 'assistant', content: "이 단어의 품사가 뭔지, 그리고 어떤 뉘앙스인지 아는 대로 말해볼래?" });
      }
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
        const result = finalizeEnglishSession(session);
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

    if (currentPhaseFlow?.phase === 'reading' && readingState.subPhase !== 'complete') {
      alert(`[조건 미충족] 최소 3개의 지문 진행 및 요약(Summary) 단계가 완료되지 않았습니다.\n현재 상태: ${readingState.subPhase} / 누적 질문: ${readingState.questionCount}개 (필수 9개)`);
      return;
    }

    // Vocab 내부 서브 페이즈 체크
    if (currentPhaseFlow.phase === 'vocab') {
      if (session.vocabSubPhaseIndex < currentPhaseFlow.subFlow.length - 1) {
        setSession({ ...session, vocabSubPhaseIndex: session.vocabSubPhaseIndex + 1 });
        return;
      }
    }
    // 다음 상태로 진행
    setSession({ ...session, currentPhaseIndex: session.currentPhaseIndex + 1, vocabSubPhaseIndex: 0 });
  };

  const handeSubmit = async () => {
    if (!input.trim() && !isRecording) return;
    if (loading) return;

    if (isRecording) {
      toggleRecording(); // Stop STT if active
    }
    // 강제 SSOT 체크: 정보가 완벽하지 않으면 호출 금지
    if (!ssot.name || !ssot.targetGrades || !ssot.targetRanks || !ssot.contentProfile) {
      console.error("SSOT 무결성 위반: LLM 호출을 차단합니다.", ssot);
      alert("선생님 데이터(SSOT)가 불완전하여 수업을 진행할 수 없습니다.");
      return;
    }

    // 등급 기반 동적 타겟 할당 (SSOT Rules)
    const rankStr = session.rank?.join('') || '';
    let readingTarget = '';
    let hearingTarget = '';
    let vocabTarget = '';
    let examTarget = '';
    let conceptTarget = '';

    if (rankStr.includes('1') || rankStr.includes('2')) {
       readingTarget = '긴 수능형 독해 지문을 활용하여 최소 12~15개 문항 연속 출제 및 해설';
       hearingTarget = '최소 20개 문항의 듣기 테스트 연속 진행';
       vocabTarget = '고난이도 단어 최소 40개 연속 테스트 완료';
       examTarget = '최상위권 변별력 킬러 문항 최소 5문항 연속 출제 및 심층 해설';
       conceptTarget = '핵심 공식 유도 및 심화 융합 개념 최소 3개 질문';
    } else if (rankStr.includes('3')) {
       readingTarget = '중간 길이(5~10줄) 독해 5문제, 장문형 독해 5문제 (총 10개 문항) 연속 진행';
       hearingTarget = '실전 난이도 15문제 듣기 테스트 연속 진행';
       vocabTarget = '수능 필수 빈출 단어 최소 30개 연속 진행';
       examTarget = '수능/내신 빈출 기출 5문항 출제 (2~3등급 컷 수준)';
       conceptTarget = '주요 개념 이해 확인 질문 3회 연속 진행';
    } else {
       readingTarget = '짧고 쉬운(5~10줄) 기초 독해 중심 10개 문항 연속 진행';
       hearingTarget = '초급용 10개 문항 듣기 테스트 연속 진행';
       vocabTarget = '기초 단어 최소 30개 집중 암기 및 테스트 완료';
       examTarget = '기본기 점검 내신 필수 3문항 출제 및 친절한 해설';
       conceptTarget = '가장 기초적인 공식과 용어 암기 3개 질문 진행';
    }

    let currentQuota = currentPhaseFlow?.phase === 'reading' ? readingTarget 
                     : currentPhaseFlow?.phase === 'hearing' ? hearingTarget 
                     : vocabTarget;

    // 커리큘럼 데이터(lessonContent)가 없으면 호출 금지
    const lessonContent = session.curriculumData?.lessonContent;
    if (!lessonContent) {
      console.error("Curriculum 무결성 위반: 현재 회차의 lessonContent가 없습니다.", session.curriculumData);
      alert("현재 회차의 수업 콘텐츠가 준비되지 않아 수업을 진행할 수 없습니다.");
      return;
    }

    const userMessage = { 
      role: 'user', 
      content: uploadedProblem ? `[문제 이미지 첨부됨]\n${input}` : input 
    };
    setInput('');
    setUploadedProblem(null);
    setLoading(true);

    let newReadingState = { ...readingState };
    let injectedPassage = null;
    let readingInstruction = null;

    if (currentPhaseFlow?.phase === 'reading') {
      const isTopTier = session.rank?.join('')?.includes('1') || session.rank?.join('')?.includes('2');
      const totalPassages = session.curriculumData?.lessonContent?.reading?.passages?.length || 3;
      
      let passTriggered = false;
      if (isTopTier) {
        const lastAsst = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAsst && lastAsst.content.includes('[CORRECT_ANSWER_ACTION]')) {
          passTriggered = true;
        }
        if (passTriggered) {
          newReadingState.questionCount += 1;
        }
      } else {
        newReadingState.questionCount += 1;
      }

      const questionsPerPassage = isTopTier ? 1 : 3;
      const totalQuestions = totalPassages * questionsPerPassage;

      let pIndex = Math.floor(newReadingState.questionCount / questionsPerPassage); 
      if (!isTopTier) {
        pIndex = Math.floor((newReadingState.questionCount - 1) / questionsPerPassage); 
      }
      
      let qType = 0;
      if (!isTopTier) {
        qType = (newReadingState.questionCount - 1) % questionsPerPassage; 
      }

      if (newReadingState.subPhase === 'intro') {
        newReadingState.subPhase = 'passage_1';
        console.log('[READING_PHASE_START]');
      }

      const effectiveQuestionCount = isTopTier ? newReadingState.questionCount : newReadingState.questionCount - 1;

      if (effectiveQuestionCount < totalQuestions) {
          const passageName = `passage_${pIndex + 1}`;
          const currentPassageData = session.curriculumData?.lessonContent?.reading?.passages?.[pIndex];
          
          if (newReadingState.subPhase !== passageName) {
              newReadingState.subPhase = passageName;
              console.log(`[PASSAGE_${pIndex + 1}_START]`);
              if (pIndex > 0) {
                  const pTxt = currentPassageData?.text || "Passage text missing.";
                  const pQ = currentPassageData?.question || "";
                  injectedPassage = { role: 'assistant', content: `[오늘의 본문 타겟]\n${pTxt}` };
                  if (isTopTier) {
                      injectedPassage.content += `\n\n[문제]\n${pQ}`;
                      readingInstruction = `다음 지문과 문제를 출력했습니다. 학생이 스스로 새로운 지문의 문제를 풀도록 강하게 독려하세요.`;
                  }
              }
          } else {
              if (isTopTier) {
                  readingInstruction = `학생이 제출한 답과 논리를 평가하세요. 완벽하다면 극찬 후 응답 맨 마지막에 반드시 '[CORRECT_ANSWER_ACTION]' 태그를 하나 출력하세요.\n만약 학생이 틀렸거나 모른다고 하면, 절대 스스로 정답을 맞출 때까지 가둬두고 괴롭히지 마세요! 즉시 '왜 이것이 정답인지, 지문 구조와 논리적 근거가 무엇인지' 선생님으로서 명쾌하게 해설하여 학생을 이해시키세요. 해설을 제공한 뒤 학생을 격려하며 바로 넘어갈 수 있도록 응답 마지막에 '[CORRECT_ANSWER_ACTION]' 태그를 출력하세요.`;
              } else {
                  if (qType === 0) {
                     readingInstruction = `방금 화면에 제시한 ${pIndex+1}번째 지문에 관하여, 지문의 핵심 주제(Topic)를 묻는 단 1개의 문제를 즉시 출제하세요. 학생을 환영하거나 덧붙이는 인사말은 제외하세요.`;
                  } else if (qType === 1) {
                     readingInstruction = `이전 학생 답변을 매우 짧게 피드백한 후, 연이어서 같은 ${pIndex+1}번째 지문에 대해 글의 논리 구조(Structure)를 파악하는 단 1개의 문제를 출제하세요.`;
                  } else if (qType === 2) {
                     readingInstruction = `이전 학생 답변을 피드백한 후, 같은 ${pIndex+1}번째 지문에 한정어구를 활용한 추론(Inference)을 요구하는 심화 문제 단 1개를 즉시 출제하세요.`;
                  }
              }
          }
      } else {
          newReadingState.subPhase = 'summary';
          if (effectiveQuestionCount === totalQuestions) {
              console.log('[PASSAGE_COMPLETE]');
              readingInstruction = `장시간의 총 ${totalPassages}개 지문 집중 훈련 코스가 전부 종료되었습니다! 학생에게 압박을 해제해주고, 오늘 다룬 모든 지문들을 관통하는 핵심 논리 총평(Summary) 및 따뜻한 격려 피드백을 전달하십시오. 새 지문이나 추가 문제는 금지됩니다.`;
          } else if (effectiveQuestionCount >= totalQuestions + 1) {
              newReadingState.subPhase = 'complete';
              console.log('[READING_COMPLETE]');
          }
      }

      if (newReadingState.subPhase.startsWith('passage') || ['summary', 'complete'].includes(newReadingState.subPhase)) {
         console.log(`[QUESTION_${effectiveQuestionCount}] (진도: ${Math.floor((effectiveQuestionCount/totalQuestions)*100)}%)`);
      }
      
      setReadingState(newReadingState);
    }

    const subPhase = currentPhaseFlow.phase === `vocab` ? `(${currentPhaseFlow.subFlow[session.vocabSubPhaseIndex]})` : '';
    
    // 현재 단계에 맞는 학습 콘텐츠(지문/단어) 추출
    let curriculumText = "학습 콘텐츠가 로딩되지 않았습니다.";
    if (lessonContent) {
      const phaseKey = currentPhaseFlow.phase.toLowerCase();
      const phaseData = lessonContent[phaseKey];
      if (phaseData) {
        curriculumText = JSON.stringify(phaseData, null, 2);
      }
    }

    // 사용자 지시사항 정확히 반영된 절대 프롬프트 템플릿
    const systemPrompt = `당신은 ${ssot.name} 선생님입니다.
대상 학년: ${ssot.targetGrades.join(', ')}
난이도: ${ssot.targetRanks.join(`, `)}
현재 단계: ${currentPhaseFlow.phase.toUpperCase()} ${subPhase}
현재 회차: ${session.round}회차
수업 제목: ${session.curriculumData?.roundMeta?.title || '기본 수업'}
수업 방식: ${ssot.contentProfile}

[현재 학생 등급별 절대 수업 할당량 (강제 규정)]
의무 할당량: ${currentQuota}
(중요: 이 할당량을 반드시 채울 때까지 계속해서 학생에게 문제나 지문을 반복 제공해야 합니다. 제공된 지문/단어 소스가 부족하다면 즉석에서 선생님이 직접 창작/생성해서라도 무조건 할당량을 채우십시오.)

[오늘의 학습 콘텐츠 (Curriculum Source)]
${curriculumText || `학습 콘텐츠 없음`}

[수업 규칙 및 모드 설정]
${ssot.contentRules ? ssot.contentRules.join('\n') : '규칙 없음'}

당신은 학생과 1:1 과외 중입니다. 위 규칙과 학년, 난이도, 현재 단계에 맞춰서 지문을 주거나 질문을 하세요. 
(만약 학생이 문제를 업로드했다고 명시했다면, 그 형태를 가정하고 즉시 풀이나 해설을 스크립트로 시작하세요.)
반드시 [오늘의 학습 콘텐츠]에 제시된 내용을 우선 기반으로 진행하십시오. 
일반적인 '안녕, 오늘은 기본 단원부터 할게' 같은 기본형 템플릿 출력은 절대 금지됩니다.`;

    const payload = [
      { role: 'system', content: systemPrompt },
      ...(readingInstruction ? [{ 
         role: 'system', 
         content: `[시스템 강제 명령표] 당신은 절대적으로 아래 지시사항을 즉시 100% 따라야만 합니다.\n지시사항: ${readingInstruction}`
      }] : []),
      ...messages.slice(-6), // 최근 문맥 유지
      userMessage
    ];
    
    // UI 업데이트 (유저 메시지와 새로 추가되는 지문이 있다면 일괄 업데이트)
    setMessages(prev => {
      const arr = [...prev, userMessage];
      if (injectedPassage) arr.push(injectedPassage);
      return arr;
    });

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#09090b', color: 'white' }}>
      <div style={{ padding: '1rem', background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Phase: {currentPhaseFlow.title.toUpperCase()}</strong> 
          <span style={{ fontSize: '0.85rem', color: '#a1a1aa', marginLeft: '10px' }}>({currentPhaseFlow.duration} mins)</span>
          {currentPhaseFlow.phase === 'vocab' && (
            <span style={{ marginLeft: '10px', color: '#f59e0b' }}>
              &gt; {currentPhaseFlow.subFlow[session.vocabSubPhaseIndex].toUpperCase()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => {
               alert("영어 과목 Ai Vision Solution은 현재 개발 중입니다. (본문 분석 및 구문 해설 서비스 준비 중)");
            }}
            className="hover-scale"
            style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}
          >
            ✨ AI Vision Solution
          </button>
          <button className="btn-secondary" onClick={advance}>스킵 테스트 <ChevronRight size={14}/></button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {uploadedProblem && (
          <div style={{ padding: '1rem', background: '#1e1b4b', border: '1px dashed #6366f1', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={uploadedProblem} alt="Upload Preview" style={{ height: '80px', borderRadius: '4px' }} />
            <div>
              <p style={{ color: '#818cf8', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>📤 외부 문제 업로드 대기중</p>
              <p style={{ fontSize: '0.85rem', color: '#a5b4fc', margin: 0 }}>메시지를 전송하면 선생님이 해당 문제를 기준으로 해설을 시작합니다.</p>
            </div>
          </div>
        )}

        {messages.map((m, idx) => {
          if (m.role === 'system') {
             return <div key={idx} style={{ textAlign: 'center', color: '#818cf8', fontSize: '0.85rem', margin: '1rem 0' }}>{m.content}</div>;
          }
          return (
            <div key={idx} style={{ textAlign: m.role === 'user' ? 'right' : 'left', marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '1rem 1.5rem', 
                borderRadius: '12px', 
                background: m.role === 'user' ? '#3b82f6' : '#27272a', 
                maxWidth: '80%', 
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                textAlign: 'left'
              }}>
                <strong>{m.role === 'user' ? '나' : ssot.name}:</strong><br/>
                {(() => {
                  if (m.role === 'assistant' && typeof m.content === 'string' && m.content.includes('[오늘의 본문 타겟]')) {
                    const lines = m.content.split('\n');
                    const targetIdx = lines.findIndex(l => l.includes('[오늘의 본문 타겟]'));
                    const englishFragment = lines.slice(targetIdx + 1).join('\n').trim();
                    return (
                      <div style={{ position: 'relative', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                          onClick={() => {
                            console.log('[READ_BUTTON] clicked');
                            window.speechSynthesis.cancel();
                            console.log('[TTS_ENGLISH] start');
                            console.log(`[TTS_ENGLISH] text length=${englishFragment.length}`);
                            const sentence = new SpeechSynthesisUtterance(englishFragment);
                            sentence.lang = 'en-US';
                            window.speechSynthesis.speak(sentence);
                          }}
                          style={{ position: 'absolute', top: '-10px', right: 0, background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Volume2 size={14} style={{marginRight: '6px'}} /> 읽기
                        </button>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                          {englishFragment}
                        </div>
                        {lines.slice(0, targetIdx).join('\n')}
                      </div>
                    );
                  }
                  return typeof m.content === 'string' ? m.content.replace(/\[(CORRECT_ANSWER_ACTION|NEXT_PASSAGE)\]/g, '').trim() : m.content;
                })()}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 하단 고정 입력 바 */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #27272a', background: '#18181b' }}>
        <div style={{ marginBottom: '0.8rem', color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          <Volume2 size={16} style={{ marginRight: '6px', color: '#10b981' }}/>
          <strong>안내:</strong> 현재 단계({currentPhaseFlow.title})의 지문을 확인하고 답을 텍스트나 음성으로 입력하세요.
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
              disabled={loading}
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
    </div>
  );
}

export default function EnglishClassroomScreen() {
  const location = useLocation();
  const teacher = location.state?.teacher;

  useEffect(() => {
    const saved = localStorage.getItem(`last_course_${teacher?.id || 'default'}`);
    console.log('[ENGLISH SCREEN LOADED]');
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
    throw new Error("teacher 없음 → 진입 차단");
  }

  // Hook 내부는 SSOT 객체를 받음
  const { session, setSession } = useEnglishLessonSession(teacher);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      console.log("[EnglishClassroomScreen] Pure SSOT Session Started");
    }
  }, [!!session]);

  if (!session) return <Loading />;
  if (session.flow.length === 0) return <Loading />;

  // 1. flow의 첫 단계 상태가 homework_gate 이면 Gate UI 렌더
  const currentPhase = session.flow[session.currentPhaseIndex]?.phase;
  
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: 'white', position: 'relative' }}>
      
      {/* Free Trial / Paywall Gate */}
      <FreeTrialBanner gradeFlow={location.state?.gradeFlow || '고1'} />
      
      {/* Global Timer Overlay */}
      <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '1px' }}>
        <Clock size={20} />
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
          style={{ width: '100%', padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <CheckCircle size={18} /> 숙제함 가기
        </button>
      </div>
      
      <LessonRenderer session={session} setSession={setSession} ssot={teacher} timeLeft={timeLeft} />
    </div>
  );
}
