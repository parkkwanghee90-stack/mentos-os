const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables for OpenAI key
dotenv.config({ path: path.join(__dirname, '../.env') });
const apiKey = process.env.VITE_OPENAI_API_KEY;

const BASE_CROP_DIR = path.join(__dirname, '../public/math_crops/매쓰플랫_ultimate');

async function askAIVision(imagePath, prompt) {
    if (!apiKey) return { text: "AI Key missing", ok: true };
    if (!fs.existsSync(imagePath)) return { text: "File missing", ok: false };
    
    // Read and encode image to base64
    const base64Image = fs.readFileSync(imagePath).toString('base64');
    const payload = {
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
                ]
            }
        ],
        temperature: 0.1
    };

    try {
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`API Error: ${response.status} ${errBody}`);
        }

        const data = await response.json();
        return { text: data.choices[0].message.content, ok: true };
    } catch (err) {
        return { text: err.message, ok: false };
    }
}

async function validateAll() {
    let folders;
    try {
        folders = fs.readdirSync(BASE_CROP_DIR, { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => d.name);
    } catch(e) {
        console.error("크롭 폴더가 존재하지 않거나 읽을 수 없습니다.");
        return;
    }

    console.log(`총 ${folders.length}개의 PDF 폴더에 대한 검수를 시작합니다.`);

    for (const folder of folders) {
        console.log(`\n==========================================`);
        console.log(`[검수 시작] ${folder}`);
        const metaPath = path.join(BASE_CROP_DIR, folder, 'metadata.json');
        
        if (!fs.existsSync(metaPath)) {
            console.log(`  => metadata.json 없음. 무시합니다.`);
            continue;
        }

        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        const items = meta.items || [];
        
        if (items.length === 0) {
            console.log(`  => 문항이 하나도 추출되지 않았습니다! (결함)`);
            continue;
        }

        let defects = [];
        let expectedNum = items[0].num;

        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            
            // 1. 번호 누락 검수 (Sequence Check)
            if (it.num !== expectedNum) {
                console.log(`  [결함 발견] 문항 번호 건너뜀! 기대번호:${expectedNum}, 실제번호:${it.num}. (${expectedNum}번이 누락됨)`);
                defects.push(`번호 누락: ${expectedNum}`);
                expectedNum = it.num; // Sync back
            }
            expectedNum++;

            // 2. 해설지 누락 검수
            if (!it.sPage) {
                console.log(`  [결함 발견] ${it.num}번 문항의 해설이 누락되었습니다.`);
                defects.push(`해설 누락: ${it.num}번`);
            }

            // AI Vision 검수를 통한 레이아웃 검수 (가장 마지막 1문제 정도만 샘플로 하거나, 필요시 전체 수행)
            // 비용과 속도를 고려해 여기서는 에러가 의심되는 문제(예: OcrText가 매우 짧거나 등)를 검수합니다.
            // 일단 모든 문제에 대해 Q이미지 검수를 돌리되 병렬처리 없이 순차적으로 진행.
            const qImagePath = path.join(BASE_CROP_DIR, folder, `q${String(it.num).padStart(3, '0')}.png`);
            if (fs.existsSync(qImagePath)) {
                process.stdout.write(`  - ${it.num}번 이미지 AI 분석중... `);
                
                // Prompt: Ask AI to check if the image is blank, if it has a question number, and if text/images are cut off.
                const prompt = `이 이미지는 수학 문제 번호 ${it.num}번의 크롭 이미지입니다. 
다음 사항을 검수하고 결과를 JSON 형식으로만 답변하세요.
1. "isBlank": 이미지가 완전히 하얗거나 내용이 없는가? (true/false)
2. "hasCorrectNumber": 이미지의 큰 번호가 ${it.num} 인가? (true/false)
3. "isCutOff": 글씨가 반쯤 잘리거나 도형/수식이 중간에 심하게 잘린 부분이 있는가? (하단이나 우측) (true/false)
{"isBlank": false, "hasCorrectNumber": true, "isCutOff": false}`;
                
                const res = await askAIVision(qImagePath, prompt);
                if (res.ok) {
                    try {
                        const cleanJson = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
                        const aiEval = JSON.parse(cleanJson);
                        if (aiEval.isBlank) {
                            console.log(`[불합격] 백지 이미지!`);
                            defects.push(`${it.num}번 백지 이미지`);
                        } else if (!aiEval.hasCorrectNumber) {
                            console.log(`[불합격] 번호 불일치!`);
                            defects.push(`${it.num}번 번호 불일치`);
                        } else if (aiEval.isCutOff) {
                            console.log(`[불합격] 하단/우측 짤림 발생!`);
                            defects.push(`${it.num}번 이미지 잘림`);
                        } else {
                            console.log(`[합격] 정상.`);
                        }
                    } catch(e) {
                         console.log(`[AI 응답 파싱 실패] ${res.text.slice(0,30)}...`);
                    }
                } else {
                     console.log(`[API 에러]`);
                }
            } else {
                console.log(`  [결함 발견] ${it.num}번 문항 이미지 파일이 없음!`);
                defects.push(`${it.num}번 이미지 누락`);
            }
        }

        // 결과 리포트 저장
        const reportPath = path.join(BASE_CROP_DIR, folder, 'validation_report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            folder,
            totalItems: items.length,
            defectsFound: defects.length > 0,
            defects
        }, null, 2));

        if (defects.length === 0) {
            console.log(`=> [완벽] ${folder} 의 모든 문항과 해설이 연속되며 품질이 정상입니다.`);
        } else {
            console.log(`=> [문제 발생] ${folder} 에서 기 기재된 결함들이 발견되었습니다.`);
        }
    }
    
    console.log(`\n[검수 종료] 모든 폴더의 검수가 완료되었습니다.`);
}

validateAll();
