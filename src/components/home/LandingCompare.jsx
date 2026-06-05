import { X, Check, FileText, BookOpen, RefreshCw, BrainCircuit, PlayCircle, Target, CalendarCheck, BarChart3 } from "lucide-react";

const OLD = [
  { icon: FileText, t: "정답만 알려줌", d: "왜 그런지 이해하지 못해요." },
  { icon: BookOpen, t: "풀이만 보여줌", d: "스스로 생각하는 힘이 생기지 않아요." },
  { icon: RefreshCw, t: "문제만 반복", d: "내 취약점을 정확히 파악하지 못해요." },
];

const NEW = [
  { icon: BrainCircuit, t: "사고과정 분석", d: "AI가 풀이과정을 분석해 사고의 흐름을 따라가요." },
  { icon: PlayCircle, t: "AVS 시각화", d: "애니메이션으로 개념을 눈으로 이해해요." },
  { icon: Target, t: "AI 취약점 진단", d: "개인별 취약유형을 정확히 짚어줘요." },
  { icon: CalendarCheck, t: "숙제 자동 관리", d: "숙제 확인부터 제출까지 자동으로 관리해요." },
  { icon: BarChart3, t: "학부모 리포트", d: "실시간 학습 리포트를 카톡으로 받아보세요." },
];

export default function LandingCompare() {
  return (
    <section id="about" className="hv-section hv-light hv-compare">
      <div className="hv-wrap">
        <h2 className="hv-h2 hv-h2-center">
          다른 서비스와 <span className="hv-accent-v">무엇이 다를까요?</span>
        </h2>

        <div className="hv-compare-grid">
          <div className="hv-compare-col">
            <span className="hv-compare-label hv-compare-label--old">기존 방식</span>
            <div className="hv-compare-cards">
              {OLD.map(({ icon: Icon, t, d }) => (
                <article key={t} className="hv-ccard hv-ccard--old">
                  <span className="hv-ccard-mark hv-ccard-mark--x"><X size={15} /></span>
                  <span className="hv-ccard-ic"><Icon size={22} /></span>
                  <b className="hv-ccard-t">{t}</b>
                  <p className="hv-ccard-d">{d}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="hv-compare-vs"><span>VS</span></div>

          <div className="hv-compare-col">
            <span className="hv-compare-label hv-compare-label--new">매쓰멘토스는 다릅니다</span>
            <div className="hv-compare-cards hv-compare-cards--new">
              {NEW.map(({ icon: Icon, t, d }) => (
                <article key={t} className="hv-ccard hv-ccard--new">
                  <span className="hv-ccard-mark hv-ccard-mark--ok"><Check size={15} /></span>
                  <span className="hv-ccard-ic hv-ccard-ic--ok"><Icon size={22} /></span>
                  <b className="hv-ccard-t">{t}</b>
                  <p className="hv-ccard-d">{d}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
