import fs from 'fs';

const path = './public/premium_lectures/수열의합.json';
const data = {
  "id": "수열의 합",
  "title": "등차·등비수열의 합 유도와 시그마(Σ)",
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
      "narration": "이제 시그마 기호입니다. 여러 항의 합을 기호 하나로 압축하는 마법, 시그마(Σ)를 배워봅시다. 시작 항과 끝 항을 지정하여 합을 나타냅니다.",
      "visuals": {
        "title": "9. 시그마(Σ)의 정의",
        "math": "\\sum_{k=1}^{n} a_k = a_1 + a_2 + \\dots + a_n"
      }
    },
    {
      "step": 11,
      "narration": "반드시 외워야 하는 자연수의 거듭제곱 합 공식입니다. 특히 k의 제곱 공식은 고난도 문제에서 자주 쓰입니다.",
      "visuals": {
        "title": "10. 자연수의 거듭제곱 합",
        "math": "\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2} \\\\ \\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6} \\\\ \\sum_{k=1}^{n} k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2"
      }
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Created dedicated 수열의합.json!');
