const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
const TARGET_FOLDER = "@@매쓰플랫";

// 대상 1개만 하드코딩해서 바로 테스트
const testPdfName = "고등수학(상)중간고사 2020 1+1(쌍둥이)p21";
const testPdfPath = path.join(ROOT, TARGET_FOLDER, testPdfName + ".pdf");
const outDir = path.join(__dirname, '../public/math_crops/매쓰플랫', testPdfName);

if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

async function extractRealPngs(pdfAbsPath, outputDirectory) {
    const pdfDataBuffer = fs.readFileSync(pdfAbsPath);
    const pdfBase64 = pdfDataBuffer.toString('base64');
    
    console.log(`[시작] Puppeteer + PDF.js를 이용한 실제 PDF 렌더링 캡처 시작: ${pdfAbsPath}`);

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
            window.extractPages = async function(base64Data) {
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                const images = [];

                // 1페이지 추출 후, 4등분
                for(let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
                    const pdfPage = await pdf.getPage(pageNum);
                    const viewport = pdfPage.getViewport({scale: 2.0}); // 고해상도
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    await pdfPage.render({canvasContext: ctx, viewport: viewport}).promise;
                    
                    const fullBase64 = canvas.toDataURL('image/png');
                    images.push(fullBase64);
                }
                
                return images;
            };
        </script>
      </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // 페이지 이미지를 Base64 형태로 추출
    const base64Pages = await page.evaluate(async (b64) => {
        return await window.extractPages(b64);
    }, pdfBase64);
    
    await browser.close();

    console.log(`=> 실제 PDF 페이지 ${base64Pages.length}장 렌더링 완료. 4등분 크롭 진행 중...`);

    const sharp = require('sharp');
    
    let index = 1;
    for (const b64 of base64Pages) {
        const buffer = Buffer.from(b64.replace(/^data:image\/png;base64,/, ""), 'base64');
        const metadata = await sharp(buffer).metadata();
        
        const w = metadata.width;
        const h = metadata.height;
        const qH = Math.floor(h / 4);

        for (let i = 0; i < 4; i++) {
            const cropBuffer = await sharp(buffer)
                .extract({ left: 0, top: i * qH, width: w, height: qH })
                .toBuffer();
                
            let fileName = path.join(outputDirectory, `real_q00${index}.png`);
            fs.writeFileSync(fileName, cropBuffer);
            console.log(`   - 저장 완료: ${fileName}`);
            index++;
        }
    }
}

async function run() {
    if(!fs.existsSync(testPdfPath)) {
        console.error(`[ERROR] PDF 파일을 찾을 수 없음: ${testPdfPath}`);
        return;
    }
    await extractRealPngs(testPdfPath, outDir);
    console.log(`[완료] 가짜 더미가 아닌 실제 PDF 페이지 캡처 및 크롭본 완료!`);
}

run();
