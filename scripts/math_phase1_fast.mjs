/**
 * [PHASE 1 FAST] PDF → PNG 고속 추출기 (MuPDF 엔진)
 * ─────────────────────────────────────────────────────
 * mupdf(WebAssembly) 직접 렌더 — Puppeteer/CDN 없음
 * 병렬 4개 동시 처리
 * ─────────────────────────────────────────────────────
 * 실행: node scripts/math_phase1_fast.mjs
 */

import fs   from 'fs';
import path  from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import mupdf from 'mupdf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 설정 ──────────────────────────────────────────────
const ROOT               = '\\\\Subitmainpc\\수학의 빛 사무폴더';
const TARGET_FOLDER_NAME = '@@매쓰플랫';
const BASE_CROP_DIR      = path.join(__dirname, '../public/math_crops/매쓰플랫_ultimate');
const DPI                = 150;      // 렌더 해상도 (150dpi ≈ 2x, 빠름)
const MAX_PAGES          = 6;        // 문제집당 최대 렌더 페이지
const SLICES_PER_PAGE    = 4;        // 페이지당 세로 슬라이스 수
const CONCURRENCY        = 4;        // 동시 처리 쌍 수
// ──────────────────────────────────────────────────────

// ── 1. 재귀 PDF 탐색 ───────────────────────────────────
let pdfList = [];
function findPdfs(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const d of entries) {
        if (d.name.toLowerCase().endsWith('.lnk')) continue;
        const full = path.join(dir, d.name);
        if (d.isDirectory())                               findPdfs(full);
        else if (d.isFile() && d.name.toLowerCase().endsWith('.pdf')) {
            pdfList.push(full);
            if (pdfList.length % 100 === 0)
                console.log(`[SCAN] ${pdfList.length}개 발견 중...`);
        }
    }
}

// ── 2. PDF 1파일 → PNG 슬라이스 (mupdf 네이티브) ────────
async function pdfToPngs(pdfPath, outDir, prefix) {
    if (!fs.existsSync(pdfPath)) return [];

    let doc;
    try {
        doc = mupdf.Document.openDocument(fs.readFileSync(pdfPath), 'application/pdf');
    } catch (e) {
        console.error(`  [PDF OPEN ERROR] ${path.basename(pdfPath)}: ${e.message}`);
        return [];
    }

    const numPages  = Math.min(doc.countPages(), MAX_PAGES);
    const resultPaths = [];
    const scale     = DPI / 72; // 72dpi → target DPI

    for (let pageIdx = 0; pageIdx < numPages; pageIdx++) {
        let page;
        try {
            page = doc.loadPage(pageIdx);
        } catch (e) {
            console.error(`  [PAGE ERROR] p${pageIdx}: ${e.message}`);
            continue;
        }

        const bounds = page.getBounds();
        const W = Math.round((bounds[2] - bounds[0]) * scale);
        const H = Math.round((bounds[3] - bounds[1]) * scale);

        // mupdf Pixmap 렌더
        const matrix = mupdf.Matrix.scale(scale, scale);
        let pixmap;
        try {
            pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
        } catch (e) {
            console.error(`  [RENDER ERROR] p${pageIdx}: ${e.message}`);
            continue;
        }

        const pngData = pixmap.asPNG();
        const pngBuffer = Buffer.from(pngData);
        pixmap.destroy();

        // 세로 4등분 슬라이스
        const sliceH = Math.floor(H / SLICES_PER_PAGE);
        for (let s = 0; s < SLICES_PER_PAGE; s++) {
            const sliceNum = pageIdx * SLICES_PER_PAGE + s + 1;
            const fileName = `${prefix}${String(sliceNum).padStart(3, '0')}.png`;
            const fullPath = path.join(outDir, fileName);
            try {
                await sharp(pngBuffer)
                    .extract({ left: 0, top: s * sliceH, width: W, height: sliceH })
                    .png({ compressionLevel: 6 })
                    .toFile(fullPath);
                resultPaths.push(fileName);
            } catch (e) {
                console.error(`  [CROP ERROR] ${fileName}: ${e.message}`);
            }
        }
    }

    doc.destroy();
    return resultPaths;
}

// ── 3. PDF 쌍 1개 처리 ──────────────────────────────────
async function processPair(pair, total, idx) {
    const { baseName, question, answer, folder } = pair;
    const outDir   = path.join(BASE_CROP_DIR, baseName);
    const metaPath = path.join(outDir, 'metadata.json');

    if (fs.existsSync(metaPath)) {
        process.stdout.write(`[SKIP] ${baseName}\n`);
        return;
    }

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    console.log(`\n[${idx}/${total}] ${baseName}`);

    let qImages = [], sImages = [];

    if (question) {
        const qNames = await pdfToPngs(question, outDir, 'q');
        qImages = qNames.map(n => `/math_crops/매쓰플랫_ultimate/${baseName}/${n}`);
        console.log(`  q PNG: ${qNames.length}장`);
    }
    if (answer) {
        const sNames = await pdfToPngs(answer, outDir, 's');
        sImages = sNames.map(n => `/math_crops/매쓰플랫_ultimate/${baseName}/${n}`);
        console.log(`  s PNG: ${sNames.length}장`);
    }

    // items: 문제 이미지 기준 (Phase2 GPT 호출 포맷 호환)
    const items = qImages.map((qImg, i) => ({
        number: i + 1,
        qImg,
        sImg:     sImages[i] || null,
        sText:    null,
        sOcrText: null,
    }));

    const meta = {
        schemaVersion:      '2.0_MUPDF_FAST',
        baseName,
        pdfPath:            question || answer,
        originalFolderPath: folder,
        questionPdf:        question || null,
        answerPdf:          answer   || null,
        qImages,
        sImages,
        items,
        phase1_done:  true,
        processedAt:  new Date().toISOString(),
    };

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log(`  => [DONE] items: ${items.length}`);
}

// ── 4. 병렬 처리 ────────────────────────────────────────
async function runWithConcurrency(tasks, limit) {
    let i = 0;
    async function worker() {
        while (i < tasks.length) { const t = tasks[i++]; await t(); }
    }
    await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
}

// ── 5. 메인 ─────────────────────────────────────────────
async function main() {
    console.log(`\n${'═'.repeat(54)}`);
    console.log(` [PHASE 1 FAST] PDF → PNG  (MuPDF + Sharp)`);
    console.log(` 엔진: mupdf(WASM) | DPI: ${DPI} | 병렬: ${CONCURRENCY}개`);
    console.log(`${'═'.repeat(54)}`);

    if (!fs.existsSync(BASE_CROP_DIR)) fs.mkdirSync(BASE_CROP_DIR, { recursive: true });

    const targetFolder = path.join(ROOT, TARGET_FOLDER_NAME);
    console.log(`\n[탐색] ${targetFolder}`);

    if (!fs.existsSync(targetFolder)) {
        console.error('[ERROR] 네트워크 드라이브 연결 확인 필요:', targetFolder);
        process.exit(1);
    }

    findPdfs(targetFolder);
    console.log(`[탐색 완료] 총 ${pdfList.length}개 PDF`);

    // 문제/해설 쌍 구성
    const pdfPairs = new Map();
    for (const p of pdfList) {
        const base = path.basename(p)
            .replace(/_(답안지|정답|해설|해)\.pdf$/i, '')
            .replace(/\.pdf$/i, '');
        const type = /_(답안지|정답|해설|해)\.pdf$/i.test(p) ? 'answer' : 'question';
        const key  = path.join(path.dirname(p), base);
        if (!pdfPairs.has(key))
            pdfPairs.set(key, { question: null, answer: null, baseName: base, folder: path.dirname(p) });
        pdfPairs.get(key)[type] = p;
    }

    const pairs   = [...pdfPairs.values()].filter(p => p.question || p.answer);
    const pending = pairs.filter(p => !fs.existsSync(path.join(BASE_CROP_DIR, p.baseName, 'metadata.json')));

    console.log(`[쌍 구성]   총 ${pairs.length}쌍`);
    console.log(`[처리 대상] ${pending.length}쌍  (완료 ${pairs.length - pending.length}개 SKIP)\n`);

    if (pending.length === 0) { console.log('[완료] 모든 PDF 처리됨!'); return; }

    let done = 0;
    const t0 = Date.now();

    const tasks = pending.map((pair, i) => async () => {
        await processPair(pair, pending.length, i + 1);
        done++;
        const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
        const eta     = done > 0 ? Math.round(((Date.now() - t0) / done) * (pending.length - done) / 1000) : '?';
        console.log(`[진행] ${done}/${pending.length} | 경과: ${elapsed}s | 남은예상: ${eta}s`);
    });

    await runWithConcurrency(tasks, CONCURRENCY);

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n${'═'.repeat(54)}`);
    console.log(` [PHASE 1 완료]`);
    console.log(` 처리: ${pending.length}쌍 | 소요: ${elapsed}s | 평균: ${(elapsed/pending.length).toFixed(1)}s/쌍`);
    console.log(` 다음: node scripts/math_phase2_ultimate_gpt.cjs`);
    console.log(`${'═'.repeat(54)}`);
}

main().catch(e => { console.error('[FATAL]', e); process.exit(1); });
