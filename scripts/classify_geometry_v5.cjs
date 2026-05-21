/**
 * classify_geometry_v5.cjs
 * 도형 자동 분류 엔진 (AI가 도형을 그리는 것을 원천 차단하고 구조 분석만 수행)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL = 'gpt-4o';
const CROPS_DIR = path.join('C:\\mentos_os_clean\\public\\math_crops', '(5)수학1 중간', '2단계', '삼각함수활용2단계');
const DATA_DIR = path.join('C:\\mentos_os_clean\\public\\math_data', '삼각함수활용2단계');

function toBase64(filePath) { return fs.readFileSync(filePath).toString('base64'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: MODEL, max_tokens: 2000, response_format: { type: "json_object" }, messages, temperature: 0 });
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

const SYSTEM_PROMPT = `당신은 핵심 수학 엔진 분류기입니다. 제공된 문제와 해설 이미지를 분석하여 순수 객체 및 관계 정보만 JSON으로 추출합니다.
절대 도형의 좌표(x, y)를 스스로 상상해서 생성하지 마십시오.

반드시 아래 JSON 스키마를 준수하십시오:
{
  "problem_type": "geometry" | "graph" | "algebra_text" | "ratio_equation" | "mixed_geometry_graph",
  "geometry_subtype": "triangle_basic" | "triangle_with_auxiliary" | "circle_triangle" | "inscribed_quadrilateral" | "circle_chord_angle" | "circle_tangent" | "tangent_secant" | "circumcircle" | "inscribed_circle" | "polygon_angle" | "right_triangle_trig" | "generic_geometry_unknown" | null,
  "required_objects": {
    "circle": boolean,
    "points": ["A", "B", "C", "D"],
    "segments": ["AB", "BC"],
    "angles": ["A", "B"],
    "lengths": ["AC"]
  },
  "required_relations": [
    { "type": "inscribed", "target": "ABCD" },
    { "type": "length", "target": "AC", "value": "1" },
    { "type": "angle", "target": "B", "value": "90" },
    { "type": "parallel", "target": "AB,CD" } // 등등
  ]
}

[분류 규칙]
1. problem_type
- 원, 삼각형, 사각형, 각도, 접선, 현, 내접, 둘레 모양의 도형 그림 존재 → geometry
- 함수식, 그래프, 좌표축, 교점, 위치 이동 → graph
- 단순 수식, 비율 연립 → algebra_text
- 혼합 → mixed_geometry_graph

2. geometry_subtype (단, "원에 내접하는 사각형 ABCD" 등의 문제가 있다면 무조건 inscribed_quadrilateral 로 분류)
- 그 외 조건에 따라 명확히 가장 적합한 1가지를 선택하세요.
`;

async function runClassification(start, end) {
  if (!API_KEY) { console.error('API KEY 없음'); return; }

  const results = [];
  console.log(`\n=== Classification Engine (Sample ${start}~${end}) ===\n`);

  for (let i = start; i <= end; i++) {
    const pid = String(i).padStart(3, '0');
    const qPath = path.join(CROPS_DIR, `${pid}.png`);
    const aPath = path.join(CROPS_DIR, `${pid}a.png`);

    if (!fs.existsSync(qPath)) continue;

    console.log(`[Classifying] ${pid}...`);
    try {
      const qB64 = toBase64(qPath);
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;

      const result = await callGPT([
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user', content: [
            { type: 'text', text: `문제 ${pid} 자동 분류:` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}` } },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}` } }
          ]
        }
      ]);

      // selected_template 하드코딩 논리결합
      let template = "none";
      if (result.geometry_subtype === "triangle_basic" || result.geometry_subtype === "triangle_with_auxiliary") template = "drawTriangleTemplate()";
      else if (result.geometry_subtype === "circle_triangle" || result.geometry_subtype === "circumcircle" || result.geometry_subtype === "inscribed_circle") template = "drawCircleTriangleTemplate()";
      else if (result.geometry_subtype === "inscribed_quadrilateral") template = "drawInscribedQuadrilateralTemplate()";
      else if (result.geometry_subtype === "circle_chord_angle") template = "drawChordAngleTemplate()";
      else if (result.geometry_subtype === "circle_tangent" || result.geometry_subtype === "tangent_secant") template = "drawCircleTangentTemplate()";
      else if (result.geometry_subtype === "right_triangle_trig") template = "drawRightTriangleTrigTemplate()";
      else template = "manual_review";

      result.selected_template = template;

      const unitDir = path.join(DATA_DIR, pid);
      if (!fs.existsSync(unitDir)) fs.mkdirSync(unitDir, { recursive: true });
      fs.writeFileSync(path.join(unitDir, `${pid}.classification.json`), JSON.stringify(result, null, 2), 'utf8');

      results.push({
        id: pid,
        type: result.problem_type,
        subtype: result.geometry_subtype,
        template: result.selected_template,
        objectsCnt: result.required_objects?.points?.length || 0,
        relationsCnt: result.required_relations?.length || 0
      });
      console.log(` ✅ ${pid} -> ${result.problem_type} / ${result.geometry_subtype}`);
      await sleep(1000);
    } catch(e) {
      console.error(` ❌ ${pid} failed:`, e.message);
    }
  }

  console.log('\n==================================');
  console.log('[분류 결과 요약]');
  console.table(results);
}

runClassification(1, 20);
