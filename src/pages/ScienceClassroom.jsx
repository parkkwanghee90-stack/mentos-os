import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Send, ChevronRight, CheckCircle, Smartphone, Mic, Volume2, Upload, Paperclip, Clock } from 'lucide-react';
import { getTeacherById } from '@/data/teacherProfiles';
import { useScienceLessonSession } from '@/hooks/useScienceLessonSession';
import { getPendingScienceHomework, getScienceAssistantFeedbackForNextClass } from '@/engine/science/assistantReviewEngine';
import { queueParentPush } from '@/services/pushService';
import { HomeworkEngine } from '@/engine/homeworkEngine';
import { tutorChat } from '@/services/openaiChatApi';
import { saveResult } from '@/services/lessonResultStore';
import { finalizeScienceSession } from '@/engine/science/finalizeSession';
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

      if (phaseName === 'diagnosis') {
        const diagContent = session.curriculumData?.lessonContent?.diagnosis || [];
        initialMessages.push({ role: 'assistant', content: '[0~15분 진단 시작] 커리큘럼 기반 기출 진단을 실시합니다.' });
        diagContent.forEach((q, i) => {
          initialMessages.push({ role: 'assistant', content: `[진단 문항 ${i+1}]\n${q.question}\n(출처: ${q.source})` });
        });
        initialMessages.push({ role: 'assistant', content: '자, 이 진단 문항들의 풀이 접근 과정을 간단히 설명해보세요.' });
      } else if (phaseName === 'frame') {
        const frameData = session.curriculumData?.lessonContent?.frame?.guide || "프레임이 준비 중입니다.";
        initialMessages.push({ role: 'assistant', content: '[15~40분 개념 프레임 세팅]' });
        initialMessages.push({ role: 'assistant', content: frameData });
      } else if (phaseName === 'core_exam') {
        const examContent = session.curriculumData?.lessonContent?.core_exam || [];
        initialMessages.push({ role: 'assistant', content: '[40~80분 핵심 기출 풀이 특훈]' });
        examContent.forEach((q, i) => {
          initialMessages.push({ role: 'assistant', content: `[실전 기출 ${i+1}]\n${q.question}\n\n[조건 분석] ${q.tactic}` });
        });
        initialMessages.push({ role: 'assistant', content: '위 출제 의도를 파악하고 문제 접근 방식을 서술하세요.' });
      } else if (phaseName === 'error_pattern') {
        const patternData = session.curriculumData?.lessonContent?.error_pattern?.summary || "오답 패턴이 로딩되지 않았습니다.";
        initialMessages.push({ role: 'assistant', content: `[80~100분 오답 함정 분석]\n${patternData}` });
        initialMessages.push({ role: 'assistant', content: '본인도 비슷한 함정에 주로 빠지는지 피드백해 보세요.' });
      } else if (phaseName === 'application') {
        const appContent = session.curriculumData?.lessonContent?.application || [];
        initialMessages.push({ role: 'assistant', content: '[100~120분 변형 문제 적용]' });
        appContent.forEach((q, i) => {
          initialMessages.push({ role: 'assistant', content: `[적용 문제 ${i+1}]\n${q.question}` });
        });
        initialMessages.push({ role: 'assistant', content: '혼자 힘으로 논리를 완벽히 구성해 풀어낼 수 있나요? 타이머 시작합니다.' });
      } else if (phaseName === 'intro') {
        // 기존 2회차 이후 플로우
        initialMessages.push({ role: 'system', content: '[수업 준비] 선생님 접속 중...' });
        let introMsg, stepGuide;
        if (ssot.subject === 'chemistry') {
          introMsg = `반갑다. 화학 [${ssot.position}] 과정 담당 ${ssot.name}이다. ${ssot.intro}`;
          stepGuide = `오늘 해결할 '${ssot.features?.[0] || '화학 데이터'}' 훈련 목표부터 화면에 띄울 테니, 확인되면 바로 분석 시작하자.`;
        } else if (ssot.subject === 'biology') {
          introMsg = `만나서 반가워요. 생명과학 [${ssot.position}] 과정 ${ssot.name}입니다. ${ssot.intro}`;
          stepGuide = `오늘 메인 타겟인 '${ssot.features?.[0] || '생명 현상'}' 관련 자료부터 화면에 띄웁니다. 해석할 준비되면 시작 신호를 주세요.`;
        } else if (ssot.subject === 'earth') {
          introMsg = `환영합니다! 지구과학 [${ssot.position}] 파트를 함께할 ${ssot.name}입니다. ${ssot.intro}`;
          stepGuide = `시작할까요? 오늘 집중할 '${ssot.features?.[0] || '지구과학 관측'}' 자료를 띄우겠습니다. 그래프 해석 준비됐으면 알려주세요.`;
        } else {
          introMsg = `반갑다! 물리 [${ssot.position}] 담당 ${ssot.name}이야. ${ssot.intro}`;
          stepGuide = `오늘 정복할 '${ssot.features?.[0] || '물리 개념'}' 훈련 목표 띄워줄게. 눈으로 훑어보고 준비되면 시작하자.`;
        }
        initialMessages.push({ role: 'assistant', content: introMsg });
        initialMessages.push({ role: 'assistant', content: stepGuide });
      } else if (phaseName === 'concept') {
        const conceptData = session.curriculumData?.lessonContent?.concept?.summary || "개념 요약이 로딩되지 않았습니다.";
        initialMessages.push({ role: 'assistant', content: `[개념 압축]\n${conceptData}` });
        let conceptMsg;
        if (ssot.subject === 'chemistry') {
          conceptMsg = '화면의 화학 반응식이나 이온 모델 중에서 본인이 구조적으로 설명하기 어려운 부분이 있다면 먼저 짚고 가자.';
        } else if (ssot.subject === 'biology') {
          conceptMsg = '이 유전 변인이나 세포 자료 중에서 논리가 끊기는 부분이나 헷갈리는 원리가 있다면 무엇인지 분석해 보세요.';
        } else if (ssot.subject === 'earth') {
          conceptMsg = '지금 화면의 천체/기후 변화 그래프 패턴 중에서 당장 스스로 해석해내기 까다로운 변곡점이 보이나요?';
        } else {
          conceptMsg = '방금 띄운 역학 공식이나 벡터 방향 설정에서 아직 완전히 납득 안 되는 원리가 있으면 얘기해.';
        }
        initialMessages.push({ role: 'assistant', content: conceptMsg });
      } else if (phaseName === 'exam') {
        const examObj = session.curriculumData?.lessonContent?.exam || {};
        if (Array.isArray(examObj)) { // 호환성: 배열이면 무조건 여러 문제 출력
            initialMessages.push({ role: 'assistant', content: '[분석 타겟]' });
            examObj.forEach((q, i) => initialMessages.push({ role: 'assistant', content: `문항 ${i+1}: ${q.question}` }));
        } else {
            const examData = examObj.question || "문항이 준비 중입니다.";
            initialMessages.push({ role: 'assistant', content: `[분석 타겟]\n${examData}` });
        }
        let examMsg;
        if (ssot.subject === 'chemistry') {
          examMsg = '자, 실전이다. 주어진 몰수 농도나 산화환원 반응의 어떤 조건부터 단서로 끄집어낼지 접근법을 말해봐.';
        } else if (ssot.subject === 'biology') {
          examMsg = '이 가계도 혹은 뉴런 전도 자료에서 가장 먼저 찾아내야 할 핵심 변인 1가지는 무엇이라고 생각하나요?';
        } else if (ssot.subject === 'earth') {
          examMsg = '자료에 주어진 X축/Y축 단위와 관측 데이터를 보세요. 출제자가 이 도표로 판단하고자 한 이면의 개념이 뭘까요?';
        } else {
          examMsg = '주어진 질량과 마찰 조건부터 스캔해. 어떤 운동 관계식을 세워야 답에 도달할지 초기 설계부터 서술해 봐.';
        }
        initialMessages.push({ role: 'assistant', content: examMsg });
    } else if (phaseName === 'homework') {
      initialMessages.push({ role: 'assistant', content: '[Homework 과제]\n오늘 수업은 여기까지야. 과제 나갈 테니까 꼼꼼히 풀어놔.' });
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
        const pendingHw = getPendingScienceHomework(session.userId, ssot.id);
        const result = finalizeScienceSession(session);
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
    if (!ssot.name || !ssot.targetGrades || !ssot.targetRanks || !(ssot.contentProfile || ssot.routeDescription)) {
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

    let currentQuota = currentPhaseFlow?.phase === 'exam' ? examTarget : currentPhaseFlow?.phase === 'concept' ? conceptTarget : '진도에 맞춰 학생과 자유롭게 1~2회 대화 진행';

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

    // 현재 단계에 맞는 학습 콘텐츠 추출
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
현재 단계: ${currentPhaseFlow.phase.toUpperCase()}
현재 회차: ${session.round}회차
수업 제목: ${session.curriculumData?.roundMeta?.title || '기본 수업'}
수업 방식: ${ssot.routeDescription || ssot.contentProfile || `학생 맞춤형 질의응답`}

[현재 학생 등급별 절대 수업 할당량 (강제 규정)]
의무 할당량: ${currentQuota}
(중요: 이 할당량을 반드시 채울 때까지 계속해서 학생에게 문제나 지문을 반복 제공해야 합니다. 제공된 지문/단어 소스가 부족하다면 즉석에서 선생님이 직접 창작/생성해서라도 무조건 할당량을 채우십시오.)

[오늘의 학습 콘텐츠 (Curriculum Source)]
${curriculumText || '학습 콘텐츠 없음'}

[수업 규칙 및 모드 설정]
${ssot.contentRules ? ssot.contentRules.join('\n') : '규칙 없음'}

당신은 학생과 1:1 과외 중입니다. 위 규칙과 학년, 난이도, 현재 단계에 맞춰서 지문을 주거나 질문을 하세요. 
(만약 학생이 문제를 업로드했다고 명시했다면, 그 형태를 가정하고 즉시 풀이나 해설을 스크립트로 시작하세요.)
반드시 [오늘의 학습 콘텐츠]에 제시된 내용을 우선 기반으로 진행하십시오. 
일반적인 "안녕, 오늘은 기본 단원부터 할게" 같은 기본형 템플릿 출력은 절대 금지됩니다.`;

    const payload = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6), // 최근 문맥 유지
      userMessage
    ];
    
    // UI 업데이트 (유저 메시지)
    setMessages(prev => {
      const arr = [...prev, userMessage];
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
               alert("과학 과목 Ai Vision Solution은 현재 개발 중입니다. (도표 해석 및 실험 데이터 분석 서비스 준비 중)");
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
                {m.content}
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

export default function ScienceClassroomScreen() {
  const location = useLocation();
  const teacher = location.state?.teacher;

  useEffect(() => {
    console.log('[SCIENCE SCREEN LOADED]');
    console.log('CURRENT SUBJECT:', teacher?.subject);
    console.log('LOADED COMPONENT:', 'ScienceClassroomScreen');
  }, [teacher]);

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
  const { session, setSession } = useScienceLessonSession(teacher);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      console.log("[ScienceClassroomScreen] Pure SSOT Session Started");
    }
  }, [!!session]);

  if (!session) return <Loading />;
  if (session.flow.length === 0) return <Loading />;

  // 1. flow의 첫 단계 상태가 homework_gate 이면 Gate UI 렌더
  const currentPhase = session.flow[session.currentPhaseIndex]?.phase;
  
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: 'white', position: 'relative' }}>
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
