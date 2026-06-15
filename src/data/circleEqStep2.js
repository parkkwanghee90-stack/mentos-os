/**
 * 원의 방정식 2단계 — 단계별 도형 작도 애니메이션 데이터 (새 기능).
 * 각 문제의 hint 는 GeometryHintPlayer(steps[].math.objects 누적) 규격.
 *  - 단계마다 "새로 추가되는" 도형 객체만 적는다(플레이어가 0..현재 단계를 누적 렌더).
 *  - 한글은 수식($...$) 밖에 둔다.
 * 렌더러: src/components/hints/GeometryHintPlayer.jsx → MathCanvas(Mafs).
 */

const VB = { x: [-3.4, 3.4], y: [-3.2, 4.6] }; // 공통 보기창(원 반지름2 + 포물선)

export const CIRCLE_EQ_STEP2 = [
  {
    number: 1,
    questionText:
      '이차함수 $f(x) = ax^2 + b \\ (a > 0)$ 과 원 $x^2 + y^2 = 4$ 의 교점이 원의 둘레를 삼등분할 때, $f(5)$ 의 값을 구하시오.',
    answer: '23',
    hint: {
      type: 'geometry',
      title: '원의 방정식 2단계 · 포물선과 원의 삼등분 교점',
      steps: [
        {
          label: '1단계',
          text: '반지름 2인 원을 그린다',
          lines: [
            { content: '원 $x^2+y^2=4$ 는 중심이 원점 $O$, 반지름이 $2$ 인 원이다.' },
          ],
          math: {
            viewBox: VB,
            objects: [
              { type: 'axes' },
              { type: 'circle', center: [0, 0], radius: 2, color: '#ec4899', fillOpacity: 0, strokeStyle: 'solid' },
              { type: 'point', coordinates: [0, 0], color: '#f8fafc', label: 'O' },
            ],
          },
        },
        {
          label: '2단계',
          text: '이차함수가 원을 삼등분하게 그린다',
          lines: [
            { content: '$f(x)=ax^2+b$ 는 $y$ 축에 대칭인 포물선($a>0$ 이라 아래로 볼록).' },
            { content: '이 포물선이 원과 만나는 점이 원의 둘레를 삼등분한다.' },
          ],
          math: {
            viewBox: VB,
            objects: [
              { type: 'function_plot', expr: 'x**2 - 2', color: '#60a5fa', style: 'solid' },
            ],
          },
        },
        {
          label: '3단계',
          text: '교점을 찍고 좌표를 정한다',
          lines: [
            { content: '둘레를 삼등분하면 세 교점은 중심각 $120^\\circ$ 씩 떨어진다.' },
            { content: '$y$ 축 대칭이므로 한 점은 맨 아래 $(0,-2)$, 두 점은 좌우 대칭.' },
            { content: '두 점은 $30^\\circ,\\ 150^\\circ$ 위치 → $(\\sqrt3,\\ 1),\\ (-\\sqrt3,\\ 1)$.' },
          ],
          math: {
            viewBox: VB,
            objects: [
              { type: 'segment', from: [0, 0], to: [0, -2], color: '#fbbf24', style: 'dashed', weight: 1.5 },
              { type: 'segment', from: [0, 0], to: [1.732, 1], color: '#fbbf24', style: 'dashed', weight: 1.5 },
              { type: 'segment', from: [0, 0], to: [-1.732, 1], color: '#fbbf24', style: 'dashed', weight: 1.5 },
              { type: 'point', coordinates: [0, -2], color: '#4ade80', label: '(0, -2)' },
              { type: 'point', coordinates: [1.732, 1], color: '#4ade80', label: '(√3, 1)' },
              { type: 'point', coordinates: [-1.732, 1], color: '#4ade80', label: '(-√3, 1)' },
            ],
          },
        },
        {
          label: '4단계',
          text: '좌표를 대입해 a, b를 구한다',
          lines: [
            { content: '$(0,-2)$ 대입: $f(0)=b=-2$.' },
            { content: '$(\\sqrt3,1)$ 대입: $3a+b=1 \\Rightarrow 3a-2=1 \\Rightarrow a=1$.' },
            { content: '따라서 $f(x)=x^2-2$.' },
          ],
          math: {
            viewBox: VB,
            objects: [
              { type: 'label_text', tex: 'f(x)=x^2-2', at: [1.4, 3.6], color: '#fde047', size: 1.1 },
            ],
          },
        },
        {
          label: '5단계',
          text: '답을 계산한다',
          lines: [
            { content: '$f(5)=5^2-2=25-2=23$.' },
          ],
          math: {
            viewBox: VB,
            objects: [
              { type: 'label_text', tex: 'f(5)=25-2=23', at: [1.4, 2.9], color: '#fca5a5', size: 1.1 },
            ],
          },
        },
      ],
    },
  },
];

export default CIRCLE_EQ_STEP2;
