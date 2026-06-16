#!/usr/bin/env node
/**
 * AVS 전수조사 결과 적용 도구.
 *
 * 입력: 워크플로 검증 판정 JSON 파일 (results 배열). 각 항목 스키마는
 *   docs/superpowers/specs/2026-06-16-math2-avs-audit-design.md 참조.
 *
 * 처리(불변성 — 새 객체로 교체):
 *  1) status=rewrite 항목: 해당 {pid}.json 의 P/C/B/S/A 교체. answerChanged 있으면
 *     finalAnswer/correctAnswer 도 교체. 그 외 필드(title/type/S_objects/flag…) 보존.
 *  2) answerChanged 항목: avs_answers.json[avsKey][pid] 동시 정정.
 *  3) _qa_{unitFolder}.json 갱신: [{pid,status,severity,issues,answerChanged}].
 *
 * 사용: node scripts/avs_audit_apply.cjs <results.json> <unitFolder> <avsKey> [--dry]
 */
const fs = require('fs')
const path = require('path')

const [, , resultsPath, unitFolder, avsKey, dryFlag] = process.argv
if (!resultsPath || !unitFolder || !avsKey) {
  console.error('usage: node scripts/avs_audit_apply.cjs <results.json> <unitFolder> <avsKey> [--dry]')
  process.exit(1)
}
const DRY = dryFlag === '--dry'
const ROOT = path.resolve(__dirname, '..')
const unitDir = path.join(ROOT, 'src/data/homework_avs', unitFolder)
const avsPath = path.join(ROOT, 'src/data/avs_answers.json')

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf-8')
}

const payload = readJson(resultsPath)
const results = Array.isArray(payload) ? payload : payload.results
if (!Array.isArray(results)) {
  console.error('results 배열을 찾을 수 없음')
  process.exit(1)
}

const PCBSA = ['P', 'C', 'B', 'S', 'A']
const avs = readJson(avsPath)
if (!avs[avsKey]) {
  console.error(`avs_answers.json 키 없음: ${avsKey}`)
  process.exit(1)
}

let rewritten = 0
let answerFixed = 0
const qa = []
const log = []

for (const r of results) {
  const pid = r.pid
  qa.push({
    pid,
    status: r.status,
    severity: r.severity,
    issues: r.issues || [],
    answerChanged: r.answerChanged || null,
  })

  if (r.status !== 'rewrite') continue
  const rw = r.rewrite
  if (!rw) {
    log.push(`⚠️  ${pid}: status=rewrite 이지만 rewrite 본문 없음 — 건너뜀`)
    continue
  }
  const fp = path.join(unitDir, `${pid}.json`)
  if (!fs.existsSync(fp)) {
    log.push(`⚠️  ${pid}: 파일 없음 ${fp} — 건너뜀`)
    continue
  }
  const cur = readJson(fp)
  // 불변성: 기존 객체 복사 후 PCBSA만 교체
  const next = { ...cur }
  for (const k of PCBSA) {
    if (typeof rw[k] === 'string' && rw[k].trim()) next[k] = rw[k]
  }
  if (r.answerChanged && r.answerChanged.to != null) {
    const to = String(r.answerChanged.to)
    if (rw.finalAnswer) next.finalAnswer = rw.finalAnswer
    else next.finalAnswer = to
    if (rw.correctAnswer) next.correctAnswer = rw.correctAnswer
    else next.correctAnswer = to
    avs[avsKey][pid] = to
    answerFixed++
    log.push(`✱ ${pid}: 정답 변경 ${r.answerChanged.from} → ${to} (JSON + 채점 SSOT)`)
  }
  if (!DRY) writeJson(fp, next)
  rewritten++
  log.push(`✎ ${pid}: PCBSA 재작성 [${r.severity}] ${(r.issues || []).join(' / ')}`)
}

const qaPath = path.join(unitDir, `_qa_${unitFolder}.json`)
if (!DRY) {
  writeJson(qaPath, qa)
  if (answerFixed > 0) writeJson(avsPath, avs)
}

console.log(log.join('\n'))
console.log('\n=== 요약 ===')
console.log(`총 ${results.length} | 재작성 ${rewritten} | 정답정정 ${answerFixed} | QA리포트 ${qa.length}항목`)
console.log(`QA: ${qaPath}`)
if (DRY) console.log('(--dry: 실제 파일 미수정)')
