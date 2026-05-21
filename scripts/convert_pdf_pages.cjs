const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const crypto = require('crypto');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\11.집중학습\\2020 집중학습\\(1)수학상(12회차)";
const OUTPUT_ROOT = "C:\\mentos_os_clean\\public\\math_pngs\\(1)수학상(12회차)";

function getPdfFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getPdfFiles(fullPath, fileList);
        } else if (fullPath.toLowerCase().endsWith('.pdf')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

async function convertPdfsToPngs() {
    let summary = {
        total_pdfs: 0,
        total_pngs: 0,
        failed_files: [],
        output_path: OUTPUT_ROOT
    };

    const pdfs = getPdfFiles(SOURCE_ROOT);
    summary.total_pdfs = pdfs.length;
    console.log(`[시작] 총 ${pdfs.length}개의 PDF를 탐색했습니다.`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    
    // Use an individual page internally to avoid memory leaks
    
    for (let i = 0; i < pdfs.length; i++) {
        const pdfFile = pdfs[i];
        const relativePath = path.relative(SOURCE_ROOT, pdfFile);
        const baseDir = path.dirname(relativePath);
        const baseName = path.basename(pdfFile, '.pdf');
        
        // Output directory: OUTPUT_ROOT / relative_path_dir / file_basename
        const targetOutputFolder = path.join(OUTPUT_ROOT, baseDir, baseName);
        if (!fs.existsSync(targetOutputFolder)) {
            fs.mkdirSync(targetOutputFolder, { recursive: true });
        }

        console.log(`[${i+1}/${pdfs.length}] 변환 중: ${baseName}...`);
        
        const page = await browser.newPage();
        
        try {
            const htmlData = `
                <!DOCTYPE html>
                <html>
                <head><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script></head>
                <body style="margin:0; padding:0; background:white;">
                    <canvas id="canvas" style="display:block;"></canvas>
                    <script>
                        window.renderPage = async function(b64, pNum) {
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                            const bin = window.atob(b64);
                            const bytes = new Uint8Array(bin.length);
                            for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                            const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                            
                            const maxPages = pdf.numPages;
                            if (pNum > maxPages) return { done: true };
                            
                            const pPage = await pdf.getPage(pNum);
                            const scale = 3.0; // High resolution
                            const viewport = pPage.getViewport({ scale });
                            const canvas = document.getElementById('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            
                            await pPage.render({ canvasContext: context, viewport: viewport }).promise;
                            
                            return { 
                                w: canvas.width, 
                                h: canvas.height,
                                total: maxPages
                            };
                        }
                    </script>
                </body>
                </html>
            `;
            await page.setContent(htmlData);

            const pdfBase64 = fs.readFileSync(pdfFile).toString('base64');
            let currentPage = 1;
            let totalPages = 1;

            while (currentPage <= totalPages) {
                // Call render
                const res = await page.evaluate(async (b64, num) => await window.renderPage(b64, num), pdfBase64, currentPage);
                if (!res || res.done) break;

                totalPages = res.total;
                
                await page.setViewport({ width: res.w, height: res.h, deviceScaleFactor: 1 });
                await new Promise(r => setTimeout(r, 100)); // small delay to paint
                
                const pageNumStr = String(currentPage).padStart(3, '0');
                const outPng = path.join(targetOutputFolder, `page_${pageNumStr}.png`);
                
                await page.screenshot({ path: outPng, fullPage: true });
                summary.total_pngs++;
                
                currentPage++;
            }
            console.log(`  -> ${currentPage-1}페이지 변환 완료`);
        } catch(e) {
            console.log(`  -> [실패] 에러 발생: ${e.message}`);
            summary.failed_files.push(pdfFile);
        } finally {
            await page.close();
        }
    }

    await browser.close();

    fs.writeFileSync(path.join(OUTPUT_ROOT, 'summary_report.json'), JSON.stringify(summary, null, 2));
    
    console.log("===================================");
    console.log("변환 작업 완료!");
    console.log(`전체 PDF: ${summary.total_pdfs} 개`);
    console.log(`생성 PNG: ${summary.total_pngs} 장`);
    console.log(`실패: ${summary.failed_files.length} 개`);
    console.log(`요약 및 출력위치: ${summary.output_path}\\summary_report.json`);
}

convertPdfsToPngs().catch(console.error);
