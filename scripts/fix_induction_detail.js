import fs from 'fs';

const induct = {
  "id": "수학적귀납법",
  "title": "수학적 귀납법 - 정석 증명과 실전 예제",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "수학적 귀납법의 첫 단추는 n=1일 때 성립함을 보이는 것입니다. 좌변과 우변의 결과가 1로 일치하는지 직접 확인합니다.", "visuals": { "title": "1. 첫째항 성립 증명 (Base Case)", "math": "n=1 \\text{ 일 때,} \\\\ \\text{좌변(LHS)} = 1 \\\\ \\text{우변(RHS)} = \\frac{1(1+1)}{2} = 1 \\\\ \\therefore \\text{LHS = RHS (성립)}" } },
    { "step": 2, "narration": "두 번째 단계는 가정입니다. n=k일 때 주어진 명제가 참이라고 가정하고 식을 세웁니다.", "visuals": { "title": "2. 귀납적 가정 (Assumption)", "math": "n=k \\text{ 일 때, } 1+2+\\dots+k = \\frac{k(k+1)}{2} \\\\ \\text{이 참이라고 가정하자.}" } },
    { "step": 3, "narration": "가장 중요한 유도 단계입니다. 가정된 식의 양변에 k+1을 더하여 n=k+1일 때의 모양을 만들어냅니다.", "visuals": { "title": "3. n=k+1 성립 유도 (Inductive Step)", "math": "\\frac{k(k+1)}{2} + (k+1) = (k+1) \\left( \\frac{k}{2} + 1 \\right) \\\\ = (k+1) \\frac{k+2}{2} = \\frac{(k+1)(k+2)}{2} \\\\ \\implies \\frac{(k+1)\\{(k+1)+1\\}}{2}" } },
    { "step": 4, "narration": "결론입니다. n=1일 때 참이고 n=k일 때 참이면 n=k+1일 때도 참이므로, 모든 자연수에 대해 성립합니다.", "visuals": { "title": "4. 최종 결론 도출", "math": "\\therefore \\text{모든 자연수 n에 대하여 명제는 참이다.}" } },
    { "step": 5, "narration": "부등식 증명 예제입니다. n이 커질수록 2의 거듭제곱이 n보다 압도적으로 커짐을 보여줍니다.", "visuals": { "title": "예제 5. 부등식 증명 (2^n > n)", "math": "n=k \\implies 2^k > k \\\\ n=k+1 \\implies 2^{k+1} = 2 \\cdot 2^k > 2k \\\\ 2k = k+k \\ge k+1 \\quad (k \\ge 1)" } },
    { "step": 6, "narration": "홀수의 합 공식 증명입니다. n=1일 때 1=1의 제곱임을 확인하고 넘어갑니다.", "visuals": { "title": "예제 6. 홀수의 합 증명", "math": "1+3+\\dots+(2n-1) = n^2 \\\\ n=1 \\implies 1 = 1^2 \\quad \\text{(OK)} \\\\ n=k \\implies 1+\\dots+(2k-1) = k^2 \\\\ n=k+1 \\implies k^2 + \\{2(k+1)-1\\} = k^2 + 2k+1 = (k+1)^2" } },
    { "step": 7, "narration": "배수 성질의 증명입니다. k+1일 때의 식에서 k일 때의 식을 분리해내는 것이 포인트입니다.", "visuals": { "title": "예제 7. 배수 증명 (3^{2n}-1)", "math": "3^{2n}-1 \\text{ 이 8의 배수임을 증명} \\\\ n=1 \\implies 3^2-1=8 \\quad \\text{(OK)} \\\\ n=k \\implies 3^{2k}-1 = 8m \\\\ n=k+1 \\implies 3^{2k+2}-1 = 9 \\cdot 3^{2k} - 1 \\\\ = 9(8m+1)-1 = 72m + 8 = 8(9m+1)" } },
    { "step": 8, "narration": "계승(팩토리얼) 부등식 증명입니다. 곱하기 구조를 이용해 크기 관계를 유도합니다.", "visuals": { "title": "예제 8. 팩토리얼 부등식", "math": "2^{n-1} \\le n! \\quad (n \\ge 1) \\\\ n=1 \\implies 2^0 \\le 1! \\implies 1 \\le 1 \\quad \\text{(OK)} \\\\ n=k \\implies 2^{k-1} \\le k! \\\\ n=k+1 \\implies 2^k = 2 \\cdot 2^{k-1} \\le 2 \\cdot k! \\le (k+1) \\cdot k! = (k+1)!" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/수학적귀납법.json', JSON.stringify(induct, null, 2));
console.log('Induction lecture updated with 8 steps and fixed math!');
