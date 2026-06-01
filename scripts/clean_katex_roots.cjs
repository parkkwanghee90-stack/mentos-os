const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'src', 'data', 'math_problem_texts.json'),
  path.join(__dirname, '..', 'public', 'data', 'math_problem_texts.json')
];

for (const filePath of filePaths) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent file: ${filePath}`);
    continue;
  }
  
  console.log(`Cleaning KaTeX non-standard root formulas in: ${filePath} ...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. \root{3}\f(n) -> \sqrt[3]{f(n)}
  content = content.replace(/\\root\{3\}\\f\(n\)/g, '\\sqrt[3]{f(n)}');
  
  // 2. \root{3}{81} -> \sqrt[3]{81}
  content = content.replace(/\\root\{3\}\{81\}/g, '\\sqrt[3]{81}');
  
  // 3. \root{3}{3} -> \sqrt[3]{3}
  content = content.replace(/\\root\{3\}\{3\}/g, '\\sqrt[3]{3}');

  // 4. \root{3}{9} -> \sqrt[3]{9}
  content = content.replace(/\\root\{3\}\{9\}/g, '\\sqrt[3]{9}');

  // 5. 일반적인 \root{n}{x} 패턴을 \sqrt[n]{x} 로 변환
  content = content.replace(/\\root\{([0-9a-zA-Z]+)\}\{([0-9a-zA-Z\s]+)\}/g, '\\sqrt[$1]{$2}');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully cleaned and saved: ${filePath}`);
}
