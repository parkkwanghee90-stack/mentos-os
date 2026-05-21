import fs from 'fs';

const path = './public/concept_cards/dynamic_concepts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Common search keywords to ensure visibility across all sequence units
const commonKeywords = "등차 등비 시그마 여러가지수열 수열의합 귀납적 수학적귀납법 수열 2단계 3단계 4단계";

const variousSeqExamples = [
  { "id": "vseq_ex_01", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열1] 부분분수 (기본)", "content": "### 문제: $\\sum_{k=1}^{n} \\frac{1}{k(k+1)}$\n**풀이:** $\\frac{1}{k} - \\frac{1}{k+1}$ 로 분해 후 소거 $\\implies 1 - \\frac{1}{n+1}$" },
  { "id": "vseq_ex_02", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열2] 부분분수 (차이 2)", "content": "### 문제: $\\sum_{k=1}^{n} \\frac{1}{k(k+2)}$\n**풀이:** $\\frac{1}{2}(\\frac{1}{k} - \\frac{1}{k+2})$ 로 분해. 앞의 2개, 뒤의 2개 항이 남음." },
  { "id": "vseq_ex_03", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열3] 무리수열의 합", "content": "### 문제: $\\sum \\frac{1}{\\sqrt{k+1}+\\sqrt{k}}$\n**풀이:** 유리화하면 $\\sqrt{k+1}-\\sqrt{k}$ 가 되어 소거됨." },
  { "id": "vseq_ex_04", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열4] 로그의 합", "content": "### 문제: $\\sum \\log(1 + \\frac{1}{k})$\n**풀이:** $\\log(\\frac{k+1}{k})$ 이므로 진수의 곱으로 약분됨." },
  { "id": "vseq_ex_05", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열5] 몇급수 (등차x등비)", "content": "### 문제: $1\\cdot 2 + 2\\cdot 2^2 + 3\\cdot 2^3 + \\dots$\n**풀이:** $S - rS$ 를 이용하여 등비수열의 합으로 변형." },
  { "id": "vseq_ex_06", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열6] 군수열 (Group Seq)", "content": "### 문제: (1), (1,2), (1,2,3), ... 에서 50번째 항은?\n**풀이:** 각 군의 항 개수 합이 50에 가까운 지점 찾기." },
  { "id": "vseq_ex_07", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열7] 계차수열 기초", "content": "### 문제: $1, 2, 4, 7, 11, \\dots$ 일반항\n**풀이:** 차이가 $1, 2, 3, 4$ 이므로 $a_n = 1 + \\sum_{k=1}^{n-1} k$." },
  { "id": "vseq_ex_08", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열8] 주기수열", "content": "### 문제: $a_{n+3} = a_n$ 이고 $a_1=1, a_2=2, a_3=3$ 일 때 $a_{100}$\n**풀이:** $100 = 3\\cdot 33 + 1$ 이므로 $a_{100}=a_1=1$." },
  { "id": "vseq_ex_09", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열9] 이중 시그마", "content": "### 문제: $\\sum_{i=1}^{n} \\sum_{j=1}^{i} j$\n**풀이:** 안쪽 시그마 $\\frac{i(i+1)}{2}$ 계산 후 바깥쪽 시그마 계산." },
  { "id": "vseq_ex_10", "unit": "수열", "source_file": commonKeywords, "title": "[여러가지수열10] 분수식 유리화(심화)", "content": "### 문제: $\\sum \\frac{1}{\\sqrt{2k+1}+\\sqrt{2k-1}}$\n**풀이:** 유리화 후 공차가 2인 항들의 소거 과정 확인." }
];

const recurrenceExamples = [
  { "id": "recur_ex_01", "unit": "수열", "source_file": commonKeywords, "title": "[점화식1] 등차수열 꼴", "content": "### $a_{n+1} = a_n + 3$\n**해설:** 공차가 3인 등차수열입니다. $a_n = a_1 + (n-1)3$." },
  { "id": "recur_ex_02", "unit": "수열", "source_file": commonKeywords, "title": "[점화식2] 등비수열 꼴", "content": "### $a_{n+1} = 2a_n$\n**해설:** 공비가 2인 등비수열입니다. $a_n = a_1 \\cdot 2^{n-1}$." },
  { "id": "recur_ex_03", "unit": "수열", "source_file": commonKeywords, "title": "[점화식3] 개차수열 꼴", "content": "### $a_{n+1} = a_n + n$\n**해설:** 변변 더하기(축차대입) $\\implies a_n = a_1 + \\sum_{k=1}^{n-1} k$." },
  { "id": "recur_ex_04", "unit": "수열", "source_file": commonKeywords, "title": "[점화식4] 변변 곱하기 꼴", "content": "### $a_{n+1} = \\frac{n+1}{n} a_n$\n**해설:** 변변 곱하기 $\\implies a_n = a_1 \\cdot (\\frac{2}{1} \\cdot \\frac{3}{2} \\dots \\frac{n}{n-1}) = n a_1$." },
  { "id": "recur_ex_05", "unit": "수열", "source_file": commonKeywords, "title": "[점화식5] 알파법 (p a_n + q)", "content": "### $a_{n+1} = 2a_n + 1$\n**해설:** $a_{n+1}+1 = 2(a_n+1)$ 로 변형. $(a_n+1)$은 공비 2인 등비수열." },
  { "id": "recur_ex_06", "unit": "수열", "source_file": commonKeywords, "title": "[점화식6] 역수 치환 꼴", "content": "### $a_{n+1} = \\frac{a_n}{2a_n + 1}$\n**해설:** 역수를 취하면 $\\frac{1}{a_{n+1}} = \\frac{1}{a_n} + 2$. 등차수열 형태가 됨." },
  { "id": "recur_ex_07", "unit": "수열", "source_file": commonKeywords, "title": "[점화식7] 로그 치환 꼴", "content": "### $a_{n+1} = a_n^2$\n**해설:** 로그를 취하면 $\\log a_{n+1} = 2 \\log a_n$. 등비수열 형태가 됨." },
  { "id": "recur_ex_08", "unit": "수열", "source_file": commonKeywords, "title": "[점화식8] 등차중항 꼴", "content": "### $2a_{n+1} = a_n + a_{n+2}$\n**해설:** 세 항이 등차수열을 이룸을 의미합니다." },
  { "id": "recur_ex_09", "unit": "수열", "source_file": commonKeywords, "title": "[점화식9] 등비중항 꼴", "content": "### $a_{n+1}^2 = a_n a_{n+2}$\n**해설:** 세 항이 등비수열을 이룸을 의미합니다." },
  { "id": "recur_ex_10", "unit": "수열", "source_file": commonKeywords, "title": "[점화식10] 합 Sn 포함 꼴", "content": "### $S_n = 2a_n - 1$\n**해설:** $S_{n-1}$을 빼서 $a_n$만의 점화식으로 유도합니다." }
];

const inductionExamples = [
  { "id": "induct_ex_01", "unit": "수학적귀납법", "source_file": commonKeywords, "title": "[귀납법1] 자연수 합 증명", "content": "### 명제: $\\sum k = \\frac{n(n+1)}{2}$\n**과정:** $n=1$ 성립 확인 $\\to n=k$ 가정 $\\to$ 양변에 $(k+1)$ 더하여 $n=k+1$ 유도." },
  { "id": "induct_ex_02", "unit": "수학적귀납법", "source_file": commonKeywords, "title": "[귀납법2] 홀수의 합 증명", "content": "### 명제: $1+3+\\dots+(2n-1) = n^2$\n**과정:** $n=k$ 일 때 $k^2$ 가정 $\\to (2k+1)$ 더하면 $(k+1)^2$ 됨을 확인." },
  { "id": "induct_ex_03", "unit": "수학적귀납법", "source_file": commonKeywords, "title": "[귀납법3] 배수 증명", "content": "### 명제: $n^3 - n$ 은 3의 배수\n**과정:** $(k+1)^3 - (k+1) = (k^3-k) + 3(k^2+k)$ 로 변형하여 증명." },
  { "id": "induct_ex_04", "unit": "수학적귀납법", "source_file": commonKeywords, "title": "[귀납법4] 부등식 증명", "content": "### 명제: $2^n > n$\n**과정:** $n=k$ 일 때 $2^k > k$ 가정 $\\to 2^{k+1} = 2 \\cdot 2^k > 2k \\geq k+1$ 임을 보여줌." },
  { "id": "induct_ex_05", "unit": "수학적귀납법", "source_file": commonKeywords, "title": "[귀납법5] 베르누이 부등식", "content": "### 명제: $(1+h)^n \\geq 1+nh$\n**과정:** $(1+h)^{k+1} = (1+h)^k(1+h) \\geq (1+kh)(1+h) = 1+(k+1)h + kh^2 \\geq 1+(k+1)h$." }
];

[...variousSeqExamples, ...recurrenceExamples, ...inductionExamples].forEach(newCard => {
  const idx = data.findIndex(c => c.id === newCard.id);
  if (idx !== -1) data[idx] = newCard; else data.push(newCard);
});

// Also update the 3 main sequence cards to have common keywords
const mainCards = ["등차수열", "등비수열", "수열의 합"];
data.forEach(card => {
  if (mainCards.includes(card.title) || card.title.includes("3. 등차수열의 합")) {
    card.source_file = commonKeywords;
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('25 New Sequence examples added with ROBUST KEYWORDS for filtering!');
