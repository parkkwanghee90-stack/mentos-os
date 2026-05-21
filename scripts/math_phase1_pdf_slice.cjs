const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SOURCE_ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫";
const TARGET_DIRS = [
    "(2)수학(상)기말", "(3)수학(하)중간"
];
const OUT_BASE_DIR = "C:\\mentos_os_clean\\public\\math_crops";

let pdfs = [];
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
            pdfs.push(fullPath);
        }
    }
}

async function runPdfSliceMaster() {
    console.log("Scanning High 2+ PDFs...");
    for (let t of TARGET_DIRS) {
        findPdfs(path.join(SOURCE_ROOT, t));
    }
    console.log(`[SCAN_COMPLETE] Found: ${pdfs.length} PDFs for full extraction.`);

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        protocolTimeout: 600000
    });

    const page = await browser.newPage();
    await page.evaluate(() => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        document.head.appendChild(s);
    });
    await page.waitForFunction('window.pdfjsLib !== undefined', {timeout: 60000});

    let processedFiles = 0;

        for(let file of pdfs) {
        try {
            const bName = path.basename(file, '.pdf');
            if (bName.toLowerCase().includes("tot")) {
               console.log(`  -> [SKIP] 강제 지시: 최강 TOT 파일 패스합니다: ${bName}`);
               continue;
            }
            console.log(`\n[PDF 좌표 기반 순차열거 엔진 ${processedFiles+1}/${pdfs.length}] ${bName}...`);
            
            const relativePath = path.relative(SOURCE_ROOT, file);
            const baseDir = path.dirname(relativePath);
            const finalOutDir = path.join(OUT_BASE_DIR, baseDir, bName);
            
            // 제목에 명시된 문제 수(예: (50), (105문제))를 파싱하여 스마트하게 건너뜀
            let metaPath = path.join(finalOutDir, 'metadata.json');
            if(fs.existsSync(metaPath)) {
                let metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                let blockCount = metaData.items ? metaData.items.length : 0;
                
                let expectedProb = 0;
                const pMatch = bName.match(/(\d+)문제/);
                if(pMatch) {
                    expectedProb = parseInt(pMatch[1], 10);
                } else {
                    let matches = [...bName.matchAll(/\((\d+)\)/g)];
                    if (matches.length > 0) {
                        expectedProb = parseInt(matches[matches.length - 1][1], 10);
                    }
                }
                
                if (expectedProb > 0) {
                    if (blockCount >= expectedProb * 1.5) {
                        console.log(`  -> [정밀 검수 통과] 명시된 문제 수(${expectedProb}) 충족! 스킵합니다. (현재 ${blockCount}개)`);
                        processedFiles++;
                        continue;
                    } else {
                        console.log(`  -> [재추출 대상] 명시된 문제 수(${expectedProb})에 턱없이 부족(${blockCount}개). 파일 포맷 및 재생성!`);
                    }
                } else {
                    if (blockCount > 10) {
                        console.log(`  -> [정상 스킵] 충분한 분량(${blockCount}개) 추출 완료됨!`);
                        processedFiles++;
                        continue;
                    }
                }
            }
            
            if(fs.existsSync(finalOutDir)) fs.rmSync(finalOutDir, {recursive: true, force: true});
            fs.mkdirSync(finalOutDir, {recursive: true});
            
            const b64 = fs.readFileSync(file).toString('base64');
            
            const result = await page.evaluate(async (base64Data) => {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for(let j=0; j<binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
                const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
                window.activePdfDoc = pdf; // 전역 스코프에 저장하여 렌더링 시 재활용 (Timeout 방지 핵심)
                
                const docBlocks = [];

                for(let p = 1; p <= pdf.numPages; p++) {
                    const pdfPage = await pdf.getPage(p);
                    const viewport = pdfPage.getViewport({scale: 2.0});
                    const textContent = await pdfPage.getTextContent();
                    
                    const items = textContent.items.map(it => {
                        const pt = viewport.convertToViewportPoint(it.transform[4], it.transform[5]);
                        return {
                            str: it.str,
                            x: pt[0], y: pt[1],
                            w: it.width * viewport.scale,
                            h: it.height * viewport.scale || it.transform[0] * viewport.scale,
                            fontSize: it.transform[0] * viewport.scale
                        };
                    });
                    
                    const midX = viewport.width / 2;
                    const anchors = [];
                    
                    for(let i=0; i<items.length; i++) {
                        const it = items[i];
                        const t = it.str.trim();
                        if (/^\s*\d{1,3}\s*[\.\)]?$/.test(t) || /^\[\d{1,3}\]/.test(t) || /^\(0?\d{1,3}\)/.test(t)) {
                            const isLeft = (it.x > 0 && it.x < 100) || (it.x > midX && it.x < midX + 100);
                            if (isLeft && it.fontSize > 6.0) {
                                const sameLineText = items.filter(other => Math.abs(other.y - it.y) < 5 && other.x > it.x).sort((a,b)=>a.x - b.x).map(o=>o.str).join("").trim();
                                anchors.push({
                                    page: p,
                                    text: t,
                                    x: it.x,
                                    y: it.y,
                                    isRight: it.x > midX,
                                    fontSize: it.fontSize,
                                    titleCandidate: sameLineText || t
                                });
                            }
                        }
                    }
                    
                    const leftAnchors = anchors.filter(a => !a.isRight).sort((a,b)=>a.y - b.y);
                    const rightAnchors = anchors.filter(a => a.isRight).sort((a,b)=>a.y - b.y);

                    const processCol = (anchs, isRight) => {
                        for(let i=0; i<anchs.length; i++) {
                            let a = anchs[i];
                            let nxt = anchs[i+1];
                            
                            let y_start = Math.max(0, a.y - 70); 
                            let y_end = nxt ? nxt.y - 65 : viewport.height - 10;
                            let x_min = isRight ? midX : 0;
                            let x_max = isRight ? viewport.width : midX;

                            let blockItems = items.filter(it => it.x >= x_min && it.x <= x_max && it.y >= y_start && it.y <= y_end);
                            let blockText = blockItems.sort((m,n)=>m.y - n.y).map(it => it.str).join(" ");
                            let textLen = blockText.replace(/\s+/g, "").length;
                            
                            const m = a.text.match(/\d+/);
                            const cleanNum = m ? parseInt(m[0],10) : 0;
                            
                            docBlocks.push({
                                page: p,
                                anchorVal: a.text,
                                cleanNum: cleanNum,
                                title: a.titleCandidate,
                                y_start, y_end, x_min, x_max,
                                textLen,
                                blockTextPreview: blockText.substring(0, 50),
                                vpW: viewport.width,
                                vpH: viewport.height
                            });
                        }
                    };
                    
                    processCol(leftAnchors, false);
                    processCol(rightAnchors, true);
                }
                return docBlocks;
            }, b64);
            
            const exportMeta = {
                baseName: bName, pdfPath: file, items: []
            };
            
            console.log(`  -> 추출 시작: 앵커 & 블록 총 ${result.length}개 처리 (순수 직렬 리스팅)`);

            await page.evaluate(() => {
                if(!window.renderSpecificBlockFast) {
                    window.renderSpecificBlockFast = async function(blk) {
                        const pdfPage = await window.activePdfDoc.getPage(blk.page);
                        
                        const dpiScale = 3.0; // 300dpi 이상 요구
                        const sx = blk.x_min / 2.0; const sy = blk.y_start / 2.0;
                        const sw = (blk.x_max - blk.x_min) / 2.0; const sh = (blk.y_end - blk.y_start) / 2.0;

                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = sw * dpiScale; canvas.height = sh * dpiScale;

                        const renderContext = {
                            canvasContext: ctx,
                            viewport: pdfPage.getViewport({scale: dpiScale}),
                            transform: [1, 0, 0, 1, -(sx * dpiScale), -(sy * dpiScale)]
                        };

                        await pdfPage.render(renderContext).promise;
                        return canvas.toDataURL('image/png');
                    };
                }
            });

            let globalIndex = 1;

            for(let block of result) {
                let skipReason = "";
                let blockHeight = block.y_end - block.y_start;
                
                // 수학 기호나 숫자만 있는 문항이 날아가지 않도록, OMR 필터링 조건을 3.5% 이하 극초미세 사이즈로 대폭 완화!
                if(blockHeight < block.vpH * 0.035) {
                    skipReason = "초미세 블록 OMR (높이 3.5% 이하)";
                } else if(/^(답|정답|해답|빠른정답)\s*$/.test(block.blockTextPreview)) {
                    skipReason = "정답 단어만 존재";
                }
                if(skipReason) continue;
                
                let type = "problem";
                if(block.title.includes("정의") || block.title.includes("성질") || block.title.includes("함수") || block.title.includes("수열")) type = "concept";
                
                let cleanTitle = block.title.replace(/^[\d\.\s\[\]\(\)]+/, "").replace(/[\\/:*?"<>|]/g, "_").trim();
                if(!cleanTitle) cleanTitle = `Problem_${block.cleanNum}`;
                
                const seqStr = String(globalIndex++).padStart(3, '0');
                const numStr = String(block.cleanNum).padStart(2, '0');
                const imgName = `${seqStr}_N${numStr}_${cleanTitle}.png`;

                // Render using the FAST method without recompiling the PDF core
                const blkB64 = await page.evaluate((blk) => window.renderSpecificBlockFast(blk), block);
                const imgData = blkB64.split(',')[1];
                fs.writeFileSync(path.join(finalOutDir, imgName), Buffer.from(imgData, 'base64'));
                
                exportMeta.items.push({
                    id: `${seqStr}_${cleanTitle}`,
                    title: cleanTitle,
                    type: type,
                    file_name: imgName,
                    source_pdf: bName,
                    page: block.page,
                    y_start: block.y_start,
                    y_end: block.y_end
                });
            }
            
            fs.writeFileSync(path.join(finalOutDir, 'metadata.json'), JSON.stringify(exportMeta, null, 2));
            processedFiles++;
        } catch (err) {
            console.error(`  -> [ERROR] 패스 실패 (다음 파일로 넘어갑니다):`, err.message);
        }
    }

    await browser.close();
    console.log(`\n★★★ [매칭 제거 순수 무결점 시퀀스 열거 엔진 - 고속화] 처리 완료 ★★★`);
}

runPdfSliceMaster().catch(console.error);
