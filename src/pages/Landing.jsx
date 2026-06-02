// 매스멘토스 홈 V3 — 칠판 다크테크
import "@/styles/chalkboard.css";
import ChalkHeader from "@/components/home/ChalkHeader";
import Hero from "@/components/home/Hero";
import Empathy from "@/components/home/Empathy";
import HowItWorks from "@/components/home/HowItWorks";

export default function Landing() {
  return (
    <div className="chalk-root" style={{ minHeight: "100vh", width: "100%", overflowX: "hidden", background: "var(--bb)" }}>
      <a href="#main" className="chalk-skip">본문 바로가기</a>
      <ChalkHeader />
      <main id="main">
        <Hero />
        <Empathy />
        <HowItWorks />
      </main>
    </div>
  );
}
