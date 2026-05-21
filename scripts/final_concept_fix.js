import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const trig = data['대수'].find(c => c.id === '삼각함수성질');
if (trig) {
  trig.content = trig.content
    .replace(/pi/g, '\\pi') // This might be too aggressive, let's be selective
    .replace(/\\pi\/2/g, '\\frac{\\pi}{2}')
    .replace(/3\\pi\/2/g, '\\frac{3\\pi}{2}')
    .replace(/theta/g, '\\theta');
    
  // Wait! If I already had \pi, I now have \\pi.
  // Let's just use a clean rebuild with String.raw one more time, but BETTER.
}

const exp = data['대수'].find(c => c.id === '지수함수');
const log = data['대수'].find(c => c.id === '로그함수');

// Definitive Rebuild for Trig Card
trig.content = String.raw`# 📌 삼각함수의 성질 및 각변환 완벽 정리

## 1. 일반각과 동경의 위치 관계 ($n$은 정수)
동경 $\alpha, \beta$의 위치에 따른 관계식입니다.
- **일치:** $\beta - \alpha = 2n\pi$
- **일직선 반대:** $\beta - \alpha = 2n\pi + \pi$
- **$x$축 대칭:** $\alpha + \beta = 2n\pi$
- **$y$축 대칭:** $\alpha + \beta = 2n\pi + \pi$
- **직선 $y=x$ 대칭:** $\alpha + \beta = 2n\pi + \frac{\pi}{2}$
- **직선 $y=-x$ 대칭:** $\alpha + \beta = 2n\pi + \frac{3\pi}{2}$

## 2. 삼각함수의 정의와 부호
단위원 위 점 $P(x, y)$에 대해 $\sin \theta = y, \cos \theta = x, \tan \theta = y/x$ 입니다.
- **사분면별 부호 (올사탄코):**
  - 제1사분면: **All** (+)
  - 제2사분면: **Sin** (+) / $\csc$ (+)
  - 제3사분면: **Tan** (+) / $\cot$ (+)
  - 제4사분면: **Cos** (+) / $\sec$ (+)

## 3. 특수각의 삼각비
| $\theta$ | $0$ | $\frac{\pi}{6}$ | $\frac{\pi}{4}$ | $\frac{\pi}{3}$ | $\frac{\pi}{2}$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| $\sin \theta$ | $0$ | $1/2$ | $\frac{\sqrt{2}}{2}$ | $\frac{\sqrt{3}}{2}$ | $1$ |
| $\cos \theta$ | $1$ | $\frac{\sqrt{3}}{2}$ | $\frac{\sqrt{2}}{2}$ | $1/2$ | $0$ |
| $\tan \theta$ | $0$ | $\frac{\sqrt{3}}{3}$ | $1$ | $\sqrt{3}$ | $\times$ |

## 4. 각변환 공식 총정리 ($n\frac{\pi}{2} \pm \theta$)
| 각도 | $2n\pi+\theta$ | $-\theta$ | $\pi\pm\theta$ | $\frac{\pi}{2}\pm\theta$ | $\frac{3\pi}{2}\pm\theta$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **sin** | $\sin\theta$ | $-\sin\theta$ | $\mp\sin\theta$ | $\cos\theta$ | $-\cos\theta$ |
| **cos** | $\cos\theta$ | $\cos\theta$ | $-\cos\theta$ | $\mp\sin\theta$ | $\pm\sin\theta$ |
| **tan** | $\tan\theta$ | $-\tan\theta$ | $\pm\tan\theta$ | $\mp\cot\theta$ | $\mp\cot\theta$ |

## 5. 심화: 동경의 $n$등분 ($\alpha/3$)
$\alpha \in \text{Q4}$ 일 때 $\alpha/3$ 는 제2, 3, 4사분면에 존재 가능합니다.
- **범위:** $120^\circ n + 90^\circ < \frac{\alpha}{3} < 120^\circ n + 120^\circ$

## 6. 실전 예제
점 $P(-4, 3)$을 지나는 동경에 대해 $r=5$ 이므로:
- $\sin\theta = 3/5, \cos\theta = -4/5, \tan\theta = -3/4$
- $\sin\theta + \cos\theta = -1/5$`;

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Concept Card Investigation & Rebuild completed!');
