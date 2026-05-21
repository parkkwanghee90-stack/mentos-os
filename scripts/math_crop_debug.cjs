const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
const TARGET_FOLDER = "@@매쓰플랫";

const testPdfName = "고등수학(상)중간고사 2020 1+1(쌍둥이)p21";
const testPdfPath = path.join(ROOT, TARGET_FOLDER, "(1)수학(상)중간", testPdfName + ".pdf");
const outDir = path.join(__dirname, '../public/math_crops/매쓰플랫_debug');

if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

async function runDebugCrop(pdfPath) {
    if (!fs.existsSync(pdfPath)) {
        console.error(`[ERROR] PDF를 찾을 수 없음: ${pdfPath}`);
        return;
    }

    const pdfDataBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfDataBuffer.toString('base64');
    
    console.log(`[START] 단일 페이지 추출 및 문항 동적 Y좌표 Crop 디버그 엔진 가동`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
        <style> canvas { border: 1px solid red; } </style>
      </head>
      <body>
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            window.processPage = async function(base64Data) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                
                // 단 1페이지만 디버깅
                const pdfPage = await pdf.getPage(1);
                const viewport = pdfPage.getViewport({scale: 2.0}); 
                
                const textContent = await pdfPage.getTextContent();
                
                // 렌더링 캔버스
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await pdfPage.render({canvasContext: ctx, viewport}).promise;
                const originalBase64 = canvas.toDataURL('image/png');

                // 문항 라벨 Y좌표 추출 ("1.", "01.", "01", "(1)" 등 매칭)
                const labels = [];
                for (let item of textContent.items) {
                    const text = item.str.trim();
                    if (/^(?:문제\\s*\\d+|\\d{1,2}\\.|0\\d{1,2}\\.|0?\\d{1,2}|\\(\\d+\\))$/.test(text)) {
                        // ty는 좌측 하단 기준 좌표이므로 캔버스 좌표계(좌측상단)로 변환 필요하지만
                        // getViewport와 transform을 직접 사용해 실제 Y 계산
                        const tx = viewport.transform;
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        labels.push({ text: text, x: pt[0], y: pt[1] });
                    }
                }
                
                // Y 좌표 기준으로 정렬 (위에서부터 아래로)
                labels.sort((a,b) => a.y - b.y);

                // 중복 라벨 제거나 너무 가까운 Y 필터링
                const filteredLabels = [];
                for(let lbl of labels) {
                    if (filteredLabels.length === 0 || Math.abs(filteredLabels[filteredLabels.length-1].y - lbl.y) > 30) {
                        filteredLabels.push(lbl);
                    }
                }

                // 박스 계산 및 오버레이 그리기
                ctx.strokeStyle = "red";
                ctx.lineWidth = 4;
                
                const boxes = [];
                for(let i=0; i<filteredLabels.length; i++) {
                    const y1 = Math.max(0, filteredLabels[i].y - 20); // 약간의 마진
                    const y2 = (i < filteredLabels.length - 1) ? Math.max(0, filteredLabels[i+1].y - 20) : canvas.height;
                    
                    const box = { label: filteredLabels[i].text, y1, y2, height: y2 - y1 };
                    boxes.push(box);
                    
                    ctx.strokeRect(0, y1, canvas.width, box.height);
                    ctx.fillStyle = "red";
                    ctx.font = "24px sans-serif";
                    ctx.fillText("Q: " + box.label, 10, y1 + 30);
                }

                const overlayBase64 = canvas.toDataURL('image/png');

                // 텍스트 추출 (OCR 프리뷰용: 각 박스 사이의 모든 텍스트 병합)
                boxes.forEach(box => {
                    let bodyStr = "";
                    for (let item of textContent.items) {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        if (pt[1] >= box.y1 && pt[1] <= box.y2) {
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

    fs.writeFileSync(path.join(outDir, 'debug_page_001_original.png'), origBuffer);
    fs.writeFileSync(path.join(outDir, 'debug_page_001_overlay.png'), overBuffer);
    
    console.log(`[완료] debug_page_001_original.png 생성`);
    console.log(`[완료] debug_page_001_overlay.png 생성`);

    const minHeightThreshold = result.height * 0.18; // 최소 18% 높이 요구

    for (let i = 0; i < result.boxes.length; i++) {
        const box = result.boxes[i];
        
        // crop
        const cropBuffer = await sharp(origBuffer)
            .extract({ left: 0, top: Math.floor(box.y1), width: Math.floor(result.width), height: Math.floor(box.height) })
            .toBuffer();
        
        const qName = `q00${i+1}.png`;
        fs.writeFileSync(path.join(outDir, qName), cropBuffer);
        
        console.log(`\n============================`);
        console.log(`문제 라벨: ${box.label}`);
        console.log(`이미지: ${qName} (width: ${result.width}, height: ${Math.floor(box.height)})`);

        // 유효성 검사 1: 높이
        if (box.height < minHeightThreshold) {
            console.log(`[QUESTION_CROP_TOO_SMALL] 실패: 세로 길이가 너무 짧음 (${Math.floor(box.height)}px). 제목 박스로 간주됨.`);
        } else {
            console.log(`[통과] 충분한 크롭 높이 확보됨.`);
        }

        // 유효성 검사 2: OCR Preview 본문 텍스트 (길이 50 기준)
        const previewText = box.bodySample.replace(/\\s+/g, ' ').substring(0, 80);
        console.log(`OCR Preview (최대 80자): ${previewText}`);
        
        const nonLabelStr = box.bodySample.replace(box.label, "").replace(/[^가-힣a-zA-Z]/g, '');
        if (nonLabelStr.length < 5) {
            console.log(`[QUESTION_BODY_MISSING] 실패: 라벨 외에 남은 본문 텍스트가 거의 없음.`);
        } else {
            console.log(`[통과] 본문 텍스트 확보 확인됨.`);
        }
    }
}

async function run() {
    await runDebugCrop(testPdfPath);
}
run();
