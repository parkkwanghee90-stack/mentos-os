// 🎉 1개월 전면무료 프로모 배너 — 사용자 확보용. 프로모 종료 시 자동으로 사라진다.
import { useNavigate } from "react-router-dom";
import { isPromoFree, promoDaysLeft } from "@/lib/promo";

export default function PromoBanner() {
  const navigate = useNavigate();
  if (!isPromoFree()) return null;

  const daysLeft = promoDaysLeft();

  return (
    <button
      type="button"
      onClick={() => navigate("/grade-select")}
      style={{
        width: "100%",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        flexWrap: "wrap",
        padding: "0.85rem 1rem",
        background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 55%, #10b981 100%)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        fontWeight: 800,
        fontSize: "0.98rem",
        letterSpacing: "-0.2px",
        boxShadow: "0 6px 24px rgba(124, 58, 237, 0.35)",
        position: "relative",
        zIndex: 50,
      }}
    >
      <span style={{ fontSize: "1.15rem" }}>🎉</span>
      <span>
        지금 <b style={{ textDecorationLine: "underline" }}>전 콘텐츠 1개월 무료</b> 개방 중 — 내신·모의고사·AI 강의·AVS 전부 0원
      </span>
      <span
        style={{
          background: "rgba(255,255,255,0.22)",
          borderRadius: "999px",
          padding: "0.15rem 0.7rem",
          fontSize: "0.82rem",
          fontWeight: 700,
        }}
      >
        무료 시작하기 →
      </span>
      {daysLeft > 0 && (
        <span style={{ fontSize: "0.78rem", opacity: 0.85, fontWeight: 600 }}>
          (D-{daysLeft})
        </span>
      )}
    </button>
  );
}
