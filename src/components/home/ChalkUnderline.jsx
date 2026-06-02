import { motion } from "framer-motion";
import { drawLine } from "./_motion";

// 핵심 구절 아래 분필 손글씨 밑줄. color prop 기본 노랑.
export default function ChalkUnderline({ color = "var(--yellow)" }) {
  return (
    <svg
      className="chalk-underline"
      width="100%" height="12" viewBox="0 0 190 12" preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, bottom: "-8px" }}
      aria-hidden="true"
    >
      <motion.path
        d="M2 7 Q60 2 100 6 T188 5"
        stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"
        variants={drawLine} initial="hidden" whileInView="show" viewport={{ once: true }}
      />
    </svg>
  );
}
