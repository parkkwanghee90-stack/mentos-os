import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from '@/components/KaTeXWrapper';
import { toBaseId } from '@/lib/premiumLectureMap';
import { audioRelPath } from '@/lib/premiumAudioPath';
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
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  
  // --- [수학상, 수학1 완수 후 Gemini 3.1 자연스러운 음성 개편 예약용 스위치] ---
  const USE_GEMINI_AUDIO = true; // 완료 시 true로 변경하여 전면 적용 가능

  const synthRef = useRef(window.speechSynthesis);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 오디오/TTS 상태 정리를 위한 헬퍼
  const stopAllAudio = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const baseId = toBaseId(lectureId);

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
    return () => { stopAllAudio(); };
  }, [lectureId]);

  useEffect(() => {
    if (!lectureData || !isPlaying) return;
    setAudioUnavailable(false);
    const step = lectureData.steps[currentStep];
    if (step && step.narration) {
      stopAllAudio();

      if (USE_GEMINI_AUDIO) {
        // --- Gemini 3.1 Premium High-Fidelity Audio Playback ---
        const baseId = toBaseId(lectureData.id);
        const stepNum = step.step;
        const audioUrl = window.resolveAsset(audioRelPath(baseId, stepNum));
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          if (currentStep < (lectureData?.steps?.length || 0) - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        };
        
        audio.onerror = () => {
          console.warn('[PremiumTTS] audio missing', { baseId, step: stepNum });
          setIsPlaying(false);
          setAudioUnavailable(true);
        };
        
        audio.play().catch(err => {
          console.warn('Autoplay prevented or playback error:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentStep, isPlaying, lectureData]);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      } else {
        // Trigger effect to instantiate
        setIsPlaying(true);
        return;
      }
      setIsPlaying(true);
    }
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
            {audioUnavailable && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#d97706', textAlign: 'center' }}>
                🔊 이 단계의 음성을 준비 중입니다. 다음 단계로 진행하실 수 있어요.
              </div>
            )}
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

