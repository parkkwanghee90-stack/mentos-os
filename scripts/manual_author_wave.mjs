export const meta = {
  name: 'su12-hw-manual-wave-cal07',
  description: '수동 저작 Wave cal07 — 미적분 07 도함수활용2 (Gemini 우회)',
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
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "001", "img": "calculus/07_derivative_util_2", "stored": "4"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "002", "img": "calculus/07_derivative_util_2", "stored": "5"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "003", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "004", "img": "calculus/07_derivative_util_2", "stored": "40"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "005", "img": "calculus/07_derivative_util_2", "stored": "5"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "006", "img": "calculus/07_derivative_util_2", "stored": "5"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "007", "img": "calculus/07_derivative_util_2", "stored": "13"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "008", "img": "calculus/07_derivative_util_2", "stored": "4"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "009", "img": "calculus/07_derivative_util_2", "stored": "8"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "010", "img": "calculus/07_derivative_util_2", "stored": "4"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "011", "img": "calculus/07_derivative_util_2", "stored": "4"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "012", "img": "calculus/07_derivative_util_2", "stored": "5"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "013", "img": "calculus/07_derivative_util_2", "stored": "5"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "014", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "015", "img": "calculus/07_derivative_util_2", "stored": "5"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "016", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "017", "img": "calculus/07_derivative_util_2", "stored": "34"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "018", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "019", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "020", "img": "calculus/07_derivative_util_2", "stored": "2"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "021", "img": "calculus/07_derivative_util_2", "stored": "16"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "022", "img": "calculus/07_derivative_util_2", "stored": "129"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "023", "img": "calculus/07_derivative_util_2", "stored": "40"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "024", "img": "calculus/07_derivative_util_2", "stored": "4"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "025", "img": "calculus/07_derivative_util_2", "stored": "4"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "026", "img": "calculus/07_derivative_util_2", "stored": "10"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "027", "img": "calculus/07_derivative_util_2", "stored": "251"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "028", "img": "calculus/07_derivative_util_2", "stored": "17"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "029", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "030", "img": "calculus/07_derivative_util_2", "stored": "71"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "031", "img": "calculus/07_derivative_util_2", "stored": "30"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "032", "img": "calculus/07_derivative_util_2", "stored": "3"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "033", "img": "calculus/07_derivative_util_2", "stored": "43"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "034", "img": "calculus/07_derivative_util_2", "stored": "1"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "035", "img": "calculus/07_derivative_util_2", "stored": "45"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "036", "img": "calculus/07_derivative_util_2", "stored": "1"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "037", "img": "calculus/07_derivative_util_2", "stored": "8"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "038", "img": "calculus/07_derivative_util_2", "stored": "1"},
  {"subj": "미적분", "hk": "미적분_07도함수활용2_통합숙제", "pid": "039", "img": "calculus/07_derivative_util_2", "stored": "5"},
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
