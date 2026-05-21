import fs from 'fs';

const sigma = {
  "id": "수열의 합",
  "title": "시그마(Σ) 용법과 수열의 합 - 실전 수치 예제",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "기본적인 시그마 계산입니다. k=1부터 5까지의 일차식 합을 구해봅시다.", "visuals": { "title": "예제 1. 일차식의 합", "math": "\\sum_{k=1}^5 (2k+3) = (2\\cdot 1+3) + (2\\cdot 2+3) + \\dots + (2\\cdot 5+3) \\\\ = 5+7+9+11+13 = 45" } },
    { "step": 2, "narration": "상수항만 있는 경우입니다. 상수가 항의 개수만큼 더해짐을 잊지 마세요.", "visuals": { "title": "예제 2. 상수의 합", "math": "\\sum_{k=1}^{10} 7 = 7+7+7+7+7+7+7+7+7+7 \\\\ = 7 \\times 10 = 70" } },
    { "step": 3, "narration": "자연수 합 공식 n(n+1)/2 를 사용하는 예제입니다.", "visuals": { "title": "예제 3. 자연수 합 공식", "math": "\\sum_{k=1}^{20} k = \\frac{20 \\times 21}{2} = 10 \\times 21 = 210" } },
    { "step": 4, "narration": "거듭제곱 합 공식 n(n+1)(2n+1)/6 을 적용해봅시다.", "visuals": { "title": "예제 4. 제곱의 합 공식", "math": "\\sum_{k=1}^{5} k^2 = \\frac{5 \\times 6 \\times 11}{6} = 5 \\times 11 = 55" } },
    { "step": 5, "narration": "세제곱 합 공식 {n(n+1)/2}^2 을 적용해봅시다.", "visuals": { "title": "예제 5. 세제곱의 합 공식", "math": "\\sum_{k=1}^{4} k^3 = \\left( \\frac{4 \\times 5}{2} \\right)^2 = 10^2 = 100" } },
    { "step": 6, "narration": "중간에서 시작하는 합입니다. 1부터 7까지의 합에서 1부터 2까지의 합을 빼면 됩니다.", "visuals": { "title": "예제 6. 시작점이 1이 아닐 때", "math": "\\sum_{k=3}^7 k = (3+4+5+6+7) \\\\ = \\sum_{k=1}^7 k - \\sum_{k=1}^2 k = \\frac{7\\cdot 8}{2} - \\frac{2\\cdot 3}{2} \\\\ = 28 - 3 = 25" } },
    { "step": 7, "narration": "시그마의 성질을 이용해 식을 분리하여 계산합니다.", "visuals": { "title": "예제 7. 식의 분리 계산", "math": "\\sum_{k=1}^5 (k^2 - k) = \\sum_{k=1}^5 k^2 - \\sum_{k=1}^5 k \\\\ = 55 - 15 = 40" } },
    { "step": 8, "narration": "시그마 안에 등비수열이 들어있는 경우입니다. 등비합 공식을 사용합니다.", "visuals": { "title": "예제 8. 등비수열의 합", "math": "\\sum_{k=1}^4 3^k = 3^1 + 3^2 + 3^3 + 3^4 \\\\ = \\frac{3(3^4-1)}{3-1} = \\frac{3 \\times 80}{2} = 120" } },
    { "step": 9, "narration": "변수 문자가 k가 아닌 i인 경우입니다. 원리는 동일합니다.", "visuals": { "title": "예제 9. 변수 문자의 변경", "math": "\\sum_{i=1}^3 (i^2 + 1) = (1^2+1) + (2^2+1) + (3^2+1) \\\\ = 2 + 5 + 10 = 17" } },
    { "step": 10, "narration": "두 시그마의 차를 이용한 복합 문제입니다. 식을 합쳐서 계산하면 훨씬 빠릅니다.", "visuals": { "title": "예제 10. 시그마의 결합", "math": "\\sum_{k=1}^{10} (k+1)^2 - \\sum_{k=1}^{10} (k^2 - 1) \\\\ = \\sum_{k=1}^{10} \\{(k^2+2k+1) - (k^2-1)\\} \\\\ = \\sum_{k=1}^{10} (2k+2) = 2(55) + 20 = 130" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/수열의합.json', JSON.stringify(sigma, null, 2));
console.log('Sigma lecture updated with 10 deep numeric examples!');
