import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const trig = data['대수'].find(c => c.id === '삼각함수성질');
if (trig) {
  trig.content += `

## 4. 동경의 $n$등분 (심화)
$\\alpha$ 가 특정 사분면의 각일 때, $\\frac{\\alpha}{n}$ 가 존재할 수 있는 사분면은 일반각 공식을 활용합니다.
- **공식:** $360^\circ n + \text{시작각} < \alpha < 360^\circ n + \text{종료각}$
- **풀이:** 전체 식을 $n$으로 나누어 $k=0, 1, \dots, n-1$ 을 차례로 대입하여 가능한 사분면을 모두 찾습니다.
- **예시:** $\alpha \in \text{Q4}$ 일 때, $\alpha/3$ 는 제2, 3, 4사분면에 존재 가능하며 **제1사분면은 불가능**합니다.`;
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added n-division concept to Trig Formula Card!');
