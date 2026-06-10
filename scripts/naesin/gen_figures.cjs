/**
 * gen_figures.cjs — 그림/표 참조 문제에 MathCanvas 도형 JSON(figure) 생성.
 * 본문에 각·변·좌표가 기술된 문제만 도형화하고, 불확실하면 skip(그대로 텍스트).
 *
 * 사용: node scripts/naesin/gen_figures.cjs <course: naesin|go2> [max]
 * 결과: src/data/<course>_full.json 의 해당 문제에 figure:{objects:[...]} 주입(in-place).
 * 진행: scripts/figures_progress_<course>.json (처리한 id)
 */
const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../../.env'), 'utf8');
const GKEY = (env.match(/VITE_GEMINI_API_KEY=(.*)/) || [])[1]?.trim().replace(/["']/g, '');
const MODEL = process.env.FIG_MODEL || 'gemini-2.5-flash';

const course = process.argv[2] || 'naesin';
const MAX = parseInt(process.argv[3] || '100000', 10);
const dataFile = path.join(__dirname, '../../src/data/', `${course}_full.json`);
const PROG = path.join(__dirname, `figures_progress_${course}.json`);

const FIG_RE = /그림과 같이|그림에서|다음 그림|아래 그림|표와 같이|다음 표|좌표평면|그래프와 같이|삼각형|사각형|원에 내접|호 |부채꼴/;

const SCHEMA = `너는 한국 수학문제 본문을 보고, 본문에 수치로 명시된 도형을 렌더러용 JSON으로 변환한다.
렌더러 객체 타입(이것만 사용):
- {"type":"triangle_angles","angles":{"A":30,"B":60,"C":90},"side":{"name":"BC","value":4}}  // 삼각형: 세 각(합 180) + 한 변. 가장 우선 사용.
- {"type":"point","coordinates":[x,y],"label":"P"}
- {"type":"segment","from":[x,y],"to":[x,y],"label":"6"}
- {"type":"circle","center":[x,y],"radius":r}
- {"type":"polygon","points":[[x,y],[x,y],[x,y]]}
- {"type":"latex_label","at":[x,y],"tex":"A"}
규칙:
1) 본문에 각/변 길이가 명시된 삼각형이면 triangle_angles로 표현(세 각 합=180, 한 각만 주어지면 나머지는 합리적으로 추정하되 명시값 우선).
2) 본문에 도형의 수치 정보가 충분치 않으면(좌표·각·변을 알 수 없으면) 반드시 {"skip":true}만 출력.
3) 표(table)나 그래프 데이터가 본문에 없으면 skip.
4) 좌표는 -8~8 범위로 적당히 배치. 오직 JSON만 출력(코드블록·설명 금지).
출력 형식: {"objects":[...]} 또는 {"skip":true}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function gen(latex) {
  const body = {
    contents: [{ parts: [{ text: `${SCHEMA}\n\n문제 본문:\n${latex}` }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GKEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) { const t = await r.text(); throw new Error(`HTTP ${r.status}: ${t.slice(0, 120)}`); }
  const d = await r.json();
  const txt = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(txt);
}

const KNOWN = new Set(['triangle_angles','point','segment','line','circle','triangle','polygon','latex_label','label_text','text','drawCircle','drawSegment','drawInscribedQuadrilateral','markLength','markAngle','perpendicular']);
function valid(fig) {
  if (!fig || fig.skip) return false;
  if (!Array.isArray(fig.objects) || fig.objects.length === 0) return false;
  return fig.objects.every(o => o && typeof o.type === 'string' && KNOWN.has(o.type));
}

(async () => {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  let prog = {};
  try { prog = JSON.parse(fs.readFileSync(PROG, 'utf8')); } catch {}

  const targets = [];
  for (const lv of Object.keys(data.levels))
    for (const u of Object.keys(data.levels[lv]))
      for (const p of data.levels[lv][u])
        if (FIG_RE.test(String(p.latex || '')) && !prog[p.id]) targets.push(p);

  console.log(`[${course}] 그림 후보 ${targets.length}개 (이번 실행 최대 ${MAX})`);
  let made = 0, skipped = 0, failed = 0;
  for (const p of targets) {
    if (made + skipped >= MAX) break;
    try {
      const fig = await gen(String(p.latex).slice(0, 2000));
      if (valid(fig)) {
        p.figure = { objects: fig.objects, ...(fig.viewBox ? { viewBox: fig.viewBox } : {}) };
        prog[p.id] = true; made++;
        console.log(`  ✅ ${p.id}: ${fig.objects.map(o => o.type).join('+')}`);
      } else {
        prog[p.id] = 'skip'; skipped++;
        console.log(`  ⤳ ${p.id}: skip`);
      }
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 0));
      fs.writeFileSync(PROG, JSON.stringify(prog));
      await sleep(1500);
    } catch (e) {
      failed++;
      console.warn(`  ⚠️ ${p.id}: ${e.message}`);
      if (/429|quota|RESOURCE/i.test(e.message)) { console.log('  ⛔ 한도/오류 — 중단'); break; }
      await sleep(3000);
    }
  }
  console.log(`\n[${course}] 생성 ${made} / skip ${skipped} / 실패 ${failed}`);
})();
