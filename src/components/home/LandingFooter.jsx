import { Link } from "react-router-dom";

export default function LandingFooter() {
  return (
    <footer className="hv-footer">
      <div className="hv-wrap hv-footer-inner">
        <div className="hv-footer-brand">
          <span className="hv-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M4 19V6l5 7 5-7v13" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 12l4 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <strong>MATHMENTOS</strong>
            <p>수학을 외우지 말고, 이해하세요.</p>
          </div>
        </div>

        <nav className="hv-footer-links" aria-label="푸터 메뉴">
          <a href="#about">매쓰멘토스는?</a>
          <a href="#avs">AVS 풀이</a>
          <a href="#pricing">가격</a>
          <Link to="/login">로그인</Link>
        </nav>
      </div>
      <div className="hv-wrap hv-footer-copy">
        © 2026 MATHMENTOS. All rights reserved.
      </div>
    </footer>
  );
}
