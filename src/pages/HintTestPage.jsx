/* HintTestPage.jsx - 개발용 테스트 페이지
   /hint-test 경로로 접근
*/
import React, { useState } from 'react';
import HintPlayerRouter from '../components/hints/HintPlayerRouter';

const UNITS = [
  { key: '부등식2단계',      label: '일차부등식 개념 2단계', count: 5 },
  { key: '삼각함수활용2단계', label: '삼각함수 활용 2단계',  count: 5 },
];

export default function HintTestPage() {
  const [unit, setUnit]     = useState(UNITS[0].key);
  const [num,  setNum]      = useState('001');

  const unitInfo = UNITS.find(u => u.key === unit);

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', color: 'white',
      padding: '2rem', fontFamily: 'Inter, Pretendard, sans-serif'
    }}>
      <h1 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>
        🧪 힌트 플레이어 테스트
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
        GPT-4o Vision으로 생성된 힌트 JSON 렌더링 테스트
      </p>

      {/* 컨트롤 */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>단원</label>
          <select
            value={unit}
            onChange={e => { setUnit(e.target.value); setNum('001'); }}
            style={{
              background: '#1e293b', border: '1px solid #334155', color: 'white',
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer'
            }}
          >
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>문제 번호</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: unitInfo.count }, (_, i) => {
              const n = String(i + 1).padStart(3, '0');
              return (
                <button
                  key={n}
                  onClick={() => setNum(n)}
                  style={{
                    background: num === n ? '#8b5cf6' : '#1e293b',
                    border: `1px solid ${num === n ? `#8b5cf6' : '#334155'}',
                    color: 'white', padding: '0.4rem 0.8rem', borderRadius: 8,
                    cursor: 'pointer', fontWeight: num === n ? 700 : 400, fontSize: '0.85rem'
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 문제 이미지 + 힌트 */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* 문제 이미지 */}
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 6 }}>📄 문제</div>
          <img
            src={window.resolveAsset(`/math_crops/${dirMap[unit]}/${num}.webp`)}
            alt={`문제 ${num}`}
            style={{ maxWidth: 320, borderRadius: 8, border: '1px solid #334155' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* 힌트 플레이어 */}
        <div style={{ flex: '1 1 320px', minWidth: 300 }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 6 }}>💡 힌트 플레이어</div>
          <HintPlayerRouter unit={unit} problemId={num} />
        </div>
      </div>
    </div>
  );
}

// 이미지 경로 맵
const dirMap = {
  '부등식2단계':      '(2)수학(상)기말/(1)일차부등식 개념2단계(26) 1+1(쌍둥이)',
  '삼각함수활용2단계': '(5)수학1 중간/2단계/삼각함수활용2단계',
};
