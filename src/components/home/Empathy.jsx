import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";

const PAINS = [
  "조금만 바뀌면 또 막혀요",
  "왜 틀렸는지 모르겠어요",
  "물어볼 사람이 없어요",
  "풀이를 외우기만 해요",
];

export default function Empathy() {
  return (
    <section id="empathy" className="chalk-section chalk-section--light">
      <div className="chalk-wrap">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">이런 적, 있죠?</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            공식은 외웠는데,<br />시험만 보면 막히는 이유.
          </motion.h2>
          <div style={{ display: "grid", gap: 18, marginTop: 48,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {PAINS.map((p) => (
              <motion.div key={p} variants={fadeUp} className="chalk-card--memo"
                style={{ padding: "1.5rem 1.4rem", textAlign: "left", fontWeight: 700, fontSize: "1.05rem", color: "var(--ink)" }}>
                <span style={{ fontFamily: "var(--mono)", color: "var(--green-solid)", marginRight: 8 }}>?</span>
                {p}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
