/**
 * regen_trig_hints_stage3_4.cjs
 * 
 * 삼각함수의 활용 3단계/4단계 모지바케 힌트 JSON 전부 재생성
 * V3 3-Layer (base_figure + overlay_steps) 형식 출력
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL   = 'gpt-4o';

function toBase64(filePath) { return fs.readFileSync(filePath).toString('base64'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL, max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages, temperature: 0.15
    });
    const options = {
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const content = json.choices?.[0]?.message?.content;
          resolve(JSON.parse(content));
        } catch(e) { reject(new Error('JSON parse: ' + e.message + '\n' + data.slice(0, 500))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeMessages(qB64, aB64, pid) {
  return [
    { role: 'system', content: `당신은 한국 고등학교 수학 교사입니다. 삼각함수 활용 도형 문제의 풀이를 V3 3-Layer JSON으로 작성합니다.

출력 JSON:
{
  "layer": "render", "id": "${pid}", "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      {"type": "polygon", "points": [[x1,y1],[x2,y2],[x3,y3]], "color": "#64748b", "fillOpacity": 0.1},
      {"type": "drawSegment", "p1": [x1,y1], "p2": [x2,y2], "color": "#4ade80"},
      {"type": "point", "x": 6, "y": 8, "color": "#facc15", "label": "D"},
      {"type": "label_text", "tex": "A", "at": [-0.6, 14], "color": "#4ade80"},
      {"type": "label_text", "tex": "6\\\\sqrt{2}", "at": [3, 7], "color": "#3b82f6"}
    ]
  },
  "overlay_steps": [
    {"step": 1, "label_text": "STEP 1. 도형 분석", "text": "한국어 설명 (LaTeX OK)", "objects": []}
  ],
  "viewBox": {"x": [-3, 17], "y": [-3, 17]}
}

규칙:
- 한국어 정확하게. 모지바케 절대 금지!
- 해설 이미지 풀이를 그대로 따라갈 것
- 빨간색(#ef4444 등) 사용 금지. 허용 색상: #4ade80, #3b82f6, #facc15, #64748b, #a78bfa, #f59e0b
- base_figure에 삼각형/사각형 등 기본 도형 반드시 포함
- steps 3~6개` },
    { role: 'user', content: [
      { type: 'text', text: `문제 ${pid}번. 해설 참조하여 V3 JSON 생성.` },
      { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}`, detail: 'high' } },
      { type: 'text', text: '해설:' },
      { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}`, detail: 'high' } }
    ] }
  ];
}

async function processUnit(stage, cropsSubDir, hintsKey) {
  const CROPS_DIR  = path.join('C:\\mentos_os_clean\\public\\math_crops', '(5)수학1 중간', cropsSubDir);
  const HINTS_DIR  = path.join('C:\\mentos_os_clean\\public\\math_hints', hintsKey);
  const RENDER_DIR = path.join('C:\\mentos_os_clean\\public\\math_data', hintsKey);

  if (!fs.existsSync(CROPS_DIR)) {
    console.log(`[SKIP] Crops dir not found: ${CROPS_DIR}`);
    return;
  }
  
  fs.mkdirSync(HINTS_DIR, { recursive: true });
  
  const files = fs.readdirSync(CROPS_DIR).filter(f => /^\d{3}\.png$/.test(f)).sort();
  console.log(`\n=== ${hintsKey} === (${files.length}개 문항)`);
  
  let success = 0, fail = 0;
  
  for (const f of files) {
    const pid = f.split('.')[0];
    const qPath = path.join(CROPS_DIR, f);
    const aPath = path.join(CROPS_DIR, `${pid}a.png`);
    const hintsPath = path.join(HINTS_DIR, `${pid}.json`);
    
    // 이미 정상인 파일은 스킵
    if (fs.existsSync(hintsPath)) {
      const content = fs.readFileSync(hintsPath, 'utf8');
      if (!content.includes('??') && !content.includes('?�') && content.includes('구') ) {
        continue;
      }
    }
    
    console.log(`[GEN] ${hintsKey}/${pid}...`);
    try {
      const qB64 = toBase64(qPath);
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;
      const result = await callGPT(makeMessages(qB64, aB64, pid));
      
      if (!result.layer) result.layer = 'render';
      if (!result.id) result.id = pid;
      if (!result.type) result.type = 'geometry';
      
      fs.writeFileSync(hintsPath, JSON.stringify(result, null, 2), 'utf8');
      
      const renderDir = path.join(RENDER_DIR, pid);
      fs.mkdirSync(renderDir, { recursive: true });
      fs.writeFileSync(path.join(renderDir, `${pid}.render.json`), JSON.stringify(result, null, 2), 'utf8');
      
      console.log(`[OK]  ${pid} ✅`);
      success++;
      await sleep(1500);
    } catch (e) {
      console.error(`[ERR] ${pid}: ${e.message}`);
      fail++;
      await sleep(3000);
    }
  }
  
  console.log(`${hintsKey} 완료: 성공=${success}, 실패=${fail}`);
}

async function main() {
  if (!API_KEY) { console.error('API KEY 없음'); process.exit(1); }
  
  await processUnit(3, '3단계\\삼각함수활용3단계', '삼각함수활용3단계');
  await processUnit(4, '4단계\\삼각함수활용 4단계(68)', '삼각함수활용 4단계(68)');
  
  console.log('\n전체 완료!');
}

main();
