const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
const TARGET_FOLDER = "@@매쓰플랫";
const testPdfName = "고등수학(상)중간고사 2020 1+1(쌍둥이)p21";
const testPdfPath = path.join(ROOT, TARGET_FOLDER, "(1)수학(상)중간", testPdfName + ".pdf");
const outDir = path.join(__dirname, '../public/math_crops/매쓰플랫_ultimate');

if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

async function runUltimatePipeline() {
    if (!fs.existsSync(testPdfPath)) return console.error(`[ERROR] PDF를 찾을 수 없음: ${testPdfPath}`);

    const pdfDataBuffer = fs.readFileSync(testPdfPath);
    const pdfBase64 = pdfDataBuffer.toString('base64');
    
    console.log(`[START] Ultimate Label Matching Crop Engine (Q/S 1:1 완벽 동기화)`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <html>
      <head><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script></head>
      <body>
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            
            // 문자열에서 앞의 숫자만 추출 (ex: "01", "1.", "(1)" -> 1)
            function normalizeLabel(text) {
                const match = text.match(/\\d+/);
                return match ? parseInt(match[0], 10) : null;
            }

            window.analyzePdf = async function(base64Data) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i=0; i<binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                
                let fastAnswerPage = -1;
                let refSolutionPage = -1;
                const pagesData = [];

                // 1단계: 전체 텍스트 스캔 및 레이아웃 Anchor 감지
                for (let p = 1; p <= pdf.numPages; p++) {
                    const pdfPage = await pdf.getPage(p);
                    const viewport = pdfPage.getViewport({scale: 2.5});
                    const textContent = await pdfPage.getTextContent();
                    
                    const words = textContent.items.map(it => it.str).join(" ");
                    
                    // 해설지 구간 판별
                    const textNoSpace = words.replace(/\\s+/g, "");
                    if (fastAnswerPage === -1 && (textNoSpace.includes("빠른정답") || textNoSpace.includes("정답표"))) fastAnswerPage = p;
                    if (fastAnswerPage !== -1 && p > fastAnswerPage) {
                        if (refSolutionPage === -1 && (textNoSpace.includes("이므로") || textNoSpace.includes("대입") || textNoSpace.includes("정리하면"))) {
                            refSolutionPage = p;
                        }
                    }

                    const midX = viewport.width / 2;
                    let leftAnchor = null;
                    let rightAnchor = null;

                    for (let item of textContent.items) {
                        const text = item.str.trim();
                        // 문제 번호 탐색
                        if (/^(?:문제\\s*\\d+|\\d{1,2}\\.|0\\d{1,2}\\.|0?\\d{1,2}|\\(\\d+\\))$/.test(text) && text !== "0" && text !== "1") {
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            const y = pt[1];
                            const x = pt[0];
                            if (y > 50) { // 상단 헤더 무시
                                if (x < midX && (!leftAnchor || y < leftAnchor.y)) leftAnchor = {text, num: normalizeLabel(text), x, y, viewportWidth: viewport.width, viewportHeight: viewport.height};
                                else if (x >= midX && (!rightAnchor || y < rightAnchor.y)) rightAnchor = {text, num: normalizeLabel(text), x, y, viewportWidth: viewport.width, viewportHeight: viewport.height};
                            }
                        }
                    }

                    // OCR Preview 텍스트 확보 (페이지 단위)
                    const leftTexts = [];
                    const rightTexts = [];
                    for (let item of textContent.items) {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        if (pt[0] < midX) leftTexts.push(item.str);
                        else rightTexts.push(item.str);
                    }

                    pagesData.push({
                        page: p,
                        width: viewport.width,
                        height: viewport.height,
                        leftAnchor,
                        rightAnchor,
                        leftText: leftTexts.join(" "),
                        rightText: rightTexts.join(" ")
                    });
                }

                if (refSolutionPage === -1 && fastAnswerPage !== -1) refSolutionPage = fastAnswerPage + 1;
                if (refSolutionPage === -1) refSolutionPage = pdf.numPages - 1; 

                // 2단계: 번호 기반 매칭
                const questions = [];
                const solutions = [];
                
                for (let dat of pagesData) {
                    if (dat.page < (fastAnswerPage !== -1 ? fastAnswerPage : refSolutionPage)) {
                        // 문제 구간
                        if(dat.leftAnchor) questions.push({ num: dat.leftAnchor.num, label: dat.leftAnchor.text, page: dat.page, side: 'left', y: dat.leftAnchor.y, maxH: dat.height, maxW: dat.width, text: dat.leftText });
                        if(dat.rightAnchor) questions.push({ num: dat.rightAnchor.num, label: dat.rightAnchor.text, page: dat.page, side: 'right', y: dat.rightAnchor.y, maxH: dat.height, maxW: dat.width, text: dat.rightText });
                    } else if (dat.page >= refSolutionPage) {
                        // 해설 구간
                        if(dat.leftAnchor) solutions.push({ num: dat.leftAnchor.num, label: dat.leftAnchor.text, page: dat.page, side: 'left', y: dat.leftAnchor.y, maxH: dat.height, maxW: dat.width, text: dat.leftText });
                        if(dat.rightAnchor) solutions.push({ num: dat.rightAnchor.num, label: dat.rightAnchor.text, page: dat.page, side: 'right', y: dat.rightAnchor.y, maxH: dat.height, maxW: dat.width, text: dat.rightText });
                    }
                }

                // 매칭 쌍 만들기
                const pairs = [];
                for (let q of questions) {
                    const s = solutions.find(sol => sol.num === q.num);
                    if (q && s) pairs.push({ num: q.num, question: q, solution: s });
                }

                // 오름차순 정렬
                pairs.sort((a,b) => a.num - b.num);

                // 상위 4개 추출 (테스트용)
                return pairs.slice(0, 4);
            };

            window.renderSpecificPage = async function(base64Data, pageNum) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                const pdfPage = await pdf.getPage(pageNum);
                const viewport = pdfPage.getViewport({scale: 2.5}); 
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await pdfPage.render({canvasContext: ctx, viewport}).promise;
                return canvas.toDataURL('image/png');
            };
        </script>
      </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log(`[분석] PDF 내 모든 페이지/앵커 텍스트 전수조사 및 1:1 매칭 시작...`);
    const pairs = await page.evaluate(async (b64) => await window.analyzePdf(b64), pdfBase64);
    
    if (!pairs || pairs.length === 0) {
        console.log(`[ERROR] 쌍을 이룰 수 있는 문제/해설 번호가 없습니다.`);
        await browser.close();
        return;
    }

    console.log(`==================================================`);
    console.log(`[완료] 총 ${pairs.length}쌍의 문제-해설 매칭 발견 완료 (1부터 오름차순 출력)`);
    console.log(`==================================================`);

    // 랜더링 캐시 (동일 페이지를 여러번 렌더링하지 않도록)
    const pageCache = new Map();

    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const idxStr = String(i + 1).padStart(3, '0');
        
        console.log(`\n=> [매칭 #${idxStr}] 번호: ${pair.num} (Q 페이지: ${pair.question.page}, S 페이지: ${pair.solution.page}) 시작`);

        // 1. 문제 렌더링 및 파일화
        let qPageNum = pair.question.page;
        if(!pageCache.has(qPageNum)) {
            let b64 = await page.evaluate(async (b64, pNum) => await window.renderSpecificPage(b64, pNum), pdfBase64, qPageNum);
            pageCache.set(qPageNum, Buffer.from(b64.split(',')[1], 'base64'));
        }
        
        let qBuf = pageCache.get(qPageNum);
        const qX = pair.question.side === 'left' ? 0 : Math.floor(pair.question.maxW / 2);
        const qY = Math.max(0, pair.question.y - 30);
        const qW = Math.floor(pair.question.maxW / 2);
        const qH = Math.floor(pair.question.maxH - qY);

        const qCrop = await sharp(qBuf).extract({ left: Math.floor(qX), top: Math.floor(qY), width: Math.floor(qW), height: Math.floor(qH) }).toBuffer();
        fs.writeFileSync(path.join(outDir, `q${idxStr}.png`), qCrop);
        fs.writeFileSync(path.join(outDir, `q${idxStr}_ocr.txt`), pair.question.text);
        
        // 2. 해설 렌더링 및 파일화
        let sPageNum = pair.solution.page;
        if(!pageCache.has(sPageNum)) {
            let b64 = await page.evaluate(async (b64, pNum) => await window.renderSpecificPage(b64, pNum), pdfBase64, sPageNum);
            pageCache.set(sPageNum, Buffer.from(b64.split(',')[1], 'base64'));
        }

        let sBuf = pageCache.get(sPageNum);
        const sX = pair.solution.side === 'left' ? 0 : Math.floor(pair.solution.maxW / 2);
        const sY = Math.max(0, pair.solution.y - 30);
        const sW = Math.floor(pair.solution.maxW / 2);
        const sH = Math.floor(pair.solution.maxH - sY);

        const sCrop = await sharp(sBuf).extract({ left: Math.floor(sX), top: Math.floor(sY), width: Math.floor(sW), height: Math.floor(sH) }).toBuffer();
        fs.writeFileSync(path.join(outDir, `s${idxStr}.png`), sCrop);
        fs.writeFileSync(path.join(outDir, `s${idxStr}_ocr.txt`), pair.solution.text);

        console.log(`[저장완료] q${idxStr}.png / s${idxStr}.png`);
        console.log(`[텍스트 샘플] Q: ${pair.question.text.replace(/\\s+/g, ' ').substring(0, 40)}...`);
        console.log(`[텍스트 샘플] S: ${pair.solution.text.replace(/\\s+/g, ' ').substring(0, 40)}...`);
    }

    await browser.close();
    console.log(`\n[완료] 1:1 완벽 동기화된 크롭 시스템 처리 성공!`);
}

runUltimatePipeline();
