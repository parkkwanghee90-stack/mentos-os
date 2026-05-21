require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const BASE_CROP_DIR = path.join(__dirname, '../public/math_crops/매쓰플랫_ultimate');
const BANK_DIR = path.join(__dirname, '../src/data/math_problem_bank');

async function callGPT(payload, retries = 3) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "system", content: "You are a top-tier Math AI tutor." }, { role: "user", content: payload }],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });
        const options = {
            hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(data) }
        };
        const req = https.request(options, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', async () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.error) {
                        if (parsed.error.code === 'rate_limit_exceeded' && retries > 0) {
                            console.log('API 초과: 10초 대기 후 재시도...');
                            await new Promise(r => setTimeout(r, 10000));
                            return resolve(await callGPT(payload, retries - 1));
                        }
                        return reject(parsed.error.message);
                    }
                    resolve(JSON.parse(parsed.choices[0].message.content));
                } catch (e) {
                    if (retries > 0) { setTimeout(()=> resolve(callGPT(payload, retries-1)), 5000); } else { reject('Parse error'); }
                }
            });
        });
        req.on('error', (e) => { if (retries > 0) setTimeout(()=>resolve(callGPT(payload, retries-1)), 5000); else reject(e); });
        req.write(data);
        req.end();
    });
}

async function classifyCurriculumAI(baseName) {
    const prompt = [{ type: "text", text: `수학 문제집 파일명을 한국 중/고교 수학 교육과정에 맞춰 분류하라. 파일명: "${baseName}"
출력: { "grade": "고1|고2...", "semester": "1학기|2학기|통합", "course": "공통수학1|미적분...", "unit": "최종 핵심단원명", "diff": "상|중|하" }` }];
    try { return await callGPT(prompt); } catch(e) { return { grade: "미분류", semester: "미분류", course: "미분류", unit: "알수없음", diff: "중" }; }
}

async function runPhase2VisionGPT() {
    console.log(`\n==================================================`);
    console.log(`[PHASE 2] Ultimate Vision-AI Pipeline (통합 비용 절감 1-Call 패치용)`);
    console.log(`==================================================`);

    if(!fs.existsSync(BASE_CROP_DIR)) return console.log("[ERROR] Phase 1 폴더 없음");
    const folders = fs.readdirSync(BASE_CROP_DIR, {withFileTypes: true}).filter(d => d.isDirectory());
    
    for (const d of folders) {
        const metaPath = path.join(BASE_CROP_DIR, d.name, 'metadata.json');
        if (!fs.existsSync(metaPath)) continue;

        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        
        console.log(`\n=> [분석대기] ${meta.baseName}`);
        const curr = await classifyCurriculumAI(meta.baseName);
        const targetBankDir = path.join(BANK_DIR, curr.grade, curr.semester, curr.course, curr.unit, curr.diff);
        const finalJsonPath = path.join(targetBankDir, `${meta.baseName}.json`);

        if (fs.existsSync(finalJsonPath)) {
            console.log(`[SKIP] 기 처리 완료 JSON: ${meta.baseName}`);
            continue;
        }

        console.log(`=> 분류 결과: [${curr.grade} / ${curr.unit}] -> 통합 Batch Vision 호출 구성 중...`);

        let allProcessedItems = [];
        const chunkSize = 15; // To stay mostly under 30k tokens
        
        for (let chunkStart = 0; chunkStart < meta.items.length; chunkStart += chunkSize) {
            const currentChunk = meta.items.slice(chunkStart, chunkStart + chunkSize);
            const promptPayload = [
                { type: "text", text: `다음은 총 ${currentChunk.length}개 문제 이미지와 해당 원본 해설 텍스트 묶음이다.
아래의 규칙에 따라 각 문항을 처리하라:
1. 제공된 문제 이미지 내에 '기하학적 도형(선, 원, 다각형)' 도해나 '그래프'가 파악되는가?
   - 그렇다면 hasDiagram: true 이고, diagramMeta(points, shapes, relations) 정보를 요약하라.
   - 아니라면 hasDiagram: false.
2. 원본 해설을 읽어보고 수학적 LaTeX 문법에 맞게 solutionText로 정제하라.

JSON 결과 포맷 (반드시 아래 형태로만 응답할 것):
{
  "items": [
    {
      "number": 1,
      "hasDiagram": true,
      "diagramMeta": { "points": ["A", "B"] },
      "solutionText": "...정제된 해설 본문...",
      "formulaLatex": ["x^2 = y"]
    }
  ]
}
` }
            ];

            for (let i = 0; i < currentChunk.length; i++) {
                const item = currentChunk[i];
                const numStr = String(item.number || item.num).padStart(3, '0');
                const qImgLocalPath = path.join(__dirname, '../public', item.qImg || `/math_crops/매쓰플랫_ultimate/${meta.baseName}/q${numStr}.png`);
                promptPayload.push({ type: "text", text: `\n\n--- [문항 번호 ${item.number || item.num}] ---` });
                
                if (fs.existsSync(qImgLocalPath)) {
                    const base64Image = fs.readFileSync(qImgLocalPath).toString('base64');
                    promptPayload.push({ type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}`, detail: "low" } });
                }
                promptPayload.push({ type: "text", text: `[해설 원문] ${item.sText || item.sOcrText || ""}` });
            }

            console.log(`=> 챗GPT API 호출 시도 중... (${chunkStart+1} ~ ${Math.min(chunkStart+chunkSize, meta.items.length)} / ${meta.items.length})`);
            let chunkRes;
            try {
                chunkRes = await callGPT(promptPayload);
                if (chunkRes && chunkRes.items) allProcessedItems = allProcessedItems.concat(chunkRes.items);
            } catch(e) {
                console.error(`[ERROR] Batch GPT 실패 (Chunk ${chunkStart}): ${e}`);
            }
        }

        if(!fs.existsSync(targetBankDir)) fs.mkdirSync(targetBankDir, { recursive: true });

        const finalItems = meta.items.map(m => {
            const resData = allProcessedItems.find(it => it.number === (m.number || m.num)) || {};
            return {
                number: m.number || m.num,
                questionImage: m.qImg,
                solutionImage: m.sImg,
                hasDiagram: resData.hasDiagram || false,
                diagramMeta: resData.diagramMeta || {},
                solutionText: resData.solutionText || m.sText,
                formulaLatex: resData.formulaLatex || [],
                matched: true,
                matchScore: 1.0
            };
        });

        finalItems.forEach(it => {
            const txtFileName = `${meta.baseName}_Q${String(it.number).padStart(3, '0')}.txt`;
            const content = `문제 설명: ${it.solutionText}\n도형 연계: ${JSON.stringify(it.diagramMeta)}\n수식: ${it.formulaLatex.join(", ")}`;
            fs.writeFileSync(path.join(targetBankDir, txtFileName), content);
        });
        const finalObj = {
            schemaVersion: "6.0_BATCH_VISION",
            sourceQuestionPdf: meta.pdfPath,
            curriculum: curr,
            items: finalItems
        };

        fs.writeFileSync(finalJsonPath, JSON.stringify(finalObj, null, 2));
        console.log(`[SUCCESS] 통합 DB 생성 완료: ${finalJsonPath}`);
    }
}

runPhase2VisionGPT();
