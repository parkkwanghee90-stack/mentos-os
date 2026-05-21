const fs = require('fs');
const path = require('path');

const hint = {
  "problem_id": "030",
  "unit": "CSAT_2024_6월_미적분",
  "title": "2024학년도 6월 모의평가 30번",
  "type": "algebra",
  "P": "초월함수 방정식의 근을 무한수열로 나열하고, 삼각함수의 덧셈정리를 활용하여 식을 변형한 뒤 극한을 구하는 고난도 문항입니다. 테일러 급수 등의 근사가 아닌 고교 교육과정 내의 엄밀한 대수적 극한 계산이 필수입니다.",
  "C": "$y=\\\\tan x$ 와 $y=\\\\frac{\\\\sqrt{x}}{10}$ 의 교점 $a_n$ 에 대하여 $\\\\tan a_n = \\\\frac{\\\\sqrt{a_n}}{10}$ 이 성립합니다. 탄젠트 덧셈정리를 이용하여 $\\\\tan(a_{n+1} - a_n)$ 을 $\\\\sqrt{a_{n+1}}$ 과 $\\\\sqrt{a_n}$ 에 대한 식으로 변형해야 합니다.",
  "B": "변형된 식의 분자, 분모를 유리화하고 극한의 성질을 이용합니다. 그래프의 점근선 특성을 통해 $n \\\\to \\\\infty$ 일 때 $a_{n+1} - a_n \\\\to \\\\pi$ 임을 정확히 증명하는 것이 핵심입니다.",
  "S1": "**[Step 1] 삼각함수의 덧셈정리 적용**\\\\n$\\\\tan a_n = \\\\frac{\\\\sqrt{a_n}}{10}$ 이므로, 덧셈정리에 의해\\\\n$\\\\tan(a_{n+1} - a_n) = \\\\frac{\\\\tan a_{n+1} - \\\\tan a_n}{1 + \\\\tan a_{n+1}\\\\tan a_n} = \\\\frac{\\\\frac{\\\\sqrt{a_{n+1}}}{10} - \\\\frac{\\\\sqrt{a_n}}{10}}{1 + \\\\frac{\\\\sqrt{a_{n+1}}}{10}\\\\frac{\\\\sqrt{a_n}}{10}}$\\\\n$= \\\\frac{10(\\\\sqrt{a_{n+1}} - \\\\sqrt{a_n})}{100 + \\\\sqrt{a_{n+1}a_n}} = \\\\frac{10(a_{n+1} - a_n)}{(\\\\sqrt{a_{n+1}} + \\\\sqrt{a_n})(100 + \\\\sqrt{a_{n+1}a_n})}$ 입니다.\\\\n양변을 제곱하면 $\\\\tan^2(a_{n+1} - a_n) = \\\\frac{100(a_{n+1} - a_n)^2}{(\\\\sqrt{a_{n+1}} + \\\\sqrt{a_n})^2(100 + \\\\sqrt{a_{n+1}a_n})^2}$ 이 됩니다.",
  "S2": "**[Step 2] $a_{n+1}-a_n$ 및 $a_{n+1}/a_n$ 의 극한 도출**\\\\n곡선 $y=\\\\tan x$ 의 점근선은 $x = \\\\frac{2n-1}{2}\\\\pi$ 입니다. $n \\\\to \\\\infty$ 일 때 $\\\\frac{\\\\sqrt{a_n}}{10} \\\\to \\\\infty$ 이므로 교점은 점근선에 한없이 가까워집니다. 즉, $\\\\lim_{n \\\\to \\\\infty} (a_n - \\\\frac{2n-3}{2}\\\\pi) = 0$ 입니다.\\\\n이를 통해 $\\\\lim_{n \\\\to \\\\infty} (a_{n+1} - a_n) = \\\\lim_{n \\\\to \\\\infty} \\\\left( (a_{n+1} - \\\\frac{2n-1}{2}\\\\pi) - (a_n - \\\\frac{2n-3}{2}\\\\pi) + \\\\pi \\\\right) = \\\\pi$ 임을 알 수 있습니다. 또한 $\\\\lim_{n \\\\to \\\\infty} \\\\frac{a_{n+1}}{a_n} = 1$ 입니다.",
  "S3": "**[Step 3] 형태에 맞춘 극한값 분리 계산**\\\\n구하고자 하는 식을 적절히 $a_n$ 의 거듭제곱으로 나누어 분리합니다.\\\\n$\\\\lim_{n \\\\to \\\\infty} \\\\frac{(\\\\sqrt{a_{n+1}} + \\\\sqrt{a_n})^2}{a_n} = (\\\\sqrt{1} + \\\\sqrt{1})^2 = 4$\\\\n$\\\\lim_{n \\\\to \\\\infty} \\\\frac{(100 + \\\\sqrt{a_{n+1}a_n})^2}{a_n^2} = (0 + \\\\sqrt{1})^2 = 1$",
  "S4": "**[Step 4] 최종 정답 도출**\\\\n$\\\\lim_{n \\\\to \\\\infty} a_n^3 \\\\tan^2(a_{n+1} - a_n) = \\\\lim_{n \\\\to \\\\infty} \\\\frac{100(a_{n+1} - a_n)^2}{\\\\frac{(\\\\sqrt{a_{n+1}} + \\\\sqrt{a_n})^2}{a_n} \\\\times \\\\frac{(100 + \\\\sqrt{a_{n+1}a_n})^2}{a_n^2}}$\\\\n$= \\\\frac{100 \\\\pi^2}{4 \\\\times 1} = 25\\\\pi^2$ 이 됩니다.\\\\n따라서 $\\\\frac{1}{\\\\pi^2} \\\\times 25\\\\pi^2 = 25$ 입니다.",
  "A": "탄젠트 덧셈정리와 극한의 성질을 엄밀하게 적용하여 도출한 최종 정답은 25 입니다."
};

const filepath = path.join('c:/mentos_os_clean/public/math_hints/CSAT_2024_6월_미적분/030.json');
fs.writeFileSync(filepath, JSON.stringify(hint, null, 2));
console.log('Fixed 030.json');
