const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const BASE_CROP_DIR = "C:\\mentos_os_clean\\public\\math_crops";

const TARGET_DIRS = [
    "(5)수학1 중간", "(6)수학1 기말", "(7)수학2", "미적분", "확통"
];

let pdfList = [];
function findPdfs(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of entries) {
        if (dirent.name.toLowerCase().endsWith('.lnk')) continue;
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) findPdfs(fullPath);
        else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.pdf')) {
            const lowName = dirent.name.toLowerCase();
            if (lowName.match(/[a-z0-9\-]{36}/)) continue;
            pdfList.push(fullPath);
        }
    }
}

async function runPureRip() {
    console.log("Scanning High 2+ PDFs...");
    for (let t of TARGET_DIRS) {
        findPdfs(path.join(SOURCE_ROOT, t));
    }
    console.log(`[SCAN_COMPLETE] Found: ${pdfList.length}`);

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        protocolTimeout: 300000
    });
    
    for (let i = 0; i < pdfList.length; i++) {
        const targetPdfPath = pdfList[i];
        const baseName = path.basename(targetPdfPath, '.pdf');
        const relativePath = path.relative(SOURCE_ROOT, targetPdfPath);
        const baseDir = path.dirname(relativePath);
        
        const fileOutDir = path.join(BASE_CROP_DIR, baseDir, baseName);
        if (!fs.existsSync(fileOutDir)) fs.mkdirSync(fileOutDir, {recursive: true});

        console.log(`\n[순수 추출기 ${i+1}/${pdfList.length}] ${baseName}`);

        let workerPage = null;
        try {
            workerPage = await browser.newPage();
            await workerPage.evaluate(() => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
                document.head.appendChild(s);
            });
            await workerPage.waitForFunction('window.pdfjsLib !== undefined', {timeout: 60000});

            const pdfDataBuffer = fs.readFileSync(targetPdfPath);
            const pdfBase64 = pdfDataBuffer.toString('base64');

            const result = await workerPage.evaluate(async (base64Data) => {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for(let j=0; j<binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
                
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                
                let fastAnswerPage = -1;
                const pdfTextContentCache = [];
                for (let p = 1; p <= pdf.numPages; p++) {
                    const pdfPage = await pdf.getPage(p);
                    const viewport = pdfPage.getViewport({scale: 2.5});
                    const textContent = await pdfPage.getTextContent();
                    pdfTextContentCache[p] = {viewport, textContent, pageNum: p};
                    const textNoSpace = textContent.items.map(it => it.str).join("").replace(/\s+/g, "");
                    
                    if (p > pdf.numPages * 0.40 && fastAnswerPage === -1) {
                        if (textNoSpace.includes("정답과해설") || textNoSpace.includes("_정답") || textNoSpace.includes("풀이")) {
                            fastAnswerPage = p;
                        }
                    }
                }
                if (fastAnswerPage === -1) fastAnswerPage = Math.floor(pdf.numPages * 0.7);

                const qBoxes = [];
                for (let p = 1; p < fastAnswerPage; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    const midX = viewport.width / 2;
                    let lA = [], rA = [];
                    for(let item of textContent.items) {
                        const t = item.str.trim();
                        if (/^(?:0?[1-9]|[1-9][0-9])\.?$/.test(t)) {
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            if (pt[1] > 60 && item.transform[0] >= 6.0) { 
                                if (pt[0] < midX) lA.push({x: pt[0], y: pt[1], str: t});
                                else rA.push({x: pt[0], y: pt[1], str: t});
                            }
                        }
                    }
                    const filterAnchors = (anch) => {
                        anch.sort((a,b)=>a.y - b.y);
                        let res = [];
                        for(let a of anch) {
                            if(res.length===0 || a.y - res[res.length-1].y > 40) res.push(a);
                        }
                        return res;
                    };
                    const processCol = (anchs, isRight) => {
                        for(let k=0; k<anchs.length; k++) {
                            let a = anchs[k]; let nxt = anchs[k+1];
                            let startY = Math.max(0, a.y - 85); 
                            let startX = isRight ? midX : 0;
                            if (a.x - startX >= 35) startX = a.x - 35; 
                            let maxH = nxt ? Math.max(startY + 50, nxt.y - 80) : viewport.height - 10;
                            let w = (isRight ? viewport.width : midX) - startX + 35; 
                            qBoxes.push({ page: p, x: startX, y: startY, w: w, maxH: maxH, str: a.str });
                        }
                    };
                    processCol(filterAnchors(lA), false);
                    processCol(filterAnchors(rA), true);
                }

                const sBoxes = [];
                for (let p = fastAnswerPage; p <= pdf.numPages; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    const midX = viewport.width / 2;
                    let lA = [], rA = [];
                    for (let item of textContent.items) {
                        const t = item.str.trim();
                        if (/(?:^0\d{1,2}|^\d{1,3}\.)/.test(t) || /^\[\d{1,2}\]/.test(t) || /^\(0?\d{1,2}\)/.test(t) || /^(?:0?[1-9]|[1-9][0-9])\.?$/.test(t)) {
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            if (pt[1] > 30 && item.transform[0] >= 5.0) {
                                if (pt[0] < midX) lA.push({x: pt[0], y: pt[1], str: t});
                                else rA.push({x: pt[0], y: pt[1], str: t});
                            }
                        }
                    }
                    const filterSol = (anch) => {
                        anch.sort((a,b)=>a.y - b.y);
                        let res = [];
                        for(let a of anch) {
                            if(res.length===0 || a.y - res[res.length-1].y > 20) res.push(a);
                        }
                        return res;
                    };
                    const processSol = (anchs, isRight) => {
                        for(let k=0; k<anchs.length; k++) {
                            let a = anchs[k]; let nxt = anchs[k+1];
                            let startY = Math.max(0, a.y - 85); 
                            let startX = isRight ? midX : 0;
                            if (a.x - startX >= 35) startX = a.x - 35; 
                            let maxH = nxt ? Math.max(startY + 50, nxt.y - 80) : viewport.height - 10;
                            let w = (isRight ? viewport.width : midX) - startX + 35; 
                            sBoxes.push({ page: p, x: startX, y: startY, w: w, maxH: maxH, str: a.str });
                        }
                    };
                    processSol(filterSol(lA), false);
                    processSol(filterSol(rA), true);
                }
                return { qBoxes, sBoxes };
            }, pdfBase64);

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
            const doCrops = async (boxes, typePrefix) => {
                for (let idx = 0; idx < boxes.length; idx++) {
                    const obj = boxes[idx];
                    const targetNumStr = `raw_${typePrefix}_${String(idx+1).padStart(3, '0')}`;
                    const pNum = obj.page;
                    
                    if(!pageCache.has(pNum)) {
                        let b64 = await workerPage.evaluate(async (b64, pn) => await window.renderSpecificPage(b64, pn), pdfBase64, pNum);
                        pageCache.set(pNum, Buffer.from(b64.split(',')[1], 'base64'));
                    }
                    
                    let cropX = Math.floor(obj.x); let cropY = Math.floor(obj.y);
                    let cropW = Math.floor(obj.w); let cropH = Math.floor(obj.maxH - obj.y);
                    if (cropW > 1200) cropW = 1200; if (cropH > 1500) cropH = 1500;
                    if (cropH < 50) cropH = 200;

                    try {
                        const imgMeta = await sharp(pageCache.get(pNum)).metadata();
                        if (cropX < 0) cropX = 0; if (cropY < 0) cropY = 0;
                        if (cropX + cropW > imgMeta.width) cropW = imgMeta.width - cropX;
                        if (cropY + cropH > imgMeta.height) cropH = imgMeta.height - cropY;
                        if (cropW <= 0) cropW = 10; if (cropH <= 0) cropH = 10;

                        const cImg = await sharp(pageCache.get(pNum)).extract({ left: cropX, top: cropY, width: cropW, height: cropH }).toBuffer();
                        fs.writeFileSync(path.join(fileOutDir, `${targetNumStr}.png`), cImg);
                    } catch(e) {}
                }
            };

            await doCrops(result.qBoxes, 'q');
            await doCrops(result.sBoxes, 's');
            
            console.log(`  -> 추출 완료: 질문 ${result.qBoxes.length}장 / 해설 ${result.sBoxes.length}장 (수동삭제 대기중)`);

        } catch(pdfErr) {
            console.error(`  -> [ERROR] 파싱 실패:`, pdfErr.message);
        } finally {
            if (workerPage) await workerPage.close();
        }
    }

    await browser.close();
    console.log(`\n★★★ 순수 추출 완료. 이제 불필요한 파일을 수동으로 지우신 뒤, Phase2 Relinker를 실행하세요! ★★★`);
}
runPureRip().catch(console.error);
