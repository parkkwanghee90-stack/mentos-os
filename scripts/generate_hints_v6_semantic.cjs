/**
 * generate_hints_v6.cjs
 * 원본 문제와 똑같이 복원하기 위해 AI가 "시맨틱 기하 명령어"를 호출하도록 하는 가장 발전된 V6 엔진입니다.
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
const DATA_DIR = path.join('C:\\mentos_os_clean\\public\\math_data', '삼각함수활용2단계');
const HINTS_DIR = path.join('C:\\mentos_os_clean\\public\\math_hints', '삼각함수활용2단계');

function toBase64(filePath) { return fs.readFileSync(filePath).toString('base64'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: MODEL, max_tokens: 4000, response_format: { type: "json_object" }, messages, temperature: 0 });
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

const SYSTEM_PROMPT = `당신은 한국 고등학교 수학 교사입니다. 문항 이미지와 해설 이미지를 완벽하게 결합하여, **해설지(a.png)의 풀이 과정을 토씨 하나 빠짐없이 10~20단계의 상세한 애니메이션 스텝으로 분할**하여 작성해야 합니다. 절대 중간 단계를 생략하거나 AI 스스로 요약하지 마십시오. (이것은 엄명입니다.)

[절대 규칙 1. 시맨틱 기하 명령어 체계 (문제 원형 복원)]
- 문제의 도형 형태에 맞춰 아래 명령어를 **여러 개 나열하여** 모든 점과 선을 완벽히 구축하십시오.
- "원" 문제라면 \`create_circle\` 후, 원 위에 있는 점들을 \`add_point_on_circle\` 혹은 \`add_point_free\`로 찍고 \`add_segment\`로 다 연결해야 합니다! (절대 원 하나만 달랑 그리고 끝내지 마십시오.)
1. {"cmd": "create_circle", "center": "O", "radius": 5, "id": "circumcircle"}
2. {"cmd": "add_point_on_circle", "point_id": "A", "center": "O", "radius": 5, "angle_deg": 45} (원 위의 점)
3. {"cmd": "add_point_free", "point_id": "P", "x": 3, "y": 2} (임의의 자유 점)
4. {"cmd": "add_segment", "id": "OA", "p1": "O", "p2": "A", "label": "반지름"}
5. {"cmd": "create_triangle", "vertices": ["A","B","C"], "angles": {"A": 105, "C": 30}} (삼각형일 경우)
6. {"cmd": "add_point_on_segment", "point_id": "D", "p1": "B", "p2": "C", "ratio": 0.5}

[절대 규칙 2. 오버레이 해설 분할 규칙 (가장 중요, 핵심, 엄명)]
- 해설지 이미지를 꼼꼼히 읽으십시오!! 해설에 등장하는 **단 하나의 중간 수식이나 계산 과정도 누락 없이 전부 1단계, 2단계, 3단계로 개별 스텝으로 쪼개서** 작성해야 합니다.
- 스텝 개수는 최소 7개 이상, 10~20개를 목표로 길게 늘어뜨려 작성하십시오. 수학 계산 과정을 학생들이 애니메이션처럼 하나씩 따라가야 하기 때문입니다.
- AI가 임의로 "이 과정을 통해 값을 구합니다" 라고 건너뛰며 요약하는 순간 이 프로젝트는 실패합니다. 수식을 토씨 하나 틀리지 말고 베껴 적으십시오.

[출력 JSON 구조]
{
  "problem_type": "geometry",
  "geometry_commands": [ // 뼈대 구축 명령어 배열 ],
  "steps": [
    {
      "step": 1,
      "title": "과정 명칭",
      "caption": "해설지에 있는 수식 첫 줄 (반드시 \\\\frac{a}{b} 처럼 이중 백슬래시)",
      "visual_action": { "type": "highlight" | "none", "target": "BC", "color": "#4ade80" }
    },
    ... (스텝 10 ~ 20개 필수) ...
  ]
}
`;

async function buildRenderDataForUnit(levelFolder, unitName, startId = 1, overrideEndId = null) {
  if (!API_KEY) { console.error('API KEY 없음'); return; }

  const cropsDir = path.join('C:\\mentos_os_clean\\public\\math_crops', '(5)수학1 중간', levelFolder, unitName);
  const dataDir = path.join('C:\\mentos_os_clean\\public\\math_data', unitName);
  const hintsDir = path.join('C:\\mentos_os_clean\\public\\math_hints', unitName);
  
  if (!fs.existsSync(cropsDir)) {
    console.error(`Dir not found: ${cropsDir}`);
    return;
  }

  const files = fs.readdirSync(cropsDir).filter(f => f.endsWith('.png') && !f.endsWith('a.png'));
  const ids = files.map(f => parseInt(f.substring(0,3)));
  const endId = overrideEndId || (ids.length > 0 ? Math.max(...ids) : 0);
  console.log(`\\n=== Starting ${levelFolder}/${unitName} [${startId} ~ ${endId}] ===`);

  for (let i = startId; i <= endId; i++) {
    const pid = String(i).padStart(3, '0');
    const qPath = path.join(cropsDir, `${pid}.png`);
    const aPath = path.join(cropsDir, `${pid}a.png`);
    const qB64 = fs.existsSync(qPath) ? toBase64(qPath) : null;
    const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;
    
    if(!qB64) {
      console.log(`[SKIP] ${pid}: No crop image.`);
      continue;
    }

    console.log(`\\n[Generating V6 Morphology] ${unitName} - ${pid}`);

    try {
      const response = await callGPT([
        { role: 'system', content: SYSTEM_PROMPT },
        {
           role: 'user', content: [
            { type: 'text', text: `문제 ${pid}의 시맨틱 기하 명령어와 스텝 작성. "문제 원형 복원"을 철저히 기하시오.` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}` } },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}` } }
          ]
        }
      ]);

      const baseFigure = geoEngine.processGeometryCommands(response.geometry_commands || []);
      
      const finalObj = {
        problem_id: pid,
        problem_type: response.problem_type || 'geometry',
        base_figure: baseFigure,
        viewBox: baseFigure.viewBox,
        steps: (response.steps || []).map(s => {
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

      validateSchema(finalObj);
      const outputDir = path.join(dataDir, pid);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const targetPath = path.join(outputDir, `${pid}.render.json`);
      const r = atomicWriteHints(targetPath, finalObj);
      
      atomicWriteHints(path.join(hintsDir, `${pid}.json`), finalObj);

      console.log(` ✅ ${pid} 성공: Semantic Engine Morphology 구축 완료 -> ${targetPath}`);

      await sleep(1500);
    } catch (e) {
      console.error(` ❌ ${pid} 실패:`, e.message);
    }
  }
}

async function runAll() {
  await buildRenderDataForUnit('3단계', '삼각함수활용3단계', 1, 1);
  console.log('\\n🎉 All Target Units Finished! 🎉');
}

runAll();
