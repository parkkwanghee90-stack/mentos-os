const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const TARGET_BASE_UNC = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const BASE_CROP_DIR = "c:\\mentos_os_clean\\public\\math_crops\\매쓰플랫_ultimate";

let pdfList = [];
function findPdfs(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch(e) { return; }
    
    for (const dirent of entries) {
        if (dirent.name.toLowerCase().endsWith('.lnk')) continue;
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) findPdfs(fullPath);
        else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.pdf')) {
            const lowName = dirent.name.toLowerCase();
            // User strictly wants ONLY Math Flat files, NOT Ssen, TOT, Mock Exams
            if (lowName.includes('쎈') || lowName.includes('tot') || lowName.includes('모의고사') || lowName.includes('기출') || lowName.match(/[a-z0-9\-]{36}/)) continue;
            pdfList.push(fullPath);
        }
    }
}

async function runMaster() {
    console.log("Scanning target PDFs...");
    findPdfs(TARGET_BASE_UNC);

    // We will process all. But we can prioritize some if needed, however 1단계 skip or not? 
    // the previous log showed "[PROCESSING 1/109]", meaning there are 109 target pdfs. Let's process them all.

    console.log(`[SCAN_COMPLETE] Total PDFs Found: ${pdfList.length}`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, protocolTimeout: 300000 });
    
    const workerPage = await browser.newPage();
    await workerPage.evaluate(() => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        document.head.appendChild(s);
    });
    console.log("Waiting for PDF.js...");
    await workerPage.waitForFunction('window.pdfjsLib !== undefined', {timeout: 60000});

    for (let i = 0; i < pdfList.length; i++) {
        const targetPdfPath = pdfList[i];
        const baseName = path.basename(targetPdfPath, '.pdf');

        const fileOutDir = path.join(BASE_CROP_DIR, baseName);
        const metaPath = path.join(fileOutDir, 'metadata.json');
        
        // Skip existing successful files WITH items loaded correctly
        if (fs.existsSync(metaPath)) {
            try {
                const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                if (meta.items && meta.items.length > 5) {
                    console.log(`[SKIP] 이미 처리됨: ${baseName}`);
                    continue;
                }
            } catch(e) {}
        }

        console.log(`\n\n[PROCESSING ${i+1}/${pdfList.length}] ${baseName}`);
        if (!fs.existsSync(fileOutDir)) fs.mkdirSync(fileOutDir, {recursive: true});

        const pdfDataBuffer = fs.readFileSync(targetPdfPath);
        const pdfBase64 = pdfDataBuffer.toString('base64');

        const result = await workerPage.evaluate(async (base64Data) => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for(let j=0; j<binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
            
            const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
            
            let fastAnswerPage = -1;
            let refSolutionPage = -1;
            const pagesData = [];

            // Pass 1: Parse all texts
            for (let p = 1; p <= pdf.numPages; p++) {
                const pdfPage = await pdf.getPage(p);
                const viewport = pdfPage.getViewport({scale: 2.5});
                const textContent = await pdfPage.getTextContent();
                
                const words = textContent.items.map(it => it.str).join(" ");
                const textNoSpace = words.replace(/\s+/g, "");
                
                if (fastAnswerPage === -1 && (textNoSpace.includes("빠른정답") || textNoSpace.includes("정답표"))) fastAnswerPage = p;
                if (fastAnswerPage !== -1 && p > fastAnswerPage) {
                    if (refSolutionPage === -1 && (textNoSpace.includes("이므로") || textNoSpace.includes("대입") || textNoSpace.includes("정리하면") || textNoSpace.includes("따라서") || textNoSpace.includes("정답과해설"))) {
                        refSolutionPage = p;
                    }
                }

                const midX = viewport.width / 2;
                let leftAnchors = [];
                let rightAnchors = [];

                for (let item of textContent.items) {
                    const text = item.str.trim();
                    const transform = item.transform;
                    const pt = viewport.convertToViewportPoint(transform[4], transform[5]);
                    const x = pt[0];
                    const y = pt[1];
                    const itemH = item.height || 0;
                    
                    if (y <= 50) continue; // Ignore header area
                    
                    const isNumPattern = /^(?:문제\s*\d+|\d{1,3}\.|0\d{1,2}\.|0?\d{1,2}|\(\d+\))$/.test(text);
                    const isLargeFont = Math.max(itemH, transform[0]) >= 14;
                    
                    if (isNumPattern && isLargeFont && text !== "0" && text !== "1") {
                        const numMatch = text.match(/\d+/);
                        if (numMatch) {
                            const num = parseInt(numMatch[0], 10);
                            if (num !== 0) {
                                const anchor = { num, text, x, y, width: item.width, height: itemH, viewportWidth: viewport.width, viewportHeight: viewport.height };
                                if (x < midX) leftAnchors.push(anchor);
                                else rightAnchors.push(anchor);
                            }
                        }
                    }
                }
                
                // Sort top to bottom
                leftAnchors.sort((a,b) => a.y - b.y);
                rightAnchors.sort((a,b) => a.y - b.y);

                // Deduplicate items on the same y coordinates (often ghost elements)
                const buildCleanAnchors = (anchorsList) => {
                    const res = [];
                    for(let a of anchorsList) {
                        if (res.length > 0 && Math.abs(res[res.length-1].y - a.y) < 15 && res[res.length-1].num === a.num) continue;
                        res.push(a);
                    }
                    return res;
                };

                const cleanLefts = buildCleanAnchors(leftAnchors);
                const cleanRights = buildCleanAnchors(rightAnchors);
                
                // Calculate bounding box bottoms tightly to the next question
                for(let i=0; i<cleanLefts.length; i++) {
                    cleanLefts[i].bottomY = (i < cleanLefts.length - 1) ? cleanLefts[i+1].y - 100 : viewport.height - 10;
                }
                for(let i=0; i<cleanRights.length; i++) {
                    cleanRights[i].bottomY = (i < cleanRights.length - 1) ? cleanRights[i+1].y - 100 : viewport.height - 10;
                }

                // Gather preview texts
                const leftTexts = [];
                const rightTexts = [];
                for (let item of textContent.items) {
                    const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                    if (pt[0] < midX) leftTexts.push(item.str);
                    else rightTexts.push(item.str);
                }

                pagesData.push({ page: p, width: viewport.width, height: viewport.height, leftAnchors: cleanLefts, rightAnchors: cleanRights, leftText: leftTexts.join(" "), rightText: rightTexts.join(" ") });
            }

            if (refSolutionPage === -1 && fastAnswerPage !== -1) refSolutionPage = fastAnswerPage + 1;
            if (refSolutionPage === -1) refSolutionPage = Math.floor(pdf.numPages * 0.7);

            const questions = [];
            const solutions = [];
            
            for (let dat of pagesData) {
                if (dat.page < (fastAnswerPage !== -1 ? fastAnswerPage : refSolutionPage)) {
                    dat.leftAnchors.forEach(a => questions.push({ num: a.num, label: a.text, page: dat.page, side: 'left', y: a.y, bottomY: a.bottomY, maxH: dat.height, maxW: dat.width, text: dat.leftText }));
                    dat.rightAnchors.forEach(a => questions.push({ num: a.num, label: a.text, page: dat.page, side: 'right', y: a.y, bottomY: a.bottomY, maxH: dat.height, maxW: dat.width, text: dat.rightText }));
                } else if (dat.page >= refSolutionPage) {
                    dat.leftAnchors.forEach(a => solutions.push({ num: a.num, label: a.text, page: dat.page, side: 'left', y: a.y, bottomY: a.bottomY, maxH: dat.height, maxW: dat.width, text: dat.leftText }));
                    dat.rightAnchors.forEach(a => solutions.push({ num: a.num, label: a.text, page: dat.page, side: 'right', y: a.y, bottomY: a.bottomY, maxH: dat.height, maxW: dat.width, text: dat.rightText }));
                }
            }

            const getBestQuestions = (arr) => {
                const map = new Map();
                for (let b of arr) if(!map.has(b.num) || b.page < map.get(b.num).page) map.set(b.num, b);
                return Array.from(map.values()).sort((a,b) => a.num - b.num);
            };

            const getBestSolutions = (arr) => {
                const map = new Map();
                for (let b of arr) {
                    const existing = map.get(b.num);
                    const score = /해설|정답|풀이/.test(b.text) ? b.text.length + 500 : b.text.length;
                    const e_score = existing ? (/해설|정답|풀이/.test(existing.text) ? existing.text.length + 500 : existing.text.length) : 0;
                    if (!existing || score > e_score) map.set(b.num, b);
                }
                return Array.from(map.values()).sort((a,b) => a.num - b.num);
            };

            const uniqueQ = getBestQuestions(questions);
            const uniqueS = getBestSolutions(solutions);

            const pairs = [];
            for (let q of uniqueQ) {
                const s = uniqueS.find(sol => sol.num === q.num);
                // Even if 's' doesn't exist, we MUST output the question so it isn't completely dropped!
                pairs.push({ num: q.num, question: q, solution: s || null });
            }
            return pairs;
        }, pdfBase64);

        if (!result || result.length === 0) {
            console.log(`실패: 매칭 쌍 없음 (${baseName})`);
            continue;
        }

        console.log(`매칭 성공: ${result.length} 개 문항 쌍 확보. 다중 렌더링 시작...`);
        
        await workerPage.evaluate(() => {
            if(!window.renderSpecificPage) {
                window.renderSpecificPage = async function(base64Data, pageNum) {
                    const binaryString = window.atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for(let k=0; k<binaryString.length; k++) bytes[k] = binaryString.charCodeAt(k);
                    const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                    const pdfPage = await pdf.getPage(pageNum);
                    const viewport = pdfPage.getViewport({scale: 2.5});
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width; canvas.height = viewport.height;
                    await pdfPage.render({canvasContext: ctx, viewport}).promise;
                    return canvas.toDataURL('image/png');
                };
            }
        });

        const pageCache = new Map();
        const exportMeta = {
            baseName: baseName, pdfPath: targetPdfPath, pairCount: result.length, items: []
        };

        for (let pair of result) {
            const numStr = String(pair.num).padStart(3, '0');
            for (const type of ['question', 'solution']) {
                const obj = pair[type];
                if (!obj) continue;

                const targetNumStr = type==='question'?`q${numStr}`:`s${numStr}`;
                const pNum = obj.page;
                
                if(!pageCache.has(pNum)) {
                    let b64 = await workerPage.evaluate(async (b64, pn) => await window.renderSpecificPage(b64, pn), pdfBase64, pNum);
                    pageCache.set(pNum, Buffer.from(b64.split(',')[1], 'base64'));
                }
                
                let cropX = obj.side === 'left' ? 0 : Math.floor(obj.maxW / 2);
                let cropY = Math.floor(Math.max(0, obj.y - 120));
                let cropW = Math.floor(obj.maxW / 2);
                let cropH = Math.floor(obj.bottomY - cropY) + 10;

                try {
                    const imgMeta = await sharp(pageCache.get(pNum)).metadata();
                    if (cropX < 0) cropX = 0;
                    if (cropY < 0) cropY = 0;
                    if (cropX + cropW > imgMeta.width) cropW = imgMeta.width - cropX;
                    if (cropY + cropH > imgMeta.height) cropH = imgMeta.height - cropY;
                    if (cropW <= 0) cropW = 10;
                    if (cropH <= 0) cropH = 10;

                    const cImg = await sharp(pageCache.get(pNum)).extract({ left: cropX, top: cropY, width: cropW, height: cropH }).toBuffer();
                    fs.writeFileSync(path.join(fileOutDir, `${targetNumStr}.png`), cImg);
                    fs.writeFileSync(path.join(fileOutDir, `${targetNumStr}_ocr.txt`), obj.text.substring(0, 500));
                } catch(e) {
                    console.log(`[CROP ERROR] ${targetNumStr} 자르기 실패:`, e.message);
                }
            }

            exportMeta.items.push({
                id: `Q${numStr}`, num: pair.num,
                qPage: pair.question.page, sPage: pair.solution ? pair.solution.page : -1,
                qOcrText: pair.question.text.substring(0,100), sOcrText: pair.solution ? pair.solution.text.substring(0,100) : "MISSING"
            });
        }
        fs.writeFileSync(path.join(fileOutDir, 'metadata.json'), JSON.stringify(exportMeta, null, 2));
        console.log(`[COMPLETED] ${baseName} -> Extracted ${exportMeta.items.length} pairs.`);
    }

    await browser.close();
    console.log("\n★★★ ALL PDFS EXTRACTED SUCCESSFULLY! ★★★");
}
runMaster();
