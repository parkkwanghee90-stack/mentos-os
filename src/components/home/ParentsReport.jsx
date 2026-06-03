import { motion } from "framer-motion";
import { FileText, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { fadeUp, stagger } from "./_motion";

const BARS = [42, 58, 50, 80, 70, 64, 88]; // 가상 시각화 높이(%)
const ITEMS = [
  { Icon: FileText, t: "학습 리포트" },
  { Icon: Clock, t: "공부 시간" },
  { Icon: ShieldCheck, t: "안전한 환경" },
  { Icon: AlertTriangle, t: "오답 패턴" },
];

export default function ParentsReport() {
  return (
    <section id="parents" className="chalk-section chalk-section--light">
      <div className="chalk-wrap">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">학부모님께</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            아이가 어떻게 공부하는지,<br />부모님도 함께 봅니다.
          </motion.h2>

          <motion.div variants={fadeUp} className="chalk-card" style={{ maxWidth: 820, margin: "48px auto 0", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>주간 이해도 추이</strong>
              <span style={{ background: "#eef2ee", color: "var(--ink-soft)", fontSize: "0.72rem", fontWeight: 700,
                padding: "4px 10px", borderRadius: 999 }}>예시 데이터</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 170 }}>
              {BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "6px 6px 0 0",
                  background: i === BARS.length - 1 ? "var(--green-solid)" : "#cfe3d6" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 24 }}>
              {ITEMS.map(({ Icon, t }) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: "#f6f8f5", border: "1px solid var(--paper-line)", borderRadius: 12 }}>
                  <Icon size={18} color="var(--green-solid)" aria-hidden="true" />
                  <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: "0.9rem" }}>{t}</span>
                  <span style={{ marginLeft: "auto", color: "var(--ink-soft)", fontSize: "0.72rem", fontWeight: 700 }}>예시</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
