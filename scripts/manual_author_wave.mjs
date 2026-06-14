export const meta = {
  name: 'su12-hw-manual-wave-D',
  description: '수동 저작 Wave D — 수2_06 부정적분정적분 67건 (Gemini 우회)',
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
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "001", "stored": "9"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "002", "stored": "9"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "003", "stored": "1"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "004", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "005", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "006", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "007", "stored": "7"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "008", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "009", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "010", "stored": "3"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "011", "stored": "3"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "012", "stored": "24"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "013", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "014", "stored": "16"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "015", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "016", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "017", "stored": "1"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "018", "stored": "14"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "019", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "020", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "021", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "022", "stored": "32"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "023", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "025", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "026", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "027", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "028", "stored": "340"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "029", "stored": "66"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "030", "stored": "3"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "031", "stored": "41"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "032", "stored": "28"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "033", "stored": "1"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "034", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "035", "stored": "36"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "036", "stored": "71"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "037", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "038", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "039", "stored": "137"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "040", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "041", "stored": "25"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "042", "stored": "9"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "043", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "044", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "045", "stored": "12"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "046", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "047", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "048", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "049", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "050", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "051", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "052", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "053", "stored": "8"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "054", "stored": "24"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "055", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "056", "stored": "3"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "057", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "058", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "059", "stored": "2"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "060", "stored": "80"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "061", "stored": "80"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "062", "stored": "5"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "063", "stored": "16"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "064", "stored": "20"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "065", "stored": "48"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "066", "stored": "74"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "067", "stored": "4"},
  {"hk": "수학2_06부정적분정적분_통합숙제", "subj": "수학Ⅱ", "img": "math2/06_integral", "pid": "068", "stored": "20"},
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
3. 해설의 논리 전개를 충실히 따라 PCBSA를 저작한다. **저장 정답 규약(중요)**: 저장값(stored)은 **객관식이면 보기 번호 문자열("1"~"5"), 단답형이면 값**이다.
   - 문제 이미지에 **보기 ①~⑤가 있으면 객관식**이다. 이때 네가 구한 정답 "값"이 보기 몇 번인지 확인하라. 그 보기 번호가 "${job.stored}"와 같으면 status='authored', matchesStored=true (값이 stored와 숫자가 달라도 보기번호가 맞으면 정상이다). answerLatex에는 도출된 "값"을 쓴다.
   - 단답형(보기 없음)이고 도출 값이 "${job.stored}"와 일치하면 status='authored'.
   - 객관식인데 도출 값의 보기번호가 stored와 다르거나, 단답형인데 값이 stored와 **명백히** 다르면 status='mismatch', correctAnswer=올바른 정답(객관식이면 보기번호), notes에 보기표+근거.
   - 이미지 접근 불가/판독 불가/불확실하면 status='unclear', notes에 이유.

## 저작 규칙 (엄수)
- P(구하는 것), C(조건), B(개념/원리), S_steps(4~10개: "왜" 한 문장 + 수식 전개. 계획문 금지, 케이스·논증 생략·재구성 금지), answerLatex(정답의 KaTeX), notes(수치 검산).
- display 수식 $$...$$, 인라인 $...$. 평문 LaTeX(log_2, 2^(a/b), 유니코드 √/π/첨자/시그마)·\\unicode{} 금지. ① 등 동그라미 숫자는 산문/\\text{}로.
- 메타발언 절대 금지("해설", "이미지", "판서", "~로 보입니다", "가정하고", "이 풀이에서는").
- 단계 안 raw 줄바꿈 금지. 모든 수식 KaTeX 파싱 가능해야 함(중괄호 집합 표기는 $\\{ \\}$ 이스케이프).
- 가능하면 python으로 핵심 수치를 검산해 notes에 기록. **검산은 반드시 python3 -c 로 동기 실행해 즉시 결과를 받아라. 절대 백그라운드 실행 + until/grep 폴링이나 sleep 루프로 기다리지 말 것**(워크플로우가 멈춘다). run_in_background 금지.

pid는 "${job.pid}"로 보고. answerLatex는 도출된 "값"의 순수 KaTeX(달러기호 $ 절대 포함 금지 — \\boxed 안에 들어가므로).
`, { label: `mw:${job.img.split('/')[1]}/${job.pid}`, phase: 'Author', schema: SCHEMA, agentType: 'general-purpose' })))

return results.filter(Boolean)
