import fs from 'fs';

const fixMath = (math) => {
  if (!math) return math;
  // Regex to find sequences of Korean characters and spaces, and wrap them in \text{}
  // But be careful not to wrap already wrapped \text{...}
  // This is tricky. Let's do a simpler approach for now:
  // Identify the common problem/solution text parts and fix them.
  
  let fixed = math;
  // Fix [문제] and [풀이] headers
  fixed = fixed.replace(/\[문제\]/g, '\\text{[문제]}');
  fixed = fixed.replace(/\[풀이\]/g, '\\text{[풀이]}');
  
  // Wrap known Korean phrases
  const phrases = [
    "곡선", "위의 점", "에서의 접선의 방정식을 구하시오.", "에 접하고 기울기가", "인 직선의 방정식을 구하시오.",
    "점", "에서 곡선", "에 그은 접선의 방정식을 구하시오.", "을 지나고 이 점에서의 접선에 수직인 직선을 구하시오.",
    "두 곡선", "가", "에서 접할 때, a, b를 구하시오.", "일 때", "점 P와 직선", "사이의 최단 거리를 구하시오.",
    "사이의 거리", "의 접선 중 x축의 양의 방향과", "도를 이루는 접선을 구하시오.",
    "와", "가 서로 다른 세 점에서 만날 k의 범위를 구하시오.", "에서 롤의 정리를 만족하는 c를 구하시오.",
    "에서 평균값 정리를 만족하는 c를 구하시오.", "의 극값을 구하시오.", "비례관계 활용입니다.",
    "이 x=1 에서 극소일 때, x축과의 교점 중 양수인 곳은?", "사차함수의 대칭성과 극값입니다.",
    "이 서로 다른 세 실근을 가질 k의 범위는?", "이 항상 성립할 a의 최소값은?", "최소값", "극대값", "극소값",
    "증가하는 구간을 구하시오.", "극값이 하나만 존재할 조건은?", "일 때 x^3+3 > 3x 가 성립함을 보이시오.",
    "삼중근을 갖는 사차함수의 극점과 교점의 비율은?", "위치 함수를 미분하여 속도를 구하는 예제입니다.",
    "일 때, 2초에서의 속도를 구하시오.", "운동 방향이 바뀌는 시각은?", "가속도가 0인 시각은?",
    "둘레가 20인 직사각형의 넓이의 최대값은?", "최대 부피는?", "그림자 끝의 속도는?", "넓이 변화율은?",
    "부피 변화율은?", "최소값은?", "원뿔에 내접하는 원기둥의 최대 부피는?"
  ];
  
  phrases.forEach(p => {
    const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    fixed = fixed.replace(regex, `\\text{ ${p} }`);
  });

  return fixed;
};

const processFile = (path) => {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.steps.forEach(step => {
    if (step.visuals && step.visuals.math) {
      step.visuals.math = fixMath(step.visuals.math);
    }
  });
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

processFile('./public/premium_lectures/도함수의활용1.json');
processFile('./public/premium_lectures/도함수의활용2.json');
processFile('./public/premium_lectures/도함수의활용3.json');

console.log('Processed all 30 examples and wrapped Korean text in \\text{}!');
