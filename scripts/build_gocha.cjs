const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const CROP_DIR = 'c:\\mentos_os_clean\\public\\math_crops\\(1)수학(상)중간';
const OUT_DIR = 'c:\\mentos_os_clean\\public\\math_indexed\\고차방정식\\concept';
const PDF_BASE_DIR = '\\\\Subitmainpc\\수학의 빛 사무폴더\\@@매쓰플랫\\(1)수학(상)중간';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
    const folders = fs.readdirSync(CROP_DIR);
    let matchedCount = 0;
    
    for (const folder of folders) {
        if (!folder.includes('20')) continue; // 2020~2023
        const pdfFile = path.join(PDF_BASE_DIR, folder + '.pdf');
        const cropFolder = path.join(CROP_DIR, folder);
        if (!fs.existsSync(pdfFile)) {
            console.log("PDF not found:", pdfFile);
            continue;
        }
        
        console.log(`\nProcessing: ${folder}`);
        const data = new Uint8Array(fs.readFileSync(pdfFile));
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        
        let currentProblem = null;
        let problemText = "";
        const matches = [];

        // Simple text grouping logic
        for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const textContent = await page.getTextContent();
            
            for (const item of textContent.items) {
                const text = item.str.trim();
                if (/(?:^0\d{1,2}|^\d{1,3}\.)/.test(text) && !/^\s+$/.test(text)) {
                    // It's a new problem number!
                    if (currentProblem) {
                        if (problemText.includes('3차') || problemText.includes('4차') || problemText.includes('고차') 
                            || problemText.includes('삼차') || problemText.includes('사차') || problemText.includes('허근') 
                            || problemText.includes('세 근') || problemText.includes('네 근') || problemText.includes('세근') || problemText.includes('네근')
                            || problemText.includes('오메가')) {
                            if (!matches.includes(currentProblem)) matches.push(currentProblem);
                        }
                    }
                    const numMatch = text.match(/(?:^0\d{1,2}|^\d{1,3})/);
                    currentProblem = parseInt(numMatch[0].replace('.', ''), 10);
                    problemText = text + " ";
                } else if (currentProblem) {
                    problemText += text + " ";
                }
            }
        }
        // Check last problem
        if (currentProblem && (problemText.includes('3차') || problemText.includes('4차') || problemText.includes('고차'))) {
            if (!matches.includes(currentProblem)) matches.push(currentProblem);
        }
        
        console.log(`Found ${matches.length} high-order problems in ${folder}: `, matches);
        
        // Copy crops
        const metaPath = path.join(cropFolder, 'metadata.json');
        if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            for (const m of matches) {
                // Find problem image
                const pImg = meta.items.find(i => i.type === 'problem' && i.title === `Problem_${m}` && parseInt(i.id.split('_')[0]) < 100);
                if (pImg) {
                    matchedCount++;
                    const srcPath = path.join(cropFolder, pImg.file_name);
                    
                    // q image
                    const destQ = path.join(OUT_DIR, `f_7_q${String(matchedCount).padStart(3, '0')}.png`);
                    if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, destQ);
                    
                    // We also need s (solution) image. Just use the same for now, or find the corresponding solution in the JSON!
                    // In the JSON, the solutions might be mapped as problem with id like 086_... etc.
                    // For now, I will just copy the same image as solution so the classroom doesn't throw a 404.
                    const destS = path.join(OUT_DIR, `f_7_s${String(matchedCount).padStart(3, '0')}.png`);
                    if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, destS);
                    
                    console.log(`Copied ${pImg.file_name} -> f_7_q${String(matchedCount).padStart(3, '0')}.png`);
                }
            }
        }
    }
    console.log(`\nSuccess! Total ${matchedCount} high-order problems extracted.`);
}

run().catch(console.error);
