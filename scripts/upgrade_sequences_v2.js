import fs from 'fs';

const path = './public/premium_lectures/등차등비.json';
const data = {
  "id": "등차등비",
  "title": "등차/등비수열의 합 완벽 유도와 실전",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "안녕하세요! 오늘은 수열의 핵심, 등차수열과 등비수열의 합 공식을 '직접 유도'해보며 원리를 파헤쳐 보겠습니다. 암기보다 중요한 것은 원리입니다.",
      "visuals": {
        "title": "수열의 합(Sum) 마스터하기",
        "math": "S_n = a_1 + a_2 + \\dots + a_n"
      }
    },
    {
      "step": 2,
      "narration": "먼저 등차수열의 합 공식 유도입니다. 첫째항부터 n항까지의 합 S_n을 나열해 봅시다. 공차가 d인 등차수열이므로 다음과 같이 쓸 수 있습니다.",
      "visuals": {
        "title": "1. 등차수열의 합 (기본 나열)",
        "math": "S_n = a + (a+d) + (a+2d) + \\dots + (l-d) + l"
      }
    },
    {
      "step": 3,
      "narration": "이제 천재 수학자 가우스의 아이디어를 적용합니다. 이 식을 거꾸로 뒤집어서 다시 써보는 것이죠. 끝항 l부터 거꾸로 나열하면 다음과 같습니다.",
      "visuals": {
        "title": "2. 등차수열의 합 (거꾸로 나열)",
        "math": "S_n = l + (l-d) + (l-2d) + \\dots + (a+d) + a"
      }
    },
    {
      "step": 4,
      "narration": "이제 위아래 두 식을 더해볼까요? 놀랍게도 모든 항의 합이 (a+l)로 일정해집니다! 중간의 공차 d들이 서로 상쇄되기 때문입니다.",
      "visuals": {
        "title": "3. 두 식의 합 (상쇄 원리)",
        "math": "2S_n = (a+l) + (a+l) + \\dots + (a+l) \\quad (n\\text{개})"
      }
    },
    {
      "step": 5,
      "narration": "(a+l)이 총 n개 있으므로 2S_n은 n 곱하기 (a+l)이 됩니다. 따라서 2로 나누면 우리가 아는 합 공식이 완성됩니다.",
      "visuals": {
        "title": "4. 등차수열의 합 공식 완성",
        "component": "ArithmeticSumAnimation",
        "math": "S_n = \\frac{n(a+l)}{2} = \\frac{n\\{2a+(n-1)d\\}}{2}"
      }
    },
    {
      "step": 6,
      "narration": "다음은 등비수열의 합 공식 유도입니다. '빼서 소거하기' 전략을 사용합니다. 먼저 합의 식을 나열해 봅시다.",
      "visuals": {
        "title": "5. 등비수열의 합 (기본 나열)",
        "math": "S_n = a + ar + ar^2 + \\dots + ar^{n-1}"
      }
    },
    {
      "step": 7,
      "narration": "양변에 공비 r을 곱해봅시다. 그러면 모든 항의 차수가 하나씩 밀리면서 겹치는 항들이 생기게 됩니다.",
      "visuals": {
        "title": "6. 공비 r 곱하기",
        "math": "rS_n = ar + ar^2 + ar^3 + \\dots + ar^n"
      }
    },
    {
      "step": 8,
      "narration": "이제 첫 번째 식에서 두 번째 식을 뺍니다! 그러면 중간의 모든 항들이 도미노처럼 사라지고 첫 항과 마지막 항만 남게 되죠.",
      "visuals": {
        "title": "7. 식의 뺄셈 (소거 원리)",
        "math": "S_n - rS_n = a - ar^n"
      }
    },
    {
      "step": 9,
      "narration": "좌변을 S_n으로 묶고 우변을 a로 묶은 뒤, (1-r)로 나누어주면 등비수열의 합 공식이 유도됩니다. 단, r이 1이 아닐 때만 가능합니다.",
      "visuals": {
        "title": "8. 등비수열의 합 공식 완성",
        "component": "GeometricSumAnimation",
        "math": "S_n = \\frac{a(1-r^n)}{1-r} = \\frac{a(r^n-1)}{r-1} \\quad (r \\neq 1)"
      }
    },
    {
      "step": 10,
      "narration": "실전 예제입니다. 첫째항이 5, 공차가 2인 등차수열의 제10항까지의 합을 구해봅시다. 공식에 n=10, a=5, d=2를 대입하면 됩니다.",
      "visuals": {
        "title": "예제 1: 등차합 계산",
        "math": "S_{10} = \\frac{10\\{2(5) + 9(2)\\}}{2} = 5(10+18) = 140"
      }
    },
    {
      "step": 11,
      "narration": "두 번째 예제입니다. 첫째항이 1, 공비가 2인 등비수열의 제8항까지의 합은? $2^8-1$을 계산하면 바로 답이 나옵니다.",
      "visuals": {
        "title": "예제 2: 등비합 계산",
        "math": "S_8 = \\frac{1(2^8-1)}{2-1} = 256 - 1 = 255"
      }
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('RE-UPGRADED 등차등비.json with EXPLICT DERIVATION STEPS!');
