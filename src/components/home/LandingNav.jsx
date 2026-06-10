import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "매쓰멘토스는?", href: "#about" },
  { label: "AVS 풀이", href: "#avs" },
  { label: "AI 분석", href: "#showcase" },
  { label: "학부모 리포트", href: "#report" },
  { label: "가격", href: "#pricing" },
  { label: "커뮤니티", href: "#reviews" },
];

function Logo() {
  return (
    <a href="#top" className="hv-logo" aria-label="매쓰멘토스 홈">
      <span className="hv-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M4 19V6l5 7 5-7v13" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 12l4 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="hv-logo-text">
        <strong>매쓰멘토스</strong>
        <em>MATHMENTOS</em>
      </span>
    </a>
  );
}

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`hv-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="hv-wrap hv-nav-inner">
        <Logo />

        <nav className="hv-nav-menu" aria-label="주요 메뉴">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hv-nav-link">{n.label}</a>
          ))}
        </nav>

        <div className="hv-nav-cta">
          <Link to="/login" className="hv-btn hv-btn-ghost hv-nav-login">로그인</Link>
          <Link to="/login" className="hv-btn hv-btn-primary">무료 체험 시작</Link>
        </div>

        <button
          className="hv-nav-burger"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="hv-nav-drawer" onClick={() => setOpen(false)}>
          <div className="hv-nav-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hv-nav-drawer-link" onClick={() => setOpen(false)}>
                {n.label}
              </a>
            ))}
            <div className="hv-nav-drawer-cta">
              <Link to="/login" className="hv-btn hv-btn-outline hv-btn-block" onClick={() => setOpen(false)}>로그인</Link>
              <Link to="/login" className="hv-btn hv-btn-primary hv-btn-block" onClick={() => setOpen(false)}>무료 체험 시작</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
