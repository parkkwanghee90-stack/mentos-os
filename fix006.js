const fs = require('fs');
const p = 'c:/mentos_os_clean/public/math_hints/\uC6D0\uC758\uBC29\uC815\uC2DD2\uB2E8\uACC4/006.json';
const data = {
  type: 'geometry',
  viewBox: { x: [-5, 10], y: [-5, 10] },
  steps: [
    { step: 1, label: 'P: \uAD6C\uD558\uB294 \uAC83 \uD655\uC778', latex: '\uB450 \uC810 A(1,2), B(5,4)\uB97C \uC9C0\uB984\uC758 \uC591 \uB05D\uC810\uC73C\uB85C \uD558\uB294 \uC6D0\uC758 \uBC29\uC815\uC2DD\uC744 \uAD6C\uD569\uB2C8\uB2E4.' },
    { step: 2, label: 'C: \uC870\uAC74/\uB2E8\uC11C \uC815\uB9AC', latex: '\uC9C0\uB984\uC758 \uC591 \uB05D\uC810\uC774 \uC8FC\uC5B4\uC9C0\uBA74 \uC911\uC810\uC774 \uC6D0\uC758 \uC911\uC2EC\uC774\uBA70, \uC911\uC2EC\uC5D0\uC11C \uB05D\uC810\uAE4C\uC9C0 \uAC70\uB9AC\uAC00 \uBC18\uC9C0\uB984\uC785\uB2C8\uB2E4.' },
    { step: 3, label: 'B: \uD544\uC694\uD55C \uBC30\uACBD\uAC1C\uB150/\uACF5\uC2DD', latex: '\uC911\uC810 \uACF5\uC2DD:  = \\\\left(\\\\dfrac{x_1+x_2}{2},\\ \\\\dfrac{y_1+y_2}{2}\\\\right)$ \\\\\\\\ \uC6D0\uC758 \uBC29\uC815\uC2DD: ^2+(y-b)^2=r^2$' },
    { step: 4, label: 'S: \uD480\uC774 \uC804\uAC1C/\uAD6C\uC870 \uBD84\uC11D', latex: '\uC911\uC2EC: $\\\\left(\\\\dfrac{1+5}{2},\\ \\\\dfrac{2+4}{2}\\\\right) = (3,3)$ \\\\\\\\ \uBC18\uC9C0\uB984: ^2=(3-1)^2+(3-2)^2=4+1=5$' },
    { step: 5, label: 'A: \uCD5C\uC885 \uB2F5 \uB3C4\uCD9C', latex: '\uC6D0\uC758 \uBC29\uC815\uC2DD\uC740 ^2+(y-3)^2=5$ \uC785\uB2C8\uB2E4.' }
  ],
  choices: ['(x-3)^2+(y-3)^2=4','(x-3)^2+(y-3)^2=5','(x-3)^2+(y-3)^2=6','(x-3)^2+(y-3)^2=8','(x-3)^2+(y-3)^2=10'],
  finalAnswer: '2',
  correctAnswer: '2',
  answerType: 'multiple_choice',
  correctChoiceIndex: 1,
  explanationFinalLine: '\uC6D0\uC758 \uBC29\uC815\uC2DD\uC740 (x-3)^2+(y-3)^2=5 \uC785\uB2C8\uB2E4.',
  status: 'complete',
  pcbsa_completed: true
};
fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
console.log('OK');
const c = JSON.parse(fs.readFileSync(p,'utf8'));
c.steps.forEach((s,i) => console.log('step'+(i+1)+' latex:', s.latex));
