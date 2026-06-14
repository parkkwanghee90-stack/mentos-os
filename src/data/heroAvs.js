/**
 * heroAvs.js — 랜딩 Hero에 노출하는 AVS 데모 1문제.
 *
 * 출처: 수학(상) 원의 방정식 4단계 015 (math_hints/circle_eq_step4/015.json, Claude 작성 PCBSA)
 * 음성: math-tts/circle_s4/015.mp3 (이미 생성됨) → heroTts.js 가 재생
 *
 * 문제: 점 A(4,0)와 원 x²+y²=4 위의 임의의 점 Q를 이은 선분의 중점 P의
 *       자취 (x-a)²+(y-b)²=r² 일 때 a+b+r 의 값?  → 정답 3
 */
export const HERO_AVS = {
  unit: '수학(상) · 원의 방정식',
  answer: '3',
  ttsPath: 'circle_s4/015.mp3',

  // 도형: 원점 원(반지름2) + 외부의 점 A(4,0). 정답 단계에서 중점의 자취(점선 원)도 표시.
  figure: {
    view: { xmin: -3.4, xmax: 5.4, ymin: -3.2, ymax: 3.2 },
    circle: { cx: 0, cy: 0, r: 2, label: "x^2+y^2=4" },
    point: { x: 4, y: 0, label: 'A' },
    locus: { cx: 2, cy: 0, r: 1, label: '(x-2)^2+y^2=1' }, // 결과(자취) — showLocusFrom 단계부터 노출
    showLocusFrom: 6,
  },

  // 8단계: 문제제시 → P → C → B → Step1 → Step2 → Step3 → 정답
  steps: [
    { tag: '문제', title: '문제 제시',
      text: '점 A(4,0)와 원 위의 임의의 점 Q를 이은 선분의 중점 P가 그리는 자취는?',
      latex: 'x^2+y^2=4' },
    { tag: 'P', title: '구하는 것',
      text: '중점 P(x, y)가 그리는 자취의 방정식',
      latex: '(x-a)^2+(y-b)^2=r^2' },
    { tag: 'C', title: '주어진 단서',
      text: '원 위의 점 Q(x′, y′)와 중점 P의 관계',
      latex: "x=\\dfrac{x'+4}{2},\\quad y=\\dfrac{y'}{2}" },
    { tag: 'B', title: '배경지식',
      text: '매개점 Q를 P로 나타내 원의 식에 대입(소거)한다',
      latex: "x'^2+y'^2=4" },
    { tag: 'Step 1', title: '식 세우기',
      text: "x′ = 2x − 4,  y′ = 2y 를 원의 식에 대입",
      latex: '(2x-4)^2+(2y)^2=4' },
    { tag: 'Step 2', title: '전개·정리',
      text: '전개하여 정리한다',
      latex: '4(x-2)^2+4y^2=4' },
    { tag: 'Step 3', title: '자취 확인',
      text: '양변을 4로 나누면 중심 (2, 0), 반지름 1인 원',
      latex: '(x-2)^2+y^2=1' },
    { tag: '정답', title: '최종 정답',
      text: 'a + b + r = 2 + 0 + 1',
      latex: '\\therefore a+b+r=3' },
  ],
};
