import fs from 'fs';
import path from 'path';
import { detectIssues } from '../src/lib/algebraFix/latexDetect.js';
import { auditMapping } from '../src/lib/algebraFix/mappingAudit.js';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';
import { adaptAnswersMaster } from '../src/lib/algebraFix/answersMasterAdapter.js';

const ROOT = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// ---- 데이터 로드 (read-only) ----
const mathTexts = readJson('public/data/math_problem_texts.json');
const avs = readJson('public/data/avs_answers.json');
const answersMaster = readJson('public/data/answers_master.json');
const answersMasterMap = adaptAnswersMaster(answersMaster);
const problemsIndex = readJson('public/problems_index.json');

const ccDir = path.join(ROOT, 'public/concept_cards');
const diskFolders = fs.existsSync(ccDir) ? fs.readdirSync(ccDir) : [];

// ---- 보고서 출력 경로 ----
const REPORT_DIR = path.join(ROOT, 'docs/superpowers/specs');
fs.mkdirSync(REPORT_DIR, { recursive: true });
const MAPPING_REPORT = path.join(REPORT_DIR, '2026-06-02-mapping-audit.md');
const LATEX_REPORT = path.join(REPORT_DIR, '2026-06-02-latex-audit.md');

// ---- 매핑 audit ----
const mappingIssues = auditMapping({ problemsIndex, avsAnswers: avs, answersMaster: answersMasterMap, diskFolders });

// ---- LaTeX audit: A(문제 본문 math_problem_texts) ----
const latexA = [];
for (const [k, v] of Object.entries(mathTexts)) {
  const unit = k.split('/')[0];
  if (!isAlgebraKey(unit)) continue;
  const issues = detectIssues(typeof v === 'string' ? v : JSON.stringify(v));
  if (issues.length) latexA.push({ key: k, issues });
}

// ---- LaTeX audit: B(AVS 해설 avs_answers 문자열) ----
const latexB = [];
for (const [unit, obj] of Object.entries(avs)) {
  if (!isAlgebraKey(unit) || !obj || typeof obj !== 'object') continue;
  for (const [num, val] of Object.entries(obj)) {
    if (typeof val !== 'string') continue;
    const issues = detectIssues(val);
    if (issues.length) latexB.push({ key: `${unit}/${num}`, value: val, issues });
  }
}

// ---- 매핑 보고서 생성 ----
function buildMappingReport(issues) {
  // 유형별 분류
  const HIGH_SIGNAL_TYPES = ['KEY_PRESENCE', 'EMPTY_SHELL', 'ROOT_VARIANT'];
  const LOW_SIGNAL_TYPES = ['SIZE_MISMATCH'];

  const byType = {};
  for (const issue of issues) {
    (byType[issue.type] ||= []).push(issue);
  }

  const counts = {
    KEY_PRESENCE: (byType['KEY_PRESENCE'] || []).length,
    EMPTY_SHELL: (byType['EMPTY_SHELL'] || []).length,
    ROOT_VARIANT: (byType['ROOT_VARIANT'] || []).length,
    SIZE_MISMATCH: (byType['SIZE_MISMATCH'] || []).length,
  };

  const lines = [];
  lines.push('# 매핑 Audit 리포트');
  lines.push('');
  lines.push(`생성일: 2026-06-02`);
  lines.push('');
  lines.push('## 유형별 건수 요약');
  lines.push('');
  lines.push('| 유형 | 건수 | 신호 강도 |');
  lines.push('|------|------|-----------|');
  lines.push(`| KEY_PRESENCE | ${counts.KEY_PRESENCE} | 고신호 |`);
  lines.push(`| EMPTY_SHELL | ${counts.EMPTY_SHELL} | 고신호 |`);
  lines.push(`| ROOT_VARIANT | ${counts.ROOT_VARIANT} | 고신호 |`);
  lines.push(`| SIZE_MISMATCH | ${counts.SIZE_MISMATCH} | 저신호(노이즈 가능) |`);
  lines.push(`| **합계** | **${issues.length}** | |`);
  lines.push('');

  // 고신호 섹션
  for (const type of HIGH_SIGNAL_TYPES) {
    const group = byType[type] || [];
    lines.push(`## ${type} (${group.length}건)`);
    lines.push('');
    if (group.length === 0) {
      lines.push('_이슈 없음_');
      lines.push('');
      continue;
    }
    for (const issue of group) {
      if (type === 'KEY_PRESENCE') {
        lines.push(`- **\`${issue.key}\`**`);
        lines.push(`  - 존재: ${issue.presentIn.join(', ')}`);
        lines.push(`  - 누락: ${issue.missingFrom.join(', ')}`);
      } else if (type === 'EMPTY_SHELL') {
        lines.push(`- **\`${issue.key}\`** — source: \`${issue.source}\``);
      } else if (type === 'ROOT_VARIANT') {
        lines.push(`- stage \`${issue.stage}\`: ${issue.keys.join(', ')}`);
      }
    }
    lines.push('');
  }

  // 저신호 섹션 (SIZE_MISMATCH)
  lines.push('---');
  lines.push('');
  lines.push('## 참고(노이즈 가능) — SIZE_MISMATCH');
  lines.push('');
  lines.push('> SIZE_MISMATCH는 problemsIndex(전체 문제) vs answersMaster(답이 있는 문제만) 개수 차이로 많이 발생합니다.');
  lines.push('> 실제 오류라기보다 데이터 성격 차이일 수 있으므로 낮은 우선순위로 검토하세요.');
  lines.push('');
  const smGroup = byType['SIZE_MISMATCH'] || [];
  if (smGroup.length === 0) {
    lines.push('_이슈 없음_');
    lines.push('');
  } else {
    lines.push('| 키 | sizes |');
    lines.push('|----|-------|');
    for (const issue of smGroup) {
      const sizesStr = Object.entries(issue.sizes).map(([k, v]) => `${k}=${v}`).join(', ');
      lines.push(`| \`${issue.key}\` | ${sizesStr} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---- LaTeX 보고서 생성 ----
function countsByCodeAndGrade(items) {
  // items: [{key, issues}] or [{key, value, issues}]
  const counts = {};
  for (const item of items) {
    for (const issue of item.issues) {
      const label = issue.grade === 'REVIEW' ? `${issue.code}(REVIEW)` : issue.code;
      counts[label] = (counts[label] || 0) + 1;
    }
  }
  return counts;
}

function buildLatexReport(latexA, latexB) {
  const lines = [];
  lines.push('# LaTeX Audit 리포트');
  lines.push('');
  lines.push(`생성일: 2026-06-02`);
  lines.push('');
  lines.push('## 패턴 코드 설명');
  lines.push('');
  lines.push('| 코드 | 의미 | 등급 |');
  lines.push('|------|------|------|');
  lines.push('| P1 | 줄 단위 $ 개수 홀수(짝 불균형) | AUTO — 자동 수정 후보 |');
  lines.push('| P3 | $ 밖 plaintext 수식 토큰(frac/sqrt/pi/^/_) | REVIEW — 수동 판단 필요 |');
  lines.push('| P5 | $…$ 내부 KaTeX 파싱 실패 | REVIEW — 의미 추론 필요 |');
  lines.push('');

  // ---- 섹션 A ----
  const countsA = countsByCodeAndGrade(latexA);
  const countsASummary = Object.entries(countsA).map(([k, v]) => `${k}: ${v}`).join(', ');

  lines.push('---');
  lines.push('');
  lines.push(`## 섹션 A — 문제 본문 (math_problem_texts) | 이슈 항목 수: ${latexA.length}`);
  lines.push('');
  lines.push(`**패턴별 건수:** ${countsASummary || '없음'}`);
  lines.push('');

  if (latexA.length === 0) {
    lines.push('_이슈 없음_');
    lines.push('');
  } else {
    for (const item of latexA) {
      lines.push(`### \`${item.key}\``);
      for (const issue of item.issues) {
        if (issue.code === 'P1') {
          const snippet = (issue.snippet || '').slice(0, 120).replace(/\n/g, '↵');
          lines.push(`- **P1(AUTO)** line ${issue.line}: \`${snippet}\``);
        } else if (issue.code === 'P3') {
          const snippet = (issue.snippet || '').slice(0, 120).replace(/\n/g, '↵');
          lines.push(`- **P3(REVIEW)**: \`${snippet}\``);
        } else if (issue.code === 'P5') {
          const latex = (issue.latex || '').slice(0, 80);
          lines.push(`- **P5(REVIEW)**: \`${latex}\` — ${issue.error}`);
        }
      }
      lines.push('');
    }
  }

  // ---- 섹션 B ----
  const countsB = countsByCodeAndGrade(latexB);
  const countsBSummary = Object.entries(countsB).map(([k, v]) => `${k}: ${v}`).join(', ');

  lines.push('---');
  lines.push('');
  lines.push(`## 섹션 B — AVS 해설 (avs_answers) | 이슈 항목 수: ${latexB.length}`);
  lines.push('');
  lines.push(`**패턴별 건수:** ${countsBSummary || '없음'}`);
  lines.push('');
  lines.push('> value 열: 원본 값 앞 80자 (REVIEW 항목 판단용)');
  lines.push('');

  if (latexB.length === 0) {
    lines.push('_이슈 없음_');
    lines.push('');
  } else {
    for (const item of latexB) {
      const valueTrunc = (item.value || '').slice(0, 80).replace(/\n/g, '↵');
      lines.push(`### \`${item.key}\``);
      lines.push(`> value: \`${valueTrunc}\``);
      lines.push('');
      for (const issue of item.issues) {
        if (issue.code === 'P1') {
          const snippet = (issue.snippet || '').slice(0, 120).replace(/\n/g, '↵');
          lines.push(`- **P1(AUTO)** line ${issue.line}: \`${snippet}\``);
        } else if (issue.code === 'P3') {
          const snippet = (issue.snippet || '').slice(0, 120).replace(/\n/g, '↵');
          lines.push(`- **P3(REVIEW)**: \`${snippet}\``);
        } else if (issue.code === 'P5') {
          const latex = (issue.latex || '').slice(0, 80);
          lines.push(`- **P5(REVIEW)**: \`${latex}\` — ${issue.error}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ---- 리포트 파일 쓰기 (데이터 JSON은 절대 쓰지 않음) ----
fs.writeFileSync(MAPPING_REPORT, buildMappingReport(mappingIssues), 'utf8');
fs.writeFileSync(LATEX_REPORT, buildLatexReport(latexA, latexB), 'utf8');

// ---- 매핑 유형별 카운트 ----
const typeCounts = { KEY_PRESENCE: 0, EMPTY_SHELL: 0, ROOT_VARIANT: 0, SIZE_MISMATCH: 0 };
for (const issue of mappingIssues) {
  if (issue.type in typeCounts) typeCounts[issue.type]++;
}

console.log(
  `[audit] mapping: KEY_PRESENCE=${typeCounts.KEY_PRESENCE}, EMPTY_SHELL=${typeCounts.EMPTY_SHELL}, ROOT_VARIANT=${typeCounts.ROOT_VARIANT}, SIZE_MISMATCH=${typeCounts.SIZE_MISMATCH} | latexA=${latexA.length} items | latexB=${latexB.length} items`
);
console.log(`[audit] reports written:`);
console.log(`  ${MAPPING_REPORT}`);
console.log(`  ${LATEX_REPORT}`);
