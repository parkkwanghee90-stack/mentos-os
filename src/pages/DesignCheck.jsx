import React, { useState } from 'react';

/**
 * 디자인 검증 페이지 — lecture.png(레퍼런스)와 실제 구현(/class/math/h_math3)을
 * 브라우저에서 나란히/오버레이로 비교한다. 스크린샷 도구 없이 육안 검증용.
 *   라우트: /design-check
 */
export default function DesignCheck() {
  const VIEWS = {
    classroom: { ref: '/lecture.png', route: '/class/math/h_math3', label: '교실 (lecture.png)' },
    login: { ref: '/login.png', route: '/login', label: '로그인 (login.png)' },
  };
  const [view, setView] = useState('classroom');   // 'classroom' | 'login'
  const [mode, setMode] = useState('side');        // 'side' | 'overlay'
  const [opacity, setOpacity] = useState(0.5);     // overlay 모드에서 레퍼런스 투명도
  const [iframeKey, setIframeKey] = useState(0);    // 새로고침용

  const REF = VIEWS[view].ref;
  const target = VIEWS[view].route;
  const CANVAS_W = 1536;   // 레퍼런스 원본 폭(px)
  const CANVAS_H = 1024;

  const tabBtn = (active) => ({
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: '1px solid ' + (active ? '#7c3aed' : '#d4d9e3'),
    background: active ? '#7c3aed' : '#ffffff',
    color: active ? '#fff' : '#334155',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f1729', color: '#e9eefc', fontFamily: 'Pretendard, sans-serif' }}>
      {/* 툴바 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        padding: '0.85rem 1.25rem', background: '#141d33', borderBottom: '1px solid rgba(148,163,184,0.2)',
      }}>
        <strong style={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}>🎯 디자인 검증</strong>
        <span style={{ fontSize: '0.8rem', color: '#98a7c6' }}>lecture.png ↔ 실제 구현</span>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
          <button style={tabBtn(mode === 'side')} onClick={() => setMode('side')}>나란히</button>
          <button style={tabBtn(mode === 'overlay')} onClick={() => setMode('overlay')}>오버레이</button>
        </div>

        {mode === 'overlay' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
            레퍼런스 투명도
            <input
              type="range" min="0" max="1" step="0.02"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              style={{ width: 160, accentColor: '#7c3aed' }}
            />
            <span style={{ fontFamily: 'monospace', minWidth: 38 }}>{Math.round(opacity * 100)}%</span>
          </label>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <select
            value={view}
            onChange={(e) => { setView(e.target.value); setIframeKey(k => k + 1); }}
            style={{ padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #d4d9e3', background: '#ffffff', color: '#1a1a1a', fontWeight: 600, fontSize: '0.8rem' }}
          >
            {Object.entries(VIEWS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={() => setIframeKey(k => k + 1)} style={tabBtn(false)}>새로고침</button>
          <a href={target} target="_blank" rel="noreferrer" style={{ ...tabBtn(false), textDecoration: 'none', display: 'inline-block' }}>새 탭 ↗</a>
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0.5rem 1.25rem' }}>
        ※ 레퍼런스는 1536×1024 데스크톱 캡처입니다. 정확한 비교를 위해 브라우저 창을 넓게 사용하세요.
        오버레이 모드에서 슬라이더로 레퍼런스를 겹쳐 차이를 확인할 수 있습니다.
      </div>

      {/* 비교 영역 */}
      {mode === 'side' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 1.25rem 2rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem' }}>레퍼런스 (lecture.png)</div>
            <div style={{ border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
              <img src={REF} alt="lecture.png 레퍼런스" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '0.5rem' }}>실제 구현 ({target})</div>
            <div style={{ border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12, overflow: 'hidden', background: '#fff', position: 'relative', paddingTop: `${(CANVAS_H / CANVAS_W) * 100}%` }}>
              <iframe
                key={iframeKey}
                title="live"
                src={target}
                style={{ position: 'absolute', top: 0, left: 0, width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, border: 'none', transform: 'scale(var(--scale))', transformOrigin: 'top left' }}
                ref={(el) => {
                  if (el) {
                    const parent = el.parentElement;
                    const scale = parent.clientWidth / CANVAS_W;
                    el.style.setProperty('--scale', String(scale));
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem 1.25rem 2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: CANVAS_W, aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            {/* 실제 구현 (아래) */}
            <iframe
              key={iframeKey}
              title="live-overlay"
              src={target}
              style={{ position: 'absolute', top: 0, left: 0, width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, border: 'none', transform: 'scale(var(--oscale))', transformOrigin: 'top left' }}
              ref={(el) => {
                if (el) {
                  const scale = el.parentElement.clientWidth / CANVAS_W;
                  el.style.setProperty('--oscale', String(scale));
                }
              }}
            />
            {/* 레퍼런스 (위, 투명도 조절) */}
            <img
              src={REF}
              alt="lecture.png overlay"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity, pointerEvents: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
