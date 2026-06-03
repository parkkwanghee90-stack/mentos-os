import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "작동 방식", href: "#how" },
  { label: "AI 데모", href: "#demo" },
  { label: "학부모", href: "#parents" },
  { label: "요금", href: "#pricing" },
];

export default function ChalkHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="chalk-header">
      <div className="chalk-header-inner">
        <Link to="/" className="chalk-brand" aria-label="매스멘토스 홈"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg,#10b981,#059669)", color: "#ffffff", fontWeight: 800, fontFamily: "var(--mono)" }}>ƒ</span>
          <span style={{ color: "var(--title-on-dark)", fontWeight: 800, fontSize: "1.15rem" }}>매스멘토스</span>
        </Link>

        <nav aria-label="메인 메뉴" style={{ display: "none", gap: 28, alignItems: "center" }} className="chalk-nav-desktop">
          {NAV.map((n) => (<a key={n.href} href={n.href} className="chalk-navlink">{n.label}</a>))}
          <Link to="/login" className="chalk-btn" style={{ padding: "0.55rem 1.1rem", fontSize: "0.9rem" }}>무료로 시작</Link>
        </nav>

        <button className="chalk-burger" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ display: "flex", background: "rgba(16,185,129,0.12)", border: "none", borderRadius: 10,
            width: 40, height: 40, alignItems: "center", justifyContent: "center", color: "var(--mint-deep)", cursor: "pointer" }}>
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--bb-line)", padding: "0.5rem 1.5rem 1.25rem" }}>
          <nav aria-label="모바일 메뉴" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="chalk-navlink" style={{ padding: "0.75rem 0" }}
                onClick={() => setOpen(false)}>{n.label}</a>
            ))}
            <Link to="/login" className="chalk-btn" style={{ marginTop: 12, justifyContent: "center" }}
              onClick={() => setOpen(false)}>무료로 시작</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
