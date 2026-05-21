const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1600;
const SOURCE_DIR = "C:\\mentos_os_clean\\public\\output_pdf\\2020_집중학습";
const OUTPUT_DIR = "C:\\mentos_os_clean\\public\\concept_cards";

// Recursively find all PDFs
function getPdfFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getPdfFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.pdf')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

async function runMassSlicing() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const pdfs = getPdfFiles(SOURCE_DIR);
    console.log(`총 ${pdfs.length} 개의 PDF 스캔 시작...`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
    const page = await browser.newPage();
    
    // Inject logic
    const htmlData = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
        </head>
        <body style="margin:0; padding:0; background:white;">
            <canvas id="canvas" style="display:block;"></canvas>
            <div id="status"></div>
            <script>
                async function parseAndRender(b64, targetPNum) {
                    try {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                        const bin = window.atob(b64);
                        const bytes = new Uint8Array(bin.length);
                        for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                        const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                        
                        let anchorsByPage = {};
                        let currentSection = { index: "", title: "" };

                        // First pass: extract text
                        for (let pNum = 1; pNum <= pdf.numPages; pNum++) {
                            const pdfPage = await pdf.getPage(pNum);
                            const textContent = await pdfPage.getTextContent();
                            const viewport = pdfPage.getViewport({scale: 2.0});
                            
                            let items = textContent.items.map(item => {
                                let pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                                return { text: item.str.trim(), y: pt[1], size: item.transform[0] };
                            }).filter(item => item.text.length > 0);

                            let pageAnchors = [];
                            for (let i=0; i<items.length; i++) {
                                const it = items[i];
                                const numMatch = it.text.match(/^0[1-9]$/);
                                
                                if (numMatch) {
                                    if (it.size > 15.0) {
                                        let title = "";
                                        for(let j=i+1; j<Math.min(items.length, i+5); j++) {
                                            if (items[j].y > it.y - 10 && items[j].y < it.y + 40) {
                                                if (items[j].size >= 11) title += items[j].text + " ";
                                            }
                                        }
                                        currentSection = { index: it.text, title: title.trim() };
                                    }
                                    else if (it.size >= 11.0 && it.size <= 14.0) {
                                        let title = "";
                                        for(let j=i+1; j<Math.min(items.length, i+8); j++) {
                                            if (Math.abs(items[j].y - it.y) < 20 && items[j].text !== "개념확립") {
                                                title += items[j].text + " ";
                                            }
                                        }
                                        pageAnchors.push({
                                            section_index: currentSection.index,
                                            section_title: currentSection.title,
                                            card_index: it.text,
                                            card_title: title.trim(),
                                            y_anchor: it.y
                                        });
                                    }
                                }
                            }
                            
                            if (pageAnchors.length > 0) {
                                let startEnd = [];
                                for (let i=0; i<pageAnchors.length; i++) {
                                    let anc = pageAnchors[i];
                                    let startY = Math.max(0, anc.y_anchor - 40);
                                    let endY = (i < pageAnchors.length - 1) ? pageAnchors[i+1].y_anchor - 40 : viewport.height - 80;
                                    startEnd.push({ ...anc, y_start: startY, y_end: endY });
                                }
                                anchorsByPage[pNum] = { expectedHeight: viewport.height, expectedWidth: viewport.width, anchors: startEnd };
                            }
                        }

                        // If asked to render a page, render it onto canvas
                        if (targetPNum && anchorsByPage[targetPNum]) {
                            const pPage = await pdf.getPage(targetPNum);
                            const scale = 2.0; 
                            const viewport = pPage.getViewport({ scale });
                            const canvas = document.getElementById('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            await pPage.render({ canvasContext: context, viewport: viewport }).promise;
                        }

                        document.getElementById('status').innerText = "DONE";
                        return anchorsByPage;
                    } catch(e) {
                         document.getElementById('status').innerText = "ERROR " + e.toString();
                         return null;
                    }
                }
            </script>
        </body>
        </html>
    `;
    await page.setContent(htmlData);

    let mainMetadata = [];
    
    for (let fIdx=0; fIdx<pdfs.length; fIdx++) {
        const pdfFile = pdfs[fIdx];
        const baseName = path.basename(pdfFile, '.pdf');
        console.log(`[${fIdx+1}/${pdfs.length}] 처리 중: ${baseName}...`);
        
        const outDir = path.join(OUTPUT_DIR, baseName);

        const pdfBase64 = fs.readFileSync(pdfFile).toString('base64');
        
        // Call parser (don't render canvas yet)
        const anchorsObj = await page.evaluate(async (b64) => await window.parseAndRender(b64, null), pdfBase64);
        if (!anchorsObj || Object.keys(anchorsObj).length === 0) {
            console.log("  -> 개념 카드가 없는 문서입니다 (스킵)");
            continue;
        }

        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        
        let folderMeta = [];

        // Now render pages that have anchors
        for (let pNumStr of Object.keys(anchorsObj)) {
            const pNum = parseInt(pNumStr);
            const pData = anchorsObj[pNumStr];

            // Render on browser canvas
            await page.evaluate(async (b64, n) => await window.parseAndRender(b64, n), pdfBase64, pNum);
            // wait for render
            await new Promise(r => setTimeout(r, 200));

            const vpW = pData.expectedWidth;
            const vpH = pData.expectedHeight;
            await page.setViewport({ width: Math.floor(vpW), height: Math.floor(vpH), deviceScaleFactor: 1 });
            
            const fullPng = await page.screenshot({ fullPage: true });

            for (let card of pData.anchors) {
                let sy = Math.max(0, Math.floor(card.y_start));
                let ch = Math.floor(card.y_end - sy);
                
                // Avoid out of bonds
                if (sy + ch > vpH) ch = Math.floor(vpH - sy);
                if (ch <= 0) continue;

                // Do we need pagination? (e.g. 02-1, 02-2)
                const partsCount = Math.ceil(ch / TARGET_HEIGHT);
                
                for (let i = 0; i < partsCount; i++) {
                    let subY = sy + (i * TARGET_HEIGHT);
                    let subH = Math.min(TARGET_HEIGHT, ch - (i * TARGET_HEIGHT));
                    
                    if (subH <= 0) break;
                    
                    const cropped = await sharp(fullPng)
                        .extract({ left: 0, top: Math.floor(subY), width: Math.floor(vpW), height: Math.floor(subH) })
                        .toBuffer();
                        
                    let cardName = partsCount > 1 ? `${card.card_index}-${i+1}` : `${card.card_index}`;
                    let imgFilename = `card_${cardName}_p${pNum}.png`;
                    let savePath = path.join(outDir, imgFilename);

                    await sharp({
                        create: { width: TARGET_WIDTH, height: TARGET_HEIGHT, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
                    })
                    .composite([{ input: cropped, gravity: 'north' }])
                    .png()
                    .toFile(savePath);

                    let entry = {
                        id: `${baseName}_p${pNum}_${cardName}`,
                        source_file: baseName,
                        source_page: pNum,
                        section_index: card.section_index,
                        section_title: card.section_title,
                        card_index: cardName,
                        card_title: card.card_title,
                        y_start: subY,
                        y_end: subY + subH,
                        file_png: imgFilename
                    };
                    folderMeta.push(entry);
                    mainMetadata.push(entry);
                }
            }
        }
        
        // Save folder local meta
        fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(folderMeta, null, 2));
        console.log(`  -> ${folderMeta.length} 개의 카드 생성 및 메타데이터 작성 완료.`);
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'global_metadata.json'), JSON.stringify(mainMetadata, null, 2));
    console.log(`===========================================`);
    console.log(`모든 작업 완료! 총 ${mainMetadata.length} 장의 카드가 생성되었습니다.`);
    await browser.close();
}

runMassSlicing().catch(e => console.error(e));
