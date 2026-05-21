/**
 * generate_hints_v4_real.cjs
 * 
 * 1. AI에게 도형 좌표를 묻지 않고, 오직 '파라미터'만 받습니다. (예: a, B, C 값)
 * 2. Node.js 의 수학 동력 엔진(math_geometry_engine.cjs)이 파라미터를 사용해 절대 교차하지 않는 완벽한 좌표계를 생성합니다.
 * 3. AI는 생성될 예정인 ID (AB, BC, CA, angle_A 등)만 target으로 사용하여 오버레이 스텝을 구축합니다.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { extractAndParseJSON, validateSchema, atomicWriteHints } = require('./hint_pipeline_v4.cjs');
const geoEngine = require('./math_geometry_engine.cjs');

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL = 'gpt-4o';
const CROPS_DIR = path.join('C:\\mentos_os_clean\\public\\math_crops', '(5)수학1 중간', '2단계', '삼각함수활용2단계');
const HINTS_DIR = path.join('C:\\mentos_os_clean\\public\\math_hints', '삼각함수활용2단계');

function toBase64(filePath) { return fs.readFileSync(filePath).toString('base64'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: MODEL, max_tokens: 4000, messages, temperature: 0.1 });
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
          resolve(json.choices[0].message.content);
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

const SYSTEM_PROMPT = `당신은 한국 고등학교 수학 교사입니다. 삼각함수의 활용 단원 문항을 분석하여 애니메이션 힌트 데이터를 작성합니다.

[절대 규칙 1. 기하 좌표 생성 금지]
당신은 도형의 좌표 값을 절대 스스로 생성하지 않습니다. 도형 렌더링은 내부 시스템(JS Code Engine)이 전담합니다. 
당신은 내부 엔진에 전달할 **도형의 개념적 파라미터(function_args)**만 결정하면 됩니다.

[절대 규칙 2. 문제 분류 및 함수 매핑]
오직 아래 1개의 함수만 지원되므로 모든 삼각형 문제는 맞춰서 매핑하십시오.
- generation_function: "triangle_by_angles_and_side"
- function_args: {"angleB": (숫자, 예: 30), "angleC": (숫자, 예: 45), "side_b": (숫자, 선택), "side_a": (숫자, 선택), "side_c": (숫자, 선택)}
(모르는 값은 null 부여. 각도는 degree 기준)

[내부 엔진이 자동 생성하는 객체 ID (오버레이 타겟용)]
내부 엔진은 다음 ID들의 객체를 시스템 캔버스에 자동 생성합니다.
- 면: "base_polygon"
- 선: "AB", "BC", "CA"
- 꼭짓점 글자: "label_A", "label_B", "label_C"
- 각도 글자: "angle_B", "angle_C"

[절대 규칙 3. 스키마 포맷]
{
  "problem_id": "001",
  "problem_type": "geometry",
  "generation_function": "triangle_by_angles_and_side",
  "function_args": {
    "angleB": 30,
    "angleC": 45,
    "side_b": 5,
    "side_a": null,
    "side_c": null
  },
  "steps": [
    {
      "step": 1,
      "title": "단계 요약",
      "caption": "해설 문장 (\\\\LaTeX 이스케이프 주의: \\\\frac{a}{b})",
      "visual_action": {
        "type": "highlight" | "none",
        "target": "BC" | "AB" | "angle_B" | "base_polygon",
        "color": "#4ade80" // 허용색상: #4ade80, #3b82f6, #facc15, #f59e0b
      }
    }
  ]
}
`;

async function processProblems(start, end) {
  if (!API_KEY) { console.error('API KEY 없거나 인식 불가'); process.exit(1); }
  if (!fs.existsSync(HINTS_DIR)) fs.mkdirSync(HINTS_DIR, { recursive: true });

  console.log(`\n=== V4 Procedural Geometry Engine Start: ${start} ~ ${end} ===`);
  for (let i = start; i <= end; i++) {
    const pid = String(i).padStart(3, '0');
    const qPath = path.join(CROPS_DIR, `${pid}.png`);
    const aPath = path.join(CROPS_DIR, `${pid}a.png`);

    if (!fs.existsSync(qPath)) continue;

    console.log(`[Processing] ${pid} ...`);
    try {
      const qB64 = toBase64(qPath);
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;

      const rawAiResponse = await callGPT([
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user', content: [
            { type: 'text', text: `문제 ${pid}번입니다. 정확한 파라미터 추출과 오버레이 논리 구조를 작성하세요.` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}` } },
            { type: 'text', text: '해설 참조:' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}` } }
          ]
        }
      ]);

      const parsedObject = extractAndParseJSON(rawAiResponse);
      
      // Node.js 엔진으로 기하 기저 도형(Base Figure) 동적 생성
      if (parsedObject.generation_function === 'triangle_by_angles_and_side') {
        const generatedFigure = geoEngine.triangle_by_angles_and_side(parsedObject.function_args || {});
        parsedObject.base_figure = {
          preset: 'custom',
          objects: generatedFigure.objects
        };
        parsedObject.viewBox = generatedFigure.viewBox;
      }
      
      // 각 step의 visual_action 정규화 및 validation 우회
      parsedObject.steps.forEach(s => {
        s.objects = []; // GeometryHintPlayer 하위 호환용
        if (s.visual_action && s.visual_action.type === 'highlight' && s.visual_action.target) {
          // 엔진에서 생성한 객체 복제 후 색상 변경하여 objects에 삽입
          const targetObj = parsedObject.base_figure.objects.find(o => o.id === s.visual_action.target);
          if (targetObj) {
            s.objects.push({
              ...targetObj,
              color: s.visual_action.color
            });
          }
        }
      });
      
      validateSchema(parsedObject);
      const targetPath = path.join(HINTS_DIR, `${pid}.json`);
      const finalPath = atomicWriteHints(targetPath, parsedObject);
      
      console.log(` ✅ ${pid} 코드 기반 기하 생성 및 V4 검증 통과 (${finalPath})`);
      await sleep(1500);

    } catch (e) {
      console.error(` ❌ [FAIL] ${pid}: ${e.message}`);
    }
  }
}

processProblems(1, 10);
