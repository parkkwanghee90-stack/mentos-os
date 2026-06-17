/* 대문 "라이브 예상문제" 자동 캐러셀 — 학교/예상문제가 4.5초마다 KaTeX로 바뀌고 AVS가 떴다 사라진다. */
import { useState, useEffect, useRef, useMemo } from 'react';
import { MathText } from '@/components/MathProblemRenderer';
import { HERO_EXAM_SHOWCASE } from '@/data/heroExamShowcase';

const CIRC = ['①', '②', '③', '④', '⑤'];
const INTERVAL = 4500; // 4~5초

export default function LandingExamCarousel({ data = HERO_EXAM_SHOWCASE, tag = '' }) {
  // 전 학교를 매번 다른 순서로(셔플) → "전국 학교가 실시간으로 도는" 느낌
  const items = useMemo(() => [...(data || [])].sort(() => Math.random() - 0.5), [data]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timer.current = setInterval(() => setIdx((p) => (p + 1) % items.length), INTERVAL);
    return () => clearInterval(timer.current);
  }, [paused, items.length]);

  if (!items.length) return null;
  const it = items[idx];

  return (
    <div className="lec" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="lec-head">
        <span className="lec-live"><span className="lec-dot" /> LIVE 예상문제{tag ? ` · ${tag}` : ''}</span>
        <span className="lec-count">{items.length}개교 · {idx + 1}</span>
      </div>

      {/* key=idx → 항목 바뀔 때마다 페이드/슬라이드 인 */}
      <div className="lec-stage" key={idx}>
        <div className="lec-school">
          <b>{it.school}</b>
          <span>{it.region ? it.region + ' · ' : ''}{it.unit} · {it.level}</span>
        </div>

        <div className="lec-q"><MathText text={it.latex} /></div>

        {Array.isArray(it.choices) && (
          <div className="lec-choices">
            {it.choices.map((c, i) => (
              <span key={i} className="lec-choice">{CIRC[i]} <MathText text={c} /></span>
            ))}
          </div>
        )}

        {/* 미니 녹색 칠판 AVS — 핵심 + 정답이 떠올랐다 다음 항목에서 사라짐 */}
        <div className="lec-board">
          <div className="lec-board-row">
            <span className="lec-chip lec-chip-b">핵심</span>
            <div className="lec-board-txt"><MathText text={it.key} /></div>
          </div>
          <div className="lec-board-row">
            <span className="lec-chip lec-chip-a">정답</span>
            <div className="lec-board-txt lec-ans"><MathText text={it.solve} /></div>
          </div>
        </div>
      </div>

      {/* 단일 진행 게이지 — 매 항목 4.5초 채워짐 (학교가 81개라 점이 아닌 게이지) */}
      <div className="lec-prog"><span className="lec-prog-fill" key={idx} /></div>

      <style>{LEC_CSS}</style>
    </div>
  );
}

const LEC_CSS = `
.lec{position:relative;background:linear-gradient(160deg,#0e1530,#0b1020);border:1px solid rgba(255,255,255,.09);
  border-radius:20px;padding:18px 18px 14px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6);overflow:hidden;min-height:340px;}
.lec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.lec-live{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:900;color:#fca5a5;letter-spacing:.4px;}
.lec-dot{width:8px;height:8px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 0 rgba(239,68,68,.6);animation:lec-pulse 1.4s infinite;}
@keyframes lec-pulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.5);}70%{box-shadow:0 0 0 7px rgba(239,68,68,0);}100%{box-shadow:0 0 0 0 rgba(239,68,68,0);}}
.lec-count{font-size:12px;color:#64748b;font-weight:700;}

.lec-stage{animation:lec-in .55s cubic-bezier(.2,.8,.2,1) both;}
@keyframes lec-in{from{opacity:0;transform:translateY(10px);filter:blur(3px);}to{opacity:1;transform:none;filter:none;}}

.lec-school{display:flex;align-items:baseline;gap:9px;margin-bottom:10px;}
.lec-school b{font-size:17px;font-weight:900;color:#fff;}
.lec-school span{font-size:12px;color:#93c5fd;font-weight:700;}

.lec-q{color:#e5e7eb;font-size:15.5px;line-height:1.65;min-height:46px;}
.lec-choices{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:8px;color:#94a3b8;font-size:13.5px;}
.lec-choice{display:inline-flex;align-items:center;gap:3px;}

.lec-board{margin-top:14px;border-radius:13px;padding:12px 13px;
  background:radial-gradient(120% 120% at 30% 10%,#1f3b30,#142c22);border:1px solid rgba(255,255,255,.06);
  box-shadow:inset 0 0 26px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:9px;
  animation:lec-board-in .7s ease .15s both;}
@keyframes lec-board-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
.lec-board-row{display:flex;align-items:flex-start;gap:9px;}
.lec-chip{flex-shrink:0;font-size:11px;font-weight:900;padding:2px 9px;border-radius:999px;border:1.5px solid currentColor;margin-top:1px;}
.lec-chip-b{color:#f9a8d4;}
.lec-chip-a{color:#fca5a5;}
.lec-board-txt{color:#eef2f0;font-size:13.5px;line-height:1.6;opacity:.95;}
.lec-board-txt .katex{color:#f4f6f3 !important;}
.lec-q .katex{color:#e5e7eb !important;}
.lec-ans{font-weight:800;}

.lec-prog{height:3px;border-radius:2px;background:rgba(255,255,255,.1);margin-top:13px;overflow:hidden;}
.lec-prog-fill{display:block;height:100%;border-radius:2px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);
  animation:lec-fill 4.5s linear both;}
@keyframes lec-fill{from{width:0;}to{width:100%;}}

@media (max-width:768px){ .lec{min-height:0;} .lec-q{font-size:14.5px;} }
`;
