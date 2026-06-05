import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "베이직", price: "19,800", popular: false,
    features: ["AI 문제 풀이", "AVS 시각화 풀이", "기본 학습 리포트", "숙제 관리"],
  },
  {
    name: "프리미엄", price: "29,800", popular: true,
    features: ["베이직 모든 기능", "AI 취약점 진단", "심화 문제 제공", "학부모 리포트 (카톡)"],
  },
  {
    name: "플래티넘", price: "39,800", popular: false,
    features: ["프리미엄 모든 기능", "1:1 AI 튜터", "모의고사 & 내신 대비", "개인별 맞춤 커리큘럼"],
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="hv-section hv-dark hv-pricing">
      <div className="hv-wrap hv-pricing-grid">
        <div className="hv-pricing-intro">
          <h2 className="hv-h2">지금 매쓰멘토스를<br />시작하세요!</h2>
          <p className="hv-sub">AI가 선생님처럼, 성적이 달라집니다.</p>
          <Link to="/login" className="hv-btn hv-btn-primary hv-btn-lg">무료 체험 시작하기 <ArrowRight size={18} /></Link>
          <p className="hv-pricing-note">· 7일 무료 체험 / 카드 등록 없이 이용 가능</p>
        </div>

        <div className="hv-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`hv-plan ${p.popular ? "is-popular" : ""}`}>
              {p.popular && <span className="hv-plan-badge">인기</span>}
              <span className="hv-plan-name">{p.name}</span>
              <div className="hv-plan-price"><em>월</em> <b>{p.price}</b>원</div>
              <ul className="hv-plan-features">
                {p.features.map((f) => (
                  <li key={f}><Check size={15} /> {f}</li>
                ))}
              </ul>
              <Link to="/login" className={`hv-btn ${p.popular ? "hv-btn-primary" : "hv-btn-ghost"} hv-btn-block`}>무료 체험</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
