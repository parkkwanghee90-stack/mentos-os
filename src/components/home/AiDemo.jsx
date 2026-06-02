import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, ListOrdered, MessageSquareText, ScanSearch } from "lucide-react";
import { fadeUp, stagger } from "./_motion";

const BUBBLES = [
  { who: "ai", t: "x² − 5x + 6, 같이 볼까? 곱이 6 되는 두 수를 떠올려봐." },
  { who: "me", t: "2랑 3?" },
  { who: "ai", t: "좋아! 그런데 합은 −5여야 해. 부호를 어떻게?" },
  { who: "me", t: "아 둘 다 음수! −2랑 −3." },
  { who: "ai", t: "정확해 👏 (x−2)(x−3). 전개해서 검산해보자." },
];
const FEATURES = [
  { Icon: Mic, label: "음성 힌트" },
  { Icon: ListOrdered, label: "단계 풀이" },
  { Icon: MessageSquareText, label: "AI 피드백" },
  { Icon: ScanSearch, label: "답안 분석" },
];

export default function AiDemo() {
  return (
    <section id="demo" className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr", alignItems: "center" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">// LIVE COACHING</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            실시간으로,<br /><span className="chalk-mint chalk-glow">이렇게 같이 풉니다.</span>
          </motion.h2>
          <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
            maxWidth: 420, margin: "28px auto 0" }}>
            {FEATURES.map(({ Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--bb-line)", borderRadius: 14 }}>
                <Icon size={18} color="var(--mint)" aria-hidden="true" />
                <span style={{ color: "var(--title-on-dark)", fontWeight: 600, fontSize: "0.92rem" }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="chalk-card--dark" style={{ maxWidth: 460, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BUBBLES.map((b, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{
                  maxWidth: "84%", padding: "11px 15px", fontSize: "0.92rem", lineHeight: 1.5,
                  borderRadius: 16,
                  alignSelf: b.who === "me" ? "flex-end" : "flex-start",
                  background: b.who === "me" ? "var(--mint)" : "rgba(255,255,255,0.05)",
                  color: b.who === "me" ? "#06140d" : "#eafff1",
                  border: b.who === "me" ? "none" : "1px solid var(--bb-line)",
                  borderBottomRightRadius: b.who === "me" ? 5 : 16,
                  borderBottomLeftRadius: b.who === "me" ? 16 : 5,
                }}>
                {b.t}
              </motion.div>
            ))}
            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
              padding: "10px 14px", borderRadius: 16, background: "rgba(124,255,176,0.1)", border: "1px solid var(--bb-line)" }}>
              <span className="chalk-live" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mint)", display: "inline-block" }} />
              <span style={{ color: "var(--mint)", fontSize: "0.82rem" }}>AI 누리가 분필 드는 중…</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
        style={{ textAlign: "center", marginTop: 36, position: "relative", zIndex: 2 }}>
        <Link to="/login" className="chalk-btn">직접 체험해보기</Link>
      </motion.div>
    </section>
  );
}
