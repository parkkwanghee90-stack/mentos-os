import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

// 런칭 선착순 단계별 가격 (프리미엄 고가 포지셔닝). 동일 프리미엄 상품, 신청 순서로 가격 결정.
const PLANS = [
  {
    name: "오픈 이벤트",
    event: true,
    priceLabel: "1개월 무료",
    sub: "선착순 100명 한정 · 첫 달 0원",
    badge: "🎉 선착순 100명",
    features: PREMIUM_FEATURES(),
    cta: "지금 무료로 시작",
  },
  {
    name: "얼리버드",
    price: "49,000",
    original: "79,000",
    popular: true,
    sub: "선착순 1,000명 한정 특가",
    badge: "선착순 1,000명",
    features: PREMIUM_FEATURES(),
    cta: "얼리버드 신청",
  },
  {
    name: "정규 멤버십",
    price: "79,000",
    sub: "선착순 마감 후 정가",
    features: PREMIUM_FEATURES(),
    cta: "시작하기",
  },
];

function PREMIUM_FEATURES() {
  return [
    "사고력 AVS 시각화 해설 무제한",
    "AI 취약점 진단 · 전국 상위 % 리포트",
    "무제한 문제 · 모의고사 · 내신 대비",
    "1:1 AI 튜터",
    "학부모 카톡 리포트",
    "개인별 맞춤 커리큘럼",
  ];
}

export default function LandingPricing() {
  return (
    <section id="pricing" className="hv-section hv-dark hv-pricing">
      <div className="hv-wrap hv-pricing-grid">
        <div className="hv-pricing-intro">
          <h2 className="hv-h2">지금 매쓰멘토스를<br />시작하세요!</h2>
          <p className="hv-sub">사고력 AVS로 진짜 실력을 만드는 프리미엄 AI 수학.</p>
          <Link to="/login" className="hv-btn hv-btn-primary hv-btn-lg">지금 무료로 시작하기 <ArrowRight size={18} /></Link>
          <p className="hv-pricing-note">· 선착순 100명 첫 1개월 무료 → 1,000명 얼리버드 월 49,000원 → 이후 정가 월 79,000원</p>
        </div>

        <div className="hv-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`hv-plan ${p.popular ? "is-popular" : ""} ${p.event ? "is-event" : ""}`}>
              {p.event && <span className="hv-plan-badge is-event">{p.badge}</span>}
              {p.popular && <span className="hv-plan-badge">{p.badge || "인기"}</span>}
              <span className="hv-plan-name">{p.name}</span>
              <div className="hv-plan-price">
                {p.event ? (
                  <b>{p.priceLabel}</b>
                ) : (
                  <>
                    {p.original && <span className="hv-plan-original">월 {p.original}원</span>}
                    <em>월</em> <b>{p.price}</b>원
                  </>
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
