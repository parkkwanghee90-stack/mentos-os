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

/* AVS 데모 5단계: 라벨 + AI 요약 (실제 풀이 흐름) */
const AVS_DEMO_STEPS = [
  { label: "문제 이해", summary: <>주어진 이차함수 <b>y = x² − 4x + 3</b>의 그래프에서 꼭짓점 좌표를 찾는 문제입니다.</> },
  { label: "핵심 개념", summary: <>꼭짓점의 x좌표는 <b>x = −b/2a</b> 공식으로 구합니다. 여기서 a = 1, b = −4 입니다.</> },
  { label: "식 변형", summary: <>완전제곱식으로 변형하면 <b>y = (x − 2)² − 1</b>. 꼭짓점이 식에서 바로 드러납니다.</> },
  { label: "그래프 분석", summary: <>x = 2를 대칭축으로 하는, 아래로 볼록한 포물선이 그려집니다.</> },
  { label: "답안 도출", summary: <>따라서 꼭짓점 좌표는 <b>(2, −1)</b> 입니다. 정답을 제출해 볼까요?</> },
];

const STEP_MS = 3200;

/* 노트북 화면 안의 AVS 제품 UI — 실제 시각화 풀이가 자동 진행되는 데모 */
function ProductUI() {
  const reduce = useReducedMotion();
  // 모션 최소화 환경에서는 최종 답안 상태를 정적으로 보여준다
  const [step, setStep] = useState(reduce ? 4 : 0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((p) => (p + 1) % AVS_DEMO_STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const fade = (visible, dur = 0.45) => ({
    initial: reduce ? false : { opacity: 0 },
    animate: { opacity: visible ? 1 : 0 },
    transition: { duration: dur },
  });

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
          <span className="hv-prob-submit" style={step === 4 ? { boxShadow: "0 0 0 2px rgba(139,92,246,.55)" } : undefined}>정답 제출</span>
        </div>

        <div className="hv-avs-card">
          <span className="hv-avs-tag">AVS 시각화 풀이</span>
          <div className="hv-avs-grid">
            <div className="hv-avs-steps">
              {AVS_DEMO_STEPS.map((s, i) => (
                <span
                  key={s.label}
                  className={`hv-avs-step ${i === step ? "is-on" : ""}`}
                  onClick={() => setStep(i)}
                  style={{ cursor: "pointer", opacity: i <= step ? 1 : 0.55, transition: "opacity .3s" }}
                >
                  {s.label}
                </span>
              ))}
            </div>

            <div className="hv-avs-graph" style={{ position: "relative" }}>
              <svg viewBox="0 0 220 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                {/* 좌표축 */}
                <line x1="20" y1="130" x2="210" y2="130" stroke="rgba(255,255,255,.22)" strokeWidth="1" />
                <line x1="110" y1="12" x2="110" y2="138" stroke="rgba(255,255,255,.22)" strokeWidth="1" />

                {/* step 0: 문제 식 등장 */}
                <motion.text x="28" y="28" fill="#cfe0ff" fontSize="11.5" fontWeight="700" {...fade(step === 0)}>
                  y = x² − 4x + 3
                </motion.text>
                <motion.text x="28" y="44" fill="#8ea2d8" fontSize="9.5" {...fade(step === 0)}>
                  꼭짓점 = ?
                </motion.text>

                {/* step 1: 핵심 공식 */}
                <motion.g {...fade(step === 1)}>
                  <rect x="58" y="52" rx="8" width="104" height="34" fill="rgba(139,92,246,.16)" stroke="rgba(139,92,246,.55)" />
                  <text x="110" y="73" textAnchor="middle" fill="#c4b5fd" fontSize="13" fontWeight="700">x = −b / 2a</text>
                  <text x="110" y="100" textAnchor="middle" fill="#8ea2d8" fontSize="9.5">a = 1,  b = −4  →  x = 2</text>
                </motion.g>

                {/* step 2: 완전제곱식 변형 */}
                <motion.g {...fade(step === 2)}>
                  <text x="110" y="52" textAnchor="middle" fill="#9fb4e8" fontSize="11">y = x² − 4x + 3</text>
                  <text x="110" y="72" textAnchor="middle" fill="#8ea2d8" fontSize="10">↓ 완전제곱식</text>
                  <motion.text
                    x="110" y="94" textAnchor="middle" fill="#43c7ff" fontSize="12.5" fontWeight="700"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={step === 2 ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : 0.5 }}
                  >
                    y = (x − 2)² − 1
                  </motion.text>
                </motion.g>

                {/* step 3+: 대칭축 + 포물선 드로잉 */}
                <motion.line
                  x1="110" y1="20" x2="110" y2="130" stroke="#8b5cf6" strokeWidth="1.2" strokeDasharray="4 4"
                  {...fade(step >= 3, 0.5)}
                />
                <motion.text x="116" y="30" fill="#a78bfa" fontSize="9" {...fade(step === 3)}>x = 2</motion.text>
                {step >= 3 && (
                  <motion.path
                    d="M30 18 Q110 200 190 18"
                    fill="none" stroke="#43c7ff" strokeWidth="2.4" strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduce ? 0 : 1.4, ease: "easeInOut" }}
                  />
                )}

                {/* step 4: 꼭짓점 답안 */}
                {step === 4 && (
                  <>
                    {!reduce && (
                      <motion.circle
                        cx="110" cy="118" fill="none" stroke="#43c7ff" strokeWidth="1.5"
                        initial={{ r: 5, opacity: 0.7 }}
                        animate={{ r: 16, opacity: 0 }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                    <motion.circle
                      cx="110" cy="118" r="4.5" fill="#43c7ff"
                      initial={reduce ? false : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      style={{ transformOrigin: "110px 118px" }}
                    />
                    <motion.g {...fade(true, 0.4)}>
                      <rect x="118" y="104" rx="6" width="56" height="18" fill="rgba(67,199,255,.14)" stroke="rgba(67,199,255,.45)" />
                      <text x="146" y="117" textAnchor="middle" fill="#aee6ff" fontSize="10" fontWeight="700">(2, −1)</text>
                    </motion.g>
                  </>
                )}
              </svg>
            </div>

            <div className="hv-avs-summary">
              <span className="hv-avs-summary-title">AI 풀이 요약</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {AVS_DEMO_STEPS[step].summary}
                </motion.p>
              </AnimatePresence>
              <span
                className="hv-avs-next"
                onClick={() => setStep((p) => (p + 1) % AVS_DEMO_STEPS.length)}
                style={{ cursor: "pointer" }}
              >
                다음 단계 →
              </span>
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
