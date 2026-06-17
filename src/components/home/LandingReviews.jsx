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
  { content: "처음엔 반신반의했는데 음성 설명을 들으니 진짜 옆에서 과외받는 느낌이에요.", name: "고2 학생", rating: 5 },
  { content: "수열 단원이 약했는데 취약유형만 골라 풀어줘서 한 달 만에 2등급 됐어요.", name: "고1 학생", rating: 5 },
  { content: "아이가 밤마다 스스로 켜서 복습해요. 학원 쉬는 날도 든든합니다.", name: "고2 학부모", rating: 5 },
  { content: "학교 시험에 예상문제랑 비슷한 게 실제로 나와서 깜짝 놀랐어요.", name: "고2 학생", rating: 5 },
  { content: "등하교 길에 음성 풀이 들으면서 자투리 시간까지 공부하게 돼요.", name: "고3 학생", rating: 5 },
  { content: "숙제 했는지 카톡으로 알려줘서 매번 확인 안 해도 돼 편해요.", name: "고1 학부모", rating: 5 },
  { content: "답만 알려주는 앱과 달라요. 왜 그렇게 푸는지 흐름을 알려줘서 응용이 돼요.", name: "고2 학생", rating: 5 },
  { content: "1타강사 풀이 순서를 그대로 따라가니 어려운 문제도 손이 가요.", name: "고3 학생", rating: 5 },
  { content: "리포트로 우리 애가 어디서 막히는지 정확히 보여서 든든해요.", name: "고1 학부모", rating: 5 },
  { content: "혼자 인강은 늘 중간에 포기했는데 한 문제씩 끊어줘서 끝까지 가요.", name: "고2 학생", rating: 4 },
  { content: "도형 문제를 글로만 보면 막막했는데 애니메이션으로 보니 바로 이해돼요.", name: "고1 학생", rating: 5 },
  { content: "수학을 싫어하던 아이가 이건 재밌다고 해서 놀랐습니다.", name: "중3 학부모", rating: 5 },
  { content: "내신 대비 기간에 예상문제 3회분 돌리니까 시험이 익숙했어요.", name: "고2 학생", rating: 5 },
  { content: "개념-원리-풀이 단계로 나눠줘서 머릿속이 정리돼요.", name: "고1 학생", rating: 5 },
  { content: "과외비 부담이 컸는데 이 가격에 이 정도면 진짜 가성비 최고예요.", name: "고2 학부모", rating: 5 },
  { content: "오답노트가 자동으로 쌓여서 시험 전에 약점만 빠르게 복습했어요.", name: "고3 학생", rating: 5 },
  { content: "음성 톤이 졸리지 않고 또박또박해서 집중이 잘돼요.", name: "고1 학생", rating: 5 },
  { content: "삼각함수가 제일 약했는데 단계별로 짚어주니 모의고사 점수가 올랐어요.", name: "고3 학생", rating: 5 },
  { content: "맞벌이라 챙기기 어려운데 학습 리포트 덕에 한눈에 파악돼요.", name: "고2 학부모", rating: 5 },
  { content: "틀린 문제를 그냥 넘기지 않고 다시 풀게 해줘서 실수가 줄었어요.", name: "고1 학생", rating: 4 },
  { content: "학원 진도랑 같이 돌리니까 복습 효율이 두 배가 됐어요.", name: "고2 학생", rating: 5 },
  { content: "우리 학교 출제 경향 분석이 정확해서 뭘 공부할지 명확해졌어요.", name: "고1 학생", rating: 5 },
  { content: "24시간 언제든 물어볼 수 있으니 밤에 막혀도 든든해요.", name: "고3 학생", rating: 5 },
  { content: "성적표만 보던 제가 이제 아이 공부 과정을 다 봐서 대화가 늘었어요.", name: "고1 학부모", rating: 5 },
  { content: "기말 2주 전부터 예상문제 풀었더니 처음으로 100점 받았어요!", name: "고2 학생", rating: 5 },
  { content: "설명이 친절하고 군더더기가 없어서 이해가 빨라요.", name: "고1 학생", rating: 5 },
  { content: "수포자였던 애가 다시 수학책을 펴는 게 신기합니다.", name: "고2 학부모", rating: 5 },
  { content: "확률과 통계 개념이 늘 헷갈렸는데 시각화로 한 번에 잡혔어요.", name: "고3 학생", rating: 5 },
  { content: "숙제 제출까지 한 곳에서 되니까 따로 관리할 게 없어 편해요.", name: "고1 학부모", rating: 5 },
  { content: "직접 과외받는 것처럼 풀이를 들려주는 게 이 앱의 진짜 강점이에요.", name: "고2 학생", rating: 5 },
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
