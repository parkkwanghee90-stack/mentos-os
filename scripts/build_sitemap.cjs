/**
 * SEO: 학교별 예상문제 페이지 sitemap.xml + robots.txt 생성.
 * 검색엔진이 "○○고 기말 수학 예상문제" 로 학교별 페이지를 발견하도록.
 * 실행: node scripts/build_sitemap.cjs  (배포 빌드 전에 호출)
 */
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://www.mathmentos.com';
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function loadSchools(rel) {
  try {
    const b = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    return b.schools || [];
  } catch { return []; }
}

const urls = [];
const today = new Date().toISOString().slice(0, 10);
const push = (loc, priority) => urls.push({ loc, priority });

// 주요 공개 라우트
push(`${ORIGIN}/`, '1.0');
push(`${ORIGIN}/class/exam-predict`, '0.9');

// 학교별 페이지(go1=공통수학1, go2=수학Ⅰ)
for (const [grade, rel] of [['go1', 'src/data/exam_predict/exam_predict_bundle.json'], ['go2', 'src/data/exam_predict_go2/exam_predict_bundle.json']]) {
  for (const s of loadSchools(rel)) {
    push(`${ORIGIN}/class/exam-predict/${grade}/${encodeURIComponent(s.slug)}`, '0.8');
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), xml);

const robots = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
fs.writeFileSync(path.join(PUBLIC, 'robots.txt'), robots);

console.log(`sitemap.xml: ${urls.length} URL (학교별 ${urls.length - 2}교) + robots.txt → public/`);
