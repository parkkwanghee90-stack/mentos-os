import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Find "삼각함수성질"
const trig = data['대수'].find(c => c.id === '삼각함수성질');

trig.content = String.raw`# 📌 삼각함수의 성질 및 각변환 완벽 정리

## 1. 일반각과 동경의 위치 관계 ($n$은 정수)
동경 $\alpha, \beta$의 위치에 따른 관계식입니다.
- **일치:** $\beta - \alpha = 2n\pi$
- **일직선 반대:** $\beta - \alpha = 2n\pi + \pi$
- **$x$축 대칭:** $\alpha + \beta = 2n\pi$
- **$y$축 대칭:** $\alpha + \beta = 2n\pi + \pi$
- **직선 $y=x$ 대칭:** $\alpha + \beta = 2n\pi + \pi/2$
- **직선 $y=-x$ 대칭:** $\alpha + \beta = 2n\pi + 3\pi/2$

## 2. 삼각함수의 정의와 부호
단위원 위 점 $P(x, y)$에 대해 $\sin \theta = y, \cos \theta = x, \tan \theta = y/x$ 입니다.
- **사분면별 부호 (올사탄코):**
  - 제1사분면: **All** (+)
  - 제2사분면: **Sin** (+) / $\csc$ (+)
  - 제3사분면: **Tan** (+) / $\cot$ (+)
  - 제4사분면: **Cos** (+) / $\sec$ (+)

## 3. 특수각의 삼각비
| $\theta$ | $0$ | $\pi/6$ | $\pi/4$ | $\pi/3$ | $\pi/2$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| $\sin \theta$ | $0$ | $1/2$ | $\sqrt{2}/2$ | $\sqrt{3}/2$ | $1$ |
| $\cos \theta$ | $1$ | $\sqrt{3}/2$ | $\sqrt{2}/2$ | $1/2$ | $0$ |
| $\tan \theta$ | $0$ | $\sqrt{3}/3$ | $1$ | $\sqrt{3}$ | $\times$ |

## 4. 각변환 공식 총정리
| 각도 | $2n\pi+\theta$ | $-\theta$ | $\pi\pm\theta$ | $\pi/2\pm\theta$ | $3\pi/2\pm\theta$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **sin** | $\sin\theta$ | $-\sin\theta$ | $\mp\sin\theta$ | $\cos\theta$ | $-\cos\theta$ |
| **cos** | $\cos\theta$ | $\cos\theta$ | $-\cos\theta$ | $\mp\sin\theta$ | $\pm\sin\theta$ |
| **tan** | $\tan\theta$ | $-\tan\theta$ | $\pm\tan\theta$ | $\mp\cot\theta$ | $\mp\cot\theta$ |

## 5. 심화: 동경의 $n$등분 ($\alpha/3$)
$\alpha \in \text{Q4}$ 일 때 $\alpha/3$ 는 제2, 3, 4사분면에 존재하며 **제1사분면은 불가능**합니다.
- **풀이:** $120^\circ n + 90^\circ < \alpha/3 < 120^\circ n + 120^\circ$ 에 $n=0,1,2$ 대입.

## 6. 실전 예제
점 $P(-4, 3)$을 지나는 동경에 대해 $r=5$ 이므로:
- $\sin\theta + \cos\theta = 3/5 - 4/5 = -1/5$
- $\tan\theta - \sec\theta = -3/4 - (-5/4) = 2/4 = 1/2$`;

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Completely rebuilt Trig Formula Card with ALL details and String.raw!');
