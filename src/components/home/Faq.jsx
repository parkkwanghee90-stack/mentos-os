import { useState } from "react";
import { ChevronDown } from "lucide-react";

const QA = [
  { q: "정말 답을 안 알려주나요?", a: "네. 답 대신 막힌 지점에 맞는 힌트와 질문을 주어 스스로 도달하게 합니다. 단계가 끝나면 검산으로 확인합니다." },
  { q: "어떤 범위를 지원하나요?", a: "단원별 코치가 단계별로 코칭합니다. 자세한 범위는 체험에서 직접 확인할 수 있어요." },
  { q: "학부모도 학습을 볼 수 있나요?", a: "학습 리포트로 무엇을 풀었고 어디서 막혔는지, 공부 시간과 오답 패턴을 함께 확인할 수 있습니다." },
  { q: "무료 체험은 어떻게 되나요?", a: "30일 무료 체험을 제공합니다. 신용카드 등록 없이 시작하고 언제든 그만둘 수 있습니다." },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="chalk-section chalk-section--dark">
      <div className="chalk-wrap" style={{ maxWidth: 760 }}>
        <h2 className="chalk-h2" style={{ textAlign: "center", marginBottom: 40 }}>자주 묻는 질문.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="chalk-card--dark" style={{ padding: 0, overflow: "hidden" }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 12, padding: "1.1rem 1.3rem", background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--title-on-dark)", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>
                  {item.q}
                  <ChevronDown size={18} color="var(--mint)" aria-hidden="true"
                    style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {isOpen && (
                  <p style={{ padding: "0 1.3rem 1.2rem", color: "var(--ink-on-dark)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
