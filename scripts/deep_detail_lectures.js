import fs from 'fs';

// 1. 여러가지수열.json (Deeply detailed)
const vseq = {
  "id": "여러가지수열",
  "title": "여러 가지 수열의 합 - 실전 예제 풀이",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "첫 번째 예제입니다. 분모가 1차식의 곱인 부분분수 소거법입니다. 1부터 10까지 대입하여 중간 항들을 지워봅시다.", "visuals": { "title": "예제 1. 부분분수 소거", "math": "\\sum_{k=1}^{10} \\frac{1}{k(k+1)} = \\left(\\frac{1}{1}-\\frac{1}{2}\\right) + \\left(\\frac{1}{2}-\\frac{1}{3}\\right) + \\dots + \\left(\\frac{1}{10}-\\frac{1}{11}\\right) \\\\ = 1 - \\frac{1}{11} = \\frac{10}{11}" } },
    { "step": 2, "narration": "두 번째 예제입니다. 공차가 2인 부분분수입니다. 앞에 1/2이 곱해지고, 항이 두 칸씩 건너뛰며 남습니다.", "visuals": { "title": "예제 2. 부분분수 (차이 2)", "math": "\\sum_{k=1}^{5} \\frac{1}{k(k+2)} = \\frac{1}{2} \\sum_{k=1}^5 \\left(\\frac{1}{k} - \\frac{1}{k+2}\\right) \\\\ = \\frac{1}{2} \\left\\{ \\left(1-\\frac{1}{3}\\right) + \\left(\\frac{1}{2}-\\frac{1}{4}\\right) + \\left(\\frac{1}{3}-\\frac{1}{5}\\right) + \\left(\\frac{1}{4}-\\frac{1}{6}\\right) + \\left(\\frac{1}{5}-\\frac{1}{7}\\right) \\right\\} \\\\ = \\frac{1}{2} \\left(1 + \\frac{1}{2} - \\frac{1}{6} - \\frac{1}{7}\\right) = \\frac{1}{2} \\cdot \\frac{25}{21} = \\frac{25}{42}" } },
    { "step": 3, "narration": "유리화를 이용한 합입니다. 분모의 켤레식을 곱하면 분모가 1이 되어 계산이 아주 쉬워집니다.", "visuals": { "title": "예제 3. 유리화와 소거", "math": "\\sum_{k=1}^{8} \\frac{1}{\\sqrt{k+1}+\\sqrt{k}} = \\sum_{k=1}^{8} (\\sqrt{k+1}-\\sqrt{k}) \\\\ = (\\sqrt{2}-\\sqrt{1}) + (\\sqrt{3}-\\sqrt{2}) + \\dots + (\\sqrt{9}-\\sqrt{8}) \\\\ = \\sqrt{9} - 1 = 3 - 1 = 2" } },
    { "step": 4, "narration": "로그 수열의 합입니다. 로그를 합치면 진수들이 곱하기로 연결되어 도미노처럼 약분됩니다.", "visuals": { "title": "예제 4. 로그 합과 약분", "math": "\\sum_{k=1}^{9} \\log_{10} \\left(\\frac{k+1}{k}\\right) = \\log_{10} \\left( \\frac{2}{1} \\cdot \\frac{3}{2} \\cdot \\frac{4}{3} \\dots \\frac{10}{9} \\right) \\\\ = \\log_{10} 10 = 1" } },
    { "step": 5, "narration": "몇급수 예제입니다. 공비 3을 곱한 뒤 한 칸씩 밀어서 빼면 등비수열의 합만 남게 됩니다.", "visuals": { "title": "예제 5. 몇급수 (S - rS)", "math": "S = 1\\cdot 3^1 + 2\\cdot 3^2 + 3\\cdot 3^3 \\\\ 3S = 1\\cdot 3^2 + 2\\cdot 3^3 + 3\\cdot 3^4 \\\\ S-3S = 3^1 + 3^2 + 3^3 - 3\\cdot 3^4 \\\\ -2S = \\frac{3(3^3-1)}{3-1} - 243 = 39 - 243 = -204 \\implies S=102" } },
    { "step": 6, "narration": "군수열입니다. (1), (2,3), (4,5,6)... 수열에서 10번째 항을 구하려면 항의 개수 누적을 봅니다.", "visuals": { "title": "예제 6. 군수열 분석", "math": "\\text{1군: 1개, 2군: 2개, 3군: 3개} \\\\ \\text{4군 첫 항까지 합: } 1+2+3=6 \\\\ \\text{10번째 항은 4군의 4번째 항} \\\\ \\implies a_{10} = 10" } },
    { "step": 7, "narration": "계차수열입니다. 항 사이의 차이가 2, 4, 6... 으로 늘어날 때 5번째 항을 구해봅시다.", "visuals": { "title": "예제 7. 계차수열 계산", "math": "1, 3, 7, 13, \\dots \\implies b_n = 2n \\\\ a_5 = a_1 + \\sum_{k=1}^4 2k = 1 + 2 \\cdot \\frac{4 \\cdot 5}{2} = 1 + 20 = 21" } },
    { "step": 8, "narration": "주기수열입니다. 1, 0, -1이 반복될 때 100번째 항은 3으로 나눈 나머지를 봅니다.", "visuals": { "title": "예제 8. 주기와 나머지", "math": "a_1=1, a_2=0, a_3=-1, \\dots, a_{n+3}=a_n \\\\ 100 = 3 \\cdot 33 + 1 \\implies a_{100} = a_1 = 1" } },
    { "step": 9, "narration": "이중 시그마입니다. 안쪽부터 차근차근 상수는 밖으로 빼며 계산합니다.", "visuals": { "title": "예제 9. 이중 시그마", "math": "\\sum_{i=1}^3 \\sum_{j=1}^i j = \\sum_{i=1}^3 \\frac{i(i+1)}{2} \\\\ = \\frac{1}{2} + \\frac{3}{2} + \\frac{6}{2} = 0.5 + 1.5 + 3 = 5" } },
    { "step": 10, "narration": "무리수열 심화입니다. 분모 차이가 2인 경우 유리화하면 분모에 2가 남습니다.", "visuals": { "title": "예제 10. 무리수열 (차이 2)", "math": "\\sum_{k=1}^3 \\frac{1}{\\sqrt{2k+1}+\\sqrt{2k-1}} = \\sum_{k=1}^3 \\frac{\\sqrt{2k+1}-\\sqrt{2k-1}}{2} \\\\ = \\frac{1}{2} \\{(\\sqrt{3}-\\sqrt{1}) + (\\sqrt{5}-\\sqrt{3}) + (\\sqrt{7}-\\sqrt{5})\\} \\\\ = \\frac{\\sqrt{7}-1}{2}" } }
  ]
};

// 2. 점화식.json (Deeply detailed)
const recur = {
  "id": "점화식",
  "title": "수열의 점화식 - 숫자 대입과 유도",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "등차 점화식입니다. 첫항이 2이고 공차가 5인 경우 4항을 구해봅시다.", "visuals": { "title": "1. 등차수열", "math": "a_1=2, a_{n+1}=a_n+5 \\\\ a_2=7, a_3=12, a_4=17" } },
    { "step": 2, "narration": "등비 점화식입니다. 첫항이 3이고 공비가 2인 경우 4항입니다.", "visuals": { "title": "2. 등비수열", "math": "a_1=3, a_{n+1}=2a_n \\\\ a_2=6, a_3=12, a_4=24" } },
    { "step": 3, "narration": "축차합 형태입니다. n이 더해질 때 4항까지 나열하여 더해봅시다.", "visuals": { "title": "3. 축차합 (n 더하기)", "math": "a_1=1, a_{n+1}=a_n+n \\\\ a_2=1+1=2, a_3=2+2=4, a_4=4+3=7" } },
    { "step": 4, "narration": "축차곱 형태입니다. n/ (n+1) 이 곱해질 때 4항입니다.", "visuals": { "title": "4. 축차곱 (분수 곱하기)", "math": "a_1=2, a_{n+1}=\\frac{n}{n+1}a_n \\\\ a_4 = 2 \\cdot \\frac{1}{2} \\cdot \\frac{2}{3} \\cdot \\frac{3}{4} = \\frac{2}{4} = 0.5" } },
    { "step": 5, "narration": "알파법입니다. a_{n+1} = 2a_n + 3 꼴에서 알파는 -3이 됩니다. 치환하여 등비수열로 풉니다.", "visuals": { "title": "5. pa_n + q 형태", "math": "a_1=1, a_{n+1}=2a_n+3 \\\\ a_{n+1}+3 = 2(a_n+3) \\\\ a_1+3=4 \\implies a_n+3 = 4\\cdot 2^{n-1} \\\\ a_4+3 = 4 \\cdot 8 = 32 \\implies a_4=29" } },
    { "step": 6, "narration": "역수 점화식입니다. 역수를 취하면 공차가 2인 등차수열이 됨을 확인하세요.", "visuals": { "title": "6. 분수 점화식", "math": "a_1=1, a_{n+1}=\\frac{a_n}{2a_n+1} \\implies \\frac{1}{a_{n+1}} = \\frac{1}{a_n}+2 \\\\ \\frac{1}{a_1}=1, \\frac{1}{a_2}=3, \\frac{1}{a_3}=5 \\implies a_3=0.2" } },
    { "step": 7, "narration": "지수 점화식입니다. 제곱이 될 때 로그를 취하면 등비수열이 됩니다.", "visuals": { "title": "7. 지수 점화식", "math": "a_1=10, a_{n+1}=a_n^2 \\implies \\log a_{n+1} = 2 \\log a_n \\\\ \\log a_1=1, \\log a_2=2, \\log a_3=4 \\implies a_3=10^4" } },
    { "step": 8, "narration": "등차중항 꼴입니다. 1항과 2항이 주어지면 모든 항이 결정됩니다.", "visuals": { "title": "8. 등차중항", "math": "a_1=1, a_2=3, 2a_{n+1}=a_n+a_{n+2} \\implies d=2 \\\\ a_3=5, a_4=7" } },
    { "step": 9, "narration": "등비중항 꼴입니다. 비가 일정한 것을 확인하세요.", "visuals": { "title": "9. 등비중항", "math": "a_1=2, a_2=6, a_{n+1}^2=a_n a_{n+2} \\implies r=3 \\\\ a_3=18, a_4=54" } },
    { "step": 10, "narration": "Sn과 an의 혼합형입니다. an+1을 an으로 표현하는 과정입니다.", "visuals": { "title": "10. Sn 관계식", "math": "S_n = 3a_n - 2 \\\\ S_{n-1} = 3a_{n-1} - 2 \\\\ a_n = 3a_n - 3a_{n-1} \\implies 2a_n = 3a_{n-1} \\\\ a_n = \\frac{3}{2}a_{n-1}" } }
  ]
};

// 3. 수학적귀납법.json (Complete logical proof)
const induct = {
  "id": "수학적귀납법",
  "title": "수학적 귀납법 - 단계별 증명",
  "subject": "수학1",
  "steps": [
    { "step": 1, "narration": "자연수 합 공식 증명입니다. n=1일 때 좌변과 우변이 1로 같음을 먼저 확인합니다.", "visuals": { "title": "1. 초기값 증명 (n=1)", "math": "\\text{LHS: } 1 \\\\ \\text{RHS: } \\frac{1(1+1)}{2} = 1 \\\\ \\implies \\text{LHS = RHS (True)}" } },
    { "step": 2, "narration": "가정 단계입니다. n=k일 때 공식이 성립한다고 믿고 식을 써둡니다.", "visuals": { "title": "2. 가정 단계 (n=k)", "math": "1+2+\\dots+k = \\frac{k(k+1)}{2} \\text{ 라고 가정하자.}" } },
    { "step": 3, "narration": "핵심 유도 과정입니다. 양변에 k+1을 더하여 k+1번째 모양을 만듭니다. 통분을 통해 공통인수를 묶어내는 과정이 중요합니다.", "visuals": { "title": "3. 유도 과정 (n=k+1)", "math": "\\frac{k(k+1)}{2} + (k+1) = (k+1) \\left( \\frac{k}{2} + 1 \\right) \\\\ = (k+1) \\left( \\frac{k+2}{2} \\right) = \\frac{(k+1)(k+2)}{2}" } },
    { "step": 4, "narration": "결론입니다. n=k+1일 때도 공식의 형태가 완벽하게 유지되므로 모든 자연수 n에 대해 성립합니다.", "visuals": { "title": "4. 결론 도출", "math": "\\frac{(k+1)\\{(k+1)+1\\}}{2} \\\\ \\implies \\text{n=k+1 일 때도 성립!}" } },
    { "step": 5, "narration": "부등식 증명 예제입니다. 2^n > n 임을 보여줍니다. k+1번째가 k번째의 2배임을 이용합니다.", "visuals": { "title": "5. 부등식 증명 (2^n > n)", "math": "n=k \\implies 2^k > k \\text{ 가정} \\\\ n=k+1 \\implies 2^{k+1} = 2 \\cdot 2^k > 2k \\\\ 2k = k+k \\ge k+1 \\quad (k \\ge 1) \\\\ \\therefore 2^{k+1} > k+1" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/여러가지수열.json', JSON.stringify(vseq, null, 2));
fs.writeFileSync('./public/premium_lectures/점화식.json', JSON.stringify(recur, null, 2));
fs.writeFileSync('./public/premium_lectures/수학적귀납법.json', JSON.stringify(induct, null, 2));

console.log('Lectures updated with DEEP calculation details!');
