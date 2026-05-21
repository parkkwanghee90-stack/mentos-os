/**
 * regen_trig_hints_23_64.cjs
 * 
 * 삼각함수의 활용 2단계 023~064번 모지바케 힌트 JSON 재생성
 * V3 3-Layer 아키텍처 (base_figure + overlay_steps) 형식 출력
 * 기존 파일을 덮어씀
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL   = 'gpt-4o';

const CROPS_DIR  = path.join('C:\\mentos_os_clean\\public\\math_crops', '(5)수학1 중간', '2단계', '삼각함수활용2단계');
const HINTS_DIR  = path.join('C:\\mentos_os_clean\\public\\math_hints', '삼각함수활용2단계');
const RENDER_DIR = path.join('C:\\mentos_os_clean\\public\\math_data', '삼각함수활용2단계');

const START = 23;
const END   = 64;

function toBase64(filePath) {
  return fs.readFileSync(filePath).toString('base64');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages,
      temperature: 0.15
    });

    const options = {
      hostname: 'api.openai.com',
      path:     '/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Content-Type':  'application/json',
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
        } catch(e) {
          reject(new Error('JSON parse error: ' + e.message + '\nRaw: ' + data.slice(0, 500)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeMessages(qBase64, aBase64, pid) {
  return [
    {
      role: 'system',
      content: `당신은 한국 고등학교 수학 교사입니다. 삼각함수의 활용 도형 문제의 풀이를 **V3 3-Layer JSON** 형식으로 작성합니다.

출력 JSON (반드시 이 구조를 따르세요):
{
  "layer": "render",
  "id": "${pid}",
  "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      // 삼각형, 선분, 점, 텍스트 레이블 등 기본 도형
      // {"type": "polygon", "points": [[x1,y1],[x2,y2],[x3,y3]], "color": "#64748b", "fillOpacity": 0.1},
      // {"type": "drawSegment", "p1": [x1,y1], "p2": [x2,y2], "color": "#4ade80"},
      // {"type": "point", "x": 6, "y": 8, "color": "#facc15", "label": "D"},
      // {"type": "label_text", "tex": "A", "at": [-0.6, 14], "color": "#4ade80"},
      // {"type": "label_text", "tex": "6\\\\sqrt{2}", "at": [3, 7], "color": "#3b82f6"}
    ]
  },
  "overlay_steps": [
    {
      "step": 1,
      "label_text": "STEP 1. 도형 분석",
      "text": "해설 내용을 한국어로 (LaTeX 수식 포함 가능: \\\\cos\\\\theta 등)",
      "objects": []  // 이 단계에서 추가되는 도형(보조선, 각도 표시 등)
    }
    // ... 3~6단계
  ],
  "viewBox": {"x": [-3, 17], "y": [-3, 17]}
}

핵심 규칙:
1. **한국어 텍스트**를 정확하고 깨끗하게 작성하세요. 모지바케(??문자) 절대 금지!
2. **해설 이미지의 풀이 과정**을 정확히 참조하여 단계를 작성하세요. 임의의 풀이를 만들지 마세요.
3. **도형 좌표**: 문제의 길이/각도에 맞는 합리적인 좌표를 계산해서 넣으세요.
4. **color**: 빨간색(#ef4444 등) 절대 사용 금지. 사용 가능한 색상: #4ade80(초록), #3b82f6(파랑), #facc15(노랑), #64748b(회색), #a78bfa(보라), #f59e0b(앰버)
5. **LaTeX 수식**: text 필드 안에 \\\\cos, \\\\sin, \\\\frac{}{}, \\\\sqrt{}, \\\\triangle, \\\\angle, \\\\implies 등 사용 가능
6. **base_figure.objects에 기본 도형(삼각형, 꼭짓점 라벨 등)을 반드시 포함**시키세요.
7. text 필드에서 줄바꿈은 \\\\\\\\ 을 사용합니다.`
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: `문제 ${pid}번의 이미지입니다. 해설을 참조하여 V3 JSON을 생성해주세요.` },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${qBase64}`, detail: 'high' } },
        { type: 'text', text: '해설 이미지:' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${aBase64}`, detail: 'high' } }
      ]
    }
  ];
}

async function main() {
  if (!API_KEY) { console.error('❌ VITE_OPENAI_API_KEY 없음!'); process.exit(1); }

  fs.mkdirSync(HINTS_DIR, { recursive: true });
  
  let success = 0, fail = 0;

  for (let i = START; i <= END; i++) {
    const pid = String(i).padStart(3, '0');
    const qPath = path.join(CROPS_DIR, `${pid}.png`);
    const aPath = path.join(CROPS_DIR, `${pid}a.png`);

    if (!fs.existsSync(qPath)) {
      console.log(`[SKIP] ${pid}.png 문제 이미지 없음`);
      continue;
    }

    console.log(`[GEN] ${pid} 재생성 중...`);
    try {
      const qB64 = toBase64(qPath);
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;

      const result = await callGPT(makeMessages(qB64, aB64, pid));
      
      // 필수 필드 보정
      if (!result.layer) result.layer = 'render';
      if (!result.id)    result.id = pid;
      if (!result.type)  result.type = 'geometry';
      
      // math_hints에 저장 (레거시 경로 호환)
      const hintsPath = path.join(HINTS_DIR, `${pid}.json`);
      fs.writeFileSync(hintsPath, JSON.stringify(result, null, 2), 'utf8');
      
      // math_data 3-layer에 저장
      const renderDir = path.join(RENDER_DIR, pid);
      fs.mkdirSync(renderDir, { recursive: true });
      fs.writeFileSync(path.join(renderDir, `${pid}.render.json`), JSON.stringify(result, null, 2), 'utf8');
      
      console.log(`[OK]  ${pid} 저장 완료 ✅`);
      success++;
      
      // rate limit 방지
      await sleep(2000);
    } catch (e) {
      console.error(`[ERR] ${pid}: ${e.message}`);
      fail++;
      await sleep(3000);
    }
  }

  console.log(`\n완료! 성공: ${success}, 실패: ${fail}`);
}

main();
