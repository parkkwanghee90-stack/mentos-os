const fs = require('fs');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

async function renderCardPreview() {
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
    const page = await browser.newPage();
    
    // We already parsed Card 1 from file 2 earlier:
    // C:\mentos_os_clean\public\output_pdf\2020_집중학습\(2)수학하(8회차)\@2회차 집합 명제(35+10)\[SSS노트]02-2명제의 참 거짓 초급(15).pdf
    // Card 1 starts at Y: 371.2, ends at 847.3.
    // Card 2 starts at Y: 847.3, ends at 1129.9.

    // Let's take a screenshot of Page 3.
    const pdfPath = "C:\\mentos_os_clean\\public\\output_pdf\\2020_집중학습\\(2)수학하(8회차)\\@2회차 집합 명제(35+10)\\[SSS노트]02-2명제의 참 거짓 초급(15).pdf";
    const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
        </head>
        <body style="margin:0; padding:0; background:white;">
            <canvas id="canvas" style="display:block;"></canvas>
            <script>
                async function render() {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                    const bin = window.atob('${pdfBase64}');
                    const bytes = new Uint8Array(bin.length);
                    for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                    const pdfPage = await pdf.getPage(3); // page 3 has card 1
                    
                    const scale = 2.0; 
                    const viewport = pdfPage.getViewport({ scale });
                    const canvas = document.getElementById('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await pdfPage.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    const marker = document.createElement('div');
                    marker.id = 'rendered';
                    document.body.appendChild(marker);
                }
                render();
            </script>
        </body>
        </html>
    `;
    
    await page.setContent(html);
    await page.waitForSelector('#rendered', { timeout: 10000 });
    
    const vp = await page.evaluate(() => {
        const c = document.getElementById('canvas');
        return { w: c.width, h: c.height };
    });
    
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    const fullPagePng = await page.screenshot({ fullPage: true });
    
    const TARGET_WIDTH = 1200;
    const TARGET_HEIGHT = 1600;

    // Crop Card 1
    let c1_y = Math.max(0, Math.floor(371.2));
    let c1_h = Math.floor(847.3 - 371.2);
    
    const cropped1 = await sharp(fullPagePng)
        .extract({ left: 0, top: c1_y, width: vp.w, height: c1_h })
        .toBuffer();
        
    // Place into fixed canvas
    await sharp({
        create: { width: TARGET_WIDTH, height: TARGET_HEIGHT, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
    })
    .composite([{ input: cropped1, gravity: 'north' }])
    .png()
    .toFile('c:\\mentos_os_clean\\scratch\\preview_card1.png');

    // Crop Card 2
    let c2_y = Math.floor(847.3);
    let c2_h = Math.floor(1129.9 - 847.3);
    
    const cropped2 = await sharp(fullPagePng)
        .extract({ left: 0, top: c2_y, width: vp.w, height: c2_h })
        .toBuffer();
        
    await sharp({
        create: { width: TARGET_WIDTH, height: TARGET_HEIGHT, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
    })
    .composite([{ input: cropped2, gravity: 'north' }])
    .png()
    .toFile('c:\\mentos_os_clean\\scratch\\preview_card2.png');

    await browser.close();
}

renderCardPreview().then(() => console.log("Previews rendered!"));
