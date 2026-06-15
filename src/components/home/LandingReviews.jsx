import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const SEED_REVIEWS = [
  { content: "AVS 덕분에 어려운 개념도 눈에 쏙 들어와요!", name: "고2 학생", rating: 5 },
  { content: "아이 공부 습관이 완전히 바뀌었어요.", name: "고2 학부모", rating: 5 },
  { content: "취약점을 정확히 알려줘서 성적이 올랐어요!", name: "고1 학생", rating: 5 },
  { content: "리포트를 매일 받아보니 안심이 됩니다.", name: "고3 학부모", rating: 5 },
];

function Stars({ n = 5 }) {
  return (
    <span className="hv-stars" aria-label={`별점 ${n}점`}>
      {Array.from({ length: n }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
    </span>
  );
}

export default function LandingReviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);

  const load = async () => {
    try {
      const { data } = await supabase
        .from("reviews")
        .select("name,role,rating,content")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(30);
      setReviews(data || []);
    } catch { /* 실패 시 시드 후기만 표시 */ }
  };
  useEffect(() => { load(); }, []);

  // 리뷰 작성은 "로그인 후 대시보드 하단 후기란"에서만 가능.
  // 대문에서 바로 작성하지 않고, 로그인 → 대시보드 후기 섹션으로 안내한다.
  const goWrite = () => {
    sessionStorage.setItem("mentos_pending_review", "1");
    if (user) {
      navigate("/dashboard");
    } else {
      alert("리뷰는 로그인 후 작성할 수 있어요. 로그인하면 대시보드 하단 후기 작성란으로 안내해 드릴게요.");
      navigate("/login", { state: { from: { pathname: "/dashboard" } } });
    }
  };

  const all = [...reviews, ...SEED_REVIEWS];

  return (
    <section id="reviews" className="hv-section hv-dark hv-reviews">
      <div className="hv-wrap hv-reviews-grid">
        <h2 className="hv-h2 hv-reviews-title">학생과 학부모들의<br />실제 후기</h2>
        <button type="button" className="hv-btn hv-btn-primary hv-review-write-btn" onClick={goWrite}>✍️ 리뷰 작성하기</button>
        <div className="hv-reviews-list">
          {all.map((r, i) => (
            <article key={i} className="hv-review">
              <Stars n={r.rating || 5} />
              <p className="hv-review-q">{r.content}</p>
              <span className="hv-review-a">- {r.name}{r.role && r.role !== r.name ? ` · ${r.role}` : ""}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
