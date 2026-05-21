import fs from 'fs';

const lectures = [
  {
    "id": "여러가지수열",
    "filename": "여러가지수열.json",
    "data": {
      "id": "여러가지수열",
      "title": "여러 가지 수열의 합 (소거법과 분수꼴)",
      "subject": "수학1",
      "steps": [
        {
          "step": 1,
          "narration": "기본적인 등차, 등비수열을 넘어선 다양한 형태의 수열의 합을 구해봅시다. 핵심은 '지워지는 꼴'로 만드는 것입니다.",
          "visuals": {
            "title": "여러 가지 수열의 합 개요",
            "math": "S_n = \\sum_{k=1}^{n} a_k"
          }
        },
        {
          "step": 2,
          "narration": "첫 번째는 분수 꼴의 수열입니다. 부분분수 분해 공식을 사용하여 이웃한 항들이 마이너스로 연결되게 만듭니다.",
          "visuals": {
            "title": "1. 부분분수를 이용한 합",
            "math": "\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1} \\\\ \\implies S_n = (1-\\frac{1}{2}) + (\\frac{1}{2}-\\frac{1}{3}) + \\dots = 1 - \\frac{1}{n+1}"
          }
        },
        {
          "step": 3,
          "narration": "두 번째는 근호(루트)가 포함된 수열입니다. 분모를 유리화하면 역시 마이너스 기호가 생기며 항들이 소거됩니다.",
          "visuals": {
            "title": "2. 무리수열의 합 (유리화)",
            "math": "\\frac{1}{\\sqrt{k+1}+\\sqrt{k}} = \\sqrt{k+1} - \\sqrt{k} \\\\ \\implies S_n = (\\sqrt{2}-1) + (\\sqrt{3}-\\sqrt{2}) + \\dots = \\sqrt{n+1} - 1"
          }
        },
        {
          "step": 4,
          "narration": "로그가 포함된 수열의 합은 로그의 성질을 이용해 진수들의 곱으로 바꿉니다. 분자와 분모가 약분되면서 간단해지죠.",
          "visuals": {
            "title": "3. 로그 수열의 합",
            "math": "\\sum \\log(1 + \\frac{1}{k}) = \\sum \\log(\\frac{k+1}{k}) \\\\ = \\log(\\frac{2}{1} \\cdot \\frac{3}{2} \\cdot \\dots \\cdot \\frac{n+1}{n}) = \\log(n+1)"
          }
        }
      ]
    }
  },
  {
    "id": "점화식",
    "filename": "점화식.json",
    "data": {
      "id": "점화식",
      "title": "수열의 귀납적 정의 (점화식)",
      "subject": "수학1",
      "steps": [
        {
          "step": 1,
          "narration": "수열을 정의할 때 첫째항과 이웃하는 항들 사이의 관계식을 주는 것을 점화식이라고 합니다.",
          "visuals": {
            "title": "점화식의 정의",
            "math": "a_{n+1} = f(a_n)"
          }
        },
        {
          "step": 2,
          "narration": "기본 점화식인 등차와 등비 꼴입니다. 차가 일정하면 등차, 비가 일정하면 등비수열입니다.",
          "visuals": {
            "title": "1. 기본 점화식",
            "math": "a_{n+1} = a_n + d \\implies \\text{등차} \\\\ a_{n+1} = r a_n \\implies \\text{등비}"
          }
        },
        {
          "step": 3,
          "narration": "더해지는 값이 상수가 아닌 n에 대한 식인 경우입니다. $a_{n+1} = a_n + f(n)$ 꼴은 축차대입 후 변변 더해서 일반항을 구합니다.",
          "visuals": {
            "title": "2. 개차수열 꼴",
            "math": "a_n = a_1 + \\sum_{k=1}^{n-1} f(k)"
          }
        },
        {
          "step": 4,
          "narration": "곱해지는 값이 n에 대한 식인 경우입니다. $a_{n+1} = a_n \\cdot f(n)$ 꼴은 변변 곱해서 약분합니다.",
          "visuals": {
            "title": "3. 곱셈 형태의 점화식",
            "math": "a_n = a_1 \\cdot f(1) \\cdot f(2) \\dots f(n-1)"
          }
        },
        {
          "step": 5,
          "narration": "가장 유명한 변형 꼴인 $a_{n+1} = p a_n + q$ 입니다. $\\alpha$를 이용해 등비수열 형태로 치환하여 풉니다.",
          "visuals": {
            "title": "4. 특수 점화식 (알파법)",
            "math": "a_{n+1} - \\alpha = p(a_n - \\alpha) \\quad (\\alpha = \\frac{q}{1-p})"
          }
        }
      ]
    }
  },
  {
    "id": "수학적귀납법",
    "filename": "수학적귀납법.json",
    "data": {
      "id": "수학적귀납법",
      "title": "수학적 귀납법 (증명의 기술)",
      "subject": "수학1",
      "steps": [
        {
          "step": 1,
          "narration": "수학적 귀납법은 모든 자연수에 대해 명제가 참임을 증명하는 '도미노' 전략입니다.",
          "visuals": {
            "title": "수학적 귀납법의 논리",
            "math": "\\text{1. } n=1 \\text{ 확인} \\\\ \\text{2. } n=k \\text{ 가정 } \\to n=k+1 \\text{ 증명}"
          }
        },
        {
          "step": 2,
          "narration": "등식의 증명 예제입니다. 자연수의 합 공식을 귀납법으로 증명해 봅시다. 양변에 k+1을 더하는 과정이 핵심입니다.",
          "visuals": {
            "title": "예제 1. 등식의 증명",
            "math": "\\sum k = \\frac{n(n+1)}{2}"
          }
        },
        {
          "step": 3,
          "narration": "부등식의 증명은 조금 더 까다롭습니다. $n=k$ 일 때의 가정보다 $n=k+1$ 일 때의 식이 더 작음을 대소 비교를 통해 보여줍니다.",
          "visuals": {
            "title": "예제 2. 부등식의 증명",
            "math": "(1+h)^n > 1+nh \\quad (h>0, n \\geq 2)"
          }
        }
      ]
    }
  }
];

lectures.forEach(lec => {
  fs.writeFileSync(`./public/premium_lectures/${lec.filename}`, JSON.stringify(lec.data, null, 2));
  console.log(`Created ${lec.filename}`);
});
