export const meta = {
  name: 'cal-hw-stragglers',
  description: '미적분 숙제 AVS 잔여 6문제 재저작 (KaTeX 가드 강화)',
  phases: [{ title: 'Author', detail: '잔여 6문제 — 깨끗한 KaTeX로 재저작' }],
}
const SCHEMA = {
  type: 'object', required: ['pid', 'status', 'correctAnswer', 'notes'],
  properties: {
    pid: { type: 'string' }, status: { type: 'string', enum: ['authored', 'mismatch', 'unclear'] },
    correctAnswer: { type: 'string' }, matchesStored: { type: 'boolean' },
    P: { type: 'string' }, C: { type: 'string' }, B: { type: 'string' },
    S_steps: { type: 'array', items: { type: 'string' } }, answerLatex: { type: 'string' }, notes: { type: 'string' },
  },
}
const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework'
const JOBS = JSON.parse(`__JOBS__`)

phase('Author')
const results = await parallel(JOBS.map((job) => () => agent(`
너는 한국 고등학교 미적분 전문 강사다. 통합숙제 「${job.hk}」 ${job.pid}번의 PCBSA 명품 해설을 재저작하라(기존 힌트가 KaTeX 오류/미생성으로 라이브 결손).

## 자산
- 문제 이미지: ${BASE}/${job.img}/${job.pid}.webp
- 해설 이미지(보조, +1 시프트 가능): ${BASE}/${job.img}/${job.pid}a.webp 와 ${BASE}/${job.img}/(${job.pid} 다음번호)a.webp
- 검증된 저장 정답(SSOT): "${job.stored}"

## 절차
1. curl로 문제 이미지를 /tmp/st_${job.img.replace(/\//g,'_')}_${job.pid}/ 에 받고 sips -s format png 변환 후 Read. 해설이미지가 다른 문제면 무시하고 문제 이미지+저장정답+직접 풀이로 저작.
2. python3 -c 로 핵심 수치 **동기** 검산(백그라운드/폴링/sleep 금지).
3. 도출 결론이 저장정답 "${job.stored}"와 정합인지 확인(객관식이면 보기번호 규약).

## ★KaTeX 가드 (엄수 — 과거 실패 원인)
- **\\overarc 절대 금지**. 호 표기는 \\overset{\\frown}{AC} 사용.
- **$$ ... $$ 또는 $ ... $ 내부에 raw 줄바꿈(\\n) 절대 금지**. 각 수식은 한 줄. 여러 줄 전개는 S_steps 항목을 나누거나 \\begin{aligned}...\\end{aligned} 사용(그 안에서는 \\\\ 로 줄바꿈).
- 평문 LaTeX(log_2, 2^(a/b), 유니코드 √/π/첨자) 금지. 모든 수식 KaTeX 파싱 가능해야 함.
- 메타발언 금지. answerLatex는 순수 KaTeX 값(달러기호 금지).

## 출력
P,C,B,S_steps(4~10, 각 항목 "왜" 한 문장+수식), answerLatex, notes(검산). pid는 "${job.pid}".
`, { label: `st:${job.img.split('/')[1]}/${job.pid}`, phase: 'Author', schema: SCHEMA, agentType: 'general-purpose' })))

return results
