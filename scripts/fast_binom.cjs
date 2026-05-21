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
      model: MODEL, max_tokens: 800, // Minimal tokens
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
        } catch(e) { reject(new Error('JSON parse error: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeMessages(qB64, aB64, unitName, pid) {
  return [
    { role: 'system', content: `Math teacher. Unit: ${unitName}. PCBSA JSON.` },
    { role: 'user', content: [
      { type: 'text', text: `Problem ${pid}. Use LaTeX $$...$$ for math.` },
      { type: 'image_url', image_url: { url: `data:image/webp;base64,${qB64}`, detail: 'low' } },
      { type: 'image_url', image_url: { url: `data:image/webp;base64,${aB64}`, detail: 'low' } }
    ] }
  ];
}

async function processUnit(unitName) {
  const CROPS_DIR = path.join('C:\\mentos_os_clean\\public\\math_crops\\확통수능', unitName);
  const HINTS_DIR = path.join('C:\\mentos_os_clean\\public\\math_hints\\확통수능', unitName);
  if (!fs.existsSync(CROPS_DIR)) return;
  
  const files = fs.readdirSync(CROPS_DIR).filter(f => /^\d{3}\.webp$/.test(f)).sort();
  console.log(`Processing ${unitName}...`);

  for (const f of files) {
    const pid = f.split('.')[0];
    const hintsPath = path.join(HINTS_DIR, `${pid}.json`);

    if (fs.existsSync(hintsPath)) {
       const content = fs.readFileSync(hintsPath, 'utf8');
       if (content.includes('"unit":')) continue;
    }

    console.log(`[GEN] ${pid}...`);
    try {
      const qB64 = toBase64(path.join(CROPS_DIR, f));
      const aPath = path.join(CROPS_DIR, `${pid}a.webp`);
      const aB64 = fs.existsSync(aPath) ? toBase64(aPath) : qB64;
      
      const result = await callGPT(makeMessages(qB64, aB64, unitName, pid));
      fs.writeFileSync(hintsPath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`[OK] ${pid} ✅`);
      await sleep(2000); 
    } catch (e) {
      console.error(`[FAIL] ${pid}: ${e.message}`);
      if (e.message.includes('quota')) process.exit(1);
      await sleep(5000);
    }
  }
}

processUnit('3)이항정리');
