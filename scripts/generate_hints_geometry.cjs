/**
 * generate_hints_geometry.cjs
 * 
 * 삼각함수 활용 2단계 전체 문항에 대해 Mafs 선언형 기반 힌트 JSON 생성
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL   = 'gpt-4o'; // 4o 모델 사용

const CROPS_BASE = 'C:\\mentos_os_clean\\public\\math_crops';
const OUT_BASE   = 'C:\\mentos_os_clean\\public\\math_hints';

const UNIT_DIR = '(5)수학1 중간\\2단계\\삼각함수활용2단계';
const UNIT_KEY = '삼각함수활용2단계';

function toBase64(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.toString('base64');
}

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages,
      temperature: 0.1
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
          reject(new Error('JSON parse error: ' + e.message + '\\nRaw: ' + data.slice(0, 300)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeMessages(qBase64, aBase64) {
  return [
    {
      role: 'system',
      content: `당신은 한국 고등학교 수학 선생님입니다.
주어진 삼각함수 도형 문제와 해설 이미지를 분석하여, 선언형 수학 객체(geometry)를 기반으로 단계별(step-by-step) 힌트를 JSON으로 작성하세요. 
좌표를 임의로 지정하지 말고, 주어진 각도와 길이를 기반으로 선언형 "math.objects" 형식을 엄격히 준수하세요.

출력 JSON 형식:
{
  "title": "문제 제목 (예: 사인법칙을 이용한 외접원 반지름 구하기)",
  "type": "geometry",
  "steps": [
    {
      "label": "1단계 - 요약 키워드",
      "text": "이 단계의 구체적인 행동과 설명 (한국어)",
      "math": {
        "latex": "필요한 경우 여기에 LaTeX 수식을 추가",
        "objects": [
          {
            "type": "triangle_angles",
            "angles": { "A": 30, "B": 45, "C": 105 },
            "side": { "name": "BC", "value": 6 },
            "color": "#60a5fa"
          },
          { "type": "text", "x": 1, "y": 2, "content": "30°", "color": "#f59e0b" },
          { "type": "point", "coords": [1.5, 2.5], "label": "P", "color": "#10b981" },
          { "type": "segment", "from": [0, 0], "to": [1.5, 2.5], "color": "#10b981", "style": "dashed" },
          { "type": "perpendicular", "from": [1.5, 2.5], "to_line": [[0,0], [3,0]], "foot_label": "H", "color": "#f59e0b" },
          { "type": "circle", "center": [0, 0], "radius": 5, "color": "#ec4899" }
        ]
      }
    }
  ]
}

주의 및 규칙:
- steps는 3~5개로 작성하세요. 원본 해설의 풀이 흐름을 따릅니다.
- "type": "triangle_angles" 객체는 세 내각(합 180도)과 한 변의 길이를 통해 자동으로 그려집니다. 좌표를 알 필요가 없습니다. 주어진 문제에서 추출할 수 있는 구체적인 각도와 길이를 입력하세요.
- text 좌표, point 좌표, segment 양끝단, circle 중심 등은 대략적인 상대 위치를 추정해 숫자로 넣습니다(실제 계산기반이 아니라면 오차가 있을 수 있으나 합리적인 근사치를 사용하세요).
- 각 step의 objects는 누적(이전 단계 도형 포함) 또는 현재 단계 강조용으로 작성하세요.
- 만약 문제에 뚜렷한 기하 도형이 없고 수식 위주라면, "math.objects"를 비우거나 선언하지 말고 "type": "algebra" 형태로 작성해도 됩니다.`
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '문제 이미지:' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${qBase64}`, detail: 'high' } },
        { type: 'text', text: '해설 이미지:' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${aBase64}`, detail: 'high' } }
      ]
    }
  ];
}

async function main() {
  if (!API_KEY) { console.error('API key 없음!'); process.exit(1); }

  const srcDir = path.join(CROPS_BASE, UNIT_DIR);
  const outDir = path.join(OUT_BASE, UNIT_KEY);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => /^\d{3}\.png$/.test(f)).sort();
  console.log(`총 ${files.length}개 처리 시작... (이미 생성된 것은 skip)`);

  for (const f of files) {
    const num = f.split('.')[0];
    const qPath = path.join(srcDir, f);
    const aPath = path.join(srcDir, `${num}a.png`);
    const outPath = path.join(outDir, `${num}.json`);

    if (fs.existsSync(outPath)) {
      console.log(`[SKIP] ${num}.json`);
      continue;
    }

    console.log(`[GEN] ${num} ...`);
    try {
      if (!fs.existsSync(aPath)) {
        console.log(`[WARN] ${num}a.png 해설 이미지가 없습니다. 문제 기반으로만 생성합니다.`);
        // We will skip generating fallback to algebra. We try to provide the A image if exists.
      }

      const qB64 = toBase64(qPath);
      // aBase64 will be qB64 if A image missing
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64; 

      const result = await callGPT(makeMessages(qB64, aB64));
      
      result.id = num;
      if (!result.type) result.type = 'geometry';

      fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`[OK]  ${num}.json 저장됨.`);

    } catch (e) {
      console.error(`[ERR] ${num}: ${e.message}`);
    }
  }

  console.log('완료.');
}

main();
