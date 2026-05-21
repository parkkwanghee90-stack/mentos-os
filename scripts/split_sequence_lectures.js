import fs from 'fs';

const arithmeticData = {
  "id": "등차수열",
  "title": "등차수열 완벽 마스터 (일반항과 합)",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "안녕하세요! 오늘은 등차수열의 일반항과 합, 그리고 합 공식이 가지는 이차식으로서의 성질을 완벽하게 파헤쳐 보겠습니다.",
      "visuals": {
        "title": "등차수열 (Arithmetic Sequence)",
        "math": "a_n = a + (n-1)d"
      }
    },
    {
      "step": 2,
      "narration": "등차수열의 일반항은 n에 대한 일차식입니다. n의 계수가 곧 공차 d라는 점을 기억하세요.",
      "visuals": {
        "title": "1. 일반항의 성질",
        "math": "a_n = dn + (a-d)"
      }
    },
    {
      "step": 3,
      "narration": "등차중항 성질입니다. 세 수 x, y, z가 등차수열이면 가운데의 2배가 양 끝의 합과 같습니다.",
      "visuals": {
        "title": "2. 등차중항",
        "math": "2y = x + z"
      }
    },
    {
      "step": 4,
      "narration": "가장 중요한 합 공식 Sn입니다. 가우스의 원리를 이용하여 유도하며, 두 가지 형태로 암기해야 합니다.",
      "visuals": {
        "title": "3. 등차수열의 합 (Sn)",
        "component": "ArithmeticSumAnimation",
        "math": "S_n = \\frac{n(a+l)}{2} = \\frac{n\\{2a+(n-1)d\\}}{2}"
      }
    },
    {
      "step": 5,
      "narration": "Sn을 전개하면 An^2 + Bn 꼴의 이차식이 됩니다. 여기서 상수항이 0이면 첫째항부터 등차수열이고, 상수항이 있으면 둘째항부터 등차수열입니다.",
      "visuals": {
        "title": "4. Sn의 분석 (이차식과 상수항)",
        "math": "S_n = An^2 + Bn + C \\\\ \\begin{cases} C=0 & \\implies \\text{제1항부터 등차} \\\\ C \\neq 0 & \\implies \\text{제2항부터 등차} \\end{cases}"
      }
    },
    {
      "step": 6,
      "narration": "실전 예제 5가지를 풀어봅시다. 첫째항과 공차 구하기부터 Sn 분석까지 하나씩 확인해 보세요.",
      "visuals": {
        "title": "5. 실전 예제 (5선)",
        "math": "1. a_1=3, d=2 \\to a_{10}=21 \\\\ 2. a_3=10, a_7=22 \\to d=3 \\\\ 3. S_n=n^2+2n \\to a_n=2n+1 \\\\ 4. S_n=n^2+2n+1 \\to a_1=4, a_n=2n+1(n\\ge 2) \\\\ 5. x, 10, 16 \\to x=4"
      }
    }
  ]
};

const geometricData = {
  "id": "등비수열",
  "title": "등비수열의 모든 것 (일반항과 합)",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "등비수열입니다. 일정한 비율로 커지는 등비수열의 일반항과 합 공식을 유도하고 예제를 풀어봅시다.",
      "visuals": {
        "title": "등비수열 (Geometric Sequence)",
        "math": "a_n = a \\cdot r^{n-1}"
      }
    },
    {
      "step": 2,
      "narration": "등비수열의 합 공식 유도입니다. Sn에서 rSn을 빼는 '도미노 소거법'을 사용합니다.",
      "visuals": {
        "title": "1. 등비합 유도 원리",
        "component": "GeometricSumAnimation",
        "math": "S_n - rS_n = a - ar^n"
      }
    },
    {
      "step": 3,
      "narration": "최종 합 공식입니다. 공비 r이 1보다 크냐 작으냐에 따라 편리한 식을 선택합니다.",
      "visuals": {
        "title": "2. 등비수열의 합 공식",
        "math": "S_n = \\frac{a(r^n-1)}{r-1} = \\frac{a(1-r^n)}{1-r} \\quad (r \\neq 1)"
      }
    },
    {
      "step": 4,
      "narration": "실전 예제 5가지입니다. 일반항과 합, 그리고 실생활 응용(원리합계 기초)을 확인하세요.",
      "visuals": {
        "title": "3. 실전 예제 (5선)",
        "math": "1. a_1=2, r=3 \\to a_4=54 \\\\ 2. a_2=6, a_5=48 \\to r=2 \\\\ 3. a_1=1, r=2, S_n=127 \\to n=7 \\\\ 4. 4, x, 9 \\to x=6 \\\\ 5. a=5, r=1 \\to S_{10}=50"
      }
    }
  ]
};

const sigmaData = {
  "id": "수열의 합",
  "title": "시그마(Σ)의 성질과 자연수의 합",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "여러 가지 수열의 합을 기호 하나로 나타내는 시그마에 대해 배웁니다.",
      "visuals": {
        "title": "시그마(Σ)의 정의",
        "math": "\\sum_{k=1}^{n} a_k = a_1 + a_2 + \\dots + a_n"
      }
    },
    {
      "step": 2,
      "narration": "시그마의 선형성 성질입니다. 덧셈과 뺄셈, 실수배는 분리할 수 있지만 곱셈은 불가능합니다.",
      "visuals": {
        "title": "1. 시그마의 성질",
        "math": "\\sum (ca_k + db_k) = c\\sum a_k + d\\sum b_k"
      }
    },
    {
      "step": 3,
      "narration": "반드시 암기해야 할 자연수 거듭제곱 합 3종 세트입니다.",
      "visuals": {
        "title": "2. 거듭제곱 합 공식",
        "math": "\\sum k = \\frac{n(n+1)}{2} \\\\ \\sum k^2 = \\frac{n(n+1)(2n+1)}{6} \\\\ \\sum k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2"
      }
    },
    {
      "step": 4,
      "narration": "실전 예제 5가지입니다. 공식 대입과 성질 활용 능력을 키워봅시다.",
      "visuals": {
        "title": "3. 실전 예제 (5선)",
        "math": "1. \\sum (2k-1) = 100 (k=1..10) \\\\ 2. \\sum k^2 = 55 (k=1..5) \\\\ 3. \\sum 3 = 30 (k=1..10) \\\\ 4. \\sum (k^2+k) = 70 (k=1..5) \\\\ 5. \\sum \\frac{1}{k(k+1)} = 1 - \\frac{1}{n+1}"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/등차수열.json', JSON.stringify(arithmeticData, null, 2));
fs.writeFileSync('./public/premium_lectures/등비수열.json', JSON.stringify(geometricData, null, 2));
fs.writeFileSync('./public/premium_lectures/수열의합.json', JSON.stringify(sigmaData, null, 2));

console.log('Split sequences into separate files!');
