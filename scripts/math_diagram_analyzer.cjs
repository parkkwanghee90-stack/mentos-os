require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const API_KEY = process.env.VITE_OPENAI_API_KEY;

const BASE_DIR = path.join(__dirname, '../public/math_crops/매쓰플랫_ultimate/고등수학(상)중간고사 2020 1+1(쌍둥이)p21');
const TARGET_Q_IMG = path.join(BASE_DIR, 'q001.png');
const TARGET_S_IMG = path.join(BASE_DIR, 's001.png');
const TARGET_Q_TXT = path.join(BASE_DIR, 'q001_ocr.txt');
const TARGET_S_TXT = path.join(BASE_DIR, 's001_ocr.txt');

async function callGPTVision(imageBuffer, prompt, isJson = true) {
    return new Promise((resolve, reject) => {
        const base64Image = imageBuffer.toString('base64');
        const data = JSON.stringify({
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
            temperature: 0.1,
            response_format: isJson ? { type: "json_object" } : { type: "text" }
        });

        const options = {
            hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(data) }
        };

        const req = https.request(options, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.error) return reject(parsed.error.message);
                    resolve(parsed.choices[0].message.content);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runDiagramPipeline() {
    console.log(`\n==================================================`);
    console.log(`[Diagram AI] 도형 감지 및 메타데이터 추출 엔진 (단일 문항 테스트)`);
    console.log(`==================================================`);

    if(!fs.existsSync(TARGET_Q_IMG)) return console.error("[ERROR] q001.png 없음");

    const qBuffer = fs.readFileSync(TARGET_Q_IMG);
    const metadata = await sharp(qBuffer).metadata();
    const w = metadata.width;
    const h = metadata.height;

    // 1단계 & 3단계: Vision AI로 도형 감지 및 요소 추출 (Bounding Box 포함)
    console.log(`=> GPT-4o Vision: 문항 내 도형 여부 및 구조 분석 중...`);
    const detectPrompt = `
이 수학 문제 이미지 내에 '기하학적 도형(선, 원, 삼각형 등)' 또는 '함수 그래프'가 포함되어 있는지 확인하라. (단순 수식 블록은 제외)
없다면 hasDiagram: false 로 응답하라.
존재한다면, 해당 도형만 잘라낼 수 있는 Bounding Box 정보를 전체 이미지의 상대 비율(0.0 ~ 1.0)로 반환하고,
도형을 구성하는 points(점), shapes(기본 도형), relations(관계형 구조) 정보를 추출하라.

출력 JSON:
{
  "hasDiagram": true/false,
  "boundingBox": { "top": 0.5, "left": 0.1, "width": 0.8, "height": 0.4 },
  "diagramMeta": {
    "points": ["A", "B", "C"],
    "shapes": ["circle", "triangle"],
    "relations": ["A-B 연결", "중심 O", "반지름 r"]
  }
}`;

    let diagramRes;
    try {
        const rawRes = await callGPTVision(qBuffer, detectPrompt, true);
        diagramRes = JSON.parse(rawRes);
    } catch(e) {
        return console.error(`[ERROR] Vision 분석 실패: ${e}`);
    }

    console.log(`\n=> [분석 결과] 도형 포함 여부: ${diagramRes.hasDiagram}`);

    let qTextImgPath = path.join(BASE_DIR, 'q001_text.png');
    let qDiagImgPath = path.join(BASE_DIR, 'q001_diagram.png');
    
    // 만약 진짜 도형이 없다고 판단했다면, 억지로라도 테스트를 위해 수식 영역을 도형으로 가정하도록 강제 처리 (데모용)
    if (!diagramRes.hasDiagram) {
        console.log(`[알림] 대상 문항에 기하학적 도형이 없어, 강제로 데모용 가상 Bounding Box (하단 절반)를 Diagram으로 간주합니다.`);
        diagramRes.hasDiagram = true;
        diagramRes.boundingBox = { top: 0.5, left: 0.1, width: 0.8, height: 0.4 };
        diagramRes.diagramMeta = {
            points: ["가상 점 A", "가상 점 B"],
            shapes: ["수식 영역 박스"],
            relations: ["알 수 없음 (도형 없음)"]
        };
    }

    console.log(JSON.stringify(diagramRes.diagramMeta, null, 2));

    // 2단계: 이미지 분리 저장
    console.log(`\n=> 텍스트 영역(q001_text.png)과 도형 영역(q001_diagram.png) 물리 분할 중...`);
    const box = diagramRes.boundingBox;
    
    const cropTop = Math.floor(h * box.top);
    const cropLeft = Math.floor(w * box.left);
    const cropWidth = Math.floor(w * box.width);
    const cropHeight = Math.floor(h * box.height);

    // 가상의 Text 영역 (간단히 Diagram 윗부분과 아랫부분을 텍스트 영역으로 가정하지만, 여기선 단순히 원본을 텍스트로 보존)
    // 실제라면 마스킹을 하거나 상단 부분만 자릅니다. (데모이므로 상단만 추출)
    const textHeight = Math.max(1, cropTop - 10);
    const textCrop = await sharp(qBuffer).extract({ left: 0, top: 0, width: w, height: textHeight }).toBuffer();
    fs.writeFileSync(qTextImgPath, textCrop);

    try {
        const diagCrop = await sharp(qBuffer).extract({ left: cropLeft, top: cropTop, width: Math.min(cropWidth, w - cropLeft), height: Math.min(cropHeight, h - cropTop) }).toBuffer();
        fs.writeFileSync(qDiagImgPath, diagCrop);
        console.log(`[완료] q001_diagram.png 추출 성공!`);
    } catch(e) {
         console.log(`[알림] Crop 실패, 원본 전체를 Diagram으로 갈음합니다.`);
         fs.writeFileSync(qDiagImgPath, qBuffer);
    }
    
    // 4단계 & 5단계: 통합 메타데이터 구성 및 최종 문제-해설 추론 연결
    console.log(`\n=> 최종 통합 추론 엔진 가동 (ChatGPT에 이미지+도형메타+텍스트 결합 전송)`);
    const qTextStr = fs.existsSync(TARGET_Q_TXT) ? fs.readFileSync(TARGET_Q_TXT, 'utf8') : '';
    const sTextStr = fs.existsSync(TARGET_S_TXT) ? fs.readFileSync(TARGET_S_TXT, 'utf8') : '';

    const finalPrompt = `
당신은 고도의 수학 교육 AI입니다. 
다음은 문제 텍스트, 추출된 도형 메타정보, 그리고 연결할 해설 텍스트입니다.
이 3가지를 매핑하여, 해설 내의 특정 과정이 도형의 어떤 점/선/관계와 연관되는지 해설을 재구성하세요.

---- [데이터 구조] ----
[문제 텍스트]
${qTextStr}

[도형 메타데이터]
${JSON.stringify(diagramRes.diagramMeta, null, 2)}

[원본 해설 텍스트]
${sTextStr}
-----------------------

위 정보를 바탕으로 다음 JSON 구조로 응답하세요:
{
  "enhancedSolution": "해설 텍스트. 단, 원본 해설 텍스트에 문제의 도형 메타데이터(점, 선 등)와의 관계성을 설명하는 내용을 [참고] 로 덧붙여 작성",
  "diagramConnection": "해설의 어느 부분이 도형의 어떤 요소(Points/Shapes)와 매핑되는지 요약"
}`;

    const diagBuffer = fs.readFileSync(qDiagImgPath);
    try {
        const solverResRaw = await callGPTVision(diagBuffer, finalPrompt, true);
        const solverRes = JSON.parse(solverResRaw);
        
        console.log(`\n==================================================`);
        console.log(`[핵심 목표 6단계 달성 결과] - "그림을 보고 푸는 해설 생성"`);
        console.log(`==================================================`);
        console.log(`[도형-해설 매핑 요약]`);
        console.log(solverRes.diagramConnection);
        console.log(`\n[최종 생성된 통합 해설]`);
        console.log(solverRes.enhancedSolution);
        console.log(`==================================================`);

    } catch(e) {
        console.log(`[ERROR] 해설 연결 실패: ${e}`);
    }

    console.log(`\n[전체 파이프라인 시범 구동 종료]`);
}

runDiagramPipeline();
