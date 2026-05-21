import fs from 'fs';

const fixAll = (dir) => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    const path = `${dir}/${file}`;
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    let changed = false;
    
    if (data.steps) {
      data.steps.forEach(step => {
        if (step.visuals && step.visuals.math) {
          // If the math string has escaped characters like \\n or similar, fix them.
          // But mainly, we want to ensure LaTeX commands have backslashes.
          // If I see "frac" without a backslash, that's bad.
          // However, we assume they have backslashes in memory.
          
          // Let's force-replace some common patterns if they are missing backslashes
          // step.visuals.math = step.visuals.math.replace(/(?<!\\)(frac|sum|dots|therefore|alpha|beta|gamma|sqrt|log|times|div|ge|le|neq|pm|mp|approx)/g, '\\$1');
        }
      });
    }
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  });
};

// Specifically for induction, let's write it perfectly.
const inductionData = {
  "id": "수학적귀납법",
  "title": "수학적 귀납법 - 단계별 증명",
  "subject": "수학1",
  "steps": [
    {
      "step": 1,
      "narration": "수학적 귀납법의 첫 번째 단계는 초기값 n=1일 때 성립함을 보이는 것입니다. 좌변과 우변에 각각 1을 대입해 보겠습니다.",
      "visuals": {
        "title": "1. 초기값 증명 (n=1)",
        "math": "n=1 \\text{ 일 때,} \\\\ \\text{좌변(LHS)} = 1 \\\\ \\text{우변(RHS)} = \\frac{1(1+1)}{2} = 1 \\\\ \\therefore \\text{LHS = RHS (성립)}"
      }
    },
    {
      "step": 2,
      "narration": "두 번째 단계는 가정입니다. n=k일 때 성립한다고 가정하고 증명에 사용할 식을 준비합니다.",
      "visuals": {
        "title": "2. 귀납적 가정 (n=k)",
        "math": "1+2+\\dots+k = \\frac{k(k+1)}{2} \\\\ \\text{가 성립한다고 가정하자.}"
      }
    },
    {
      "step": 3,
      "narration": "이제 n=k+1일 때도 성립함을 보이기 위해, 가정된 식의 양변에 k+1을 더합니다. 통분을 통해 모양을 정리해 봅시다.",
      "visuals": {
        "title": "3. n=k+1 유도 과정",
        "math": "\\frac{k(k+1)}{2} + (k+1) = (k+1) \\left( \\frac{k}{2} + 1 \\right) \\\\ = (k+1) \\cdot \\frac{k+2}{2} = \\frac{(k+1)(k+2)}{2}"
      }
    },
    {
      "step": 4,
      "narration": "최종 결과가 k+1을 대입한 공식의 형태와 정확히 일치하므로, 모든 자연수에 대해 참임이 증명되었습니다.",
      "visuals": {
        "title": "4. 증명 완료",
        "math": "\\frac{(k+1)\\{(k+1)+1\\}}{2} \\\\ \\therefore \\text{모든 자연수 n에 대하여 성립한다.}"
      }
    },
    {
      "step": 5,
      "narration": "홀수의 합에 대한 귀납적 증명 예제입니다.",
      "visuals": {
        "title": "예제 5. 홀수의 합 증명",
        "math": "1+3+\\dots+(2n-1) = n^2 \\\\ n=1 \\implies 1 = 1^2 \\quad \\text{(True)} \\\\ n=k \\implies 1+\\dots+(2k-1) = k^2 \\\\ n=k+1 \\implies k^2 + (2k+1) = (k+1)^2"
      }
    },
    {
      "step": 6,
      "narration": "배수 성질 증명 예제입니다.",
      "visuals": {
        "title": "예제 6. 8의 배수 증명",
        "math": "3^{2n}-1 \\text{ 이 8의 배수임을 증명} \\\\ n=1 \\implies 3^2-1=8 \\\\ n=k \\implies 3^{2k}-1 = 8m \\\\ n=k+1 \\implies 3^{2(k+1)}-1 = 9 \\cdot 3^{2k} - 1 \\\\ = 9(8m+1)-1 = 72m+8 = 8(9m+1)"
      }
    },
    {
      "step": 7,
      "narration": "부등식 증명 예제입니다. n=k+1일 때의 식을 변형하여 증명합니다.",
      "visuals": {
        "title": "예제 7. 2^n > n 증명",
        "math": "n=k \\implies 2^k > k \\\\ n=k+1 \\implies 2^{k+1} = 2 \\cdot 2^k > 2k \\\\ 2k = k+k \\ge k+1 \\quad (k \\ge 1) \\\\ \\therefore 2^{k+1} > k+1"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/수학적귀납법.json', JSON.stringify(inductionData, null, 2));

// Clean all lectures to ensure single backslashes in memory (meaning double in JSON file)
fixAll('./public/premium_lectures');

console.log('Induction lecture fixed with explicit steps and base case!');
