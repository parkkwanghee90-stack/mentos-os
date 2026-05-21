import fs from 'fs';

const path = './public/premium_lectures/삼각함수의 활용.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const examples = [
  {
    "step": 7,
    "narration": "실전 예제 1: 사인법칙을 이용해 변의 길이를 구해봅시다. $\\angle A = 45^\\circ, \\angle B = 60^\\circ, a=10$ 인 삼각형에서 변 $b$의 길이는? $\\frac{10}{\\sin 45^\\circ} = \\frac{b}{\\sin 60^\\circ}$ 식을 세워 풀면 됩니다.",
    "visuals": {
      "title": "예제 1: 사인법칙 (변의 길이)",
      "component": "SineRuleAnimation",
      "math": "b = a \\frac{\\sin B}{\\sin A} = 10 \\cdot \\frac{\\sqrt{3}/2}{\\sqrt{2}/2} = 5\\sqrt{6}"
    }
  },
  {
    "step": 8,
    "narration": "예제 2: 사인법칙으로 외접원의 반지름 $R$을 구해볼까요? $a=10, \\angle A = 30^\\circ$ 일 때, $2R = a/\\sin A$ 이므로 $R=10$ 이 됩니다. 문제에서 외접원이 보이면 무조건 사인법칙!",
    "visuals": {
      "title": "예제 2: 외접원의 반지름 R",
      "math": "2R = \\frac{10}{\\sin 30^\\circ} = 20 \\implies R=10"
    }
  },
  {
    "step": 9,
    "narration": "예제 3: 사인법칙과 변의 길이 비입니다. $\\sin A : \\sin B : \\sin C = a : b : c$ 가 성립하므로, 각의 사인값의 비만 알아도 세 변의 길이의 비를 알 수 있습니다.",
    "visuals": {
      "title": "예제 3: 변의 비와 사인값",
      "math": "a:b:c = \\sin A : \\sin B : \\sin C"
    }
  },
  {
    "step": 10,
    "narration": "예제 4: 코사인법칙으로 변 구하기입니다. $b=8, c=10, \\angle A = 60^\\circ$ 일 때 $a$의 길이는? $a^2 = 8^2 + 10^2 - 2 \\cdot 8 \\cdot 10 \\cos 60^\\circ$ 공식을 사용합니다.",
    "visuals": {
      "title": "예제 4: 코사인법칙 (변 구하기)",
      "component": "CosineRuleAnimation",
      "math": "a^2 = 64 + 100 - 80 = 84 \\implies a = 2\\sqrt{21}"
    }
  },
  {
    "step": 11,
    "narration": "예제 5: 코사인법칙으로 각 구하기입니다. 세 변이 $a=7, b=3, c=5$ 인 삼각형에서 $\\angle A$의 크기는? 변형 공식을 사용하여 $\\cos A$를 구하면 $-1/2$ 이 나오므로 $A = 120^\\circ$ 임을 알 수 있죠.",
    "visuals": {
      "title": "예제 5: 코사인법칙 (각 구하기)",
      "math": "\\cos A = \\frac{3^2 + 5^2 - 7^2}{2 \\cdot 3 \\cdot 5} = -\\frac{1}{2} \\implies A = 120^\\circ"
    }
  },
  {
    "step": 12,
    "narration": "예제 6: 실생활 활용입니다. 두 배가 항구에서 각각 $30^\\circ$ 방향으로 10km, $90^\\circ$ 방향으로 8km 갔을 때 두 배 사이의 거리는? 두 변과 끼인각($60^\\circ$)을 아는 경우이므로 코사인법칙을 씁니다.",
    "visuals": {
      "title": "예제 6: 실전 활용 문제",
      "math": "d^2 = 10^2 + 8^2 - 2 \\cdot 10 \\cdot 8 \\cos 60^\\circ = 84"
    }
  },
  {
    "step": 13,
    "narration": "예제 7: 삼각형의 넓이 기본 문제입니다. $b=4, c=6, \\angle A = 30^\\circ$ 일 때 넓이는? $1/2 \\cdot 4 \\cdot 6 \\sin 30^\\circ = 6$ 입니다.",
    "visuals": {
      "title": "예제 7: 삼각형의 넓이",
      "component": "TriangleAreaAnimation",
      "math": "S = \\frac{1}{2} \\cdot 4 \\cdot 6 \\cdot \\frac{1}{2} = 6"
    }
  },
  {
    "step": 14,
    "narration": "예제 8: 세 변을 알 때의 넓이입니다. $a=5, b=6, c=7$ 이라면 코사인법칙으로 한 각의 코사인값을 구하고, 이를 사인값으로 바꾼 뒤 넓이 공식을 적용합니다. (또는 헤론의 공식을 쓰기도 하죠)",
    "visuals": {
      "title": "예제 8: 세 변을 알 때의 넓이",
      "math": "\\cos A = \\frac{19}{35} \\implies \\sin A = \\frac{6\\sqrt{6}}{35} \\implies S = 6\\sqrt{6}"
    }
  },
  {
    "step": 15,
    "narration": "예제 9: 사각형의 넓이입니다. 두 대각선의 길이 $p, q$와 그 끼인각 $\\theta$를 알 때 넓이는 $1/2 pq \\sin \\theta$ 입니다. 삼각형 두 개로 나누어 생각하면 유도하기 쉽습니다.",
    "visuals": {
      "title": "예제 9: 사각형의 넓이",
      "math": "S = \\frac{1}{2} p q \\sin \\theta"
    }
  }
];

data.steps = [...data.steps, ...examples];
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated 삼각함수의 활용.json with 9 examples!');
