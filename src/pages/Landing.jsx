// 매쓰멘토스 랜딩 V4 — 다크테크 (네이비 + 바이올렛)
import "@/styles/home.css";
import LandingNav from "@/components/home/LandingNav";
import PromoBanner from "@/components/home/PromoBanner";
import LandingHero from "@/components/home/LandingHero";
import LandingJourney from "@/components/home/LandingJourney";
import LandingCompare from "@/components/home/LandingCompare";
import LandingShowcase from "@/components/home/LandingShowcase";
import LandingTutorAlert from "@/components/home/LandingTutorAlert";
import LandingPricing from "@/components/home/LandingPricing";
import LandingReviews from "@/components/home/LandingReviews";
import LandingFooter from "@/components/home/LandingFooter";

export default function Landing() {
  return (
    <div className="home-v4">
      <LandingNav />
      <PromoBanner />
      <main>
        <LandingHero />
        <LandingJourney />
        <LandingCompare />
        <LandingShowcase />
        <LandingTutorAlert />
        <LandingPricing />
        <LandingReviews />
      </main>
      <LandingFooter />
    </div>
  );
}
