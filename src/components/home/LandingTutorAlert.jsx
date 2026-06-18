import { useState, useEffect, useRef } from "react";
import { MessageCircle, ClipboardList, BarChart3, BellRing } from "lucide-react";

/* 좌측 기능 요약 */
const FEATURES = [
  { icon: MessageCircle, t: "실시간 카톡 상담", d: "막힐 때 바로 질문, AI 튜터가 즉시 답해요." },
  { icon: ClipboardList, t: "자동 숙제 부여", d: "수업 내용에 맞춰 맞춤 숙제를 자동으로 내줘요." },
  { icon: BarChart3, t: "수업 후 학부모 리포트", d: "오늘 학습 내용·정답률을 카톡으로 보내드려요." },
];

/* 카톡 피드(순차 등장 → 무한 반복) */
const FEED = [
  { kind: "time", text: "오늘" },
  { kind: "ai", text: "민준님, 오늘 수업 시작할게요! 📚" },
  { kind: "ai", text: "원의 방정식 4단계, AVS로 같이 풀어볼까요?" },
  { kind: "me", text: "네 좋아요!" },
  { kind: "homework", title: "오늘의 숙제 도착", body: "원의 방정식 4단계 · 5문제", due: "오늘 21:00까지" },
  { kind: "ai", text: "수업 끝! 오늘도 정말 잘했어요 👏" },
  {
    kind: "report", title: "학부모 리포트 발송 완료",
    body: "민준이는 오늘 ‘원의 방정식’을 학습했어요.",
    stats: [["정답률", "85%"], ["집중도", "우수"], ["취약", "자취 문제"]],
  },
];

function Bubble({ item }) {
  if (item.kind === "time")
    return <div className="kt-time">{item.text}</div>;

  if (item.kind === "ai")
    return (
      <div className="kt-row ai">
        <span className="kt-ava">🤖</span>
        <div className="kt-bubble kt-ai">{item.text}</div>
      </div>
    );

  if (item.kind === "me")
    return (
      <div className="kt-row me">
        <div className="kt-bubble kt-me">{item.text}</div>
      </div>
    );

  if (item.kind === "homework")
    return (
      <div className="kt-card kt-hw">
        <div className="kt-card-h"><ClipboardList size={15} /> {item.title}</div>
        <div className="kt-hw-body">{item.body}</div>
        <span className="kt-hw-due">⏰ {item.due}</span>
      </div>
    );

  // report (학부모 푸시)
  return (
    <div className="kt-card kt-report">
      <div className="kt-card-h"><BellRing size={15} /> {item.title}</div>
      <p className="kt-report-body">{item.body}</p>
      <div className="kt-report-stats">
        {item.stats.map(([k, v]) => (
          <div key={k} className="kt-stat"><b>{v}</b><span>{k}</span></div>
        ))}
      </div>
    </div>
  );
}

export default function LandingTutorAlert() {
  const [n, setN] = useState(1); // 보이는 메시지 개수(시간구분선 포함)
  const feedRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setN((prev) => (prev >= FEED.length ? 1 : prev + 1));
    }, 1700);
    return () => clearInterval(id);
  }, []);

  // 새 메시지마다 맨 아래로 스크롤
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [n]);

  const visible = FEED.slice(0, n);

  return (
    <section id="report" className="hv-section hv-light-2 hv-tutor2">
      <div className="hv-wrap hv-tutor2-grid">
        {/* 좌: 카피 + 기능 */}
        <div className="hv-tutor2-copy">
          <h2 className="hv-h2">AI 튜터가 24시간 함께합니다</h2>
          <p className="hv-sub">
            실시간 카톡 상담부터 숙제 부여, 수업 후 학부모 리포트까지<br />
            — 진짜 선생님처럼 챙겨드립니다.
          </p>
          <ul className="hv-tutor2-feats">
            {FEATURES.map(({ icon: Icon, t, d }) => (
              <li key={t}>
                <span className="hv-tutor2-ic"><Icon size={20} /></span>
                <div><b>{t}</b><span>{d}</span></div>
              </li>
            ))}
          </ul>
        </div>

        {/* 우: 카톡 폰 목업(애니메이션) */}
        <div className="hv-tutor2-phonewrap">
          <div className="kt-phone">
            <div className="kt-head">
              <span className="kt-back">‹</span>
              <span className="kt-title">매쓰멘토스 AI 튜터</span>
              <span className="kt-menu">☰</span>
            </div>
            <div className="kt-feed" ref={feedRef}>
              {visible.map((item, i) => (
                <div className="kt-in" key={`${n}-${i}`}><Bubble item={item} /></div>
              ))}
            </div>
          </div>
          <span className="kt-live"><i /> 실시간</span>
        </div>
      </div>

      {/* 6컷 만화 — 핸드폰 애니메이션 '밑에' 풀폭 배치 (탭하면 크게) */}
      <div className="hv-wrap" style={{ textAlign: 'center', marginTop: 44 }}>
        <a href="/school_exam/weakness_comic.jpg" target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', maxWidth: 920, width: '100%' }}>
          <img
            src="/school_exam/weakness_comic.jpg"
            alt="매쓰멘토스 취약분석: 숙제 완료 → 엄마 카톡 알림 → 오늘의 취약분석 → 맞춤 보강 문제 자동 준비 → 복습으로 실력 향상"
            loading="lazy"
            style={{ width: '100%', height: 'auto', borderRadius: 16, boxShadow: '0 24px 60px -24px rgba(0,0,0,.4)', cursor: 'zoom-in', display: 'block' }}
          />
        </a>
        <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>📱 탭하면 크게 볼 수 있어요</div>
      </div>

      <style>{TUTOR2_CSS}</style>
    </section>
  );
}

const TUTOR2_CSS = `
.hv-tutor2-grid{display:grid;grid-template-columns:1fr 380px;gap:40px;align-items:center;}
.hv-tutor2-copy .hv-sub{margin-top:10px;}
.hv-tutor2-feats{list-style:none;padding:0;margin:24px 0 0;display:flex;flex-direction:column;gap:14px;}
.hv-tutor2-feats li{display:flex;gap:12px;align-items:flex-start;}
.hv-tutor2-ic{flex-shrink:0;width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;
  color:#7c3aed;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);}
.hv-tutor2-feats b{display:block;color:#0f172a;font-size:15px;font-weight:800;margin-bottom:2px;}
.hv-tutor2-feats span{color:#475569;font-size:13.5px;line-height:1.45;}

.hv-tutor2-phonewrap{position:relative;display:flex;justify-content:center;}
.kt-phone{width:330px;max-width:100%;height:560px;background:#b2c7da;border-radius:30px;
  border:10px solid #11131a;box-shadow:0 30px 60px -20px rgba(0,0,0,.5);overflow:hidden;display:flex;flex-direction:column;}
.kt-head{background:#a8bccf;display:flex;align-items:center;justify-content:space-between;
  padding:12px 14px;font-size:14px;font-weight:800;color:#1f2937;flex-shrink:0;}
.kt-back,.kt-menu{font-size:18px;color:#374151;}
.kt-feed{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:9px;scroll-behavior:smooth;}
.kt-feed::-webkit-scrollbar{width:0;}
.kt-in{animation:ktIn .35s ease;}
@keyframes ktIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.kt-time{align-self:center;font-size:11px;color:#5b6b7d;background:rgba(0,0,0,.12);padding:2px 12px;border-radius:999px;margin:2px 0;}
.kt-row{display:flex;gap:7px;align-items:flex-end;max-width:88%;}
.kt-row.ai{align-self:flex-start;}
.kt-row.me{align-self:flex-end;}
.kt-ava{width:30px;height:30px;border-radius:9px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;box-shadow:0 1px 2px rgba(0,0,0,.15);}
.kt-bubble{font-size:13px;line-height:1.45;padding:8px 11px;border-radius:13px;color:#1a1a1a;}
.kt-ai{background:#fff;border-top-left-radius:3px;}
.kt-me{background:#fae100;border-top-right-radius:3px;}
.kt-card{align-self:center;width:96%;background:#fff;border-radius:14px;padding:12px;box-shadow:0 3px 10px rgba(0,0,0,.12);}
.kt-card-h{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:#7c3aed;margin-bottom:7px;}
.kt-hw-body{font-size:14px;font-weight:700;color:#0f172a;}
.kt-hw-due{display:inline-block;margin-top:6px;font-size:11.5px;color:#dc2626;font-weight:700;}
.kt-report{border:1.5px solid rgba(124,58,237,0.25);}
.kt-report-body{font-size:13px;color:#334155;margin:0 0 9px;line-height:1.4;}
.kt-report-stats{display:flex;gap:8px;}
.kt-stat{flex:1;text-align:center;background:#f5f3ff;border-radius:9px;padding:7px 4px;}
.kt-stat b{display:block;font-size:15px;font-weight:900;color:#7c3aed;}
.kt-stat span{font-size:10.5px;color:#64748b;}
.kt-live{position:absolute;top:-6px;right:14px;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:800;
  color:#fff;background:#22c55e;padding:4px 10px;border-radius:999px;box-shadow:0 4px 12px rgba(34,197,94,.4);}
.kt-live i{width:7px;height:7px;border-radius:50%;background:#fff;animation:ktPulse 1.2s infinite;}
@keyframes ktPulse{0%,100%{opacity:.4}50%{opacity:1}}
@media(max-width:860px){
  .hv-tutor2-grid{grid-template-columns:1fr;gap:30px;}
  .hv-tutor2-phonewrap{order:-1;}
}
`;
