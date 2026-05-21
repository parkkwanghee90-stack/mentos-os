const fs = require('fs');
const path = require('path');

// ESM/CJS 호환성을 고려하여 파일에서 정적 객체를 직접 파싱하거나 동적 require를 시도합니다.
// DIAMOND_BOX_4.js는 ES Module (export const DIAMOND_BOX_4 = ...) 형식이므로 텍스트로 읽고
// 불필요한 JS 문법 부분을 지워서 JSON으로 변환하는 것이 가장 안전합니다.

const srcPath = path.join(__dirname, '../src/data/DIAMOND_BOX_4.js');
const destPath = path.join(__dirname, '../src/data/DIAMOND_BOX_4.json');

console.log('Reading DIAMOND_BOX_4.js...');
let content = fs.readFileSync(srcPath, 'utf8');

// 'export const DIAMOND_BOX_4 = ' 부분을 제거하고 맨 마지막 세미콜론(;) 제거 시도
content = content.replace(/^\/\/.*$/gm, ''); // 주석 제거
content = content.replace(/export const DIAMOND_BOX_4 = /, '');
content = content.trim();

if (content.endsWith(';')) {
  content = content.slice(0, -1);
}

// JSON 파싱 검증 및 저장
try {
  console.log('Validating JSON parsing...');
  // 간단한 정합성 테스트를 위해 eval을 이용하거나, JSON.stringify/parse 테스트를 수행
  // DIAMOND_BOX_4.js가 큰 JS 객체 리터럴이므로, Function("return (" + content + ")")() 방식으로 안전하게 메모리에 로드합니다.
  const obj = Function(`return (${content})`)();
  
  console.log('Writing clean JSON to src/data/DIAMOND_BOX_4.json...');
  fs.writeFileSync(destPath, JSON.stringify(obj, null, 2), 'utf8');
  console.log(`Success! JSON generated at: ${destPath} (Size: ${(fs.statSync(destPath).size / (1024 * 1024)).toFixed(2)} MB)`);
} catch (e) {
  console.error('Failed to convert DIAMOND_BOX_4 to JSON:', e);
}
