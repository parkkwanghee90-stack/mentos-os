import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";
import ChalkTray from "./ChalkTray";

export default function FinalCta() {
  return (
    <section id="cta" className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ textAlign: "center" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
          <motion.h2 variants={fadeUp} className="chalk-h1" style={{ maxWidth: 720, margin: "0 auto" }}>
            막히는 순간,<br /><span className="chalk-mint chalk-glow">바로 옆에 분필이 있어.</span>
          </motion.h2>
          <motion.div variants={fadeUp} style={{ marginTop: 28 }}>
            <Link to="/login" className="chalk-btn" style={{ fontSize: "1.1rem", padding: "1rem 1.8rem" }}>무료로 시작하기</Link>
          </motion.div>
          <motion.p variants={fadeUp} style={{ marginTop: 16, fontSize: "0.82rem", color: "var(--ink-on-dark)" }}>
            신용카드 불필요 · 자동결제 없음 · 30일 후 선택
          </motion.p>
        </motion.div>
      </div>
      <ChalkTray />
    </section>
  );
}
