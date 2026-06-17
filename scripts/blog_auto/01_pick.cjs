/** 블로그 자동화 선택기: 이미 게시(posted)·생성완료(generated) 제외하고 미게시 학교 큐 반환. */
const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const prog = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog_progress.json'), 'utf8'));
const done = new Set([...prog.posted, ...prog.generated].map(p => `${p.grade}:${p.slug}`));
const BUND = { go1: 'src/data/exam_predict/exam_predict_bundle.json', go2: 'src/data/exam_predict_go2/exam_predict_bundle.json' };
const queue = [];
for (const [grade, rel] of Object.entries(BUND)) {
  const schools = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')).schools || [];
  for (const s of schools) if (!done.has(`${grade}:${s.slug}`)) queue.push({ grade, slug: s.slug, region: s.region || '' });
}
if (require.main === module) {
  const n = parseInt(process.argv[2] || '0', 10);
  console.log(`미게시 신규 큐: 총 ${queue.length}교 (go1 ${queue.filter(q=>q.grade==='go1').length} / go2 ${queue.filter(q=>q.grade==='go2').length})`);
  (n ? queue.slice(0, n) : queue.slice(0, 8)).forEach((q,i)=>console.log(`  ${i+1}. [${q.grade}] ${q.slug} ${q.region}`));
}
module.exports = { queue };
