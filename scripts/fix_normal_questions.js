import fs from 'fs';

const p = './public/premium_lectures/정규분포.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

d.steps[15].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q1.} 어느 농장의 사과 1개의 무게 } X\\text{는 평균이 50g,} \\\\ \\text{표준편차가 10g인 정규분포를 따른다. 임의로 고른} \\\\ \\text{사과 1개의 무게가 50g 이상 70g 이하일 확률은?} \\\\ \\\\ \\implies P(50 \\le X \\le 70) = P\\left(\\frac{50-50}{10} \\le Z \\le \\frac{70-50}{10}\\right) \\\\ = P(0 \\le Z \\le 2) = 0.4772 \\end{array}";

d.steps[16].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q2.} 어느 입사 시험 점수 } X\\text{는 평균 60점, 표준편차 5점인} \\\\ \\text{정규분포를 따른다. 합격 정원이 상위 10\\%일 때,} \\\\ \\text{합격하기 위한 최저 점수(커트라인)는?} \\\\ \\text{(단, } P(0 \\le Z \\le 1.28) = 0.4 \\text{)} \\\\ \\\\ \\implies P(Z \\ge 1.28) = 0.1 \\implies \\frac{x-60}{5} = 1.28 \\implies x = 66.4\\text{점} \\end{array}";

d.steps[17].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q3.} 철수는 수학 } N(60, 10^2)\\text{에서 80점을,} \\\\ \\text{영어 } N(50, 20^2)\\text{에서 80점을 받았다.} \\\\ \\text{어느 과목에서 상대적으로 더 우수한 성취를 보였는가?} \\\\ \\\\ \\implies Z_A = \\frac{80-60}{10} = 2.0 \\,, \\quad Z_B = \\frac{80-50}{20} = 1.5 \\\\ \\implies Z\\text{값이 더 큰 수학 과목을 더 잘 봄!} \\end{array}";

d.steps[18].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q4.} 어떤 주사위를 720번 던질 때,} \\\\ \\text{1의 눈이 나오는 횟수가 130번 이상 140번 이하일} \\\\ \\text{확률을 표준정규분포표를 이용하여 구하시오.} \\\\ \\\\ X \\sim B\\left(720, \\frac{1}{6}\\right) \\implies X \\sim N(120, 10^2) \\text{ 로 근사!} \\\\ P(130 \\le X \\le 140) = P(1 \\le Z \\le 2) \\end{array}";

d.steps[19].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q5.} 어느 고등학교 남학생들의 키 } X\\text{가 정규분포를 따른다.} \\\\ \\text{키가 140cm 이하일 확률과 160cm 이상일 확률이} \\\\ \\text{같다면, 이 학교 남학생들의 평균 키 } m\\text{은?} \\\\ \\\\ \\implies P(X \\le 140) = P(X \\ge 160) \\text{ 이므로 완벽한 대칭!} \\\\ \\implies m = \\frac{140+160}{2} = 150\\text{cm} \\end{array}";

d.steps[20].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q6.} 어떤 빵 1개의 무게 } X\\text{는 표준편차가 10g인} \\\\ \\text{정규분포를 따른다. 무게가 70g 이하일 확률이} \\\\ \\text{0.8413일 때, 빵의 평균 무게 } m\\text{을 구하시오.} \\\\ \\text{(단, } P(0 \\le Z \\le 1) = 0.3413 \\text{)} \\\\ \\\\ \\implies 0.5 + 0.3413 = P(Z \\le 1) \\implies \\frac{70-m}{10} = 1 \\implies m = 60\\text{g} \\end{array}";

d.steps[21].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q7.} 어떤 배터리의 수명 } X\\text{는 평균이 50시간, 표준편차가} \\\\ \\text{4시간인 정규분포를 따른다. 임의로 고른 배터리의 수명과} \\\\ \\text{평균의 차이가 8시간 이하일 확률은?} \\\\ \\\\ \\implies P(|X-50| \\le 8) = P(-8 \\le X-50 \\le 8) \\\\ = P(-2 \\le Z \\le 2) = 0.9544 \\end{array}";

d.steps[22].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q8.} 어느 시험에 10,000명이 응시하였다. 점수가 정규분포를 따르고,} \\\\ \\text{표준화된 } Z\\text{값이 2 이상인 사람만 합격한다고 할 때,} \\\\ \\text{예상되는 합격자 수는?} \\text{(단, } P(Z \\ge 2) = 0.0228 \\text{)} \\\\ \\\\ \\implies 10000 \\times P(Z \\ge 2) = 10000 \\times 0.0228 = 228\\text{명} \\end{array}";

d.steps[23].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q9.} 어떤 통학 시간 } X\\text{가 정규분포를 따른다.} \\\\ \\text{구간 길이가 10으로 일정할 때, } P(a \\le X \\le a+10) \\text{의} \\\\ \\text{확률이 최대가 되려면 } a\\text{는 어떤 조건을 만족해야 하는가?} \\\\ \\\\ \\implies \\text{구간 정중앙에 산봉우리(평균 } m\\text{)가 위치해야 함!} \\\\ \\implies \\frac{a + (a+10)}{2} = m \\implies a+5 = m \\end{array}";

d.steps[24].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q10.} 두 학교 A, B의 수학 성적 분포 } X, Y\\text{가 평균은 같고,} \\\\ \\text{A학교 성적의 분산이 B학교 성적의 분산보다 작다.} \\\\ \\text{두 곡선 중 가운데가 더 높이 솟은 곡선은 어느 학교인가?} \\\\ \\\\ \\implies E(X) = E(Y), \\; V(X) < V(Y) \\\\ \\implies A\\text{의 분포가 평균에 더 밀집되어 있으므로 A학교가 더 높다!} \\end{array}";

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Fixed Normal Distribution Questions to be full word problems!');
