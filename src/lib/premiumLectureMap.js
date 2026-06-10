// Canonical baseId resolution for premium lectures.
// Single source of truth shared by JSON fetch and audio path resolution.
// Ported from the (comprehensive) mapping previously inlined in PremiumLecturePlayer.

export function toBaseId(raw) {
  if (!raw) return raw;
  let baseId = raw;

  // --- 고등수학(상)/수학1 핵심 단원 (우선순위) ---
  if (baseId.includes('고차방정식')) baseId = '고차방정식';
  else if (baseId.includes('직선의방정식') || baseId.includes('직선의 방정식')) baseId = '직선의방정식';
  else if (baseId.includes('원의방정식') || baseId.includes('원의 방정식')) baseId = '원의방정식';
  else if (baseId.includes('도형의이동') || baseId.includes('도형의 이동')) baseId = '도형의이동';
  else if (baseId.includes('경우의수') || baseId.includes('경우의 수')) baseId = '경우의수';
  else if (baseId.includes('행렬')) baseId = '행렬';
  else if (baseId.includes('점과좌표') || baseId.includes('점과 좌표')) baseId = '점과좌표';
  else if (baseId.includes('일차부등식')) baseId = '일차부등식';
  else if (baseId.includes('이차부등식')) baseId = '이차부등식';
  else if (baseId.replace(/\s/g, '').includes('삼각함수그래프')) baseId = '삼각함수그래프';

  // --- 수열 ---
  else if (baseId.includes('여러가지수열') || baseId.includes('여러 가지 수열') || baseId.includes('여러 가지수열')) baseId = '여러가지수열';
  else if (baseId.includes('점화식')) baseId = '점화식';
  else if (baseId.includes('수학적귀납법') || baseId.includes('귀납법')) baseId = '수학적귀납법';
  else if (baseId.includes('등차')) baseId = '등차수열';
  else if (baseId.includes('등비')) baseId = '등비수열';
  else if (baseId.includes('수열의합') || baseId.includes('수열의 합') || baseId.includes('시그마')) baseId = '수열의합';

  // --- 미적분 (Grade 12) ---
  else if (baseId.includes('미적분') || baseId.includes('초월함수') || baseId.includes('여러가지 적분') || baseId.includes('여러 가지 적분')) {
    if (baseId.includes('수열의극한') || baseId.includes('수열의 극한')) baseId = '미적분_수열의극한';
    else if (baseId.includes('급수')) baseId = '미적분_급수';
    else if (baseId.includes('지수로그함수의극한') || baseId.includes('지수로그함수의 극한') || baseId.includes('여러가지함수미분')) baseId = '미적분_지수로그극한';
    else if (baseId.includes('삼각함수의극한') || baseId.includes('삼각함수의 극한')) baseId = '미적분_삼각함수극한';
    else if (baseId.includes('삼각함수') && (baseId.includes('공식') || baseId.includes('합성'))) baseId = '미적분_삼각함수공식';
    else if (baseId.includes('여러가지미분법') || baseId.includes('미분법')) baseId = '미적분_미분법';
    else if (baseId.includes('도함수활용') || baseId.includes('도함수의활용') || baseId.includes('도함수의 활용')) baseId = '미적분_도함수활용';
    else if (baseId.includes('적분법') || baseId.includes('치환적분') || baseId.includes('부분적분')) baseId = '미적분_적분법';
    else if (baseId.includes('정적분활용') || baseId.includes('정적분의활용') || baseId.includes('정적분의 활용')) baseId = '미적분_정적분활용';
    else if (baseId.includes('정적분')) baseId = '미적분_정적분';
  }
  else if (baseId.includes('여러') && baseId.includes('적분법')) baseId = '미적분_적분법';
  else if (baseId.includes('초월함수') && baseId.includes('정적분')) baseId = '미적분_정적분';
  else if (baseId.includes('삼각함수') && baseId.includes('공식')) baseId = '미적분_삼각함수공식';

  // --- 수학2 ---
  else if (baseId.includes('함수의극한') || baseId.includes('함수의 극한') || baseId.includes('함수의극')) baseId = '함수의극한';
  else if (baseId.includes('함수의연속') || baseId.includes('함수의 연속')) baseId = '함수의연속';
  else if (baseId.includes('도함수의활용1') || baseId.includes('미분의활용1') || baseId.includes('접선')) baseId = '도함수의활용1';
  else if (baseId.includes('도함수의활용2') || baseId.includes('미분의활용2') || baseId.includes('그래프와방정식') || baseId.includes('그래프와 방정식')) baseId = '도함수의활용2';
  else if (baseId.includes('도함수의활용3') || baseId.includes('미분의활용3') || baseId.includes('속도와가속도') || baseId.includes('속도와 가속도')) baseId = '도함수의활용3';
  else if (baseId.includes('도함수의활용') || baseId.includes('도함수의 활용')) baseId = '도함수의활용1';
  else if (baseId.includes('미분계수') || baseId.includes('도함수')) baseId = '미분계수와도함수';
  else if (baseId.includes('정적분의활용') || baseId.includes('정적분의 활용') || baseId.includes('정적분활용')) baseId = '정적분의활용';
  else if (baseId.includes('부정적분')) baseId = '부정적분과정적분';
  else if (baseId.includes('정적분')) baseId = '부정적분과정적분';
  else if (baseId.includes('적분법')) baseId = '부정적분과정적분';

  // --- 기타 ---
  else if (baseId.includes('지수함수')) baseId = '지수함수';
  else if (baseId.includes('지수')) baseId = '지수';
  else if (baseId.includes('로그함수')) baseId = '로그함수';
  else if (baseId.includes('로그')) baseId = '로그';
  else if (baseId.includes('원순열') || baseId.includes('중복순열') || baseId.includes('순열')) baseId = '확통_순열';
  else if (baseId.includes('중복조합') || baseId.includes('이항정리')) baseId = '확통_중복조합';
  else if (baseId.includes('확률의뜻') || baseId.includes('확률의 뜻')) baseId = '확통_확률정의';
  else if (baseId.includes('조건부확률') || baseId.includes('독립시행')) baseId = '확통_조건부확률';
  else if (baseId.includes('이산확률') || baseId.includes('이항분포')) baseId = '확통_이산확률';
  else if (baseId.includes('연속확률') || baseId.includes('정규분포')) baseId = '확통_연속확률';
  else if (baseId.includes('통계적추정') || baseId.includes('표본평균') || baseId.includes('모평균')) baseId = '확통_통계적추정';
  else if (baseId.includes('순열')) baseId = '순열';
  else if (baseId.includes('조합')) baseId = '조합';
  else if (baseId.includes('삼각함수활용') || baseId.includes('삼각함수의 활용')) baseId = '삼각함수의 활용';
  else if (baseId.includes('삼각함수')) baseId = '삼각함수성질';
  else if (baseId.includes('극한') && !baseId.includes('수열')) baseId = '함수의 극한';
  else if (baseId.includes('연속')) baseId = '함수의 연속';

  return baseId;
}
