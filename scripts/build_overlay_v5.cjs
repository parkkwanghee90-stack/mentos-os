/**
 * build_overlay_v5.cjs
 * Classification Data + Base Template -> AI Overlay -> Final JSON
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { extractAndParseJSON, validateSchema, atomicWriteHints } = require('./hint_pipeline_v4.cjs');
const templates = require('./geometryTemplateEngine.cjs');

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL = 'gpt-4o';
const CROPS_DIR = path.join('C:\\mentos_os_clean\\public\\math_crops', '(5)수학1 중간', '2단계', '삼각함수활용2단계');
const DATA_DIR = path.join('C:\\mentos_os_clean\\public\\math_data', '삼각함수활용2단계');
const HINTS_DIR = path.join('C:\\mentos_os_clean\\public\\math_hints', '삼각함수활용2단계');

function toBase64(filePath) { return fs.readFileSync(filePath).toString('base64'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: MODEL, max_tokens: 3000, response_format: { type: "json_object" }, messages, temperature: 0 });
    const options = {
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          resolve(JSON.parse(json.choices[0].message.content));
        } catch (e) {
          reject(new Error('GPT Network error: ' + e.message));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const SYSTEM_PROMPT = `당신은 애니메이션 오버레이 작성 AI입니다. 
좌표는 생성하지 마십시오. 이미 Base Geometry가 그려져 있으며, 당신은 해당 Base에 존재하는 ID의 색상을 바꾸는 애니메이션 스텝만 완벽한 JSON 포맷으로 제작합니다.

[절대 규칙 1. 스키마 완전 고정]
{
  "steps": [
    {
      "step": 1,
      "title": "단계별 한줄 요약",
      "caption": "해설 문장 (반드시 수식 이중 이스케이프 \\\\frac 처리)",
      "visual_action": {
        "type": "highlight" | "none",
        "target": "목표 ID 문자열",
        "color": "#facc15"
      }
    }
  ]
}

[타겟 ID 가이드]
- 삼각형/다각형 면적 전체: "base_polygon"
- 선분: "AB", "BC", "CA", "CD"...
- 원: "circumcircle"
- 점 문자: "label_A", "label_B"
- 각도: "angle_A", "angle_B"
`;

async function buildRenderData(start, end) {
  if (!API_KEY) { console.error('API KEY 없음'); return; }

  for (let i = start; i <= end; i++) {
    const pid = String(i).padStart(3, '0');
    const classFile = path.join(DATA_DIR, pid, `${pid}.classification.json`);
    
    if (!fs.existsSync(classFile)) {
      console.log(`[SKIP] ${pid}: No classification data.`);
      continue;
    }

    const classData = JSON.parse(fs.readFileSync(classFile, 'utf8'));
    console.log(`\n[Generating Overlay] ${pid} (${classData.problem_type} / ${classData.geometry_subtype})`);

    let baseFigure = { preset: "custom", objects: [] };
    const tplName = classData.selected_template.split('()')[0];
    
    if (templates[tplName]) {
      baseFigure = templates[tplName]();
    } else {
       baseFigure = templates.drawAlgebraTemplate();
    }

    // Save Base
    fs.writeFileSync(path.join(DATA_DIR, pid, `${pid}.base.json`), JSON.stringify(baseFigure, null, 2), 'utf8');

    const qPath = path.join(CROPS_DIR, `${pid}.png`);
    const aPath = path.join(CROPS_DIR, `${pid}a.png`);
    const qB64 = fs.existsSync(qPath) ? toBase64(qPath) : null;
    const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;
    
    if(!qB64) continue;

    try {
      const overlayResponse = await callGPT([
        { role: 'system', content: SYSTEM_PROMPT },
        {
           role: 'user', content: [
            { type: 'text', text: `문제 ${pid} 오버레이 스텝 작성. 현재 생성될 Base Object ID들은 다음과 같습니다.\n${baseFigure.objects.map(o=>o.id).join(', ')}` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}` } },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}` } }
          ]
        }
      ]);

      let overlaySteps = overlayResponse.steps || overlayResponse;
      if (!Array.isArray(overlaySteps)) overlaySteps = [overlaySteps];

      // Save Overlay
      fs.writeFileSync(path.join(DATA_DIR, pid, `${pid}.overlay.json`), JSON.stringify(overlaySteps, null, 2), 'utf8');

      // 머지 (Render.json 생성) --> Rule 3의 요구사항에 맞게 변환
      const finalObj = {
        problem_id: pid,
        problem_type: classData.problem_type,
        base_figure: baseFigure,
        viewBox: { x: [-6, 12], y: [-6, 12] },
        steps: overlaySteps.map(s => {
          // Visual Action 정규화 및 객체 매핑
          const clonedObj = [];
          if (s.visual_action && s.visual_action.target && s.visual_action.type === 'highlight') {
            const tgtId = s.visual_action.target;
            const originObj = baseFigure.objects.find(o => o.id === tgtId);
            if (originObj) {
              clonedObj.push({ ...originObj, color: s.visual_action.color });
            }
          }
          return {
            step: s.step,
            title: s.title,
            caption: s.caption,
            visual_action: s.visual_action,
            objects: clonedObj
          };
        })
      };

      // V4 파이프라인으로 안전 저장 ( math_data의 render.json 경로 사용 )
      validateSchema(finalObj);
      const targetPath = path.join(DATA_DIR, pid, `${pid}.render.json`);
      const r = atomicWriteHints(targetPath, finalObj);
      
      console.log(` ✅ ${pid} 성공: Base Layout + AI Overlay 병합 완료 -> ${r}`);

      await sleep(1500);
    } catch (e) {
      console.error(` ❌ ${pid} 실패:`, e.message);
    }
  }
}

// 002 ~ 020 생성을 요청
buildRenderData(2, 20);
