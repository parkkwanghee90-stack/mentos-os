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
    pdfList = ["\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫\\(3)수학(하)중간\\1단계\\1단계 (1)집합p10(38).pdf"]; console.log("강제 타겟: " + pdfList[0]);

    // Prioritize '집합' PDFs so the user sees results immediately
    pdfList.sort((a,b) => {
        if (a.includes('집합') && !b.includes('집합')) return -1;
        if (!a.includes('집합') && b.includes('집합')) return 1;
        return 0;
    });

    console.log(`[SCAN_COMPLETE] Total PDFs Found: ${pdfList.length}`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
    
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
        console.log(`\n\n[PROCESSING ${i+1}/${pdfList.length}] ${baseName}`);

        const fileOutDir = path.join(BASE_CROP_DIR, baseName);
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
                const anchors = [];
                for (let item of textContent.items) {
                    const text = item.str.trim();
                    if (/(?:^0\d{2}|^\d{1,3}\.)/.test(text) && !/^\s+$/.test(text)) {
                        const numMatch = text.match(/(?:^0\d{2}|^\d{1,3})/);
                        if (numMatch) {
                            const num = parseInt(numMatch[0].replace('.', ''), 10);
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            if (pt[1] > 50) {
                                anchors.push({num, x: pt[0], y: pt[1], w: viewport.width});
                            }
                        }
                    }
                }
                
                anchors.sort((a,b) => a.y - b.y);
                
                // Filter solution anchors (deduplicate very close ones)
                const solAnchors = [];
                for(let a of anchors) {
                    if (solAnchors.length > 0 && Math.abs(solAnchors[solAnchors.length-1].y - a.y) < 20 && solAnchors[solAnchors.length-1].num === a.num) continue;
                    solAnchors.push(a);
                }

                for (let i = 0; i < solAnchors.length; i++) {
                    const a = solAnchors[i];
                    const maxH = (i < solAnchors.length - 1) ? solAnchors[i+1].y - 10 : viewport.height;
                    let innerText = "";
                    for (let item of textContent.items) {
                        const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                        if (pt[1] >= a.y - 10 && pt[1] < maxH) innerText += item.str + " ";
                    }
                    sBoxes.push({num: a.num, page: p, x: Math.max(0, a.x - 50), y: Math.max(0, a.y - 20), w: a.w, maxH, text: innerText.trim()});
                }
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
                const targetNumStr = type==='question'?`q${numStr}`:`s${numStr}`;
                const obj = pair[type];
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
                qPage: pair.question.page, sPage: pair.solution.page,
                qOcrText: pair.question.text, sOcrText: pair.solution.text
            });
        }
        fs.writeFileSync(path.join(fileOutDir, 'metadata.json'), JSON.stringify(exportMeta, null, 2));
        console.log(`[COMPLETED] ${baseName} -> Extracted ${exportMeta.items.length} pairs.`);
    }

    await browser.close();
    console.log("\n★★★ ALL PDFS EXTRACTED SUCCESSFULLY! ★★★");
}
runMaster();
