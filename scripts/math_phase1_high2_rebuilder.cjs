const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const BASE_CROP_DIR = "C:\\mentos_os_clean\\public\\math_crops";

// High 2+ Folders that were ruined and need a complete forceful rebuild.
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

async function runHigh2Rebuild() {
    console.log("Scanning High 2+ PDFs...");
    for (let t of TARGET_DIRS) {
        findPdfs(path.join(SOURCE_ROOT, t));
    }
    console.log(`[SCAN_COMPLETE] Total High 2+ PDFs Found: ${pdfList.length}`);

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
        
        // Force delete existing crops to cleanly rebuild 4-quadrant method.
        if (fs.existsSync(fileOutDir)) {
            fs.rmSync(fileOutDir, { recursive: true, force: true });
        }
        fs.mkdirSync(fileOutDir, {recursive: true});

        console.log(`\n[고2/고3 재처리 ${i+1}/${pdfList.length}] ${baseName}`);

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
                        if (textNoSpace.includes("빠른정답") || textNoSpace.includes("정답과해설") || textNoSpace.includes("_정답") || textNoSpace.includes("풀이")) {
                            fastAnswerPage = p;
                        }
                    }
                }
                if (fastAnswerPage === -1) fastAnswerPage = Math.floor(pdf.numPages * 0.7);

                const qBoxes = [];
                const sBoxes = [];

                // Pass 1: Parse Questions
                for (let p = 1; p < fastAnswerPage; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    const midX = viewport.width / 2;
                    let lastNum = -1;
                    
                    const leftAnchors = [];
                    const rightAnchors = [];

                    for (let item of textContent.items) {
                        const text = item.str.trim();
                        // Catch numbers like 01, 1, 01., 1.
                        if (/^(?:[0-9]{1,3})\.?$/.test(text) || /^(?:0[1-9])\.?$/.test(text)) {
                            let val = parseInt(text.replace('.',''), 10);
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            // Ignore numbers that are too small or headers (y < 40)
                            if (pt[1] > 40 && item.transform[0] >= 8.0) { 
                                if (pt[0] < midX) {
                                    if(leftAnchors.length===0 || leftAnchors[leftAnchors.length-1].num !== val) leftAnchors.push({num: val, y: pt[1]});
                                } else {
                                    if(rightAnchors.length===0 || rightAnchors[rightAnchors.length-1].num !== val) rightAnchors.push({num: val, y: pt[1]});
                                }
                            }
                        }
                    }

                    leftAnchors.sort((a,b) => a.y - b.y);
                    rightAnchors.sort((a,b) => a.y - b.y);

                    const mapAnchorsToQuadrants = (anchorsList, isRightCol) => {
                        for (let k = 0; k < anchorsList.length; k++) {
                            const a = anchorsList[k];
                            const nxt = anchorsList[k+1];
                            const maxH = nxt ? nxt.y - 10 : viewport.height;
                            const startY = Math.max(0, a.y - 20);
                            
                            qBoxes.push({
                                num: a.num,
                                page: p,
                                x: isRightCol ? midX : 0,
                                y: startY,
                                w: isRightCol ? viewport.width - midX : midX,
                                maxH: maxH,
                                text: ""
                            });
                        }
                    };

                    if (leftAnchors.length > 0 || rightAnchors.length > 0) {
                        mapAnchorsToQuadrants(leftAnchors, false);
                        mapAnchorsToQuadrants(rightAnchors, true);
                    } else {
                        // Extreme fallback: Force strictly 4 quadrants if it looks like a question page
                        const fullText = textContent.items.map(it => it.str).join("").replace(/\s+/g, "");
                        if(fullText.includes("문제") || fullText.includes("고르시오")) {
                            qBoxes.push({num: p*100 + 1, page: p, x: 0, y: 0, w: midX, maxH: viewport.height/2, text: "q1"});
                            qBoxes.push({num: p*100 + 2, page: p, x: 0, y: viewport.height/2, w: midX, maxH: viewport.height, text: "q2"});
                            qBoxes.push({num: p*100 + 3, page: p, x: midX, y: 0, w: viewport.width - midX, maxH: viewport.height/2, text: "q3"});
                            qBoxes.push({num: p*100 + 4, page: p, x: midX, y: viewport.height/2, w: viewport.width - midX, maxH: viewport.height, text: "q4"});
                        }
                    }
                }

                // Pass 2: Parse Solutions 
                for (let p = fastAnswerPage; p <= pdf.numPages; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    const midX = viewport.width / 2;
                    const leftAnchors = [];
                    const rightAnchors = [];

                    for (let item of textContent.items) {
                        const text = item.str.trim();
                        if (/(?:^0\d{1,2}|^\d{1,3}\.)/.test(text) && !/^\s+$/.test(text)) {
                            const numMatch = text.match(/(?:^0\d{1,2}|^\d{1,3})/);
                            if (numMatch) {
                                const num = parseInt(numMatch[0].replace('.', ''), 10);
                                const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                                if (pt[1] > 30) {
                                    if (pt[0] < midX) leftAnchors.push({num, x: 0, y: pt[1], w: midX});
                                    else rightAnchors.push({num, x: midX, y: pt[1], w: viewport.width - midX});
                                }
                            }
                        }
                    }
                    
                    leftAnchors.sort((a,b) => a.y - b.y); rightAnchors.sort((a,b) => a.y - b.y);
                    
                    const buildSolAnchors = (anchorsList) => {
                        const res = [];
                        for(let a of anchorsList) {
                            if (res.length > 0 && Math.abs(res[res.length-1].y - a.y) < 20 && res[res.length-1].num === a.num) continue;
                            res.push(a);
                        }
                        return res;
                    };
                    const processAnchors = (anchorsList, isRightCol) => {
                        for (let k = 0; k < anchorsList.length; k++) {
                            const a = anchorsList[k];
                            const maxH = (k < anchorsList.length - 1) ? anchorsList[k+1].y - 5 : viewport.height;
                            sBoxes.push({num: a.num, page: p, x: isRightCol ? midX : 0, y: Math.max(0, a.y - 20), w: a.w||midX, maxH: maxH + 10, text: ""});
                        }
                    };
                    processAnchors(buildSolAnchors(leftAnchors), false);
                    processAnchors(buildSolAnchors(rightAnchors), true);
                }

                // Deduplicate strictly but DO NOT lose sequential numbers
                const uniqueQuestions = Array.from(new Map(qBoxes.map(b => [b.num, b])).values());
                const uniqueSolutions = Array.from(new Map(sBoxes.map(b => [b.num, b])).values());

                const pairs = [];
                for (let q of uniqueQuestions) {
                    const s = uniqueSolutions.find(sol => sol.num === q.num);
                    if (q && s) pairs.push({ num: q.num, question: q, solution: s });
                }
                if (pairs.length === 0 && uniqueQuestions.length > 0) {
                    for (let qBox of uniqueQuestions) pairs.push({ num: qBox.num, question: qBox, solution: null });
                }

                pairs.sort((a,b) => a.num - b.num);
                return pairs;
            }, pdfBase64);

            if (!result || result.length === 0) {
                console.log(`  -> 실패: 매칭 쌍 발견 못함`);
                continue;
            }

            console.log(`  -> 추출 시작: ${result.length} 문항 (강제 4분할 및 독립 번호 앵커링)`);
            
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

                    let prefix = foundKeyword ? `[${foundKeyword}]_` : "";
                    const targetNumStr = type==='question' ? `${prefix}q${numStr}` : `${prefix}s${numStr}`;
                    
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

                exportMeta.items.push({
                    id: `${foundKeyword||'기타'} Q${numStr}`, num: pair.num,
                    file_prefix: foundKeyword ? `[${foundKeyword}]_` : "",
                    qPage: pair.question.page, sPage: pair.solution ? pair.solution.page : null,
                });
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
    console.log(`\n★★★ 고2/고3 대수파트 ${processedFiles}개 파일 강제 재건축(4-Quadrant) 완료! ★★★`);
}
runHigh2Rebuild().catch(console.error);
