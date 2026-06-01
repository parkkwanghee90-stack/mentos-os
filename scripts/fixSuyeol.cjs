const fs = require('fs');
const path = require('path');
const AVS = 'c:\\mentos_os_clean\\src\\data\\avs_answers.json';
const CIRCLE = {'①':'1','②':'2','③':'3','④':'4','⑤':'5'};

function extract(hp) {
  if (!fs.existsSync(hp)) return [];
  const h = fs.readFileSync(hp, 'utf-8');
  const r = /class="unit-answer">\s*<span>정답<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  const a = [];
  let m;
  while ((m = r.exec(h)) !== null) {
    let c = m[1];
    const ci = c.match(/<big>([①②③④⑤])<\/big>/);
    if (ci) { a.push(CIRCLE[ci[1]]); continue; }
    if (c.includes('mfrac')) {
      const f = c.match(/class="mord">(\d+)<\/span>[\s\S]*?class="mord">(\d+)<\/span>/);
      if (f) { a.push(f[1]+'/'+f[2]); continue; }
    }
    const neg = c.includes('−');
    const ms = c.match(/class="mord">([\d.]+)<\/span>/g);
    if (ms && ms.length > 0) {
      const ns = ms.map(s => s.match(/>([\d.]+)</)[1]);
      let v = ns.join('');
      if (neg) v = '-' + v;
      a.push(v); continue;
    }
    const t = c.replace(/<[^>]+>/g, '').trim();
    a.push(CIRCLE[t] || t);
  }
  return a;
}

const avs = JSON.parse(fs.readFileSync(AVS, 'utf-8'));
const key = '수학1_09수열의합_통합숙제';
const existing = avs[key] || {};
const prevCount = Object.keys(existing).length;

// 3.4단계 정답 추출 (문제 43~69)
const ans34 = extract('c:\\mentos_os_clean\\public\\math_crops\\숙제\\대수 수학1\\11수열의합3.4단계\\정답및해설.html');
console.log('3.4단계 정답 추출:', ans34.length);

for (let i = 0; i < 27; i++) {
  const pid = String(43 + i).padStart(3, '0');
  if (i < ans34.length && ans34[i]) existing[pid] = ans34[i];
}

avs[key] = existing;
fs.writeFileSync(AVS, JSON.stringify(avs, null, 2), 'utf-8');
console.log(`수열의합 정답: ${prevCount} → ${Object.keys(existing).length}/69`);
