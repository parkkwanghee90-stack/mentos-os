const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

keys.forEach(key => {
  let text = data[key];

  // 1. 공통 오타 및 기호 교정
  text = text.replace(/\\sinx/g, '\\sin x');
  text = text.replace(/\\sinC/g, '\\sin C');
  text = text.replace(/\\text\{cos\}/g, '\\cos ');
  text = text.replace(/\\text\{cos\}x/g, '\\cos x');
  text = text.replace(/\\text\{π\}/g, '\\pi ');
  text = text.replace(/π/g, '\\pi'); // 생 기호 pi로 변경

  // 2. 일관성 없는 구분자 교환 (\( \) -> $)
  text = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

  // 3. 지목된 문항별 정밀 수동 재작성 (오차 제로화)
  if (key.includes('013.webp')) {
      text = "$0 < x < 2\\pi$ 일 때, 곡선 $y = |2\\sin 2x + 1|$과 직선 $y = 1$이 만나는 서로 다른 점의 개수는?\n\n① 3  ② 5  ③ 7  ④ 9  ⑤ 11";
  }
  if (key.includes('022.webp')) {
      text = "두 함수 $f(x) = \\cos x \\; (0 \\leq x < \\pi), \\; g(x) = \\sin x$에 대하여 방정식 $g(f^{-1}(x)) = \\frac{1}{2}$의 두 근을 $\\alpha, \\beta$라 할 때, $\\alpha^2 + \\beta^2$의 값을 구하시오. (단, $f^{-1}(x)$는 $f(x)$의 역함수이다.)";
  }
  if (key.includes('023.webp')) {
      text = "$\\sin \\theta + 1 = 5 \\cos \\theta$일 때, $\\cos \\theta$의 값은? (단, $0 < \\theta < \\frac{\\pi}{2}$)\n\n① $\\frac{7}{26}$  ② $\\frac{4}{13}$  ③ $\\frac{9}{26}$  ④ $\\frac{5}{13}$  ⑤ $\\frac{11}{26}$";
  }
  if (key.includes('032.webp')) {
      text = "$0 < x < \\frac{\\pi}{2}$ 에서 두 함수 $y = a \\sin 3x$, $y = 2 \\cos 3x$의 그래프가 $x$축과 만나는 점을 각각 $A, B$라 하자. 함수 $y = a \\sin 3x$의 그래프 위의 임의의 점 $P$에 대하여 삼각형 $ABP$의 넓이의 최댓값이 $\\frac{1}{2} \\pi$일 때, 양수 $a$의 값을 구하시오.";
  }
  if (key.includes('035.webp')) {
      text = "삼각형 $ABC$에서 \n\n$$2 \\cos \\frac{B+C-A}{2} = \\sin C \\cos\\left(\\frac{\\frac{\\pi}{2}-C}{2}\\right) + \\cos C \\sin\\left(\\frac{\\frac{\\pi}{2}+C}{2}\\right)$$\n\n가 성립할 때, $\\sin A$의 값을 구하시오.";
  }
  if (key.includes('042.webp')) {
      text = "직선 $2x \\sin \\theta + y \\cos \\theta = -\\sin^2 \\theta$와\n\n곡선 $y = \\frac{3}{2} x^2 + \\cos \\theta$가 만나도록 하는 $\\theta$의 최소값이 $\\alpha$일 때, $4\\sin^2 \\alpha$의 값을 구하시오. (단, $0 < \\theta < \\frac{\\pi}{2}$)";
  }

  data[key] = text;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log("3단계 수식 오타 및 구분자 완전 교정 완료!");
