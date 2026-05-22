import React, { useState, useEffect } from 'react';
import { vol1_001 } from '../data/mockExams/001.js';
import { vol1_0011 } from '../data/mockExams/0011.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Maximize2, Minimize2, PenTool, CheckCircle, Database, Play, Pause, Volume2, CreditCard } from 'lucide-react';
import '@/pages/LessonTest.css';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';
import PaymentCheckoutModal from '@/components/PaymentCheckoutModal';

import { getMetadataForProblem } from '../data/mockMetadata';
import { WeaknessAnalysisEngine } from '../engine/math/WeaknessAnalysisEngine';
import { trackApiCall } from '@/engine/apiUsageTracker';
import { commonQuestions2024, calculusQuestions2024, statsQuestions2024 } from '../data/mockExams/CSAT_2024_6.js';
import { commonQuestions as common2025, calculusQuestions as calc2025, statsQuestions as stats2025 } from '../data/mockExams/CSAT_2025_6.js';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';

// ----------------------------------------------------
// 대성콘스탄트 대응 30문항 통모의고사 더미 데이터베이스 (선택과목 분리)
// ----------------------------------------------------
const commonQuestions = [
  { id: 1, type: "2점", text: "$$3^{-1+\\sqrt{2}} \\times 3^{1-\\sqrt{2}}$$ 의 값은?", options: ["$1$", "$3$", "$9$", "$27$", "$81$"], answer: 0, tag: '지수' },
  { id: 2, type: "2점", text: "함수 $f(x)=x^3 + 3x$ 에 대하여 $f'(1)$ 의 값은?", options: ["2", "4", "6", "8", "10"], answer: 2, tag: '미분' },
  { id: 3, type: "3점", text: "등차수열 $\\{a_n\\}$ 에 대하여 $a_2 + a_4 = 10, a_6 = 11$ 일 때, $a_1$ 의 값은?", options: ["-1", "1", "3", "5", "7"], answer: 1, tag: '수열' },
  { id: 4, type: "3점", text: "함수 $f(x)=\\begin{cases} x^2+a & (x < 2) \\\\ 3x-1 & (x \\ge 2) \\end{cases}$ 가 $x=2$ 에서 연속일 때, 상수 $a$ 의 값은?", options: ["-1", "0", "1", "2", "3"], answer: 2, tag: '함수의 극한' },
  { id: 5, type: "3점", text: "$$\\int_0^1 (3x^2 - 4x + 2) dx$$ 의 값은?", options: ["-1", "0", "1", "2", "3"], answer: 2, tag: '적분' },
  { id: 6, type: "3점", text: "방정식 $3^{2x} - 4 \\cdot 3^{x} + 3 = 0$ 의 모든 실근의 합은?", options: ["0", "1", "2", "3", "4"], answer: 1, tag: '지수방정식' },
  { id: 7, type: "3점", text: "곡선 $y=x^3 - 3x^2 + 2x$ 와 $x$축으로 둘러싸인 부분의 넓이는?", options: ["$\\frac{1}{4}$", "$\\frac{1}{2}$", "$\\frac{3}{4}$", "$1$", "$\\frac{5}{4}$"], answer: 1, tag: '적분 활용' },
  { id: 8, type: "3점", text: "그림과 같이 반지름의 길이가 $4$ 이고 중심각의 크기가 $\\frac{\\pi}{3}$ 인 부채꼴 $\\rm OAB$ 가 있다. 선분 $\\rm OA$ 를 $1:3$ 으로 내분하는 점을 $\\rm P$, 선분 $\\rm OB$ 를 $3:1$ 로 내분하는 점을 $\\rm Q$ 라 할 때, 삼각형 $\\rm OPQ$ 의 넓이는?", figure: "geom_triangle_opq", options: ["$\\frac{3\\sqrt{3}}{4}$", "$\\sqrt{3}$", "$\\frac{5\\sqrt{3}}{4}$", "$\\frac{3\\sqrt{3}}{2}$", "$\\frac{7\\sqrt{3}}{4}$"], answer: 0, tag: '삼각함수 활용' },
  { id: 9, type: "4점", text: "수열 $\\{a_n\\}$ 이 다음 조건을 만족시킨다. \n\n (가) $a_1 = 2$ \n (나) 모든 자연수 $n$ 에 대하여 $a_{n+1} = \\begin{cases} a_n + 3 & (a_n < 10) \\\\ a_n - 5 & (a_n \\ge 10) \\end{cases}$ \n\n $\\sum_{k=1}^{15} a_k$ 의 값은?", options: ["45", "50", "55", "60", "65"], answer: 3, tag: '수열의 합' },
  { id: 10, type: "4점", text: "함수 $f(x) = |\\sin \\frac{\\pi x}{2}|$ 에 대하여 $\\int_0^3 f(x) dx$ 의 값은?", options: ["$\\frac{2}{\\pi}$", "$\\frac{3}{\\pi}$", "$\\frac{4}{\\pi}$", "$\\frac{5}{\\pi}$", "$\\frac{6}{\\pi}$"], answer: 4, tag: '삼각함수 적분' },
  { id: 11, type: "4점", text: "양수 $a$ 와 실수 $b$ 에 대하여 함수 $f(x)=a \\cos x + b$ 의 최댓값이 $5$, 최솟값이 $-1$ 일 때, $ab$ 의 값은?", options: ["2", "4", "6", "8", "10"], answer: 2, tag: '삼각함수그래프' },
  { id: 12, type: "4점", text: "최고차항의 계수가 $\\frac{1}{2}$ 인 삼차함수 $f(x)$ 와 실수 $t$ 에 대하여 방정식 $f(x)=t$ 의 서로 다른 실근의 개수를 $g(t)$ 라 하자. 함수 $g(t)$ 가 $t=\\alpha, t=\\beta \\;(\\alpha < \\beta)$ 에서 불연속이고, $\\int_\\alpha^\\beta g(t)dt = 12$ 이다. $f(0)=3, f'(0)<0$ 일 때, $f(4)$ 의 값은?", options: ["18", "20", "23", "25", "27"], answer: 2, tag: '미분 킬러로직' },
  { id: 13, type: "4점", text: "수열 $\\{a_n\\}$ 이 $a_1 = 1$, $a_2 = 3$ 이고 모든 자연수 $n$ 에 대하여 \n$$a_{n+2} = \\begin{cases} a_{n+1} + a_n & (n\\text{이 홀수}) \\\\ a_{n+1} - a_n & (n\\text{이 짝수})\\end{cases}$$\n를 만족시킬 때, $\\sum_{k=1}^{30} a_k$ 의 값은?", options: ["50", "55", "60", "65", "70"], answer: 1, tag: '수열의 귀납적' },
  { id: 14, type: "4점", text: "두 양수 $a, b$ 와 최고차항의 계수가 $1$ 인 삼차함수 $f(x)$ 에 대하여 함수 $g(x) = \\begin{cases} f(x)-a & (x < 0) \\\\ f(x-b) & (x \\ge 0) \\end{cases}$ 이 다음 조건을 만족시킨다. \n\n(가) 함수 $g(x)$ 는 실수 전체의 집합에서 미분가능하다.\n(나) $g(x)$ 는 $x=1$ 과 $x=3$ 에서만 극값을 갖는다.\n\n $\\int_0^3 g(x) dx$ 의 값은?", options: ["$\\frac{11}{4}$", "3", "$\\frac{13}{4}$", "$\\frac{7}{2}$", "$\\frac{15}{4}$"], answer: 3, tag: '미적분 킬러 ㄱㄴㄷ' },
  { id: 15, type: "4점", text: "모든 항이 정수인 수열 $\\{a_n\\}$ 이 모든 자연수 $n$ 에 대하여 다음 조건을 만족시킨다. \n\n(가) $a_{n+1} = \\begin{cases} -a_n - 2 & (a_n > 0) \\\\ 2a_n + 3 & (a_n \\le 0) \\end{cases}$ \n(나) $\\sum_{k=1}^{10} a_k = -15$ \n\n$a_1 > 0$ 이고 $a_{10} = a_1$ 일 때, $a_1 + a_2 + a_3$ 의 값은?", options: ["-4", "-2", "0", "2", "4"], answer: 2, tag: '수열 킬러 점화식', hint: {
      clue: "수열의 점화식은 정방향 규칙 전개가 핵심입니다. $a_1$ 부터 하나씩 추론해 보세요.",
      bg1: "$a_1 > 0$ 이므로 $a_2 = -a_1 - 2 < 0$ 이 됩니다.",
      bg2: "$a_2 \\le 0$ 이므로 $a_3 = 2a_2 + 3 = -2a_1 - 1$ 로 부호가 분기됩니다.",
      bg3: "양수/음수 케이스를 나눠 1주기($a_{10}$ 까지)의 합 $\\sum$ 기호를 전개합니다.",
      bg4: "👉 $a_1=2$ 가 도출되며 정답 배열이 완성됩니다!",
      survey: "수능 수열 킬러 특유의 노가다(나열 추론), 확실히 체득하셨나요?"
  }},
  { id: 16, type: "3점", text: "$\\log_2 16 + \\log_3 27$ 의 값을 구하시오.", options: [], answer: "7", tag: '로그' },
  { id: 17, type: "3점", text: "함수 $f(x)=x^4 - 2x^2 + 3$ 에 대하여 $f'(2)$ 의 값을 구하시오.", options: [], answer: "24", tag: '도함수' },
  { id: 18, type: "3점", text: "$\\sum_{k=1}^5 (2k - 1)$ 의 값을 구하시오.", options: [], answer: "25", tag: '시그마' },
  { id: 19, type: "3점", text: "곡선 $y=x^3 - 3x + 2$ 위의 점 $(2, 4)$ 에서의 접선의 기울기를 구하시오.", options: [], answer: "9", tag: '접선의방정식' },
  { id: 20, type: "4점", text: "다항함수 $f(x)$ 가 $f(x) = 3x^2 + \\int_0^1 2x f(t) dt$ 를 만족시킬 때, $f(2)$ 의 값을 구하시오.", options: [], answer: "8", tag: '정적분함수' },
  { id: 21, type: "4점", text: "두 자연수 $a, b$ 에 대하여 곡선 $y=a^{x-b}$ 와 직선 $y=x$ 가 서로 다른 두 점 $\\rm A, B$ 에서 만난다. 선분 $\\rm AB$ 의 길이가 $2\\sqrt{2}$ 가 되도록 하는 모든 순서쌍 $(a,b)$ 의 개수를 구하시오.", options: [], answer: "15", tag: '지수 로그의 관계' },
  { id: 22, type: "4점", text: "최고차항의 계수가 $1$ 인 사차함수 $f(x)$ 와 실수 $t$ 에 대하여 함수 $g(x)=|f(x)-t|$ 라 하자. \n\n$\\lim_{h \\to 0^+} \\frac{g(x+h)-g(x)}{h} = \\lim_{h \\to 0^-} \\frac{g(x+h)-g(x)}{h}$\n\n를 만족시키는 $x$ 의 개수를 $h(t)$ 라 할 때, 함수 $h(t)$ 는 다음 조건을 만족시킨다. \n\n(가) $\\lim_{t \\to 0^+} h(t) = 4$ \n(나) $h(t)$ 가 불연속이 되는 $t$ 의 값은 $-16$ 과 $0$ 뿐이다.\n\n$f(0)=0, f'(0)=0$ 일 때, $f(4)$ 의 값을 구하시오.", options: [], answer: "256", tag: '미분 초킬러', hint: {
      clue: "절댓값 미분가능성과 도함수의 좌우극한이 일치할 조건은 그래프의 극점(접선의 기울기=0)과 교점입니다.",
      bg1: "$f(x)$ 는 최고차항의 계수가 $1$ 인 사차함수이다.",
      bg2: "$g(x) = |f(x)-t|$ 가 미분불가능한 점의 개수 $h(t)$는 교점의 개수와 직결된다.",
      bg3: "즉, $y=t$ 와 $y=f(x)$ 의 그래프가 접할 때 불연속점 $t=-16, 0$ 이 생성된다.",
      bg4: "👉 곧 극솟값은 $-16$ 이고 극댓값은 $0$ 이다!",
      survey: "사차함수의 개형이 잡혔나요?\\n $f'(0)=0$ 을 통해 어떤 식별자를 도출할까요?"
  }},
];

// 미적분 선택과목
const calculusQuestions = [
  { id: 23, type: "2점", text: "$\\lim_{n \\to \\infty} \\frac{3n^2 + 2n}{n^2 - 1}$ 의 값은?", options: ["1", "2", "3", "4", "5"], answer: 2, tag: '수열의 극한' },
  { id: 24, type: "3점", text: "매개변수 $t$ 로 나타낸 곡선 $x=t^2+2t, y=e^t$ 에 대하여 $t=0$ 에서의 $\\frac{dy}{dx}$ 의 값은?", options: ["$\\frac{1}{4}$", "$\\frac{1}{2}$", "1", "2", "4"], answer: 1, tag: '매개변수미분' },
  { id: 25, type: "3점", text: "$\\int_0^{\\pi} x \\sin x \\, dx$ 의 값은?", options: ["$\\frac{\\pi}{2}$", "1", "$\\frac{3\\pi}{4}$", "$\\pi$", "$\\frac{3\\pi}{2}$"], answer: 3, tag: '부분적분' },
  { id: 26, type: "3점", text: "급수 $\\sum_{n=1}^\\infty \\left(\\frac{1}{3}\\right)^n$ 의 값은?", options: ["$\\frac{1}{4}$", "$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$", "$\\frac{3}{4}$"], answer: 2, tag: '무한등비급수' },
  { id: 27, type: "3점", text: "함수 $f(x)=x e^{-x}$ 의 극댓값은?", options: ["$e^{-2}$", "$e^{-1}$", "$1$", "$e$", "$e^2$"], answer: 1, tag: '극대극소' },
  { id: 28, type: "4점", text: "자연수 $n$ 에 대하여 곡선 $y=\\ln x$ 와 $x$축, $x=e^n$ 으로 둘러싸인 부분의 넓이를 $S_n$ 이라 할 때, $\\lim_{n \\to \\infty} \\frac{S_n}{e^n}$ 의 값은?", options: ["$\\frac{1}{2}$", "1", "$\\frac{3}{2}$", "2", "$\\frac{5}{2}$"], answer: 1, tag: '정적분극한' },
  { id: 29, type: "4점", text: "그림과 같이 길이가 $2$ 인 선분 $\\rm AB$ 를 지름으로 하는 반원의 호 $\\rm AB$ 위에 점 $\\rm P$ 가 있다. 선분 $\\rm AB$ 의 중점을 $\\rm O$ 라 하고, $\\angle{\\rm POB} = \\theta \\;(0 < \\theta < \\frac{\\pi}{2})$ 라 하자. 점 $\\rm P$ 에서 선분 $\\rm AB$ 에 내린 수선의 발을 $\\rm H$ 라 하고, 선분 $\\rm PH$ 를 지름으로 하는 원이 선분 $\\rm PB$ 와 만나는 점 중 $\\rm P$ 가 아닌 점을 $\\rm Q$ 라 하자. 삼각형 $\\rm PHQ$ 의 넓이를 $S(\\theta)$, 부채꼴 $\\rm OPB$ 에 내접하는 원의 반지름을 $r(\\theta)$ 라 할 때, $\\lim_{\\theta \\to 0+} \\frac{S(\\theta)}{\\theta^3 \\times r(\\theta)} = \\frac{q}{p}$ 이다. $p+q$ 의 값을 구하시오. (단, $p, q$ 는 서로소인 자연수이다.)", options: [], answer: "15", tag: '삼각함수극한도형' },
  { id: 30, type: "4점", text: "실수 전체의 집합에서 미분가능한 함수 $f(x)$ 가 다음 조건을 만족시킨다. \n\n(가) 모든 실수 $x$ 에 대하여 $f(x+2) = f(x) + \\int_0^2 f(t)dt$ \n(나) $0 \\le x \\le 2$ 일 때, $f(x) = a x e^{-x} + b$ \n\n $f'(0)=1$ 일 때, $\\int_0^4 f(x) dx = \\frac{p e^2 + q}{e^2}$ 이다. $p^2+q^2$ 의 값을 구하시오. (단, $a, b, p, q$ 는 정수이다.)", options: [], answer: "45", tag: '미분 킬러로직' }
];

// 확률과 통계 선택과목
const statsQuestions = [
  { id: 23, type: "2점", text: "${}_5{\\rm C}_2 + {}_5{\\rm P}_2$ 의 값은?", options: ["20", "25", "30", "35", "40"], answer: 2, tag: '순열조합' },
  { id: 24, type: "3점", text: "서로 다른 3개의 주사위를 동시에 던질 때, 나오는 눈의 수의 합이 5가 될 확률은?", options: ["$\\frac{1}{72}$", "$\\frac{1}{36}$", "$\\frac{1}{24}$", "$\\frac{1}{18}$", "$\\frac{5}{72}$"], answer: 1, tag: '확률' },
  { id: 25, type: "3점", text: "두 사건 $A, B$ 가 서로 독립이고 $P(A) = 0.5, P(A \\cap B) = 0.2$ 일 때, $P(A \\cup B)$ 의 값은?", options: ["0.6", "0.7", "0.8", "0.9", "1.0"], answer: 1, tag: '독립사건' },
  { id: 26, type: "3점", text: "어느 고등학교 학생들의 몸무게는 평균이 $65\\rm{kg}$, 표준편차가 $5\\rm{kg}$ 인 정규분포를 따른다고 한다. 1명을 임의 추출할 때, $60\\rm{kg}$ 이상 $75\\rm{kg}$ 이하일 확률을 지정된 정규분포표 코드로 환산한 값은?", options: ["0.4772", "0.6826", "0.8185", "0.9544", "0.9772"], answer: 2, tag: '정규분포' },
  { id: 27, type: "3점", text: "방정식 $x+y+z=10$ 을 만족시키는 자연수 $x, y, z$ 의 모든 순서쌍의 개수는?", options: ["21", "28", "36", "45", "55"], answer: 2, tag: '중복조합' },
  { id: 28, type: "4점", text: "1부터 10까지의 자연수가 하나씩 적혀 있는 10장의 카드 중에서 임의로 3장의 카드를 동시에 선택할 때, 선택된 카드에 적힌 수 중 가장 큰 수가 8일 확률은?", options: ["$\\frac{7}{40}$", "$\\frac{1}{5}$", "$\\frac{9}{40}$", "$\\frac{1}{4}$", "$\\frac{11}{40}$"], answer: 0, tag: '경우의수 확률' },
  { id: 29, type: "4점", text: "다음 조건을 만족시키는 음이 아닌 정수 $a, b, c, d$ 의 모든 순서쌍 $(a,b,c,d)$ 의 개수를 구하시오. \n\n(가) $a+b+c+d=14$ \n(나) $a, b, c$ 중 적어도 2개는 서로 같다.\n(다) $c \\le d$", options: [], answer: "216", tag: '중복조합' },
  { id: 30, type: "4점", text: "주머니 A에는 1, 2, 3, 4, 5가 적힌 공이 하나씩 들어있고, 주머니 B에는 1, 2, 3이 적힌 공이 하나씩 들어있다. 주머니 A에서 임의로 세 개의 공을 꺼내어 확인한 세 수의 최솟값을 $m$, 주머니 B에서 임의로 두 개의 공을 꺼내어 확인한 두 수의 차를 $n$ 이라 하자. $m+n$ 이 짝수일 때, $m$ 이 홀수일 확률은 $\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하시오. (단, $p, q$ 는 서로소인 자연수이다.)", options: [], answer: "141", tag: '독립시행 킬러' }
];

const safeResolve = (path) => {
  if (typeof window !== 'undefined' && typeof window.resolveAsset === 'function') {
    return window.resolveAsset(path);
  }
  return path;
};

const getMockExamData = (volumeIndex, electiveMode) => {
  const volNumber = volumeIndex + 1;
  let examType = '';
  let year = '';

  if (volumeIndex >= 0 && volumeIndex <= 2) {
      examType = '6월';
      year = volumeIndex === 0 ? '2025' : volumeIndex === 1 ? '2024' : '2023';
  } else if (volumeIndex >= 3 && volumeIndex <= 5) {
      examType = '수능';
      year = volumeIndex === 3 ? '2025' : volumeIndex === 4 ? '2024' : '2023';
  } else if (volumeIndex >= 6 && volumeIndex <= 8) {
      examType = '9월';
      year = volumeIndex === 6 ? '2025' : volumeIndex === 7 ? '2024' : '2023';
  } else if (volumeIndex >= 9 && volumeIndex <= 11) {
      examType = '3월';
      year = volumeIndex === 9 ? '2026' : volumeIndex === 10 ? '2025' : '2024';
  }

  // 공통 및 6월 모평 정답 리스트
  const june2025_common = [0, 4, 2, 1, 3, 2, 4, 3, 0, 0, 4, 1, 2, 3, 0, "3", "15", "11", "7", "39", "25", "16"];
  const june2025_calculus = [0, 2, 3, 1, 2, 3, "109", "25"];
  const june2025_stats = [2, 4, 0, 1, 0, 4, "44", "115"];
  const june2025 = [...june2025_common, ...(electiveMode === 'calculus' ? june2025_calculus : june2025_stats)];

  const june2024_common = [3, 4, 2, 2, 4, 0, 3, 0, 2, 4, 4, 2, 2, 3, 1, "7", "23", "2", "16", "14", "15", "231"];
  const june2024_calculus = [2, 0, 0, 2, 1, 3, "55", "25"];
  const june2024_stats = [3, 2, 1, 2, 0, 0, "6", "108"];
  const june2024 = [...june2024_common, ...(electiveMode === 'calculus' ? june2024_calculus : june2024_stats)];

  const june2023_common = [1, 3, 3, 1, 2, 4, 3, 2, 4, 2, 1, 3, 2, 0, 3, "3", "2", "4", "1", "13", "10", "19"];
  const june2023_calculus = [0, 3, 1, 2, 4, 1, "15", "29"];
  const june2023_stats = [1, 0, 3, 1, 2, 3, "12", "11"];
  const june2023 = [...june2023_common, ...(electiveMode === 'calculus' ? june2023_calculus : june2023_stats)];

  // 수능 정답표
  const ans2025_common = [0, 3, 4, 2, 2, 1, 4, 0, 3, 2, 2, 1, 4, 3, 3, "9", "16", "12", "15", "130", "65", "457"];
  const ans2025_calculus = [2, 3, 2, 0, 1, 4, "97", "11"];
  const ans2025_stats = [2, 0, 1, 4, 3, 1, "977", "262"];
  const ans2025 = [...ans2025_common, ...(electiveMode === 'calculus' ? ans2025_calculus : ans2025_stats)];

  const ans2024_common = [4, 3, 4, 1, 3, 4, 2, 0, 3, 2, 1, 0, 4, 3, 1, "7", "33", "96", "41", "36", "16", "64"];
  const ans2024_calculus = [2, 3, 1, 0, 0, 1, "25", "17"];
  const ans2024_stats = [4, 2, 0, 2, 2, 1, "25", "19"];
  const ans2024 = [...ans2024_common, ...(electiveMode === 'calculus' ? ans2024_calculus : ans2024_stats)];

  const ans2023_common = [0, 3, 1, 0, 3, 3, 4, 1, 3, 1, 0, 2, 0, 0, 2, "2", "8", "9", "32", "25", "10", "483"];
  const ans2023_calculus = [2, 1, 3, 2, 0, 1, "162", "125"];
  const ans2023_stats = [2, 3, 4, 1, 1, 3, "196", "673"];
  const ans2023 = [...ans2023_common, ...(electiveMode === 'calculus' ? ans2023_calculus : ans2023_stats)];

  if (volumeIndex >= 0 && volumeIndex <= 5) {
      const subjectLabel = electiveMode === 'calculus' ? '미적분' : '확통';
      const csatQuestions = Array.from({length: 30}, (_, idx) => {
          const num = String(idx + 1).padStart(3, '0');
          const isObjective = (idx < 15) || (idx >= 22 && idx < 28);
          const pointType = [15, 22, 30].includes(idx + 1) ? '4점' : '3점';
          
          let actualAnswer = isObjective ? 0 : "10";
          if (examType === '6월') {
              if (year === '2025') actualAnswer = june2025[idx];
              else if (year === '2024') actualAnswer = june2024[idx];
              else if (year === '2023') actualAnswer = june2023[idx];
          } else if (examType === '수능') {
              if (year === '2025') actualAnswer = ans2025[idx];
              else if (year === '2024') actualAnswer = ans2024[idx];
              else if (year === '2023') actualAnswer = ans2023[idx];
          }

          let picturePath;
          let hintTag;
          if (examType === '수능') {
            picturePath = safeResolve(`/math_crops/고3수능및모의고사/${subjectLabel}/${year}수능/${num}.webp`);
            hintTag = `CSAT_${year}수능_${subjectLabel}`;
          } else {
            picturePath = safeResolve(`/math_crops/고3수능및모의고사/월별모의고사/6월/${subjectLabel}_${year}_6월/${num}.webp`);
            hintTag = `CSAT_${year}_6월_${subjectLabel}`; 
          }

          return {
              id: idx + 1,
              type: pointType,
              options: isObjective ? ['', '', '', '', ''] : [],
              picture: picturePath,
              tag: hintTag,
              answer: actualAnswer 
          };
      });
      return {
          title: `MENTOS 모의고사 VOL.${volNumber} (${year}학년도 ${examType === '수능' ? '수능 기출' : examType + ' 모의평가'})`,
          subtitle: `수학 영역 (선택: ${subjectLabel})`,
          questions: csatQuestions
      };
  }

  // 6~8회차 (월별 모의고사)
  if (volumeIndex >= 6 && volumeIndex <= 8) {
      const month = volumeIndex === 6 ? '9월' : volumeIndex === 7 ? '6월' : '3월';
      const subjectLabel = electiveMode === 'calculus' ? '미적분' : '확통';
      
      const mockQuestions = Array.from({length: 30}, (_, idx) => {
          const num = String(idx + 1).padStart(3, '0');
          const isObjective = (idx < 15) || (idx >= 22 && idx < 28);
          const pointType = [15, 22, 30].includes(idx + 1) ? '4점' : '3점';
          return {
              id: idx + 1,
              type: pointType,
              options: isObjective ? ['', '', '', '', ''] : [],
              picture: safeResolve(`/math_crops/고3수능및모의고사/${subjectLabel}/2025학년도${month}모의평가/${num}.webp`),
              tag: `MOCK_2025_${month}_${subjectLabel}`,
              answer: isObjective ? 0 : "10"
          };
      });
      return {
          title: `MENTOS 모의고사 VOL.${volNumber} (2025학년도 ${month} 모의평가)`,
          subtitle: `수학 영역 (선택: ${subjectLabel})`,
          questions: mockQuestions
      };
  }

  const baseQuestions = [...commonQuestions, ...(electiveMode === 'calculus' ? calculusQuestions : statsQuestions)];

  return {
    title: `MENTOS PRESTIGE MOCK EXAM VOL.${volNumber}`,
    subtitle: `2026학년도 대학수학능력시험 대비 수학 영역 (선택: ${electiveMode === 'calculus' ? '미적분' : '확률과 통계'})`,
    questions: baseQuestions
  };
};

// ----------------------------------------------------
// 커스텀 리액트 SVG 기하학
// ----------------------------------------------------
const GeometryFigure = ({ type }) => {
  if (type === 'geom_triangle_opq') {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="250" height="250" viewBox="0 0 250 250" style={{ background: '#f8fafc', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <path d="M 50 200 A 150 150 0 0 1 125 70" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" />
          <line x1="50" y1="200" x2="200" y2="200" stroke="#334155" strokeWidth="2" />
          <line x1="50" y1="200" x2="125" y2="70" stroke="#334155" strokeWidth="2" />
          <polygon points="50,200 87.5,200 106.25,102.5" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="2" />
          <text x="35" y="215" fill="#334155" fontWeight="bold" fontFamily="serif">O</text>
          <text x="210" y="215" fill="#334155" fontWeight="bold" fontFamily="serif">A</text>
          <text x="135" y="65" fill="#334155" fontWeight="bold" fontFamily="serif">B</text>
          <text x="80" y="220" fill="#ef4444" fontWeight="bold" fontFamily="serif">P</text>
          <text x="115" y="105" fill="#ef4444" fontWeight="bold" fontFamily="serif">Q</text>
          <path d="M 80 200 A 30 30 0 0 0 65 175" fill="none" stroke="#64748b" />
          <text x="85" y="190" fill="#64748b" fontSize="12" fontFamily="serif">π/3</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_q24') {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="250" height="250" viewBox="0 0 250 250" style={{ background: '#f8fafc', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <polygon points="50,50 150,50 150,150 50,150" fill="none" stroke="#334155" strokeWidth="2" />
          <line x1="175" y1="75" x2="150" y2="150" stroke="#3b82f6" strokeWidth="2" />
          <line x1="175" y1="75" x2="100" y2="50" stroke="#3b82f6" strokeWidth="2" />
          <path d="M 166.5 71.6 L 163.1 80.1 L 171.6 83.5 L 175 75" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="100" cy="50" r="3" fill="#334155" />
          <circle cx="175" cy="75" r="3" fill="#ef4444" />
          <path d="M 115 50 A 15 15 0 0 1 112 56" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x="120" y="58" fill="#ef4444" fontSize="12" fontWeight="bold" fontFamily="serif">θ</text>
          <text x="35" y="45" fill="#334155" fontWeight="bold" fontFamily="serif">A</text>
          <text x="155" y="45" fill="#334155" fontWeight="bold" fontFamily="serif">B</text>
          <text x="155" y="165" fill="#334155" fontWeight="bold" fontFamily="serif">C</text>
          <text x="35" y="165" fill="#334155" fontWeight="bold" fontFamily="serif">D</text>
          <text x="95" y="40" fill="#334155" fontWeight="bold" fontFamily="serif">M</text>
          <text x="185" y="75" fill="#ef4444" fontWeight="bold" fontFamily="serif">E</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_q26') {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="250" height="250" viewBox="0 0 250 250" style={{ background: '#f8fafc', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <line x1="30" y1="220" x2="230" y2="220" stroke="#94a3b8" />
          <line x1="50" y1="240" x2="50" y2="40" stroke="#94a3b8" />
          <line x1="30" y1="240" x2="230" y2="40" stroke="#cbd5e1" strokeDasharray="4" />
          <polygon points="200,100 140,160 110,130" fill="rgba(59,130,246,0.15)" stroke="none" />
          <polyline points="200,100 140,160 110,130 80,160 110,190" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
          <line x1="80" y1="220" x2="200" y2="100" stroke="#64748b" strokeWidth="1" strokeDasharray="3" />
          <circle cx="80" cy="220" r="3" fill="#334155" />
          <circle cx="50" cy="190" r="3" fill="#334155" />
          <circle cx="200" cy="100" r="3" fill="#ef4444" />
          <circle cx="140" cy="160" r="3" fill="#ef4444" />
          <circle cx="110" cy="130" r="3" fill="#ef4444" />
          <text x="80" y="235" fill="#334155" fontSize="12" fontWeight="bold" fontFamily="serif">A(2,0)</text>
          <text x="5" y="195" fill="#334155" fontSize="12" fontWeight="bold" fontFamily="serif">B(0,2)</text>
          <text x="210" y="105" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="serif">P₁</text>
          <text x="145" y="175" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="serif">P₂</text>
          <text x="95" y="125" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="serif">P₃</text>
          <text x="210" y="55" fill="#94a3b8" fontSize="12" fontFamily="serif">y = x</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_q27') {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="250" height="250" viewBox="0 0 250 250" style={{ background: '#f8fafc', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <polygon points="20,180 180,180 100,100" fill="none" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
          <line x1="100" y1="100" x2="100" y2="180" stroke="#64748b" strokeWidth="1.5" />
          <line x1="20" y1="180" x2="140" y2="140" stroke="#64748b" strokeWidth="1.5" />
          <polygon points="140,140 100,140 100,153.3" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
          <path d="M 100 100 L 100 108 L 92 108 L 92 100" fill="none" stroke="#334155" strokeWidth="1" />
          <path d="M 100 140 L 105 140 L 105 145 L 100 145" fill="none" stroke="#3b82f6" strokeWidth="1" />
          <circle cx="100" cy="180" r="3" fill="#334155" />
          <path d="M 45 180 A 25 25 0 0 0 38.9 173.7" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x="45" y="176" fill="#ef4444" fontSize="12" fontWeight="bold" fontFamily="serif">θ</text>
          <text x="5" y="195" fill="#334155" fontWeight="bold" fontFamily="serif">A</text>
          <text x="185" y="195" fill="#334155" fontWeight="bold" fontFamily="serif">B</text>
          <text x="95" y="90" fill="#334155" fontWeight="bold" fontFamily="serif">C</text>
          <text x="95" y="200" fill="#334155" fontWeight="bold" fontFamily="serif">M</text>
          <text x="150" y="145" fill="#334155" fontWeight="bold" fontFamily="serif">P</text>
          <text x="80" y="160" fill="#ef4444" fontWeight="bold" fontFamily="serif">Q</text>
          <text x="80" y="145" fill="#ef4444" fontWeight="bold" fontFamily="serif">H</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_q29') {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="250" height="250" viewBox="0 0 250 250" style={{ background: '#f8fafc', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <path d="M 50 200 A 100 100 0 0 1 250 200" fill="none" stroke="#334155" strokeWidth="2" />
          <line x1="30" y1="200" x2="270" y2="200" stroke="#94a3b8" />
          <line x1="150" y1="200" x2="200" y2="113.4" stroke="#64748b" strokeWidth="1.5" />
          <line x1="200" y1="113.4" x2="250" y2="200" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="207.7" cy="166.7" r="33.3" fill="none" stroke="#10b981" strokeWidth="2" />
          <circle cx="200" cy="156.7" r="43.3" fill="none" stroke="#cbd5e1" strokeDasharray="4" />
          <polygon points="200,113.4 200,200 237.5,178.35" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
          <path d="M 180 200 A 30 30 0 0 0 165 174" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x="185" y="195" fill="#ef4444" fontSize="12" fontWeight="bold" fontFamily="serif">θ</text>
          <text x="145" y="220" fill="#334155" fontWeight="bold" fontFamily="serif">O</text>
          <text x="45" y="220" fill="#334155" fontWeight="bold" fontFamily="serif">A</text>
          <text x="255" y="220" fill="#334155" fontWeight="bold" fontFamily="serif">B</text>
          <text x="195" y="105" fill="#334155" fontWeight="bold" fontFamily="serif">P</text>
          <text x="205" y="215" fill="#ef4444" fontWeight="bold" fontFamily="serif">H</text>
          <text x="245" y="175" fill="#ef4444" fontWeight="bold" fontFamily="serif">Q</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_calc_q26_2024') {
    return (
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="200" viewBox="0 0 300 200">
          <path d="M 50 150 L 250 150 M 50 150 L 50 50" stroke="#94a3b8" strokeWidth="2" fill="none" />
          <path d="M 100 150 Q 150 50 250 40" stroke="#ef4444" strokeWidth="2.5" fill="none" />
          <rect x="120" y="80" width="30" height="70" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1" />
          <rect x="170" y="60" width="30" height="90" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1" />
          <text x="100" y="170" fill="#334155" fontWeight="bold">1</text>
          <text x="250" y="170" fill="#334155" fontWeight="bold">e</text>
          <text x="260" y="155" fill="#334155" fontWeight="bold">x</text>
          <text x="35" y="45" fill="#334155" fontWeight="bold">y</text>
          <text x="150" y="30" fill="#ef4444" fontWeight="bold" fontSize="14">y = √( (x²-1)/x )</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_calc_q27_2024') {
    return (
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="150" viewBox="0 0 300 150">
          <rect x="50" y="25" width="200" height="100" fill="none" stroke="#334155" strokeWidth="2" />
          <polygon points="50,125 100,25 150,125" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5" />
          <rect x="50" y="75" width="60" height="50" fill="none" stroke="#10b981" strokeWidth="1.5" />
          <polygon points="50,125 70,75 90,125" fill="rgba(16,185,129,0.5)" stroke="#10b981" strokeWidth="1" />
          <text x="35" y="140" fill="#334155" fontWeight="bold">A</text>
          <text x="255" y="140" fill="#334155" fontWeight="bold">B₁</text>
          <text x="255" y="20" fill="#334155" fontWeight="bold">C₁</text>
          <text x="35" y="20" fill="#334155" fontWeight="bold">D₁</text>
          <text x="100" y="15" fill="#ef4444" fontWeight="bold">E₁</text>
          <text x="155" y="140" fill="#ef4444" fontWeight="bold">F₁</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_calc_q29_2024') {
    return (
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="200" viewBox="0 0 300 200">
          <path d="M 50 170 A 100 100 0 0 1 250 170" fill="none" stroke="#334155" strokeWidth="2" />
          <line x1="50" y1="170" x2="250" y2="170" stroke="#334155" strokeWidth="2" />
          <line x1="50" y1="170" x2="180" y2="90" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="250" y1="170" x2="120" y2="80" stroke="#3b82f6" strokeWidth="1.5" />
          <polygon points="152,108 120,80 180,90" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="110" y="130" width="80" height="40" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.5" />
          <text x="35" y="180" fill="#334155" fontWeight="bold">A</text>
          <text x="255" y="180" fill="#334155" fontWeight="bold">B</text>
          <text x="185" y="85" fill="#ef4444" fontWeight="bold">P</text>
          <text x="105" y="75" fill="#3b82f6" fontWeight="bold">Q</text>
          <text x="150" y="125" fill="#f59e0b" fontWeight="bold">R</text>
          <text x="95" y="140" fill="#10b981" fontWeight="bold">S</text>
          <text x="195" y="140" fill="#10b981" fontWeight="bold">T</text>
          <path d="M 80 170 A 30 30 0 0 0 75 155" fill="none" stroke="#ef4444" strokeWidth="1" />
          <text x="85" y="160" fill="#ef4444" fontSize="12">θ</text>
          <path d="M 220 170 A 30 30 0 0 1 222 150" fill="none" stroke="#3b82f6" strokeWidth="1" />
          <text x="205" y="155" fill="#3b82f6" fontSize="12">2θ</text>
        </svg>
      </div>
    );
  }
  if (type === 'geom_stats_q28_2024') {
    return (
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="200" viewBox="0 0 300 200">
          {[50, 90, 130, 170, 210, 250].map(x => <line key={`v${x}`} x1={x} y1="40" x2={x} y2="160" stroke="#94a3b8" strokeWidth="1.5" />)}
          {[40, 80, 120, 160].map(y => <line key={`h${y}`} x1="50" y1={y} x2="250" y2={y} stroke="#94a3b8" strokeWidth="1.5" />)}
          <circle cx="50" cy="160" r="5" fill="#ef4444" />
          <circle cx="250" cy="40" r="5" fill="#3b82f6" />
          <circle cx="130" cy="120" r="4" fill="#f59e0b" />
          <circle cx="170" cy="80" r="4" fill="#f59e0b" />
          <text x="35" y="175" fill="#ef4444" fontWeight="bold">A</text>
          <text x="260" y="35" fill="#3b82f6" fontWeight="bold">B</text>
          <text x="145" y="110" fill="#f59e0b" fontWeight="bold">C</text>
        </svg>
      </div>
    );
  }
  return null;
};

// ----------------------------------------------------
// KaTeX 텍스트 혼합 파서
// ----------------------------------------------------
const parseKaTeXText = (text) => {
  if (!text) return null;
  const parts = [];
  let currentIdx = 0;
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\n)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > currentIdx) {
      parts.push(<span key={`t-${currentIdx}`}>{text.substring(currentIdx, match.index)}</span>);
    }
    const mathStr = match[0];
    if (mathStr === '\n') {
      parts.push(<div style={{ height: '0.5rem' }} key={`br-${match.index}`} />);
    } else if (mathStr.startsWith('$$')) {
      const eq = mathStr.slice(2, -2);
      let html = '';
      try { html = katex.renderToString(eq, { throwOnError: false, displayMode: true, strict: false, trust: true }); }
      catch { html = `<span style="color:#ef4444">${mathStr}</span>`; }
      parts.push(<div key={`m-${match.index}`} style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: html }} />);
    } else {
      const eq = mathStr.slice(1, -1);
      let html = '';
      try { html = katex.renderToString(eq, { throwOnError: false, displayMode: false, strict: false, trust: true }); }
      catch { html = `<span style="color:#ef4444">${mathStr}</span>`; }
      parts.push(<span key={`m-${match.index}`} dangerouslySetInnerHTML={{ __html: html }} />);
    }
    currentIdx = match.index + mathStr.length;
  }
  
  if (currentIdx < text.length) {
    parts.push(<span key={`t-${currentIdx}`}>{text.substring(currentIdx)}</span>);
  }
  return parts;
};

// ----------------------------------------------------
// 원장님 지시 기반의 수능레이아웃 페이징 엔진 개선판 (상하 좌우 초 광활한 간격)
// ----------------------------------------------------
const getPageLayouts = (questions) => {
  return [
    questions.slice(0, 4),   // P1: 1~4
    questions.slice(4, 8),   // P2: 5~8 (원장님 지시사항: 5~8번까지만 1페이지)
    questions.slice(8, 10),  // P3: 9~10 (2문제 널찍하게)
    questions.slice(10, 12), // P4: 11~12 (2문제)
    questions.slice(12, 14), // P5: 13~14 (2문제, 킬러 돌입 전)
    questions.slice(14, 15), // P6: 15 (객관식 초킬러, 혼자 1페이지 독식)
    questions.slice(15, 19), // P7: 16~19 (단답형 3점, 4문제)
    questions.slice(19, 20), // P8: 20 (단답형 4점, 혼자 1페이지 독식)
    questions.slice(20, 22), // P9: 21~22 (단답형 킬러 2개, 1페이지)
    questions.slice(22, 24), // P10: 23~24 (선택과목 2문제)
    questions.slice(24, 26), // P11: 25~26 (선택과목 2문제)
    questions.slice(26, 28), // P12: 27~28 (선택과목 2문제)
    questions.slice(28, 30), // P13: 29~30 (선택과목 킬러 2문제)
  ].filter(p => p.length > 0);
};

export default function MentosMockExam() {
  console.log('MockExam 들어옴');
  const navigate = useNavigate();
  const location = useLocation();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [viewingHint, setViewingHint] = useState(null); // 문항 ID 저장
  const [isMobile, setIsMobile] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Use state from navigation if available
  const [electiveMode, setElectiveMode] = useState(location.state?.elective || 'calculus'); // 'calculus' | 'statistics'
  const [currentVolume, setCurrentVolume] = useState(() => {
    const t = location.state?.title;
    if (t) {
      if (t.includes('제 1회')) return 0;
      if (t.includes('제 2회')) return 1;
      if (t.includes('제 3회')) return 2;
      if (t.includes('제 4회')) return 3;
      if (t.includes('제 5회')) return 4;
      if (t.includes('제 6회')) return 5;
      if (t.includes('제 7회')) return 6;
      if (t.includes('제 8회')) return 7;
      if (t.includes('제 9회')) return 8;
      if (t.includes('제 10회')) return 9;
      if (t.includes('제 11회')) return 10;
      if (t.includes('제 12회')) return 11;
    }
    return location.state?.volume || 0;
  }); // 0 ~ 11 (총 12회)
  const [weaknessReport, setWeaknessReport] = useState(null); // 취약 분석 리포트 상태
  const [showTeacherSelect, setShowTeacherSelect] = useState(false); // 선생님 선택 화면 상태
  const [reviewMode, setReviewMode] = useState(null); // 보강 모드 상태 (틀린 문제 배열)
  const [reviewProblemIndex, setReviewProblemIndex] = useState(0); // 현재 보강 문제 인덱스
  const [reviewShowAnswer, setReviewShowAnswer] = useState(false); // 정답 표시 여부
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // ── location.state 변경 시 반응형 업데이트 (사이드바에서 다른 모의고사 클릭 시) ──
  useEffect(() => {
    if (location.state?.title) {
      const t = location.state.title;
      let vol = 0;
      if (t.includes('제 1회')) vol = 0;
      else if (t.includes('제 2회')) vol = 1;
      else if (t.includes('제 3회')) vol = 2;
      else if (t.includes('제 4회')) vol = 3;
      else if (t.includes('제 5회')) vol = 4;
      else if (t.includes('제 6회')) vol = 5;
      else if (t.includes('제 7회')) vol = 6;
      else if (t.includes('제 8회')) vol = 7;
      else if (t.includes('제 9회')) vol = 8;
      else if (t.includes('제 10회')) vol = 9;
      else if (t.includes('제 11회')) vol = 10;
      else if (t.includes('제 12회')) vol = 11;
      const isPaid = localStorage.getItem('mentos_is_paid') === 'true';
      if (vol > 0 && !isPaid) {
        setShowPaywall(true);
        return;
      }
      setCurrentVolume(vol);
    } else if (location.state?.volume !== undefined) {
      const vol = location.state.volume;
      const isPaid = localStorage.getItem('mentos_is_paid') === 'true';
      if (vol > 0 && !isPaid) {
        setShowPaywall(true);
        return;
      }
      setCurrentVolume(vol);
    }
    if (location.state?.elective) {
      setElectiveMode(location.state.elective);
    }
    // 모의고사 전환 시 이전 상태 초기화
    setSelectedAnswers({});
    setShowAnalysis(false);
    setAnalysisData(null);
    setWeaknessReport(null);
    setReviewMode(null);
    setViewingHint(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // 모의고사/과목 변경 또는 컴포넌트 언마운트 시 오디오 정지
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  useEffect(() => {
    if (audioInstance) {
      audioInstance.pause();
      setAudioInstance(null);
    }
    setPlayingAudioId(null);
  }, [currentVolume, electiveMode]);

  const handleToggleAudio = (qId) => {
    if (playingAudioId === qId) {
      if (audioInstance) {
        audioInstance.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioInstance) {
        audioInstance.pause();
      }
      
      const folderName = `20260504모의고사1회${electiveMode === 'calculus' ? '미적분' : '확통'}`;
      const qNum = String(qId).padStart(3, '0');
      const audioPath = `/audio/suneung_tts/${folderName}_${qNum}.mp3`;
      
      const newAudio = new Audio(audioPath);
      newAudio.play().catch(err => {
        console.error("Audio playback error:", err);
      });
      
      newAudio.onended = () => {
        setPlayingAudioId(null);
      };
      
      setAudioInstance(newAudio);
      setPlayingAudioId(qId);
    }
  };

  // 선택 과목 및 회차 전환
  const data = getMockExamData(currentVolume, electiveMode);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.8));

  const toggleAnswer = (qId, optionIdxOrVal) => {
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      if (newAnswers[qId] === optionIdxOrVal) {
        delete newAnswers[qId];
      } else {
        newAnswers[qId] = optionIdxOrVal;
      }
      return newAnswers;
    });
  };

  const submitExam = async () => {
    let score = 0;
    const wrongIds = [];
    
    let examType = '';
    let year = '';

    if (currentVolume >= 0 && currentVolume <= 2) {
        examType = '6월';
        year = currentVolume === 0 ? '2025' : currentVolume === 1 ? '2024' : '2023';
    } else if (currentVolume >= 3 && currentVolume <= 5) {
        examType = '수능';
        year = currentVolume === 3 ? '2025' : currentVolume === 4 ? '2024' : '2023';
    } else if (currentVolume >= 6 && currentVolume <= 8) {
        examType = '9월';
        year = currentVolume === 6 ? '2025' : currentVolume === 7 ? '2024' : '2023';
    } else if (currentVolume >= 9 && currentVolume <= 11) {
        examType = '3월';
        year = currentVolume === 9 ? '2026' : currentVolume === 10 ? '2025' : '2024';
    }

    const subject = electiveMode === 'calculus' ? '미적분' : '확통';
    
    const questionsWithMeta = data.questions.filter(q => (q.text && q.text.trim() !== "") || q.picture).map(q => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected !== undefined && String(selected).trim() === String(q.answer).trim();
      
      if (isCorrect) {
        score += parseInt(q.type) || 0;
      } else {
        wrongIds.push(q.id);
      }
      
      let meta = {};
      try {
        meta = getMetadataForProblem(year, examType, subject, q.id) || {};
      } catch (e) {}
      
      return {
        id: q.id,
        unit: q.unit || meta.unit || '기타단원',
        level: q.level || meta.level || 3,
        problemType: q.problemType || meta.subunit || '일반유형',
        concept: q.concept || meta.concept || []
      };
    });

    const { report, drillSet } = WeaknessAnalysisEngine.analyzeAndGenerateDrill(questionsWithMeta, wrongIds);
    
    // Map to old report format for UI
    const topWeakUnitsForUI = report.topWeakUnits.map((wu, idx) => {
        const drill = drillSet.find(d => d.unit === wu.unit);
        const reviewProblems = drill ? drill.drillQuestions.map((dq, i) => ({
            id: dq.drillId,
            level: dq.level,
            title: `[보강] ${dq.unit} 핵심유형 ${i+1}`,
            tag: dq.tag,
            questionText: `**${dq.unit} 보강문제 ${i+1} (난이도 ${dq.level}단계)**\n\n이 문제는 오답 분석을 통해 특별히 배정된 맞춤형 문제입니다.`
        })) : [];
        
        return {
            unit: wu.unit,
            subunit: wu.unit,
            wrongProblems: wu.wrongQuestionNumbers || [],
            pcbs: { P: 0, C: 0, B: 0, S: 0 },
            reviewProblems
        };
    });

    setWeaknessReport({ 
        score, 
        wrong: data.questions.filter(q => wrongIds.includes(q.id)), 
        topWeakUnits: topWeakUnitsForUI, 
        weakPcbs: [`${report.topWeakType} (가장 취약한 유형)`]
    });
    
    setShowAnalysis(true);
    trackApiCall('weakness_analysis', { reason: 'G3 모의고사 진단 분석' });
  };

  const pages = getPageLayouts(data.questions);

  // 킬러 문항 리스트: 사용자가 지정한 10~15, 21, 22, 27~30
  const killerIds = [10, 11, 12, 13, 14, 15, 21, 22, 27, 28, 29, 30];

  return (
    <div className="full-center" style={{ background: '#e2e8f0', minHeight: '100vh', padding: '0', color: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' }}>
      
      {/* Top Banner (Fixed) */}
      <div className="mock-exam-header" style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 2rem' }}>
        <div className="mock-exam-header-left" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <h1 className="mock-exam-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{data.title}</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{data.subtitle}</p>
          </div>
          <div className="mock-exam-badge" style={{ background: 'linear-gradient(to right, #f59e0b, #ef4444)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)' }}>
            🔥 고3 3등급 이상 전용: 1회 무료 프리미엄 진단 진행중
          </div>
          
          {/* 선택과목 토글 탭 */}
          <div className="mock-exam-elective-toggle" style={{ display: 'flex', background: '#f1f5f9', padding: '0.3rem', borderRadius: '8px' }}>
            <button 
              onClick={() => setElectiveMode('calculus')}
              style={{
                background: electiveMode === 'calculus' ? '#fff' : 'transparent',
                color: electiveMode === 'calculus' ? '#0f172a' : '#64748b',
                boxShadow: electiveMode === 'calculus' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              미적분
            </button>
            <button 
              onClick={() => setElectiveMode('statistics')}
              style={{
                background: electiveMode === 'statistics' ? '#fff' : 'transparent',
                color: electiveMode === 'statistics' ? '#0f172a' : '#64748b',
                boxShadow: electiveMode === 'statistics' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              확률과 통계
            </button>
          </div>
        </div>
        
        <div className="mock-exam-header-right" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          
          {/* 모의고사 10회차 선택 드롭다운 */}
          <div className="mock-volume-select-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f8fafc', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem' }}>회차 선택</span>
            <select 
              value={currentVolume} 
              onChange={(e) => {
                const val = Number(e.target.value);
                const isPaid = localStorage.getItem('mentos_is_paid') === 'true';
                if (val > 0 && !isPaid) {
                  setShowPaywall(true);
                  return;
                }
                setCurrentVolume(val);
                setSelectedAnswers({}); // 회차 변경 시 OMR 초기화
              }}
              style={{ fontWeight: 'bold', fontSize: '1rem', padding: '0.3rem', border: '1px solid #94a3b8', borderRadius: '4px' }}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '제 1회 고3 6월 모의고사 (2025학년도)' : 
                   i === 1 ? '제 2회 고3 6월 모의고사 (2024학년도)' : 
                   i === 2 ? '제 3회 고3 6월 모의고사 (2023학년도)' : 
                   i === 3 ? '제 4회 고3 수능 기출 (2025학년도)' : 
                   i === 4 ? '제 5회 고3 수능 기출 (2024학년도)' : 
                   i === 5 ? '제 6회 고3 수능 기출 (2023학년도)' : 
                   i === 6 ? '제 7회 고3 9월 모의고사 (2025학년도)' : 
                   i === 7 ? '제 8회 고3 9월 모의고사 (2024학년도)' : 
                   i === 8 ? '제 9회 고3 9월 모의고사 (2023학년도)' : 
                   i === 9 ? '제 10회 고3 3월 모의고사 (2026학년도)' : 
                   i === 10 ? '제 11회 고3 3월 모의고사 (2025학년도)' : 
                   i === 11 ? '제 12회 고3 3월 모의고사 (2024학년도)' : 
                   `MENTOS 모의고사 제 ${i + 1}회`}
                </option>
              ))}
            </select>
          </div>

          <div className="mock-zoom-control" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button onClick={handleZoomOut} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#475569' }}><Minimize2 size={18} /></button>
            <span style={{ padding: '0.5rem', fontWeight: 'bold', color: '#334155', minWidth: '60px', textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</span>
            <button onClick={handleZoomIn} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#475569' }}><Maximize2 size={18} /></button>
          </div>
          <button className="btn-primary mock-submit-btn-top" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.8rem 1.5rem', borderRadius: '8px' }} onClick={submitExam}>
            <CheckCircle size={16} /> 최종 표기 제출
          </button>
        </div>
      </div>

      <div className="mock-exam-body" style={{ display: 'flex', width: '100%', height: '100%', marginTop: '70px', padding: '2rem', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Exam Papers Scroll Area */}
        <div className="exam-papers-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center' }}>
          {pages.map((pageQuestions, pageIndex) => (
            <div key={pageIndex} className="exam-paper-page" style={{ 
              background: '#fff', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
              width: '100%',
              maxWidth: '960px',
              padding: '3rem 4rem', 
              zoom: zoomLevel,
              transition: 'zoom 0.2s ease-out',
              minHeight: '1360px', // A3 세로 비율 모방
              position: 'relative'
            }}>
              
              {/* Header */}
              {pageIndex === 0 && (
                <div style={{ borderBottom: '3px solid #0f172a', paddingBottom: '1rem', marginBottom: '3rem', textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', fontFamily: '"Noto Serif KR", serif' }}>수학 영역</h2>
                  <div style={{ position: 'absolute', top: '3rem', right: '3rem', border: '2px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '50%', fontWeight: 'bold', transform: 'rotate(-15deg)', fontSize: '1.2rem', opacity: 0.8 }}>
                    멘토스 모의고사
                  </div>
                </div>
              )}
              {/* 선택과목 전환 페이지용 헤더 (9페이지 즉 인덱스 8이 23번 시작) */}
              {pageQuestions[0]?.id === 23 && (
                 <div style={{ borderBottom: '3px solid #0f172a', paddingBottom: '1rem', marginBottom: '3rem', textAlign: 'center' }}>
                 <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', fontFamily: '"Noto Serif KR", serif' }}>
                   수학 영역 ({electiveMode === 'calculus' ? '미적분' : '확률과 통계'})
                 </h2>
               </div>
              )}
              {pageIndex > 0 && pageQuestions[0]?.id !== 23 && (
                <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '1rem', marginBottom: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  수학 영역 ( {pageIndex + 1} / {pages.length} )
                </div>
              )}

              {/* 2단 다단 렌더링 엔진 (Grid 활용하여 완벽한 간격 분리) */}
              <div className="exam-questions-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: pageQuestions.length > 1 ? '1fr 1fr' : '1fr', 
                gap: '8rem 6rem', // 상하 늘리고 좌우 늘림
                height: '100%',
                alignContent: 'start'
              }}>
                {pageQuestions.map((q) => (
                  <div key={q.id} className="mock-question-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: pageQuestions.length > 2 ? '450px' : 'auto' }}>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <div className="mock-question-num" style={{ fontSize: '1.6rem', fontWeight: '900', fontFamily: '"Noto Serif KR", serif', width: '30px' }}>
                        {q.id}.
                      </div>
                      <div className="mock-question-content" style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.1rem', lineHeight: '1.9', letterSpacing: '-0.3px', fontFamily: '"KoPub Batang", "Noto Serif KR", serif' }}>
                           {q.picture ? (
                               <div style={{ textAlign: 'center', width: '100%' }}>
                                  <img src={q.picture} alt={`Question ${q.id}`} className="mock-question-img" style={{ maxWidth: '600px', width: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                               </div>
                           ) : (
                               <>
                                   {parseKaTeXText(q.text)}
                                   <span style={{ float: 'right', fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', marginLeft: '0.5rem' }}>[{q.type}]</span>
                               </>
                           )}
                        </div>
                      </div>
                    </div>

                    {currentVolume === 0 && q.id <= 10 && (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.2rem', marginBottom: '0.2rem', paddingLeft: '38px' }}>
                        <button
                          onClick={() => handleToggleAudio(q.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: playingAudioId === q.id 
                              ? 'linear-gradient(135deg, hsl(263, 90%, 50%), hsl(280, 85%, 55%))' 
                              : 'rgba(241, 245, 249, 0.9)',
                            color: playingAudioId === q.id ? '#ffffff' : 'hsl(215, 25%, 27%)',
                            border: playingAudioId === q.id ? 'none' : '1px solid hsl(214, 32%, 91%)',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: playingAudioId === q.id 
                              ? '0 4px 12px rgba(139, 92, 246, 0.4), 0 0 0 2px rgba(139, 92, 246, 0.2)' 
                              : '0 2px 4px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: 'scale(1)',
                            outline: 'none',
                          }}
                          className="avs-audio-btn"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                            if (playingAudioId !== q.id) {
                              e.currentTarget.style.background = '#e2e8f0';
                            } else {
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5), 0 0 0 3px rgba(139, 92, 246, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                            if (playingAudioId !== q.id) {
                              e.currentTarget.style.background = 'rgba(241, 245, 249, 0.9)';
                            } else {
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4), 0 0 0 2px rgba(139, 92, 246, 0.2)';
                            }
                          }}
                        >
                          {playingAudioId === q.id ? (
                            <>
                              <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '12px' }}>
                                <span style={{ width: '2px', height: '100%', background: '#fff', animation: 'avsBounce 0.8s ease-in-out infinite alternate', borderRadius: '1px' }}></span>
                                <span style={{ width: '2px', height: '60%', background: '#fff', animation: 'avsBounce 0.8s ease-in-out infinite alternate 0.2s', borderRadius: '1px' }}></span>
                                <span style={{ width: '2px', height: '80%', background: '#fff', animation: 'avsBounce 0.8s ease-in-out infinite alternate 0.4s', borderRadius: '1px' }}></span>
                              </div>
                              <Pause size={13} style={{ strokeWidth: 3 }} />
                              <span>해설 음성 듣는 중...</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={14} style={{ color: 'hsl(262, 83%, 58%)' }} />
                              <Play size={11} fill="currentColor" style={{ marginLeft: '-2px' }} />
                              <span>AVS AI 해설 듣기 (shimmer)</span>
                            </>
                          )}
                        </button>
                        <style>{`
                          @keyframes avsBounce {
                            0% { height: 3px; }
                            100% { height: 12px; }
                          }
                        `}</style>
                      </div>
                    )}

                    {q.figure && <GeometryFigure type={q.figure} />}

                    {/* 객관식 - 3칸/2칸 그리드 정렬 (원장님 지시사항) */}
                    {q.options && q.options.length > 0 && (
                      <div style={{ marginTop: '1.5rem', paddingLeft: '2rem' }}>
                        <div className="mock-options-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                          {q.options.slice(0, 3).map((opt, optIndex) => {
                            const isSelected = selectedAnswers[q.id] === optIndex;
                            return (
                              <div key={optIndex} onClick={() => toggleAnswer(q.id, optIndex)} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                                <div style={{ 
                                  width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: isSelected ? '#334155' : 'transparent', color: isSelected ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0, marginTop: '4px'
                                }}>
                                  {['①', '②', '③'][optIndex]}
                                </div>
                                <span style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>{parseKaTeXText(opt)}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mock-options-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                          {q.options.slice(3, 5).map((opt, optIndex) => {
                            const actualIdx = optIndex + 3;
                            const isSelected = selectedAnswers[q.id] === actualIdx;
                            return (
                              <div key={actualIdx} onClick={() => toggleAnswer(q.id, actualIdx)} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                                <div style={{ 
                                  width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: isSelected ? '#334155' : 'transparent', color: isSelected ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0, marginTop: '4px'
                                }}>
                                  {['④', '⑤'][optIndex]}
                                </div>
                                <span style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>{parseKaTeXText(opt)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* 주관식 단답형 입력 필드 */}
                    {(!q.options || q.options.length === 0) && (
                      <div className="mock-subjective-input-area" style={{ marginTop: '2rem', paddingLeft: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#64748b' }}>정답 : </span>
                          <input 
                            type="text" 
                            placeholder="단답형 입력"
                            value={selectedAnswers[q.id] || ''}
                            onChange={(e) => toggleAnswer(q.id, e.target.value)}
                            style={{ 
                              padding: '0.8rem 1.5rem', fontSize: '1.2rem', 
                              border: '0', borderBottom: '2px solid #334155',
                              background: 'rgba(255,255,255,0.5)', width: '150px',
                              textAlign: 'center', fontWeight: 'bold'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Fixed OMR Answer Sheet Panel */}
        <div className="mock-omr-panel" style={{ 
          position: 'sticky', top: '90px', width: '380px', background: '#fff', borderRadius: '16px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1' 
        }}>
          <div style={{ background: '#1e293b', padding: '1.5rem', color: '#fff', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>MENTOS OMR 판독기</h3>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>자동 채점 및 클리닉 연동</p>
          </div>
          
          <div style={{ padding: '1rem', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {data.questions.map((q) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ width: '40px', fontWeight: '900', fontSize: '1.1rem', color: '#334155', textAlign: 'center' }}>
                  {String(q.id).padStart(2, '0')}
                </span>
                
                <div style={{ display: 'flex', gap: '0.4rem', flex: 1, justifyContent: 'center' }}>
                  {q.options && q.options.length > 0 ? (
                    // 객관식 OMR
                    [0, 1, 2, 3, 4].map((optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      return (
                        <div 
                          key={optIdx} 
                          onClick={() => toggleAnswer(q.id, optIdx)}
                          style={{
                            width: '28px', height: '14px', borderRadius: '2px', // 실제 OMR처럼 직사각형
                            border: '1px solid #94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', background: isSelected ? '#1e293b' : '#fff', transition: 'all 0.1s'
                          }}
                        >
                          {!isSelected && <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold' }}>{optIdx + 1}</span>}
                        </div>
                      );
                    })
                  ) : (
                     // 주관식 OMR 표기
                    <div style={{ width: '100%', padding: '0 1rem' }}>
                      <input 
                        type="text" 
                        placeholder="..." 
                        value={selectedAnswers[q.id] || ''}
                        onChange={(e) => toggleAnswer(q.id, e.target.value)}
                        style={{ width: '100%', height: '24px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', background: '#f8fafc' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem', color: '#475569' }}>
               <span>작성 현황:</span>
               <strong style={{ color: '#3b82f6' }}>{Object.keys(selectedAnswers).length} / 30 문항</strong>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px', boxShadow: '0 10px 20px rgba(59,130,246,0.3)' }} onClick={submitExam}>
              최종 답안 제출
            </button>
          </div>
        </div>
      </div>

      {/* 채점 완료 및 클리닉 발동 모달 */}
      {showAnalysis && weaknessReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '3rem', maxWidth: '650px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>이번 시험 취약 분석</h2>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', display: 'inline-block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem' }}>
                🎁 1회 무료 혜택 적용 완료 (고3 3등급 이상)
              </div>
              <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 'bold' }}>총점: <span style={{ color: '#0f172a', fontSize: '1.5rem' }}>{weaknessReport.score}</span> / 100점</p>
            </div>

            {/* 오답 리스트 및 취약 분석 내역 */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '2rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#334155' }}>❌ 틀린 문항</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {weaknessReport.wrong.length > 0 ? weaknessReport.wrong.map(q => (
                      <span key={q.id} style={{ background: '#fff', padding: '0.3rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                        {q.id}번
                      </span>
                    )) : <span style={{ color: '#10b981', fontWeight: 'bold' }}>100점 만점입니다! 틀린 문항이 없습니다.</span>}
                  </div>
                </div>
              </div>

              {/* 킬러 문항 해설 애니메이션 연결 (정답 여부와 무관하게 무조건 복습 지원) */}
              {data.questions.filter(q => killerIds.includes(q.id)).length > 0 && (
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #3b82f6', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem 0', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PenTool size={18} /> 고난도 킬러 문항 (정답 여부 무관 복습 지원)
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {data.questions.filter(q => killerIds.includes(q.id)).map(q => (
                      <button 
                        key={q.id}
                        onClick={() => {
                          // 🎁 1회 무료 혜택 및 킬러 문항 복습 개방으로 결제 상태 무관하게 해설 시청 가능
                          setViewingHint(q);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', color: '#2563eb', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.1)' }}
                      >
                        {q.id}번 {q.tag} 해설 보기 <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ borderTop: '2px dashed #cbd5e1', margin: '1.5rem 0' }}></div>
              
              <h3 style={{ fontSize: '1.2rem', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #fecaca', paddingBottom: '0.5rem' }}>
                <Database size={20} /> 취약 단원 집중 분석
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                 {weaknessReport.topWeakUnits.map((u, idx) => {
                    const weakPcbsKeys = Object.keys(u.pcbs).filter(k => u.pcbs[k] > 0);
                    return (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                         <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                           {idx + 1}. {u.unit} &gt; <span style={{ color: '#3b82f6' }}>{u.subunit}</span>
                         </h4>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#475569', fontSize: '0.95rem' }}>
                           <div><strong style={{ color: '#ef4444', minWidth: '100px', display: 'inline-block' }}>틀린 문항:</strong> {u.wrongProblems.join(', ')}번</div>
                           <div><strong style={{ color: '#f59e0b', minWidth: '100px', display: 'inline-block' }}>약한 사고 단계:</strong> {weakPcbsKeys.length > 0 ? weakPcbsKeys.join(', ') : '없음'}</div>
                           <div><strong style={{ color: '#10b981', minWidth: '100px', display: 'inline-block' }}>보강 문제:</strong> {u.reviewProblems.length}문제 배정 완료</div>
                         </div>
                      </div>
                    );
                 })}
                 {weaknessReport.topWeakUnits.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>분석할 오답이 없습니다. 완벽합니다!</div>
                 )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '1.2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer' }} onClick={() => setShowAnalysis(false)}>
                화면으로 돌아가기
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '1.2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => {
                 const isPaid = localStorage.getItem('mentos_is_paid') === 'true';
                 if (!isPaid) {
                   setShowPaywall(true);
                   return;
                 }
                 setShowAnalysis(false);
                 setShowTeacherSelect(true);
              }}>
                나의 AI 선생님 매칭하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프리미엄 선생님 라인업 선택 화면 */}
      {showTeacherSelect && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0f172a', zIndex: 1000, overflowY: 'auto', padding: '4rem 2rem', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.5rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                진단 결과 기반 최적의 매칭
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '1rem' }}>멘토스 수학 1타 강사 라인업</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>실전 점수 {weaknessReport?.score}점에 가장 적합한 고3 전담 선생님을 추천합니다.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              {Object.values(HIGH_TEACHER_PROFILES)
                .filter(t => t.subject === 'math' && t.targetGrades.includes('고3'))
                .map(teacher => {
                  // 점수대별 추천 로직 (예: 80점 이상 1~2등급 강사, 60~80점 2~3등급, 그 이하 4~5등급)
                  const score = weaknessReport?.score || 0;
                  const isRecommended = (score >= 80 && teacher.targetRanks.includes('1~2등급')) ||
                                        (score >= 60 && score < 80 && teacher.targetRanks.includes('2~3등급')) ||
                                        (score < 60 && teacher.targetRanks.includes('4~5등급'));

                  return (
                    <div 
                      key={teacher.id}
                      onClick={() => {
                        localStorage.setItem("selectedMathTeacher", JSON.stringify(teacher));
                        // 보강 문제 풀기로 이동
                        setShowTeacherSelect(false);
                        const combinedReview = [...weaknessReport.wrong];
                        weaknessReport.topWeakUnits.forEach(u => {
                            combinedReview.push(...u.reviewProblems);
                        });
                        setReviewMode(combinedReview);
                        setReviewProblemIndex(0);
                        setReviewShowAnswer(false);
                      }}
                      style={{
                        background: isRecommended ? 'linear-gradient(145deg, #1e293b, #0f172a)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '32px', padding: '2.5rem',
                        border: isRecommended ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer', transition: 'all 0.3s',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: isRecommended ? '0 20px 50px -10px rgba(59,130,246,0.5)' : 'none',
                        textAlign: 'center'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-12px)';
                        if (!isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        if (!isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                    >
                      {isRecommended && (
                        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#3b82f6', color: 'white', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                          AI 추천 매칭
                        </div>
                      )}
                      
                      <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1.5rem' }}>
                        <img 
                          src={teacher.image} 
                          alt={teacher.name} 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', border: isRecommended ? '5px solid #3b82f6' : '2px solid rgba(255,255,255,0.1)', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/icons/default-avatar.webp'; }}
                        />
                      </div>

                      <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>{teacher.name} 선생님</h3>
                      <p style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.2rem' }}>{teacher.tagline}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '2rem' }}>
                        {teacher.features?.map((feat, idx) => (
                          <span key={idx} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ {feat}</span>
                        ))}
                      </div>

                      <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                        <h4 style={{ color: '#60a5fa', margin: '0 0 0.8rem 0', fontSize: '1.05rem', fontWeight: 'bold' }}>[ {teacher.routeTitle} ]</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{teacher.routeDescription}</p>
                      </div>

                      <button style={{ 
                        width: '100%', padding: '1.2rem', borderRadius: '20px', border: 'none', 
                        background: isRecommended ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.1)',
                        color: 'white', fontWeight: '900', fontSize: '1.1rem', pointerEvents: 'none',
                        boxShadow: isRecommended ? '0 10px 20px rgba(59,130,246,0.3)' : 'none'
                      }}>
                        이 선생님과 보강 시작
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 보강 모드 (문제 단위 반복 학습) */}
      {reviewMode && reviewMode.length > 0 && (() => {
        const currentQ = reviewMode[reviewProblemIndex];
        if (!currentQ) return null;
        const answerDisplay = typeof currentQ.answer === 'number'
          ? `${currentQ.answer + 1}번 (${['①','②','③','④','⑤'][currentQ.answer]})`
          : String(currentQ.answer);
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0f172a', zIndex: 9999, display: 'flex', flexDirection: 'column', color: '#f8fafc' }}>
            {/* 상단 헤더 */}
            <div style={{ 
              padding: isMobile ? '0.8rem 1rem' : '1rem 2rem', 
              background: '#1e293b', 
              borderBottom: '1px solid #334155', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'nowrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '1rem', minWidth: 0, flex: 1 }}>
                <div style={{ background: '#3b82f6', color: '#fff', padding: isMobile ? '0.2rem 0.6rem' : '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.9rem', flexShrink: 0 }}>
                  {reviewProblemIndex + 1} / {reviewMode.length}
                </div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '0.95rem' : '1.3rem', 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#f8fafc'
                }}>
                  {currentQ.id}번 문제 보강 ({currentQ.tag})
                </h2>
              </div>
              <button 
                onClick={() => { setReviewMode(null); setReviewShowAnswer(false); }} 
                style={{ 
                  background: 'transparent', 
                  color: '#94a3b8', 
                  border: 'none', 
                  fontSize: isMobile ? '0.75rem' : '1rem', 
                  cursor: 'pointer', 
                  padding: isMobile ? '0.3rem 0.6rem' : '0.5rem 1rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                ✕ 닫기
              </button>
            </div>

            {/* 본문: 좌측 문제 + 정답 | 우측 PCBS 힌트 + 애니메이션 */}
            <div style={{ display: 'flex', flex: 1, flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
              {/* 좌측: 원본 문제 + 정답 */}
              <div style={{ 
                width: isMobile ? '100%' : '45%', 
                height: isMobile ? '180px' : 'auto',
                padding: isMobile ? '1rem' : '2rem', 
                borderRight: isMobile ? 'none' : '1px solid #334155', 
                borderBottom: isMobile ? '1px solid #334155' : 'none',
                background: '#1e293b', 
                overflowY: 'auto',
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? '0.8rem' : '1.5rem',
                flexShrink: 0
              }}>
                <h3 style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>[문제 원본]</h3>
                <div style={{ 
                  fontSize: isMobile ? '0.95rem' : '1.2rem', 
                  lineHeight: isMobile ? '1.5' : '2.0', 
                  color: '#e2e8f0', 
                  fontFamily: '"KoPub Batang", "Noto Serif KR", serif' 
                }}>
                  {currentQ.picture || currentQ.image ? (
                    <img 
                      src={currentQ.picture || currentQ.image} 
                      alt={`Question ${currentQ.id}`} 
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        background: '#fff', 
                        padding: isMobile ? '0.5rem' : '1rem', 
                        maxHeight: isMobile ? '120px' : 'none', 
                        objectFit: 'contain' 
                      }} 
                    />
                  ) : (
                    parseKaTeXText(currentQ.text || currentQ.questionText)
                  )}
                  {currentQ.figure && <GeometryFigure type={currentQ.figure} />}
                </div>

                {/* 정답 확인 버튼 */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '0.8rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setReviewShowAnswer(!reviewShowAnswer)}
                    style={{ 
                      background: reviewShowAnswer ? '#10b981' : '#334155', 
                      color: '#fff', 
                      border: 'none', 
                      padding: isMobile ? '0.4rem 1rem' : '0.7rem 1.5rem', 
                      borderRadius: '8px', 
                      fontWeight: 'bold', 
                      fontSize: isMobile ? '0.8rem' : '1rem', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {reviewShowAnswer ? '정답 숨기기' : '정답 확인'}
                  </button>
                  {reviewShowAnswer && (
                    <div style={{ 
                      background: '#0f172a', 
                      border: '1px solid #10b981', 
                      borderRadius: '8px', 
                      padding: isMobile ? '0.3rem 1rem' : '0.8rem 1.5rem', 
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>정답:</span>
                      <span style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: '900', color: '#10b981' }}>{answerDisplay}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 우측: PCBS Step 힌트 + 애니메이션 힌트 */}
              <div style={{ 
                flex: 1, 
                width: '100%',
                padding: isMobile ? '0.8rem' : '2rem', 
                background: '#0f172a', 
                position: 'relative', 
                overflowY: 'auto' 
              }}>
                {(() => {
                  let examType = '6월';
                  let year = '2024';
                  if (currentVolume >= 0 && currentVolume <= 2) {
                      examType = '6월';
                      year = currentVolume === 0 ? '2025' : currentVolume === 1 ? '2024' : '2023';
                  } else if (currentVolume >= 3 && currentVolume <= 5) {
                      examType = '수능';
                      year = currentVolume === 3 ? '2025' : currentVolume === 4 ? '2024' : '2023';
                  }
                  const subject = electiveMode === 'calculus' ? '미적분' : '확통';
                  const mappedUnit = examType === '수능' 
                    ? `CSAT_${year}수능_${subject}`
                    : `CSAT_${year}_6월_${subject}`;
                  
                  let unit = mappedUnit;
                  let problemId = String(currentQ.id).padStart(3, '0');
                  
                  if (currentQ.tag && currentQ.tag.includes('/')) {
                    const tagParts = currentQ.tag.split('/');
                    unit = tagParts[0];
                    problemId = tagParts[1];
                  } else if (String(currentQ.id).startsWith('drill_') && currentQ.tag) {
                    unit = currentQ.tag;
                  }
                  
                  return (
                    <HintPlayerRouter
                      unit={unit}
                      problemId={problemId}
                      showQA={true}
                    />
                  );
                })()}
              </div>
            </div>

            {/* 하단: 이전/다음 네비게이션 */}
            <div style={{ padding: '1rem 2rem', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { if (reviewProblemIndex > 0) { setReviewProblemIndex(reviewProblemIndex - 1); setReviewShowAnswer(false); } }}
                disabled={reviewProblemIndex === 0}
                style={{ background: reviewProblemIndex === 0 ? '#334155' : '#475569', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: reviewProblemIndex === 0 ? 'default' : 'pointer', opacity: reviewProblemIndex === 0 ? 0.4 : 1 }}
              >
                ← 이전 문제
              </button>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {reviewMode.map((_, idx) => (
                  <div key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', background: idx === reviewProblemIndex ? '#3b82f6' : '#334155', transition: 'all 0.2s' }} />
                ))}
              <button
                onClick={() => {
                  if (reviewProblemIndex < reviewMode.length - 1) {
                    setReviewProblemIndex(reviewProblemIndex + 1);
                    setReviewShowAnswer(false);
                  } else {
                    const isG3Flow = location.state?.gradeFlow === '고3';
                    if (isG3Flow) {
                       alert("보강 학습이 완료되었습니다! 실력이 쑥쑥 향상된 것이 느껴지시나요? \n\n재분석 결과: [삼각함수/수열] 단원의 정답률이 20% -> 90%로 상승했습니다. \n이제 전체 커리큘럼(미적분/확통 전체)을 개방하기 위해 결제가 필요합니다.");
                       trackApiCall('gate_trigger', { reason: 'G3_mock_review_complete' });
                       setShowPaywall(true);
                    } else {
                       setReviewMode(null);
                       setReviewShowAnswer(false);
                    }
                  }
                }}
                style={{ background: reviewProblemIndex < reviewMode.length - 1 ? '#3b82f6' : '#10b981', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
              >
                {reviewProblemIndex < reviewMode.length - 1 ? '다음 문제 →' : '✓ 보강 완료'}
              </button>
            </div>
          </div>
        </div>
      );
    })()}

      {/* 실시간 펜 애니메이션 힌트 UI 오버레이 */}
      {viewingHint && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0f172a', zIndex: 9999, display: 'flex', flexDirection: 'column', color: '#f8fafc' }}>
          
          <div style={{ 
            padding: isMobile ? '0.8rem 1rem' : '1.5rem 2.5rem', 
            background: '#1e293b', 
            borderBottom: '1px solid #334155', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'nowrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '1rem', minWidth: 0, flex: 1 }}>
              {!isMobile && (
                <div style={{ background: '#3b82f6', color: '#fff', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                  PCBS 멘토스 튜터링
                </div>
              )}
              <h2 style={{ 
                margin: 0, 
                fontSize: isMobile ? '0.95rem' : '1.4rem', 
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#f8fafc'
              }}>
                {viewingHint.id}번 문항 ({viewingHint.tag}) 힌트해설
              </h2>
            </div>
            <button 
              onClick={() => setViewingHint(null)} 
              style={{ 
                background: '#ef4444', 
                color: '#fff', 
                border: 'none', 
                fontSize: isMobile ? '0.75rem' : '1rem', 
                cursor: 'pointer', 
                padding: isMobile ? '0.3rem 0.6rem' : '0.5rem 1rem', 
                borderRadius: '8px',
                fontWeight: 'bold',
                flexShrink: 0,
                marginLeft: '0.5rem'
              }}
            >
              ✕ 닫기
            </button>
          </div>
          
          <div style={{ display: 'flex', flex: 1, flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
            {/* 좌측: 원본 문제 */}
            <div style={{ 
              width: isMobile ? '100%' : '45%', 
              height: isMobile ? '180px' : 'auto',
              padding: isMobile ? '1rem' : '3rem', 
              borderRight: isMobile ? 'none' : '1px solid #334155', 
              borderBottom: isMobile ? '1px solid #334155' : 'none',
              background: '#1e293b', 
              overflowY: 'auto',
              flexShrink: 0
            }}>
              <h3 style={{ color: '#94a3b8', marginBottom: isMobile ? '0.5rem' : '2rem', fontSize: '0.9rem', marginTop: 0 }}>[문제 원본]</h3>
              <div style={{ 
                fontSize: isMobile ? '0.95rem' : '1.3rem', 
                lineHeight: isMobile ? '1.5' : '2.0', 
                color: '#e2e8f0', 
                fontFamily: '"KoPub Batang", "Noto Serif KR", serif' 
              }}>
                {viewingHint.picture && (
                    <img src={viewingHint.picture} alt={`Question ${viewingHint.id}`} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', background: '#fff', padding: '0.5rem', maxHeight: isMobile ? '120px' : 'none', objectFit: 'contain' }} />
                )}
                {!viewingHint.picture && parseKaTeXText(viewingHint.text)}
              </div>
            </div>

            {/* 우측: 애니메이션 힌트 플레이어 & AI QA */}
            <div style={{ 
              flex: 1, 
              width: '100%',
              padding: isMobile ? '0.8rem' : '2rem', 
              background: '#0f172a', 
              position: 'relative', 
              overflowY: 'auto' 
            }}>
               {(() => {
                 let unit = '삼각함수활용2단계';
                 let problemId = String(viewingHint.id).padStart(3, '0');
                 if (viewingHint.tag) {
                   if (viewingHint.tag.includes('/')) {
                     const tagParts = viewingHint.tag.split('/');
                     unit = tagParts[0];
                     problemId = tagParts[1];
                   } else {
                     unit = viewingHint.tag;
                   }
                 } else {
                   unit = viewingHint.tag && viewingHint.tag.startsWith('CSAT_') 
                         ? viewingHint.tag
                         : '삼각함수활용2단계';
                 }
                 return (
                   <HintPlayerRouter 
                      unit={unit} 
                      problemId={problemId} 
                      showQA={true} 
                   />
                 );
               })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── 고3 프리미엄 전용 페이월 오버레이 ─── */}
      {showPaywall && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9, 9, 11, 0.94)',
          zIndex: 160000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(20px)', padding: '1rem'
        }}>
          <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(100px)', top: '15%', pointerEvents: 'none' }} />
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            width: '100%', maxWidth: '540px',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
            color: 'white'
          }}>
            {/* Crown or Premium Icon Badge */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <PenTool size={38} color="#8b5cf6" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
              고3 프리미엄 전 과정 무제한 패스
            </h2>
            
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              1회 무료 진단이 성공적으로 완료되었습니다! 
              <br />
              나의 취약 오답 클리닉 분석, 1타 강사 초밀착 보강 풀이, 
              <br />
              그리고 2회차 이후의 12회차 실전 모의고사까지 
              <br />
              무제한 패스로 성적 수직 상승을 경험하세요.
            </p>

            {/* Curriculum Spec Block */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '24px',
              padding: '1.2rem',
              marginBottom: '1.8rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}><strong>주 2회, 회당 2시간</strong> 입체 집중 관리 프로그램</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}><strong>수학 1타 고3 전담 선생님</strong> 1:1 맞춤 배정 및 피드백</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>PCBS 실시간 필기 AVS 애니메이션 해설 제공</span>
              </div>
            </div>

            {/* Launching Promotion Price details inside block */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)',
              padding: '1rem 1.4rem', borderRadius: '18px', marginBottom: '2rem'
            }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#f472b6', fontWeight: 'bold', display: 'block' }}>선착순 1,000명 한정 런칭 초특가</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '950', color: '#c084fc' }}>월 45,000원</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>3개월 후 정상가 99,000원 인상</span>
                <br />
                <span style={{ color: '#f87171' }}>★ 잔여 혜택 수량 소량 남음</span>
              </div>
            </div>

            {/* Call To Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => setShowCheckout(true)}
                style={{
                  width: '100%', padding: '1.1rem', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                }}
              >
                <CreditCard size={18} /> 프리미엄 혜택 즉시 적용하기
              </button>
              
              <button 
                onClick={() => {
                  setShowPaywall(false);
                }}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                1회 모의고사 결과 화면에 머무르기
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && <PaymentCheckoutModal onClose={() => setShowCheckout(false)} />}

    </div>
  );
}
