import fs from 'fs';

const app2 = {
  "id": "도함수의활용2",
  "title": "도함수의 활용 (2) - 그래프와 극대·극소",
  "subject": "수학2",
  "steps": [
    {
      "step": 1,
      "narration": "극대와 극소의 정의입니다. 함수 f(x)에서 x=a를 포함하는 어떤 열린 구간에서 f(a)가 가장 큰 값을 가질 때 이를 극대값이라고 합니다.",
      "visuals": {
        "title": "개념 1. 극대와 극소의 정의",
        "question": "\\text{함수 } f(x) \\text{ 의 극대와 극소의 수학적 정의를 기술하시오.}",
        "solution": "\\text{극대: } x=a \\text{ 부근의 모든 } x \\text{ 에 대해 } f(a) \\ge f(x) \\\\ \\text{극소: } x=a \\text{ 부근의 모든 } x \\text{ 에 대해 } f(a) \\le f(x) \\\\ \\text{* 미분가능성과 상관없이 정의됨 (뾰족점도 가능)}"
      }
    },
    {
      "step": 2,
      "narration": "미분가능한 함수에서 극값을 판정하는 방법입니다. 도함수의 부호가 양에서 음으로 변하면 극대, 음에서 양으로 변하면 극소입니다.",
      "visuals": {
        "title": "개념 2. 극값의 판정 (f')",
        "question": "\\text{미분가능한 함수 } f(x) \\text{ 가 } x=a \\text{ 에서 극값을 가질 조건을 기술하시오.}",
        "solution": "f'(a)=0 \\text{ 이고, } x=a \\text{ 좌우에서 } f'(x) \\text{ 의 부호가 바뀌어야 함} \\\\ + \\to - : \\text{ 극대} \\\\ - \\to + : \\text{ 극소}"
      }
    },
    {
      "step": 3,
      "narration": "삼차함수의 그래프 개형입니다. 도함수인 이차함수의 판별식에 따라 세 가지 모양이 결정됩니다.",
      "visuals": {
        "title": "개념 3. 삼차함수 그래프 개형",
        "component": "CalculusGraphAnimation",
        "props": { "type": "cubic" },
        "question": "\\text{삼차함수 } f(x)=ax^3+bx^2+cx+d \\text{ 가 극값을 가질 조건을 구하시오.}",
        "solution": "f'(x)=3ax^2+2bx+c=0 \\text{ 이 서로 다른 두 실근을 가져야 함} \\\\ \\implies D/4 = b^2-3ac > 0"
      }
    },
    {
      "step": 4,
      "narration": "사차함수의 그래프 개형입니다. 도함수인 삼차함수의 근의 개수에 따라 W자 모양, 대칭 모양 등이 나타납니다.",
      "visuals": {
        "title": "개념 4. 사차함수 그래프 개형",
        "component": "CalculusGraphAnimation",
        "props": { "type": "quartic" },
        "question": "\\text{사차함수 } f(x) \\text{ 가 극대값을 가질 조건을 기술하시오. (a>0 일 때)}",
        "solution": "f'(x)=0 \\text{ 이 서로 다른 세 실근을 가져야 함} \\\\ \\text{그래프가 W자 모양이 되어야 극대점이 생성됨}"
      }
    },
    {
      "step": 5,
      "narration": "방정식과 미분의 관계입니다. f(x)=k의 실근의 개수는 f(x) 그래프와 직선 y=k의 교점의 개수와 같습니다.",
      "visuals": {
        "title": "개념 5. 방정식의 실근과 그래프",
        "question": "\\text{방정식 } f(x)-k=0 \\text{ 의 서로 다른 실근의 개수를 그래프로 판단하는 법은?}",
        "solution": "y=f(x) \\text{ 그래프와 } y=k \\text{ 의 교점의 개수를 확인} \\\\ \\text{극대값과 극소값 사이의 } k \\text{ 값에 따라 결정됨}"
      }
    },
    {
      "step": 6,
      "narration": "삼차함수의 매우 중요한 비례관계입니다. 극점과 교점 사이의 거리비는 항상 2:1 또는 1:루트3을 유지합니다.",
      "visuals": {
        "title": "심화. 삼차함수 비례관계",
        "question": "\\text{삼차함수의 극점, 변곡점, 교점 사이의 비례관계를 기술하시오.}",
        "solution": "\\text{1. 극점 : 변곡점 : 극점 = 1 : 1} \\\\ \\text{2. 극점에서 접선과 곡선의 교점까지 = 2 : 1} \\\\ \\text{3. 변곡점 통과 직선과 교점까지 = 1 : } \\sqrt{3}"
      }
    },
    {
      "step": 7,
      "narration": "예제 1. 직접 극값을 구해봅시다. 미분하여 0이 되는 점을 찾고 부호 변화를 관찰합니다.",
      "visuals": {
        "title": "예제 1. 극값 계산",
        "question": "f(x)=x^3-3x^2+1 \\text{ 의 극값을 구하시오.}",
        "solution": "f'(x)=3x^2-6x = 3x(x-2)=0 \\implies x=0, 2 \\\\ f(0)=1 (\\text{극대}), \\quad f(2)=8-12+1=-3 (\\text{극소})"
      }
    },
    {
      "step": 8,
      "narration": "예제 2. 사차함수의 극대값이 존재할 조건입니다. 미분한 식이 서로 다른 세 실근을 가져야 합니다.",
      "visuals": {
        "title": "예제 2. 사차함수 극대 조건",
        "question": "f(x)=x^4-4x^3+2ax^2 \\text{ 가 극대값을 갖기 위한 a의 범위를 구하시오.}",
        "solution": "f'(x)=4x^3-12x^2+4ax = 4x(x^2-3x+a)=0 \\\\ x=0 \\text{ 외에 } x^2-3x+a=0 \\text{ 이 서로 다른 두 실근을 가져야 함} \\\\ D=9-4a>0 \\implies a < 9/4, \\quad a \\neq 0"
      }
    },
    {
      "step": 9,
      "narration": "예제 3. 방정식의 실근 개수 문제입니다. 상수를 넘겨서 그래프의 교점을 확인합니다.",
      "visuals": {
        "title": "예제 3. 방정식의 실근 개수",
        "question": "x^3-3x-k=0 \\text{ 이 서로 다른 세 실근을 갖기 위한 k의 범위는?}",
        "solution": "y=x^3-3x \\text{ 와 } y=k \\text{ 의 교점} \\\\ f'(x)=3x^2-3=0 \\implies x=\\pm 1 \\\\ f(1)=-2, f(-1)=2 \\implies -2 < k < 2"
      }
    },
    {
      "step": 10,
      "narration": "예제 10. 비례관계를 이용한 빠른 풀이입니다. 계산 없이 교점을 바로 찾을 수 있습니다.",
      "visuals": {
        "title": "예제 4. 비례관계 실전",
        "question": "f(x)=x^3-3x \\text{ 가 x=1 에서 극소일 때, x축과의 교점 중 양수인 곳은?}",
        "solution": "\\text{변곡점이 0이므로 비율 } 1 : \\sqrt{3} \\text{ 에 의해} \\\\ 1 : x = 1 : \\sqrt{3} \\implies x = \\sqrt{3} \\\\ \\text{계산 없이 바로 도출 가능}"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/도함수의활용2.json', JSON.stringify(app2, null, 2));

console.log('Math II Derivative App 2 upgraded with definitions, animations, and proportionality!');
