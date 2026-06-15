/* 섹션 — 학교별 기출 분석 & 예상문제 (실제 학교 분석 포스터) */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SCHOOLS = [
  { img: "/school_exam/nakdong.webp",    name: "낙동고",   tag: "기출 분석" },
  { img: "/school_exam/geummyeong.webp", name: "금명여고", tag: "기출 분석" },
  { img: "/school_exam/hwamyeong.webp",  name: "화명고",   tag: "기출 분석" },
  { img: "/school_exam/jamsin.webp",     name: "잠신고",   tag: "예상문제 10선" },
  { img: "/school_exam/pungsan.webp",    name: "풍산고",   tag: "예상문제 10선" },
];

export default function LandingShowcase() {
  return (
    <section id="schools" className="hv-section hv-dark hv-schools">
      <div className="hv-wrap">
        <span className="hv-schools-badge">
          전국 <b>200여 개 학교</b> 예상문제를 분석하여 <em>UPGRADE</em>
        </span>
        <h2 className="hv-h2 hv-h2-center">학교별 기출 분석 &amp; 예상문제</h2>
        <p className="hv-sub hv-sub-center">
          우리 학교 시험을 분석해 출제 경향과 1등급 전략,<br />
          그리고 적중 예상문제까지 제공합니다.
        </p>

        <div className="hv-schools-grid">
          {SCHOOLS.map((s) => (
            <article key={s.name} className="hv-school-card">
              <a className="hv-school-imgwrap" href={s.img} target="_blank" rel="noreferrer">
                <img src={s.img} alt={`${s.name} 기출 분석`} loading="lazy" />
                <span className="hv-school-tag">{s.tag}</span>
              </a>
              <div className="hv-school-foot">
                <b>{s.name}</b>
                <span>2025 · 고1 1학기 기말 · 수학</span>
              </div>
            </article>
          ))}
        </div>

        <div className="hv-schools-cta">
          <Link to="/grade-select" className="hv-btn hv-btn-primary hv-btn-lg">
            우리 학교 분석 받기 <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <style>{SCHOOLS_CSS}</style>
    </section>
  );
}

const SCHOOLS_CSS = `
.hv-schools-badge{display:block;width:fit-content;margin:0 auto 14px;font-size:13px;font-weight:700;
  color:#c4b5fd;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);
  padding:6px 16px;border-radius:999px;text-align:center;}
.hv-schools-badge b{color:#fff;font-weight:900;}
.hv-schools-badge em{color:#a78bfa;font-style:normal;font-weight:900;letter-spacing:0.5px;}
.hv-schools .hv-sub-center{text-align:center;margin:10px auto 0;max-width:560px;}
.hv-schools-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:30px;}
.hv-school-card{background:rgba(255,255,255,0.03);border:1px solid rgba(148,163,184,0.16);
  border-radius:16px;overflow:hidden;transition:.2s;}
.hv-school-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,0.4);
  box-shadow:0 16px 40px -16px rgba(0,0,0,.6);}
.hv-school-imgwrap{position:relative;display:block;height:232px;overflow:hidden;background:#0b1020;}
.hv-school-imgwrap img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;transition:.4s;}
.hv-school-card:hover .hv-school-imgwrap img{transform:scale(1.04);}
.hv-school-tag{position:absolute;top:8px;left:8px;font-size:11px;font-weight:800;color:#fff;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:3px 9px;border-radius:999px;}
.hv-school-foot{padding:11px 13px;display:flex;flex-direction:column;gap:2px;}
.hv-school-foot b{color:#e2e8f0;font-size:15px;font-weight:800;}
.hv-school-foot span{color:#94a3b8;font-size:12px;}
.hv-schools-cta{text-align:center;margin-top:30px;}
@media(max-width:600px){.hv-school-imgwrap{height:300px;}}
`;
