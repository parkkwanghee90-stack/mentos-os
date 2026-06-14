export const meta = {
  name: 'su12-hw-qa-fix',
  description: '컨솔QA major 10 + minor 4 재저작/수술 (최종답 정확, 풀이 중간 오류 교정)',
  phases: [{ title: 'Fix', detail: '문제당 1 에이전트 — QA지적 반영 재저작' }],
}
const SCHEMA = {
  type: 'object', required: ['pid','P','C','B','S_steps','answerLatex','matchesStored','notes'],
  properties: {
    pid:{type:'string'}, P:{type:'string'}, C:{type:'string'}, B:{type:'string'},
    S_steps:{type:'array',items:{type:'string'},minItems:4},
    answerLatex:{type:'string'}, matchesStored:{type:'boolean'}, notes:{type:'string'},
  },
}
const BASE='https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework'
const JOBS = [
  {"hk": "수학2_04도함수활용12_통합숙제", "tag": "04도함수활용12", "img": "math2/04_derivative_util_12", "pid": "033", "stored": "5", "issue": "문제 이미지의 f(x)=2x³-8x(삼차함수)를 JSON의 P·C·S가 모두 f(x)=2x²-8x(이차/포물선)로 잘못 전사했고, S는 f를 '위로 휘는 포물선'이라 부르며 f'(x)=4x-8(직선의 도함수)을 사용해 ㄴ의 핵심인 x>0 접점(올바른 f에선 2(x-1)²(x+2)로 x=1 이중근 접선) 논리가 붕괴된다—최종 ⑤·t=-1/m·(8m+1)(m-6)=0만 우연히 보존됨.", "kind": "major"},
  {"hk": "수학2_04도함수활용12_통합숙제", "tag": "04도함수활용12", "img": "math2/04_derivative_util_12", "pid": "037", "stored": "2", "issue": "경계찾기 단계에서 'h(t)=h(t+2)→6t²+12t+2=0의 해를 거쳐 t=-3을 얻는다'고 했으나 6t²+12t+2=0의 해는 (-3±√6)/3로 t=-3이 아니며(6·9-36+2=20≠0), 두 경우(h=h ↔ -h=h)의 방정식 배정이 이미지와 정반대로 뒤바뀐 자기모순 오류다(최종답 m+n=2는 정상).", "kind": "major"},
  {"hk": "수학2_05도함수활용3_통합숙제", "tag": "05도함수활용3", "img": "math2/05_derivative_util_3", "pid": "023", "stored": "1", "issue": "ㄴ 정당화가 논리적으로 깨짐: 보기 ㄴ은 '서로 다른 네 실근'을 주장하는데 S는 ㄴ을 '두 실근만 갖는다는 ㄴ'으로 오인용하고, f(1)>0·f(2)<0인 반례를 들어 '네 실근'을 제시한 뒤 거짓이라 결론함(네 실근 예는 ㄴ을 오히려 지지). 이미지의 올바른 반례는 f(2)>0일 때 '두 실근'이라 거짓인데 S가 이를 뒤집음. 최종답 ①(ㄱ만)·ㄱ·ㄷ 판정은 옳음.", "kind": "major"},
  {"hk": "수학2_05도함수활용3_통합숙제", "tag": "05도함수활용3", "img": "math2/05_derivative_util_3", "pid": "026", "stored": "11", "issue": "S가 경계상수 a를 \"a=4로 결정된다\"고 적었으나 원본 해설 이미지는 명확히 a=-1이며(이때 h(x)=f(x)-(x-k)^2가 성립), 이어 \"f(x)+4(x-k)^2=0... 이 아니라 문제의 계수를 그대로 따라\"라는 자기수정 메타발언이 삽입되어 중간값 오류와 메타흔적이 동시에 존재한다(최종답 11과 이후 h(·) 부호계산은 정확).", "kind": "major"},
  {"hk": "수학2_05도함수활용3_통합숙제", "tag": "05도함수활용3", "img": "math2/05_derivative_util_3", "pid": "029", "stored": "55", "issue": "a<0 경우 서로 다른 실근의 합을 \"a+0+p+2p+(a+p)=a+3p\"로 적었으나 좌변은 실제 2a+4p로 등식이 거짓이다(이미지는 a+p가 x≥p 구간 근이 아니므로 올바르게 a+0+p+2p=a+3p로 표기). 유령근 (a+p)를 끼워 넣은 계산식 오류이며 최종답 55에는 영향 없음.", "kind": "major"},
  {"hk": "수학2_05도함수활용3_통합숙제", "tag": "05도함수활용3", "img": "math2/05_derivative_util_3", "pid": "038", "stored": "240", "issue": "최종답 240은 옳으나 S가 이미지의 핵심 논리(불연속점 t=α가 곡선 x절편 a와 같다는 a=α, β=8)를 누락하고, 묻는 α²×f(4) 대신 a²×f(4)를 계산하면서 '(α의 구체적인 값과 무관하게 문제는 α² 대신 a²의 역할을 하는 a²=10을 이용하는 구조이며)'라는 메타발언·날조 정당화로 논리 공백을 덮는다.", "kind": "major"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "tag": "06부정적분정적분", "img": "math2/06_integral", "pid": "043", "stored": "2", "issue": "ㄴ 추론에서 \"F'=f 부호가 양·음·양·음으로 바뀌어 y=F(x)는 두 개의 극댓값을 가진다\"라 적었으나 해설 이미지는 두 극솟값을 갖는 W자형(부호 음·양·음·양)을 명시하므로 도형을 정반대로 뒤집은 수학적으로 틀린 서술이다(결론 ㄱ,ㄴ·f(4)=10은 정답).", "kind": "major"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "tag": "06부정적분정적분", "img": "math2/06_integral", "pid": "055", "stored": "4", "issue": "S 중간식 $\\int_p^{p+1}(x^2-px)dx=\\frac{1}{3}-\\frac{p}{2}$는 부호 오류로 올바른 값 $\\frac{p}{2}+\\frac{1}{3}$이 아니며(검산 확인), 바로 다음 줄 $g(0)=\\frac{p^3-3p^2-3p-1}{6}$와 자기모순이다(틀린 값을 합하면 $\\frac{p^3-3p^2-9p-1}{6}$). 최종 p=4는 맞지만 학생이 따라가면 계산이 어긋난다.", "kind": "major"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "tag": "06부정적분정적분", "img": "math2/06_integral", "pid": "060", "stored": "80", "issue": "S 중간 유도에 \"f(0)=2×(-16)=-16·2 가 아니라…\", \"g(x)=f(x)-16-2(-16) 가 아니라…\" 두 차례의 자기검토 메타발언이 학생 노출 본문에 남아 있고, 원본 이미지는 연속조건을 f(0)=2f(a)·x≥a 구간 g=-f(x)+f(0)로 전개하는데 해설은 이를 f(0)=2f(-3)·\"x≥-3 전체 g=f(x)+f(0)-2f(-3)\"로 f(a)와 f(-3)을 혼동해 서술해 중간 논리가 뒤엉킴(최종 조각함수·정답 80은 정확).", "kind": "major"},
  {"hk": "수학2_07정적분활용_통합숙제", "tag": "07정적분활용", "img": "math2/07_def_integral_util", "pid": "016", "stored": "4", "issue": "S 마지막 줄이 '4+(−4/3)=16/3'으로 적혀 있으나 부호 오류이며(괄호항 [¼x⁴−7/3x³+6x²]₂⁴=+4/3이 정답), 4+(−4/3)=8/3로 16/3과 모순되어 학생이 중간 산식에서 혼란을 겪는다(최종답 16/3=④는 정답, 이미지엔 이 중간줄 없음).", "kind": "major"},
  {"hk": "수학2_05도함수활용3_통합숙제", "tag": "05도함수활용3", "img": "math2/05_derivative_util_3", "pid": "015", "stored": "3", "issue": "C 필드가 f를 '연속함수'로 표기했으나 x=0에서 좌측값(a²/4+b²)과 우측극한 5가 일반적으로 불일치해 실제로는 불연속이며 공식해설도 연속을 전제하지 않음(S 풀이·정답 5는 정확)", "kind": "minor"},
  {"hk": "수학2_05도함수활용3_통합숙제", "tag": "05도함수활용3", "img": "math2/05_derivative_util_3", "pid": "040", "stored": "8", "issue": "삼차부등식 중간식이 '4α³-2α²+21α-5'로 적혀 있으나 올바른 계수는 -24α²(=(α-5)(2α-1)²)이며, 이는 원본 이미지에도 동일하게 존재하는 오타를 충실히 전사한 것으로 인접 단계와 최종답 8은 정확하다.", "kind": "minor"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "tag": "06부정적분정적분", "img": "math2/06_integral", "pid": "042", "stored": "9", "issue": "조건(다) 정리에서 \"x=0과 x=2 사이에서 f(x)≤k\"라 적었으나 실제로는 그 구간에서 f(x)≥k(f-k=x(x-2)²≥0)이며 바로 다음 식은 f≥k 분기(g=f-k/2)를 쓰므로 피적분 k/2·최종 k=8·답 9는 이미지와 일치하는 부등호 방향 오기일 뿐이다.", "kind": "minor"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "tag": "06부정적분정적분", "img": "math2/06_integral", "pid": "062", "stored": "5", "issue": "a=-4 경우 g(1)을 올바른 식 |1-4/3-13/3|(=14/3)으로 먼저 쓴 뒤 곧장 |1+4/3-13/3|^{*}=14/3 라는 군더더기 식을 덧붙였는데 이 후행 식은 수치상 2가 되어 14/3과 모순되며 정체불명의 ^{*} 첨자까지 달려 있음(선행 정식·최댓값 14/3·정답 ⑤는 정확하므로 렌더/메타 잔재 수준).", "kind": "minor"},
]
phase('Fix')
const results = await parallel(JOBS.map(job => () => agent(`
너는 한국 고교 수학Ⅱ 전문 강사다. 멘토스 통합숙제 「${job.hk}」 ${job.pid}번의 기존 PCBSA 해설이 적대적 QA에서 결함 지적을 받았다. **원본 해설 이미지를 다시 직판독해 처음부터 PCBSA를 재저작**하라(최종 정답은 이미 검증됨: "${job.stored}").

## QA 지적 (반드시 해소)
${job.issue}

## 자산
- 기존 JSON: /Users/mac/mathmentos/src/data/homework_avs/${job.hk}/${job.pid}.json (참고만, 지적된 오류 그대로 답습 금지)
- 문제: ${BASE}/${job.img}/${job.pid}.webp / 해설: ${BASE}/${job.img}/${job.pid}a.webp — curl로 /tmp/qaf_${job.tag}_${job.pid}/에 다운로드, sips→png 변환 후 Read. 2000px 초과 해설은 python3 PIL 분할로 마지막 결론줄까지 판독.
- 검산은 python3 -c 동기실행(until/sleep 폴링·run_in_background 절대 금지).

## 저작 규칙 (엄수)
- P/C/B/S_steps(4~10개: "왜" 한 문장+수식 전개), answerLatex(도출된 "값"의 순수 KaTeX, $ 금지).
- 문제식·계수·차수를 이미지에서 정확히 전사(033류 x³↔x² 오독 금지). 케이스 배정·부호·논리를 이미지와 일치시킬 것.
- 메타발언("해설/이미지/판서/~로 보입니다/가정하고/~가 아니라" 자기수정) 절대 금지.
- ㄱㄴㄷ 합답형은 각 명제를 독립 검증해 올바른 보기 결론 도출.
- display $$...$$, 인라인 $...$. 평문 LaTeX·유니코드 첨자·\\unicode 금지. 집합표기 $\\{ \\}$.
- matchesStored: 도출 결론(객관식이면 보기번호)이 "${job.stored}"와 일치하는지. answerLatex는 값.

pid는 "${job.pid}". notes에 핵심 검산.
`, { label: `qaf:${job.tag}/${job.pid}`, phase: 'Fix', schema: SCHEMA, agentType: 'general-purpose' })))
return results.filter(Boolean)
