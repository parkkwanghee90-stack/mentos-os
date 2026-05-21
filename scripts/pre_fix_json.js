import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // JSON 파싱 에러를 유발하는 잘못된 백슬래시 교정 (\alpha -> \\alpha)
  content = content.replace(/\\(alpha|beta|gamma|sqrt|frac|pm|sum|dots|cdots|vdots|ddots|ldots|times|div|cdot)/g, (match, p1) => {
    // 이미 이중 백슬래시인 경우는 제외
    return '\\\\' + p1;
  });
  
  // 중복 이스케이프 정리 (\\\\\\ -> \\\\)
  content = content.replace(/\\\\\\\\/g, '\\\\');
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log(`Pre-fixed RAW text in ${files.length} files.`);
