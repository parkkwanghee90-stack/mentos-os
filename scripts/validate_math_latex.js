import fs from 'fs';
import path from 'path';

console.warn = () => {}; // Mute KaTeX strict warnings
import katex from 'katex';

const TARGET_DIRS = [
  'public/math_hints',
  'public/math_indexed',
  'src/data/math_problem_texts_json'
];
const LOG_DIR = 'logs';
const BACKUP_DIR = 'backup/latex_validation_backup_' + Date.now();
const REPORT_PATH = path.join(LOG_DIR, 'math_latex_report.json');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

let totalFiles = 0;
let fixedFiles = 0;
const report = {
  unfixable_items: [],
  katex_failures: [],
  summary: { total_files: 0, fixed_files: 0, katex_failures_count: 0 }
};

function normalizeText(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  let txt = raw;
  txt = txt.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  txt = txt.replace(/(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})/g, '$$$$$1$$$$');
  txt = txt.replace(/\$\$\s*\$\$/g, '$$');
  return txt;
}

function checkKatex(text, filepath, keyInfo) {
  if (!text) return;
  const blockReg = /\$\$([\s\S]+?)\$\$/g;
  let m;
  while ((m = blockReg.exec(text)) !== null) {
    try {
      katex.renderToString(m[1], { throwOnError: true, displayMode: true });
    } catch (e) {
      report.katex_failures.push({ file: filepath, key: keyInfo, latex: m[1], error: e.message });
    }
  }
  const inlineReg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  while ((m = inlineReg.exec(text)) !== null) {
    try {
      katex.renderToString(m[1], { throwOnError: true, displayMode: false });
    } catch (e) {
      report.katex_failures.push({ file: filepath, key: keyInfo, latex: m[1], error: e.message });
    }
  }
}

function processObject(obj, filepath) {
  let changed = false;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      const original = obj[key];
      const fixed = normalizeText(original);
      if (original !== fixed) {
        obj[key] = fixed;
        changed = true;
      }
      checkKatex(fixed, filepath, key);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (processObject(obj[key], filepath)) {
        changed = true;
      }
    }
  }
  return changed;
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.json')) {
      totalFiles++;
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const json = JSON.parse(content);
        
        // Backup
        const relativePath = path.relative('.', fullPath);
        const backupPath = path.join(BACKUP_DIR, relativePath);
        
        const isChanged = processObject(json, relativePath);
        if (isChanged) {
          fs.mkdirSync(path.dirname(backupPath), { recursive: true });
          fs.copyFileSync(fullPath, backupPath);
          fs.writeFileSync(fullPath, JSON.stringify(json, null, 2), 'utf8');
          fixedFiles++;
        }
      } catch (e) {
        report.unfixable_items.push({ file: fullPath, error: e.message });
      }
    }
  }
}

TARGET_DIRS.forEach(scanDir);

report.summary.total_files = totalFiles;
report.summary.fixed_files = fixedFiles;
report.summary.katex_failures_count = report.katex_failures.length;

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n✅ 스캔 완료`);
console.log(`- 검사한 파일: ${totalFiles}개`);
console.log(`- 자동 수정된 파일: ${fixedFiles}개`);
console.log(`- 파싱 불가(수동 확인 필요): ${report.unfixable_items.length}개`);
console.log(`- KaTeX 렌더 실패 수식: ${report.katex_failures.length}개`);
console.log(`\n리포트가 ${REPORT_PATH} 에 저장되었습니다.`);
