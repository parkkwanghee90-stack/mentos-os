import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
const statsList = conceptData['확률과통계'];

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data_binomial.json', 'utf8')).content;

const idx = statsList.findIndex(x => x.id === "이항분포");
if (idx !== -1) {
  statsList[idx].content = detailedContent;
  statsList[idx].title = "마법의 이항분포 완벽 마스터";
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

const lectureData = {
  id: "이항분포",
  title: "마법의 이항분포 B(n, p) 마스터",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 이번 시간엔 확률과 통계에서 가장 고맙고 사랑스러운 마법의 파트, <blue>이항분포</blue>를 배울 거야. 왜 사랑스럽냐고? 귀찮게 표를 그릴 필요가 전~혀 없거든!",
      visuals: { title: "이항분포", math: "X \\sim B(n, p)" }
    },
    {
      step: 2,
      narration: "독립시행을 여러 번 반복할 때 일어나는 횟수를 변수 X라고 하면, 이걸 이항분포라고 불러. 알파벳 B 안에 전체 반복 횟수 n과 한 번 일어날 확률 p만 쏙 적어주면 돼!",
      visuals: { title: "이항분포의 기호", math: "\\text{Binomial Distribution } B(n, p) \\\\ \\text{n: 시행 횟수, p: 한 번의 확률}" }
    },
    {
      step: 3,
      narration: "이항분포가 마법인 이유는 공식이 너무 간단하기 때문이야. <blue>평균은 두 개를 곱한 np</blue>, <red>분산은 거기에 실패 확률 q를 곱한 npq</red>란다. 왜 이렇게 쉬운 공식이 나오는지 선생님이 표를 통해 직관적으로 증명해 줄게!",
      visuals: { title: "이항분포의 공식", math: "E(X) = np \\\\ V(X) = npq \\; \\text{ (단, } q=1-p \\text{)}" }
    },
    {
      step: 4,
      narration: "어려운 공식 말고, 동전 1개를 던질 때를 상상해 보자. 앞면이 나올 확률이 p라면, 평균적으로 몇 번 나올까? 당연히 1 곱하기 p해서 p번 나오겠지!",
      visuals: { title: "1번 던질 때의 기댓값 (표)", math: "\\begin{array}{|c|c|c|c|} \\hline X_1 & 1(\\text{성공}) & 0(\\text{실패}) & \\text{합계} \\\\ \\hline P & p & 1-p & 1 \\\\ \\hline \\end{array} \\\\ \\implies E(X_1) = 1 \\times p + 0 \\times (1-p) = p" }
    },
    {
      step: 5,
      narration: "그럼 동전을 n번 던진다는 건 뭘까? 똑같은 동전 던지기를 n번 연속으로 더하는 거랑 똑같아! 한 번 던질 때 평균이 p니까, 이걸 n번 더하면 자연스럽게 평균은 np가 되는 거지! 엄청 직관적이지?",
      visuals: { title: "n번 던질 때 기댓값의 증명", math: "\\begin{aligned} X &= X_1 + X_2 + \\cdots + X_n \\\\ E(X) &= E(X_1) + E(X_2) + \\cdots + E(X_n) \\\\ &= p + p + \\cdots + p = np \\end{aligned}" }
    },
    {
      step: 6,
      narration: "분산도 똑같아! 1번 던졌을 때의 분산은 '제평평제'로 구하면 p 빼기 p제곱, 즉 p(1-p)가 돼. এটাকে q라고 하면 pq지! 이걸 n번 더하니까 전체 분산은 깔끔하게 <red>npq</red>가 나오는 거란다!",
      visuals: { title: "분산의 증명", math: "\\begin{aligned} V(X_1) &= E(X_1^2) - \\{E(X_1)\\}^2 = p - p^2 = pq \\\\ V(X) &= V(X_1) + \\cdots + V(X_n) \\\\ &= pq + pq + \\cdots + pq = npq \\end{aligned}" }
    },
    {
      step: 7,
      narration: "자, 완벽하게 증명했으니 이제 실전 예제 5개를 부숴보자! 예제 1번! 100번을 던지는데 한 번의 확률이 5분의 1이야. 평균과 분산을 구해볼까?",
      visuals: { title: "예제 1: 기본 평균과 분산", math: "\\begin{array}{l} \\text{\\textbf{Q.} } X \\sim B\\left(100, \\frac{1}{5}\\right) \\text{ 일 때, } E(X)\\text{와 } V(X)\\text{는?} \\end{array}" }
    },
    {
      step: 8,
      narration: "평균은 두 개를 곱한 100 곱하기 1/5이라서 20이야! 분산은 여기서 실패할 확률 4/5를 한 번 더 곱해주면 되니까 20 곱하기 4/5를 해서 16이 정답이란다!",
      visuals: { title: "예제 1 풀이", math: "\\begin{array}{l} E(X) = 100 \\times \\frac{1}{5} = 20 \\\\ \\\\ V(X) = 20 \\times \\frac{4}{5} = 16 \\end{array}" }
    },
    {
      step: 9,
      narration: "예제 2번! 이번엔 거꾸로 평균이 15, 분산이 6이라고 줬어. 이때 전체 횟수 n을 구하는 문제야. 연립방정식을 아주 살짝만 쓰면 돼!",
      visuals: { title: "예제 2: 역으로 n, p 추론하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } E(X)=15, \\; V(X)=6 \\text{ 일 때, n의 값은?} \\end{array}" }
    },
    {
      step: 10,
      narration: "평균인 np가 15니까, 분산 공식 npq에서 np 대신 15를 넣으면 15q가 6이 되지! 그럼 q는 2/5고 자연히 p는 3/5이 돼. np=15에 p를 넣으면 n은 25가 정답!",
      visuals: { title: "예제 2 풀이", math: "\\begin{array}{l} np = 15 \\,, \\quad npq = 6 \\\\ \\implies 15q = 6 \\implies q = \\frac{2}{5} \\implies p = \\frac{3}{5} \\\\ \\implies n \\times \\frac{3}{5} = 15 \\implies n = 25 \\end{array}" }
    },
    {
      step: 11,
      narration: "예제 3번! 실생활 문제야. 자유투 성공률이 60%인 선수가 50번을 던졌어. 이때 성공 횟수 X의 <green>표준편차</green>를 구해보자.",
      visuals: { title: "예제 3: 실생활 실전 응용", math: "\\begin{array}{l} \\text{\\textbf{Q.} 자유투 확률 60\\%, 50번 던질 때} \\\\ \\text{성공 횟수의 표준편차 } \\sigma(X) \\text{는?} \\end{array}" }
    },
    {
      step: 12,
      narration: "먼저 이항분포 기호로 바꾸면 B(50, 3/5)지! 분산은 50 곱하기 3/5 곱하기 2/5를 해서 12가 나와. 표준편차는 분산에 루트를 씌우면 되니까 정답은 루트 12, 즉 2루트3!",
      visuals: { title: "예제 3 풀이", math: "\\begin{array}{l} X \\sim B\\left(50, \\frac{3}{5}\\right) \\\\ \\\\ V(X) = 50 \\times \\frac{3}{5} \\times \\frac{2}{5} = 12 \\\\ \\implies \\sigma(X) = \\sqrt{12} = 2\\sqrt{3} \\end{array}" }
    },
    {
      step: 13,
      narration: "예제 4번! 앞에서 배웠던 '확률변수의 변환'과 결합된 문제야! 이항분포에서 구한 분산에 -2X+3 변환을 시켰네. 어떻게 푸는지 기억나지?",
      visuals: { title: "예제 4: 확률변수 변환의 콜라보", math: "\\begin{array}{l} \\text{\\textbf{Q.} } X \\sim B\\left(36, \\frac{1}{3}\\right) \\text{ 일 때, } V(-2X+3) \\text{은?} \\end{array}" }
    },
    {
      step: 14,
      narration: "먼저 분산 V(X)를 구하면 36 * 1/3 * 2/3 = 8이야. V(-2X+3)은 뒤의 3은 무시하고, 앞의 -2를 제곱해서 원래 분산에 곱해주면 돼! 4 곱하기 8은 32가 정답!",
      visuals: { title: "예제 4 풀이", math: "\\begin{array}{l} V(X) = 36 \\times \\frac{1}{3} \\times \\frac{2}{3} = 8 \\\\ \\\\ V(-2X+3) = (-2)^2 V(X) = 4 \\times 8 = 32 \\end{array}" }
    },
    {
      step: 15,
      narration: "마지막 예제 5번! 갑자기 독립시행 확률 공식을 던져주고 평균을 구하라고 해. 복잡하게 계산하라는 게 아니야! <blue>독립시행 공식이 곧 이항분포</blue>라는 사실을 눈치채라는 문제지!",
      visuals: { title: "예제 5: 확률식과의 연결", math: "\\begin{array}{l} \\text{\\textbf{Q.} } P(X=x) = {}_{72}\\mathrm{C}_{x} \\left(\\frac{1}{6}\\right)^x \\left(\\frac{5}{6}\\right)^{72-x} \\text{일 때,} \\\\ \\text{평균 } E(X) \\text{의 값은?} \\end{array}" }
    },
    {
      step: 16,
      narration: "식을 딱 보고 '아하! 총 72번 던졌고 한 번 확률이 1/6인 이항분포구나!' 라고 캐치해서 B(72, 1/6)로 바꿔치기해야 해. 그러면 평균은 72 곱하기 1/6로 순식간에 12가 나온단다. 정말 재밌지?",
      visuals: { title: "예제 5 풀이", math: "\\begin{array}{l} \\text{독립시행의 식 } \\implies X \\sim B\\left(72, \\frac{1}{6}\\right) \\\\ \\\\ \\implies E(X) = 72 \\times \\frac{1}{6} = 12 \\end{array}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/이항분포.json', JSON.stringify(lectureData, null, 2));
console.log('Update completed for binomial distribution!');
