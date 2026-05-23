import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from '@/components/KaTeXWrapper';
import { Play, Pause, ChevronRight, ChevronLeft, Volume2, X } from 'lucide-react';
import 'katex/dist/katex.min.css';
import SineRuleAnimation from '../SineRuleAnimation';
import CosineRuleAnimation from '../CosineRuleAnimation';
import TriangleAreaAnimation from '../TriangleAreaAnimation';
import ArithmeticSumAnimation from '../ArithmeticSumAnimation';
import GeometricSumAnimation from '../GeometricSumAnimation';
import CircularPermutationAnimation from './CircularPermutationAnimation';
import QuadraticGraphAnimation from './QuadraticGraphAnimation';
import StarsAndBarsAnimation from './StarsAndBarsAnimation';
import NormalDistributionGraph from './NormalDistributionGraph';
import ExponentialLogGraph from './ExponentialLogGraph';
import GeometryVisuals from './GeometryVisuals';
import MatrixAnimation from './MatrixAnimation';
import CalculusGraphAnimation from './CalculusGraphAnimation';
import IntegralAreaAnimation from './IntegralAreaAnimation';
import GeometricSeriesAnimation from './GeometricSeriesAnimation';

import TrigonometricGraph from './TrigonometricGraph';
import TrigSubstitutionVisual from './TrigSubstitutionVisual';

export default function PremiumLecturePlayer({ lectureId, onClose }) {
  const [lectureData, setLectureData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        let baseId = lectureId;
        
        // Full Mapping Logic - Order matters!
        // --- 수열(Sequences) Mapping ---
        if (baseId.includes('여러가지수열') || baseId.includes('여러 가지 수열') || baseId.includes('여러 가지수열')) baseId = '여러가지수열';
        else if (baseId.includes('점화식')) baseId = '점화식';
        else if (baseId.includes('수학적귀납법') || baseId.includes('귀납법')) baseId = '수학적귀납법';
        else if (baseId.includes('등차')) baseId = '등차수열';
        else if (baseId.includes('등비')) baseId = '등비수열';
        else if (baseId.includes('수열의합') || baseId.includes('수열의 합') || baseId.includes('시그마')) baseId = '수열의합';
        
        // --- 미적분 (Advanced Calculus - Grade 12) Mapping ---
        // --- 미적분 (Advanced Calculus - Grade 12) Mapping ---
        if (baseId.includes('미적분') || baseId.includes('초월함수') || baseId.includes('여러가지 적분') || baseId.includes('여러 가지 적분')) {
          if (baseId.includes('수열의극한') || baseId.includes('수열의 극한')) baseId = '미적분_수열의극한';
          else if (baseId.includes('급수')) baseId = '미적분_급수';
          else if (baseId.includes('지수로그함수의극한') || baseId.includes('지수로그함수의 극한') || baseId.includes('여러가지함수미분')) baseId = '미적분_지수로그극한';
          else if (baseId.includes('삼각함수의극한') || baseId.includes('삼각함수의 극한')) baseId = '미적분_삼각함수극한';
          else if (baseId.includes('삼각함수') && (baseId.includes('공식') || baseId.includes('합성'))) baseId = '미적분_삼각함수공식';
          else if (baseId.includes('여러가지미분법') || baseId.includes('미분법')) baseId = '미적분_미분법';
          else if (baseId.includes('도함수활용') || baseId.includes('도함수의활용') || baseId.includes('도함수의 활용')) baseId = '미적분_도함수활용';
          else if (baseId.includes('적분법') || baseId.includes('치환적분') || baseId.includes('부분적분')) baseId = '미적분_적분법';
          else if (baseId.includes('정적분활용') || baseId.includes('정적분의활용') || baseId.includes('정적분의 활용')) baseId = '미적분_정적분활용';
          else if (baseId.includes('정적분')) baseId = '미적분_정적분';
        }
        // --- Special check for "여러 가지 적분법" or "초월함수의 정적분"
        else if (baseId.includes('여러') && baseId.includes('적분법')) baseId = '미적분_적분법';
        else if (baseId.includes('초월함수') && baseId.includes('정적분')) baseId = '미적분_정적분';
        else if (baseId.includes('삼각함수') && baseId.includes('공식')) baseId = '미적분_삼각함수공식';

        // --- 수열(Sequences - Math I) Mapping ---
        else if (baseId.includes('여러가지수열') || baseId.includes('여러 가지 수열') || baseId.includes('여러 가지수열')) baseId = '여러가지수열';
        else if (baseId.includes('점화식')) baseId = '점화식';
        else if (baseId.includes('수학적귀납법') || baseId.includes('귀납법')) baseId = '수학적귀납법';
        else if (baseId.includes('등차')) baseId = '등차수열';
        else if (baseId.includes('등비')) baseId = '등비수열';
        else if (baseId.includes('수열의합') || baseId.includes('수열의 합') || baseId.includes('시그마')) baseId = '수열의합';

        // --- 수학2 (Calculus Basics - Math II) Mapping ---
        else if (baseId.includes('함수의극한') || baseId.includes('함수의 극한') || baseId.includes('함수의극')) baseId = '함수의극한';
        else if (baseId.includes('함수의연속') || baseId.includes('함수의 연속')) baseId = '함수의연속';
        
        // [중요] 도함수의 활용 (특수 단원 먼저 체크)
        else if (baseId.includes('도함수의활용1') || baseId.includes('미분의활용1') || baseId.includes('접선')) baseId = '도함수의활용1';
        else if (baseId.includes('도함수의활용2') || baseId.includes('미분의활용2') || baseId.includes('그래프') || baseId.includes('방정식')) baseId = '도함수의활용2';
        else if (baseId.includes('도함수의활용3') || baseId.includes('미분의활용3') || baseId.includes('속도') || baseId.includes('가속도')) baseId = '도함수의활용3';
        else if (baseId.includes('도함수의활용') || baseId.includes('도함수의 활용')) baseId = '도함수의활용1';
        else if (baseId.includes('미분계수') || baseId.includes('도함수')) baseId = '미분계수와도함수';
        else if (baseId.includes('정적분의활용') || baseId.includes('정적분의 활용') || baseId.includes('정적분활용')) baseId = '정적분의활용';
        else if (baseId.includes('부정적분')) baseId = '부정적분과정적분';
        else if (baseId.includes('정적분')) baseId = '부정적분과정적분';
        else if (baseId.includes('적분법')) baseId = '부정적분과정적분';
        else if (baseId.includes('정적분의활용') || baseId.includes('정적분의 활용')) baseId = '정적분의활용';

        // --- 기타 Mapping ---
        else if (baseId.includes('고차방정식')) baseId = '고차방정식';
        else if (baseId === '일이차부등식') baseId = '일이차부등식';
        else if (baseId.includes('지수함수')) baseId = '지수함수';
        else if (baseId.includes('지수')) baseId = '지수';
        else if (baseId.includes('로그함수')) baseId = '로그함수';
        else if (baseId.includes('로그')) baseId = '로그';
        else if (baseId.includes('일차부등식')) baseId = '일차부등식';
        else if (baseId.includes('이차부등식')) baseId = '이차부등식';
        else if (baseId.includes('원순열') || baseId.includes('중복순열') || baseId.includes('순열')) baseId = '확통_순열';
        else if (baseId.includes('중복조합') || baseId.includes('이항정리')) baseId = '확통_중복조합';
        else if (baseId.includes('확률의뜻') || baseId.includes('확률의 뜻')) baseId = '확통_확률정의';
        else if (baseId.includes('조건부확률') || baseId.includes('독립시행')) baseId = '확통_조건부확률';
        else if (baseId.includes('이산확률') || baseId.includes('이항분포')) baseId = '확통_이산확률';
        else if (baseId.includes('연속확률') || baseId.includes('정규분포')) baseId = '확통_연속확률';
        else if (baseId.includes('통계적추정') || baseId.includes('표본평균') || baseId.includes('모평균')) baseId = '확통_통계적추정';
        else if (baseId.includes('중복조합')) baseId = '확통_조합';
        else if (baseId.includes('순열')) baseId = '순열';
        else if (baseId.includes('조합')) baseId = '조합';
        else if (baseId.includes('경우의 수') || baseId.includes('경우의수')) baseId = '경우의수';
        else if (baseId.includes('행렬')) baseId = '행렬';
        else if (baseId.includes('점과좌표') || baseId.includes('점과 좌표')) baseId = '점과좌표';
        else if (baseId.includes('직선의방정식') || baseId.includes('직선의 방정식')) baseId = '직선의방정식';
        else if (baseId.includes('원의방정식') || baseId.includes('원의 방정식')) baseId = '원의방정식';
        else if (baseId.includes('도형의이동') || baseId.includes('도형의 이동')) baseId = '도형의이동';
        else if (baseId.includes('삼각함수활용') || baseId.includes('삼각함수의 활용')) baseId = '삼각함수의 활용';
        else if (baseId.replace(/\s/g, '').includes('삼각함수그래프')) baseId = '삼각함수그래프';
        else if (baseId.includes('삼각함수')) baseId = '삼각함수성질';
        else if (baseId.includes('극한') && !baseId.includes('수열')) baseId = '함수의 극한';
        else if (baseId.includes('연속')) baseId = '함수의 연속';
        else if (baseId.includes('미분계수')) baseId = '미분계수';
        else if (baseId.includes('도함수') || baseId.includes('미분의활용')) baseId = '미분의 활용';
      
        const fetchUrl = window.resolveAsset(`/premium_lectures/${baseId}.json`);
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error('Lecture not found');
        const data = await res.json();
        setLectureData(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchLecture();
    return () => { if (synthRef.current) synthRef.current.cancel(); };
  }, [lectureId]);

  useEffect(() => {
    if (!lectureData || !isPlaying) return;
    const step = lectureData.steps[currentStep];
    if (step && step.narration) {
      if (synthRef.current.speaking) synthRef.current.cancel();
      const cleanText = step.narration.replace(/<\/?(blue|green|yellow|red)>/g, '');
      utteranceRef.current = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current.lang = 'ko-KR';
      utteranceRef.current.rate = 0.9;
      utteranceRef.current.onend = () => {
        if (currentStep < (lectureData?.steps?.length || 0) - 1) setCurrentStep(prev => prev + 1);
        else setIsPlaying(false);
      };
      synthRef.current.speak(utteranceRef.current);
    }
  }, [currentStep, isPlaying, lectureData]);

  const handlePlayPause = () => {
    if (isPlaying) { synthRef.current.pause(); setIsPlaying(false); }
    else { if (synthRef.current.paused) synthRef.current.resume(); setIsPlaying(true); }
  };

  const nextStep = () => { if (currentStep < (lectureData?.steps?.length || 0) - 1) setCurrentStep(prev => prev + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

  const renderNarration = (text) => {
    if (!text) return null;
    // Parse colors AND inline math
    const parts = text.split(/(<blue>.*?<\/blue>|<green>.*?<\/green>|<yellow>.*?<\/yellow>|<red>.*?<\/red>|\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('<blue>')) return <span key={i} style={{ color: '#2563eb', fontWeight: 'bold' }}>{part.replace(/<\/?blue>/g, '')}</span>;
      if (part.startsWith('<green>')) return <span key={i} style={{ color: '#059669', fontWeight: 'bold' }}>{part.replace(/<\/?green>/g, '')}</span>;
      if (part.startsWith('<yellow>')) return <span key={i} style={{ color: '#d97706', fontWeight: 'bold' }}>{part.replace(/<\/?yellow>/g, '')}</span>;
      if (part.startsWith('<red>')) return <span key={i} style={{ color: '#dc2626', fontWeight: 'bold' }}>{part.replace(/<\/?red>/g, '')}</span>;
      if (part.startsWith('$') && part.endsWith('$')) {
        return <span key={i} className="mx-1 inline-block transform translate-y-[2px]"><InlineMath math={part.slice(1, -1)} /></span>;
      }
      return <span key={i} style={{ color: '#000000' }}>{part}</span>;
    });
  };

  if (loading) return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#000000', zIndex: 99999 }}>강의 데이터를 불러오는 중...</div>;
  if (!lectureData) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#000000', zIndex: 99999 }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>강의 노트를 준비 중입니다.</p>
      <button onClick={onClose} style={{ padding: '0.75rem 2rem', background: '#2563eb', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>닫기</button>
    </div>
  );

  const stepData = lectureData.steps[currentStep];

  return (
    <div className="white-bg-katex" style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#ffffff', color: '#000000', zIndex: 99999, overflow: 'hidden', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '0.75rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', flexShrink: 0 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: '900', color: '#000000', margin: 0, whiteSpace: 'nowrap' }}>Premium AI Lecture</h2>
          <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', fontWeight: 'bold', color: '#2563eb', margin: '2px 0 0 0' }}>STEP {currentStep + 1} / {lectureData.steps.length}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1.5rem', flexShrink: 0 }}>
          <button 
            onClick={() => {
              alert("현재 시청 중인 프리미엄 강의에 최적화된 Ai Vision 분석을 시작합니다.");
            }}
            className="hover-scale"
            style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', border: 'none', padding: isMobile ? '0.4rem 0.8rem' : '0.6rem 1.5rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', cursor: 'pointer', fontWeight: '900', fontSize: isMobile ? '0.75rem' : '1rem', letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
          >
            ✨ AI Vision
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: isMobile ? '4px' : '8px' }}>
            <X size={isMobile ? 24 : 32} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '0.75rem' : '2rem', background: '#ffffff', overflowY: 'auto', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1100px' }}
          >
            <h3 style={{ fontSize: isMobile ? '1.2rem' : '2rem', fontWeight: '900', color: '#000000', marginBottom: isMobile ? '1rem' : '2rem', textAlign: 'center' }}>
              {renderNarration(stepData.visuals.title)}
            </h3>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '1rem' : '2rem' }}>
              {/* TOP PRIORITY: Visual Component / Drawing */}
              {stepData.visuals.component && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '0.5rem' : '2rem', minHeight: isMobile ? '200px' : '350px', overflow: 'hidden' }}>
                  {stepData.visuals.component === 'CircularPermutationAnimation' && <CircularPermutationAnimation />}
                  {stepData.visuals.component === 'QuadraticGraphAnimation' && <QuadraticGraphAnimation />}
                  {stepData.visuals.component === 'StarsAndBarsAnimation' && <StarsAndBarsAnimation />}
                  {stepData.visuals.component === 'GeometryVisuals' && <GeometryVisuals {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'MatrixAnimation' && <MatrixAnimation {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'NormalDistributionGraph' && <NormalDistributionGraph {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'ExponentialLogGraph' && <ExponentialLogGraph {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'SineRuleAnimation' && <SineRuleAnimation />}
                  {stepData.visuals.component === 'CosineRuleAnimation' && <CosineRuleAnimation />}
                  {stepData.visuals.component === 'TriangleAreaAnimation' && <TriangleAreaAnimation />}
                  {stepData.visuals.component === 'TrigonometricGraph' && <TrigonometricGraph {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'TrigSubstitutionVisual' && <TrigSubstitutionVisual {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'ArithmeticSumAnimation' && <ArithmeticSumAnimation />}
                  {stepData.visuals.component === 'GeometricSumAnimation' && <GeometricSumAnimation />}
                  {stepData.visuals.component === 'CalculusGraphAnimation' && <CalculusGraphAnimation {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'IntegralAreaAnimation' && <IntegralAreaAnimation {...stepData.visuals.props} />}
                  {stepData.visuals.component === 'GeometricSeriesAnimation' && <GeometricSeriesAnimation {...stepData.visuals.props} />}
                </div>
              )}

              {stepData.visuals.question && (
                <div style={{ width: '100%', maxWidth: '900px', marginBottom: isMobile ? '0.5rem' : '1rem' }}>
                  <div style={{ background: '#2563eb', color: '#ffffff', padding: isMobile ? '6px 16px' : '8px 24px', borderRadius: '12px 12px 0 0', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '900', letterSpacing: '0.1em' }}>QUESTION</div>
                  <div style={{ background: '#eff6ff', width: '100%', padding: isMobile ? '1rem' : '2rem', borderRadius: '0 0 12px 12px', border: '2px solid #2563eb', color: '#1e40af', overflowX: 'auto' }}>
                    <div style={{ fontSize: isMobile ? '0.95rem' : '1.25rem' }}>
                      <BlockMath math={stepData.visuals.question} />
                    </div>
                  </div>
                </div>
              )}

              {stepData.visuals.solution && (
                <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                   <div style={{ background: '#1e293b', color: '#ffffff', padding: isMobile ? '6px 16px' : '8px 24px', borderRadius: '12px 12px 0 0', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '900', letterSpacing: '0.1em' }}>SOLUTION STEPS</div>
                   <div style={{ background: '#ffffff', width: '100%', padding: isMobile ? '1rem' : '2rem', borderRadius: '0 0 2rem 2rem', border: '3px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
                      <div style={{ fontSize: isMobile ? '1rem' : '1.35rem', color: '#000000' }}>
                        <BlockMath math={stepData.visuals.solution} />
                      </div>
                   </div>
                </div>
              )}

              {stepData.visuals.math && !stepData.visuals.question && (
                <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                   <div style={{ background: '#2563eb', color: '#ffffff', padding: isMobile ? '6px 16px' : '8px 24px', borderRadius: '12px 12px 0 0', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '900', letterSpacing: '0.1em' }}>Premium Problem & Solution</div>
                   <div style={{ background: '#ffffff', width: '100%', padding: isMobile ? '1rem' : '2rem', borderRadius: '0 0 2rem 2rem', border: '3px solid #2563eb', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.1)', overflowX: 'auto', color: '#000000' }}>
                      <div style={{ fontSize: isMobile ? '0.95rem' : '1.25rem', color: '#000000', textAlign: 'left' }}>
                        <BlockMath math={stepData.visuals.math} />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls - Narration + Play/Pause */}
      <div style={{ padding: isMobile ? '0.75rem' : '2.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', background: '#f8fafc', padding: isMobile ? '0.75rem' : '2rem', borderRadius: isMobile ? '0.75rem' : '1.5rem', marginBottom: isMobile ? '0.75rem' : '2rem', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: isMobile ? '1rem' : '1.75rem', fontWeight: '700', lineHeight: '1.6', color: '#000000', textAlign: 'center', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', gap: isMobile ? '0.5rem' : '1rem', margin: 0 }}>
              <Volume2 style={{ color: '#2563eb', flexShrink: 0, marginTop: isMobile ? '4px' : 0 }} size={isMobile ? 20 : 32} />
              <span>{renderNarration(stepData.narration)}</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1.5rem' : '3rem' }}>
            <button onClick={prevStep} disabled={currentStep === 0} style={{ background: 'none', border: 'none', color: currentStep === 0 ? '#e2e8f0' : '#94a3b8', cursor: 'pointer', padding: isMobile ? '8px' : '0', touchAction: 'manipulation' }}><ChevronLeft size={isMobile ? 28 : 50} /></button>
            <button onClick={handlePlayPause} style={{ width: isMobile ? '3.5rem' : '6rem', height: isMobile ? '3.5rem' : '6rem', background: '#2563eb', color: '#ffffff', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              {isPlaying ? <Pause size={isMobile ? 24 : 40} fill="currentColor" /> : <Play size={isMobile ? 24 : 40} className="ml-1" fill="currentColor" />}
            </button>
            <button onClick={nextStep} disabled={currentStep === (lectureData?.steps?.length || 0) - 1} style={{ background: 'none', border: 'none', color: currentStep === (lectureData?.steps?.length || 0) - 1 ? '#e2e8f0' : '#94a3b8', cursor: 'pointer', padding: isMobile ? '8px' : '0', touchAction: 'manipulation' }}><ChevronRight size={isMobile ? 28 : 50} /></button>
          </div>
        </div>
      </div>

      <style>{`
        .katex { color: #000000 !important; }
      `}</style>
    </div>
  );
}

