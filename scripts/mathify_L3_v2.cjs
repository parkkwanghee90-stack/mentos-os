const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

keys.forEach(key => {
  let text = data[key];

  // 1. 주요 수식 키워드 앞뒤에 $가 없는 경우 보강 (안전한 문자열 방식)
  if (key.includes('003.webp')) {
    text = "$0 < \\sin \\theta < \\cos \\theta < 1$ 인 $\\theta$ 에 대하여\n다음 보기 중에서 옳은 것만을 있는 대로 고른 것은?\n\n[보기]\nㄱ. $0 < \\sin \\theta < \\cos \\theta < 1$\nㄴ. $0 < \\log_{\\cos \\theta} \\sin \\theta < 1$\nㄷ. $(\\sin \\theta)^{\\cos \\theta} < (\\sin \\theta)^{\\sin \\theta} < (\\cos \\theta)^{\\sin \\theta}$\n\n① ㄱ  ② ㄱ, ㄴ  ③ ㄱ, ㄷ  ④ ㄴ, ㄷ  ⑤ ㄱ, ㄴ, ㄷ";
  }
  
  if (key.includes('010.webp')) {
      text = text.replace("0 < a < \\frac{4}{7}", "$0 < a < \\frac{4}{7}$");
      text = text.replace("실수 a와 음수 b", "실수 $a$와 음수 $b$");
  }

  if (key.includes('011.webp')) {
      text = text.replace("0 \\leq x \\leq 2\\pi", "$0 \\leq x \\leq 2\\pi$");
      text = text.replace("y = 9", "$y = 9$");
      text = text.replace("y = 2", "$y = 2$");
      text = text.replace("양수 a, b", "양수 $a, b$");
      text = text.replace("ab의 값", "$ab$의 값");
  }

  if (key.includes('014.webp')) {
      text = text.replace("각 \\theta", "각 $\\theta$");
      text = text.replace("각 70\\theta", "각 $70\\theta$");
      text = text.replace("\\frac{\\pi}{6} < \\theta < \\frac{1}{2}\\pi", "$\\frac{\\pi}{6} < \\theta < \\frac{1}{2}\\pi$");
  }

  data[key] = text;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log("3단계 수식($) 및 가독성 고도화 재작업 완료!");
