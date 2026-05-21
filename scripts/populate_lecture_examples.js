import fs from 'fs';

// 1. 여러가지수열.json (10 Examples)
const vseq = {
  "id": "여러가지수열",
  "title": "여러 가지 수열의 합 완벽 마스터 (10선)",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "부분분수 기초입니다. 분모의 차이를 이용해 항을 쪼개고 소거합니다.", "visuals": { "title": "예제 1: 부분분수 (기본)", "math": "\\sum_{k=1}^n \\frac{1}{k(k+1)} = 1 - \\frac{1}{n+1}" } },
    { "step": 2, "narration": "항의 차이가 2인 부분분수입니다. 앞뒤로 두 개씩 남는 과정에 주의하세요.", "visuals": { "title": "예제 2: 부분분수 (차이 2)", "math": "\\sum_{k=1}^n \\frac{1}{k(k+2)} = \\frac{1}{2}(1+\\frac{1}{2}-\\frac{1}{n+1}-\\frac{1}{n+2})" } },
    { "step": 3, "narration": "무리수열의 유리화입니다. 분모를 유리화하면 인접한 항들이 사라집니다.", "visuals": { "title": "예제 3: 유리화 소거", "math": "\\sum_{k=1}^n \\frac{1}{\\sqrt{k+1}+\\sqrt{k}} = \\sqrt{n+1}-1" } },
    { "step": 4, "narration": "로그의 합은 진수의 곱으로 바뀝니다. 연쇄 약분이 핵심입니다.", "visuals": { "title": "예제 4: 로그 수열의 합", "math": "\\sum_{k=1}^n \\log(1+\\frac{1}{k}) = \\log(n+1)" } },
    { "step": 5, "narration": "몇급수입니다. 등차수열과 등비수열의 곱으로 이루어진 합은 공비를 곱해 뺍니다.", "visuals": { "title": "예제 5: 몇급수의 합", "math": "S = 1\\cdot 2 + 2\\cdot 2^2 + \\dots \\implies S-2S \\text{ 이용}" } },
    { "step": 6, "narration": "군수열입니다. 규칙을 가진 묶음으로 나누어 몇 번째 군의 몇 번째 항인지 찾습니다.", "visuals": { "title": "예제 6: 군수열의 분석", "math": "(1), (1,2), (1,2,3), \\dots" } },
    { "step": 7, "narration": "계차수열입니다. 항 사이의 차이가 수열을 이룰 때의 일반항 구하기입니다.", "visuals": { "title": "예제 7: 계차수열", "math": "a_n = a_1 + \\sum_{k=1}^{n-1} b_k" } },
    { "step": 8, "narration": "주기수열입니다. 일정한 마디가 반복될 때 큰 인덱스의 값을 찾습니다.", "visuals": { "title": "예제 8: 주기를 가진 수열", "math": "a_{n+3} = a_n \\implies a_{100} = a_1" } },
    { "step": 9, "narration": "이중 시그마입니다. 안쪽 문자부터 하나씩 공식에 대입해 나갑니다.", "visuals": { "title": "예제 9: 이중 시그마 계산", "math": "\\sum_{i=1}^n \\sum_{j=1}^i j = \\sum \\frac{i(i+1)}{2}" } },
    { "step": 10, "narration": "분수식 유리화 심화입니다. 공차가 2인 무리수열의 소거 과정을 확인하세요.", "visuals": { "title": "예제 10: 유리화 (심화)", "math": "\\sum \\frac{1}{\\sqrt{2k+1}+\\sqrt{2k-1}}" } }
  ]
};

// 2. 점화식.json (10 Examples)
const recur = {
  "id": "점화식",
  "title": "수열의 귀납적 정의와 점화식 (10선)",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "등차수열 점화식입니다. 차가 일정하면 등차입니다.", "visuals": { "title": "점화식 1: 등차수열", "math": "a_{n+1} = a_n + d" } },
    { "step": 2, "narration": "등비수열 점화식입니다. 비가 일정하면 등비입니다.", "visuals": { "title": "점화식 2: 등비수열", "math": "a_{n+1} = r a_n" } },
    { "step": 3, "narration": "개차수열 형태입니다. n에 대한 식이 더해지면 시그마로 합칩니다.", "visuals": { "title": "점화식 3: 축차합", "math": "a_{n+1} = a_n + f(n)" } },
    { "step": 4, "narration": "변변 곱하기 형태입니다. n에 대한 식이 곱해지면 차례로 곱해 약분합니다.", "visuals": { "title": "점화식 4: 축차곱", "math": "a_{n+1} = f(n) a_n" } },
    { "step": 5, "narration": "알파법입니다. 특성 방정식을 이용해 등비수열 꼴로 변형합니다.", "visuals": { "title": "점화식 5: pa_n + q 꼴", "math": "a_{n+1}-\\alpha = p(a_n-\\alpha)" } },
    { "step": 6, "narration": "역수 치환입니다. 분수 꼴은 역수를 취해 등차수열을 만듭니다.", "visuals": { "title": "점화식 6: 분수 형태", "math": "\\frac{1}{a_{n+1}} = \\frac{1}{a_n} + p" } },
    { "step": 7, "narration": "로그 치환입니다. 지수 꼴은 로그를 취해 등비수열을 만듭니다.", "visuals": { "title": "점화식 7: 지수 형태", "math": "a_{n+1} = a_n^p \\implies \\log a_{n+1} = p \\log a_n" } },
    { "step": 8, "narration": "등차중항 점화식입니다. 세 항 사이의 산술평균 관계입니다.", "visuals": { "title": "점화식 8: 2a_{n+1} = a_n + a_{n+2}", "math": "a_{n+2}-a_{n+1} = a_{n+1}-a_n" } },
    { "step": 9, "narration": "등비중항 점화식입니다. 세 항 사이의 기하평균 관계입니다.", "visuals": { "title": "점화식 9: a_{n+1}^2 = a_n a_{n+2}", "math": "\\frac{a_{n+2}}{a_{n+1}} = \\frac{a_{n+1}}{a_n}" } },
    { "step": 10, "narration": "Sn 포함 점화식입니다. n과 n-1의 차이를 이용해 an을 도출합니다.", "visuals": { "title": "점화식 10: Sn과 an 혼합", "math": "S_n - S_{n-1} = a_n \\quad (n \\ge 2)" } }
  ]
};

// 3. 수학적귀납법.json (5 Examples)
const induct = {
  "id": "수학적귀납법",
  "title": "수학적 귀납법 증명 실전 (5선)",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "자연수 합 공식의 증명입니다. n=k+1일 때 양변의 모양을 맞추는 것이 핵심입니다.", "visuals": { "title": "증명 1: 자연수 합", "math": "\\sum k = \\frac{n(n+1)}{2}" } },
    { "step": 2, "narration": "홀수 합 공식입니다. n=k일 때 성립을 가정하고 k+1번째 홀수를 더합니다.", "visuals": { "title": "증명 2: 홀수 합", "math": "1+3+\\dots+(2n-1) = n^2" } },
    { "step": 3, "narration": "배수 성질 증명입니다. k+1일 때의 식을 k일 때의 식과 나머지의 합으로 쪼갭니다.", "visuals": { "title": "증명 3: 배수 증명", "math": "n^3 - n \\text{ 은 3의 배수}" } },
    { "step": 4, "narration": "부등식 증명의 기본입니다. 가정보다 n=k+1일 때가 더 크다는 것을 보여줍니다.", "visuals": { "title": "증명 4: 2^n > n", "math": "2^{k+1} = 2\\cdot 2^k > 2k \\ge k+1" } },
    { "step": 5, "narration": "베르누이 부등식입니다. h가 양수라는 조건 하에 부등호 방향을 유도합니다.", "visuals": { "title": "증명 5: (1+h)^n \\ge 1+nh", "math": "h>0, n \\ge 1" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/여러가지수열.json', JSON.stringify(vseq, null, 2));
fs.writeFileSync('./public/premium_lectures/점화식.json', JSON.stringify(recur, null, 2));
fs.writeFileSync('./public/premium_lectures/수학적귀납법.json', JSON.stringify(induct, null, 2));

console.log('Lectures updated with massive examples!');
