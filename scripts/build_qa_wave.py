#!/usr/bin/env python3
"""수동저작분 컨솔리데이션 QA 워크플로우 생성.
사용: python3 scripts/build_qa_wave.py  (수2_04~07 manual pid 자동 수집, 8/배치)"""
import json

m = json.load(open('/Users/mac/mathmentos/scripts/homework_avs_manifest.json'))
audit = json.load(open('/Users/mac/mathmentos/scripts/su12_hw_audit.json'))['units']
UNITS = ['수학2_04도함수활용12_통합숙제','수학2_05도함수활용3_통합숙제','수학2_06부정적분정적분_통합숙제','수학2_07정적분활용_통합숙제']

batches = []
for u in UNITS:
    img = audit[u]['prefix'].replace('math_crops/homework/','')
    tag = u.split('_')[1]
    pids = sorted(p.split('/')[1] for p in m if p.startswith(u+'/'))
    for i in range(0, len(pids), 8):
        batches.append({'hk': u, 'img': img, 'tag': tag, 'pids': pids[i:i+8]})

batches_js = ',\n  '.join(json.dumps(b, ensure_ascii=False) for b in batches)
total = sum(len(b['pids']) for b in batches)

TEMPLATE = r'''export const meta = {
  name: 'su12-hw-manual-qa-consolidation',
  description: '수동저작 수2_04~07 컨솔리데이션 적대적 QA (%TOTAL%문제 / %NB%배치)',
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
  %BATCHES%,
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
'''
out = TEMPLATE.replace('%TOTAL%', str(total)).replace('%NB%', str(len(batches))).replace('%BATCHES%', batches_js)
open('/Users/mac/mathmentos/scripts/manual_qa_wave.mjs', 'w').write(out)
print(f'생성: manual_qa_wave.mjs ({total}문제, {len(batches)}배치)')
