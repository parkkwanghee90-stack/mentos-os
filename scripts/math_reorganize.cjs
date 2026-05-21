const fs = require('fs');
const path = require('path');

const CROP_BASE = 'C:/mentos_os_clean/public/math_crops/매쓰플랫_ultimate';
const NEW_BASE  = 'C:/mentos_os_clean/public/math_db';

// ─────────────────────────────────────────────
// Curriculum classification map
// Key = keyword regex, Value = { grade, unit, level }
// Level: 기본(4~5등급) 실력(3등급) 심화(1~2등급)
// ─────────────────────────────────────────────
const RULES = [
  // ── 고1 : 집합과 명제 ──────────────────────
  { match: /^(1단계).*(집합|명제)/,          grade:'고1', unit:'집합과 명제', level:'기본' },
  { match: /^(2단계).*(집합|명제)/,          grade:'고1', unit:'집합과 명제', level:'기본' },
  { match: /^(3단계).*(집합|명제)/,          grade:'고1', unit:'집합과 명제', level:'실력' },
  { match: /^(4단계).*(집합|명제)/,          grade:'고1', unit:'집합과 명제', level:'심화' },
  { match: /^집합$/,                         grade:'고1', unit:'집합과 명제', level:'기본' },
  { match: /^명제$/,                         grade:'고1', unit:'집합과 명제', level:'기본' },

  // ── 고1 : 함수 ──────────────────────────────
  { match: /^(2단계).*(함수|유리함수|무리함수)/, grade:'고1', unit:'함수', level:'기본' },
  { match: /^(3단계).*(함수|유리함수|무리함수)/, grade:'고1', unit:'함수', level:'실력' },
  { match: /^(4단계).*(함수|유리함수|무리함수)/, grade:'고1', unit:'함수', level:'심화' },
  { match: /^함수$/,                            grade:'고1', unit:'함수', level:'기본' },

  // ── 고1 : 경우의 수 ─────────────────────────
  { match: /^(2단계).*(순열과조합|순열|조합)/,  grade:'고1', unit:'경우의 수와 확률', level:'기본' },
  { match: /^(3단계).*(순열과조합|순열|조합)/,  grade:'고1', unit:'경우의 수와 확률', level:'실력' },
  { match: /^(4단계).*(순열과조합|순열|조합)/,  grade:'고1', unit:'경우의 수와 확률', level:'심화' },

  // ── 고1 : 방정식과 부등식 (일차/이차부등식) ──
  { match: /\(1\)일차부등식.*2단계/,           grade:'고1', unit:'방정식과 부등식', level:'기본' },
  { match: /\(2\)이차부등식.*2단계/,           grade:'고1', unit:'방정식과 부등식', level:'기본' },
  { match: /일차부등식/,                       grade:'고1', unit:'방정식과 부등식', level:'기본' },
  { match: /이차부등식/,                       grade:'고1', unit:'방정식과 부등식', level:'기본' },

  // ── 고1 : 도형 (좌표/직선/원/도형이동) ───────
  { match: /귀납적정의/,                       grade:'고2', unit:'수열', level:'실력' },
  { match: /\(3\)점과좌표.*2단계/,             grade:'고1', unit:'도형의 이동', level:'기본' },
  { match: /\(4\)직선의방정식.*2단계/,         grade:'고1', unit:'도형의 이동', level:'기본' },
  { match: /\(5\)원의방정식.*2단계/,           grade:'고1', unit:'도형의 이동', level:'기본' },
  { match: /\(6\)도형의이동.*2단계/,           grade:'고1', unit:'도형의 이동', level:'기본' },
  { match: /^도형의이동$/,                     grade:'고1', unit:'도형의 이동', level:'기본' },

  // ── 고1 : 기말/중간고사 ──────────────────────
  { match: /고등수학\(상\)중간/,               grade:'고1', unit:'모의고사', level:'실력' },
  { match: /고등수학\(상\)기말/,               grade:'고1', unit:'모의고사', level:'실력' },

  // ── 고2 : 지수/로그 ─────────────────────────
  { match: /^(지수|로그)(2단계|3단계)/,         grade:'고2', unit:'지수함수와 로그함수', level:'기본' },
  { match: /^(지수함수|로그함수)(2단계|3단계)/, grade:'고2', unit:'지수함수와 로그함수', level:'기본' },
  { match: /^(등차등비)(2단계|3단계)/,          grade:'고2', unit:'수열', level:'기본' },
  { match: /^(시그마용법)(2단계)/,              grade:'고2', unit:'수열', level:'기본' },

  // ── 고2 : 삼각함수 ──────────────────────────
  { match: /삼각함수/,                         grade:'고2', unit:'삼각함수', level:'기본' },
];

function classify(folderName) {
  for (const rule of RULES) {
    if (rule.match.test(folderName)) {
      return { grade: rule.grade, unit: rule.unit, level: rule.level };
    }
  }
  return null; // unclassified
}

// ─────────────────────────────────────────────
// Get all completed folders
// ─────────────────────────────────────────────
const allDirs = fs.readdirSync(CROP_BASE, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(n => {
    const m = path.join(CROP_BASE, n, 'metadata.json');
    if (!fs.existsSync(m)) return false;
    const j = JSON.parse(fs.readFileSync(m, 'utf8'));
    return j.items && j.items.length > 0;
  });

console.log(`\n분류 대상 완료 폴더: ${allDirs.length}개\n`);

// ─────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────
const stats = {};
const unclassified = [];

for (const folderName of allDirs) {
  const result = classify(folderName);
  if (!result) {
    unclassified.push(folderName);
    // Move to 미분류
    const src = path.join(CROP_BASE, folderName);
    const dest = path.join(NEW_BASE, '미분류', folderName);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
    console.log(`[미분류] ${folderName}`);
    continue;
  }

  const { grade, unit, level } = result;
  const destDir = path.join(NEW_BASE, grade, unit, level, folderName);
  fs.mkdirSync(path.dirname(destDir), { recursive: true });

  const src = path.join(CROP_BASE, folderName);
  fs.renameSync(src, destDir);

  // Stats
  if (!stats[grade]) stats[grade] = {};
  if (!stats[grade][unit]) stats[grade][unit] = { 기본: 0, 실력: 0, 심화: 0 };
  stats[grade][unit][level]++;

  console.log(`[OK] ${grade} > ${unit} > ${level} | ${folderName}`);
}

// ─────────────────────────────────────────────
// Summary report
// ─────────────────────────────────────────────
console.log('\n\n════════════════════════════════════════');
console.log('         재배치 완료 리포트');
console.log('════════════════════════════════════════');

let grandTotal = 0;
for (const [grade, units] of Object.entries(stats)) {
  let gradeTotal = 0;
  console.log(`\n▶ ${grade}`);
  for (const [unit, levels] of Object.entries(units)) {
    const t = levels.기본 + levels.실력 + levels.심화;
    gradeTotal += t;
    console.log(`   ${unit}: 기본${levels.기본} 실력${levels.실력} 심화${levels.심화} (합계 ${t})`);
  }
  console.log(`   ─ ${grade} 합계: ${gradeTotal}개`);
  grandTotal += gradeTotal;
}

console.log(`\n▶ 미분류: ${unclassified.length}개`);
if (unclassified.length) unclassified.forEach(n => console.log(`   - ${n}`));
console.log(`\n▶ 전체 처리: ${grandTotal + unclassified.length}개`);
console.log('════════════════════════════════════════\n');
