import fs from 'fs';

const path = './public/premium_lectures/귀납적정의.json';
const data = {
  "id": "귀납적정의",
  "title": "수열의 귀납적 정의와 수학적 귀납법",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "수열을 정의하는 또 다른 방법, 귀납적 정의를 배워봅시다. 첫째항과 이웃하는 항들 사이의 관계식(점화식)으로 수열을 나타냅니다.",
      "visuals": {
        "title": "1. 수열의 귀납적 정의",
        "math": "a_1 = a, \\quad a_{n+1} = f(a_n)"
      }
    },
    {
      "step": 2,
      "narration": "등차수열과 등비수열의 점화식은 기본 중의 기본입니다. $a_{n+1} = a_n + d$ 는 등차, $a_{n+1} = r a_n$ 은 등비수열임을 바로 알아채야 합니다.",
      "visuals": {
        "title": "2. 기본 점화식",
        "math": "\\text{등차: } a_{n+1} - a_n = d \\\\ \\text{등비: } a_{n+1} = r a_n"
      }
    },
    {
      "step": 3,
      "narration": "조금 더 복잡한 형태인 $a_{n+1} = p a_n + q$ 꼴입니다. 양변에서 특수한 값 $\\alpha$를 빼주면 등비수열 형태로 변형하여 일반항을 구할 수 있습니다.",
      "visuals": {
        "title": "3. 변형이 필요한 점화식 (p a_n + q 꼴)",
        "math": "a_{n+1} - \\alpha = p(a_n - \\alpha) \\quad \\text{where } \\alpha = \\frac{q}{1-p}"
      }
    },
    {
      "step": 4,
      "narration": "수학적 귀납법은 모든 자연수에 대해 성립함을 증명하는 강력한 도구입니다. 1단계: $n=1$일 때 성립함을 보이고, 2단계: $n=k$일 때 성립한다고 가정하고 $n=k+1$일 때를 유도합니다.",
      "visuals": {
        "title": "4. 수학적 귀납법의 원리",
        "math": "\\text{Step 1: } n=1 \\text{ 성립} \\\\ \\text{Step 2: } n=k \\text{ 가정 } \\implies n=k+1 \\text{ 성립}"
      }
    },
    {
      "step": 5,
      "narration": "부등식의 증명은 등식보다 조금 더 까다롭습니다. 'A > B'임을 보이기 위해 'A > C'이고 'C > B'임을 이용하는 다리 놓기 전략을 주로 사용합니다.",
      "visuals": {
        "title": "5. 부등식 증명 전략",
        "math": "(1+h)^n > 1+nh \\quad (h>0, n \\geq 2) \\\\ \\downarrow \\\\ (1+h)^{k+1} = (1+h)^k(1+h) > (1+kh)(1+h) > 1+(k+1)h"
      }
    },
    {
      "step": 6,
      "narration": "마지막 실전 팁! 점화식에서 일반항을 구하기 어려울 때는 직접 대입하여 규칙성을 찾는 '축차대입법'이 가장 확실한 방법일 때가 많습니다.",
      "visuals": {
        "title": "실전 팁: 직접 대입과 나열",
        "math": "a_{n+1} = a_n + n \\implies a_n = a_1 + \\sum_{k=1}^{n-1} k"
      }
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Upgraded 귀납적정의.json!');
