const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const BASE_CROP_DIR = "C:\\mentos_os_clean\\public\\math_crops";

const TARGET_DIRS = [
    "(1)수학(상)중간", "(2)수학(상)기말", "(3)수학(하)중간", "(4)수학(하)기말",
    "(5)수학1 중간", "(6)수학1 기말", "(7)수학2", "미적분", "확통"
];

const UNIT_KEYWORDS = [
    '직선의방정식', '원의방정식', '일차부등식', '이차부등식', 
    '도형의이동', '점과좌표', '다항식', '방정식', '부등식', '복소수', '이차함수',
    '집합', '명제', '함수', '유리함수', '무리함수', '순열과조합',
    '지수함수', '로그함수', '삼각함수', '수열', '극한', '미분', '적분', '수열의극한'
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

async function runMaster() {
    console.log("Scanning target PDFs...");
    for (let t of TARGET_DIRS) {
        findPdfs(path.join(SOURCE_ROOT, t));
    }

    console.log(`[SCAN_COMPLETE] Total PDFs Found: ${pdfList.length}`);

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
        const metaPath = path.join(fileOutDir, 'metadata.json');

        // SKIP ALREADY PROCESSED
        if (fs.existsSync(metaPath)) {
            // Check if it's already renamed
            let metaJson = [];
            try { metaJson = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch(e){}
            // If it exists, let's just silently skip without heavy logging to save space.
            continue;
        }

        console.log(`\n[처리 중 ${i+1}/${pdfList.length}] ${baseName}`);
        if (!fs.existsSync(fileOutDir)) fs.mkdirSync(fileOutDir, {recursive: true});

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

                for (let p = 1; p < fastAnswerPage; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    const rawWords = textContent.items.map(it => it.str);
                    const fullText = rawWords.map(s => s.trim()).filter(Boolean).join(" ");
                    
                    let qCond = 0;
                    if (/(?:문제|0\d|\d\.|[0-9]{1,3}\.|\(\d+\))/.test(fullText)) qCond++;
                    if (/[①②③④⑤ㄱㄴㄷ]/.test(fullText)) qCond++;
                    if (/옳은|구하시오|값은|맞는|고르시오|풀이|답/.test(fullText)) qCond++;
                    if (/상|중|하|중하|쌍둥이/.test(fullText)) qCond++;
                    
                    if (qCond >= 2) {
                        const questionMatches = fullText.match(/0\d{2}\s*(?:상|중|하|최하|중하)/g) || [];
                        let qNumsHtml = [];
                        for(let match of questionMatches) {
                            const num = parseInt(match.match(/\d+/)[0], 10);
                            if (!qNumsHtml.includes(num)) qNumsHtml.push(num);
                        }
                        
                        if (qNumsHtml.length === 0) {
                            const looseNums = fullText.match(/(?:^|\s|\b)(\d{1,3})(?:\.|번|\s)/g);
                            if (looseNums && looseNums.length > 0) {
                                let possible = looseNums.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0 && n <= 200);
                                possible = [...new Set(possible)].sort((a,b)=>a-b);
                                if (possible.length > 0) qNumsHtml = possible.slice(0, 4);
                            }
                        }

                        if (qNumsHtml.length === 0) qNumsHtml = [-1, -2, -3, -4];

                        if (qNumsHtml.length > 0) {
                            const midX = viewport.width / 2;
                            const defaultH = viewport.height / 2;
                            
                            for (let k = 0; k < qNumsHtml.length; k++) {
                                const num = qNumsHtml[k];
                                let x, y, w, maxH;
                                if (qNumsHtml.length > 2) {
                                    if (k < 2) { 
                                        x = 0; w = midX; y = Math.max(0, (k % 2) * defaultH - 30); maxH = (k % 2 === 0) ? defaultH : viewport.height;
                                    } else {
                                        x = midX; w = viewport.width - midX; y = Math.max(0, ((k-2) % 2) * defaultH - 30); maxH = ((k-2) % 2 === 0) ? defaultH : viewport.height;
                                    }
                                } else {
                                    x = 0; w = midX;
                                    if (qNumsHtml.length === 1) { y = 0; maxH = viewport.height; } 
                                    else { y = Math.max(0, k * defaultH - 30); maxH = (k === 0) ? defaultH : viewport.height; }
                                }
                                qBoxes.push({num, page: p, x, y, w, maxH, text: fullText.substring(0, 100)});
                            }
                        }
                    }
                }

                for (let p = fastAnswerPage; p <= pdf.numPages; p++) {
                    const {viewport, textContent} = pdfTextContentCache[p];
                    const leftAnchors = [];
                    const rightAnchors = [];
                    const midX = viewport.width / 2;

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
                    const processAnchors = (anchorsList) => {
                        for (let k = 0; k < anchorsList.length; k++) {
                            const a = anchorsList[k];
                            const maxH = (k < anchorsList.length - 1) ? anchorsList[k+1].y - 5 : viewport.height;
                            sBoxes.push({num: a.num, page: p, x: Math.max(0, a.x - 20), y: Math.max(0, a.y - 20), w: a.w + 20, maxH: maxH + 10, text: ""});
                        }
                    };
                    processAnchors(buildSolAnchors(leftAnchors));
                    processAnchors(buildSolAnchors(rightAnchors));
                }

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
                console.log(`  -> 실패: 매칭 쌍 없음`);
                continue;
            }

            console.log(`  -> 추출 시작: ${result.length} 개 쌍`);
            
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

                    // Implement renaming directly here with the found keyword to bridge it to the concept card easily
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
            fs.writeFileSync(metaPath, JSON.stringify(exportMeta, null, 2));
            processedFiles++;
        } catch(pdfErr) {
            console.error(`  -> [ERROR] 파싱 실패:`, pdfErr.message);
        } finally {
            if (workerPage) await workerPage.close();
        }
    }

    await browser.close();
    console.log(`\n★★★ 복구 렌더링 + 매칭 리네이밍 작업 전면 완료 (새로 추출한 파일: ${processedFiles}개) ★★★`);
}
runMaster().catch(console.error);
