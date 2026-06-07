import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "오픈 이벤트",
    event: true,
    priceLabel: "1개월 무료",
    sub: "선착순 100명 한정 · 첫 달 0원",
    badge: "🎉 선착순 100명",
    features: [
      "프리미엄 전 기능 1개월 무료",
      "사고력 AVS 해설 무제한",
      "AI 취약점 진단 리포트",
      "카드 등록 없이 바로 시작",
    ],
    cta: "지금 무료로 시작",
  },
  {
    name: "프리미엄",
    price: "19,800",
    popular: true,
    features: [
      "무제한 문제 풀이",
      "사고력 AVS 시각화 해설",
      "AI 취약점 진단 리포트",
      "학부모 카톡 리포트",
      "개념·해설 강의 제공",
    ],
    cta: "무료 체험",
  },
  {
    name: "수능완성",
    price: "29,800",
    features: [
      "프리미엄 모든 기능",
      "모의고사·내신 대비",
      "1:1 AI 튜터",
      "전국 상위 % 실력 리포트",
      "개인별 맞춤 커리큘럼",
    ],
    cta: "무료 체험",
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="hv-section hv-dark hv-pricing">
      <div className="hv-wrap hv-pricing-grid">
        <div className="hv-pricing-intro">
          <h2 className="hv-h2">지금 매쓰멘토스를<br />시작하세요!</h2>
          <p className="hv-sub">AI가 선생님처럼, 성적이 달라집니다.</p>
          <Link to="/login" className="hv-btn hv-btn-primary hv-btn-lg">지금 무료로 시작하기 <ArrowRight size={18} /></Link>
          <p className="hv-pricing-note">· 오픈 이벤트: 선착순 100명 첫 1개월 무료 / 카드 등록 없이 이용 가능</p>
        </div>

        <div className="hv-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`hv-plan ${p.popular ? "is-popular" : ""} ${p.event ? "is-event" : ""}`}>
              {p.event && <span className="hv-plan-badge is-event">{p.badge}</span>}
              {p.popular && <span className="hv-plan-badge">인기</span>}
              <span className="hv-plan-name">{p.name}</span>
              <div className="hv-plan-price">
                {p.event ? (
                  <b>{p.priceLabel}</b>
                ) : (
                  <><em>월</em> <b>{p.price}</b>원</>
                )}
              </div>
              {p.sub && <p className="hv-plan-sub">{p.sub}</p>}
              <ul className="hv-plan-features">
                {p.features.map((f) => (
                  <li key={f}><Check size={15} /> {f}</li>
                ))}
              </ul>
              <Link to="/login" className={`hv-btn ${p.event || p.popular ? "hv-btn-primary" : "hv-btn-ghost"} hv-btn-block`}>{p.cta}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
