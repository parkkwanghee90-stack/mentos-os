const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const targets = [3, 10, 11, 14];

console.log("=== 3단계 집중 문항 수식 상태 보고 ===");

targets.forEach(n => {
  const key = '삼각함수그래프3단계/' + n.toString().padStart(3, '0') + '.webp';
  const text = data[key];
  console.log(`\n[문항 ${n}] 키: ${key}`);
  if (text) {
      // 제어 문자가 아닌 실제 문자열 내의 백슬래시 양상을 보기 위해 raw 형태와 유사하게 출력
      console.log("텍스트 내용:");
      console.log(text);
      console.log("백슬래시 검출 개수:", (text.match(/\\/g) || []).length);
      
      // 구체적인 수식 부위 추출
      if (text.includes('sin')) {
          console.log("샘플 수식 (sin 주변):", text.substring(text.indexOf('sin') - 5, text.indexOf('sin') + 15));
      }
  } else {
      console.log("!! 해당 키를 찾을 수 없습니다 !!");
  }
});
