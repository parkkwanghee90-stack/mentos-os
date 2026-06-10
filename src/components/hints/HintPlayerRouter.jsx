/* HintPlayerRouter.jsx
   - type에 따라 Algebra/Geometry 선택
   - geometry여도 실제 도형 shapes가 없으면 algebra로 자동 렌더
   - 힌트 JSON은 public/math_hints/ 에 저장되어 있어 API 호출 불필요
   - 하단에 무료 AI 질문 채팅 인터페이스 포함
*/
import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Volume2, VolumeX, Play, Pause, RotateCcw, Mic, Headset } from 'lucide-react';
import AlgebraHintPlayer  from './AlgebraHintPlayer';
import GeometryHintPlayer from './GeometryHintPlayer';
import { URL_PREFIX } from '../../config/assets';

function hasRealGeometry(data = {}) {
  // [STRICT RULE] V3 및 최신 규격 타입을 모두 포함하여 감지 성능 강화
  const geoTypes = new Set([
    'polygon','line','circle','arc','rightangle',
    'drawCircle', 'drawSegment', 'drawPolygon', 'drawInscribedQuadrilateral',
    'triangle_angles', 'triangle', 'point', 'label_text', 'latex_label', 'markLength', 'markAngle'
  ]);
  
  // V3 체크: base_figure가 존재하더라도 objects가 비어있으면 기하 도구가 불필요함
  const hasBaseFigureObjects = data.base_figure && data.base_figure.objects && data.base_figure.objects.length > 0;
  if (hasBaseFigureObjects || data.overlay_steps) return true;

  // 레거시 및 스텝별 객체 체크
  const steps = data.steps || data.overlay_steps || [];
  return steps.some(s => 
    (s.shapes || []).some(sh => geoTypes.has(sh.type)) ||
    (s.math?.objects && s.math.objects.length > 0) ||
    (s.objects && s.objects.some(obj => geoTypes.has(obj.type)))
  );
}

// ─── 간단 AI 질문 채팅 (gpt-4o-mini) ──────────────────────────
function HintQA({ data, unit, problemId }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [open,      setOpen]      = useState(false);
  const bottomRef = useRef(null);

  const apiKey  = import.meta.env.VITE_OPENAI_API_KEY;
  const model   = 'gpt-4o-mini'; // 저비용 모델 사용

  const systemPrompt = `당신은 한국 고등학교 수학 선생님입니다.
학생이 ${data?.title || '수학 문제'}를 풀고 있습니다.
아래는 이 문제의 단계별 힌트입니다:
${JSON.stringify(data?.steps?.map(s => s.label + (s.lines ? ': ' + s.lines?.map(l=>l.content).join(', ') : (': ' + s.text))) , null, 2)}

학생의 질문에 친절하고 간결하게 답해주세요. 수식은 LaTeX로 \\( ... \\) 형식으로 작성하세요.`;

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    const speakText = (text) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 이전 음성 취소
        const cleanedText = text.replace(/\\(.*?\\)/g, '수식').replace(/[*_#]/g, ''); // 간단한 정제
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.1; // 선생님처럼 약간 빠른 템포
        window.speechSynthesis.speak(utterance);
      }
    };

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 400,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMsgs,
          ],
        }),
      });
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content || '답변을 불러오지 못했습니다.';
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      speakText(reply);
    } catch (e) {
      const errReply = '⚠️ 오류가 발생했습니다: ' + e.message;
      setMessages(m => [...m, { role: 'assistant', content: errReply }]);
      speakText('오류가 발생하여 답변할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          marginTop: '0.8rem', width: '100%', padding: '0.7rem',
          background: 'rgba(30,41,59,0.8)', border: '1px solid #334155',
          color: '#94a3b8', borderRadius: 10, cursor: 'pointer',
          fontSize: '0.88rem', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
        }}
      >
        🤖 AI 선생님께 질문하기
      </button>
    );
  }

  return (
    <div style={{
      marginTop: '0.8rem', background: '#0f172a', border: '1px solid #334155',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.7rem 1rem', background: '#1e293b',
      }}>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
          🤖 AI 질문 (gpt-4o-mini)
        </span>
        <button onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>

      {/* 메시지 목록 */}
      <div style={{ maxHeight: 220, overflowY: 'auto', padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            힌트에 대해 궁금한 점을 물어보세요!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%', padding: '0.5rem 0.8rem', borderRadius: 10,
            background: m.role === 'user' ? '#3b82f6' : '#1e293b',
            color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.55,
            border: m.role === 'assistant' ? '1px solid #334155' : 'none',
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ color: '#64748b', fontSize: '0.8rem', alignSelf: 'flex-start' }}>
            ⏳ 답변 중...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력 */}
      <div style={{ display: 'flex', gap: 6, padding: '0.6rem 0.8rem', borderTop: '1px solid #1e293b' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="질문을 입력하세요..."
          style={{
            flex: 1, background: '#1e293b', border: '1px solid #334155',
            color: 'white', borderRadius: 8, padding: '0.5rem 0.8rem',
            fontSize: '0.85rem', outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? '#334155' : '#3b82f6', border: 'none',
            color: 'white', padding: '0.5rem 0.9rem', borderRadius: 8,
            cursor: loading ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}

// ─── 음성 힌트 컨트롤 UI ────────────────────────
function AudioHintControl({ unit, problemId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (!unit || !problemId) return;

    let audioPath = null;
    const u = unit.toLowerCase();
    const qNum = parseInt(problemId, 10);
    const paddedId = String(problemId).padStart(3, '0');

    // 1. CSAT Mock Exam Killer Questions Mapping
    const isMockExam = u.includes('csat') || u.includes('모의고사1회');
    if (isMockExam) {
      const killerIds = [10, 11, 12, 13, 14, 15, 21, 22, 27, 28, 29, 30];
      if (killerIds.includes(qNum)) {
        let prefix = '20260504모의고사1회미적분';
        if (u.includes('확통')) {
          if (qNum <= 22) {
            prefix = '20260504모의고사1회미적분';
          } else {
            prefix = '20260504모의고사1회확통';
          }
        }
        audioPath = `/audio/suneung_tts/${prefix}_${paddedId}.mp3`;
      }
    }

    // 2. Legacy Geometry Mapping
    if (!audioPath) {
      let unitKey = null;
      const normalized = u.replace(/\s+/g, '');
      if (normalized.includes('삼각함수') && normalized.includes('활용') && normalized.includes('2단계')) {
        unitKey = 'trig';
      } else if (normalized.includes('원의방정식') && normalized.includes('2단계')) {
        unitKey = 'circle';
      } else if (normalized.includes('고차방정식') && normalized.includes('2단계')) {
        unitKey = 'gocha';
      } else if (normalized.includes('trig') && normalized.includes('2')) {
        unitKey = 'trig';
      } else if (normalized.includes('circle') && normalized.includes('2')) {
        unitKey = 'circle';
      }

      if (unitKey) {
        const isGocha = unitKey === 'gocha';
        const maxQ = isGocha ? 20 : 10;
        if (qNum >= 1 && qNum <= maxQ) {
          const padQ = String(qNum).padStart(2, '0');
          audioPath = `/audio/math_hints/hint_${unitKey}_2_${padQ}.mp3`;
        }
      }
    }

    if (audioPath) {
      console.log('[AudioHint] Instantiating Audio:', audioPath);
      const audio = new Audio(audioPath);
      audio.volume = volume;
      
      const handleCanPlay = () => {
        console.log('[AudioHint] Audio can play:', audioPath);
        setHasAudio(true);
        audioRef.current = audio;
        // Attempt immediate play
        audio.play().catch(e => {
          console.warn('[AudioHint] Autoplay prevented, requires user interaction:', e);
        });
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
      };

      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      audio.onerror = (e) => {
        console.error('[AudioHint] Audio failed to load:', audioPath, e);
        setHasAudio(false);
      };

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [unit, problemId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error('[AudioHint] Play error:', e));
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.error('[AudioHint] Play error:', e));
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!hasAudio) return null;

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1rem 1.5rem',
      background: 'rgba(30, 41, 59, 0.7)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      transition: 'all 0.3s ease'
    }}>
      {/* Upper Control Bar: Title & Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: isPlaying ? 'rgba(59, 130, 246, 0.2)' : 'rgba(71, 85, 105, 0.2)',
            border: isPlaying ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(71, 85, 105, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}>
            {isPlaying && (
              <span className="pulse-ring" style={{
                position: 'absolute', width: '100%', height: '100%',
                borderRadius: '50%', border: '2px solid rgba(59, 130, 246, 0.6)',
                animation: 'pulse 1.8s infinite ease-out'
              }} />
            )}
            <Headset size={18} color={isPlaying ? '#60a5fa' : '#94a3b8'} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              선생님 음성 해설
              {isPlaying && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px' }}>
                  <div className="bar" style={{ width: '2px', height: '6px', background: '#60a5fa', animation: 'bounce 0.8s infinite ease-in-out' }} />
                  <div className="bar" style={{ width: '2px', height: '12px', background: '#60a5fa', animation: 'bounce 0.8s infinite ease-in-out 0.2s' }} />
                  <div className="bar" style={{ width: '2px', height: '8px', background: '#60a5fa', animation: 'bounce 0.8s infinite ease-in-out 0.4s' }} />
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {isPlaying ? '설명을 듣는 중입니다' : '재생 버튼을 눌러 음성 해설을 들어보세요'}
            </span>
          </div>
        </div>

        {/* Media Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={restartAudio}
            title="처음부터 다시 듣기"
            style={{
              background: 'rgba(71, 85, 105, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#e2e8f0', width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <RotateCcw size={14} />
          </button>
          
          <button
            onClick={togglePlay}
            style={{
              background: '#3b82f6', border: 'none', color: 'white',
              width: '38px', height: '38px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)', transition: 'transform 0.2s, background 0.2s',
              transform: 'scale(1)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
          </button>
        </div>
      </div>

      {/* Progress Bar & Seek */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', minWidth: '32px' }}>
          {formatTime(currentTime)}
        </span>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none'
          }}
          className="seek-slider"
        />
        
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', minWidth: '32px', textAlign: 'right' }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Volume Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={toggleMute}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
        >
          {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{
            width: '70px',
            height: '3px',
            borderRadius: '1.5px',
            background: 'rgba(255, 255, 255, 0.15)',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.2); }
        }
        .seek-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(96, 165, 250, 0.8);
          transition: transform 0.1s;
        }
        .seek-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}

// ─── 메인 라우터 ───────────────────────────────────────────────
export default function HintPlayerRouter({ unit, problemId, data: propData, showQA = true, problemImage, geminiTts = false }) {
  const [data,    setData]    = useState(propData || null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (propData) { setData(propData); return; }
    if (!unit || !problemId) return;

    setLoading(true);
    setError(null);

    let fetchUnit = unit;
    let clean = fetchUnit.replace(/\s+/g, '');
    let stepStr = clean.match(/(2|3|4)단계/) ? clean.match(/(2|3|4)단계/)[0] : '2단계';

    // === 수능 기출 / 모의고사 (CSAT) 하이재킹 방지 ===
    if (unit.startsWith('CSAT_')) {
        fetchUnit = unit;
        if (unit === 'CSAT_2025_6월_미적분') {
            fetchUnit = '20260504모의고사1회미적분';
        } else if (unit === 'CSAT_2025_6월_확통') {
            const numPid = parseInt(problemId, 10);
            if (!isNaN(numPid) && numPid <= 22) {
                // Common questions 1-22 are in the 미적분 folder
                fetchUnit = '20260504모의고사1회미적분';
            } else {
                fetchUnit = '20260504모의고사1회확통';
            }
        } else if (unit.endsWith('_확통')) {
            const numPid = parseInt(problemId, 10);
            if (!isNaN(numPid) && numPid <= 22) {
                // 1~22번 공통 문항은 확통 폴더 대신 미적분 폴더에서 조회하도록 동적 리다이렉션
                fetchUnit = unit.replace('_확통', '_미적분');
            }
        }
    } else {
    // === 미적분 (고3 전용) 힌트 라우팅 예외 처리 ===
    const calcMapping = {
       '[2단계] 수열의극한': '1)극한2',
       '[4단계] 수열의극한': '1)극한4단계',
       '[2단계] 급수': '2)급수2',
       '[4단계] 급수': '2)급수4단계',
       '[2단계] 지수로그함수의극한': '3)지수로그함수의극한',
       '[2단계] 삼각함수합성과미분': '4)삼각함수합성과미분',
       '[4단계] 지수로그삼각함수 미분': '3)지수로그삼각함수의 미분법 4단계',
       '[2단계] 여러가지미분법2': '5)여러가지미분법2',
       '[4단계] 여러가지 미분법': '4)여러가지 미분법 4단계',
       '[2단계] 도함수의활용1': '6)도함수의활용1',
       '[2단계] 도함수의활용2': '7)도함수의활용2',
       '[4단계] 도함수의 활용': '5)도함수의 활용 4단계',
       '[2단계] 여러가지적분': '7)여러가지적분',
       '[4단계] 여러가지 함수의 적분': '6)여러가지 함수의 적분4단계',
       '[2단계] 정적분': '8)정적분',
       '[4단계] 정적분의 활용': '7)정적분의 활용 4단계'
    };

    const mappedUnit = calcMapping[unit] || unit;

    const calculusUnits = [
      '1)극한2', '2)급수2', '3)지수로그함수의극한', '4)삼각함수합성과미분', '5)여러가지미분법2', '6)도함수의활용1', '7)도함수의활용2', '7)여러가지적분', '8)정적분',
      '1)극한4단계', '2)급수4단계', '3)지수로그삼각함수의 미분법 4단계', '4)여러가지 미분법 4단계', '5)도함수의 활용 4단계', '6)여러가지 함수의 적분4단계', '7)정적분의 활용 4단계'
    ];
    
    const hwaktongUnits = [
      '1)순열', '2)중복조합', '3)이항정리', '4)확률의뜻', '5)덧셈정리_조건부확률_독립시행', '6)확률변수와이항분포', '7)연속확률분포와정규분포', '8)표본평균과모평균'
    ];

    if (clean.includes('통합숙제')) {
        fetchUnit = unit;
    }
    else if (calculusUnits.includes(mappedUnit)) {
       fetchUnit = mappedUnit; // 미적분은 원본 unit 그대로 사용 (하이재킹 방지)
    }

    else if (hwaktongUnits.includes(mappedUnit)) {
       fetchUnit = `확통수능/${mappedUnit}`;
    }
    // ── 수학 1 (대수) ──
    else if (clean.includes('삼각함수') && clean.includes('활용')) {
        if (stepStr === '4단계') fetchUnit = '삼각함수활용 4단계(68)';
        else fetchUnit = `삼각함수활용${stepStr}`;
    }
    else if (clean.includes('삼각함수') && clean.includes('그래프')) {
        fetchUnit = `삼각함수그래프${stepStr}`;
    }
    else if (clean.includes('귀납적')) {
        if (stepStr === '2단계') fetchUnit = '귀납적정의2단계';
        else fetchUnit = `수학적귀납법${stepStr}`;
    }
    else if (clean.includes('삼각함수') && (clean.includes('정의') || clean.includes('성질'))) {
        if (stepStr !== '2단계') fetchUnit = `삼각함수${stepStr}`; // 3단계, 4단계는 삼각함수3단계 등으로 통일되어 있음
        else fetchUnit = `삼각함수성질${stepStr}`;
    }
    else if (clean.includes('등차') || clean.includes('등비')) {
        if (stepStr === '4단계') fetchUnit = '등차등비수열4단계';
        else fetchUnit = `등차등비${stepStr}`;
    }
    else if (clean.includes('시그마')) {
        if (stepStr === '3단계') fetchUnit = '여러가지수열3단계';
        else if (stepStr === '4단계') fetchUnit = '수열의합4단계';
        else fetchUnit = `시그마용법${stepStr}`;
    }
    else if (clean.includes('지수로그함수의극한')) {
        fetchUnit = '3)지수로그함수의극한';
    }
    else if (clean.includes('지수함수') || clean.includes('로그함수')) {
        if (stepStr === '4단계') fetchUnit = '지수로그함수4단계';
        else if (clean.includes('지수')) fetchUnit = `지수함수${stepStr}`;
        else fetchUnit = `로그함수${stepStr}`;
    }
    else if (clean.includes('지수') || clean.includes('로그')) {
        if (stepStr === '4단계') fetchUnit = '지수로그4단계';
        else if (clean.includes('지수')) fetchUnit = `지수${stepStr}`;
        else fetchUnit = `로그${stepStr}`;
    }
    else if (clean.includes('다항식')) { fetchUnit = `다항식${stepStr}`; }
    else if (clean.includes('항등식과나머지정리') || clean.includes('항등식과 나머지정리')) { fetchUnit = `항등식과나머지정리${stepStr}`; }
    else if (clean.includes('인수분해')) { fetchUnit = `인수분해${stepStr}`; }
    else if (clean.includes('복소수')) { fetchUnit = `복소수${stepStr}`; }
    else if (clean.includes('이차방정식과이차함수') || clean.includes('이차방정식과 이차함수')) { fetchUnit = `이차방정식과이차함수${stepStr}`; }
    else if (clean.includes('이차방정식')) { fetchUnit = `이차방정식${stepStr}`; }
    else if (clean.includes('고차방정식')) { fetchUnit = `고차방정식${stepStr}`; }
    else if (clean.includes('일차부등식')) { fetchUnit = `일차부등식${stepStr}`; }
    else if (clean.includes('이차부등식')) { fetchUnit = `이차부등식${stepStr}`; }
    else if (clean.includes('경우의수')) { fetchUnit = `경우의수${stepStr}`; }
    else if (clean.includes('행렬')) { fetchUnit = `행렬${stepStr}`; }
    else if (clean.includes('점과좌표')) { fetchUnit = `점과좌표${stepStr}`; }
    else if (clean.includes('직선의방정식')) { fetchUnit = `직선의방정식${stepStr}`; }
    else if (clean.includes('원의방정식')) { fetchUnit = `원의방정식${stepStr}`; }
    else if (clean.includes('도형의이동')) { fetchUnit = `도형의이동${stepStr}`; }
    else if (clean.includes('함수의극한')) {
        if (stepStr === '2단계') fetchUnit = '(7)수학2/함수의 극한 2단계';
        else fetchUnit = `(7)수학2/함수의극한${stepStr}`;
    }
    else if (clean.includes('함수의연속') || clean.includes('함수의 연속')) {
        if (stepStr === '2단계') fetchUnit = '(7)수학2/함수의 연속 2단계';
        else fetchUnit = `(7)수학2/함수의연속${stepStr}`;
    }
    else if (clean.includes('미분계수')) {
        if (stepStr === '3단계' || stepStr === '4단계') fetchUnit = `(7)수학2/미분계수${stepStr}`;
        else fetchUnit = `(7)수학2/미분계수 ${stepStr}`;
    }
    else if (clean.includes('미분의활용') || clean.includes('도함수의활용') || clean.includes('도함수의 활용')) {
        if (stepStr === '2단계') fetchUnit = '(7)수학2/미분의활용 2단계';
        else if (stepStr === '3단계') fetchUnit = '(7)수학2/도함수의활용3단계';
        else if (stepStr === '4단계') fetchUnit = '(7)수학2/도함수의 활용 4단계';
        else fetchUnit = `(7)수학2/미분의활용 ${stepStr}`;
    }
    else if (clean.includes('부정적분과정적분') || clean.includes('부정적분과 정적분') || (clean.includes('부정적분') || (clean.includes('정적분') && !clean.includes('활용')))) {
        fetchUnit = `(7)수학2/부정적분과 정적분 ${stepStr}`;
    }
    else if (clean.includes('정적분의활용') || clean.includes('정적분의 활용')) {
        fetchUnit = `(7)수학2/정적분의 활용 ${stepStr}`;
    }
    else if (['1)순열', '2)중복조합', '3)이항정리', '4)확률의뜻', '5)덧셈정리_조건부확률_독립시행', '6)확률변수와이항분포', '7)연속확률분포와정규분포', '8)표본평균과모평균'].includes(unit) || ['1)순열', '2)중복조합', '3)이항정리', '4)확률의뜻', '5)덧셈정리_조건부확률_독립시행', '6)확률변수와이항분포', '7)연속확률분포와정규분포', '8)표본평균과모평균'].includes(clean)) {
        fetchUnit = `확통수능/${unit}`;
    }
    } // end of else (non-CSAT)

    const tolerantParse = (rawText) => {
      try { return JSON.parse(rawText); }
      catch (e) {
        let fixed = rawText
          .replace(/(?<!\\)\\(?=[tbfn])/g, '\\\\')
          .replace(/(?<!\\)\\(?!["\\\/bfnrtu\\])/g, '\\\\');
        try { return JSON.parse(fixed); }
        catch (e2) {
          console.error('[HintRouter] JSON 파싱 실패:', e2.message);
          throw new Error('힌트 준비 실패');
        }
      }
    };

    const cacheBuster = `?v=${new Date().getTime()}`;
    const numPid = parseInt(problemId, 10);
    const paddedId = !isNaN(numPid) && numPid < 100
      ? String(numPid).padStart(3, '0') : String(problemId);

    // [SSOT 연동] window.resolveAsset를 활용해 로컬/배포 영어 경로 완벽 번역 및 URL_PREFIX 동적 자동 적용
    // 통합숙제 힌트는 Supabase 미업로드 상태이므로 로컬 public/ 경로에서 직접 fetch
    // 통합숙제 힌트도 이제 Supabase(mentos-assets)에 업로드됨 → resolveAsset로 통일.
    // (이전엔 로컬 public/ 경로로 찾았으나 배포 빌드에서 math_hints가 제외되어 404 발생)
    const mkUrl = (uid, pid, v2 = false) =>
      window.resolveAsset(`/math_hints/${uid}/${pid}${v2 ? '_v2' : ''}.json`);

    console.log('[HintRouter] 페치 unit:', fetchUnit, '| padded:', paddedId);

    const tryFetch = (url) => fetch(`${url}${cacheBuster}`).then(r => {
      const ct = r.headers.get('content-type');
      if (!r.ok || (ct && ct.includes('text/html'))) throw new Error(`miss: ${url}`);
      return r.text().then(text => tolerantParse(text));
    });

    // padded_v2 → padded_v1 → raw_v2 → raw_v1 순서로 시도
    tryFetch(mkUrl(fetchUnit, paddedId, true))
      .catch(() => tryFetch(mkUrl(fetchUnit, paddedId)))
      .catch(() => tryFetch(mkUrl(fetchUnit, problemId, true)))
      .catch(() => tryFetch(mkUrl(fetchUnit, problemId)))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error('[HintRouter] Fetch Error:', e.message); setError(e.message); setLoading(false); });
  }, [unit, problemId, propData]);

  if (loading) return (
    <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>💭 힌트 불러오는 중...</div>
  );
  if (error) return (
    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '1rem', textAlign: 'center', marginTop: '1rem', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>📝 힌트 없음</h3>
      해당 문제의 애니메이션 힌트가 없습니다.<br/>
      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>({error})</span>
    </div>
  );
  if (!data) return null;

  // [강제 검증 코드 추가]
  const p = data.p || data.P || (data.pcbs_model && data.pcbs_model.find(x => x.stage === 'P')) || (data.steps && data.steps.find(x => x.phase === 'P' || x.stage === 'P'));
  const c = data.c || data.C || (data.pcbs_model && data.pcbs_model.find(x => x.stage === 'C')) || (data.steps && data.steps.find(x => x.phase === 'C' || x.stage === 'C'));
  const b = data.b || data.B || (data.pcbs_model && data.pcbs_model.find(x => x.stage === 'B')) || (data.steps && data.steps.find(x => x.phase === 'B' || x.stage === 'B'));
  const isGeometryV3 = data.type === 'geometry' || data.overlay_steps || (data.base_figure && data.base_figure.objects);

  const hasSteps = Array.isArray(data.steps) && data.steps.length > 0;
  if (!isGeometryV3 && !hasSteps && (!p || !c || !b)) {
    console.warn(`[HintRouter] Incomplete PCBS data for ${unit}/${problemId}:`, { P: !!p, C: !!c, B: !!b });
    console.log("[HintRouter] Attempting graceful render with available data:", JSON.stringify(data).substring(0, 300));
    // Don't crash — render whatever we have
  }

  // [SSOT PCBSA 구조 강제 검증 및 변환]
  const isPcbsModel = Array.isArray(data.pcbs_model) && data.pcbs_model.length > 0;
  const isStepsPhase = Array.isArray(data.steps) && data.steps.some(x => x.phase || x.stage);
  const valid_pcbsa = (["P","C","B","A"].every(k => data[k]) && (data.S || data.S1)) || isPcbsModel || isStepsPhase;
  
  const renderData = { ...data }; // React 18 Strict Mode 상태 변이 방지용 얕은 복사

  if (valid_pcbsa) {
    let newSteps = [];
    
    // 함수생성기 + 수식라우터 연동: 텍스트 내 $...$ 또는 $$...$$ 수식을 파싱하여 formula_lines 배열로 변환
    // SSOT 규격을 위한 파싱 패스쓰루 (GeometryHintPlayer의 RichText 엔진이 모두 렌더링함)
    const parseFormulaRouter = (label, contentText, objs) => {
       if (!contentText) return { label, caption: '', objects: objs || [] };
       return { 
         label, 
         caption: "", 
         formula_raw: typeof contentText === 'string' ? contentText : JSON.stringify(contentText),
         objects: objs || []
       };
    };

    if (isPcbsModel) {
      // 1. 신규 리스트형 PCBS 모델 처리 (2025 6월 모의고사 등)
      data.pcbs_model.forEach(item => {
        if (item.stage === 'S') {
           // S 단계 (Solve): 실제 애니메이션 스텝들을 삽입
           if (data.steps && Array.isArray(data.steps)) {
             data.steps.forEach((s, idx) => {
               newSteps.push({
                 label: s.label || `Solve Step ${idx+1}`,
                 caption: s.caption || s.text || s.content || '',
                 picture: s.picture,
                 focus_point: s.focus_point,
                 objects: s.objects || []
               });
             });
           } else {
             newSteps.push(parseFormulaRouter(`S (${item.description})`, item.math_content));
           }
        } else {
           // P, C, B, A 단계
           newSteps.push(parseFormulaRouter(`${item.stage} (${item.description})`, item.math_content));
        }
      });
    } else if (isStepsPhase) {
      // 1.5. math_pcbs_cache 포맷 처리
      data.steps.forEach(item => {
        const stage = item.phase || item.stage;
        const stageName = stage === 'SOLVE' ? 'S' : stage;
        const pic = (item.image && item.image.length > 0) ? item.image[0] : undefined;
        let parsed = {};
        if (stageName === 'S') {
           parsed = parseFormulaRouter(`S (${item.title || '단계별 풀이'})`, item.content, item.objects || []);
        } else {
           parsed = parseFormulaRouter(`${stageName} (${item.title || stageName})`, item.content, item.objects || []);
        }
        if (pic) parsed.picture = pic;
        newSteps.push(parsed);
      });
    } else {
      // 2. 기존 객체형 PCBS 모델 처리 (data.P, data.C 등)
      newSteps = [
        { step: 1, ...parseFormulaRouter('P(구하는 것)', data.P, data.P_objects) },
        { step: 2, ...parseFormulaRouter('C(주어진 단서)', data.C, data.C_objects) },
        { step: 3, ...parseFormulaRouter('B(배경지식)', data.B, data.B_objects) }
      ];

      let globalS = 1;
      if (data.S1) {
         let idx = 1;
         while(data[`S${idx}`]) {
            const sText = data[`S${idx}`];
            const masked = sText.replace(/(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/gs, (match) => {
               return match.replace(/\\\\/g, '@@DS@@').replace(/\n/g, '@@NL@@');
            });
            const parts = masked.split(/\\\\|\n/).filter(p => p.trim());
            const finalParts = parts.map(p => p.replace(/@@DS@@/g, '\\\\').replace(/@@NL@@/g, '\n').trim());
            finalParts.forEach((p, pIdx) => {
               newSteps.push({ 
                 step: 3 + globalS, 
                 ...parseFormulaRouter(`[칠판 판서] Step ${globalS}`, p.trim(), pIdx === parts.length - 1 ? data[`S${idx}_objects`] : []) 
               });
               globalS++;
            });
            idx++;
         }
      } else if (Array.isArray(data.S)) {
         data.S.forEach((sText, idx) => {
            const masked = sText.replace(/(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/gs, (match) => {
               return match.replace(/\\\\/g, '@@DS@@').replace(/\n/g, '@@NL@@');
            });
            const parts = masked.split(/\\\\|\n/).filter(p => p.trim());
            const finalParts = parts.map(p => p.replace(/@@DS@@/g, '\\\\').replace(/@@NL@@/g, '\n').trim());
            finalParts.forEach((p, pIdx) => {
               newSteps.push({ 
                 step: 3 + globalS, 
                 ...parseFormulaRouter(`[칠판 판서] Step ${globalS}`, p.trim(), pIdx === parts.length - 1 ? data[`S${idx+1}_objects`] : []) 
               });
               globalS++;
            });
         });
      } else if (data.S) {
         const masked = data.S.replace(/(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/gs, (match) => {
            return match.replace(/\\\\/g, '@@DS@@').replace(/\n/g, '@@NL@@');
         });
         const parts = masked.split(/\\\\|\n/).filter(p => p.trim());
         const finalParts = parts.map(p => p.replace(/@@DS@@/g, '\\\\').replace(/@@NL@@/g, '\n').trim());
         finalParts.forEach((p, pIdx) => {
            newSteps.push({ 
              step: 3 + globalS, 
              ...parseFormulaRouter(`[칠판 판서] Step ${globalS}`, p.trim(), pIdx === parts.length - 1 ? data.S_objects : []) 
            });
            globalS++;
         });
      }
      newSteps.push({ step: 3 + globalS, ...parseFormulaRouter(`A(최종 정답)`, data.A, data.A_objects) });
    }
    renderData.steps = newSteps;
  } else if (data.steps && Array.isArray(data.steps)) {
    // V2 또는 기타 AI 생성 포맷 처리 (title -> label, content -> formula_raw)
    renderData.steps = data.steps.map((st, i) => ({
      ...st,
      step: st.step || i + 1,
      label: st.label || st.title || `Step ${i + 1}`,
      formula_raw: st.formula_raw || st.content || '',
      objects: st.objects || []
    }));
  }
  // ===========================================

  // [STRICT RULE] Geometry 존재 여부 및 렌더러 선택 로직 (중간 fallback 절대 금지)
  const isGeometryType = renderData.type === 'geometry';
  const hasBaseFigureObjects = renderData.base_figure && renderData.base_figure.objects && renderData.base_figure.objects.length > 0;
  const isV3 = !!(renderData.overlay_steps || hasBaseFigureObjects);
  const geoDetected = isV3 || hasRealGeometry(renderData) || valid_pcbsa;
  
  // 해설 이미지(a.webp)의 유무를 안전하게 체크 (a.webp 이미지가 없으면 AlgebraHintPlayer가 작동하지 않음)
  const stepsToCheck = renderData.overlay_steps || renderData.steps || renderData.hints || [];
  const hasSolutionImage = stepsToCheck.some(s => s && s.picture && typeof s.picture === 'string' && s.picture.endsWith('a.webp'));

  // [강제 규칙] geometry 타입이거나 기하 요소가 감지되거나, 또는 실제 해설 이미지(a.webp)가 존재하지 않는 순수 텍스트 힌트인 경우 무조건 GeometryHintPlayer 사용
  const useGeometry = isGeometryType || geoDetected || !hasSolutionImage;
  const Player = useGeometry ? GeometryHintPlayer : AlgebraHintPlayer;

  // [검증 로그]
  console.log("=== EXAM DIAGNOSTIC LOG ===", {
    exam_id: unit,
    problem_id: problemId,
    data_source_file: window.resolveAsset(`/math_hints/${unit}/${problemId}.json`),
    "problem.p": data.P || data.p || (data.pcbs_model && data.pcbs_model.find(x => x.stage === 'P')?.content),
    "problem.c": data.C || data.c || (data.pcbs_model && data.pcbs_model.find(x => x.stage === 'C')?.content),
    "problem.b": data.B || data.b || (data.pcbs_model && data.pcbs_model.find(x => x.stage === 'B')?.content),
    image_path: renderData.picture || 'MentosMockExam picture_path used',
    hint_path: window.resolveAsset(`/math_hints/${unit}/${problemId}.json`),
    animation_path: renderData.base_figure ? "Yes" : "No",
    fallback_used: !useGeometry
  });

  // V3 및 잘못 생성된 PCBS 키포맷(goal, conditions, calculations) 파싱 호환 처리
  const rawSteps = renderData.overlay_steps || renderData.steps || renderData.hints || [];

  const processStep = (s) => {
    // [팬스캔 모드] picture + focus_point가 있는 이미지 스크롤 힌트는 그대로 패스쓰루
    if (s.picture && s.focus_point) return s;

    // [V5 호환] 최신 SSOT 파이프라인에서 생성한 데이터 패스쓰루
    if (s.formula_raw) return s;

    if (s.lines && Array.isArray(s.lines) && s.lines.length > 0) return { ...s, label: s.label || '힌트' };
    if (s.formula_lines && Array.isArray(s.formula_lines)) return { label: s.label || '단계 설명', formula_lines: s.formula_lines, caption: s.caption, objects: s.objects };

    const parts = [];
    let stepLabel = s.label || s.title || s.label_text || `STEP ${s.step || ''}`.trim() || '단계 설명';

    if (s.text) parts.push({ type: 'text', content: s.text });
    if (s.caption) parts.push({ type: 'text', content: s.caption });
    if (s.goal) parts.push({ type: 'text', content: `**목표:** ${s.goal}` });
    if (s.conditions) parts.push({ type: `text`, content: `**조건:** ${s.conditions}` });
    if (s.concept) parts.push({ type: `text`, content: `**개념:** ${s.concept}` });
      
    if (s.calculations && Array.isArray(s.calculations)) {
      s.calculations.forEach(c => parts.push({ type: 'text', content: String(c) }));
    } else if (s.calculations) {
      parts.push({ type: 'text', content: String(s.calculations) });
    }

    if (parts.length > 0) return { label: stepLabel, lines: parts, latex: s.latex || s.tex, objects: s.objects };
    if (s.latex || s.tex) return { label: s.label || s.label_text || '단계 설명', lines: [], latex: s.latex || s.tex, objects: s.objects };
    if (s.objects && Array.isArray(s.objects)) return { label: s.label || s.label_text || '도형 변화', lines: [], objects: s.objects };
      
    return { label: s.label || s.label_text || '스텝', lines: [{ type: 'text', content: typeof s === 'string' ? s : (s.text || s.content || JSON.stringify(s)) }], objects: s.objects };
  };

  const processedSteps = rawSteps.map(processStep);

  const normalizedData = {
    ...renderData,
    problem_image: valid_pcbsa ? null : (renderData.problem_image || problemImage),
    type: (!useGeometry && renderData.type === 'geometry') ? 'algebra' : renderData.type,
    steps: processedSteps,
    overlay_steps: processedSteps // GeometryHintPlayer 호환용
  };

  const content = (
    <div style={{ position: 'relative', width: '100%', height: isFullscreen ? '100%' : 'auto', overflowY: isFullscreen ? 'auto' : 'visible', background: isFullscreen ? '#0f172a' : 'transparent', borderRadius: isFullscreen ? '12px' : '0' }}>
      <button 
        onClick={() => setIsFullscreen(!isFullscreen)}
        style={{
          position: 'absolute', top: '10px', right: '10px', zIndex: 50,
          background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px',
          color: 'white', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title={isFullscreen ? "축소하기" : "돋보기 (확대하기)"}
      >
        {isFullscreen ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
      </button>
      
      {/* 음성 힌트 컨트롤 UI 추가 */}
      <AudioHintControl unit={unit} problemId={problemId} />

      <Player data={normalizedData} problemId={problemId} ttsUnit={unit} ttsProblemId={problemId} geminiTts={geminiTts} />
      {showQA && <HintQA data={data} unit={unit} problemId={problemId} />}
    </div>
  );

  return isFullscreen ? (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.95)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '800px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {content}
      </div>
    </div>
  ) : (
    content
  );
}
