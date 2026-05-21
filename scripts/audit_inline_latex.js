import fs from 'fs';

const dataFile = 'src/data/math_problem_texts.json';
const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const targets = [
  '\\\\overline', '\\\\cos', '\\\\sin', '\\\\tan', '\\\\triangle', 
  '\\\\sqrt', '\\\\frac', '\\\\leq', '\\\\geq', '\\\\neq', 
  '\\\\text', '\\\\left', '\\\\right'
];

// 정규식: $$...$$ 또는 $...$ 또는 \[...\] 또는 \(...\) 매칭
const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

const failures = [];

for (const key of Object.keys(db)) {
  const text = db[key];
  if (!text) continue;
  
  // 1. 수식 블록들을 모두 플레이스홀더로 치환
  const plainText = text.replace(mathBlockRegex, ' __MATH_BLOCK__ ');
  
  // 2. 남은 plainText 영역에서 타겟 커맨드가 있는지 스캔
  for (const cmd of targets) {
    // 역슬래시 이중 이스케이프 처리하여 정규식 생성
    const rawCmd = cmd.replace(/\\\\/g, '\\');
    if (plainText.includes(rawCmd)) {
      // 어디서 발견되었는지 앞뒤 약간의 컨텍스트를 포함해서 snippet 생성
      const idx = plainText.indexOf(rawCmd);
      const snippet = plainText.substring(Math.max(0, idx - 20), Math.min(plainText.length, idx + 40));
      
      const parts = key.split('/');
      let unitStage = parts[0] || 'Unknown';
      let probNum = parts[1] || 'Unknown';
      let unit = unitStage.replace(/[0-9]단계/, '');
      let stageMatch = unitStage.match(/([0-9])단계/);
      let stage = stageMatch ? parseInt(stageMatch[1], 10) : 0;
      
      failures.push({
        file: 'math_problem_texts.json',
        unit: unit,
        stage: stage,
        problem: probNum,
        detected_command: rawCmd,
        snippet: snippet.trim()
      });
    }
  }
}

const reportPath = 'reports/audit_inline_latex_failures.json';
fs.writeFileSync(reportPath, JSON.stringify(failures, null, 2), 'utf8');

console.log(`[Audit Inline LaTeX] Done.`);
console.log(`Total items scanned: ${Object.keys(db).length}`);
console.log(`Total failures detected: ${failures.length}`);
console.log(`Report saved to: ${reportPath}`);
