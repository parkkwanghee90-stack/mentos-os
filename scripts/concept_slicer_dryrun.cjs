const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SAMPLE_FILES = [
    "C:\\mentos_os_clean\\public\\output_pdf\\2020_집중학습\\(2)수학하(8회차)\\@1회차 집합(38+10)\\[SSS노트]01-1집합과 원소 초급(12)표지.pdf",
    "C:\\mentos_os_clean\\public\\output_pdf\\2020_집중학습\\(2)수학하(8회차)\\@2회차 집합 명제(35+10)\\[SSS노트]02-2명제의 참 거짓 초급(15).pdf",
    "C:\\mentos_os_clean\\public\\output_pdf\\2020_집중학습\\(2)수학하(8회차)\\@3회차 명제 절대부등식(35+10)\\[SSS노트]03-1 필요조건과 충분조건 초급(16).pdf"
];

async function dryRunConceptCards() {
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
    
    // Create a worker context for pdfjs
    const page = await browser.newPage();
    await page.evaluate(() => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        document.head.appendChild(s);
    });
    await page.waitForFunction('window.pdfjsLib !== undefined');

    console.log("=========================================");
    console.log(" DRY-RUN: SSS 노트 개념 카드 분할 분석");
    console.log("=========================================\n");

    for (const pdfPath of SAMPLE_FILES) {
        if (!fs.existsSync(pdfPath)) continue;
        console.log(`[분석 대상]: ${path.basename(pdfPath)}`);
        
        const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
        
        const pageData = await page.evaluate(async (b64) => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const bin = window.atob(b64);
            const bytes = new Uint8Array(bin.length);
            for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
            
            let allCards = [];
            let currentSection = { index: "", title: "" };

            for (let pNum = 1; pNum <= pdf.numPages; pNum++) {
                const pdfPage = await pdf.getPage(pNum);
                const textContent = await pdfPage.getTextContent();
                const viewport = pdfPage.getViewport({scale: 2.0}); // high res
                
                let items = textContent.items.map(item => {
                    let pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                    return { text: item.str.trim(), y: pt[1], size: item.transform[0] };
                }).filter(item => item.text.length > 0);

                // Find Sections and Sub-concepts
                let pageAnchors = [];
                for (let i=0; i<items.length; i++) {
                    const it = items[i];
                    const numMatch = it.text.match(/^0[1-9]$/);
                    
                    if (numMatch) {
                        // Section: Size > 15
                        if (it.size > 15.0) {
                            let title = "";
                            // title is usually the next items
                            for(let j=i+1; j<Math.min(items.length, i+5); j++) {
                                if (items[j].y > it.y - 10 && items[j].y < it.y + 40) {
                                    if (items[j].size >= 11) {
                                        title += items[j].text + " ";
                                    }
                                }
                            }
                            currentSection = { index: it.text, title: title.trim() };
                        }
                        // Sub-concept Card Anchor: Size between 11 and 14
                        else if (it.size >= 11.0 && it.size <= 14.0) {
                            let title = "";
                            for(let j=i+1; j<Math.min(items.length, i+8); j++) {
                                // Close vertically
                                if (Math.abs(items[j].y - it.y) < 20) {
                                    if (items[j].text !== "개념확립") { // ignore tags
                                        title += items[j].text + " ";
                                    }
                                }
                            }
                            pageAnchors.push({
                                card_index: it.text,
                                card_title: title.trim(),
                                y_anchor: it.y,
                                page: pNum
                            });
                        }
                    }
                }
                
                // Calculate y_start and y_end for page anchors
                for (let i=0; i<pageAnchors.length; i++) {
                    let anchor = pageAnchors[i];
                    let startY = Math.max(0, anchor.y_anchor - 40); // 40px top padding
                    let endY;
                    if (i < pageAnchors.length - 1) {
                        endY = pageAnchors[i+1].y_anchor - 40;
                    } else {
                        // Last anchor on page -> slice to bottom, leaving some footer margin maybe?
                        endY = viewport.height - 80;
                    }
                    
                    allCards.push({
                        source_page: anchor.page,
                        section_index: currentSection.index,
                        section_title: currentSection.title,
                        card_index: anchor.card_index,
                        card_title: anchor.card_title,
                        y_start: startY,
                        y_end: endY,
                        height: endY - startY
                    });
                }
            }
            return allCards;
        }, pdfBase64);

        if (pageData.length === 0) {
             console.log("  ⚠️ 추출된 카드 개념이 없습니다 (표지이거나 구조가 다름)");
        } else {
             console.log(`  => 총 ${pageData.length} 개의 카드 분할 영역 인식 성공!`);
             
             // group to show section uniquely
             let sec = pageData[0].section_index ? `${pageData[0].section_index} ${pageData[0].section_title}` : "정보 없음";
             console.log(`  [상위 섹션 정보 적용 중]: ${sec}`);
             
             pageData.forEach((card, idx) => {
                  console.log(`\n  --- 📇 카드 ${idx+1} ---`);
                  console.log(`  - 제목: [${card.card_index}] ${card.card_title}`);
                  console.log(`  - 좌표: Page ${card.source_page} | Y: ${card.y_start.toFixed(1)} ~ ${card.y_end.toFixed(1)} (높이구간: ${card.height.toFixed(1)}px)`);
                  if (card.height > 1500) {
                      console.log(`    ⚠️ 높이가 캔버스를 초과합니다! 렌더링 시 ${card.card_index}-1, ${card.card_index}-2 분할 대상입니다.`);
                  } else {
                      console.log(`    ✅ 고정 캔버스(여백포함 상단정렬)에 쏙 들어가는 적정 사이즈입니다.`);
                  }
             });
        }
        console.log("------------------------------------------");
    }

    await browser.close();
}

dryRunConceptCards().then(() => console.log("Dry run script execution finished."));
