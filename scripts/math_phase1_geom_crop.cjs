const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const BASE_CROP_DIR = "C:\\mentos_os_clean\\public\\math_crops";

const TARGET_DIRS = [
    "(5)수학1 중간", "(6)수학1 기말", "(7)수학2", "미적분", "확통"
];

const UNIT_KEYWORDS = [
    '지수함수', '로그함수', '지수', '로그', '삼각함수의활용', '삼각함수', 
    '등차수열', '등비수열', '수열의합', '수학적귀납법', '수열',
    '수열의극한', '극한', '미분계수', '도함수의활용', '도함수', '미분', 
    '부정적분', '정적분', '적분', '연속', '조건부확률', '확률', '통계', '이항정리', '순열', '조합'
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

async function runAlignedRebuild() {
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
    
    let processedFiles = 0;
    
    for (let i = 0; i < pdfList.length; i++) {
        const targetPdfPath = pdfList[i];
        const baseName = path.basename(targetPdfPath, '.pdf');
        
        const relativePath = path.relative(SOURCE_ROOT, targetPdfPath);
        const baseDir = path.dirname(relativePath);
        
        let foundKeyword = null;
        let fullPathStr = relativePath.replace(/\\/g, '/');
        for(let kw of UNIT_KEYWORDS) {
            if (fullPathStr.includes(kw)) { foundKeyword = kw; break; }
        }

        const fileOutDir = path.join(BASE_CROP_DIR, baseDir, baseName);
        if (fs.existsSync(fileOutDir)) fs.rmSync(fileOutDir, { recursive: true, force: true });
        fs.mkdirSync(fileOutDir, {recursive: true});

        console.log(`\n[초순수 사분할 및 정밀 마진 엔진 (모든 필터 제거된 황금버전) ${i+1}/${pdfList.length}] ${baseName}`);

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
                let qIndex = 1;

                // Pass 1: Parse Questions tighter crops
                for (let p = 1; p < fastAnswerPage; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    
                    const midX = viewport.width / 2;
                    let lA = [], rA = [];
                    for(let item of textContent.items) {
                        const t = item.str.trim();
                        // Require font to be fairly large to be a Problem Number anchor
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
                            let a = anchs[k]; 
                            let nxt = anchs[k+1];
                            let startY = Math.max(0, a.y - 85); 
                            let startX = isRight ? midX : 0;
                            if (a.x - startX >= 35) startX = a.x - 35; 
                            let maxH = nxt ? Math.max(startY + 50, nxt.y - 80) : viewport.height - 10;
                            let w = (isRight ? viewport.width : midX) - startX + 35; 
                            qBoxes.push({ num: qIndex++, page: p, x: startX, y: startY, w: w, maxH: maxH, str: a.str });
                        }
                    };

                    processCol(filterAnchors(lA), false);
                    processCol(filterAnchors(rA), true);
                }

                // Pass 2: Solutions sequentially
                const sBoxes = [];
                let sIndex = 1;

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
                            sBoxes.push({ num: sIndex++, page: p, x: startX, y: startY, w: w, maxH: maxH, str: a.str });
                        }
                    };

                    processSol(filterSol(lA), false);
                    processSol(filterSol(rA), true);
                }

                qBoxes.forEach(b => {
                    const m = b.str.match(/\d+/);
                    b.val = m ? parseInt(m[0], 10) : 0;
                });
                sBoxes.forEach(b => {
                    const m = b.str.match(/\d+/);
                    b.val = m ? parseInt(m[0], 10) : 0;
                });

                const pairs = [];
                let sIdx = 0;
                for (let qIdx = 0; qIdx < qBoxes.length; qIdx++) {
                    const q = qBoxes[qIdx];
                    let matchedS = null;
                    
                    // Match by value to avoid desync
                    for (let look = 0; look < 15; look++) {
                        let idx = sIdx + look;
                        if (idx < sBoxes.length && sBoxes[idx].val === q.val) {
                            matchedS = sBoxes[idx];
                            sIdx = idx + 1; 
                            break;
                        }
                    }
                    
                    // CRUCIAL REVERT: ALWAYS push the question so it NEVER starts from the middle physically!
                    pairs.push({ q: q, s: matchedS });
                }
                
                return pairs;
            }, pdfBase64);

            if (!result || result.length === 0) {
                console.log(`  -> 실패: 매칭 쌍 없음`);
                continue;
            }

            console.log(`  -> 추출 시작: 총 ${result.length} 문항 (초순수 마진 100% 회귀엔진)`);
            
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

            for (let i = 0; i < result.length; i++) {
                const pair = result[i];
                const seq = i + 1;
                const numStr = String(seq).padStart(3, '0');
                let successQ = false;
                
                for (const type of ['q', 's']) {
                    const obj = pair[type];
                    if (!obj) continue;

                    let prefix = foundKeyword ? `[${foundKeyword}]_` : "";
                    const targetNumStr = `${prefix}${type}${numStr}`;
                    
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
                        if(type==='q') successQ = true;
                    } catch(e) {}
                }

                if(successQ) {
                    exportMeta.items.push({
                        id: `${foundKeyword||'기타'} Q${numStr}`,
                        file_prefix: foundKeyword ? `[${foundKeyword}]_` : "",
                        qPage: pair.q.page, sPage: pair.s ? pair.s.page : null
                    });
                }
            }
            fs.writeFileSync(path.join(fileOutDir, 'metadata.json'), JSON.stringify(exportMeta, null, 2));
            processedFiles++;
        } catch(pdfErr) {
            console.error(`  -> [ERROR] 파싱 실패:`, pdfErr.message);
        } finally {
            if (workerPage) await workerPage.close();
        }
    }

    await browser.close();
    console.log(`\n★★★ 복구 회귀 엔진 100% 가동 완료 ${processedFiles}개 처리됨 ★★★`);
}
runAlignedRebuild().catch(console.error);
