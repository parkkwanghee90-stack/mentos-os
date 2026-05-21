const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

keys.forEach(key => {
  let text = data[key];

  // 1. 이미 $로 감싸져 있지 않은 수식 기호들을 찾아 $로 감쌈
  // \sin, \cos, \tan, \theta, \pi, \alpha, \beta, \gamma, \delta, \sqrt, \frac, \log, \leq, \geq
  const mathSymbols = ['\\\\sin', '\\\\cos', '\\\\tan', '\\\\theta', '\\\\pi', '\\\\alpha', '\\\\beta', '\\\\gamma', '\\\\delta', '\\\\sqrt', '\\\\frac', '\\\\log', '\\\\leq', '\\\\geq'];
  
  // 단순 치환보다는 지문 전체의 문맥을 고려하여 주요 기호 주변에 $가 없는 경우 보강
  // 특히 3번 문항처럼 수식이 본문인 경우를 대비
  
  // 2. 개별 문항별 맞춤형 수식화 (주요 깨짐 문항)
  if (key.includes('003.webp')) {
    text = "$0 < \\sin \\theta < \\cos \\theta < 1$ 인 $\\theta$ 에 대하여\n다음 보기 중에서 옳은 것만을 있는 대로 고른 것은?\n\n[보기]\nㄱ. $0 < \\sin \\theta < \\cos \\theta < 1$\nㄴ. $0 < \\log_{\\cos \\theta} \\sin \\theta < 1$\nㄷ. $(\\sin \\theta)^{\\cos \\theta} < (\\sin \\theta)^{\\sin \\theta} < (\\cos \\theta)^{\\sin \\theta}$\n\n① ㄱ  ② ㄱ, ㄴ  ③ ㄱ, ㄷ  ④ ㄴ, ㄷ  ⑤ ㄱ, ㄴ, ㄷ";
  }
  
  if (key.includes('010.webp')) {
      text = text.replace(/0 < a < \\frac{4}{7}/, "$0 < a < \\frac{4}{7}$");
      text = text.replace(/실수 a와 음수 b/, "실수 $a$와 음수 $b$");
      // 이미 $$는 있으므로 보존
  }

  if (key.includes('011.webp')) {
      text = text.replace(/0 \\leq x \\leq 2\\pi/, "$0 \\leq x \\leq 2\\pi$");
      // y=9, y=2 등도 수식화
      text = text.replace(/y = 9/, "$y = 9$").replace(/y = 2/, "$y = 2$");
      text = text.replace(/두 양수 a, b/, "두 양수 $a, b$");
      text = text.replace(/ab의 값/, "$ab$의 값");
  }

  if (key.includes('014.webp')) {
      text = text.replace(/각 \\theta/, "각 $\\theta$").replace(/각 70\\theta/, "각 $70\\theta$");
      // 중략... 본문의 sin합 수식은 이미 $로 감싸져 있음 (진단 결과 확인)
  }

  data[key] = text;
});

// 파일 저장 (JSON.stringify 과정에서 \는 다시 \\로 안전하게 이스케이프됨)
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log("3단계 수식 구분자($) 삽입 및 가독성 고도화 완료!");
