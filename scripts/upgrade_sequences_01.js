import fs from 'fs';

const path = './public/premium_lectures/등차등비.json';
const data = {
  "id": "등차등비",
  "title": "등차수열과 등비수열 완벽 정리",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "수열의 가장 기초가 되는 등차수열에 대해 알아봅시다. 일정한 수를 계속 더해서 만들어지는 수열입니다. 이때 더해지는 일정한 수를 공차(common difference)라고 합니다.",
      "visuals": {
        "title": "1. 등차수열의 정의와 일반항",
        "math": "a_n = a_1 + (n-1)d"
      }
    },
    {
      "step": 2,
      "narration": "등차수열의 합 공식은 어떻게 유도될까요? 가우스의 천재적인 아이디어를 살펴봅시다. 수열을 거꾸로 써서 더하면 모든 항이 (첫항+끝항)으로 일정해진다는 원리를 이용합니다.",
      "visuals": {
        "title": "2. 등차수열의 합 유도 과정",
        "component": "ArithmeticSumAnimation",
        "math": "S_n = \\frac{n(a+l)}{2} = \\frac{n\\{2a+(n-1)d\\}}{2}"
      }
    },
    {
      "step": 3,
      "narration": "실전 예제입니다. 제3항이 8이고 제7항이 20인 등차수열의 제10항을 구해봅시다. 항의 차이를 이용해 공차를 먼저 찾는 것이 포인트입니다.",
      "visuals": {
        "title": "예제: 등차수열의 일반항 찾기",
        "math": "a_7 - a_3 = 4d = 12 \\implies d = 3 \\\\ a_3 = a + 2(3) = 8 \\implies a = 2 \\\\ \\therefore a_{10} = 2 + 9(3) = 29"
      }
    },
    {
      "step": 4,
      "narration": "다음은 등비수열입니다. 일정한 수를 계속 곱해서 만들어지는 수열입니다. 이때 곱해지는 일정한 수를 공비(common ratio)라고 합니다.",
      "visuals": {
        "title": "3. 등비수열의 정의와 일반항",
        "math": "a_n = a_1 \\cdot r^{n-1}"
      }
    },
    {
      "step": 5,
      "narration": "등비수열의 합 공식 유도는 '빼서 소거하기' 전략을 사용합니다. 합의 식에 공비를 곱한 뒤 원래 식에서 빼주면, 중간 항들이 도미노처럼 사라집니다.",
      "visuals": {
        "title": "4. 등비수열의 합 유도 과정",
        "component": "GeometricSumAnimation",
        "math": "S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\neq 1)"
      }
    },
    {
      "step": 6,
      "narration": "예제를 풀어볼까요? 첫째항이 2, 공비가 3인 등비수열의 제5항까지의 합을 구해봅시다. 공식에 그대로 대입만 하면 됩니다.",
      "visuals": {
        "title": "예제: 등비수열의 합 계산",
        "math": "S_5 = \\frac{2(3^5 - 1)}{3 - 1} = \\frac{2(243 - 1)}{2} = 242"
      }
    },
    {
      "step": 7,
      "narration": "등차중항과 등비중항의 성질입니다. 세 수 a, b, c가 수열을 이룰 때 가운데 항은 양옆 항의 산술평균(등차) 또는 기하평균(등비)이 됩니다.",
      "visuals": {
        "title": "5. 수열의 중앙항 성질",
        "math": "\\text{등차중항: } 2b = a + c \\\\ \\text{등비중항: } b^2 = ac"
      }
    },
    {
      "step": 8,
      "narration": "마지막으로 수열의 합 S_n과 일반항 a_n의 관계입니다. n항까지의 합에서 n-1항까지의 합을 빼면 n번째 항만 남는다는 지극히 당연하지만 강력한 원리입니다. 단, 첫째항은 따로 확인해야 합니다.",
      "visuals": {
        "title": "6. S_n과 a_n의 관계",
        "math": "a_n = S_n - S_{n-1} \\quad (n \\geq 2) \\\\ a_1 = S_1"
      }
    },
    {
      "step": 9,
      "narration": "실전 팁! S_n이 n에 대한 이차식(상수항 없음)이면 그 수열은 무조건 등차수열입니다. 상수항이 있다면 둘째항부터 등차수열을 이룹니다.",
      "visuals": {
        "title": "실전 팁: S_n의 형태 분석",
        "math": "S_n = An^2 + Bn \\implies a_n \\text{ 은 등차수열} \\\\ \\text{공차 } d = 2A, \\text{ 첫째항 } a = A+B"
      }
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Upgraded 등차등비.json!');
