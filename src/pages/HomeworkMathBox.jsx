import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, BookOpen, Send, Mic, Paperclip, ChevronRight, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import MathProblemRenderer from '@/components/MathProblemRenderer';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';

export default function HomeworkMathBox() {
  const navigate = useNavigate();
  const { homeworkId } = useParams();
  const location = useLocation();
  
  const [homework, setHomework] = useState(null);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [gradingResult, setGradingResult] = useState(null);
  const [solvedStatus, setSolvedStatus] = useState({}); // { problemId: { isCorrect: bool, userAnswer: string } }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let db = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
    let hw = db.find(h => h.homeworkId === homeworkId);
    
    // Inject mock homework if sim_hw_001
    if (!hw && homeworkId === 'sim_hw_001') {
      const mockHw = {
        homeworkId: 'sim_hw_001',
        title: '[오답 집중 보강] 고차방정식 2단계 유사 유형 드릴',
        date: new Date().toLocaleDateString(),
        problems: Array.from({ length: 12 }).map((_, i) => ({
          problemId: `sim_p_${i}`,
          unit: `고차방정식 2단계`,
          questionText: `다음 고차방정식의 해를 구하시오.\n\n $$x^4 - 5x^2 + 4 = 0$$ \n\n (유사 문항 ${i+1})`,
          answer: '4' // mock answer
        }))
      };
      db.push(mockHw);
      localStorage.setItem('mentos_math_homework_db', JSON.stringify(db));
      hw = mockHw;
    }

    if (hw) {
      setHomework(hw);
      // Load progress if any
      const progress = JSON.parse(localStorage.getItem(`hw_progress_${homeworkId}`) || '{}');
      setSolvedStatus(progress);
    } else {
      alert("숙제 정보를 찾을 수 없습니다.");
      navigate('/dashboard');
    }
  }, [homeworkId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!homework) return <div style={{ background: '#09090b', color: 'white', height: '100vh', padding: '2rem' }}>Loading Homework...</div>;

  const currentProblem = homework.problems?.[currentProblemIdx];
  const totalProblems = homework.problems?.length || 0;
  const isAllSolved = Object.keys(solvedStatus).length === totalProblems;

  const handleGrade = () => {
    if (!currentProblem) return;
    
    const normalizeAnswer = (str) => {
      if (!str) return '';
      let clean = String(str).replace(/\s+/g, '').trim();
      
      // [Normalizer] x=2, answer:2 -> 2
      clean = clean.replace(/^[a-zA-Z]+[:=]/, '');
      
      // [Normalizer] 2.0 -> 2 (integers)
      if (!isNaN(clean) && clean.includes('.')) {
          const num = parseFloat(clean);
          if (Number.isInteger(num)) clean = String(num);
      }

      // [Normalizer] +2 -> 2
      if (clean.startsWith('+') && !isNaN(clean.substring(1))) {
          clean = clean.substring(1);
      }

      // Map circle numbers to option index integers
      const mapCircle = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
      if (mapCircle[clean]) clean = mapCircle[clean];

      return clean;
    };

    const normUser = normalizeAnswer(userAnswer);
    const normCorrect = normalizeAnswer(currentProblem.answer || '5');
    
    const isCorrect = (normUser === normCorrect) || 
                      (normCorrect.includes(normUser) && normUser.length > 0);
    
    const newStatus = {
      ...solvedStatus,
      [currentProblem.problemId]: { isCorrect, userAnswer }
    };
    setSolvedStatus(newStatus);
    localStorage.setItem(`hw_progress_${homeworkId}`, JSON.stringify(newStatus));
    
    setGradingResult(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setMessages(prev => [...prev, { role: 'assistant', content: `🎉 정답입니다! ${currentProblemIdx + 1}번 문제를 해결하셨네요.` }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ 아쉽네요. 다시 한번 생각해보거나 아래 AI Vision Solution을 확인해보세요.' }]);
    }
  };

  const showAVS = () => {
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '이 문제의 원본 풀이 구조를 기반으로 한 **Ai Vision Solution**을 준비했습니다. 숫자 변형 전의 핵심 논리를 확인해보세요!',
      hintPlayer: { unit: currentProblem.unit || '공통', problemId: String(currentProblem.sourceProblemId).padStart(3, '0') }
    }]);
  };

  const handleFinish = () => {
    const db = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
    const updatedDb = db.map(h => h.homeworkId === homeworkId ? { ...h, status: 'reviewed', completedAt: Date.now() } : h);
    localStorage.setItem('mentos_math_homework_db', JSON.stringify(updatedDb));
    
    // Parent Push simulation
    const correctCount = Object.values(solvedStatus).filter(s => s.isCorrect).length;
    const rate = Math.round((correctCount / totalProblems) * 100);
    console.log(`[PARENT PUSH] 오늘 숙제 완료율 ${rate}% / 취약 단원: ${currentProblem.unit || '분석 중'}`);
    
    alert(`숙제 제출 완료! 정답률: ${rate}%`);
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: 'white' }}>
      {/* Sidebar: Progress */}
      <div style={{ width: '300px', borderRight: '1px solid #27272a', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }}/> 대시보드
        </button>
        
        <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>오늘의 수학 숙제</h2>
        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '2rem' }}>날짜: {homework.date}</p>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {homework.problems?.map((p, idx) => (
              <div 
                key={p.problemId}
                onClick={() => {
                   setCurrentProblemIdx(idx);
                   setGradingResult(null);
                   setUserAnswer(solvedStatus[p.problemId]?.userAnswer || '');
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  background: currentProblemIdx === idx ? '#3b82f6' : (solvedStatus[p.problemId] ? (solvedStatus[p.problemId].isCorrect ? '#10b981' : '#ef4444') : '#27272a'),
                  border: currentProblemIdx === idx ? '2px solid white' : '1px solid #3f3f46'
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleFinish}
          disabled={!isAllSolved}
          style={{ 
            marginTop: '2rem',
            padding: '1rem', 
            background: isAllSolved ? '#10b981' : '#3f3f46', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            cursor: isAllSolved ? 'pointer' : 'not-allowed' 
          }}
        >
          {isAllSolved ? '숙제 최종 제출' : '모든 문제 풀이 후 제출'}
        </button>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            {/* Problem Display */}
            <div style={{ background: 'white', color: 'black', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
               <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                 [숙제 문제 {currentProblemIdx + 1}] {currentProblem.unit}
               </h3>
               <div style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                 <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                   {currentProblem.questionText}
                 </ReactMarkdown>
               </div>
            </div>

            {/* Answer Input */}
            <div style={{ background: '#18181b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="정답 입력" 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  style={{ flex: 1, padding: '1rem', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontSize: '1.1rem' }}
                />
                <button 
                  onClick={handleGrade}
                  style={{ padding: '0 2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  제출
                </button>
                <button 
                  onClick={showAVS}
                  style={{ padding: '0 1.5rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✨ AVS
                </button>
              </div>
              {gradingResult && (
                <div style={{ marginTop: '1rem', color: gradingResult === 'correct' ? '#10b981' : '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {gradingResult === 'correct' ? <CheckCircle size={18}/> : <X size={18}/>}
                  {gradingResult === 'correct' ? '정답입니다! 다음 문제로 넘어가세요.' : '틀렸습니다. 다시 고민해보거나 AVS를 확인하세요.'}
                </div>
              )}
            </div>

            {/* AI Interaction (Messages) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    background: m.role === 'user' ? '#3b82f6' : '#27272a',
                    maxWidth: '90%'
                  }}>
                    {m.content}
                    {m.hintPlayer && (
                      <div style={{ marginTop: '1rem' }}>
                        <HintPlayerRouter unit={m.hintPlayer.unit} problemId={m.hintPlayer.problemId} showQA={false} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ padding: '1rem 2rem', background: '#18181b', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            disabled={currentProblemIdx === 0}
            onClick={() => { setCurrentProblemIdx(prev => prev - 1); setGradingResult(null); }}
            style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer' }}
          >
            이전 문제
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({currentProblemIdx + 1} / {totalProblems})</span>
          </div>
          <button 
            disabled={currentProblemIdx === totalProblems - 1}
            onClick={() => { setCurrentProblemIdx(prev => prev + 1); setGradingResult(null); }}
            style={{ padding: '0.8rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            다음 문제 <ChevronRight size={18} style={{ verticalAlign: 'middle' }}/>
          </button>
        </div>
      </div>
    </div>
  );
}
