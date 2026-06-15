/**
 * LandingJourney.jsx — "한 학생의 2주 성장 스토리" 자동재생 타임라인.
 * 흐름: ① 원의방정식 수업(실제 AVS 스텝을 칠판에 한 단계씩) → ② 채점/오답
 *      → ③ 숙제 발송 → ④ 학부모 전송 → ⑤ 주간 테스트(시험지 형식) → ⑥ 성적 상승 그래프
 * 자동 전환(무한 반복, 충분히 느리게), 일시정지/처음부터, 모바일 세로 스택.
 */
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, X, ClipboardList, MessageCircle, TrendingUp } from 'lucide-react';
import { BlockMath } from '@/components/KaTeXWrapper';
import 'katex/dist/katex.min.css';
import { HERO_AVS } from '@/data/heroAvs';

const CLASS_IDX = 0;
const AVS_STEP_MS = 1700; // 수업 단계 AVS 한 스텝당
const AVS_END_MS = 2600;  // 마지막 스텝 후 다음 단계로

const STAGES = [
  { tag: '1일차 · 수학교실 2시간', icon: '📚', title: '원의 방정식 수업', desc: 'AI 선생님과 칠판에서 “생각의 순서(AVS)”로 한 단계씩 풀이', visual: 'class' },
  { tag: '수업 직후', icon: '✅', title: '실시간 채점', desc: '오늘 푼 문제를 바로 채점 — 맞은 것과 틀린 것을 확인', visual: 'grade', dwell: 4200, pct: 65, marks: [1, 1, 1, 0, 0], sub: '오답 3문항 → 취약단원 “원의 방정식”' },
  { tag: '수업 직후', icon: '📘', title: '숙제 자동 발송', desc: '틀린 단원 그대로, 보강 숙제 5문제가 숙제함으로', visual: 'homework', dwell: 4400 },
  { tag: '수업 직후', icon: '💬', title: '학부모 실시간 전송', desc: '카카오 알림톡으로 오늘 성취도·숙제를 즉시 전송', visual: 'push', dwell: 4600 },
  { tag: '2주 후', icon: '📝', title: '주간 테스트', desc: '배운 내용과 숙제 범위를 실제 시험지로 점검', visual: 'paper', dwell: 5200 },
  { tag: '결과', icon: '🎉', title: '성적 상승', desc: 'AVS·숙제·피드백이 쌓여 2주 만에 등급이 올랐어요', visual: 'result', dwell: 5400 },
];

/* ── 단계별 시각 장면 ── */
function StageVisual({ stage, avsStep }) {
  if (stage.visual === 'class') {
    const steps = HERO_AVS.steps;
    const s = steps[Math.min(avsStep, steps.length - 1)];
    return (
      <div className="jr-class">
        <div className="jr-class-bar">
          <span className="jr-teacher">👨‍🏫 박선생님</span>
          <span className="jr-class-unit">원의 방정식 · 4단계</span>
        </div>
        <div className="jr-board">
          <div className="jr-board-dots">
            {steps.map((st, i) => <i key={i} className={i === avsStep ? 'on' : (i < avsStep ? 'done' : '')} />)}
          </div>
          <div className="jr-board-step">
            <span className="jr-board-tag">{s.tag}</span>{s.title}
          </div>
          <p className="jr-board-text">{s.text}</p>
          <div className="jr-board-math"><BlockMath math={s.latex} /></div>
        </div>
      </div>
    );
  }
  if (stage.visual === 'grade') {
    return (
      <div className="jr-vis jr-vis-grade">
        <div className="jr-ring" style={{ '--pct': stage.pct }}><span>{stage.pct}<i>점</i></span></div>
        <div className="jr-marks">
          {stage.marks.map((m, i) => (
            <span key={i} className={m ? 'ok' : 'no'} style={{ animationDelay: `${i * 0.12}s` }}>{m ? <Check size={16} /> : <X size={16} />}</span>
          ))}
        </div>
        <p className="jr-sub">{stage.sub}</p>
      </div>
    );
  }
  if (stage.visual === 'homework') {
    return (
      <div className="jr-vis jr-card jr-hw">
        <div className="jr-card-h"><ClipboardList size={15} /> 오늘의 숙제 도착</div>
        <div className="jr-hw-title">원의 방정식 · 보강 5문제</div>
        <div className="jr-hw-rows">
          {['중점의 자취', '두 점에서 거리비', '접선의 방정식', '두 원의 관계', '자취의 방정식'].map((t, i) => (
            <div key={t} className="jr-hw-row" style={{ animationDelay: `${i * 0.12}s` }}><span>{i + 1}</span>{t}</div>
          ))}
        </div>
        <span className="jr-hw-due">⏰ 오늘 21:00까지</span>
      </div>
    );
  }
  if (stage.visual === 'push') {
    return (
      <div className="jr-vis jr-vis-push">
        <div className="jr-push-chip"><MessageCircle size={13} /> 카카오 알림톡</div>
        <div className="jr-push-bubble">
          <b>[매쓰멘토스 학부모 알림]</b>
          <p>민준이가 오늘 <b>원의 방정식</b>을 학습했어요.<br />성취도 <b>65점</b> · 오답 3문항 → 보강 숙제를 발송했습니다.</p>
        </div>
        <div className="jr-push-sent"><Check size={13} /> 학부모님께 전송 완료</div>
      </div>
    );
  }
  if (stage.visual === 'paper') {
    const items = [
      { q: '원 $x^2+y^2=4$ 위의 점과 $A(4,0)$의 중점의 자취는?', ok: 1 },
      { q: '두 점 $A,B$에서 거리의 비가 $2:1$인 점의 자취 방정식은?', ok: 1 },
      { q: '점 $(3,1)$에서 원 $x^2+y^2=4$에 그은 접선의 방정식은?', ok: 1 },
      { q: '두 원의 교점을 지나는 직선의 방정식을 구하시오.', ok: 0 },
      { q: '점과 직선 사이의 거리를 이용해 반지름을 구하시오.', ok: 1 },
    ];
    return (
      <div className="jr-paper">
        <div className="jr-paper-head">
          <span>📄 2주차 주간 테스트 · 수학</span>
          <span className="jr-paper-name">이름: 민준</span>
        </div>
        <ol className="jr-paper-list">
          {items.map((it, i) => (
            <li key={i} className="jr-paper-q" style={{ animationDelay: `${i * 0.12}s` }}>
              <span className="jr-paper-num">{i + 1}</span>
              <span className="jr-paper-text" dangerouslySetInnerHTML={{ __html: it.q.replace(/\$([^$]+)\$/g, '<i>$1</i>') }} />
              <span className={`jr-paper-mark ${it.ok ? 'ok' : 'no'}`}>{it.ok ? '○' : '✗'}</span>
            </li>
          ))}
        </ol>
        <div className="jr-paper-score">88점</div>
      </div>
    );
  }
  // result — 성적 상승 차트
  return (
    <div className="jr-vis jr-vis-result">
      <div className="jr-bars">
        <div className="jr-bar-col">
          <span className="jr-bar-val">65점</span>
          <div className="jr-bar jr-bar-before" />
          <span className="jr-bar-lbl">수업 전</span>
        </div>
        <div className="jr-bar-arrow"><TrendingUp size={22} /></div>
        <div className="jr-bar-col">
          <span className="jr-bar-val hi">88점</span>
          <div className="jr-bar jr-bar-after" />
          <span className="jr-bar-lbl">2주 후</span>
        </div>
      </div>
      <div className="jr-grade-jump">
        <span className="jr-grade old">4등급</span>
        <span className="jr-grade-arrow">→</span>
        <span className="jr-grade new">2등급</span>
      </div>
    </div>
  );
}

export default function LandingJourney() {
  const [idx, setIdx] = useState(0);
  const [avsStep, setAvsStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  const cur = STAGES[idx];
  const isClass = idx === CLASS_IDX;

  // 단계 진입 시 AVS 서브스텝 초기화
  useEffect(() => { setAvsStep(0); }, [idx]);

  // 자동 진행 (수업 단계는 AVS 스텝을 하나씩 → 끝나면 다음 단계)
  useEffect(() => {
    if (!playing) return;
    let delay, action;
    if (isClass) {
      if (avsStep < HERO_AVS.steps.length - 1) { delay = AVS_STEP_MS; action = () => setAvsStep((s) => s + 1); }
      else { delay = AVS_END_MS; action = () => setIdx((p) => (p + 1) % STAGES.length); }
    } else {
      delay = cur.dwell; action = () => setIdx((p) => (p + 1) % STAGES.length);
    }
    const t = setTimeout(action, delay);
    return () => clearTimeout(t);
  }, [idx, avsStep, playing, isClass, cur.dwell]);

  return (
    <section id="journey" className="hv-section hv-dark hv-journey">
      <div className="hv-wrap">
        <h2 className="hv-h2 hv-h2-center">민준이의 2주 성장 스토리</h2>
        <p className="hv-sub hv-sub-center">
          실제 수업·AVS·숙제·피드백을 거쳐 <b>2주 만에 등급이 오르기까지</b>
        </p>

        <div className="jr-timeline">
          <div className="jr-line"><div className="jr-line-fill" style={{ width: `${(idx / (STAGES.length - 1)) * 100}%` }} /></div>
          {STAGES.map((s, i) => (
            <button key={i} type="button" className={`jr-dot ${i === idx ? 'on' : ''} ${i < idx ? 'done' : ''}`}
              onClick={() => { setIdx(i); setPlaying(false); }}>
              <span className="jr-dot-ic">{s.icon}</span>
            </button>
          ))}
        </div>

        <div className="jr-stage" key={idx}>
          <div className="jr-stage-copy">
            <span className="jr-stage-tag">{cur.tag}</span>
            <h3 className="jr-stage-title"><span className="jr-stage-ic">{cur.icon}</span>{cur.title}</h3>
            <p className="jr-stage-desc">{cur.desc}</p>
          </div>
          <div className="jr-stage-vis"><StageVisual stage={cur} avsStep={avsStep} /></div>
        </div>

        <div className="jr-controls">
          <button type="button" className="jr-ctrl" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause size={15} /> : <Play size={15} />}{playing ? '일시정지' : '재생'}
          </button>
          <button type="button" className="jr-ctrl" onClick={() => { setIdx(0); setAvsStep(0); setPlaying(true); }}>
            <RotateCcw size={14} />처음부터
          </button>
        </div>
      </div>

      <style>{JOURNEY_CSS}</style>
    </section>
  );
}

const JOURNEY_CSS = `
.hv-journey .hv-sub-center{text-align:center;max-width:600px;margin:10px auto 0;}
.hv-journey .hv-sub-center b{color:#a78bfa;}
.jr-timeline{position:relative;display:flex;justify-content:space-between;max-width:680px;margin:38px auto 0;}
.jr-line{position:absolute;top:19px;left:5%;right:5%;height:3px;background:rgba(148,163,184,0.2);border-radius:3px;}
.jr-line-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:3px;transition:width .6s ease;}
.jr-dot{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;flex:1;}
.jr-dot-ic{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;
  background:#1e293b;border:2px solid rgba(148,163,184,0.3);transition:.25s;}
.jr-dot.done .jr-dot-ic{border-color:#16a34a;background:rgba(22,163,74,0.15);}
.jr-dot.on .jr-dot-ic{border-color:#a78bfa;background:linear-gradient(135deg,#6366f1,#8b5cf6);transform:scale(1.18);box-shadow:0 0 0 6px rgba(139,92,246,0.15);}
.jr-stage{display:grid;grid-template-columns:0.85fr 1.15fr;gap:24px;align-items:center;max-width:860px;margin:30px auto 0;
  background:rgba(15,23,42,0.5);border:1px solid rgba(148,163,184,0.15);border-radius:20px;padding:26px;min-height:280px;animation:jrIn .5s ease;}
@keyframes jrIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.jr-stage-tag{display:inline-block;font-size:12px;font-weight:800;color:#c4b5fd;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);padding:3px 11px;border-radius:999px;margin-bottom:12px;}
.jr-stage-title{font-size:1.5rem;font-weight:900;color:#f1f5f9;display:flex;align-items:center;gap:9px;margin:0 0 10px;letter-spacing:-0.5px;}
.jr-stage-ic{font-size:1.4rem;}
.jr-stage-desc{font-size:0.98rem;color:#94a3b8;line-height:1.6;margin:0;word-break:keep-all;}
.jr-stage-vis{display:flex;align-items:center;justify-content:center;min-height:230px;}
/* 수업 칠판 */
.jr-class{width:100%;max-width:380px;border-radius:14px;overflow:hidden;border:1px solid rgba(148,163,184,0.2);background:#0b1220;}
.jr-class-bar{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;background:rgba(139,92,246,0.12);border-bottom:1px solid rgba(148,163,184,0.15);}
.jr-teacher{font-size:13px;font-weight:800;color:#e2e8f0;}
.jr-class-unit{font-size:11.5px;font-weight:700;color:#c4b5fd;}
.jr-board{padding:14px;}
.jr-board-dots{display:flex;gap:5px;margin-bottom:11px;}
.jr-board-dots i{width:18px;height:4px;border-radius:3px;background:rgba(148,163,184,0.25);transition:.3s;}
.jr-board-dots i.done{background:#16a34a;}
.jr-board-dots i.on{background:linear-gradient(90deg,#6366f1,#8b5cf6);}
.jr-board-step{font-size:14px;font-weight:800;color:#f1f5f9;display:flex;align-items:center;gap:7px;margin-bottom:7px;}
.jr-board-tag{font-size:11px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:2px 8px;border-radius:6px;}
.jr-board-text{font-size:12.5px;color:#cbd5e1;line-height:1.5;margin:0 0 9px;min-height:34px;}
.jr-board-math{background:#fff;border-radius:9px;padding:9px 11px;color:#0f172a;overflow-x:auto;}
/* 채점 */
.jr-vis-grade{display:flex;flex-direction:column;align-items:center;gap:14px;}
.jr-ring{width:120px;height:120px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:conic-gradient(#8b5cf6 calc(var(--pct)*1%), rgba(148,163,184,0.18) 0);position:relative;}
.jr-ring::before{content:'';position:absolute;inset:10px;border-radius:50%;background:#0f172a;}
.jr-ring span{position:relative;z-index:1;font-size:32px;font-weight:900;color:#f1f5f9;}
.jr-ring span i{font-size:14px;font-style:normal;color:#94a3b8;margin-left:2px;}
.jr-marks{display:flex;gap:7px;}
.jr-marks span{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;animation:jrPop .4s both;}
.jr-marks .ok{background:#16a34a;}.jr-marks .no{background:#ef4444;}
.jr-sub{font-size:13px;color:#cbd5e1;font-weight:700;margin:0;text-align:center;word-break:keep-all;}
@keyframes jrPop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
/* 숙제 카드 */
.jr-card{background:#fff;border-radius:14px;padding:14px;width:100%;max-width:280px;box-shadow:0 6px 20px rgba(0,0,0,.2);}
.jr-card-h{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:#7c3aed;margin-bottom:9px;}
.jr-hw-title{font-size:15px;font-weight:900;color:#0f172a;margin-bottom:9px;}
.jr-hw-rows{display:flex;flex-direction:column;gap:5px;}
.jr-hw-row{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#334155;animation:jrSlide .45s both;}
.jr-hw-row span{width:18px;height:18px;border-radius:5px;background:#ede9fe;color:#7c3aed;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
@keyframes jrSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.jr-hw-due{display:inline-block;margin-top:9px;font-size:11.5px;color:#dc2626;font-weight:700;}
/* 학부모 푸시 */
.jr-vis-push{display:flex;flex-direction:column;gap:9px;width:100%;max-width:300px;}
.jr-push-chip{align-self:flex-start;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:#3c1e1e;background:#fae100;padding:4px 10px;border-radius:999px;}
.jr-push-bubble{background:#fff;border-radius:13px;border-top-left-radius:3px;padding:11px 13px;color:#1a1a1a;font-size:12.5px;line-height:1.5;}
.jr-push-bubble b{color:#7c3aed;}
.jr-push-sent{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:800;color:#22c55e;}
/* 시험지 */
.jr-paper{width:100%;max-width:330px;background:#fff;border-radius:8px;padding:16px 16px 20px;position:relative;color:#1f2937;
  box-shadow:0 10px 30px rgba(0,0,0,.3);background-image:linear-gradient(#eef2f7 1px,transparent 1px);background-size:100% 30px;background-position:0 52px;}
.jr-paper-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1f2937;padding-bottom:7px;margin-bottom:8px;}
.jr-paper-head span:first-child{font-size:13.5px;font-weight:900;}
.jr-paper-name{font-size:11px;color:#475569;font-weight:700;}
.jr-paper-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}
.jr-paper-q{display:flex;align-items:center;gap:8px;height:30px;font-size:12px;animation:jrSlide .45s both;}
.jr-paper-num{font-weight:900;color:#1f2937;flex-shrink:0;}
.jr-paper-text{flex:1;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.jr-paper-text i{font-style:italic;font-family:'Times New Roman',serif;}
.jr-paper-mark{font-weight:900;flex-shrink:0;font-size:15px;}
.jr-paper-mark.ok{color:#2563eb;}
.jr-paper-mark.no{color:#dc2626;}
.jr-paper-score{position:absolute;top:52px;right:14px;font-size:24px;font-weight:900;color:#dc2626;
  border:3px solid #dc2626;border-radius:50%;width:64px;height:64px;display:flex;align-items:center;justify-content:center;
  transform:rotate(-14deg);font-family:'Times New Roman',serif;animation:jrStamp .5s .5s both;}
@keyframes jrStamp{from{opacity:0;transform:rotate(-14deg) scale(1.6)}to{opacity:1;transform:rotate(-14deg) scale(1)}}
/* 결과 차트 */
.jr-vis-result{display:flex;flex-direction:column;align-items:center;gap:18px;width:100%;}
.jr-bars{display:flex;align-items:flex-end;justify-content:center;gap:18px;height:150px;}
.jr-bar-col{display:flex;flex-direction:column;align-items:center;gap:6px;justify-content:flex-end;}
.jr-bar-val{font-size:15px;font-weight:900;color:#94a3b8;}
.jr-bar-val.hi{color:#22c55e;font-size:18px;}
.jr-bar{width:48px;border-radius:8px 8px 0 0;}
.jr-bar-before{height:84px;background:linear-gradient(180deg,#64748b,#475569);animation:jrGrowB .9s ease both;}
.jr-bar-after{height:122px;background:linear-gradient(180deg,#22c55e,#16a34a);animation:jrGrowA 1.1s .3s ease both;box-shadow:0 0 22px rgba(34,197,94,.4);}
@keyframes jrGrowB{from{height:0}to{height:84px}}
@keyframes jrGrowA{from{height:0}to{height:122px}}
.jr-bar-lbl{font-size:11.5px;color:#94a3b8;font-weight:600;}
.jr-bar-arrow{align-self:center;color:#22c55e;}
.jr-grade-jump{display:flex;align-items:center;gap:12px;}
.jr-grade{font-size:15px;font-weight:800;padding:6px 14px;border-radius:10px;}
.jr-grade.old{color:#94a3b8;background:rgba(148,163,184,0.12);}
.jr-grade.new{color:#fff;background:linear-gradient(135deg,#22c55e,#16a34a);font-size:17px;animation:jrPop .5s .7s both;}
.jr-grade-arrow{color:#64748b;font-weight:900;}
.jr-controls{display:flex;justify-content:center;gap:8px;margin-top:24px;}
.jr-ctrl{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:#e2e8f0;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.22);border-radius:9px;padding:7px 13px;cursor:pointer;}
.jr-ctrl:hover{background:rgba(148,163,184,0.2);}
@media(max-width:760px){
  .jr-stage{grid-template-columns:1fr;text-align:center;}
  .jr-stage-title{justify-content:center;}
  .jr-stage-copy{order:1;}
  .jr-stage-vis{order:0;}
  .jr-timeline{max-width:330px;}
}
`;
