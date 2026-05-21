/**
 * generate_hints_test.cjs
 * 
 * 두 단원 각 5문제씩 GPT-4o Vision으로 힌트 JSON 생성 테스트
 * 부등식 → 텍스트 steps만 (shapes 없음)
 * 삼각함수 → 문제+해설 이미지 둘 다 전송 → shapes + steps
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL   = 'gpt-4o';

const CROPS_BASE = 'C:\\mentos_os_clean\\public\\math_crops';
const OUT_BASE   = 'C:\\mentos_os_clean\\public\\math_hints';

const UNITS = [
  {
    key:    '부등식2단계',
    dir:    '(2)수학(상)기말\\(1)일차부등식 개념2단계(26) 1+1(쌍둥이)',
    type:   'algebra',
    count:  5,
  },
  {
    key:    '삼각함수활용2단계',
    dir:    '(5)수학1 중간\\2단계\\삼각함수활용2단계',
    type:   'geometry',
    count:  5,
  },
];

// ─── 이미지 → base64 ───────────────────────────────────────────
function toBase64(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.toString('base64');
}

// ─── GPT-4o API 호출 ───────────────────────────────────────────
function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages,
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
          reject(new Error('JSON parse error: ' + e.message + '\nRaw: ' + data.slice(0, 300)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── 프롬프트: 일차부등식 (수식/텍스트 steps) ──────────────────
function makeAlgebraMessages(qBase64) {
  return [
    {
      role: 'system',
      content: `당신은 한국 고등학교 수학 선생님입니다.
주어진 수학 문제 이미지를 분석하여 단계별 풀이 힌트를 JSON 형식으로 작성하세요.
반드시 아래 JSON 구조만 출력하세요. 다른 텍스트 없이 JSON만:

{
  "title": "문제 제목 (한 줄 요약)",
  "steps": [
    {
      "label": "1단계 - (핵심 키워드)",
      "lines": [
        { "type": "text", "content": "설명 텍스트" },
        { "type": "latex", "content": "LaTeX 수식 (달러 기호 없이)" }
      ]
    }
  ]
}

규칙:
- steps는 3~4개
- 각 step의 lines는 1~4개 (텍스트+수식 혼용)
- LaTeX는 KaTeX 호환 문법 사용
- 한국어로 작성
- 부등식 풀이는 이항, 계수 나누기, 해 표현 순서로`,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '이 일차부등식 문제의 단계별 풀이 힌트를 JSON으로 작성해주세요.' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${qBase64}`, detail: 'high' } },
      ],
    },
  ];
}

// ─── 프롬프트: 삼각함수 활용 (기하 shapes + steps) ────────────
function makeGeometryMessages(qBase64, aBase64) {
  return [
    {
      role: 'system',
      content: `당신은 한국 고등학교 수학 선생님입니다.
주어진 삼각함수 활용 문제와 해설 이미지를 분석하여 단계별 기하 애니메이션 힌트를 JSON으로 작성하세요.
반드시 아래 JSON 구조만 출력하세요:

{
  "title": "문제 제목 (한 줄 요약)",
  "steps": [
    {
      "label": "1단계 - (핵심)",
      "text": "이 단계 설명 (한국어)",
      "shapes": [
        { "type": "polygon", "points": [[x1,y1],[x2,y2],[x3,y3]], "stroke": "#60a5fa", "fill": "rgba(96,165,250,0.1)" },
        { "type": "line", "points": [[x1,y1],[x2,y2]], "color": "#f59e0b", "style": "dashed" },
        { "type": "circle", "cx": x, "cy": y, "r": 3, "color": "#ffffff" },
        { "type": "label", "x": x, "y": y, "text": "A", "color": "#60a5fa" },
        { "type": "latex", "x": x, "y": y, "content": "LaTeX 수식" },
        { "type": "arc", "cx": x, "cy": y, "r": 20, "startAngle": 0, "endAngle": 60, "color": "#10b981" },
        { "type": "rightangle", "x": x, "y": y, "size": 10, "color": "#10b981" }
      ]
    }
  ]
}

좌표 규칙:
- SVG viewBox: 0 0 200 200 기준
- 삼각형은 보통 (20,170), (180,170), (100,20) 등 넓게 배치
- 수선의 발, 각도 표시, 레이블 등은 해설 이미지의 구성 그대로 재현
- steps는 3~5개 (해설 풀이 흐름에 맞게)
- 각 step의 shapes는 누적 구성 (이전 step 도형 + 새 도형)
- 한국어로 작성`,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '문제 이미지:' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${qBase64}`, detail: 'high' } },
        { type: 'text', text: '해설 이미지 (이 해설의 풀이 과정을 단계별 도형 애니메이션으로 재현해주세요):' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${aBase64}`, detail: 'high' } },
      ],
    },
  ];
}

// ─── 메인 ──────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) { console.error('API key 없음!'); process.exit(1); }

  for (const unit of UNITS) {
    const srcDir = path.join(CROPS_BASE, unit.dir);
    const outDir = path.join(OUT_BASE, unit.key);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`\n=== ${unit.key} (${unit.type}) ===`);

    for (let i = 1; i <= unit.count; i++) {
      const num    = String(i).padStart(3, '0');
      const qPath  = path.join(srcDir, `${num}.png`);
      const aPath  = path.join(srcDir, `${num}a.png`);
      const outPath = path.join(outDir, `${num}.json`);

      if (!fs.existsSync(qPath)) { console.log(`[SKIP] ${num}.png 없음`); continue; }

      // 이미 생성된 경우 skip
      if (fs.existsSync(outPath)) {
        console.log(`[SKIP] ${num}.json 이미 존재`);
        continue;
      }

      console.log(`[GEN]  ${num} ...`);

      try {
        const qB64 = toBase64(qPath);
        let messages;

        if (unit.type === 'algebra') {
          messages = makeAlgebraMessages(qB64);
        } else {
          if (!fs.existsSync(aPath)) {
            console.log(`[WARN] ${num}a.png 없음 - 문제만으로 생성`);
            messages = makeAlgebraMessages(qB64); // fallback
          } else {
            const aB64 = toBase64(aPath);
            messages = makeGeometryMessages(qB64, aB64);
          }
        }

        const result = await callGPT(messages);

        // id, type 추가
        result.id   = num;
        result.type = unit.type;

        fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
        console.log(`[OK]   ${num}.json 저장 (steps: ${result.steps?.length ?? '?'})`);

        // API 레이트 리밋 방지 (1초 대기)
        await new Promise(r => setTimeout(r, 1200));

      } catch (e) {
        console.error(`[ERR]  ${num}: ${e.message}`);
      }
    }
  }

  console.log('\n=== 테스트 완료 ===');
  console.log('생성 위치:', OUT_BASE);
}

main();
