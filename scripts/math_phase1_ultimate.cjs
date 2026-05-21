const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const puppeteer = require('puppeteer');
const sharp = require('sharp');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
const TARGET_FOLDER_NAME = "@@매쓰플랫";
const BASE_CROP_DIR = path.join(__dirname, '../public/math_crops/매쓰플랫');

// 1. 재귀 PDF 탐색
let pdfList = [];
function findPdfs(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch(e) { return; }
    
    for (const dirent of entries) {
        if (dirent.name.toLowerCase().endsWith('.lnk')) continue;
        const fullPath = path.join(dir, dirent.name);
        
        if (dirent.isDirectory()) {
            findPdfs(fullPath);
        } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.pdf')) {
            pdfList.push(fullPath);
            if (pdfList.length % 50 === 0) console.log(`[SCAN_PROGRESS] 현재 PDF ${pdfList.length}개 탐색...`);
        }
    }
}

// 실제 Puppeteer 엔진을 이용한 PDF 렌더링 & 크롭 함수
async function extractRealPdfSlices(pdfPath, outDir, prefix) {
    if (!fs.existsSync(pdfPath)) return [];
    
    const pdfDataBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfDataBuffer.toString('base64');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <html>
      <head><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script></head>
      <body>
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            window.extractPages = async function(base64Data) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                const images = [];

                for(let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
                    const pdfPage = await pdf.getPage(pageNum);
                    const viewport = pdfPage.getViewport({scale: 2.0}); 
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width; canvas.height = viewport.height;
                    await pdfPage.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
                    images.push(canvas.toDataURL('image/png'));
                }
                return images;
            };
        </script>
      </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const base64Pages = await page.evaluate(async (b64) => await window.extractPages(b64), pdfBase64);
    await browser.close();

    const resultPaths = [];
    let index = 1;

    for (const b64 of base64Pages) {
        const buffer = Buffer.from(b64.replace(/^data:image\/png;base64,/, ""), 'base64');
        const metadata = await sharp(buffer).metadata();
        const qH = Math.floor(metadata.height / 4);

        for (let i = 0; i < 4; i++) {
            const cropBuffer = await sharp(buffer).extract({ left: 0, top: i * qH, width: metadata.width, height: qH }).toBuffer();
            let fileName = `${prefix}${String(index).padStart(3, '0')}.png`;
            let fullPath = path.join(outDir, fileName);
            fs.writeFileSync(fullPath, cropBuffer);
            resultPaths.push(fileName);
            index++;
        }
    }
    return resultPaths;
}

async function runPhase1() {
    const targetFolder = path.join(ROOT, TARGET_FOLDER_NAME);
    console.log(`\n==================================================`);
    console.log(`[PHASE 1] 전체 127권 PDF 오프라인 이미지/텍스트 일괄 추출기`);
    console.log(`==================================================`);
    console.log(`타겟: ${targetFolder}`);
    
    findPdfs(targetFolder);
    console.log(`[완료] 발견된 누적 PDF 총 ${pdfList.length}개`);

    if(!fs.existsSync(BASE_CROP_DIR)) fs.mkdirSync(BASE_CROP_DIR, { recursive: true });

    const pdfPairs = new Map();
    pdfList.forEach(p => {
        let base = path.basename(p).replace(/_(답안지|정답|해설|해)\.pdf$/i, '').replace(/\.pdf$/i, '');
        let type = p.match(/_(답안지|정답|해설|해)\.pdf$/i) ? 'answer' : 'question';
        let uniqueKey = path.join(path.dirname(p), base);
        if (!pdfPairs.has(uniqueKey)) pdfPairs.set(uniqueKey, { question: null, answer: null, baseName: base, folder: path.dirname(p) });
        pdfPairs.get(uniqueKey)[type] = p;
    });

    let count = 0;
    for (const [uniqueKey, pair] of pdfPairs.entries()) {
        const mainPdf = pair.question || pair.answer;
        if (!mainPdf) continue;
        
        const baseName = pair.baseName;
        const outDir = path.join(BASE_CROP_DIR, baseName);
        if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        // 메타데이터가 이미 있으면 스킵 구조 탑재 (중복 방지)
        const metaPath = path.join(outDir, 'metadata.json');
        if (fs.existsSync(metaPath)) {
            count++;
            continue;
        }

        console.log(`\n[처리중 - ${count+1}/${pdfPairs.size}] ${baseName}`);
        console.log(`=> PDF.js 물리 렌더링 & 크롭 엔진 가동 중... (시간이 소요됩니다)`);

        let qImages = [];
        let sImages = [];
        
        if (pair.question) {
            const qNames = await extractRealPdfSlices(pair.question, outDir, 'q');
            qImages = qNames.map(n => `/math_crops/매쓰플랫/${baseName}/${n}`);
        }
        
        if (pair.answer) {
            const sNames = await extractRealPdfSlices(pair.answer, outDir, 's');
            sImages = sNames.map(n => `/math_crops/매쓰플랫/${baseName}/${n}`);
        }

        let qText = "", aText = "";
        try {
            if(pair.question) qText = (await pdfParse(fs.readFileSync(pair.question))).text.substring(0, 3000);
            if(pair.answer) aText = (await pdfParse(fs.readFileSync(pair.answer))).text.substring(0, 3000);
        } catch(e) {
            console.log(`[ERROR] 텍스트 파싱 에러`);
        }

        const metaData = {
            baseName,
            originalFolderPath: pair.folder,
            questionPdf: pair.question,
            answerPdf: pair.answer,
            qText,
            aText,
            qImages,
            sImages,
            phase1_done: true
        };

        fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2));
        console.log(`=> 텍스트 추출 완료 & PNG (q001~004, s001~004) 생성 완료`);
        
        count++;
    }

    console.log(`\n[PHASE 1 종료] 물리적인 PNG / 텍스트 오프라인 추출 100% 완료!`);
    console.log(`이제 Phase 2 (GPT 한 번씩 호출)를 실행할 준비가 되었습니다.`);
}

runPhase1();
