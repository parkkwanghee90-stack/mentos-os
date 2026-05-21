import fs from 'fs';
import path from 'path';
import katex from 'katex';

console.warn = () => {}; // Mute katex warnings

const report = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.json')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(fullPath) {
  const result = {
    file: fullPath.replace(/\\/g, '/'),
    jsonParse: true,
    katexPass: true,
    utf8Pass: true,
    newlinePass: true,
    brokenTokens: [],
    repairNeeded: false
  };

  const buf = fs.readFileSync(fullPath);
  
  // 1. UTF-8 & Replacement Char Check
  let content = '';
  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    if (content.includes('\uFFFD')) {
      result.utf8Pass = false;
      result.brokenTokens.push(' (replacement char)');
    }
  } catch(e) {
    result.utf8Pass = false;
    result.brokenTokens.push('Invalid UTF-8 bytes');
    content = buf.toString('utf8'); // fallback for further testing
  }

  // 2. JSON Parse Check
  let data = null;
  try {
    data = JSON.parse(content);
  } catch(e) {
    result.jsonParse = false;
    result.brokenTokens.push('JSON Syntax Error');
  }

  // Helper for text testing
  function checkStr(str) {
    if (typeof str !== 'string') return;
    
    // Newline check (literal \n in string vs actual newline)
    if (str.includes('\\n')) {
      result.newlinePass = false;
      if (!result.brokenTokens.includes('\\n literal')) result.brokenTokens.push('\\n literal');
    }
    
    // Typo / missing backslash
    if (/(?<!\\)sqrT|sqlT|(?<!\\)sqrt/.test(str)) {
      if (!result.brokenTokens.includes('sqrt typo')) result.brokenTokens.push('sqrt typo');
    }
    
    // Over-escaped backslash macros (e.g., \\sqrt)
    // Note: In JSON, a single backslash is written as \\. 
    // So if the string actually contains "\\sqrt", that means the raw string is \sqrt.
    // If the string contains "\\\\sqrt", that means the raw string is \\sqrt.
    if (/\\\\sqrt|\\\\frac|\\\\pm|\\\\begin|\\\\end/.test(str)) {
      if (!result.brokenTokens.includes('over-escaped macro')) result.brokenTokens.push('over-escaped macro');
    }

    // KaTeX render check
    const blockReg = /\$\$([\s\S]+?)\$\$/g;
    let m;
    while ((m = blockReg.exec(str)) !== null) {
      try { katex.renderToString(m[1], { throwOnError: true, displayMode: true }); }
      catch (e) { result.katexPass = false; }
    }
    const inlineReg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
    while ((m = inlineReg.exec(str)) !== null) {
      try { katex.renderToString(m[1], { throwOnError: true, displayMode: false }); }
      catch (e) { result.katexPass = false; }
    }
  }

  function traverse(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') checkStr(obj[key]);
      else if (typeof obj[key] === 'object' && obj[key] !== null) traverse(obj[key]);
    }
  }

  if (data) traverse(data);
  else {
    // If JSON fails, scan raw text anyway
    checkStr(content);
  }

  result.repairNeeded = !result.jsonParse || !result.katexPass || !result.utf8Pass || !result.newlinePass || result.brokenTokens.length > 0;
  
  report.push(result);
}

scanDir('public/math_hints');

const outPath = 'logs/math1_avs_full_integrity_report.json';
if (!fs.existsSync('logs')) fs.mkdirSync('logs');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('=== AVS Full Integrity Report ===');
console.log('총 검사 파일:', report.length);
console.log('수정 필요 파일:', report.filter(r => r.repairNeeded).length);
console.log(' - JSON Parse 실패:', report.filter(r => !r.jsonParse).length);
console.log(' - UTF-8 실패:', report.filter(r => !r.utf8Pass).length);
console.log(' - KaTeX 렌더 실패:', report.filter(r => !r.katexPass).length);
console.log(' - \\n 이스케이프 오류:', report.filter(r => !r.newlinePass).length);
