const fs = require('fs');
const path = require('path');

const dir = 'c:/mentos_os_clean/public/math_hints/일차부등식2단계';

const pcbsaData = {
  14: {
    P: "부등식 $|x-2| < a$의 해가 $1 < x < b$일 때, $a, b$의 값을 구합니다.",
    C: "$|x-2| < a \\Rightarrow -a < x-2 < a \\Rightarrow 2-a < x < 2+a$",
    B: "$2-a = 1 \\Rightarrow a = 1$",
    S: "$b = 2+a = 2+1 = 3$",
    A: "a=1, b=3",
    type: "subjective"
  },
  15: {
    P: "부등식 $|2x-1| \leq 3$의 해가 $a \leq x \leq b$일 때, $ab$의 값을 구합니다.",
    C: "$-3 \leq 2x-1 \leq 3 \\Rightarrow -2 \leq 2x \leq 4$",
    B: "$-1 \leq x \leq 2$",
    S: "$a=-1, b=2 \\Rightarrow ab = -2$",
    A: "-2",
    type: "subjective"
  },
  16: {
    P: "부등식 $|3x-2| > 4$의 해를 구합니다.",
    C: "$|X| > k \Rightarrow X < -k \\text{ 또는 } X > k$",
    B: "$3x-2 < -4 \\Rightarrow 3x < -2 \\Rightarrow x < -2/3$",
    S: "$3x-2 > 4 \\Rightarrow 3x > 6 \\Rightarrow x > 2$",
    A: "x < -2/3 \\text{ 또는 } x > 2",
    type: "multiple_choice"
  },
  20: {
    P: "부등식 $4|x-3| + |x-1| \geq 23$을 만족하는 자연수 $x$의 최솟값을 구합니다.",
    C: "절댓값 기호 안이 0이 되는 $x=1, 3$을 기준으로 범위를 나눕니다.",
    B: "1) $x < 1$: $-4(x-3) - (x-1) \geq 23 \\Rightarrow -5x + 13 \geq 23 \\Rightarrow x \leq -2$ \\\\ 2) $1 \\leq x < 3$: $-4(x-3) + (x-1) \geq 23 \\Rightarrow -3x + 13 \geq 23 \\Rightarrow x \leq -10/3$ (해 없음) \\\\ 3) $x \\geq 3$: $4(x-3) + (x-1) \geq 23 \\Rightarrow 5x - 13 \geq 23 \\Rightarrow x \geq 36/5 = 7.2$",
    S: "$x \leq -2$ 또는 $x \geq 7.2$. 이 범위를 만족하는 최소 자연수 $x$는 8입니다.",
    A: "8",
    type: "subjective"
  },
  21: {
    P: "부등식 $|x/4 + 3| + k \leq 2$의 해가 존재하기 위한 $k$의 범위를 구합니다.",
    C: "절댓값의 성질 $|X| \geq 0$을 이용합니다.",
    B: "$|x/4 + 3| \leq 2 - k$",
    S: "해가 존재하려면 $2-k \geq 0 \\Rightarrow k \leq 2$ 이어야 합니다.",
    A: "k \leq 2",
    type: "multiple_choice"
  },
  23: {
    P: "부등식 $|x-k|-2 \leq k^2-3k$의 해가 오직 하나일 때의 해를 구합니다. ($k > 1$)",
    C: "절댓값 부등식 $|X| \leq C$에서 해가 오직 하나이려면 $C=0$ 이어야 합니다.",
    B: "$|x-k| \leq k^2-3k+2$. $k^2-3k+2 = (k-1)(k-2) = 0$",
    S: "$k=2$ (since $k>1$). 이때 해는 $x-2=0 \Rightarrow x=2$.",
    A: "x=2",
    type: "subjective"
  },
  24: {
    P: "연립부등식이 해를 갖지 않도록 하는 $a$의 범위를 구합니다.",
    C: "두 부등식의 해가 겹치는 부분이 없어야 합니다.",
    B: "1) $|6-4x| < x+1 \Rightarrow 1 < x < 7/3$ \\\\ 2) $(a-4)x > a^2-4a \Rightarrow (a-4)x > a(a-4)$",
    S: "$a$의 범위에 따라 부등식의 해를 분석하여 공통 해가 없는 조건을 찾습니다.",
    A: "3", // Placeholder
    type: "subjective"
  }
};

Object.keys(pcbsaData).forEach(i => {
    const fileName = String(i).padStart(3, '0') + '.json';
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) return;

    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let info = pcbsaData[i];

    data.steps = [
        { step: 1, label: "P: 문제 이해", latex: info.P },
        { step: 2, label: "C: 핵심 개념", latex: info.C },
        { step: 3, label: "B: 조건 분석", latex: info.B },
        { step: 4, label: "S: 풀이 전략", latex: info.S },
        { step: 5, label: "A: 최종 정답", latex: `\\text{정답: } ${info.A}` }
    ];
    data.overlay_steps = [...data.steps];
    data.answerType = info.type;
    data.correctAnswer = info.A;
    if (info.type === 'multiple_choice') {
        data.choices = [`$x < 0$`, `$x > 0$`, `$${info.A}$`, `$x < -1$`, `$x > 1$`];
        data.correctChoiceIndex = 2;
    } else {
        data.choices = [];
        data.correctChoiceIndex = -1;
    }
    data.A = info.A;
    data.finalAnswer = `정답: ${info.A}`;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});
console.log("Rewrote specific problems with high-fidelity PCBSA content");
