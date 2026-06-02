import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";
import ChalkTray from "./ChalkTray";
import ChalkUnderline from "./ChalkUnderline";

const EQ = [
  { t: "x² − 5x + 6 = 0", c: "" },
  { t: "곱 6, 합 −5  →  −2, −3", c: "soft" },
  { t: "(x − 2)(x − 3) = 0", c: "" },
  { t: "x = 2  또는  x = 3", c: "coral" },
];

export default function Hero() {
  return (
    <section className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr", alignItems: "center" }}>
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="chalk-kicker">// MATHMENTOS · AI 수학 코치</motion.div>
          <motion.h1 variants={fadeUp} className="chalk-h1" style={{ marginTop: 14 }}>
            답은 <span className="chalk-mint chalk-glow">알려주지 않아.</span>
            <br />
            <span style={{ position: "relative", display: "inline-block" }}>
              같이 푸는 거야<span className="chalk-coral">.</span>
              <ChalkUnderline />
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="chalk-lead" style={{ marginTop: 22 }}>
            막힐 때마다 네 풀이를 보고, 딱 다음 한 칸을 분필로 짚어주는 AI 수학 코치.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <Link to="/login" className="chalk-btn">30일 무료 체험</Link>
            <a href="#demo" className="chalk-btn chalk-btn--ghost">풀이 보기 ▶</a>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="chalk-card--dark" style={{ marginTop: 8 }}>
          <div className="chalk-kicker" style={{ fontSize: "0.66rem" }}>— 칠판에서 같이 —</div>
          <div className="chalk-eq" style={{ fontSize: "1.25rem", marginTop: 12 }}>
            {EQ.map((line, i) => (
              <motion.div key={i} variants={fadeUp}
                className={line.c === "coral" ? "chalk-coral" : ""}
                style={line.c === "soft" ? { color: "var(--ink-on-dark)" } : undefined}>
                {line.t}
              </motion.div>
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
