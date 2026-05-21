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

async function runMasterRebuild() {
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

        console.log(`\n[선생님 지시: 초간단 1:1 파일명 매칭 엔진 ${i+1}/${pdfList.length}] ${baseName}`);

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
                
                const pdfPagesCache = [];
                for (let p = 1; p <= pdf.numPages; p++) {
                    const pdfPage = await pdf.getPage(p);
                    const viewport = pdfPage.getViewport({scale: 2.5});
                    const textContent = await pdfPage.getTextContent();
                    pdfPagesCache[p] = {viewport, textContent, pageNum: p};
                }

                let allBoxes = [];

                for (let p = 1; p <= pdf.numPages; p++) {
                    const {viewport, textContent} = pdfPagesCache[p];
                    const midX = viewport.width / 2;
                    let lA = [], rA = [];

                    for(let item of textContent.items) {
                        const t = item.str.trim();
                        // 매쓰플랫 문제/해설 번호 포맷 
                        if (/(?:^0\d{1,2}|^\d{1,3}\.)/.test(t) || /^\[\d{1,2}\]/.test(t) || /^\(0?\d{1,2}\)/.test(t) || /^(?:0?[1-9]|[1-9][0-9])\.?$/.test(t)) {
                            const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                            if (pt[1] > 30 && item.transform[0] >= 5.0) { 
                                if (pt[0] < midX) lA.push({x: pt[0], y: pt[1], str: t});
                                else rA.push({x: pt[0], y: pt[1], str: t});
                            }
                        }
                    }

                    const filterAnchors = (anch) => {
                        anch.sort((a,b)=>a.y - b.y);
                        let res = [];
                        for(let a of anch) {
                            if(res.length===0 || a.y - res[res.length-1].y > 20) res.push(a);
                        }
                        return res;
                    };

                    const processCol = (anchs, isRight) => {
                        for(let k=0; k<anchs.length; k++) {
                            let a = anchs[k]; let nxt = anchs[k+1];
                            
                            // 선생님 지시 4번: 빈 깍두기 표는 기하학적 간격으로 파괴!
                            // 거리가 40픽셀 미만으로 촘촘하면 문제나 긴 글이 들어갈 수 없는 OMR 테이블입니다.
                            let hDiff = nxt ? nxt.y - a.y : 500;
                            if (hDiff < 40) {
                                continue; 
                            }

                            let startY = Math.max(0, a.y - 85); 
                            let startX = isRight ? midX : 0;
                            if (a.x - startX >= 35) startX = a.x - 35; 
                            let maxH = nxt ? Math.max(startY + 50, nxt.y - 80) : viewport.height - 10;
                            let w = (isRight ? viewport.width : midX) - startX + 35; 
                            
                            const m = a.str.match(/\d+/);
                            const val = m ? parseInt(m[0], 10) : 0;
                            if (val > 0) {
                                allBoxes.push({ page: p, x: startX, y: startY, w: w, maxH: maxH, str: a.str, val: val });
                            }
                        }
                    };

                    processCol(filterAnchors(lA), false);
                    processCol(filterAnchors(rA), true);
                }

                // 빈 박스가 제거된 청정 배열에서, 문제(Q)와 해설(A) 구간을 분리!
                // 값(val)이 1,2..90 계속 증가하다가, 해설지가 시작되면 갑자기 1,2.. 로 폭락합니다.
                let splitIdx = -1;
                let maxValPhase = 0;
                for (let k = 1; k < allBoxes.length; k++) {
                    const prev = allBoxes[k-1].val;
                    const curr = allBoxes[k].val;
                    
                    if (prev >= 5) maxValPhase = Math.max(maxValPhase, prev);
                    
                    if (maxValPhase >= 5 && curr <= 3 && prev > curr) {
                        splitIdx = k;
                        break;
                    }
                }

                if (splitIdx === -1) {
                    splitIdx = Math.floor(allBoxes.length / 2);
                }

                const qBoxes = allBoxes.slice(0, splitIdx);
                const sBoxes = allBoxes.slice(splitIdx);
                sBoxes.forEach(b => b.used = false);

                const finalPairs = [];
                const trashs = [];
                
                // 선생님 지시: 똑같은 번호끼리 결합시켜 매칭하고 리네임 하라!
                for (let q of qBoxes) {
                    let matchedS = null;
                    for (let s of sBoxes) {
                        if (s.val === q.val && !s.used) {
                            matchedS = s;
                            s.used = true;
                            break;
                        }
                    }
                    finalPairs.push({ q: q, s: matchedS });
                }

                for (let s of sBoxes) {
                    if (!s.used) trashs.push(s);
                }

                return { finalPairs, trashs };
            }, pdfBase64);

            if (!result || result.finalPairs.length === 0) {
                console.log(`  -> 실패: 매칭 쌍 없음`);
                continue;
            }

            console.log(`  -> 추출 시작: 001_q-001_a 쌍 ${result.finalPairs.length}개 / 잉여 쓰레기 ${result.trashs.length}개`);
            
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
                baseName: baseName, pdfPath: targetPdfPath, pairCount: result.finalPairs.length, items: []
            };

            const processCrop = async (obj, targetName) => {
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
                    fs.writeFileSync(path.join(fileOutDir, `${targetName}.png`), cImg);
                    return true;
                } catch(e) { return false; }
            };

            for (let i = 0; i < result.finalPairs.length; i++) {
                const pair = result.finalPairs[i];
                const mappedVal = pair.q.val; 
                const numStr = String(mappedVal).padStart(3, '0');
                const pfix = foundKeyword ? `[${foundKeyword}]` : "";
                
                // 선생님 지시: 무조건 숫자가 앞에 오게! (001_q, 001_a)
                let successQ = false;
                if (pair.q) successQ = await processCrop(pair.q, `${numStr}_q_${pfix}`);
                if (pair.s) await processCrop(pair.s, `${numStr}_a_${pfix}`);

                if(successQ) {
                    exportMeta.items.push({
                        id: `${foundKeyword||'기타'} Q${numStr}`,
                        file_prefix: `${numStr}_`,
                        qPage: pair.q.page, sPage: pair.s ? pair.s.page : null
                    });
                }
            }

            for(let i=0; i<result.trashs.length; i++) {
                await processCrop(result.trashs[i], `z_trash_a_${String(i+1).padStart(3, '0')}`);
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
    console.log(`\n★★★ 선생님 초간단 지시사항 매칭 엔진 완료 ${processedFiles}개 처리됨 ★★★`);
}
runMasterRebuild().catch(console.error);
