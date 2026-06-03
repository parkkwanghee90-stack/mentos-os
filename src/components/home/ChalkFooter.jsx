import { Link } from "react-router-dom";

export default function ChalkFooter() {
  return (
    <footer style={{ background: "var(--bb)", borderTop: "1px solid var(--bb-line)", color: "var(--ink-on-dark)" }}>
      <div className="chalk-wrap" style={{ padding: "3rem 1.5rem", display: "flex", flexWrap: "wrap",
        gap: 20, justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong style={{ color: "var(--title-on-dark)", fontSize: "1.05rem" }}>매스멘토스</strong>
          <p style={{ fontSize: "0.82rem", marginTop: 8, maxWidth: 360, lineHeight: 1.6 }}>
            답 대신 과정을 함께하는 AI 수학 코치. 실제 교사를 대체하지 않습니다.
          </p>
        </div>
        <nav style={{ display: "flex", gap: 18, fontSize: "0.85rem" }} aria-label="푸터 메뉴">
          <Link to="/terms" className="chalk-navlink">이용약관</Link>
          <Link to="/privacy" className="chalk-navlink">개인정보</Link>
          <Link to="/refund" className="chalk-navlink">환불정책</Link>
        </nav>
      </div>
    </footer>
  );
}
