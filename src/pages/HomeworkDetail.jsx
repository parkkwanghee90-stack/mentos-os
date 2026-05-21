import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Send, ChevronRight, Mic, Volume2 } from 'lucide-react';
import { getTeacherById } from '@/data/teacherProfiles';
import { submitHomework, getHomeworkById } from '@/engine/assistantReviewEngine.js';
import 'katex/dist/katex.min.css';
import katex from 'katex';

// KaTeX 텍스트 혼합 파서
const formatQuestionText = (text) => {
  if (!text) return '';
  const idx = text.indexOf('①');
  if (idx === -1) return text;
  
  const body = text.substring(0, idx).trim();
  const optionsStr = text.substring(idx);
  
  const regex = /(①|②|③|④|⑤)\s*(.*?)(?=(?:①|②|③|④|⑤|$))/g;
  let match;
  const options = [];
  while ((match = regex.exec(optionsStr)) !== null) {
     options.push(`${match[1]} ${match[2].trim()}`);
  }
  
  if (options.length === 5) {
     return `${body}\n\n${options[0]} $\\qquad$ ${options[1]} $\\qquad$ ${options[2]}\n\n${options[3]} $\\qquad$ ${options[4]}`;
  }
  return `${body}\n\n${optionsStr}`;
};

// KaTeX 텍스트 혼합 파서
const parseKaTeXText = (text) => {
  if (!text) return null;
  const parts = [];
  let currentIdx = 0;
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\n)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > currentIdx) {
      parts.push(<span key={`t-${currentIdx}`}>{text.substring(currentIdx, match.index)}</span>);
    }
    const mathStr = match[0];
    if (mathStr === '\n') {
      parts.push(<div style={{ height: '0.5rem' }} key={`br-${match.index}`} />);
    } else if (mathStr.startsWith('$$')) {
      const eq = mathStr.slice(2, -2);
      let html = '';
      try { html = katex.renderToString(eq, { throwOnError: false, displayMode: true, strict: false, trust: true }); }
      catch { html = `<span style="color:#ef4444">${mathStr}</span>`; }
      parts.push(<div key={`m-${match.index}`} style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: html }} />);
    } else {
      const eq = mathStr.slice(1, -1);
      let html = '';
      try { html = katex.renderToString(eq, { throwOnError: false, displayMode: false, strict: false, trust: true }); }
      catch { html = `<span style="color:#ef4444">${mathStr}</span>`; }
      parts.push(<span key={`m-${match.index}`} dangerouslySetInnerHTML={{ __html: html }} />);
    }
    currentIdx = match.index + mathStr.length;
  }
  
  if (currentIdx < text.length) {
    parts.push(<span key={`t-${currentIdx}`}>{text.substring(currentIdx)}</span>);
  }
  return parts;
};

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

export default function HomeworkDetail() {
  const { hwId } = useParams();
  const navigate = useNavigate();
  const [homework, setHomework] = useState(null);
  const [teacher, setTeacher] = useState(null);

  const [hwFile, setHwFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const { isRecording, toggleRecording } = useSTT(setInput);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch homework details
    const hw = getHomeworkById(hwId);
    
    if (hw) {
      setHomework(hw);
      const t = getTeacherById(hw.teacherId);
      setTeacher(t);
      
      let initMsgs = [];
      if (hw.status === 'assigned') {
        initMsgs = [
          { role: 'assistant', content: `${t?.name || '선생님'}이다. 방과후에도 열심히 하네. 내가 내준 숙제 잘 해왔지?` },
          { role: 'assistant', content: `[오늘의 숙제 검사]\n${hw.items.map(i => '- ' + i.title).join('\n')}` },
          { role: 'assistant', content: "숙제한 내용이나 배운 점을 말해볼래? (텍스트나 음성으로 편하게 대답해줘)" }
        ];
      } else if (hw.status === 'submitted') {
        initMsgs = [
          { role: 'assistant', content: '이미 제출 완료된 숙제다. 조교 선생님이 검사 중이니까 조금만 기다려.' }
        ];
      } else if (hw.status === 'reviewed') {
        initMsgs = [
          { role: 'assistant', content: '숙제 검사 결과가 나왔다.' },
          { role: 'system', content: `[조교 채점 완료]\n부족한 부분: ${hw.assistantReview?.weakPoints?.join(', ')}\n잘한 부분: ${hw.assistantReview?.strengths?.join(', ')}` },
          { role: 'assistant', content: '피드백 내용을 바탕으로 다음 수업 때 약점을 보완해주마.' }
        ];
      }
      setMessages(initMsgs);
    } else {
      setMessages([{ role: 'system', content: '숙제를 찾을 수 없습니다.' }]);
    }
  }, [hwId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() && !isRecording && !hwFile) {
        alert("숙제 내용을 텍스트로 입력하거나 음성(마이크)으로 말해주세요.");
        return;
    }
    if (homework.status !== 'assigned') return;

    setLoading(true);
    let finalAnswer = input;
    if (isRecording) {
         toggleRecording(); // stop recording
    }
    if (hwFile) {
         finalAnswer = `[파일 첨부됨] ${finalAnswer}`;
    }

    setMessages(prev => [...prev, { role: 'user', content: finalAnswer }]);
    setInput('');

    // 시뮬레이션
    setTimeout(() => {
      try {
        const updated = submitHomework(hwId);
        setHomework(updated);
        setMessages(prev => [...prev, { role: 'system', content: '[시스템] 답안이 담당 조교에게 성공적으로 전송되었습니다.' }]);
        setMessages(prev => [...prev, { role: 'assistant', content: '잘했다. 숙제 결과는 다음 수업 전이나 조교가 채점한 뒤에 목록에서 확인할 수 있다.' }]);
        
        setTimeout(() => {
           navigate('/homework', { state: { teacher } });
        }, 3000);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  if (!homework) return <div style={{ color: 'white', padding: '2rem', background: '#09090b', height: '100vh' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: 'white' }}>
      {/* 사이드바 UI (수업 화면과 동일 UX) */}
      <div style={{ width: '250px', borderRight: '1px solid #27272a', padding: '1.5rem', background: '#09090b' }}>
        <button onClick={() => navigate('/homework', { state: { teacher } })} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <ChevronRight size={14} style={{ transform: 'rotate(180deg)', marginRight: '4px' }}/> 목록으로
        </button>

        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>{teacher?.name || homework.teacherId}</h2>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#f3f4f6', fontWeight: 'bold' }}>숙제 정보</p>
          <hr style={{ borderColor: '#3f3f46', margin: '0.5rem 0' }} />
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>상태: <strong style={{color: homework.status === 'assigned' ? '#ef4444' : '#3b82f6'}}>{homework.status}</strong></p>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.3rem' }}>배정일: {new Date(homework.assignedAt).toLocaleDateString()}</p>
          {homework.problems && (
            <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.5rem' }}>총 {homework.problems.length} 문항 (동적 렌더링 배정됨)</p>
          )}
        </div>
      </div>
      
      {/* 메인 챗 뷰 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', background: '#18181b', borderBottom: '1px solid #27272a' }}>
          <strong>숙제 진행 방 (수업의 연장)</strong> 
        </div>
        
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {messages.map((m, idx) => {
            if (m.role === 'system') {
               return <div key={idx} style={{ textAlign: 'center', color: '#10b981', fontSize: '0.85rem', margin: '1rem 0', whiteSpace: 'pre-wrap' }}>{m.content}</div>;
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
                  <strong>{m.role === 'user' ? '나' : teacher?.name || '선생님'}:</strong><br/>
                  {m.content}
                </div>
              </div>
            );
          })}
          
          {/* 수학 숙제 문항 렌더링 영역 */}
          {homework.problems && homework.problems.map((prob, i) => (
             <div key={i} style={{ padding: '1.5rem', background: '#27272a', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#60a5fa' }}>숙제 {i+1}번 (변형 문제)</div>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
                  {parseKaTeXText(formatQuestionText(prob.questionText))}
                </div>
                {prob.options && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {prob.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ background: '#18181b', padding: '0.8rem', borderRadius: '8px' }}>
                        {optIdx + 1}) {parseKaTeXText(opt)}
                      </div>
                    ))}
                  </div>
                )}
             </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {homework.status === 'assigned' && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #27272a', background: '#18181b' }}>
            <div style={{ marginBottom: '0.8rem', color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
              <Volume2 size={16} style={{ marginRight: '6px', color: '#10b981' }}/>
              <strong>안내:</strong> 과제에 대해 텍스트나 음성으로 대답하세요. 하나만 있어도 제출할 수 있습니다.
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
               <label style={{ cursor: 'pointer', padding: '0.8rem', borderRadius: '12px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', border: '1px solid transparent' }} title="숙제 사진 첨부">
                 <Camera size={20} color={hwFile ? "#10b981" : "#a1a1aa"} />
                 <input type="file" hidden accept="image/*" onChange={e => setHwFile(e.target.files[0])} />
               </label>
               
               <input 
                  type="text" 
                  placeholder="텍스트로 대답하거나 마이크 버튼을 눌러 음성으로 대답하세요..." 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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

               <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '0 1.5rem', borderRadius: '12px', height: '100%', display: 'flex', alignItems: 'center', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
                 {loading ? '...' : <><Send size={18} style={{marginRight: '6px'}}/> 제출</>}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
