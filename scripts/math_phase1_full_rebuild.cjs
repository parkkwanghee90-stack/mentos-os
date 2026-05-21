const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const OUTPUT_ROOT = "C:\\mentos_os_clean\\public\\math_crops";
const REPORT_PATH = path.join(OUTPUT_ROOT, "full_rebuild_report.json");
const RESUME_PATH = path.join(OUTPUT_ROOT, "rebuild_resume_state.json");

function getPdfFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            if (fs.statSync(fullPath).isDirectory()) {
                getPdfFiles(fullPath, fileList);
            } else if (fullPath.toLowerCase().endsWith('.pdf')) {
                fileList.push(fullPath);
            }
        } catch(e) {}
    }
    return fileList;
}

async function forceRebuild() {
    let state = { completed: {}, total_pngs: 0 };
    
    // We only resume from a crash in THIS current new run. 
    // To reset, we just started. But since user said "no skip, overwrite", we ignore old PNGs,
    // only skipping exact PDF paths listed in resume state if script crashed halfway.
    if (fs.existsSync(RESUME_PATH)) {
        try { state = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8')); } catch(e){}
    }

    const TARGET_DIRS = [
        "(1)수학(상)중간", "(2)수학(상)기말", "(3)수학(하)중간", "(4)수학(하)기말",
        "(5)수학1 중간", "(6)수학1 기말", "(7)수학2", "미적분", "확통"
    ];

    let allPdfs = [];
    console.log("경로 스캔 및 PDF 탐색 중...");
    for (let t of TARGET_DIRS) {
        let tp = path.join(SOURCE_ROOT, t);
        if (fs.existsSync(tp)) {
            allPdfs = allPdfs.concat(getPdfFiles(tp));
        }
    }
    console.log(`[시작] 총 ${allPdfs.length}개의 PDF를 탐색했습니다. 렌더링을 시작합니다.`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    let missingPagesList = [];
    let zeroPngFolders = [];
    let emptyFoldersLog = [];

    const htmlData = `
        <!DOCTYPE html>
        <html>
        <head><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script></head>
        <body style="margin:0; padding:0; background:white;">
            <canvas id="canvas" style="display:block;"></canvas>
            <script>
                window.renderPage = async function(b64, pNum) {
                    try {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                        const bin = window.atob(b64);
                        const bytes = new Uint8Array(bin.length);
                        for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                        const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                        
                        const maxPages = pdf.numPages;
                        if (pNum > maxPages) return { done: true };
                        
                        const pPage = await pdf.getPage(pNum);
                        const scale = 3.0; // 300dpi 이상 해상도 유지
                        const viewport = pPage.getViewport({ scale });
                        const canvas = document.getElementById('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        await pPage.render({ canvasContext: context, viewport: viewport }).promise;
                        
                        return { w: canvas.width, h: canvas.height, total: maxPages };
                    } catch(e) {
                        return { error: e.message };
                    }
                }
            </script>
        </body>
        </html>
    `;
    await page.setContent(htmlData);

    for (let i = 0; i < allPdfs.length; i++) {
        const pdfFile = allPdfs[i];
        
        if (state.completed[pdfFile]) {
            console.log(`[${i+1}/${allPdfs.length}] 패스 (Resume state): ${path.basename(pdfFile)}`);
            continue;
        }

        const relativePath = path.relative(SOURCE_ROOT, pdfFile);
        const baseDir = path.dirname(relativePath);
        const baseName = path.basename(pdfFile, '.pdf');
        
        const targetOutputFolder = path.join(OUTPUT_ROOT, baseDir, baseName);
        
        try {
            if (fs.existsSync(targetOutputFolder)) {
                fs.rmSync(targetOutputFolder, { recursive: true, force: true });
            }
            fs.mkdirSync(targetOutputFolder, { recursive: true });
            
            console.log(`[${i+1}/${allPdfs.length}] 변환 중: ${relativePath}`);
            
            const pdfBase64 = fs.readFileSync(pdfFile).toString('base64');
            let currentPage = 1;
            let totalPages = 1;

            while (currentPage <= totalPages) {
                const res = await page.evaluate(async (b64, num) => await window.renderPage(b64, num), pdfBase64, currentPage);
                if (res.error) throw new Error(res.error);
                if (!res || res.done) break;

                totalPages = res.total;
                
                await page.setViewport({ width: res.w, height: res.h, deviceScaleFactor: 1 });
                
                const pageNumStr = String(currentPage).padStart(3, '0');
                const outPng = path.join(targetOutputFolder, `page_${pageNumStr}.png`);
                
                await page.screenshot({ path: outPng, fullPage: true });
                state.total_pngs++;
                currentPage++;
            }
            
            const generatedPages = currentPage - 1;
            if (generatedPages === 0) {
                zeroPngFolders.push(targetOutputFolder);
            } else if (generatedPages < totalPages) {
                missingPagesList.push({ pdf: pdfFile, expected: totalPages, generated: generatedPages });
            }
            
            console.log(`  -> ${generatedPages}장 완료`);
            state.completed[pdfFile] = generatedPages;
            
            // Save state to disk every process
            fs.writeFileSync(RESUME_PATH, JSON.stringify(state, null, 2));

        } catch(e) {
            console.log(`  -> [오류] ${e.message}`);
            emptyFoldersLog.push(pdfFile);
        }
    }

    await browser.close();

    // Summary Report
    const folderStats = {};
    for (let c of Object.keys(state.completed)) {
        let relativePath = path.relative(SOURCE_ROOT, c);
        let topFolder = relativePath.split(path.sep)[0];
        if (!folderStats[topFolder]) folderStats[topFolder] = 0;
        folderStats[topFolder] += state.completed[c];
    }

    const report = {
        total_pdfs_found: allPdfs.length,
        total_pngs_generated: state.total_pngs,
        pdf_vs_png_misses: missingPagesList,
        zero_png_folders: zeroPngFolders,
        png_count_by_folder: folderStats,
        errors: emptyFoldersLog
    };
    
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    // Clean up resume state after 100% complete
    if (fs.existsSync(RESUME_PATH)) fs.unlinkSync(RESUME_PATH);

    console.log("==========================================");
    console.log("✅ 전체 Full Rebuild 변환 완료!");
    console.log(`총 PDF: ${report.total_pdfs_found}개`);
    console.log(`총 PNG: ${report.total_pngs_generated}장`);
    console.log(`에러 파일: ${report.errors.length}개`);
    console.log("==========================================");
}

// Clean resume state if starting fresh. The user asked for Full Rebuild NO SKIP.
// If RESUME_PATH is older than 1 hr, assume fresh start.
if (fs.existsSync(RESUME_PATH)) {
    const stats = fs.statSync(RESUME_PATH);
    if (Date.now() - stats.mtimeMs > 3600000) {
        fs.unlinkSync(RESUME_PATH);
    }
}

forceRebuild().catch(console.error);
