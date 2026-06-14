export const meta = {
  name: 'su12-hw-manual-qa-consolidation',
  description: '수동저작 수2_04~07 컨솔리데이션 적대적 QA (166문제 / 22배치)',
  phases: [{ title: 'QA', detail: '8문제/에이전트 — 생성 힌트를 해설 이미지와 대조' }],
}
const QA_SCHEMA = {
  type: 'object', required: ['findings'],
  properties: {
    findings: { type: 'array', items: { type: 'object', required: ['pid','verdict','issues'],
      properties: { pid:{type:'string'}, verdict:{type:'string',enum:['pass','minor','major']}, issues:{type:'array',items:{type:'string'}} } } },
    systemicPatterns: { type: 'string' },
  },
}
const RULES = `
## 검수 기준 (각 문제마다 JSON과 두 이미지를 모두 실제로 읽고 판정)
1. [충실성] S 풀이가 해설 이미지 논리를 따르는가. 이미지에 없는 풀이 날조·계획문(\"~를 구합니다\"만)은 major.
2. [수학 정확성] S 각 단계 수식 전개에 계산/논리 오류 없는가. 오류는 major. \"답 맞추기 역산\"(중간 수치 날조) 의심 시 역검산.
3. [정답 일치] S 결론이 finalAnswer와 일치하는가. 객관식은 finalAnswer가 보기번호 문자열이고 A의 \\boxed는 값을 보이는 게 정상(값↔번호 차이는 결함 아님). S·이미지·보기가 저장답과 다른 값을 가리키면 SSOT 오염 의심 major.
4. [메타발언] \"해설/판서/이미지/~로 보입니다/가정하고\" 자기검토 흔적 major.
5. [케이스 무결성] 케이스 임의 재구성(합만 정답)·범위 경계(등호) 오류 major. ㄱㄴㄷ 합답형은 각 명제 개별 검증.
6. [형식] 리터럴 \\n, $$$ 연쇄, \\boxed 안 $ 중첩, 평문 LaTeX, \\unicode, 인라인에 $$ 남용은 minor(렌더 깨지면 major).
## 판정 원칙
- 그림/도형은 직접 판독, 불확실하면 지적 금지. finalAnswer는 검증된 값. 학생 피해 결함만. issues는 한 문장.`
const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework'
const BATCHES = [
  {"hk": "수학2_04도함수활용12_통합숙제", "img": "math2/04_derivative_util_12", "tag": "04도함수활용12", "pids": ["001", "002", "003", "004", "005", "006", "007", "008"]},
  {"hk": "수학2_04도함수활용12_통합숙제", "img": "math2/04_derivative_util_12", "tag": "04도함수활용12", "pids": ["010", "011", "012", "013", "014", "015", "016", "017"]},
  {"hk": "수학2_04도함수활용12_통합숙제", "img": "math2/04_derivative_util_12", "tag": "04도함수활용12", "pids": ["018", "019", "020", "022", "023", "024", "025", "026"]},
  {"hk": "수학2_04도함수활용12_통합숙제", "img": "math2/04_derivative_util_12", "tag": "04도함수활용12", "pids": ["027", "028", "029", "030", "031", "032", "033", "034"]},
  {"hk": "수학2_04도함수활용12_통합숙제", "img": "math2/04_derivative_util_12", "tag": "04도함수활용12", "pids": ["035", "036", "037", "038", "039", "040", "041", "042"]},
  {"hk": "수학2_05도함수활용3_통합숙제", "img": "math2/05_derivative_util_3", "tag": "05도함수활용3", "pids": ["001", "002", "003", "004", "005", "006", "007", "008"]},
  {"hk": "수학2_05도함수활용3_통합숙제", "img": "math2/05_derivative_util_3", "tag": "05도함수활용3", "pids": ["009", "010", "011", "013", "014", "015", "016", "017"]},
  {"hk": "수학2_05도함수활용3_통합숙제", "img": "math2/05_derivative_util_3", "tag": "05도함수활용3", "pids": ["018", "019", "020", "021", "022", "023", "024", "025"]},
  {"hk": "수학2_05도함수활용3_통합숙제", "img": "math2/05_derivative_util_3", "tag": "05도함수활용3", "pids": ["026", "027", "028", "029", "030", "031", "032", "033"]},
  {"hk": "수학2_05도함수활용3_통합숙제", "img": "math2/05_derivative_util_3", "tag": "05도함수활용3", "pids": ["034", "035", "036", "037", "038", "039", "040", "041"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["001", "002", "003", "004", "005", "006", "007", "008"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["009", "010", "011", "012", "013", "014", "015", "016"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["017", "018", "019", "020", "021", "022", "023", "025"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["026", "027", "028", "029", "030", "031", "032", "033"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["034", "035", "036", "037", "038", "039", "040", "041"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["042", "043", "044", "045", "046", "047", "048", "049"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["050", "051", "052", "053", "054", "055", "056", "057"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["058", "059", "060", "061", "062", "063", "064", "065"]},
  {"hk": "수학2_06부정적분정적분_통합숙제", "img": "math2/06_integral", "tag": "06부정적분정적분", "pids": ["066", "067", "068"]},
  {"hk": "수학2_07정적분활용_통합숙제", "img": "math2/07_def_integral_util", "tag": "07정적분활용", "pids": ["001", "002", "003", "004", "005", "006", "007", "008"]},
  {"hk": "수학2_07정적분활용_통합숙제", "img": "math2/07_def_integral_util", "tag": "07정적분활용", "pids": ["009", "010", "011", "012", "014", "015", "016", "017"]},
  {"hk": "수학2_07정적분활용_통합숙제", "img": "math2/07_def_integral_util", "tag": "07정적분활용", "pids": ["018", "019", "020"]},
]
phase('QA')
const results = await parallel(BATCHES.map((job, bi) => () => agent(`
너는 한국 고교 수학Ⅱ 적대적 품질 검수자다. 멘토스 통합숙제 「${job.hk}」의 수동저작 PCBSA 해설을 원본 해설 이미지와 대조 검수하라.
## 자산
- 해설 JSON: /Users/mac/mathmentos/src/data/homework_avs/${job.hk}/{NNN}.json (P/C/B/S(\\n 구분)/A·finalAnswer)
- 이미지: ${BASE}/${job.img}/{NNN}.webp 및 {NNN}a.webp
- webp는 변환 필수: sips -s format png in.webp --out out.png (작업 /tmp/cqa_${job.tag}_b${bi}/). 2000px 초과 해설은 python3 PIL 분할. 검산은 python3 -c 동기실행(until/sleep 폴링 금지).
## 검수 대상: ${job.pids.join(', ')}
${RULES}
findings[].pid는 "${job.tag}/{NNN}". systemicPatterns: 반복 패턴(없으면 빈 문자열).
`, { label: `cqa:${job.tag}:b${bi}`, phase: 'QA', schema: QA_SCHEMA, agentType: 'general-purpose' })))
return results.filter(Boolean)
