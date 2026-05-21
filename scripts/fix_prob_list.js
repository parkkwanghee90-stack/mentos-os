import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));

const removeIds = [
  '덧셈정리와 조건부확률',
  '독립시행의 정리',
  '연속확률변수와 정규분포',
  '모평균과 표본평균',
  '모평균의 추정'
];

conceptData['확률과통계'] = conceptData['확률과통계'].filter(l => !removeIds.includes(l.id));

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

console.log('Fixed list:', conceptData['확률과통계'].map(l => l.id));
