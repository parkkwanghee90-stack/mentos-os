const fs = require('fs');
const path = require('path');
const https = require('https');

let envContent = '';
try { envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8'); } catch (e) {}
const API_KEY = (envContent.match(/VITE_OPENAI_API_KEY=(.+)/) || [])[1]?.trim() || process.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("OpenAI API key missing.");
  process.exit(1);
}

// 1. 수학적귀납법4단계 고장난 \text{} 정규식 청소
function fixMathInduction4() {
  console.log("=== 수학적귀납법4단계 텍스트 깨짐 복구 시작 ===");
  const dir = 'C:/mentos_os_clean/public/math_hints/수학적귀납법4단계';
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  let fixedCount = 0;
  for (const f of files) {
    const fp = path.join(dir, f);
    let raw = fs.readFileSync(fp, 'utf8');
    let d;
    try { d = JSON.parse(raw); } catch(e) { continue; }
    
    let changed = false;
    if (d.S && d.S.includes('\\text{')) {
      // 한글이 포함된 \text{...} 덩어리 삭제
      const oldS = d.S;
      d.S = d.S.replace(/\\text\{[^}]*[가-힣]+[^}]*\}/g, '');
      // 닫히지 않은 \text{... $$ 삭제
      d.S = d.S.replace(/\\text\{[가-힣a-zA-Z\s]*\$\$/g, '$$');
      
      // P, C 등에서도 깨진 text가 있다면 제거
      if (d.P && d.P.includes('\\text{')) {
          d.P = d.P.replace(/\\text\{[^}]*[가-힣]+[^}]*\}/g, '').replace(/\\text\{[가-힣a-zA-Z\s]*\$\$/g, '$$');
      }
      if (oldS !== d.S) changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');
      fixedCount++;
      console.log(`[Fixed] ${f}`);
    }
  }
  console.log(`=== 복구 완료: ${fixedCount}개 파일 ===\n`);
}

// 2. 삼각함수그래프 2,3,4단계 자동 Vision 처리
async function callVisionAPI(base64Image) {
  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert math teacher. Extract the math problem and its solution from the image.
Output STRICTLY a raw JSON object (NO markdown wrappers like \`\`\`json) with the following structure:
{
  "problem_render": {
    "body": "Exact problem text. Use $$ for inline/block math. Apply line breaks logically. Do NOT include solution text.",
    "choices": ["① ...", "② ..."] // Array of choices if multiple choice (try to keep 2 or 3 choices per line logically if formatting, but just return array of strings), or null if short-answer.
  },
  "P": "구하고자 하는 것: $...$",
  "C": "주어진 단서 요약: $...$",
  "B": "배경 개념: $...$",
  "S": "$$ 첫번째 수식 $$\\n\\n$$ 두번째 수식 $$", // Step-by-step solution using ONLY LaTeX math expressions. NO Korean text inside \\text{} in the math blocks! Break down the steps cleanly with \\n\\n and $$ wrappers.
  "A": "최종 정답 (예: 해설 참조 또는 구체적 숫자)"
}`
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract the problem and solution into the JSON format." },
          { type: "image_url", image_url: { url: `data:image/webp;base64,${base64Image}` } }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 1500
  };

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.choices && json.choices.length > 0) {
            let content = json.choices[0].message.content.trim();
            if (content.startsWith('```json')) content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            else if (content.startsWith('```')) content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
            resolve(JSON.parse(content));
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error("Vision parsing error:", e.message, "\nRaw Output:", data.substring(0,200));
          resolve(null);
        }
      });
    });
    req.on('error', e => reject(e));
    req.write(JSON.stringify(payload));
    req.end();
  });
}

const CONCURRENCY = 10;
async function processTrigGraphs() {
  const folders = [
    { src: '2단계/삼각함수그래프2단계', dest: '삼각함수그래프2단계' },
    { src: '3단계/삼각함수그래프3단계', dest: '삼각함수그래프3단계' },
    { src: '4단계/삼각함수그래프', dest: '삼각함수그래프' }
  ];

  let queue = [];
  
  for (const { src, dest } of folders) {
    const srcDir = `C:/mentos_os_clean/public/math_crops/(5)수학1 중간/${src}`;
    const destDir = `C:/mentos_os_clean/public/math_hints/${dest}`;
    
    if (!fs.existsSync(srcDir)) continue;
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.webp'));
    for (const f of files) {
      const pid = f.replace('.webp', '');
      const jsonPath = path.join(destDir, `${pid}.json`);
      // 이미 problem_render와 P,C,B,S 가 온전히 갖춰져 있으면 스킵 (간단히 파일 존재 여부로 체크, 필요시 세부 검사 가능)
      // 단, 사용자가 "에니메이션힌트와 칠판모드로 변경시켜놓아라" 했으므로 기존에 데이터가 빈약하면 덮어씀
      let needsProcess = true;
      if (fs.existsSync(jsonPath)) {
         try {
           const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
           if (existing.problem_render && existing.problem_render.body && existing.S && existing.S.includes('$$')) {
             needsProcess = false;
           }
         } catch(e) {}
      }
      
      if (needsProcess) {
        queue.push({ srcPath: path.join(srcDir, f), jsonPath, imgBase: `/math_crops/(5)수학1 중간/${src}/${f}` });
      }
    }
  }

  console.log(`=== 삼각함수그래프 대상 파일 수: ${queue.length} ===`);
  
  let active = 0;
  let index = 0;

  return new Promise((resolve) => {
    const next = () => {
      if (index >= queue.length && active === 0) {
        console.log("=== 모든 삼각함수그래프 Vision 처리 완료 ===");
        resolve();
        return;
      }
      while (active < CONCURRENCY && index < queue.length) {
        const item = queue[index++];
        active++;
        
        console.log(`[Processing] ${item.imgBase}`);
        const base64 = fs.readFileSync(item.srcPath).toString('base64');
        
        callVisionAPI(base64).then(res => {
          if (res) {
            if (res.problem_render) {
               res.problem_render.source_image = item.imgBase;
            }
            fs.writeFileSync(item.jsonPath, JSON.stringify(res, null, 2), 'utf8');
            console.log(`[Success] Saved ${item.jsonPath}`);
          } else {
            console.log(`[Failed] Vision returned null for ${item.imgBase}`);
          }
        }).catch(err => {
          console.error(`[Error] ${item.imgBase}: ${err.message}`);
        }).finally(() => {
          active--;
          next();
        });
      }
    };
    next();
  });
}

async function runAll() {
  fixMathInduction4();
  await processTrigGraphs();
  console.log("All automated tasks completed successfully.");
}

runAll();
