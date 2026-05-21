import fs from 'fs';

// 1. Update the Premium Lecture JSON
const sigmaLecture = {
  "id": "수열의 합",
  "title": "시그마(Σ)의 완벽 이해와 활용",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "시그마는 더하기를 압축한 기호입니다. 나열된 숫자를 시그마로, 시그마를 다시 나열된 숫자로 바꾸는 연습이 기본입니다.",
      "visuals": {
        "title": "1. 시그마와 나열의 상호 변환",
        "math": "1 + 2 + 3 + 4 + 5 \\iff \\sum_{k=1}^{5} k \\\\ 2 + 4 + 8 + \\dots + 2^n \\iff \\sum_{k=1}^{n} 2^k"
      }
    },
    {
      "step": 2,
      "narration": "시그마에서 사용하는 문자는 이름일 뿐입니다. k를 쓰든 i를 쓰든 j를 쓰든 결과는 동일합니다.",
      "visuals": {
        "title": "2. 인덱스 문자의 독립성",
        "math": "\\sum_{k=1}^{n} a_k = \\sum_{i=1}^{n} a_i = \\sum_{j=1}^{n} a_j"
      }
    },
    {
      "step": 3,
      "narration": "항상 1부터 시작할 필요는 없습니다. 중간 항부터 시작하는 경우, 전체 합에서 앞부분을 빼는 방식으로 계산하면 편리합니다.",
      "visuals": {
        "title": "3. 중간 항부터 시작하는 합",
        "math": "\\sum_{k=m}^{n} a_k = a_m + a_{m+1} + \\dots + a_n \\\\ = \\sum_{k=1}^{n} a_k - \\sum_{k=1}^{m-1} a_k"
      }
    },
    {
      "step": 4,
      "narration": "시그마의 성질입니다. 상수배와 덧셈, 뺄셈은 자유롭게 분리 가능하지만, 곱셈과 나눗셈은 절대 분리할 수 없습니다.",
      "visuals": {
        "title": "4. 시그마의 성질 (선형성)",
        "math": "\\sum (c a_k + d b_k) = c \\sum a_k + d \\sum b_k \\\\ \\text{주의: } \\sum (a_k b_k) \\neq (\\sum a_k)(\\sum b_k)"
      }
    },
    {
      "step": 5,
      "narration": "필수 암기 공식인 거듭제곱 합입니다. 특히 k의 제곱 공식은 분모가 6이라는 점에 주의하세요.",
      "visuals": {
        "title": "5. 거듭제곱 합 공식",
        "math": "\\sum_{k=1}^n k = \\frac{n(n+1)}{2} \\\\ \\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6} \\\\ \\sum_{k=1}^n k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2"
      }
    },
    {
      "step": 6,
      "narration": "실전 예제입니다. 4항부터 10항까지의 합을 구하는 과정을 보세요. 전체 S10에서 S3를 빼면 되겠죠?",
      "visuals": {
        "title": "6. 실전 계산 예제",
        "math": "\\sum_{k=4}^{10} (2k) = 2 \\sum_{k=1}^{10} k - 2 \\sum_{k=1}^{3} k \\\\ = 2(55) - 2(6) = 110 - 12 = 98"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/수열의합.json', JSON.stringify(sigmaLecture, null, 2));

// 2. Update the Dynamic Concept Card
const path = './public/concept_cards/dynamic_concepts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const sigmaConcept = {
  "id": "seq_sigma_01_final_v2",
  "unit": "수열",
  "title": "시그마(Σ)의 정의와 심화 계산",
  "content": "### 1. 시그마와 나열의 변환\n- **나열 $\\to$ 시그마:** 규칙을 찾아 일반항 $a_k$를 구하고 범위를 지정합니다.\n  - 예: $3, 5, 7, \\dots, 21 \\implies \\sum_{k=1}^{10} (2k+1)$\n- **시그마 $\\to$ 나열:** $k$에 숫자를 차례로 대입하여 더합니다.\n\n### 2. 시작점이 1이 아닐 때 ($k=m$)\n$$\\sum_{k=m}^{n} a_k = S_n - S_{m-1}$$\n1부터 시작하는 공식들을 적용하기 위해 반드시 거쳐야 하는 과정입니다.\n\n### 3. 문자의 독립성\n$\\sum_{k=1}^{n} f(k)$ 에서 $k$는 단순한 '더미 변수'입니다. \n$\\sum_{i=1}^{n} f(i)$ 나 $\\sum_{j=1}^{n} f(j)$ 와 결과가 완벽히 동일합니다.\n\n### 4. 거듭제곱 공식 예제\n- $\\sum_{k=1}^{10} k = 55$\n- $\\sum_{k=1}^{10} k^2 = 385$\n- $\\sum_{k=1}^{10} k^3 = 3025$"
};

const existingIdx = data.findIndex(c => c.title.includes("시그마") && c.unit === "수열");
if (existingIdx !== -1) {
  data[existingIdx] = sigmaConcept;
} else {
  data.push(sigmaConcept);
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Detailed Sigma lecture and card updated!');
