import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";

const STEPS = [
  { n: "01", t: "네 풀이를 읽어요", d: "정답지가 아니라 학생이 직접 쓴 풀이를 그대로 분석합니다." },
  { n: "02", t: "막힌 칸을 찾아요", d: "어느 단계에서 어긋났는지 정확히 짚습니다. 그 한 곳만." },
  { n: "03", t: "답 대신 힌트를 줘요", d: "정답을 말하지 않습니다. 다음 한 걸음을 떠올리게 하는 질문을." },
  { n: "04", t: "스스로 확인하게 해요", d: "직접 도달한 풀이를 검산까지. 외운 게 아니라 이해한 과정으로." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="chalk-section chalk-section--dark chalk-grain">
      <div className="chalk-wrap">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">// HOW IT WORKS</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            칠판이 채워지는 방식.
          </motion.h2>
          <div style={{ display: "grid", gap: 18, marginTop: 48,
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", textAlign: "left" }}>
            {STEPS.map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="chalk-card--dark">
                <div className="chalk-num">{s.n}</div>
                <h3 style={{ color: "var(--title-on-dark)", fontWeight: 800, fontSize: "1.1rem", marginTop: 12 }}>{s.t}</h3>
                <p style={{ color: "var(--ink-on-dark)", fontSize: "0.95rem", lineHeight: 1.65, marginTop: 8 }}>{s.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
