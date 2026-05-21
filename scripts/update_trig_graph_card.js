import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const graph = data['대수'].find(c => c.id === '삼각함수 그래프');
if (graph) {
  graph.content = String.raw`# 📌 삼각함수의 그래프와 방·부등식

## 1. 삼각함수의 그래프 요약
- **$y = \sin x$**: 주기 $2\pi$, 최댓값 $1$, 최솟값 $-1$, 원점 대칭(기함수)
- **$y = \cos x$**: 주기 $2\pi$, 최댓값 $1$, 최솟값 $-1$, $y$축 대칭(우함수)
- **$y = \tan x$**: 주기 $\pi$, 최대/최소 없음, 원점 대칭, 점근선 $x = n\pi + \frac{\pi}{2}$

## 2. 그래프의 변형 ($y = a \sin bx + c$)
- **진폭**: $|a|$ (최댓값 $|a|+c$, 최솟값 $-|a|+c$)
- **주기**: 원래 주기($2\pi$ 또는 $\pi$)를 $|b|$로 나눈 값

## 3. 삼각방정식과 부등식 풀이법
1. 주어진 식을 $\sin x = k$ 또는 $\sin x > k$ 꼴로 정리합니다.
2. 삼각함수의 그래프와 직선 $y=k$를 그립니다.
3. **방정식**: 교점의 $x$좌표를 찾습니다. (특수각과 대칭성 활용)
4. **부등식**: 직선의 위/아래에 해당하는 $x$값의 범위를 구합니다.

## 4. 핵심 성질 (대칭성)
- $\sin(\pi - x) = \sin x$ ($x = \pi/2$ 대칭)
- $\cos(-x) = \cos x$ ($x = 0$ 대칭)
- **근의 합**: 두 근 $\alpha, \beta$가 직선 $x=p$에 대해 대칭이면 $\alpha + \beta = 2p$ 임을 이용합니다.`;
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated Trig Graph Formula Card!');
