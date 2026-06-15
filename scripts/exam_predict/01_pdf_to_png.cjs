#!/usr/bin/env node
/**
 * 01단계: 학교 기출 PDF → 페이지별 PNG.
 * macOS 내장 PDFKit(JXA) 으로 렌더 — poppler/네이티브 설치 불필요.
 *   (poppler 는 이 환경(macOS13 Intel)용 bottle 이 없고 소스빌드도 실패해서 안 씀)
 * 멱등: raw_png/<school>/ 에 PNG 가 있으면 건너뜀(REGEN=1 강제).
 *
 * 사용:
 *   node scripts/exam_predict/01_pdf_to_png.cjs            # 전체
 *   node scripts/exam_predict/01_pdf_to_png.cjs 풍산        # 파일명 부분일치
 */
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const C = require('./lib/config.cjs');

const SCALE = process.env.EXAM_SCALE || '2.2';   // 약 150dpi 상당
const JXA = path.join(__dirname, 'lib', 'pdf_render.jxa.js');
const filter = process.argv[2];

function renderPdf(pdfPath, outDir) {
  const r = execFileSync('osascript', ['-l', 'JavaScript', JXA, pdfPath, outDir, SCALE], { encoding: 'utf8' });
  if (!/^OK\s+\d+/.test(r.trim())) throw new Error('렌더 실패: ' + r.trim().slice(0, 120));
  return parseInt(r.trim().split(/\s+/)[1], 10);
}

function run() {
  C.ensureDirs();
  let pdfs = C.listSourcePdfs();
  if (filter) pdfs = pdfs.filter(f => C.matches(f, filter));
  console.log(`[01] PDF ${pdfs.length}개 → PNG (PDFKit, scale ${SCALE})`);

  let ok = 0, skip = 0, fail = 0;
  for (const file of pdfs) {
    const school = C.schoolFromFilename(file);
    if (school === 'unknown') { skip++; continue; }
    const outDir = path.join(C.STAGES.raw_png, C.slug(school));
    if (fs.existsSync(outDir) && fs.readdirSync(outDir).some(f => f.endsWith('.png')) && process.env.REGEN !== '1') {
      console.log(`  · skip ${school} (이미 있음)`); skip++; continue;
    }
    fs.mkdirSync(outDir, { recursive: true });
    try {
      const n = renderPdf(path.join(C.SRC_DIR, file), outDir);
      fs.writeFileSync(path.join(outDir, '_source.json'), JSON.stringify({ school, file: C.nfc(file), pages: n }, null, 2));
      console.log(`  ✓ ${school}: ${n}p`);
      ok++;
    } catch (e) { console.log(`  ✗ ${school}: ${e.message}`); C.logFailure('01_pdf_to_png', school, file, e); fail++; }
  }
  console.log(`[01] 완료 ok=${ok} skip=${skip} fail=${fail}`);
}

run();
