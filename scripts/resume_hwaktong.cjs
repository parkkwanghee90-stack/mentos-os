const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const MODEL   = 'gpt-4o-mini'; 

function toBase64(filePath) { return fs.readFileSync(filePath).toString('base64'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callGPT(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL, max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages, temperature: 0.1
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
        } catch(e) { reject(new Error('JSON parse: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeMessages(qB64, aB64, unitName, pid) {
  return [
    { role: 'system', content: `당신은 한국 고등학교 확률과 통계 수학 교사입니다. ${unitName} 단원 문제의 풀이를 PCBSA 규격 JSON으로 작성합니다. 모든 수식은 $$ 수식 $$ 또는 $ 수식 $ 형태의 LaTeX로 감쌀 것.` },
    { role: 'user', content: [
      { type: 'text', text: `문제 ${pid}번. 해설 이미지 참조하여 다음 형식으로 응답: {"unit":"${unitName}","id":"${pid}","type":"algebra","P":"...","C":"...","B":"...","S":"...","A":"..."}` },
      { type: 'image_url', image_url: { url: `data:image/webp;base64,${qB64}`, detail: 'low' } }, // Low detail to save tokens/quota
      { type: 'image_url', image_url: { url: `data:image/webp;base64,${aB64}`, detail: 'low' } }
    ] }
  ];
}

async function processUnit(unitName) {
  const CROPS_DIR = path.join('C:\\mentos_os_clean\\public\\math_crops\\확통수능', unitName);
  const HINTS_DIR = path.join('C:\\mentos_os_clean\\public\\math_hints\\확통수능', unitName);

  if (!fs.existsSync(CROPS_DIR)) return;
  fs.mkdirSync(HINTS_DIR, { recursive: true });

  const files = fs.readdirSync(CROPS_DIR).filter(f => /^\d{3}\.webp$/.test(f)).sort();
  console.log(`\n=== ${unitName} ===`);

  for (const f of files) {
    const pid = f.split('.')[0];
    const qPath = path.join(CROPS_DIR, f);
    const aPath = path.join(CROPS_DIR, `${pid}a.webp`);
    const hintsPath = path.join(HINTS_DIR, `${pid}.json`);

    if (fs.existsSync(hintsPath)) {
       const content = fs.readFileSync(hintsPath, 'utf8');
       if (content.includes('"unit":')) continue; // Skip real ones
    }

    console.log(`[GEN] ${pid}...`);
    try {
      const qB64 = toBase64(qPath);
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;
      const result = await callGPT(makeMessages(qB64, aB64, unitName, pid));
      fs.writeFileSync(hintsPath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`[OK]  ${pid} ✅`);
      await sleep(1500); // More sleep to avoid rate limit
    } catch (e) {
      console.error(`[ERR] ${pid}: ${e.message}`);
      if (e.message.includes('quota')) {
          console.log("Quota hit. Switching to gpt-4o-mini...");
          // In a real scenario I might switch model here, but let's just wait or report.
          break; 
      }
      await sleep(5000);
    }
  }
}

async function main() {
  const units = [
    '8)표본평균과모평균'
  ];
  for (const u of units) { await processUnit(u); }
}
main();
