const fs = require('fs');
const report = JSON.parse(fs.readFileSync('logs/math_latex_report.json', 'utf8'));
const failures = report.katexFailures;

const categories = {
  newline: { name: '\\n 처리 문제', fixable: true, items: [] },
  nestedParenthesis: { name: '$$ 내부 \\( ... \\) 중복 문제', fixable: true, items: [] },
  matrix: { name: 'pmatrix/bmatrix 행렬 문제', fixable: false, items: [] },
  textSpecial: { name: '\\text{} 내부 한글/특수문자 문제', fixable: false, items: [] },
  excessiveBackslash: { name: '\\\\ 과다 escape', fixable: true, items: [] },
  badControl: { name: '잘못된 control character 문제', fixable: false, items: [] },
  other: { name: '기타', fixable: false, items: [] }
};

failures.forEach(f => {
  const err = f.error || '';
  if (err.includes('Undefined control sequence: \\n') || err.includes('\\n')) {
    categories.newline.items.push(f);
  } else if (err.includes("Can't use function '\\('") || err.includes("Can't use function '\\['")) {
    categories.nestedParenthesis.items.push(f);
  } else if (err.includes('matrix') || err.includes('pmatrix') || err.includes('bmatrix') || err.includes('vmatrix')) {
    categories.matrix.items.push(f);
  } else if (err.includes('text') || err.includes('Unicode')) {
    categories.textSpecial.items.push(f);
  } else if (err.includes('Undefined control sequence: \\\\') || err.includes('Expected \\\\')) {
    categories.excessiveBackslash.items.push(f);
  } else if (err.includes('control character') || err.includes('Parse Error')) {
    categories.badControl.items.push(f);
  } else {
    categories.other.items.push(f);
  }
});

console.log('총 실패 개수:', failures.length);
for (const key in categories) {
  const cat = categories[key];
  console.log('\\n[' + cat.name + '] 개수: ' + cat.items.length + ' (자동수정 ' + (cat.fixable ? '가능' : '수동필요') + ')');
  cat.items.slice(0, 5).forEach(i => console.log('  - ' + i.file.split('mentos_os_clean')[1] + ' : ' + i.error.split('\\n')[0]));
}

const math1 = failures.filter(f => f.file.includes('h_math4') || f.file.includes('h_math5'));
console.log('\\n[고1 수학상/하(h_math4/5) 우선수정 파일 목록 (' + math1.length + '개)]');
const uniqueMath1 = [...new Set(math1.map(f => f.file.split('mentos_os_clean')[1]))];
uniqueMath1.slice(0, 10).forEach(f => console.log('  - ' + f));
if (uniqueMath1.length > 10) console.log('  ... 외 ' + (uniqueMath1.length - 10) + '개 파일');
