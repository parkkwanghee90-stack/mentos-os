export const meta = {
  name: 'su12-hw-manual-wave-B',
  description: '수동 저작 Wave B — 수2_04 도함수활용12 40건 (Gemini 우회)',
  phases: [{ title: 'Author', detail: '문제당 1 에이전트 — 비전 직판독 후 PCBSA 저작' }],
}

const SCHEMA = {
  type: 'object',
  required: ['pid','status','correctAnswer','notes'],
  properties: {
    pid: { type: 'string' },
    status: { type: 'string', enum: ['authored','mismatch','unclear'] },
    correctAnswer: { type: 'string' },
    matchesStored: { type: 'boolean' },
    P: { type: 'string' }, C: { type: 'string' }, B: { type: 'string' },
    S_steps: { type: 'array', items: { type: 'string' } },
    answerLatex: { type: 'string' },
    notes: { type: 'string' },
  },
}

const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework'

const JOBS = [
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "001", "stored": "48"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "002", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "003", "stored": "7"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "004", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "005", "stored": "1"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "006", "stored": "1"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "007", "stored": "16"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "008", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "010", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "011", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "012", "stored": "11"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "013", "stored": "4"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "014", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "015", "stored": "20"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "016", "stored": "22"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "017", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "018", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "019", "stored": "80"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "020", "stored": "8"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "022", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "023", "stored": "23"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "024", "stored": "1"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "025", "stored": "1"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "026", "stored": "1"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "027", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "028", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "029", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "030", "stored": "39"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "031", "stored": "6"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "032", "stored": "108"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "033", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "034", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "035", "stored": "29"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "036", "stored": "134"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "037", "stored": "2"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "038", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "039", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "040", "stored": "5"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "041", "stored": "3"},
  {"hk": "수학2_04도함수활용12_통합숙제", "subj": "수학Ⅱ", "img": "math2/04_derivative_util_12", "pid": "042", "stored": "82"},
]

phase('Author')

const results = await parallel(JOBS.map(job => () => agent(`
너는 한국 고등학교 ${job.subj} 전문 강사다. 멘토스 수학앱 통합숙제 「${job.hk}」 ${job.pid}번 문제의 PCBSA 명품 해설을 원본 해설 이미지 직판독으로 전면 저작하라. (현재 이 문제는 힌트가 스켈레톤뿐인 라이브 결손이다.)

## 자산
- 문제 이미지: ${BASE}/${job.img}/${job.pid}.webp
- 원본 해설 이미지: ${BASE}/${job.img}/${job.pid}a.webp
- 검증된 저장 정답(SSOT): "${job.stored}"

## 절차
1. curl로 두 이미지를 /tmp/mw_${job.img.replace(/\//g,'_')}_${job.pid}/에 다운로드. sips -s format png 변환 후 Read.
2. 해설이 세로 2000px 초과면 python3 PIL로 분할해 **마지막 결론 줄까지** 전 구간 판독(절대 중간 생략 금지).
3. 해설의 논리 전개를 충실히 따라 PCBSA를 저작한다. 최종 결론이 저장 정답 "${job.stored}"와 일치하는지 확인.
   - 일치하면 status='authored', matchesStored=true.
   - 해설 결론이 저장값과 **명백히** 다르면(SSOT 오염 의심) status='mismatch', correctAnswer=해설 결론값, notes에 근거(해설 결론 인용+재계산). 저작 필드는 생략 가능.
   - 이미지 접근 불가/판독 불가/불확실하면 status='unclear', notes에 이유.

## 저작 규칙 (엄수)
- P(구하는 것), C(조건), B(개념/원리), S_steps(4~10개: "왜" 한 문장 + 수식 전개. 계획문 금지, 케이스·논증 생략·재구성 금지), answerLatex(정답의 KaTeX), notes(수치 검산).
- display 수식 $$...$$, 인라인 $...$. 평문 LaTeX(log_2, 2^(a/b), 유니코드 √/π/첨자/시그마)·\\unicode{} 금지. ① 등 동그라미 숫자는 산문/\\text{}로.
- 메타발언 절대 금지("해설", "이미지", "판서", "~로 보입니다", "가정하고", "이 풀이에서는").
- 단계 안 raw 줄바꿈 금지. 모든 수식 KaTeX 파싱 가능해야 함(중괄호 집합 표기는 $\\{ \\}$ 이스케이프).
- 가능하면 python으로 핵심 수치를 검산해 notes에 기록.

pid는 "${job.pid}"로 보고. answerLatex는 도출된 값을 KaTeX로.
`, { label: `mw:${job.img.split('/')[1]}/${job.pid}`, phase: 'Author', schema: SCHEMA, agentType: 'general-purpose' })))

return results.filter(Boolean)
