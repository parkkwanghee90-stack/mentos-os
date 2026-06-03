// 다크 섹션 하단 분필 트레이 + 컬러 분필 3색
export default function ChalkTray() {
  return (
    <>
      <div className="chalk-tray" aria-hidden="true" />
      <span className="chalk-chip" style={{ left: 40, width: 40, background: "var(--mint)" }} aria-hidden="true" />
      <span className="chalk-chip" style={{ left: 90, width: 30, background: "var(--yellow)" }} aria-hidden="true" />
      <span className="chalk-chip" style={{ left: 130, width: 30, background: "var(--coral)" }} aria-hidden="true" />
    </>
  );
}
