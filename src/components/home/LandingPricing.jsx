import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import PaymentCheckoutModal from "@/components/PaymentCheckoutModal";

// 런칭 선착순 단계별 월 가격 — "AI 1:1 과외" 프리미엄 포지셔닝.
const PLANS = [
  {
    name: "오픈 이벤트",
    event: true, // 무료 가입 → /login
    priceLabel: "1개월 무료",
    sub: "선착순 100명 한정 · 첫 달 0원",
    badge: "🎉 선착순 100명",
    features: PREMIUM_FEATURES(),
    cta: "지금 무료로 시작",
  },
  {
    name: "얼리버드",
    planKey: "early",
    price: "49,000",
    original: "89,000",
    popular: true,
    sub: "선착순 1,000명 한정 · 마감 시 정가 월 89,000원",
    badge: "선착순 1,000명",
    features: PREMIUM_FEATURES(),
    cta: "얼리버드 신청",
  },
  {
    name: "정규 멤버십",
    planKey: "regular",
    price: "89,000",
    sub: "학원·과외의 1/3 가격, AI 1:1 과외",
    features: PREMIUM_FEATURES(),
    cta: "시작하기",
  },
];

// 장기 이용권 (정가 월 89,000 기준 할인)
const DURATION = [
  { name: "6개월 이용권", planKey: "m6", perMonth: "62,300", total: "373,800", off: "30%" },
  { name: "1년 이용권", planKey: "y1", perMonth: "53,400", total: "640,800", off: "40%", best: true },
  { name: "평생 이용권", planKey: "lifetime", total: "1,800,000", note: "한 번 결제로 평생 이용", badge: "선착순 100명 한정" },
];

function PREMIUM_FEATURES() {
  return [
    "사고력 AVS 시각화 해설 무제한",
    "AI 취약점 진단 · 전국 상위 % 리포트",
    "무제한 문제 · 모의고사 · 내신 대비",
    "1:1 AI 튜터 (24시간 질문)",
    "학부모 카톡 리포트",
    "개인별 맞춤 커리큘럼",
  ];
}

export default function LandingPricing() {
  const navigate = useNavigate();
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const choose = (plan) => {
    if (!plan) { navigate("/login"); return; } // 오픈이벤트(무료) → 가입
    setCheckoutPlan(plan);
  };

  return (
    <section id="pricing" className="hv-section hv-dark hv-pricing">
      <div className="hv-wrap hv-pricing-grid">
        <div className="hv-pricing-intro">
          <span className="hv-pricing-eyebrow">AI 1:1 과외</span>
          <h2 className="hv-h2">학원·과외보다 똑똑하게,<br />매쓰멘토스 AI 과외</h2>
          <p className="hv-sub">사고력 AVS로 직접 가르치는 AI 1:1 과외.<br />학원 월 20~40만 · 과외 회당 5~10만 → 매쓰멘토스 <b>월 89,000원</b>.</p>
          <button type="button" onClick={() => navigate("/login")} className="hv-btn hv-btn-primary hv-btn-lg">지금 무료로 시작하기 <ArrowRight size={18} /></button>
          <p className="hv-guarantee"><ShieldCheck size={16} /> 1개월 안에 성적 변화 없으면 <b>100% 환불 보장</b></p>
          <p className="hv-pricing-note">· 선착순 100명 첫 1개월 무료 → 1,000명 얼리버드 월 49,000원 → 이후 정가 월 89,000원</p>
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
              <button type="button" onClick={() => choose(p.planKey)} className={`hv-btn ${p.event || p.popular ? "hv-btn-primary" : "hv-btn-ghost"} hv-btn-block`}>{p.cta}</button>
            </article>
          ))}
        </div>

        {/* 장기 이용권 — 더 큰 할인 */}
        <div className="hv-duration">
          <h3 className="hv-duration-title">장기 이용권 · 더 큰 할인</h3>
          <div className="hv-duration-grid">
            {DURATION.map((d) => (
              <div key={d.name} className={`hv-duration-card ${d.best ? "is-best" : ""}`}>
                {(d.badge || d.best) && <span className="hv-duration-badge">{d.badge || "가장 인기"}</span>}
                <span className="hv-duration-name">{d.name}</span>
                {d.off && <span className="hv-duration-off">{d.off} 할인</span>}
                {d.perMonth ? (
                  <div className="hv-duration-price"><b>월 {d.perMonth}</b>원</div>
                ) : (
                  <div className="hv-duration-price"><b>{d.total}</b>원</div>
                )}
                <span className="hv-duration-total">{d.perMonth ? `총 ${d.total}원` : d.note}</span>
                <button type="button" onClick={() => choose(d.planKey)} className="hv-btn hv-btn-ghost hv-btn-block">선택하기</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {checkoutPlan && <PaymentCheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />}
    </section>
  );
}
