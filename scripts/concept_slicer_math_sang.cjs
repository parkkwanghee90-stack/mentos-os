const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1600;
const SOURCE_DIR = "\\\\Subitmainpc\\수학의 빛 사무폴더\\11.집중학습\\2020 집중학습\\(1)수학상(12회차)";
const OUTPUT_DIR = "C:\\mentos_os_clean\\public\\concept_cards";
const META_PATH = path.join(OUTPUT_DIR, "global_metadata.json");

function getPdfFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getPdfFiles(fullPath, fileList);
        } else if (fullPath.toLowerCase().endsWith('.pdf')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function sanitizeTitle(title) {
    let s = title.replace(/[\uE000-\uF8FF]/g, '');
    s = s.replace(/[\\/:*?"<>|]/g, '');
    s = s.replace(/^[0-9]+[-\s.]*/, '');
    s = s.replace(/\s+/g, ' ').trim();
    if (s.length > 40) s = s.substring(0, 40) + "...";
    return s || "Untitled_Concept";
}

const UNIT_KEYWORDS = [
    '직선의방정식', '원의방정식', '일차부등식', '이차부등식', 
    '도형의이동', '점과좌표', '다항식', '방정식', '부등식', '복소수', '이차함수'
];

async function runMathSang() {
    let globalMeta = [];
    if (fs.existsSync(META_PATH)) {
        globalMeta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    }
    
    // To track existing names globally to avoid duplicates
    let nameCounts = {};
    for (let g of globalMeta) {
        if (g.card_title && nameCounts[g.card_title]) {
            nameCounts[g.card_title]++;
        } else if (g.card_title) {
            nameCounts[g.card_title] = 1;
        }
    }

    const pdfs = getPdfFiles(SOURCE_DIR);
    console.log(`[수학상 전용] 총 ${pdfs.length} 개의 PDF 스캔 시작...`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
    const page = await browser.newPage();
    
    // Inject parser
    const htmlData = `
        <!DOCTYPE html>
        <html>
        <head><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script></head>
        <body style="margin:0; padding:0; background:white;">
            <canvas id="canvas" style="display:block;"></canvas>
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

                        for (let pNum = 1; pNum <= pdf.numPages; pNum++) {
                            const pPage = await pdf.getPage(pNum);
                            const textContent = await pPage.getTextContent();
                            const viewport = pPage.getViewport({scale: 2.0});
                            
                            let items = textContent.items.map(item => {
                                let pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                                return { text: item.str.trim(), y: pt[1], size: item.transform[0] };
                            }).filter(it => it.text.length > 0);

                            let pageAnchors = [];
                            for (let i=0; i<items.length; i++) {
                                const it = items[i];
                                if (it.text.match(/^0[1-9]$/)) {
                                    if (it.size > 15.0) {
                                        let title = "";
                                        for(let j=i+1; j<Math.min(items.length, i+5); j++) {
                                            if (items[j].y > it.y - 10 && items[j].y < it.y + 40 && items[j].size >= 11) {
                                                title += items[j].text + " ";
                                            }
                                        }
                                        currentSection = { index: it.text, title: title.trim() };
                                    } else if (it.size >= 11.0 && it.size <= 14.0) {
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

                        return anchorsByPage;
                    } catch(e) {
                         return null;
                    }
                }
            </script>
        </body>
        </html>
    `;
    await page.setContent(htmlData);

    let newlyCreated = 0;
    
    for (let fIdx=0; fIdx<pdfs.length; fIdx++) {
        const pdfFile = pdfs[fIdx];
        const baseName = path.basename(pdfFile, '.pdf');
        
        // Output directory matching original slice logic
        const outDir = path.join(OUTPUT_DIR, baseName);
        console.log(`[${fIdx+1}/${pdfs.length}] 처리 중: ${baseName}...`);

        const pdfBase64 = fs.readFileSync(pdfFile).toString('base64');
        const anchorsObj = await page.evaluate(async (b64) => await window.parseAndRender(b64, null), pdfBase64);
        
        if (!anchorsObj || Object.keys(anchorsObj).length === 0) continue;

        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        for (let pNumStr of Object.keys(anchorsObj)) {
            const pNum = parseInt(pNumStr);
            const pData = anchorsObj[pNumStr];

            await page.evaluate(async (b64, n) => await window.parseAndRender(b64, n), pdfBase64, pNum);
            await new Promise(r => setTimeout(r, 200));

            const vpW = pData.expectedWidth;
            const vpH = pData.expectedHeight;
            await page.setViewport({ width: Math.floor(vpW), height: Math.floor(vpH), deviceScaleFactor: 1 });
            
            const fullPng = await page.screenshot({ fullPage: true });

            for (let card of pData.anchors) {
                let sy = Math.max(0, Math.floor(card.y_start));
                let ch = Math.floor(card.y_end - sy);
                if (sy + ch > vpH) ch = Math.floor(vpH - sy);
                if (ch <= 0) continue;

                // Title Sanitize
                let cleaned = sanitizeTitle(card.card_title || "");
                if (!cleaned) cleaned = "Untitled_MathSang_" + Math.floor(Math.random()*1000);

                const partsCount = Math.ceil(ch / TARGET_HEIGHT);
                
                for (let i = 0; i < partsCount; i++) {
                    let subY = sy + (i * TARGET_HEIGHT);
                    let subH = Math.min(TARGET_HEIGHT, ch - (i * TARGET_HEIGHT));
                    if (subH <= 0) break;
                    
                    const cropped = await sharp(fullPng)
                        .extract({ left: 0, top: Math.floor(subY), width: Math.floor(vpW), height: Math.floor(subH) })
                        .toBuffer();
                    
                    let suffix = partsCount > 1 ? `_${i+1}` : "";
                    let finalTitle = cleaned;
                    
                    // Duplicate name handling
                    if (nameCounts[cleaned]) {
                        nameCounts[cleaned]++;
                        finalTitle = `${cleaned}_${nameCounts[cleaned]}`;
                    } else {
                        nameCounts[cleaned] = 1;
                    }
                    
                    let filename = `${finalTitle}${suffix}.png`;
                    let savePath = path.join(outDir, filename);

                    await sharp({
                        create: { width: TARGET_WIDTH, height: TARGET_HEIGHT, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
                    })
                    .composite([{ input: cropped, gravity: 'north' }])
                    .png()
                    .toFile(savePath);

                    let entry = {
                        id: `${baseName}_p${pNum}_${card.card_index}${suffix}`,
                        source_file: baseName,
                        source_page: pNum,
                        section_index: card.section_index,
                        section_title: card.section_title,
                        card_index: card.card_index + suffix,
                        card_title: finalTitle,
                        file_png: filename,
                        image_path: `${baseName}/${filename}`,
                        y_start: subY,
                        y_end: subY + subH,
                        linked_problem_folders: []
                    };
                    
                    // Map problem folders
                    let fullStr = (entry.section_title || "") + " " + (entry.card_title || "");
                    for (let kw of UNIT_KEYWORDS) {
                        if (fullStr.includes(kw)) {
                            entry.linked_problem_folders = [`${kw}/2`, `${kw}/3`, `${kw}/4`];
                            break;
                        }
                    }

                    globalMeta.push(entry);
                    newlyCreated++;
                }
            }
        }
    }

    fs.writeFileSync(META_PATH, JSON.stringify(globalMeta, null, 2), 'utf8');
    console.log(`===========================================`);
    console.log(`수학상 완료! 추가된 카드: ${newlyCreated}장`);
    console.log(`누적 스크립트 메타데이터 총계: ${globalMeta.length}장`);
    await browser.close();
}

runMathSang().catch(e => console.error(e));
