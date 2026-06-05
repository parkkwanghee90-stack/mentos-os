import { Bot, ClipboardList, Activity, CheckCircle2, BarChart3, ArrowRight, MessageCircle } from "lucide-react";

const FLOW = [
  { icon: ClipboardList, t: "숙제 부여" },
  { icon: Activity, t: "학습 진행" },
  { icon: CheckCircle2, t: "제출 완료" },
  { icon: BarChart3, t: "리포트 발송" },
];

export default function LandingTutorAlert() {
  return (
    <section id="report" className="hv-section hv-light-2 hv-tutor">
      <div className="hv-wrap hv-tutor-grid">
        {/* 좌: AI 튜터 */}
        <div className="hv-tutor-col">
          <h3 className="hv-tutor-h">AI 튜터가 24시간 함께합니다</h3>
          <div className="hv-tutor-chat">
            <span className="hv-robot" aria-hidden="true"><Bot size={30} /></span>
            <div className="hv-bubbles">
              <span className="hv-bubble hv-bubble--ai">오늘의 학습 목표를 달성해볼까요?</span>
              <span className="hv-bubble hv-bubble--me">이차함수 그래프의 꼭짓점이 무엇인지 모르겠어요.</span>
              <span className="hv-bubble hv-bubble--ai">AVS로 꼭짓점을 시각화해볼까요?</span>
            </div>
          </div>
        </div>

        {/* 중: 폰 목업 */}
        <div className="hv-tutor-phone-wrap">
          <div className="hv-phone">
            <span className="hv-phone-notch" />
            <div className="hv-phone-screen">
              <div className="hv-phone-time">9:41</div>
              <div className="hv-phone-date">6월 4일 화요일</div>
              <div className="hv-noti">
                <b>MathMentos</b>
                <p>오늘의 숙제가 도착했어요 📘 함수 단원 81% / 학습유형 코칭</p>
              </div>
              <div className="hv-noti">
                <b>MathMentos</b>
                <p>이번 주 학습 리포트가 도착했어요. 꾸준히 성장 중이에요!</p>
              </div>
            </div>
          </div>
        </div>

        {/* 우: 학부모 알림 */}
        <div className="hv-tutor-col">
          <h3 className="hv-tutor-h">학부모님께 실시간 알림!</h3>
          <div className="hv-flow">
            {FLOW.map(({ icon: Icon, t }, i) => (
              <div className="hv-flow-item" key={t}>
                <span className="hv-flow-ic"><Icon size={22} /></span>
                <span className="hv-flow-t">{t}</span>
                {i < FLOW.length - 1 && <ArrowRight className="hv-flow-arrow" size={16} />}
              </div>
            ))}
          </div>
          <div className="hv-kakao">
            <span className="hv-kakao-ic"><MessageCircle size={16} /></span>
            카카오톡으로 실시간 리포트를 받아보세요.
          </div>
        </div>
      </div>
    </section>
  );
}
