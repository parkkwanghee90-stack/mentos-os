/** 난이도 상향 선택기: done∪needs_review∪needs_source∪게시 제외, 강남/분당 우선, go1→go2, 다음 N개. */
const fs = require('node:fs');
const path = require('node:path');
const T = require('./lib/tracker.cjs');

const ROOT = path.join(__dirname, '..', '..');
const POSTED = path.join(__dirname, 'posted.json');
const BUNDLES = {
  go1: 'src/data/exam_predict/exam_predict_bundle.json',
  go2: 'src/data/exam_predict_go2/exam_predict_bundle.json',
};
const RAWPNG = {
  go1: 'src/data/exam_predict/raw_png',
  go2: 'src/data/exam_predict_go2/raw_png',
};
const PRI = ['강남', '서초', '송파', '분당', '성남'];

function rawPngDir(grade, slug) { return path.join(ROOT, RAWPNG[grade], slug); }

function pick(n = 5, opts = {}) {
  const t = opts.tracker || T.load();
  const posted = JSON.parse(fs.readFileSync(opts.postedFile || POSTED, 'utf8'));
  const excluded = new Set();
  for (const l of ['done', 'needs_review', 'needs_source']) for (const e of (t[l] || [])) excluded.add(T.key(e.grade, e.slug));
  for (const e of posted) excluded.add(T.key(e.grade, e.slug));

  const out = [];
  for (const grade of ['go1', 'go2']) {          // go1 먼저
    const schools = JSON.parse(fs.readFileSync(path.join(ROOT, BUNDLES[grade]), 'utf8')).schools || [];
    const cand = schools
      .filter(s => !excluded.has(T.key(grade, s.slug)))
      .map(s => ({ grade, slug: s.slug, region: s.region || '' }))
      .sort((a, b) => {
        const pa = PRI.findIndex(k => a.region.includes(k));
        const pb = PRI.findIndex(k => b.region.includes(k));
        const sa = pa < 0 ? 99 : pa, sb = pb < 0 ? 99 : pb;
        return sa - sb || a.region.localeCompare(b.region, 'ko') || a.slug.localeCompare(b.slug, 'ko');
      });
    out.push(...cand);
  }
  return out.slice(0, n);
}

if (require.main === module) {
  const n = parseInt(process.argv[2] || '5', 10);
  const picked = pick(n);
  if (!picked.length) { console.log('QUEUE_EMPTY'); process.exit(0); }
  for (const p of picked) {
    console.log(`${p.grade}\t${p.slug}\t${p.region}\traw_png=${fs.existsSync(rawPngDir(p.grade, p.slug)) ? 'O' : 'X'}`);
  }
}

module.exports = { pick, rawPngDir };
