/* 섹션4 — 실제 제품 화면 3카드 (다크) */

function CardFrame({ title, children }) {
  return (
    <article className="hv-shot">
      <div className="hv-shot-head">{title}</div>
      <div className="hv-shot-body">{children}</div>
    </article>
  );
}

function Parabola({ stroke = "#34d399" }) {
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <line x1="14" y1="104" x2="190" y2="104" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
      <line x1="100" y1="10" x2="100" y2="112" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
      <path d="M28 16 Q100 168 172 16" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="100" cy="92" r="4" fill={stroke} />
    </svg>
  );
}

export default function LandingShowcase() {
  return (
    <section id="avs" className="hv-section hv-dark hv-showcase">
      <div className="hv-wrap">
        <h2 className="hv-h2 hv-h2-center">실제 매쓰멘토스 화면을 확인해보세요</h2>

        <div className="hv-showcase-grid">
          <CardFrame title="AI 문제 & 풀이 입력">
            <div className="hv-mini hv-mini--input">
              <span className="hv-mini-tag">중1 수학</span>
              <p className="hv-mini-q">다음 등식을 만족시키는 정수 m의 값을 구하시오.</p>
              <div className="hv-mini-eq">x² − 2x + 1 = (x + m)²</div>
              <div className="hv-mini-keys">
                {["x²", "√", "÷", "≤", "π", "( )", "±", "∞"].map((k) => <span key={k}>{k}</span>)}
              </div>
              <div className="hv-mini-actions">
                <span className="hv-mini-btn ghost">식 작성</span>
                <span className="hv-mini-btn solid">제출하기</span>
              </div>
            </div>
          </CardFrame>

          <CardFrame title="AVS (시각화 풀이)">
            <div className="hv-mini hv-mini--avs">
              <div className="hv-mini-avs-top">
                <div className="hv-mini-steps">
                  {["1단계 분석", "2단계 변형", "3단계 계산", "4단계 확인"].map((s, i) => (
                    <span key={s} className={i === 3 ? "is-on" : ""}>{s}</span>
                  ))}
                </div>
                <div className="hv-mini-graph"><Parabola /></div>
              </div>
              <div className="hv-mini-point">
                <span className="hv-mini-point-title">AI 학습 포인트</span>
                <p>y = x² − 4x + 3<br />y = (x − 2)² − 1</p>
                <p className="soft">꼭짓점을 구해보세요.<br />꼭짓점은 (2, −1) 입니다.</p>
              </div>
            </div>
          </CardFrame>

          <CardFrame title="학부모 리포트">
            <div className="hv-mini hv-mini--report">
              <div className="hv-mini-report-head">
                <span>주간 학습 리포트</span>
                <em>4월 21일 ~ 4월 27일</em>
              </div>
              <div className="hv-mini-report-cols">
                {[["1회차","80%"],["3회차","60%"],["5회차","85%"],["7회차","30%"]].map(([a,b]) => (
                  <div key={a} className="hv-mini-rcol"><span style={{ height: b }} /><em>{a}</em></div>
                ))}
              </div>
              <div className="hv-mini-report-foot">
                <span className="hv-mini-ring">85%</span>
                <ul>
                  <li>취약 단원 TOP 3</li>
                  <li className="dot r">이차방정식의 활용</li>
                  <li className="dot o">함수의 그래프 해석</li>
                  <li className="dot g">소인수분해 응용</li>
                </ul>
              </div>
            </div>
          </CardFrame>
        </div>
      </div>
    </section>
  );
}
