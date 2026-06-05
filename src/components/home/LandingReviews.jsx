import { Star } from "lucide-react";

const REVIEWS = [
  { q: "AVS 덕분에 어려운 개념도 눈에 쏙 들어와요!", a: "고2 학생" },
  { q: "아이 공부 습관이 완전히 바뀌었어요.", a: "고2 학부모" },
  { q: "취약점을 정확히 알려줘서 성적이 올랐어요!", a: "고1 학생" },
  { q: "리포트를 매일 받아보니 안심이 됩니다.", a: "고3 학부모" },
];

function Stars() {
  return (
    <span className="hv-stars" aria-label="별점 5점">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
    </span>
  );
}

export default function LandingReviews() {
  return (
    <section id="reviews" className="hv-section hv-dark hv-reviews">
      <div className="hv-wrap hv-reviews-grid">
        <h2 className="hv-h2 hv-reviews-title">학생과 학부모들의<br />실제 후기</h2>
        <div className="hv-reviews-list">
          {REVIEWS.map((r) => (
            <article key={r.a + r.q} className="hv-review">
              <Stars />
              <p className="hv-review-q">{r.q}</p>
              <span className="hv-review-a">- {r.a}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
