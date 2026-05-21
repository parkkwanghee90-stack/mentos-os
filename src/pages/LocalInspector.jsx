import React, { useState, useEffect } from 'react';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';

const INSPECT_MENUS = [
  { id: 1, label: '1. 수원', unit: '수학1 기말 2023 1+1(쌍둥이)(54)', problemCount: 54 },
  { id: 2, label: '2. 수학 상', unit: '고등수학(상)기말 2023 1+1(쌍둥이)(34)', problemCount: 34 },
  { id: 3, label: '3. 수2', unit: '(7)수학2', problemCount: 30 },
  { id: 4, label: '4. 미적분', unit: 'CSAT_2024수능_미적분', problemCount: 30 },
  { id: 5, label: '5. 확통', unit: '확통수능', problemCount: 30 },
  { id: 6, label: '6. 고2 삼각함수의 활용 2단계', unit: '삼각함수활용2단계', problemCount: 30 },
  { id: 7, label: '7. 고1 원의 방정식 2단계', unit: '원의방정식2단계', problemCount: 30 },
  { id: 8, label: '8. 2025 6월 미적분', unit: 'CSAT_2025_6월_미적분', problemCount: 30 },
  { id: 9, label: '9. 2025 6월 확통', unit: 'CSAT_2025_6월_확통', problemCount: 30 },
  { id: 10, label: '10. 2024 6월 모의고사', unit: 'CSAT_2024_6월_미적분', problemCount: 30 },
  { id: 11, label: '11. 2023 6월 모의고사', unit: 'CSAT_2023_6월_미적분', problemCount: 30 },
];

export default function LocalInspector() {
  const [activeMenuId, setActiveMenuId] = useState(1);
  const [activeProblem, setActiveProblem] = useState('001');

  const activeMenu = INSPECT_MENUS.find(m => m.id === activeMenuId);

  const handlePrev = () => {
    const num = parseInt(activeProblem, 10);
    if (num > 1) {
      setActiveProblem(String(num - 1).padStart(3, '0'));
    }
  };

  const handleNext = () => {
    const num = parseInt(activeProblem, 10);
    if (num < activeMenu.problemCount) {
      setActiveProblem(String(num + 1).padStart(3, '0'));
    }
  };

  // fallback 여부 체크용 (json 직접 fetch)
  const [fallbackStatus, setFallbackStatus] = useState('loading');
  useEffect(() => {
    setFallbackStatus('loading');
    const fetchUnitEncoded = activeMenu.unit.split('/').map(part => encodeURIComponent(part)).join('/').replace(/%2B/g, '+');
    fetch(window.resolveAsset(`/math_hints/${fetchUnitEncoded}/${activeProblem}.json`))
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        // Geometry or PCBSA fallback check roughly
        const isGeometryType = data.type === 'geometry';
        const hasBaseFigureObjects = data.base_figure && data.base_figure.objects && data.base_figure.objects.length > 0;
        const isV3 = !!(data.overlay_steps || hasBaseFigureObjects);
        const hasRealGeo = isV3 || (data.steps && data.steps.some(s => s.shapes && s.shapes.length > 0));
        
        if (isGeometryType && !hasRealGeo) {
          setFallbackStatus('⚠️ Fallback (Algebra Rendered)');
        } else {
          setFallbackStatus('✅ Normal Rendering');
        }
      })
      .catch(e => {
        setFallbackStatus('❌ No Data or Error');
      });
  }, [activeMenu.unit, activeProblem]);

  // 이미지 경로 매핑 로직
  const getImagePath = (unitStr, problemStr) => {
    // 모의고사/수능 형태 매핑
    if (unitStr.startsWith('CSAT_')) {
      const parts = unitStr.split('_'); // e.g. CSAT_2025_6월_미적분
      if (parts.length === 4) {
        const [_, year, month, subj] = parts;
        return window.resolveAsset(`/math_crops/고3수능및모의고사/월별모의고사/${month}/${subj}_${year}_${month}/${problemStr}.webp`)
      } else if (parts.length === 3) {
        // e.g. CSAT_2024수능_미적분
        const [_, yearExam, subj] = parts;
        return window.resolveAsset(`/math_crops/고3수능및모의고사/${subj}/${yearExam}/${problemStr}.webp`)
      }
    }
    
    // 일반 단원 매핑 (대략적 경로)
    const map = {
      '수학1 기말 2023 1+1(쌍둥이)(54)': '(5)수학1 중간/2단계/수학1 기말 2023 1+1(쌍둥이)(54)',
      '고등수학(상)기말 2023 1+1(쌍둥이)(34)': '(2)수학(상)기말/고등수학(상)기말 2023 1+1(쌍둥이)(34)',
      '(7)수학2': '(7)수학2',
      '확통수능': '확통수능',
      '삼각함수활용2단계': '(5)수학1 중간/2단계/삼각함수활용2단계',
      '원의방정식2단계': '(2)수학(상)기말/(5)원의방정식 개념2단계(54)p24 1+1(쌍둥이)'
    };
    
    const baseDir = map[unitStr] || unitStr;
    return window.resolveAsset(`/math_crops/${baseDir}/${problemStr}.webp`)
  };

  const imgPath = getImagePath(activeMenu.unit, activeProblem);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar: 검수 메뉴 목록 */}
      <div style={{ width: '280px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #334155', fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8' }}>
          🛠️ 로컬 검수 모드
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {INSPECT_MENUS.map(menu => (
            <div 
              key={menu.id}
              onClick={() => { setActiveMenuId(menu.id); setActiveProblem('001'); }}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                background: activeMenuId === menu.id ? '#1e293b' : 'transparent',
                borderLeft: activeMenuId === menu.id ? '4px solid #38bdf8' : '4px solid transparent',
                borderBottom: '1px solid #1e293b'
              }}
            >
              {menu.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top bar: 문제 목록 (가로 스크롤) */}
        <div style={{ padding: '1rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {activeMenu.label} / 문제 목록
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {Array.from({ length: activeMenu.problemCount }).map((_, i) => {
              const numStr = String(i + 1).padStart(3, '0');
              return (
                <button
                  key={numStr}
                  onClick={() => setActiveProblem(numStr)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: activeProblem === numStr ? '#38bdf8' : '#0f172a',
                    color: activeProblem === numStr ? '#0f172a' : '#94a3b8',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: activeProblem === numStr ? 'bold' : 'normal',
                    flexShrink: 0
                  }}
                >
                  {numStr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewport: 문제 화면 + 힌트 플레이어 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* 문제 이미지 화면 */}
          <div style={{ flex: '1 1 50%', background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>문제 화면 ({activeProblem})</span>
              <span style={{ fontSize: '0.9rem', color: fallbackStatus.includes('✅') ? '#4ade80' : fallbackStatus.includes('⚠️') ? '#facc15' : '#f87171' }}>
                Status: {fallbackStatus}
              </span>
            </div>
            {/* 문제 이미지 화면 */}
            <div style={{ background: '#fff', borderRadius: '4px', padding: '1rem', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000' }}>
              <img 
                src={imgPath} 
                alt={`${activeMenu.label} - ${activeProblem}`} 
                style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerText = `[이미지 로드 실패]\n경로: ${imgPath}\n(Math Canvas가 fallback을 렌더링 중일 수 있습니다)`;
                }}
              />
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button 
                onClick={handlePrev}
                style={{ padding: '0.8rem 1.5rem', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
              >
                ◀ 이전 문제
              </button>
              <button 
                onClick={handleNext}
                style={{ padding: '0.8rem 1.5rem', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
              >
                다음 문제 ▶
              </button>
            </div>
          </div>

          {/* Hint Player (P/C/B, 애니메이션 힌트) */}
          <div style={{ flex: '1 1 50%', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
            <HintPlayerRouter 
              unit={activeMenu.unit} 
              problemId={activeProblem} 
              showQA={false} 
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}
