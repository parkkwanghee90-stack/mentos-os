import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Eye, BrainCircuit, Target, ClipboardList, BarChart3, Bot, ArrowRight,
} from "lucide-react";

/* 히어로 액션 영역 로테이션 카피 (자유롭게 추가/수정 가능) */
const ROTATE = [
  "복잡한 개념도 애니메이션으로 한눈에",
  "막힐 때마다 24시간 AI 코칭",
  "답이 아닌, 푸는 과정을 함께",
];

function RotatingTagline() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((p) => (p + 1) % ROTATE.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="hv-hero-rotate" aria-live="polite">
      <span className="hv-hero-rotate-dot" />
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          className="hv-hero-rotate-text"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          {ROTATE[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const FEATURES = [
  { icon: Eye, label: "AVS 시각화 풀이" },
  { icon: BrainCircuit, label: "AI 풀이 분석" },
  { icon: Target, label: "취약점 진단" },
  { icon: ClipboardList, label: "숙제 자동 관리" },
  { icon: BarChart3, label: "학부모 리포트" },
  { icon: Bot, label: "24시간 AI 튜터" },
];

const STATS = [
  { v: "10,000+", l: "누적 학생 수" },
  { v: "95%", l: "학부모 만족도" },
  { v: "3.2등급", l: "평균 성적 향상" },
  { v: "7일", l: "무료 체험 제공" },
  { v: "24시간", l: "AI 튜터 상시 대기" },
];

const BG_EQ = [
  { t: "y = ax² + bx + c", x: "42%", y: "16%", s: 1 },
  { t: "a² + b² = c²", x: "40%", y: "30%", s: 0.85 },
  { t: "f(x) = x² − 2x", x: "44%", y: "62%", s: 0.8 },
];

/* 노트북 화면 안의 AVS 제품 UI */
function ProductUI() {
  return (
    <div className="hv-product">
      <div className="hv-product-bar">
        <span className="hv-product-title">문제</span>
        <span className="hv-product-dots"><i /><i /><i /></span>
      </div>

      <div className="hv-product-body">
        <div className="hv-prob-row">
          <p className="hv-prob-q">
            이차함수 <b>y = x² − 4x + 3</b>의<br />그래프의 꼭짓점 좌표를 구하세요.
          </p>
          <span className="hv-prob-submit">정답 제출</span>
        </div>

        <div className="hv-avs-card">
          <span className="hv-avs-tag">AVS 시각화 풀이</span>
          <div className="hv-avs-grid">
            <div className="hv-avs-steps">
              {["문제 이해", "핵심 개념", "식 변형", "그래프 분석", "답안 도출"].map((s, i) => (
                <span key={s} className={`hv-avs-step ${i === 0 ? "is-on" : ""}`}>{s}</span>
              ))}
            </div>
            <div className="hv-avs-graph">
              <svg viewBox="0 0 220 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                <line x1="20" y1="130" x2="210" y2="130" stroke="rgba(255,255,255,.22)" strokeWidth="1" />
                <line x1="110" y1="12" x2="110" y2="138" stroke="rgba(255,255,255,.22)" strokeWidth="1" />
                <path d="M30 18 Q110 200 190 18" fill="none" stroke="#43c7ff" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="110" cy="118" r="4.5" fill="#43c7ff" />
                <text x="118" y="116" fill="#9fb4e8" fontSize="10">(2, −1)</text>
              </svg>
            </div>
            <div className="hv-avs-summary">
              <span className="hv-avs-summary-title">AI 풀이 요약</span>
              <p>이차함수의 꼭짓점은 <b>x = −b/2a</b> 공식을 이용하여 x = 2를 구하고, y값을 대입하여 −1을 얻을 수 있습니다.</p>
              <span className="hv-avs-next">다음 단계 →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingHero() {
  return (
    <section id="top" className="hv-hero">
      <div className="hv-hero-bg" aria-hidden="true">
        <span className="hv-hero-glow hv-hero-glow-1" />
        <span className="hv-hero-glow hv-hero-glow-2" />
        <span className="hv-hero-brain" />
        {BG_EQ.map((e) => (
          <span key={e.t} className="hv-hero-eq" style={{ left: e.x, top: e.y, fontSize: `${e.s * 22}px` }}>{e.t}</span>
        ))}
      </div>

      <div className="hv-wrap hv-hero-inner">
        <div className="hv-hero-copy">
          <p className="hv-eyebrow">분당 25년 수학 노하우 × AI 기술의 만남</p>
          <h1 className="hv-hero-title">
            수학을 외우지 마세요.<br />
            <span className="hv-accent-blue">이해하게 하세요.</span>
          </h1>
          <p className="hv-hero-lead">
            AVS(Animated Visual Solution)기반 AI가<br className="hv-br-pc" />
            학생의 사고과정을 분석하고, 이해를 시각화합니다.
          </p>
          <div className="hv-hero-actions">
            <Link to="/login" className="hv-btn hv-btn-primary hv-btn-lg">무료 체험 시작 <ArrowRight size={18} /></Link>
          </div>
          <RotatingTagline />
        </div>

        <div className="hv-hero-visual">
          <div className="hv-laptop">
            <div className="hv-laptop-screen"><ProductUI /></div>
            <div className="hv-laptop-base" />
          </div>
        </div>
      </div>

      <div className="hv-wrap">
        <ul className="hv-feature-row">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="hv-feature">
              <span className="hv-feature-ic"><Icon size={22} /></span>
              <span className="hv-feature-label">{label}</span>
            </li>
          ))}
        </ul>

        <ul className="hv-stat-row">
          {STATS.map((s) => (
            <li key={s.l} className="hv-stat">
              <b className="hv-stat-v">{s.v}</b>
              <span className="hv-stat-l">{s.l}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
