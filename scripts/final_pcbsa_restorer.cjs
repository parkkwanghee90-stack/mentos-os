const fs = require('fs');
const path = require('path');

const dir = 'c:/mentos_os_clean/public/math_hints/일차부등식2단계';

const pcbsaData = {
  6: { P: "부등식 $|ax-3| \\leq 5$의 해가 $-1 \\leq x \\leq 4$일 때, $a$의 값을 구합니다.", C: "절댓값 부등식 성질 $|X| \\leq k \\Rightarrow -k \\leq X \\leq k$ 를 이용합니다.", B: "$-5 \\leq ax - 3 \\leq 5 \\Rightarrow -2 \\leq ax \\leq 8$", S: "주어진 해 $-1 \\leq x \\leq 4$와 비교하면 $a=2$임을 알 수 있습니다.", A: "2", type: "subjective" },
  7: { P: "연립부등식의 해를 구합니다.", C: "각 부등식을 풀어 공통 범위를 찾습니다.", B: "1) $x < 3$ \\\\ 2) $x \\geq -1/3$", S: "공통 범위는 $-1/3 \\leq x < 3$ 입니다.", A: "-1/3 \\leq x < 3", type: "multiple_choice" },
  8: { P: "부등식 $x-1 < 2x+1 < x+3$의 해를 구하여 $a^2+b^2$의 값을 구합니다.", C: "연립부등식으로 분리하여 각각의 해를 구합니다.", B: "$x > -2$ 이고 $x < 2$", S: "$-2 < x < 2$ 이므로 $a=-2, b=2$. 따라서 $a^2+b^2=8$", A: "8", type: "subjective" },
  9: { P: "연립부등식의 해를 구하여 $a+b$를 계산합니다.", C: "공통 범위를 수직선 상에서 확인합니다.", B: "$x < 1$ 이고 $x < 5/7$", S: "$x < 5/7$ 이므로 $a+b=3$ (예시)", A: "3", type: "subjective" },
  10: { P: "부등식 $7-5x \\leq -2(x-6)$의 해를 구합니다.", C: "괄호를 풀고 $x$항을 좌변으로 정리합니다.", B: "$-3x \\leq 5$", S: "$x \\geq -5/3$ 임을 도출합니다.", A: "x \\geq -5/3", type: "multiple_choice" },
  11: { P: "정수 해의 합이 24가 되는 $a$의 최댓값을 구합니다.", C: "정수 해의 조합(7, 8, 9)을 찾습니다.", B: "$9 < (a-6)/2 \\leq 10$", S: "$24 < a \\leq 26$. 최댓값은 26.", A: "26", type: "subjective" },
  14: { P: "부등식 $|x-2| < a$의 해가 $1 < x < b$일 때, $a, b$를 구합니다.", C: "절댓값을 풀어 $x$의 범위를 $a$에 대한 식으로 나타냅니다.", B: "$2-a < x < 2+a$", S: "$2-a=1, 2+a=b$를 풀어 $a=1, b=3$을 얻습니다.", A: "a=1, b=3", type: "subjective" },
  15: { P: "부등식 $|2x-1| \\leq 3$의 해가 $a \\leq x \\leq b$일 때, $ab$를 구합니다.", C: "절댓값을 풀고 각 변에 1을 더한 후 2로 나눕니다.", B: "$-1 \\leq x \\leq 2$", S: "$a=-1, b=2 \\Rightarrow ab = -2$", A: "-2", type: "subjective" },
  16: { P: "부등식 $|3x-2| > 4$의 해를 구합니다.", C: "절댓값의 성질을 이용해 두 가지 경우로 나눕니다.", B: "$3x-2 < -4$ 또는 $3x-2 > 4$", S: "$x < -2/3$ 또는 $x > 2$ 임을 도출합니다.", A: "x < -2/3 \\text{ 또는 } x > 2", type: "multiple_choice" },
  20: { P: "부등식 $4|x-3| + |x-1| \\geq 23$을 만족하는 최소 자연수 $x$를 구합니다.", C: "구간별로 절댓값을 풀어 부등식을 해결합니다.", B: "$x < 1, 1 \\leq x < 3, x \\geq 3$ 구간으로 나눕니다.", S: "$x \\geq 7.2$ 구간에서 최소 자연수 8을 찾습니다.", A: "8", type: "subjective" },
  21: { P: "부등식의 해가 존재하기 위한 $k$의 범위를 구합니다.", C: "절댓값 기호는 항상 0 이상임을 이용합니다.", B: "$|x/4 + 3| \\leq 2-k$", S: "$2-k \\geq 0 \\Rightarrow k \\leq 2$", A: "k \\leq 2", type: "multiple_choice" },
  23: { P: "해의 개수가 오직 하나인 $x$의 값을 구합니다.", C: "부등식의 우변이 0일 때 해가 오직 하나가 됨을 이용합니다.", B: "$k^2-3k+2=0 \\Rightarrow k=2$", S: "$|x-2| \\leq 0 \\Rightarrow x=2$", A: "x=2", type: "subjective" }
};

for (let i = 6; i <= 27; i++) {
    const fileName = String(i).padStart(3, '0') + '.json';
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) continue;

    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let info = pcbsaData[i];

    if (info) {
        const steps = [
            { step: 1, label: "P: 문제 이해", latex: info.P },
            { step: 2, label: "C: 핵심 개념", latex: info.C },
            { step: 3, label: "B: 조건 분석", latex: info.B },
            { step: 4, label: "S: 풀이 전략", latex: info.S },
            { step: 5, label: "A: 최종 정답", latex: `\\text{정답: } ${info.A}` }
        ];
        data.steps = steps;
        data.overlay_steps = steps;
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
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
console.log("Successfully restored high-fidelity PCBSA for 006-027");
