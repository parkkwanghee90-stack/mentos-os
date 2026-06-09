import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "학생", rating: 5, content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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

  // 리뷰 작성은 로그인 사용자만 가능.
  // 비로그인 → 로그인 후 대시보드 리뷰 섹션으로 자동 복귀(sessionStorage 플래그).
  const openWrite = () => {
    if (!user) {
      alert("리뷰는 로그인 후 작성할 수 있어요. 로그인하면 대시보드 하단 후기 작성란으로 안내해 드릴게요.");
      sessionStorage.setItem("mentos_pending_review", "1");
      navigate("/login", { state: { from: { pathname: "/dashboard" } } });
      return;
    }
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { alert("리뷰는 로그인 후 작성할 수 있습니다."); navigate("/login"); return; }
    const name = form.name.trim();
    const content = form.content.trim();
    if (!name || !content) { alert("이름과 후기 내용을 입력해 주세요."); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        name: name.slice(0, 40),
        role: form.role,
        rating: Number(form.rating),
        content: content.slice(0, 1000),
        user_id: user.id,
        approved: true,
      });
      if (error) throw error;
      setDone(true);
      setForm({ name: "", role: "학생", rating: 5, content: "" });
      load();
      setTimeout(() => { setDone(false); setOpen(false); }, 1600);
    } catch {
      alert("후기 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const all = [...reviews, ...SEED_REVIEWS];

  return (
    <section id="reviews" className="hv-section hv-dark hv-reviews">
      <div className="hv-wrap hv-reviews-grid">
        <h2 className="hv-h2 hv-reviews-title">학생과 학부모들의<br />실제 후기</h2>
        <button type="button" className="hv-btn hv-btn-primary hv-review-write-btn" onClick={openWrite}>✍️ 리뷰 작성하기</button>
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

      {open && (
        <div className="hv-review-modal" onClick={() => setOpen(false)}>
          <form className="hv-review-form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <button type="button" className="hv-review-close" onClick={() => setOpen(false)} aria-label="닫기"><X size={20} /></button>
            <h3 className="hv-review-form-title">리뷰 작성</h3>
            {done ? (
              <p className="hv-review-thanks">소중한 후기 감사합니다! 🎉</p>
            ) : (
              <>
                <input
                  className="hv-review-input"
                  placeholder="이름/닉네임 (예: 고2 김OO)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={40}
                />
                <div className="hv-review-row">
                  <select className="hv-review-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option>학생</option>
                    <option>학부모</option>
                  </select>
                  <select className="hv-review-input" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n}점</option>)}
                  </select>
                </div>
                <textarea
                  className="hv-review-input"
                  placeholder="후기를 남겨주세요 (실제 학습 경험을 적어주시면 큰 도움이 됩니다)"
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  maxLength={1000}
                />
                <button type="submit" className="hv-btn hv-btn-primary hv-btn-block" disabled={submitting}>
                  {submitting ? "등록 중..." : "후기 등록"}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </section>
  );
}
