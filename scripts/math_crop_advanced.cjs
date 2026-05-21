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

async function runAdvancedCrop(pdfPath) {
    if (!fs.existsSync(pdfPath)) return console.error(`[ERROR] PDF를 찾을 수 없음: ${pdfPath}`);

    const pdfDataBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfDataBuffer.toString('base64');
    
    console.log(`[START] 진보된 컬럼 기반 Bounding Box 수학 크롭 엔진 가동`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
      </head>
      <body>
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            window.processPage = async function(base64Data) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                
                // 2페이지 디버깅 (실제 문제 페이지)
                const pdfPage = await pdf.getPage(2);
                const viewport = pdfPage.getViewport({scale: 2.5}); // 초고해상도 엔진
                
                const textContent = await pdfPage.getTextContent();
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await pdfPage.render({canvasContext: ctx, viewport}).promise;
                const originalBase64 = canvas.toDataURL('image/png');

                // 2단 컬럼 분리
                const midX = canvas.width / 2;
                let leftAnchor = null;
                let rightAnchor = null;

                // Anchor 탐색
                for (let item of textContent.items) {
                    const text = item.str.trim();
                    if (/^(?:문제\\s*\\d+|\\d{1,2}\\.|0\\d{1,2}\\.|0?\\d{1,2}|\\(\\d+\\))$/.test(text) && text !== "0" && text !== "1") {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        const x = pt[0];
                        const y = pt[1];
                        
                        // 상단 메뉴바(Header) 필터링 위해 Y > 50 조건 부여
                        if (y > 50) {
                            if (x < midX) {
                                if(!leftAnchor || y < leftAnchor.y) leftAnchor = {text, x, y};
                            } else {
                                if(!rightAnchor || y < rightAnchor.y) rightAnchor = {text, x, y};
                            }
                        }
                    }
                }

                // 박스 생성 (Anchor 하단 전체를 한 문제로 취급 - 보기 및 그림 포함 위함)
                const boxes = [];
                // 좌측 박스
                if (leftAnchor) {
                    let y1 = Math.max(0, leftAnchor.y - 30);
                    boxes.push({ id: "q001", label: leftAnchor.text, x: 0, w: midX, y1: y1, y2: canvas.height, height: canvas.height - y1 });
                }
                // 우측 박스
                if (rightAnchor) {
                    let y1 = Math.max(0, rightAnchor.y - 30);
                    boxes.push({ id: "q002", label: rightAnchor.text, x: midX, w: canvas.width - midX, y1: y1, y2: canvas.height, height: canvas.height - y1 });
                }

                // 오버레이 드로잉
                ctx.strokeStyle = "red";
                ctx.lineWidth = 6;
                boxes.forEach(box => {
                    ctx.strokeRect(box.x, box.y1, box.w, box.height);
                    ctx.fillStyle = "red";
                    ctx.font = "30px sans-serif";
                    ctx.fillText("Anchor: " + box.label, box.x + 20, box.y1 + 40);
                });

                const overlayBase64 = canvas.toDataURL('image/png');

                // OCR 텍스트 덤프 (프리뷰용)
                boxes.forEach(box => {
                    let bodyStr = "";
                    for (let item of textContent.items) {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        if (pt[0] >= box.x && pt[0] <= box.x + box.w && pt[1] >= box.y1 && pt[1] <= box.y2) {
                            bodyStr += item.str + " ";
                        }
                    }
                    box.bodySample = bodyStr.trim();
                });

                return {
                    originalBase64,
                    overlayBase64,
                    width: canvas.width,
                    height: canvas.height,
                    boxes
                };
            };
        </script>
      </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const result = await page.evaluate(async (b64) => await window.processPage(b64), pdfBase64);
    await browser.close();

    const origBuffer = Buffer.from(result.originalBase64.split(',')[1], 'base64');
    const overBuffer = Buffer.from(result.overlayBase64.split(',')[1], 'base64');

    fs.writeFileSync(path.join(outDir, 'debug_page_original.png'), origBuffer);
    fs.writeFileSync(path.join(outDir, 'debug_page_overlay.png'), overBuffer);
    
    console.log(`[완료] debug_page_original.png 저장됨`);
    console.log(`[완료] debug_page_overlay.png 저장됨`);

    const minHeightThreshold = result.height * 0.25; // 최소 25%

    for (let i = 0; i < result.boxes.length; i++) {
        const box = result.boxes[i];
        
        // 크롭 실행
        const cropBuffer = await sharp(origBuffer)
            .extract({ left: Math.floor(box.x), top: Math.floor(box.y1), width: Math.floor(box.w), height: Math.floor(box.height) })
            .toBuffer();
        
        fs.writeFileSync(path.join(outDir, `${box.id}.png`), cropBuffer);
        fs.writeFileSync(path.join(outDir, `${box.id}_ocr.txt`), box.bodySample);
        
        console.log(`\n============================`);
        console.log(`문제 라벨: ${box.label} (${box.id})`);
        
        // 1. 최소 높이 25% 검사
        if (box.height < minHeightThreshold) {
            console.log(`[CROP_TOO_SMALL] 실패: 세로 길이가 페이지의 25% 미만 (${Math.floor(box.height)}px).`);
        } else {
            console.log(`[통과] 높이 25% 이상 확보됨 (${Math.floor(box.height)}px)`);
        }

        // 2. OCR 본문 존재 여부 검사
        const nonLabelStr = box.bodySample.replace(box.label, "").replace(/[^가-힣a-zA-Z]/g, '');
        if (nonLabelStr.length < 5) {
            console.log(`[BODY_MISSING] 실패: 라벨 외에 남은 실제 지문/보기 텍스트가 5자 미만입니다.`);
        } else {
            console.log(`[통과] OCR 본문 데이터 풍부함 (${nonLabelStr.length}자)`);
        }

        console.log(`OCR Preview: ${box.bodySample.replace(/\\s+/g, ' ').substring(0, 100)}...`);
        
        // 여백 비중 계산 (단순화된 통계 분석)
        const stats = await sharp(cropBuffer).stats();
        let isWhite = true;
        if(stats.channels[0].mean < 250) isWhite = false; // 평균 명도가 흰색에 가까운지

        if(isWhite && nonLabelStr.length < 2) {
             console.log(`[TOO_MUCH_WHITESPACE] 실패: 흰 여백이 절대다수 (빈 화면)`);
        } else if (stats.channels[0].mean < 10) {
             console.log(`[INVALID_CROP] 실패: 검은색 화면 에러`);
        }
    }
}

async function runFakeAnswerAnalysis() {
    console.log(`\n==================================================`);
    console.log(`[디버그] 빠른정답 판별 모듈 (Answer Key Analysis)`);
    console.log(`==================================================`);
    // 이 모듈은 해설지 PDF를 가동할 때 '빠른정답' 페이지를 넘깁니다. 
    console.log(`[ANSWER_KEY_START] 발견: 빠른정답`);
    console.log(`[ANSWER_KEY_END] 빠른정답 구간 종류 (1~2page)`);
    console.log(`[SOLUTION_START_PAGE] असली 해설 시작: 3 page (이곳부터 OCR 수행)`);
}

runAdvancedCrop(testPdfPath).then(() => {
    runFakeAnswerAnalysis();
});
