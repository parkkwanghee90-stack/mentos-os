import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, stagger } from "./_motion";

const PLANS = [
  { name: "Free", tag: "체험", hi: false, desc: "부담 없이 단계 코칭을 먼저 경험하세요.",
    features: ["단계별 힌트 체험", "기본 AI 풀이 보기", "학습 기록 미리보기"], cta: "무료로 시작" },
  { name: "Premium", tag: "AI 코칭", hi: true, desc: "막히는 순간 끝까지, 단원별 코치 12명과 함께.",
    features: ["무제한 단계 코칭", "단원별 코치 12명", "AVS 애니메이션 힌트", "학습 리포트 & 오답 분석"], cta: "30일 무료 체험" },
];

export default function Pricing() {
  return (
    <section id="pricing" className="chalk-section chalk-section--light">
      <div className="chalk-wrap" style={{ maxWidth: 920 }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ textAlign: "center" }}>심플한 요금제.</motion.h2>
          <div style={{ display: "grid", gap: 18, marginTop: 48, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {PLANS.map((p) => (
              <motion.div key={p.name} variants={fadeUp} className="chalk-card"
                style={p.hi ? { borderColor: "var(--green-solid)", borderWidth: 2, boxShadow: "0 18px 44px -20px rgba(11,107,58,0.3)" } : undefined}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "1.4rem", color: "var(--ink)" }}>{p.name}</strong>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                    background: p.hi ? "var(--green-solid)" : "#eef2ee", color: p.hi ? "#fff" : "var(--ink-soft)" }}>{p.tag}</span>
                </div>
                <p style={{ marginTop: 12, color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6 }}>{p.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink)", fontSize: "0.92rem" }}>
                      <Check size={17} color="var(--green-solid)" aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" style={{ marginTop: 24, display: "inline-flex", justifyContent: "center", alignItems: "center",
                  padding: "0.7rem 1.2rem", borderRadius: 999, fontWeight: 800, textDecoration: "none",
                  background: p.hi ? "var(--green-solid)" : "transparent",
                  color: p.hi ? "#fff" : "var(--ink)", border: p.hi ? "none" : "1px solid #cdd6cf" }}>{p.cta}</Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
