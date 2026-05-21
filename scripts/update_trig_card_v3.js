import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const trig = data['대수'].find(c => c.id === '삼각함수성질');
if (trig) {
  trig.content += `

## 5. 특정 점 $P(x, y)$를 지나는 동경
동경 위의 점 $P(x, y)$가 주어지면 $r = \sqrt{x^2+y^2}$ 을 구한 뒤 삼각함수의 정의를 적용합니다.
- **예시:** $P(-4, 3)$ 이면 $r=5$ 이므로:
  - $\sin\theta = 3/5, \cos\theta = -4/5, \tan\theta = -3/4$
  - $\sec\theta = -5/4, \csc\theta = 5/3, \cot\theta = -4/3$

## 6. 각변환 핵심 요약 표
| 각도 | $2n\pi+\theta$ | $-\theta$ | $\pi\pm\theta$ | $\pi/2\pm\theta$ | $3\pi/2\pm\theta$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **sin** | $\sin\theta$ | $-\sin\theta$ | $\mp\sin\theta$ | $\cos\theta$ | $-\cos\theta$ |
| **cos** | $\cos\theta$ | $\cos\theta$ | $-\cos\theta$ | $\mp\sin\theta$ | $\pm\sin\theta$ |
| **tan** | $\tan\theta$ | $-\tan\theta$ | $\pm\tan\theta$ | $\mp\cot\theta$ | $\mp\cot\theta$ |`;
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated Trig Formula Card with Point Example and Table!');
