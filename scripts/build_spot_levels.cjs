#!/usr/bin/env node
// 틀린그림찾기 레벨 자동 생성기.
// 사용법: node scripts/build_spot_levels.cjs "<원본폴더>"
//   원본폴더에 쌍으로:  이름_a.png  이름_b.png  (jpg도 가능, 같은 크기 권장)
// 동작: A·B 픽셀 비교 → 다른 영역 자동 검출 → public/spot_levels/ 로 복사 + manifest.json 갱신.
//   (좌표를 손으로 안 적어도 됨. 검출 결과는 사람이 한번 확인 권장)
const fs = require('fs');
const path = require('path');
let Jimp;
try { Jimp = require('jimp'); } catch { console.error('먼저: npm i -D jimp'); process.exit(1); }

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) { console.error('원본 폴더 경로를 주세요. 예) node scripts/build_spot_levels.cjs "/Volumes/수학의 빛 사무폴더/멘토스기출/틀린그림찾기"'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'public', 'spot_levels');
fs.mkdirSync(OUT, { recursive: true });

const THRESH = 60;     // 색차 임계(클수록 큰 차이만)
const MIN_AREA = 18;   // 잡음 제거(작은 영역 무시, 작업폭 기준)
const WORK_W = 240;    // 분석 작업 폭(속도)
const MAX_DIFFS = 8;

function pairs(dir) {
  const files = fs.readdirSync(dir).filter((f) => /_(a|b)\.(png|jpe?g|webp)$/i.test(f));
  const map = {};
  for (const f of files) {
    const m = f.match(/^(.*)_(a|b)\.(png|jpe?g|webp)$/i);
    if (!m) continue;
    (map[m[1]] ||= {})[m[2].toLowerCase()] = f;
  }
  return Object.entries(map).filter(([, v]) => v.a && v.b);
}

async function detect(aPath, bPath) {
  const a = await Jimp.read(aPath); const b = await Jimp.read(bPath);
  if (b.bitmap.width !== a.bitmap.width || b.bitmap.height !== a.bitmap.height) b.resize(a.bitmap.width, a.bitmap.height);
  const scale = WORK_W / a.bitmap.width;
  const w = WORK_W, h = Math.round(a.bitmap.height * scale);
  const as = a.clone().resize(w, h); const bs = b.clone().resize(w, h);
  const changed = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const da = Math.abs(as.bitmap.data[i] - bs.bitmap.data[i]) + Math.abs(as.bitmap.data[i + 1] - bs.bitmap.data[i + 1]) + Math.abs(as.bitmap.data[i + 2] - bs.bitmap.data[i + 2]);
    if (da > THRESH) changed[y * w + x] = 1;
  }
  // 연결요소 라벨링(BFS, 8방향)
  const seen = new Uint8Array(w * h); const regions = [];
  for (let p = 0; p < w * h; p++) {
    if (!changed[p] || seen[p]) continue;
    const q = [p]; seen[p] = 1; let minx = w, miny = h, maxx = 0, maxy = 0, sx = 0, sy = 0, n = 0;
    while (q.length) {
      const cur = q.pop(); const cx = cur % w, cy = (cur / w) | 0;
      sx += cx; sy += cy; n++; minx = Math.min(minx, cx); maxx = Math.max(maxx, cx); miny = Math.min(miny, cy); maxy = Math.max(maxy, cy);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const np = ny * w + nx; if (changed[np] && !seen[np]) { seen[np] = 1; q.push(np); }
      }
    }
    if (n >= MIN_AREA) regions.push({ n, cx: sx / n, cy: sy / n, rad: Math.max(maxx - minx, maxy - miny) / 2 + 4 });
  }
  regions.sort((p, q) => q.n - p.n);
  return regions.slice(0, MAX_DIFFS).map((r) => ({ x: +(r.cx / w).toFixed(3), y: +(r.cy / h).toFixed(3), r: +Math.max(0.05, r.rad / w).toFixed(3) }));
}

(async () => {
  const list = pairs(SRC); const manifest = [];
  for (const [name, v] of list) {
    const aSrc = path.join(SRC, v.a), bSrc = path.join(SRC, v.b);
    const extA = path.extname(v.a), extB = path.extname(v.b);
    fs.copyFileSync(aSrc, path.join(OUT, `${name}_a${extA}`));
    fs.copyFileSync(bSrc, path.join(OUT, `${name}_b${extB}`));
    const diffs = await detect(aSrc, bSrc);
    manifest.push({ title: name, a: `/spot_levels/${name}_a${extA}`, b: `/spot_levels/${name}_b${extB}`, diffs });
    console.log(`✓ ${name}: 차이 ${diffs.length}곳 검출`);
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest.json 갱신 완료 (${manifest.length} 레벨). 검출 좌표는 한번 확인하세요.`);
})();
