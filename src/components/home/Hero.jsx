import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";
import ChalkTray from "./ChalkTray";

// 회전하는 메인 카피 (Fade + Vertical Slide)
const PHRASES = [
  "AI가 같이 풉니다",
  "생각하는 힘을 만듭니다",
  "정답보다 과정을 봅니다",
  "포기하지 않게 도와줍니다",
  "혼자 고민하지 않게 합니다",
];

// 검증 가능한 제품 사실만 (거짓 수치 배제)
const STATS = [
  { v: "12명", l: "단원별 코치" },
  { v: "24시간", l: "막힐 때 즉시 코칭" },
  { v: "단계별", l: "답이 아닌 풀이 과정" },
];

const EQ = [
  { t: "x² − 5x + 6 = 0", c: "" },
  { t: "곱 6, 합 −5  →  −2, −3", c: "soft" },
  { t: "(x − 2)(x − 3) = 0", c: "" },
  { t: "x = 2  또는  x = 3", c: "coral" },
];

function RotatingHeadline() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((p) => (p + 1) % PHRASES.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <span
      style={{
        position: "relative",
        display: "block",
        minHeight: "1.15em",
        marginTop: "0.1em",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          className="chalk-glow"
          style={{ display: "inline-block" }}
          initial={reduce ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: -20, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {PHRASES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28 }}>
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ width: "100%", maxWidth: 820 }}>
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "0.5rem 1rem", borderRadius: 999,
              background: "rgba(255,255,255,0.7)", border: "1px solid var(--bb-line)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.08)",
              fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.16em",
              color: "var(--mint-deep)", fontWeight: 700, textTransform: "uppercase",
            }}>
              <span className="chalk-live" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--mint)", display: "inline-block" }} />
              AI 수학 코칭 플랫폼
            </span>
          </motion.div>

          {/* 초대형 Animated Headline */}
          <motion.h1
            variants={fadeUp}
            className="chalk-h1"
            style={{ marginTop: 22, fontSize: "clamp(2.5rem, 8vw, 4.4rem)", letterSpacing: "-0.04em", lineHeight: 1.08 }}
          >
            수학 때문에 멈추는 순간,
            <RotatingHeadline />
          </motion.h1>

          {/* 설명 */}
          <motion.p variants={fadeUp} className="chalk-lead" style={{ marginTop: 24, marginInline: "auto", textAlign: "center" }}>
            막히는 순간, 매스멘토스 AI가 학생의 사고 흐름을 따라가며 끝까지 같이 풀어줍니다.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/login" className="chalk-btn" style={{ minHeight: 56, padding: "0 2rem", borderRadius: 16, fontSize: "1.02rem" }}>
              30일 무료 체험하기
            </Link>
            <a href="#demo" className="chalk-btn chalk-btn--ghost" style={{ minHeight: 56, padding: "0 1.6rem", borderRadius: 16, fontSize: "1.02rem" }}>
              AI 풀이 데모 보기
            </a>
          </motion.div>

          {/* Floating stats (검증 가능한 사실) */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.25rem 2.25rem", marginTop: 34 }}>
            {STATS.map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.1,
                  background: "linear-gradient(135deg, var(--mint-deep), var(--blue))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.v}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* 실시간 AI 풀이 카드 */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          className="chalk-card--dark" style={{ width: "100%", maxWidth: 460, textAlign: "left", marginTop: 6 }}>
          <div className="chalk-kicker" style={{ fontSize: "0.66rem" }}>— 실시간 AI 풀이 —</div>
          <div className="chalk-eq" style={{ fontSize: "1.25rem", marginTop: 12 }}>
            {EQ.map((line, idx) => (
              <div key={idx}
                className={line.c === "coral" ? "chalk-coral" : ""}
                style={line.c === "soft" ? { color: "var(--ink-on-dark)" } : undefined}>
                {line.t}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, border: "1px dashed var(--bb-line)", borderRadius: 8, padding: "10px 12px",
            fontSize: "0.85rem", color: "var(--ink-on-dark)" }}>
            💬 <b className="chalk-mint">힌트:</b> 합이 음수·곱이 양수면 두 수의 부호는?
          </div>
        </motion.div>
      </div>
      <ChalkTray />
    </section>
  );
}
