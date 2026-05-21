import React, { useState, useEffect } from 'react';
import { Send, Activity, BrainCircuit } from 'lucide-react';
import { PcbsEngine } from '@/engine/pcbs/PcbsEngine';
import { LlmPromptProvider } from '@/engine/pcbs/LlmPromptProvider';

const provider = new LlmPromptProvider();

export default function PcbsChatWidget({ unit, problemData, onComplete }) {
  const [engine, setEngine] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    async function startEngine() {
      // unit이 들어오면 해당 unit의 context로 엔진 생성
      const context = { unit: unit || 'sine_rule', ...problemData };
      const newEngine = new PcbsEngine(provider, context);
      setEngine(newEngine);

      const prompt = await newEngine.init();
      setCurrentPrompt(prompt);
      
      setMessages([{
        role: 'system',
        text: `✨ [PCBS 사고 전개 시작] 멘토스 AI와 함께 뼈대를 잡아보자!\n👉 단계: [ ${prompt.step} ]\n${prompt.question}`
      }]);
    }
    startEngine();
  }, [unit, problemData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !engine || isDone) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    const result = await engine.submitAnswer(userText);

    // AI의 짧은 피드백 추가
    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: result.feedback,
      isCorrect: result.isCorrect,
      isFallback: result.isFallback
    }]);

    if (result.nextPrompt.done) {
      setIsDone(true);
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: result.nextPrompt.question 
      }]);
      if (onComplete) onComplete();
      return;
    }

    // 통과했거나, 2번 틀려서 다음 단계로 강제 전진하는 경우 다음 질문 제시
    if (result.isCorrect || result.isFallback) {
       setTimeout(() => {
         setMessages(prev => [...prev, {
            role: 'system',
            text: `[다음 단계: ${result.nextPrompt.step}]\n${result.nextPrompt.question}`
         }]);
         setCurrentPrompt(result.nextPrompt);
       }, 800);
    }
  };

  const getStepColor = (step) => {
    switch(step) {
      case 'P': return '#3b82f6';
      case 'C': return '#10b981';
      case 'B': return '#8b5cf6';
      case 'S': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', height: '400px', overflow: 'hidden' }}>
      <div style={{ background: '#0f172a', padding: '1rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <BrainCircuit size={20} color="#3b82f6"/> 
          멘토스 PCBS 훈련소 (무료 LLM 호환)
        </div>
        {!isDone && engine && (
          <div style={{ display: 'flex', gap: '0.3rem' }}>
             {engine.steps.slice(0, 4).map(s => (
               <div key={s} style={{ 
                 width: '24px', height: '24px', borderRadius: '12px', 
                 background: engine.currentStep === s ? getStepColor(s) : (engine.currentIndex > engine.steps.indexOf(s) ? '#475569' : '#1e293b'),
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: '0.8rem', fontWeight: 'bold', border: engine.currentStep === s ? '2px solid #fff' : 'none'
               }}>
                 {s}
               </div>
             ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            background: m.role === 'user' ? '#3b82f6' : (m.role === 'system' ? '#ede9fe' : '#fff'),
            color: m.role === 'user' ? '#fff' : '#0f172a',
            border: m.role === 'ai' ? (m.isCorrect ? '1px solid #10b981' : (m.isFallback ? '1px dashed #f59e0b' : '1px solid #cbd5e1')) : 'none',
            boxShadow: m.role === 'user' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
            whiteSpace: 'pre-wrap'
          }}>
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
        <input 
           type="text"
           value={inputValue}
           onChange={e => setInputValue(e.target.value)}
           disabled={isDone}
           placeholder={isDone ? "훈련이 완료되었습니다." : "AI의 질문에 짧게 답변해보세요 (예: 빗변의 길이)"}
           style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <button type="submit" disabled={isDone || !inputValue.trim()} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0 1.2rem', borderRadius: '8px', cursor: isDone ? 'not-allowed' : 'pointer' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
