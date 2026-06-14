export const meta = {
  name: 'su12-hw-mismatch-verify-B',
  description: '수2_04 mismatch 9건 — 객관식 보기번호 규약 검증 + 재저작',
  phases: [{ title: 'Verify', detail: '문제당 1 에이전트 — 문제 보기표 확인 + 판정 + 저작' }],
}

const SCHEMA = {
  type: 'object',
  required: ['pid','isMultipleChoice','computedValue','finalAnswer','storedCorrect','P','C','B','S_steps','answerLatex','notes'],
  properties: {
    pid: { type: 'string' },
    isMultipleChoice: { type: 'boolean', description: '문제에 보기 ①~⑤가 있으면 true' },
    bogiTable: { type: 'string', description: '객관식이면 보기 ①~⑤ 값 나열 (예: ①10 ②12 ③14 ④16 ⑤-1)' },
    computedValue: { type: 'string', description: '해설이 도출하는 실제 정답 값' },
    finalAnswer: { type: 'string', description: '저장 관례 정답: 객관식이면 보기번호("1"~"5"), 단답이면 값' },
    storedCorrect: { type: 'boolean', description: '저장값(stored)이 finalAnswer와 일치하면 true' },
    P: { type: 'string' }, C: { type: 'string' }, B: { type: 'string' },
    S_steps: { type: 'array', items: { type: 'string' } },
    answerLatex: { type: 'string', description: 'A 필드 \\boxed 안 — 도출된 "값"의 KaTeX ($ 없이)' },
    notes: { type: 'string' },
  },
}

const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework'

const JOBS = [
  {"pid":"002","stored":"5","computed":"-1"},
  {"pid":"005","stored":"1","computed":"10"},
  {"pid":"008","stored":"5","computed":"16"},
  {"pid":"013","stored":"4","computed":"3"},
  {"pid":"018","stored":"5","computed":"6"},
  {"pid":"024","stored":"1","computed":"7"},
  {"pid":"025","stored":"1","computed":"486"},
  {"pid":"026","stored":"1","computed":"32"},
  {"pid":"039","stored":"5","computed":"32"},
]
const HK = '수학2_04도함수활용12_통합숙제'
const IMG = 'math2/04_derivative_util_12'

phase('Verify')

const results = await parallel(JOBS.map(job => () => agent(`
너는 한국 고등학교 수학Ⅱ 전문 강사다. 멘토스 통합숙제 「${HK}」 ${job.pid}번의 "정답 불일치"를 해소하고 PCBSA를 저작하라.

## 배경 (중요 — 값↔보기번호 규약)
이 콘텐츠의 저장 정답(SSOT) 관례: **객관식이면 보기 번호 문자열("1"~"5"), 단답형이면 값**이다.
- 1차 저작에서 이 문제의 해설 도출 값 = "${job.computed}", 저장값(stored) = "${job.stored}"로 불일치 플래그됨.
- 핵심 질문: 이 문제가 **객관식**인가? 객관식이면 "${job.computed}"가 보기 몇 번인지 확인하라. 그 보기번호가 "${job.stored}"와 같으면 **저장값이 맞다**(위양성). 단답형이면 값 "${job.computed}"가 정답이고 stored "${job.stored}"는 오염이다.

## 절차
1. curl로 문제 이미지 ${BASE}/${IMG}/${job.pid}.webp, 해설 ${BASE}/${IMG}/${job.pid}a.webp를 /tmp/mmvB_${job.pid}/에 다운로드. sips→png 변환 후 Read.
2. **문제 이미지에서 보기 ①~⑤ 존재 여부와 각 보기 값을 정확히 읽어라**(bogiTable). 해설은 세로 2000px 초과 시 PIL 분할로 끝까지 판독.
3. 해설의 도출 값(computedValue)을 재확인하고, 객관식이면 그 값이 보기 몇 번인지 매칭.
4. finalAnswer 결정: 객관식 → 그 보기번호("1"~"5"), 단답 → 값. storedCorrect = (finalAnswer == "${job.stored}").
5. PCBSA를 저작한다(계획문·메타발언 금지, display $$ 인라인 $, KaTeX 파싱가능, \\unicode 금지). answerLatex는 도출된 "값"의 KaTeX($ 없이).

pid는 "${job.pid}". notes에 보기표·매칭 근거·검산 기록.
`, { label: `mmvB:${job.pid}`, phase: 'Verify', schema: SCHEMA, agentType: 'general-purpose' })))

return results.filter(Boolean)
