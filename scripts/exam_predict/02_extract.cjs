#!/usr/bin/env node
/**
 * 02단계: 학교 기출 PDF → 학교별 시험 JSON(현암고 스키마)으로 디지털화.
 * Gemini 가 PDF(스캔본 포함)를 직접 읽어 {num,unit,level,type,latex,answer} 배열을 추출한다.
 * (poppler 래스터화 불필요 — Gemini 가 application/pdf 를 직접 인식)
 *
 *  - 산출물(extracted/*)은 **내부 분석용**(실제 기출의 사본). 앱에 그대로 내보내지 않는다.
 * 멱등: extracted/<school>.json 있으면 건너뜀(REGEN=1 강제).
 *
 * 사용:  set -a; source .env; set +a
 *        node scripts/exam_predict/02_extract.cjs ["풍산"]
 */
const path = require('path');
const fs = require('fs');
const C = require('./lib/config.cjs');
const G = require('./lib/gemini.cjs');

const filter = process.argv[2];
const MAX_BYTES = parseInt(process.env.EXAM_MAX_PDF_BYTES || String(18 * 1024 * 1024), 10); // 인라인 한도

const PROMPT = `너는 한국 고등학교 1학년 1학기 기말 수학(공통수학1) 시험지를 디지털화하는 OCR 전문가다.
첨부된 PDF 는 한 학교의 시험지(+해설지일 수 있음)다. 모든 객관식/서술형 문항을 빠짐없이 읽어라.

각 문항을 아래 JSON 스키마로 변환:
{ "num": 문항번호(정수), "unit": 단원명, "level": "기본"|"심화", "type": "객관식"|"서술형",
  "latex": "발문과 보기를 KaTeX 호환 LaTeX로. 수식은 $...$ 인라인 또는 $$...$$ 블록만(\\\\( \\\\) 금지).",
  "answer": 정답(객관식은 보기번호 정수, 서술형/주관식은 문자열, 모르면 null) }

단원(unit)은 다음 중에서만 고른다: ${C.UNITS.join(', ')}.
규칙:
- 그림/표가 있으면 latex 끝에 "[그림]"/"[표]" 표기(좌표·도형 수치는 가능한 한 텍스트로).
- 해설지가 있어 정답을 알 수 있으면 answer 를 채운다. 불확실하면 null.
- 페이지 헤더/학교명/배점표 등 비문항 텍스트는 무시.
반드시 {"problems":[...]} JSON 만 출력.`;

async function extractFromPdf(file) {
  const pdfPath = path.join(C.SRC_DIR, file);
  const sz = fs.statSync(pdfPath).size;
  if (sz > MAX_BYTES) throw new Error(`PDF 용량 초과(${Math.round(sz/1e6)}MB > ${Math.round(MAX_BYTES/1e6)}MB) — File API 필요`);
  const school = C.schoolFromFilename(file);
  const parsed = await G.visionJson([pdfPath], PROMPT);
  const problems = (parsed.problems || []).filter(p => p && p.latex);
  return {
    school, region: null, year: 2025, grade: '고1', term: '1학기 기말', subject: '공통수학1',
    source: `멘토스기출/2025/1학년1학기말/${file}`,
    extracted_at: new Date().toISOString(), problem_count: problems.length, problems,
  };
}

async function run() {
  C.ensureDirs();
  let pdfs = C.listSourcePdfs();
  if (filter) pdfs = pdfs.filter(f => C.matches(f, filter));
  console.log(`[02] 추출 대상 ${pdfs.length}개 PDF`);

  let ok = 0, skip = 0, fail = 0;
  for (const file of pdfs) {
    const school = C.schoolFromFilename(file);
    if (school === 'unknown') { console.log(`  · skip (학교명 미상) ${C.nfc(file).slice(0, 30)}`); skip++; continue; }
    const out = path.join(C.STAGES.extracted, `${C.slug(school)}.json`);
    if (fs.existsSync(out) && process.env.REGEN !== '1') { console.log(`  · skip ${school}`); skip++; continue; }
    try {
      const data = await extractFromPdf(file);
      fs.writeFileSync(out, JSON.stringify(data, null, 2));
      console.log(`  ✓ ${school}: ${data.problem_count}문항`);
      ok++;
      await new Promise(r => setTimeout(r, 2000)); // rate limit
    } catch (e) { console.log(`  ✗ ${school}: ${e.message}`); C.logFailure('02_extract', school, file, e); fail++; }
  }
  console.log(`[02] 완료 ok=${ok} skip=${skip} fail=${fail}`);
}

if (require.main === module) run();
module.exports = { extractFromPdf };
