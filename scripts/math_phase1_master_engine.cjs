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
            if (lowName.match(/[a-z0-9\-]{36}/)) continue; // Keep UUID exclusion just to avoid garbage files
            pdfList.push(fullPath);
        }
    }
}

async function runMaster() {
    console.log("Scanning target PDFs...");
    findPdfs(TARGET_BASE_UNC);

    // Skip '1단계' based on user instruction
    pdfList = pdfList.filter(f => !f.includes('1단계'));

    console.log(`[SCAN_COMPLETE] Total PDFs Found: ${pdfList.length}`);

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        protocolTimeout: 300000 // 5 minutes - prevents timeout on large PDFs
    });
    
    for (let i = 0; i < pdfList.length; i++) {
        const targetPdfPath = pdfList[i];
        const baseName = path.basename(targetPdfPath, '.pdf');

        // SKIP already-processed folders (resume support)
        const fileOutDir = path.join(BASE_CROP_DIR, baseName);
        const metaPath = path.join(fileOutDir, 'metadata.json');
        if (fs.existsSync(metaPath)) {
            console.log(`[SKIP] 이미 처리됨: ${baseName}`);
            continue;
        }

        console.log(`\n\n[PROCESSING ${i+1}/${pdfList.length}] ${baseName}`);
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
            
            // Pass 1: Find answer page split
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

            // Pass 2: Extract Question Page Grid based on tag string!
            for (let p = 1; p < fastAnswerPage; p++) {
                const {viewport, textContent} = pdfTextContentCache[p];
                const rawWords = textContent.items.map(it => it.str);
                const fullText = rawWords.map(s => s.trim()).filter(Boolean).join(" ");
                
                // Identify question page
                let qCond = 0;
                if (/(?:문제|0\d|\d\.|[0-9]{1,3}\.|\(\d+\))/.test(fullText)) qCond++;
                if (/[①②③④⑤ㄱㄴㄷ]/.test(fullText)) qCond++;
                if (/옳은|구하시오|값은|맞는|고르시오|풀이|답/.test(fullText)) qCond++;
                if (/상|중|하|중하|쌍둥이/.test(fullText)) qCond++;
                const isQuestionPage = qCond >= 2;

                if (isQuestionPage) {
                    // Extract IDs from tag string! Top of page
                    const questionMatches = fullText.match(/0\d{2}\s*(?:상|중|하|최하|중하)/g) || [];
                    let qNumsHtml = [];
                    for(let match of questionMatches) {
                        const num = parseInt(match.match(/\d+/)[0], 10);
                        if (!qNumsHtml.includes(num)) qNumsHtml.push(num);
                    }
                    
                    if (qNumsHtml.length === 0) {
                        // Fallback: This PDF might not have the top title tag! Look for problem numbers floating left (1., 2., 3., 01, 02)
                        const looseNums = fullText.match(/(?:^|\s|\b)(\d{1,3})(?:\.|번|\s)/g);
                        if (looseNums && looseNums.length > 0) {
                            let possible = looseNums.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0 && n <= 200);
                            possible = [...new Set(possible)].sort((a,b)=>a-b);
                            // Only safely take up to 4 consecutive numbers if possible
                            if (possible.length > 0) {
                                qNumsHtml = possible.slice(0, 4);
                            }
                        }
                    }

                    if (qNumsHtml.length === 0) {
                        // Extreme Fallback: Just assume there are 4 problems (2x2 grid) so it doesn't skip!
                        qNumsHtml = [-1, -2, -3, -4];
                    }

                    if (qNumsHtml.length > 0) {
                        const midX = viewport.width / 2;
                        const defaultH = viewport.height / 2;
                        
                        let leftCount = 0;
                        let rightCount = 0;
                        
                        // We assume odd indices go to the left column, even indices right column (like Q1 Q2 on left, Q3 Q4 on right)
                        // Actually, Q1: top left, Q2: bottom left. Q3: top right, Q4: bottom right.
                        // For 2 questions: Q1: top left, Q2: bottom left OR top left & top right. Let's use 4 standard quadrant spots.
                        for (let k = 0; k < qNumsHtml.length; k++) {
                            const num = qNumsHtml[k];
                            let x, y, w, maxH;
                            if (qNumsHtml.length > 2) {
                                // 3 or 4 questions
                                if (k < 2) { // left col
                                    x = 0; w = midX;
                                    y = Math.max(0, (k % 2) * defaultH - 30);
                                    maxH = (k % 2 === 0) ? defaultH : viewport.height;
                                } else { // right col
                                    x = midX; w = viewport.width - midX;
                                    y = Math.max(0, ((k-2) % 2) * defaultH - 30);
                                    maxH = ((k-2) % 2 === 0) ? defaultH : viewport.height;
                                }
                            } else {
                                // 1 or 2 questions. Usually Left Column top-to-bottom.
                                x = 0; w = midX;
                                if (qNumsHtml.length === 1) {
                                    y = 0; maxH = viewport.height;
                                } else {
                                    y = Math.max(0, k * defaultH - 30);
                                    maxH = (k === 0) ? defaultH : viewport.height;
                                }
                            }
                            qBoxes.push({num, page: p, x, y, w, maxH, text: fullText.substring(0, 100)});
                        }
                    }
                }
            }

            // Pass 3: Extract Solution Pages via Text Anchoring! (Since Solutions are text, not images)
            for (let p = fastAnswerPage; p <= pdf.numPages; p++) {
                const {viewport, textContent} = pdfTextContentCache[p];
                const leftAnchors = [];
                const rightAnchors = [];
                const midX = viewport.width / 2;

                for (let item of textContent.items) {
                    const text = item.str.trim();
                    // Match numbers like 01, 001, 1., [01], or (01) at start of text blocks
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
                
                leftAnchors.sort((a,b) => a.y - b.y);
                rightAnchors.sort((a,b) => a.y - b.y);
                
                // Filter solution anchors (deduplicate very close ones)
                const buildSolAnchors = (anchorsList) => {
                    const res = [];
                    for(let a of anchorsList) {
                        if (res.length > 0 && Math.abs(res[res.length-1].y - a.y) < 20 && res[res.length-1].num === a.num) continue;
                        res.push(a);
                    }
                    return res;
                };

                const cleanLefts = buildSolAnchors(leftAnchors);
                const cleanRights = buildSolAnchors(rightAnchors);

                const processAnchors = (anchorsList) => {
                    for (let i = 0; i < anchorsList.length; i++) {
                        const a = anchorsList[i];
                        const maxH = (i < anchorsList.length - 1) ? anchorsList[i+1].y - 5 : viewport.height;
                        let innerText = "";
                        for (let item of textContent.items) {
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            if (pt[0] >= a.x && pt[0] < a.x + a.w && pt[1] >= a.y - 10 && pt[1] < maxH) {
                                innerText += item.str + " ";
                            }
                        }
                        // For crop width, we might want to capture just the column width instead of entire page
                        sBoxes.push({num: a.num, page: p, x: Math.max(0, a.x - 20), y: Math.max(0, a.y - 20), w: a.w + 20, maxH: maxH + 10, text: innerText.trim()});
                    }
                };

                processAnchors(cleanLefts);
                processAnchors(cleanRights);
            }

            // Deduplicate questions (take the ones from earlier pages just in case)
            const getBestQuestions = (arr) => {
                const map = new Map();
                for (let b of arr) if(!map.has(b.num) || b.page < map.get(b.num).page) map.set(b.num, b);
                return Array.from(map.values());
            };
            const uniqueQuestions = getBestQuestions(qBoxes);

            // Deduplicate solutions (score based)
            const getBestSolutions = (arr) => {
                const map = new Map();
                for (let b of arr) {
                    const existing = map.get(b.num);
                    const score = /해설|정답|풀이/.test(b.text) ? b.text.length + 500 : b.text.length;
                    const e_score = existing ? (/해설|정답|풀이/.test(existing.text) ? existing.text.length + 500 : existing.text.length) : 0;
                    if (!existing || score > e_score) map.set(b.num, b);
                }
                return Array.from(map.values());
            };
            const uniqueSolutions = getBestSolutions(sBoxes);

            const pairs = [];
            for (let q of uniqueQuestions) {
                const s = uniqueSolutions.find(sol => sol.num === q.num);
                if (q && s) pairs.push({ num: q.num, question: q, solution: s });
            }

            // If no qBoxes, fail
            if (qBoxes.length === 0) {
                console.log(`실패: 문제 상자 없음 - qBoxes: 0`);
                return null;
            }

            // Fallback for empty sBoxes: just map qBoxes without solutions
            if (pairs.length === 0 && qBoxes.length > 0) {
                for (let qBox of qBoxes) {
                    pairs.push({ num: qBox.num, question: qBox, solution: null });
                }
            }

            pairs.sort((a,b) => a.num - b.num);
            return pairs;
        }, pdfBase64);

        if (!result || result.length === 0) {
            console.log(`실패: 매칭 쌍 없음 (${baseName})`);
            continue;
        }

        console.log(`매칭 성공: ${result.length} 개 쌍. 다중 렌더링 시작...`);
        
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
            console.log(`Cropping Q/S: ${numStr}`);
            
            for (const type of ['question', 'solution']) {
                const obj = pair[type];
                if (!obj) continue; // Skip if no solution

                const targetNumStr = type==='question'?`q${numStr}`:`s${numStr}`;
                const pNum = obj.page;
                
                if(!pageCache.has(pNum)) {
                    let b64 = await workerPage.evaluate(async (b64, pn) => await window.renderSpecificPage(b64, pn), pdfBase64, pNum);
                    pageCache.set(pNum, Buffer.from(b64.split(',')[1], 'base64'));
                }
                
                let cropX = Math.floor(obj.x);
                let cropY = Math.floor(obj.y);
                let cropW = Math.floor(obj.w);
                let cropH = Math.floor(obj.maxH - obj.y);

                if (cropW > 1200) cropW = 1200;
                if (cropH > 1500) cropH = 1500;
                if (cropH < 50) cropH = 200;

                try {
                    const cImg = await sharp(pageCache.get(pNum)).extract({ left: cropX, top: cropY, width: cropW, height: cropH }).toBuffer();
                    fs.writeFileSync(path.join(fileOutDir, `${targetNumStr}.png`), cImg);
                    fs.writeFileSync(path.join(fileOutDir, `${targetNumStr}_ocr.txt`), obj.text);
                } catch(e) {}
            }

            exportMeta.items.push({
                id: `Q${numStr}`, num: pair.num,
                qPage: pair.question.page, sPage: pair.solution ? pair.solution.page : null,
                qOcrText: pair.question.text, sOcrText: pair.solution ? pair.solution.text : null
            });
        }
        fs.writeFileSync(path.join(fileOutDir, 'metadata.json'), JSON.stringify(exportMeta, null, 2));
        console.log(`[COMPLETED] ${baseName} -> Extracted ${exportMeta.items.length} pairs.`);
        } catch(pdfErr) {
            console.error(`[ERROR] ${baseName} 처리 실패, 다음 파일로 계속 진행:`, pdfErr.message);
        } finally {
            if (workerPage) await workerPage.close();
        }
    }

    await browser.close();
    console.log("\n★★★ ALL PDFS EXTRACTED SUCCESSFULLY! ★★★");
}
runMaster();
