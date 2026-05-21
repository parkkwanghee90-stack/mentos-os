const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const OUTPUT_ROOT = "C:\\mentos_os_clean\\public\\math_crops";
const REPORT_PATH = path.join(OUTPUT_ROOT, "smart_resume_report.json");

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

async function smartResumeRebuild() {
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
    console.log(`총 ${allPdfs.length}개의 PDF를 찾았습니다. 기존 PNG 존재 여부를 검사합니다...`);

    let todoPdfs = [];
    let skippedCount = 0;

    for (const pdfFile of allPdfs) {
        const relativePath = path.relative(SOURCE_ROOT, pdfFile);
        const baseDir = path.dirname(relativePath);
        const baseName = path.basename(pdfFile, '.pdf');
        const targetOutputFolder = path.join(OUTPUT_ROOT, baseDir, baseName);

        let hasValidPngs = false;
        if (fs.existsSync(targetOutputFolder)) {
            const files = fs.readdirSync(targetOutputFolder);
            const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));
            if (pngs.length > 0) hasValidPngs = true;
        }

        if (hasValidPngs) {
            skippedCount++;
        } else {
            todoPdfs.push(pdfFile);
        }
    }

    console.log(`[분석 결과] 이미 정상 생성된 파일: ${skippedCount}개 (Skip)`);
    console.log(`[작업 대상] 누락되거나 비어있는 폴더: ${todoPdfs.length}개`);

    if (todoPdfs.length === 0) {
        console.log("모든 PDF가 이미 PNG로 변환되어 있습니다! 작업을 종료합니다.");
        return;
    }

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    let newGeneratedCount = 0;
    let failedList = [];

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
                        const scale = 3.0;
                        const viewport = pPage.getViewport({ scale });
                        const canvas = document.getElementById('canvas');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        const context = canvas.getContext('2d');
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

    for (let i = 0; i < todoPdfs.length; i++) {
        const pdfFile = todoPdfs[i];
        const relativePath = path.relative(SOURCE_ROOT, pdfFile);
        const baseDir = path.dirname(relativePath);
        const baseName = path.basename(pdfFile, '.pdf');
        
        const targetOutputFolder = path.join(OUTPUT_ROOT, baseDir, baseName);
        
        try {
            if (!fs.existsSync(targetOutputFolder)) fs.mkdirSync(targetOutputFolder, { recursive: true });
            
            console.log(`[${i+1}/${todoPdfs.length}] 빈 폴더/누락 파일 복구 중: ${baseName}`);
            
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
                newGeneratedCount++;
                currentPage++;
            }
            console.log(`  -> ${currentPage-1}장 생성 복구 완료!`);

        } catch(e) {
            console.log(`  -> [복구 실패] ${e.message}`);
            failedList.push(pdfFile);
        }
    }

    await browser.close();

    const report = {
        total_pdfs_in_network: allPdfs.length,
        already_skipped: skippedCount,
        newly_repaired_pdfs: todoPdfs.length - failedList.length,
        newly_generated_png_pages: newGeneratedCount,
        failed_during_repair: failedList
    };
    
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

    console.log("\n==========================================");
    console.log("✅ 스마트 복구 변환 완료!");
    console.log(`기존 파일 스킵: ${report.already_skipped}개 유지`);
    console.log(`복구 성공 PDF: ${report.newly_repaired_pdfs}개`);
    console.log(`새로 구운 PNG: ${report.newly_generated_png_pages}장`);
    if(failedList.length > 0) console.log(`최종 실패: ${failedList.length}건`);
    console.log("==========================================");
}

smartResumeRebuild().catch(console.error);
