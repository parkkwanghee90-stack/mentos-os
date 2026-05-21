import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
const statsList = conceptData['확률과통계'];

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data_normal.json', 'utf8')).content;

const idx = statsList.findIndex(x => x.id === "정규분포");
if (idx !== -1) {
  statsList[idx].content = detailedContent;
  statsList[idx].title = "가우스와 정규분포 마스터 특강";
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

const lectureData = {
  id: "정규분포",
  title: "수능 출제 1순위: 정규분포 완벽 분석",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 드디어 수능에서 가장 많이 나오고, 가장 중요한 <blue>정규분포</blue> 파트에 도착했어. 키, 몸무게, 성적 같은 자연계의 데이터는 모아보면 항상 종 모양의 예쁜 곡선을 그린단다.",
      visuals: { title: "정규분포 (Normal Distribution)", math: "X \\sim N(m, \\sigma^2)" }
    },
    {
      step: 2,
      narration: "이 완벽하고 부드러운 종 모양 곡선을 나타내는 함수를 <green>가우스 함수</green>라고 불러. 식이 엄청 복잡하게 생겼지만 외울 필요는 없어! 그냥 곡선의 정체를 나타내는 수학자 가우스의 걸작이라고만 알아두자.",
      visuals: { title: "가우스 함수", math: "f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-m)^2}{2\\sigma^2}}" }
    },
    {
      step: 3,
      narration: "이 종 모양 곡선의 <blue>대칭축이자 가장 높은 산봉우리</blue>는 항상 평균 m에 위치해. 그리고 곡선의 모양은 오직 <red>분산(시그마 제곱)</red>만이 결정한단다.",
      visuals: { title: "정규분포 곡선의 성질", math: "\\text{평균 } m \\text{ 에 대하여 완벽한 좌우 대칭}" }
    },
    {
      step: 4,
      narration: "만약 분산이 커지면 어떻게 될까? 분산이 크다는 건 점수들이 평균에 안 모이고 사방팔방으로 흩어져 있다는 뜻이야! 그러면 산봉우리가 깎여서 <blue>높이는 낮아지고 양옆으로 뚱뚱하게 퍼진 모양</blue>이 돼!",
      visuals: { title: "분산이 커질 때의 변화", math: "\\sigma^2 \\uparrow \\implies \\text{높이는 낮아지고 양옆으로 넙적해짐}" }
    },
    {
      step: 5,
      narration: "반대로 분산이 작아지면? 데이터가 평균에 똘똘 뭉쳐있다는 뜻이니까 산봉우리가 엄청 <green>뾰족하고 높아지겠지!</green> 전체 확률 면적은 무조건 1이어야 하니까 모양이 변하면 높이도 변하는 거야.",
      visuals: { title: "분산이 작아질 때의 변화", math: "\\sigma^2 \\downarrow \\implies \\text{평균에 밀집하여 뾰족하고 높아짐}" }
    },
    {
      step: 6,
      narration: "이제 모든 정규분포를 비교할 수 있는 절대 기준, <blue>표준정규분포 N(0, 1)</blue>을 소개할게. 여기서 쓰이는 Z값은 '평균에서 표준편차 시그마(σ) 몇 칸만큼 떨어져 있냐'를 뜻해.",
      visuals: { title: "표준정규분포 N(0, 1^2)", math: "Z = \\frac{X - m}{\\sigma} \\quad (\\text{표준화 공식})" }
    },
    {
      step: 7,
      narration: "놀라운 통계의 마법! Z가 1일 때, 즉 평균에서 좌우로 1시그마 구간에는 전체 데이터의 68%가 몰려있어. Z가 2인 구간에는 무려 95.4%가 몰려있고, Z가 3인 구간엔 99.7%가 들어있지! 거의 모든 인간이 이 안에 들어가는 거야.",
      visuals: { title: "68-95-99.7 법칙", math: "\\begin{array}{l} P(-1 \\le Z \\le 1) \\approx 0.6826 \\\\ P(-2 \\le Z \\le 2) \\approx 0.9544 \\\\ P(-3 \\le Z \\le 3) \\approx 0.9974 \\end{array}" }
    },
    {
      step: 8,
      narration: "그럼 도대체 왜 이런 <green>표준화 작업(Z)</green>이 필요할까? 재미있는 글로벌 샐러리맨 예시를 들어줄게. 한국, 일본, 미국의 직장인 3명이 있어. 이 중에서 '진짜' 돈을 제일 잘 버는 사람은 누굴까?",
      visuals: { title: "왜 표준화를 시킬까?", math: "\\text{\\textbf{Q.} 서로 다른 환경의 집단을 공정하게 비교하려면?}" }
    },
    {
      step: 9,
      narration: "한국의 평균 월급은 300, 시그마는 50이야. 여기서 철수는 400을 받아. 표준화 공식에 넣으면 Z값은 (400-300) 나누기 50이니까 <red>+2.0</red>이야. 즉, 철수는 상위 2% 안에 드는 엄청난 엘리트라는 뜻이지!",
      visuals: { title: "한국의 철수", math: "Z_{\\text{철수}} = \\frac{400 - 300}{50} = +2.0 \\implies \\text{상위 2.28\\%}" }
    },
    {
      step: 10,
      narration: "일본의 평균 월급은 400, 시그마는 100이야. 켄지는 550을 받아. 철수보다 150이나 많이 받네? 하지만 Z값을 구해보면 (550-400)/100 = <blue>+1.5</blue>야. 철수보다 서열이 낮아!",
      visuals: { title: "일본의 켄지", math: "Z_{\\text{켄지}} = \\frac{550 - 400}{100} = +1.5 \\implies \\text{상위 6.68\\%}" }
    },
    {
      step: 11,
      narration: "미국의 존슨은 무려 800을 받아! 하지만 미국은 평균이 600에 시그마가 200이라 부자가 엄청 많아. Z값을 구하면 (800-600)/200 = <green>+1.0</green>밖에 안 돼. 절대 액수는 1등이지만, 나라 안에서는 그냥 평범하게 잘 버는 수준인 거지.",
      visuals: { title: "미국의 존슨", math: "Z_{\\text{존슨}} = \\frac{800 - 600}{200} = +1.0 \\implies \\text{상위 15.87\\%}" }
    },
    {
      step: 12,
      narration: "이게 바로 <blue>Z값의 위력</blue>이야! 단위도 다르고 상황도 다른 두 집단을 공정하게 계급장 떼고 비교할 수 있게 만들어주지. 수능에서 A과목, B과목 성적 비교할 때 100% 출제된단다!",
      visuals: { title: "표준화의 위력", math: "\\text{상대적 위상: 철수(1등) } > \\text{ 켄지(2등) } > \\text{ 존슨(3등)}" }
    },
    {
      step: 13,
      narration: "그리고 정말 소름 돋는 사실 하나 알려줄까? 앞에서 배웠던 <green>이항분포 B(n,p)</green> 기억나지? 시행 횟수 n이 엄청 커지면, 그 막대그래프들이 점점 부드러워지면서 완벽한 정규분포 종 모양 곡선으로 변신해!",
      visuals: { title: "이항분포와 정규분포의 마법", math: "n\\text{이 충분히 클 때, } B(n, p) \\approx N(np, npq)" }
    },
    {
      step: 14,
      narration: "이게 바로 그 유명한 라플라스 정리야. 독립시행 확률을 100번 200번 계산할 수 없으니까, 평균 np와 분산 npq를 구해서 정규분포로 쓱 바꿔버리는 엄청난 스킬이지! 잠시 후에 예제로 만나보자.",
      visuals: { title: "정규분포로 변신!", math: "E(X)=np \\,, \\quad V(X)=npq \\implies X \\sim N(np, npq)" }
    },
    {
      step: 15,
      narration: "자, 이제 정규분포가 빚어내는 <blue>실전 예제 10가지</blue>를 모두 다른 유형으로 만나볼 거야. 준비됐지? 첫 번째, Z값으로 바꿔서 표 읽기 연습!",
      visuals: { title: "실전 예제 10선 훈련 시작!", math: "\\text{10가지 필수 유형 마스터하기}" }
    },
    {
      step: 16,
      narration: "예제 1번! 평균 50, 시그마 10일 때, X가 50에서 70 사이일 확률은? 50은 평균이니까 Z가 0이고, 70은 10이 두 번 간 거니까 Z가 2지! 표에서 0부터 2까지의 확률 0.4772를 찾으면 끝!",
      visuals: { title: "예제 1: 기본 확률 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } X \\sim N(50, 10^2) \\text{일 때, } P(50 \\le X \\le 70)\\text{은?} \\\\ \\\\ \\implies P\\left(\\frac{50-50}{10} \\le Z \\le \\frac{70-50}{10}\\right) \\\\ = P(0 \\le Z \\le 2) = 0.4772 \\end{array}" }
    },
    {
      step: 17,
      narration: "예제 2번! 상위 10%의 커트라인 점수를 구하래. 표를 보니 상위 10%에 해당하는 Z값이 1.28이야. 내 점수 x에서 평균 60을 빼고 5로 나눈 게 1.28이 되어야 하니까, x는 66.4점이 정답!",
      visuals: { title: "예제 2: 커트라인 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } X \\sim N(60, 5^2) \\text{일 때, 상위 10\\% 커트라인 점수는?} \\\\ \\text{(단, } P(0 \\le Z \\le 1.28) = 0.4 \\text{)} \\\\ \\\\ \\implies \\frac{x-60}{5} = 1.28 \\implies x = 66.4\\text{점} \\end{array}" }
    },
    {
      step: 18,
      narration: "예제 3번! 아까 샐러리맨 예시와 똑같아. 평균 60인 A과목에서 80점, 평균 50에 분산이 큰 B과목에서 80점. A의 Z값은 +2.0, B의 Z값은 +1.5니까 묻지도 따지지도 않고 A과목을 더 잘 본 거야!",
      visuals: { title: "예제 3: 성적 비교하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } A\\sim N(60, 10^2) \\text{ 80점 vs } B\\sim N(50, 20^2) \\text{ 80점} \\\\ \\\\ \\implies Z_A = \\frac{80-60}{10} = 2.0 \\\\ \\implies Z_B = \\frac{80-50}{20} = 1.5 \\\\ \\implies A\\text{과목을 상대적으로 더 잘 봄!} \\end{array}" }
    },
    {
      step: 19,
      narration: "예제 4번! 주사위를 무려 720번이나 던진대! 이항분포 B(720, 1/6)이지? 이걸 정규분포로 바꾸면 평균은 120, 분산은 100이니까 N(120, 10제곱)으로 변신! 그런 다음 평소처럼 Z값으로 확률을 구하면 된단다.",
      visuals: { title: "예제 4: 이항분포의 정규분포 근사", math: "\\begin{array}{l} \\text{\\textbf{Q.} 주사위 720번 중 1의 눈이 130\\~140번 나올 확률?} \\\\ \\\\ X \\sim B\\left(720, \\frac{1}{6}\\right) \\implies X \\sim N(120, 10^2) \\\\ P(130 \\le X \\le 140) = P(1 \\le Z \\le 2) \\end{array}" }
    },
    {
      step: 20,
      narration: "예제 5번! X가 40 이하일 확률과 60 이상일 확률이 완벽히 똑같대. 정규분포는 종 모양 대칭이잖아? 그럼 40과 60의 딱 정중앙 한가운데에 무조건 평균이 있어야 해! 그래서 평균은 50!",
      visuals: { title: "예제 5: 대칭성 활용하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } P(X \\le 40) = P(X \\ge 60) \\text{ 일 때, 평균 m은?} \\\\ \\\\ \\implies \\text{종 모양 완벽 대칭이므로} \\\\ m = \\frac{40+60}{2} = 50 \\end{array}" }
    },
    {
      step: 21,
      narration: "예제 6번! 어떤 확률이 0.8413이래. 이건 절반인 0.5에다가 0.3413을 더한 거잖아? 0.3413은 Z가 1일 때니까, (70-m) 나누기 10이 딱 1이 되어야 한다는 뜻이야. 그래서 평균은 60!",
      visuals: { title: "예제 6: 미지수 추론하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } P(X \\le 70) = 0.8413, \\sigma=10 \\text{ 일 때, m은?} \\\\ \\text{(단, } P(0 \\le Z \\le 1) = 0.3413 \\text{)} \\\\ \\\\ \\implies \\frac{70-m}{10} = 1 \\implies m = 60 \\end{array}" }
    },
    {
      step: 22,
      narration: "예제 7번! 절댓값이 포함된 확률이야. X와 50의 차이가 8 이하라는 건, X가 평균 50을 기준으로 위아래 8칸 안에 있다는 뜻이지! 즉 Z가 -2에서 +2 사이라는 뜻이라서 확률은 0.9544가 된단다.",
      visuals: { title: "예제 7: 절댓값 구간의 확률", math: "\\begin{array}{l} \\text{\\textbf{Q.} } X \\sim N(50, 4^2) \\text{ 일 때, } P(|X-50| \\le 8)\\text{은?} \\\\ \\\\ \\implies P(-8 \\le X-50 \\le 8) \\\\ = P(-2 \\le Z \\le 2) = 0.9544 \\end{array}" }
    },
    {
      step: 23,
      narration: "예제 8번! 10000명이 시험을 보는데 상위 2.28%만 합격한대. 그럼 합격자 수는 몇 명일까? 전체 인원수에 합격 확률을 곱해주기만 하면 228명이라는 기댓값이 나오지!",
      visuals: { title: "예제 8: 합격자 인원수 기댓값", math: "\\begin{array}{l} \\text{\\textbf{Q.} 10000명 응시, 합격 조건 } Z \\ge 2 \\text{ 일 때 합격자 수는?} \\\\ \\text{(단, } P(Z \\ge 2) = 0.0228 \\text{)} \\\\ \\\\ \\implies 10000 \\times 0.0228 = 228\\text{명} \\end{array}" }
    },
    {
      step: 24,
      narration: "예제 9번! 구간의 길이가 일정할 때, 확률 면적이 최대가 되려면 어떻게 해야 할까? 당연히 가장 불룩 튀어나온 산봉우리, 즉 평균을 정중앙에 품고 있어야 확률이 제일 크겠지? 그래서 양 끝값의 한가운데가 평균이 되어야 해!",
      visuals: { title: "예제 9: 확률이 최대가 되는 구간", math: "\\begin{array}{l} \\text{\\textbf{Q.} 구간의 길이 10일 때, } P(a \\le X \\le a+10) \\text{가 최대이려면?} \\\\ \\\\ \\implies \\text{구간 정중앙에 평균 m이 위치해야 함!} \\\\ \\implies \\frac{a + (a+10)}{2} = m \\implies a+5 = m \\end{array}" }
    },
    {
      step: 25,
      narration: "마지막 10번! 정말 기발한 문제야. 두 확률 변수 X와 Y가 평균은 같은데 분산이 달라. 이때 어느 쪽의 솟은 산봉우리가 더 높을까? 당연히 분산이 작아서 오밀조밀 모여있는 쪽의 산봉우리가 더 높겠지! 분산과 그래프의 관계를 묻는 단골 문제란다.",
      visuals: { title: "예제 10: 두 그래프의 겹침 해석", math: "\\begin{array}{l} \\text{\\textbf{Q.} } E(X) = E(Y), \\; V(X) < V(Y) \\text{ 일 때 모양 비교?} \\\\ \\\\ \\implies X\\text{의 분포가 평균에 더 밀집되어 있으므로,} \\\\ \\text{가운데 봉우리가 } X\\text{가 } Y\\text{보다 더 높다!} \\end{array}" }
    },
    {
      step: 26,
      narration: "어때? 정말 내용이 많았지만 이것만 다 숙지하면 수능 정규분포 4점짜리 문제도 거뜬히 풀어낼 수 있어! 정규분포의 마법은 여기까지야. 정말 수고 많았어!",
      visuals: { title: "정규분포 마스터 완료!", math: "\\text{Congratulations!}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/정규분포.json', JSON.stringify(lectureData, null, 2));
console.log('Deeply expanded Normal Distribution lecture created!');
