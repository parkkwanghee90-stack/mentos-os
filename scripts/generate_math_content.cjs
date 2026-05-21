/**
 * generate_math_content.cjs
 * [PROJECT GOAL] 구조에 따른 통합 생성 스크립트
 * 1) 문제/해설 대응 (PNG 번호 기준 매칭)
 * 2) PCBS 엔진 (gpt-4o-mini - 저가 모델 사용) -> 사고 과정 추출
 * 3) 애니메이션 힌트 (gpt-4o - 고급 모델) -> 수학 함수 기반(Mafs) JSON
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const CROPS_BASE = 'C:\\mentos_os_clean\\public\\math_crops';
const HINT_OUT_BASE = 'C:\\mentos_os_clean\\public\\math_hints';
const PCBS_OUT_BASE = 'C:\\mentos_os_clean\\public\\math_pcbs_cache';

const TARGET_UNITS = [
  { p: '(5)수학1 중간\\2단계\\삼각함수활용2단계', key: '삼각함수활용2단계' },
];

function toBase64(filePath) {
  try {
    return fs.readFileSync(filePath).toString('base64');
  } catch(e) { return null; }
}

function callGPT(messages, model = 'gpt-4o', max_tokens = 4000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model, max_tokens, response_format: { type: 'json_object' }, messages, temperature: 0.1 });
    const options = {
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          resolve(JSON.parse(json.choices[0].message.content));
        } catch(e) { reject(new Error('Parse error')); }
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function makePcbsPrompt(qB64, aB64) {
  return [
    { role: 'system', content: `당신은 학생들의 수학 사고력을 길러주는 튜터입니다.
주어진 문제와 해설을 보고 다음 PCBS 구조의 JSON을 생성하세요.

{
  "P": "문제 해석 (구해야 하는 것은 무엇인가요?)",
  "C": "단서 추출 (문제에 명시된 핵심 조건은?)",
  "B": "개념 확인 (이 문제를 풀기 위해 필요한 수학적 개념/공식은?)",
  "S": "풀이 전략 (어떤 순서로 풀어야 할까요?)"
}
` },
    { role: 'user', content: [
      { type: 'text', text: '문제:' }, { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}` } },
      { type: 'text', text: '해설:' }, { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}` } }
    ]}
  ];
}

function makeHintPrompt(qB64, aB64) {
  return [
    { role: 'system', content: `당신은 수학 문제의 단계별 풀이를 시각적으로 표현하는 애니메이션 힌트 생성기입니다.
[STEP 4, 5 규칙] AI는 직접 그림을 그리지 않고, 오직 "숫자 및 수식 기반의 함수 명령(math.objects JSON)"만 생성합니다.

형식:
{
  "title": "문제 풀이",
  "type": "algebra", 
  "steps": [
    {
      "label": "1단계",
      "text": "설명",
      "math": {
        "latex": "수식",
        "objects": [ 
           // 1차/2차 부등식, 함수 그래프 등을 그릴 때 아래 타입 사용
           { "type": "function_plot", "expr": "x^2 - 4" },
           { "type": "point", "coords": [2, 0], "label": "2" },
           { "type": "point", "coords": [-2, 0], "label": "-2" },
           { "type": "segment", "from": [-2,0], "to": [2,0], "color": "#ef4444" }
        ]
      }
    }
  ]
}
` },
    { role: 'user', content: [
      { type: 'text', text: '문제:' }, { type: 'image_url', image_url: { url: `data:image/png;base64,${qB64}` } },
      { type: 'text', text: '해설:' }, { type: 'image_url', image_url: { url: `data:image/png;base64,${aB64}` } }
    ]}
  ];
}

function verifyRender(hintJson, unit, num) {
  const errors = [];
  if (!hintJson || !hintJson.steps) {
    errors.push('구조 불량: steps 배열 없음');
    return errors;
  }
  
  hintJson.steps.forEach((step, sIdx) => {
    if (step.math && Array.isArray(step.math.objects)) {
      step.math.objects.forEach((obj, oIdx) => {
        if (!obj.type) errors.push(`Step ${sIdx+1} Obj ${oIdx}: type 누락`);
        
        switch (obj.type) {
          case 'function_plot':
            if (!obj.expr || typeof obj.expr !== 'string') errors.push(`Step ${sIdx+1}: function_plot에 expr 수식 누락`);
            break;
          case 'point':
            if (!Array.isArray(obj.coords) || obj.coords.length !== 2) errors.push(`Step ${sIdx+1}: point 좌표 형식 오류 [x, y] 여야 함`);
            else if (typeof obj.coords[0] !== 'number' || typeof obj.coords[1] !== 'number') errors.push(`Step ${sIdx+1}: point 좌표가 숫자가 아님`);
            break;
          case 'segment':
            if (!Array.isArray(obj.from) || obj.from.length !== 2) errors.push(`Step ${sIdx+1}: segment from 좌표 오류`);
            if (!Array.isArray(obj.to) || obj.to.length !== 2) errors.push(`Step ${sIdx+1}: segment to 좌표 오류`);
            break;
        }
      });
    }
  });

  return errors;
}

async function main() {
  const logInfoStream = fs.createWriteStream(path.join(__dirname, 'render_test_report.log'), { flags: 'a' });
  const log = (msg) => {
    console.log(msg);
    logInfoStream.write(msg + '\\n');
  };

  log('==== [시작] 1,2차 부등식 68문제 생성 및 렌더링 검사 ====');
  for (const unit of TARGET_UNITS) {
    const srcDir = path.join(CROPS_BASE, unit.p);
    const hintDir = path.join(HINT_OUT_BASE, unit.key);
    const pcbsDir = path.join(PCBS_OUT_BASE, unit.key);
    
    if (!fs.existsSync(srcDir)) continue;
    fs.mkdirSync(hintDir, { recursive: true });
    fs.mkdirSync(pcbsDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => /^\d{3}\.(png|webp)$/.test(f)).sort();

    for (const f of files) {
      const num = f.split('.')[0];
      const qPath = path.join(srcDir, f);
      const aPath = path.join(srcDir, `${num}a.png`) || path.join(srcDir, `${num}a.webp`);
      
      const qB64 = toBase64(qPath);
      const aB64 = toBase64(aPath) || qB64;

      // 1. PCBS 생성 (gpt-4o-mini - 저가/빠른 모델)
      const pcbsOut = path.join(pcbsDir, `${num}_pcbs.json`);
      if (!fs.existsSync(pcbsOut)) {
        try {
          console.log(`[PCBS] generating ${unit.key} ${num} (mini)...`);
          const pcbs = await callGPT(makePcbsPrompt(qB64, aB64), 'gpt-4o-mini', 1500);
          fs.writeFileSync(pcbsOut, JSON.stringify(pcbs, null, 2));
        } catch(e) { console.error(`[PCBS ERR] ${num}: ${e.message}`); }
      }

      // 2. 애니메이션 힌트 생성 (gpt-4o - 시각/고급 모델)
      const hintOut = path.join(hintDir, `${num}.json`);
      if (!fs.existsSync(hintOut)) {
        try {
          console.log(`[HINT] generating ${unit.key} ${num} (4o)...`);
          const hint = await callGPT(makeHintPrompt(qB64, aB64), 'gpt-4o', 3000);
          hint.id = num;
          
          // 3. 렌더 검증
          const errors = verifyRender(hint, unit.key, num);
          if (errors.length > 0) {
            log(`[FAIL] ${unit.key} - ${num}: 문제가 발생했습니다. \n -> ` + errors.join('\\n -> '));
            hint._render_errors = errors; // 기록용
          } else {
            log(`[PASS] ${unit.key} - ${num}: 렌더 검증 통과`);
          }

          fs.writeFileSync(hintOut, JSON.stringify(hint, null, 2));
        } catch(e) { log(`[HINT ERR] ${unit.key} - ${num}: ${e.message}`); }
      } else {
         log(`[SKIP] ${unit.key} - ${num} 이미 존재함`);
      }
    }
  }
  
  log('==== 모든 처리 완료 ====');
  logInfoStream.end();
}

main();
