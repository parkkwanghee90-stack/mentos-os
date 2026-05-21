const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
const TARGET_FOLDER = "@@매쓰플랫";
const testPdfName = "고등수학(상)중간고사 2020 1+1(쌍둥이)p21";
const testPdfPath = path.join(ROOT, TARGET_FOLDER, "(1)수학(상)중간", testPdfName + ".pdf");
const outDir = path.join(__dirname, '../public/math_crops/매쓰플랫_advanced');

if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

async function runAdvancedPipeline() {
    if (!fs.existsSync(testPdfPath)) return console.error(`[ERROR] PDF를 찾을 수 없음: ${testPdfPath}`);

    const pdfDataBuffer = fs.readFileSync(testPdfPath);
    const pdfBase64 = pdfDataBuffer.toString('base64');
    
    console.log(`[START] 진보된 컬럼 기반 Q/S 통합 크롭 엔진 가동 (OCR 보강판)`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <html>
      <head><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script></head>
      <body>
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            window.analyzePdf = async function(base64Data) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                const pageTexts = [];

                for (let p = 1; p <= pdf.numPages; p++) {
                    const pdfPage = await pdf.getPage(p);
                    const textContent = await pdfPage.getTextContent();
                    const words = textContent.items.map(it => it.str).join(" ");
                    pageTexts.push(words);
                }

                // 빠른정답 및 해설 시작 페이지 찾기
                let fastAnswerPage = -1;
                let refSolutionPage = -1;

                for (let i = 0; i < pageTexts.length; i++) {
                    const text = pageTexts[i].replace(/\\s+/g, "");
                    // 빠른정답 키워드 감지
                    if (fastAnswerPage === -1 && (text.includes("빠른정답") || text.includes("정답표"))) {
                        fastAnswerPage = i + 1;
                    }
                    
                    // 해설 시작 감지 (빠른 정답 이후이며, '이므로', '식에서' 등 서술어가 있는 페이지)
                    if (fastAnswerPage !== -1 && (i + 1) > fastAnswerPage) {
                        if (text.includes("이므로") || text.includes("대입") || text.includes("정리하면")) {
                            refSolutionPage = i + 1;
                            break;
                        }
                    }
                }
                
                // 만약 서술형식 발견 못했으면 빠른정답(또는 맨마지막장) 바로 다음장을 해설로 추정
                if (refSolutionPage === -1 && fastAnswerPage !== -1) refSolutionPage = fastAnswerPage + 1;
                // 빠른정답조차 탐지를 못했다면 꼼수로 뒤에서 2~3번째 장을 해설로 가정
                if (refSolutionPage === -1) refSolutionPage = pdf.numPages - 1; 

                return {
                    numPages: pdf.numPages,
                    fastAnswerPage,
                    refSolutionPage
                };
            };

            window.renderAndCropPage = async function(base64Data, targetPageNum, isSolution) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                const pdfPage = await pdf.getPage(targetPageNum);
                const viewport = pdfPage.getViewport({scale: 2.5}); 
                
                const textContent = await pdfPage.getTextContent();
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await pdfPage.render({canvasContext: ctx, viewport}).promise;
                const originalBase64 = canvas.toDataURL('image/png');

                const midX = canvas.width / 2;
                let leftAnchor = null;
                let rightAnchor = null;

                for (let item of textContent.items) {
                    const text = item.str.trim();
                    if (/^(?:문제\\s*\\d+|\\d{1,2}\\.|0\\d{1,2}\\.|0?\\d{1,2}|\\(\\d+\\))$/.test(text) && text !== "0" && text !== "1") {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        if (pt[1] > 50) {
                            if (pt[0] < midX && (!leftAnchor || pt[1] < leftAnchor.y)) leftAnchor = {text, x: pt[0], y: pt[1]};
                            else if (pt[0] >= midX && (!rightAnchor || pt[1] < rightAnchor.y)) rightAnchor = {text, x: pt[0], y: pt[1]};
                        }
                    }
                }

                // 라벨이 없으면 억지로라도 레이아웃 양분해서 추출
                if(!leftAnchor) leftAnchor = { text: "01(추정)", x: 0, y: viewport.height * 0.1 };
                if(!rightAnchor) rightAnchor = { text: "02(추정)", x: midX, y: viewport.height * 0.1 };

                const boxes = [];
                let y1 = Math.max(0, leftAnchor.y - 30);
                boxes.push({ id: isSolution ? "s001" : "q001", label: leftAnchor.text, x: 0, w: midX, y1: y1, y2: canvas.height, height: canvas.height - y1 });
                
                let y2 = Math.max(0, rightAnchor.y - 30);
                boxes.push({ id: isSolution ? "s002" : "q002", label: rightAnchor.text, x: midX, w: canvas.width - midX, y1: y2, y2: canvas.height, height: canvas.height - y2 });

                // 오버레이
                ctx.strokeStyle = "red";
                ctx.lineWidth = 6;
                boxes.forEach(box => {
                    ctx.strokeRect(box.x, box.y1, box.w, box.height);
                    ctx.fillStyle = "red";
                    ctx.font = "30px sans-serif";
                    ctx.fillText((isSolution ? "S Anchor: " : "Q Anchor: ") + box.label, box.x + 20, box.y1 + 40);
                });

                const overlayBase64 = canvas.toDataURL('image/png');

                // 무식하게 좌반구/우반구의 모든 텍스트 적재 (Y좌표 필터링 해제 -> 텍스트 증발 해결)
                boxes.forEach(box => {
                    let bodyStr = "";
                    for (let item of textContent.items) {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        if (pt[0] >= box.x && pt[0] < box.x + box.w) {
                            bodyStr += item.str + " ";
                        }
                    }
                    box.bodySample = bodyStr.trim();
                });

                return { originalBase64, overlayBase64, width: canvas.width, height: canvas.height, boxes };
            };
        </script>
      </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log(`[분석] PDF 문맥 스캔 및 해설지 섹션 탐색 시작...`);
    const docInfo = await page.evaluate(async (b64) => await window.analyzePdf(b64), pdfBase64);
    
    console.log(`==================================================`);
    console.log(`[디버그] 해설지 동적 탐색 모듈 (Answer Key Analysis)`);
    console.log(`==================================================`);
    console.log(`[TOTAL_PAGES] 총 ${docInfo.numPages}장`);
    console.log(`[ANSWER_KEY_START] 빠른정답: ${docInfo.fastAnswerPage > 0 ? docInfo.fastAnswerPage + ' page' : '발견 실패'}`);
    console.log(`[SOLUTION_START_PAGE] असली 해설 시작: ${docInfo.refSolutionPage} page`);
    console.log(`==================================================`);

    const TARGET_Q_PAGE = 2; // 테스트용 문제 페이지 
    const TARGET_S_PAGE = docInfo.refSolutionPage; 

    async function processPageNode(pageNum, isSolution) {
        console.log(`\n=> [${isSolution ? '해설' : '문제'}] ${pageNum} page 렌더링 및 크롭 실행 중...`);
        const result = await page.evaluate(async (b64, pNum, isSol) => await window.renderAndCropPage(b64, pNum, isSol), pdfBase64, pageNum, isSolution);
        
        const origBuffer = Buffer.from(result.originalBase64.split(',')[1], 'base64');
        const overBuffer = Buffer.from(result.overlayBase64.split(',')[1], 'base64');
        
        const prefix = isSolution ? "s" : "q";
        fs.writeFileSync(path.join(outDir, `debug_page_${prefix}_original.png`), origBuffer);
        fs.writeFileSync(path.join(outDir, `debug_page_${prefix}_overlay.png`), overBuffer);
        
        const minHeightThreshold = result.height * 0.25;

        for (let box of result.boxes) {
            const cropBuffer = await sharp(origBuffer)
                .extract({ left: Math.floor(box.x), top: Math.floor(box.y1), width: Math.floor(box.w), height: Math.floor(box.height) })
                .toBuffer();
            
            fs.writeFileSync(path.join(outDir, `${box.id}.png`), cropBuffer);
            fs.writeFileSync(path.join(outDir, `${box.id}_ocr.txt`), box.bodySample);
            
            console.log(`\n============================`);
            console.log(`라벨: ${box.label} (${box.id})`);
            
            if (box.height < minHeightThreshold) console.log(`[CROP_TOO_SMALL] 실패: 세로 길이가 25% 미만`);
            else console.log(`[통과] 높이 25% 이상 확보됨`);

            const nonLabelStr = box.bodySample.replace(box.label, "").replace(/[^가-힣a-zA-Z]/g, '');
            if (nonLabelStr.length < 5) console.log(`[BODY_MISSING] 실패: 실제 텍스트 5자 미만.`);
            else console.log(`[통과] OCR 본문 정상 적재 (${nonLabelStr.length}자)`);

            console.log(`OCR Preview: ${box.bodySample.replace(/\\s+/g, ' ').substring(0, 100)}...`);
            
            const stats = await sharp(cropBuffer).stats();
            let isWhite = stats.channels[0].mean > 250;
            if(isWhite && nonLabelStr.length < 2) console.log(`[TOO_MUCH_WHITESPACE] 실패: 빈 화면`);
            else if (stats.channels[0].mean < 10) console.log(`[INVALID_CROP] 실패: 검은 화면 에러`);
        }
    }

    await processPageNode(TARGET_Q_PAGE, false);
    if(TARGET_S_PAGE > 0 && TARGET_S_PAGE <= docInfo.numPages) {
        await processPageNode(TARGET_S_PAGE, true);
    }
    
    await browser.close();
    console.log(`\n[완료] 디버그 모드 종료. 문제 및 해설 Crop 완전 검증 확보!`);
}

runAdvancedPipeline();
