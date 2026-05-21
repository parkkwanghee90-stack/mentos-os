import fs from 'fs';

const path = './public/premium_lectures/시그마용법.json';
const data = {
  "id": "시그마용법",
  "title": "시그마(Σ)의 성질과 수열의 합",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "여러 항의 합을 기호 하나로 압축하는 마법, 시그마(Σ)를 배워봅시다. 시작 항과 끝 항을 지정하여 합을 나타냅니다.",
      "visuals": {
        "title": "1. 시그마의 정의",
        "math": "\\sum_{k=1}^{n} a_k = a_1 + a_2 + \\cdots + a_n"
      }
    },
    {
      "step": 2,
      "narration": "시그마는 덧셈, 뺄셈, 실수배에 대해서는 자유롭게 분배할 수 있지만, 곱셈과 나눗셈에 대해서는 절대로 분배할 수 없으니 주의하세요!",
      "visuals": {
        "title": "2. 시그마의 기본 성질",
        "math": "\\sum (a_k \\pm b_k) = \\sum a_k \\pm \\sum b_k \\\\ \\sum c \\cdot a_k = c \\sum a_k"
      }
    },
    {
      "step": 3,
      "narration": "반드시 외워야 하는 자연수의 거듭제곱 합 공식입니다. 특히 k의 제곱 공식은 고난도 문제에서 자주 쓰입니다.",
      "visuals": {
        "title": "3. 자연수의 거듭제곱 합",
        "math": "\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2} \\\\ \\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6} \\\\ \\sum_{k=1}^{n} k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2"
      }
    },
    {
      "step": 4,
      "narration": "분수 꼴의 수열의 합을 구하는 '부분분수' 테크닉입니다. 큰 그릇을 작은 두 그릇으로 쪼개서 중간 항들을 싹 소거시키는 전략이죠.",
      "visuals": {
        "title": "4. 부분분수와 소거형 합",
        "math": "\\frac{1}{AB} = \\frac{1}{B-A} \\left( \\frac{1}{A} - \\frac{1}{B} \\right) \\\\ \\sum_{k=1}^{n} \\frac{1}{k(k+1)} = \\sum \\left( \\frac{1}{k} - \\frac{1}{k+1} \\right) = 1 - \\frac{1}{n+1}"
      }
    },
    {
      "step": 5,
      "narration": "근호(루트)가 포함된 경우도 유리화를 통해 마이너스 기호를 만들어낸 뒤, 도미노 소거를 진행합니다.",
      "visuals": {
        "title": "5. 무리수열의 소거형 합",
        "math": "\\sum_{k=1}^{n} \\frac{1}{\\sqrt{k+1} + \\sqrt{k}} = \\sum (\\sqrt{k+1} - \\sqrt{k}) = \\sqrt{n+1} - 1"
      }
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Upgraded 시그마용법.json!');
