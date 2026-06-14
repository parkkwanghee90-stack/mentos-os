export const meta = {
  name: 'cal-hw-manual-rest',
  description: '미적분 숙제 AVS 수동저작 — 나머지 7단원 701문제 일괄 (Gemini 우회)',
  phases: [{ title: 'Author', detail: '문제당 1 에이전트 — 문제이미지 직판독 + 저장정답 SSOT + sympy 검산 후 PCBSA 저작' }],
}

const SCHEMA = {
  type: 'object',
  required: ['pid', 'status', 'correctAnswer', 'notes'],
  properties: {
    pid: { type: 'string' },
    status: { type: 'string', enum: ['authored', 'mismatch', 'unclear'] },
    correctAnswer: { type: 'string' },
    matchesStored: { type: 'boolean' },
    P: { type: 'string' }, C: { type: 'string' }, B: { type: 'string' },
    S_steps: { type: 'array', items: { type: 'string' } },
    answerLatex: { type: 'string' },
    notes: { type: 'string' },
  },
}

const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework'

// jobs are passed via Workflow args (701 jobs, ordered). Each: {subj, hk, pid, img, stored}
const JOBS = args

phase('Author')

const results = await parallel(JOBS.map((job) => () => agent(`
너는 한국 고등학교 ${job.subj} 전문 강사다. 멘토스 수학앱 통합숙제 「${job.hk}」 ${job.pid}번 문제의 PCBSA 명품 해설을 전면 저작하라. (현재 이 문제는 힌트가 스켈레톤뿐인 라이브 결손이다.)

## 자산
- 문제 이미지: ${BASE}/${job.img}/${job.pid}.webp
- 해설 이미지(주의): ${BASE}/${job.img}/${job.pid}a.webp
- 검증된 저장 정답(SSOT): "${job.stored}"

## ★자산 정합성 경고 (이 단원군의 알려진 버그)
해설 이미지 {pid}a.webp 가 **다른 문제로 어긋나 있는 경우가 있다**(크롭 파이프라인 +1 시프트 버그: {N}a 가 {N-1}번 풀이를 담는 사례 관측됨). 따라서:
- **1차 근거는 항상 문제 이미지(${job.pid}.webp)** 이다. 해설 이미지는 보조로만 쓰되, 문제 이미지의 발문과 내용이 다르면 **해설 이미지를 버리고 문제 이미지 + 저장정답 + 직접 풀이로 저작**하라.
- 만약 문제 이미지(${job.pid}.webp) 자체가 발문이 아니라 '풀이'처럼 보이거나 손상/공백이면, 진짜 풀이는 ${BASE}/${job.img}/(${job.pid} 다음 번호)a.webp 에 있을 수 있으니 교차 확인하라.
- 어떤 경우든 **최종 결론이 저장정답 "${job.stored}"와 정합**해야 한다(아래 규약).

## 절차
1. curl로 필요한 이미지를 /tmp/cmw_${job.img.replace(/\//g, '_')}_${job.pid}/ 에 다운로드. sips -s format png 변환 후 Read.
2. 세로로 길면 python3 PIL로 분할해 **마지막 결론 줄까지** 전 구간 판독(중간 생략 금지).
3. 문제의 논리를 충실히 따라 PCBSA를 저작한다. **저장정답 규약(중요)**: 저장값(stored)은 **객관식이면 보기 번호 문자열("1"~"5"), 단답형이면 값**이다.
   - 문제 이미지에 보기 ①~⑤가 있으면 객관식. 네가 구한 정답 '값'이 보기 몇 번인지 확인하고, 그 보기번호가 "${job.stored}"와 같으면 status='authored', matchesStored=true. answerLatex에는 도출된 '값'(보기번호 아님)을 쓴다.
   - 단답형(보기 없음)이고 도출 값이 "${job.stored}"와 일치하면 status='authored'. answerLatex=그 값.
   - 객관식인데 도출 값의 보기번호가 stored와 다르거나, 단답형인데 값이 stored와 **명백히** 다르면 status='mismatch', correctAnswer=올바른 정답(객관식이면 보기번호), notes에 보기표+근거.
   - 이미지 접근 불가/판독 불가/발문 자체가 없으면 status='unclear', notes에 이유.

## 저작 규칙 (엄수)
- P(구하는 것), C(조건), B(개념/원리), S_steps(4~10개: '왜' 한 문장 + 수식 전개. 계획문 금지, 케이스·논증 생략·재구성 금지), answerLatex(정답의 순수 KaTeX, 달러기호 절대 금지 — \\boxed 안에 들어감), notes(수치 검산).
- display 수식 $$...$$, 인라인 $...$. 평문 LaTeX(log_2, 2^(a/b), 유니코드 √/π/첨자/시그마)·\\unicode{} 금지. ① 등 동그라미 숫자는 산문/\\text{}로.
- 메타발언 절대 금지('해설', '이미지', '판서', '~로 보입니다', '가정하고', '이 풀이에서는').
- 단계 안 raw 줄바꿈 금지. 모든 수식 KaTeX 파싱 가능(중괄호 집합은 $\\{ \\}$ 이스케이프).
- 핵심 수치는 **python3 -c 로 동기 실행**해 즉시 결과를 받아 notes에 기록. **절대 백그라운드 실행 + until/grep 폴링이나 sleep 루프 금지**(워크플로우가 멈춘다). run_in_background 금지.

pid는 "${job.pid}"로 보고.
`, { label: `cmw:${job.img.split('/')[1]}/${job.pid}`, phase: job.hk.split('_')[1], schema: SCHEMA, agentType: 'general-purpose' })))

// 인덱스 정합 유지를 위해 filter 하지 않고 그대로 반환 (null = 죽은 에이전트)
return results
