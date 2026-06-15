/*
 * 삼각함수그래프(trig_graph) 모지바케 복원 저작 데이터 — restore_trig_graph_mojibake.cjs 전용.
 * 각 항목은 Claude 비전 판독+numpy/sympy 검산 또는 해설 전사(출처는 각 주석 참조).
 * 코드 파일 크기 분리를 위해 데이터만 별도 모듈로 추출.
 */
// 단계 배열 → S 문자열(앱 칠판 단계분리는 \n 기준).
const S = (...lines) => lines.join('\n');

// Claude 비전 판독 + numpy/sympy 검산 완료(2026-06-15). 출처는 각 문제 상단 표기.
const AUTHORED = {
  // [2020년 10월 고3 26번] y=tan(nx-π/2) 와 y=-x 의 (-π,π) 내 교점 개수 a_n, a_2+a_3
  '023': {
    P: String.raw`함수 $y=\tan\left(nx-\frac{\pi}{2}\right)$의 그래프와 직선 $y=-x$가 만나는 점 중 $x$좌표가 구간 $(-\pi,\pi)$에 속하는 점의 개수 $a_n$을 구해 $a_2+a_3$의 값을 찾는 것`,
    C: String.raw`$y=\tan\left(nx-\frac{\pi}{2}\right)$는 주기가 $\frac{\pi}{n}$이고, 점근선은 $x=\frac{m\pi}{n}$ ($m$은 정수)이다`,
    B: String.raw`점근선으로 나뉜 한 개의 가지에서 $\tan$은 $-\infty$에서 $+\infty$까지 증가하므로, 감소하는 직선 $y=-x$와 반드시 한 번 만난다`,
    S: S(
      String.raw`1. 점근선은 $nx-\frac{\pi}{2}=\frac{\pi}{2}+m\pi$, 즉 $x=\frac{m\pi}{n}$ 이다.`,
      String.raw`2. 구간 $(-\pi,\pi)$의 양 끝 $x=\pm\pi$도 ($m=\pm n$) 점근선이므로, 이 구간은 폭이 $\frac{\pi}{n}$인 완전한 가지 $2n$개로 나뉜다.`,
      String.raw`3. 각 가지에서 $\tan$은 $-\infty$에서 $+\infty$로 증가하고 직선 $y=-x$는 감소하므로 교점이 정확히 1개씩 생긴다. 따라서 $a_n=2n$.`,
      String.raw`4. $a_2=4$, $a_3=6$ 이므로 $a_2+a_3=10$.`
    ),
    A: String.raw`$a_2+a_3=10$`,
  },
  // [2019년 6월 고2 20번] 0<θ<π/4 에서 보기 ㄱㄴㄷ 참거짓
  '024': {
    P: String.raw`$0<\theta<\frac{\pi}{4}$일 때 보기 ㄱ, ㄴ, ㄷ 중 옳은 것을 모두 고르는 것`,
    C: String.raw`$0<\theta<\frac{\pi}{4}$이므로 $0<\sin\theta<\cos\theta<1$ 이다`,
    B: String.raw`밑이 1보다 작은 로그·지수함수는 감소함수이고, 같은 양수 지수에 대해서는 밑이 클수록 값이 크다`,
    S: S(
      String.raw`1. (ㄱ) $\theta<\frac{\pi}{4}$이므로 $\sin\theta<\cos\theta$이고 둘 다 0과 1 사이의 값이다. 따라서 $0<\sin\theta<\cos\theta<1$ 은 참.`,
      String.raw`2. (ㄴ) 밑 $\sin\theta$가 0과 1 사이라 $\log_{\sin\theta}$는 감소함수이다. $\log_{\sin\theta}\cos\theta>0$이고, $\cos\theta>\sin\theta$이므로 $\log_{\sin\theta}\cos\theta<\log_{\sin\theta}\sin\theta=1$. 즉 $0<\log_{\sin\theta}\cos\theta<1$ 은 참.`,
      String.raw`3. (ㄷ) 지수가 같은 $\cos\theta$일 때 밑이 $\sin\theta<\cos\theta$이므로 $(\sin\theta)^{\cos\theta}<(\cos\theta)^{\cos\theta}$. 또 밑 $\cos\theta<1$이라 지수함수가 감소하므로 $\cos\theta>\sin\theta$에서 $(\cos\theta)^{\cos\theta}<(\cos\theta)^{\sin\theta}$. 따라서 (ㄷ)도 참.`,
      String.raw`4. ㄱ, ㄴ, ㄷ 모두 참이므로 답은 ⑤.`
    ),
    A: String.raw`⑤ (ㄱ, ㄴ, ㄷ)`,
  },
  // [2019년 6월 고2 29번] y=k sin(2x+π/3)+k²-6 가 제1사분면 안 지나는 정수 k 개수
  '025': {
    P: String.raw`그래프 $y=k\sin\left(2x+\frac{\pi}{3}\right)+k^2-6$이 제1사분면을 지나지 않도록 하는 모든 정수 $k$의 개수`,
    C: String.raw`$x>0$일 때 $\sin\left(2x+\frac{\pi}{3}\right)$은 $-1$부터 $1$까지 모든 값을 가지므로, $x>0$에서 $y$의 최댓값은 $k^2-6+|k|$ 이다`,
    B: String.raw`제1사분면을 지나지 않으려면 $x>0$인 영역에서 $y>0$인 점이 없어야 하므로, $x>0$에서 $y$의 최댓값이 0 이하이어야 한다`,
    S: S(
      String.raw`1. $x>0$에서 $\sin\left(2x+\frac{\pi}{3}\right)$의 최댓값은 1이므로 $y$의 최댓값은 $k^2-6+|k|$ 이다.`,
      String.raw`2. 제1사분면을 지나지 않으려면 $k^2-6+|k|\le 0$ 이어야 한다.`,
      String.raw`3. $|k|=t\ (t\ge 0)$로 두면 $t^2+t-6\le 0$, 즉 $(t+3)(t-2)\le 0$에서 $t\le 2$.`,
      String.raw`4. 따라서 $|k|\le 2$, 즉 $k=-2,-1,0,1,2$ 로 정수 $k$는 5개이다.`
    ),
    A: String.raw`5`,
  },
  // [2024년 11월 고3 10번] f=a cos(bx)+3 이 x=π/3 에서 최대 13, a+b 최솟값
  '026': {
    P: String.raw`$f(x)=a\cos(bx)+3$이 $x=\frac{\pi}{3}$에서 최댓값 13을 갖도록 하는 두 자연수 $a,b$에 대하여 $a+b$의 최솟값`,
    C: String.raw`$a,b$는 자연수이고, 최댓값 13을 $x=\frac{\pi}{3}$에서 가진다`,
    B: String.raw`$\cos$의 최댓값은 1이므로 $f$의 최댓값은 $a+3$이고, 그 최댓값을 $x=\frac{\pi}{3}$에서 가지려면 $\cos\left(b\cdot\frac{\pi}{3}\right)=1$ 이어야 한다`,
    S: S(
      String.raw`1. 최댓값이 13이므로 $a+3=13$에서 $a=10$.`,
      String.raw`2. $x=\frac{\pi}{3}$에서 최댓값을 가지므로 $\cos\left(\frac{b\pi}{3}\right)=1$, 즉 $\frac{b\pi}{3}=2\pi k$에서 $b=6k$ ($k$는 자연수)이다.`,
      String.raw`3. 자연수 $b$의 최솟값은 $b=6$이다.`,
      String.raw`4. 따라서 $a+b$의 최솟값은 $10+6=16$. (답 ③)`
    ),
    A: String.raw`③ 16`,
  },
  // [2022년 11월 고3 9번] f=a-√3 tan2x 가 [-π/6,b] 에서 최대7 최소3, ab
  '027': {
    P: String.raw`$f(x)=a-\sqrt{3}\tan 2x$가 닫힌구간 $\left[-\frac{\pi}{6}, b\right]$에서 최댓값 7, 최솟값 3을 가질 때 상수 $a,b$에 대한 $ab$의 값`,
    C: String.raw`$f$의 정의구간에 점근선 $x=\frac{\pi}{4}$가 포함되지 않으므로 $-\frac{\pi}{6}\le x\le b<\frac{\pi}{4}$ 이다`,
    B: String.raw`$\tan 2x$는 이 구간에서 증가함수라 $f$는 감소함수이고, 감소함수는 왼쪽 끝에서 최댓값, 오른쪽 끝에서 최솟값을 가진다`,
    S: S(
      String.raw`1. $f$는 감소함수이므로 최댓값은 $x=-\frac{\pi}{6}$에서 갖는다. $f\left(-\frac{\pi}{6}\right)=a-\sqrt{3}\tan\left(-\frac{\pi}{3}\right)=a+3=7$ 에서 $a=4$.`,
      String.raw`2. 최솟값은 $x=b$에서 갖는다. $f(b)=4-\sqrt{3}\tan 2b=3$ 에서 $\sqrt{3}\tan 2b=1$, 즉 $\tan 2b=\frac{1}{\sqrt{3}}$.`,
      String.raw`3. $2b=\frac{\pi}{6}$에서 $b=\frac{\pi}{12}$.`,
      String.raw`4. 따라서 $ab=4\times\frac{\pi}{12}=\frac{\pi}{3}$. (답 ③)`
    ),
    A: String.raw`③ $\frac{\pi}{3}$`,
  },
  // [2020년 9월 고3 이과 21번] f=sin(kx)+2, g=3cos(12x), 포함조건 만족 자연수 k 개수 (정답 4)
  '028': {
    P: String.raw`조건을 만족시키는 자연수 $k$의 개수`,
    C: String.raw`$f(x)=\sin kx+2$의 치역은 $[1,3]$이고 $g(x)=3\cos 12x$이며, 조건은 "교점의 $y$좌표 $a$에 대하여 $f(x)=a$인 모든 $x$가 $g(x)=a$도 만족"한다는 것`,
    B: String.raw`$f(x)=a$를 만족하는 모든 점에서 $g$가 항상 같은 값이면 교점에서 $g=a$이므로 포함조건이 성립한다. 이는 $g=3\cos 12x$가 $\sin kx$만의 함수일 때, 즉 $\frac{12}{k}$가 짝수일 때이다`,
    S: S(
      String.raw`1. $f(x)=a$는 $\sin kx=a-2$이고, $kx=\theta$로 두면 해는 $\theta=\arcsin(a-2)$ 또는 $\theta=\pi-\arcsin(a-2)$ 꼴이다.`,
      String.raw`2. $g=3\cos 12x=3\cos\left(\frac{12}{k}\cdot kx\right)$인데, 두 해 $\theta$와 $\pi-\theta$에서 $g$가 같으려면 $\cos\frac{12}{k}\theta=\cos\frac{12}{k}(\pi-\theta)$, 즉 $\frac{12}{k}$가 짝수여야 한다.`,
      String.raw`3. $\frac{12}{k}$가 짝수인 자연수 $k$는 $\frac{12}{k}=2,4,6,12$, 즉 $k=6,3,2,1$이다.`,
      String.raw`4. 따라서 조건을 만족하는 $k$는 $1,2,3,6$의 4개이다. (답 ②)`
    ),
    A: String.raw`② 4`,
  },
  // [2020년 4월 고3 이과 26번] y=a sin3x+b 가 y=9 와 3개·y=2 와 7개 교점, ab (정답 14)
  '029': {
    P: String.raw`두 양수 $a,b$에 대하여 $ab$의 값`,
    C: String.raw`$0\le x\le 2\pi$에서 $y=a\sin 3x+b$ ($a,b>0$)가 직선 $y=9$와 3개, $y=2$와 7개의 점에서 만난다`,
    B: String.raw`$y=a\sin 3x+b$는 $[0,2\pi]$에서 3주기이며, 수평선과의 교점은 최대선·최소선 $y=b\pm a$에서 3개, 중심선 $y=b$에서 7개이다`,
    S: S(
      String.raw`1. $y=2$와 7개의 점에서 만나므로 2는 중심선, 즉 $b=2$.`,
      String.raw`2. $y=9$와 3개의 점에서 만나므로 9는 최대선이다. $a>0$이므로 $9=b+a=2+a$에서 $a=7$.`,
      String.raw`3. 따라서 $ab=7\times 2=14$.`
    ),
    A: String.raw`14`,
  },
  // [2020년 3월 고3 이과 28번] f=2sin(ax)+b 가 A(-π/2,0),B(7π/2,0) 통과, 30(a+b) (정답 40)
  '030': {
    P: String.raw`$30(a+b)$의 값`,
    C: String.raw`$0<a<\frac{4}{7}$이고 $b$는 유리수이며, $f(x)=2\sin(ax)+b$가 두 점 $A\left(-\frac{\pi}{2},0\right)$, $B\left(\frac{7}{2}\pi,0\right)$를 지난다`,
    B: String.raw`두 점이 모두 $x$축 위의 영점이므로 $\sin\frac{a\pi}{2}+\sin\frac{7a\pi}{2}=0$이고, 합을 곱으로 바꾸면 $2\sin(2a\pi)\cos\frac{3a\pi}{2}=0$`,
    S: S(
      String.raw`1. $f\left(-\frac{\pi}{2}\right)=0$에서 $b=2\sin\frac{a\pi}{2}$, $f\left(\frac{7}{2}\pi\right)=0$에서 $b=-2\sin\frac{7a\pi}{2}$이다.`,
      String.raw`2. 두 식에서 $\sin\frac{a\pi}{2}+\sin\frac{7a\pi}{2}=0$, 즉 $2\sin(2a\pi)\cos\frac{3a\pi}{2}=0$.`,
      String.raw`3. $\sin(2a\pi)=0$이면 $a=\frac{1}{2}$인데 이때 $b=2\sin\frac{\pi}{4}=\sqrt{2}$로 무리수라 제외. $\cos\frac{3a\pi}{2}=0$에서 $a=\frac{1}{3}$ ($0<a<\frac{4}{7}$)이고 $b=2\sin\frac{\pi}{6}=1$로 유리수.`,
      String.raw`4. 따라서 $a=\frac{1}{3}$, $b=1$이고 $30(a+b)=30\times\frac{4}{3}=40$.`
    ),
    A: String.raw`40`,
  },
  // [2022년 6월 고2 21번] 조각함수 f(x)+a=0 실근합 46, k/a (정답 27; k=9,a=1/3)
  '034': {
    P: String.raw`$\frac{k}{a}$의 값`,
    C: String.raw`$1<k<12$인 자연수 $k$, $0<a\le\frac{1}{2}$. $f(x)=\frac{1}{2}\sin\pi x\ (0\le x<k)$, $\left(\frac{2}{3}\right)^{x-k}-1\ (k\le x\le 12)$이고, 방정식 $f(x)+a=0$의 모든 실근의 합이 46`,
    B: String.raw`앞 구간의 근은 $\sin\pi x=-2a$의 해로 음수 구간마다 대칭인 두 근(합 일정), 뒤 구간의 근은 지수식의 한 근이다`,
    S: S(
      String.raw`1. 앞 구간 $\frac{1}{2}\sin\pi x=-a$, 즉 $\sin\pi x=-2a$ ($0<a<\frac{1}{2}$)는 $\sin\pi x$가 음수인 각 구간 $(2m+1,2m+2)$마다 $x=2m+\frac{3}{2}$에 대칭인 두 근을 가져 그 합이 $4m+3$이다.`,
      String.raw`2. $k=9$이면 음수 구간은 $(1,2),(3,4),(5,6),(7,8)$의 4개이고 근들의 합은 $3+7+11+15=36$.`,
      String.raw`3. 뒤 구간 $9\le x\le 12$의 근은 $\left(\frac{2}{3}\right)^{x-9}=1-a$에서 하나이다. 전체 합이 46이려면 이 근이 $46-36=10$이어야 하므로 $\left(\frac{2}{3}\right)^{1}=1-a$, 즉 $a=\frac{1}{3}$ (조건 만족).`,
      String.raw`4. 따라서 $\frac{k}{a}=\frac{9}{\,1/3\,}=27$. (답 ②)`
    ),
    A: String.raw`② 27`,
  },
  // [2020년 6월 고2 30번] 조각 sin 함수 조건, 20((a+S)/π+k) (정답 110; a=π,k=-1/2,S=5π)
  '036': {
    P: String.raw`$20\left(\frac{a+S}{\pi}+k\right)$의 값 (단, $S$는 $|f(x)|=\frac{1}{4}$의 모든 실근의 합)`,
    C: String.raw`$f(x)=\sin x-\frac{1}{2}\ (0\le x<a)$, $k\sin x-\frac{1}{2}\ (a\le x\le 2\pi)$이고, (가) $|f|$의 최댓값이 $\frac{1}{2}$, (나) $f(x)=0$의 실근이 3개`,
    B: String.raw`첫 구간에서 $|f|\le\frac{1}{2}$이려면 $\sin x\ge 0$, 즉 $a\le\pi$이다. (나)의 근이 3개이려면 둘째 구간이 $\sin x=-1$에서 접해야 한다`,
    S: S(
      String.raw`1. 첫 구간에서 $\left|\sin x-\frac{1}{2}\right|\le\frac{1}{2}$이려면 $\sin x\ge 0$이라 $a\le\pi$. 둘째 구간 $\left|k\sin x-\frac{1}{2}\right|\le\frac{1}{2}$까지 (가)를 만족하려면 $a=\pi$, $k=-\frac{1}{2}$이다.`,
      String.raw`2. 이때 $f=0$의 근은 첫 구간 $\sin x=\frac{1}{2}$에서 $x=\frac{\pi}{6},\frac{5\pi}{6}$, 둘째 구간 $-\frac{1}{2}\sin x-\frac{1}{2}=0$에서 $\sin x=-1$, $x=\frac{3\pi}{2}$ (접점). 총 3개로 (나) 성립.`,
      String.raw`3. $|f|=\frac{1}{4}$의 근: 첫 구간 $\sin x=\frac{3}{4}$, $\frac{1}{4}$에서 각각 합이 $\pi$인 두 근씩($2\pi$), 둘째 구간 $\sin x=-\frac{1}{2}$에서 $x=\frac{7\pi}{6},\frac{11\pi}{6}$(합 $3\pi$). 따라서 $S=5\pi$.`,
      String.raw`4. $20\left(\frac{a+S}{\pi}+k\right)=20\left(\frac{\pi+5\pi}{\pi}-\frac{1}{2}\right)=20\left(6-\frac{1}{2}\right)=110$.`
    ),
    A: String.raw`110`,
  },
  // [2022년 9월 고3 9번] f=cos(πx/6), g=-3cos(πx/6)-1, |α1-α2|=8 → |β1-β2| (정답 4)
  '039': {
    P: String.raw`$|\beta_1-\beta_2|$의 값`,
    C: String.raw`$f(x)=\cos\frac{\pi x}{6}$, $g(x)=-3\cos\frac{\pi x}{6}-1$ ($0\le x\le 12$). $y=f(x)$와 $y=k$의 두 교점 $\alpha_1,\alpha_2$에서 $|\alpha_1-\alpha_2|=8$이다`,
    B: String.raw`$f,g$ 모두 $\cos\frac{\pi x}{6}$를 포함하므로 각 수평선과의 두 교점은 $x=6$에 대칭이다`,
    S: S(
      String.raw`1. $f(x)=k$의 두 근은 $x=6$에 대칭이라 $\alpha_1+\alpha_2=12$. $|\alpha_1-\alpha_2|=8$과 연립하면 $\{\alpha_1,\alpha_2\}=\{2,10\}$.`,
      String.raw`2. $\alpha=2$에서 $\cos\frac{2\pi}{6}=\cos\frac{\pi}{3}=\frac{1}{2}$이므로 $k=\frac{1}{2}$.`,
      String.raw`3. $g(x)=\frac{1}{2}$: $-3\cos\frac{\pi x}{6}-1=\frac{1}{2}$에서 $\cos\frac{\pi x}{6}=-\frac{1}{2}$, $\frac{\pi x}{6}=\frac{2\pi}{3},\frac{4\pi}{3}$이므로 $x=4,8$.`,
      String.raw`4. 따라서 $|\beta_1-\beta_2|=|4-8|=4$. (답 ③)`
    ),
    A: String.raw`③ 4`,
  },
  // [2022년 7월 고3 10번] y=sin(πx/2) [0,5], y=k 와 세 교점 합 25/4, AB 길이 (정답 3/2)
  '040': {
    P: String.raw`선분 $AB$의 길이`,
    C: String.raw`$y=\sin\frac{\pi}{2}x\ (0\le x\le 5)$가 직선 $y=k\ (0<k<1)$와 만나는 세 점 $A,B,C$($x$좌표가 작은 순)의 $x$좌표의 합이 $\frac{25}{4}$`,
    B: String.raw`세 양수해는 상승·하강·재상승 구간에서 나오고, $A,B$는 같은 높이 $k$의 점이라 선분 $AB$는 수평이다`,
    S: S(
      String.raw`1. $\sin\frac{\pi x}{2}=k$에서 $\theta=\arcsin k$로 두면 세 해는 $x_A=\frac{2\theta}{\pi}$, $x_B=2-\frac{2\theta}{\pi}$, $x_C=4+\frac{2\theta}{\pi}$.`,
      String.raw`2. 합 $x_A+x_B+x_C=6+\frac{2\theta}{\pi}=\frac{25}{4}$에서 $\frac{2\theta}{\pi}=\frac{1}{4}$.`,
      String.raw`3. 따라서 $x_A=\frac{1}{4}$, $x_B=\frac{7}{4}$이고 $A,B$는 같은 높이라 $\overline{AB}=\frac{7}{4}-\frac{1}{4}=\frac{3}{2}$. (답 ③)`
    ),
    A: String.raw`③ $\frac{3}{2}$`,
  },
  // [2020년 4월 고3 이과 21번] A_k={sin(2(m-1)π/k)} 보기 ㄱㄴㄷ (정답 ②: ㄱ,ㄴ; ㄷ 거짓)
  '041': {
    P: String.raw`보기 ㄱ, ㄴ, ㄷ 중 옳은 것`,
    C: String.raw`$A_k$는 자연수 $m$에 대한 $\sin\frac{2(m-1)}{k}\pi$ 값들의 집합, 즉 $j=0,1,\dots,k-1$일 때 $\sin\frac{2\pi j}{k}$ 값들의 집합`,
    B: String.raw`원소 수는 $k$가 홀수면 $k$, $k\equiv 2\ (\mathrm{mod}\ 4)$면 $\frac{k}{2}$, $k\equiv 0\ (\mathrm{mod}\ 4)$면 $\frac{k}{2}+1$이다`,
    S: S(
      String.raw`1. (ㄱ) $A_3=\{\sin 0,\ \sin\frac{2\pi}{3},\ \sin\frac{4\pi}{3}\}=\{0,\ \frac{\sqrt{3}}{2},\ -\frac{\sqrt{3}}{2}\}$로 참.`,
      String.raw`2. (ㄴ) $1\in A_k$는 $\sin\frac{2\pi j}{k}=1$일 때, 즉 $k$가 4의 배수일 때이다. 두 자리 자연수 중 4의 배수 $12,16,\dots,96$은 22개이므로 참.`,
      String.raw`3. (ㄷ) $n(A_k)=11$인 $k$는 홀수 $11$, $k\equiv2$인 $22$, $k\equiv0$인 $20$이다. 합이 $11+20+22=53$이므로 "33"은 거짓.`,
      String.raw`4. 따라서 옳은 것은 ㄱ, ㄴ. (답 ②)`
    ),
    A: String.raw`② (ㄱ, ㄴ)`,
  },
  // [2023년 6월 고2 21번] g(n)=max|sinx-1/2|, g(k) 무리수인 k≤40 합 (정답 123)
  '044': {
    P: String.raw`$g(k)$가 무리수가 되도록 하는 40 이하의 자연수 $k$의 값의 합`,
    C: String.raw`$g(n)$은 구간 $\left[\frac{n-1}{6}\pi,\ \frac{n+2}{6}\pi\right]$(길이 $\frac{\pi}{2}$)에서 $f(x)=\left|\sin x-\frac{1}{2}\right|$의 최댓값`,
    B: String.raw`구간의 끝과 극점에서 $\sin x$는 $0,\pm\frac{1}{2},\pm\frac{\sqrt{3}}{2},\pm1$ 값을 갖고, $\left|\sin x-\frac{1}{2}\right|$가 무리수인 경우는 $\sin x=\pm\frac{\sqrt{3}}{2}$에서 최대일 때이다`,
    S: S(
      String.raw`1. $\left|\sin x-\frac{1}{2}\right|$은 $\sin x=0,\frac{1}{2},-\frac{1}{2},1,-1$이면 $\frac{1}{2},0,1,\frac{1}{2},\frac{3}{2}$로 유리수, $\sin x=\frac{\sqrt{3}}{2},-\frac{\sqrt{3}}{2}$이면 $\frac{\sqrt{3}-1}{2},\frac{\sqrt{3}+1}{2}$로 무리수이다.`,
      String.raw`2. $g(n)$이 무리수이려면 구간에서의 최댓값이 $\sin x=\pm\frac{\sqrt{3}}{2}$에서 나와야 하며, 이는 $n\equiv 6$ 또는 $11\ (\mathrm{mod}\ 12)$일 때이다.`,
      String.raw`3. 40 이하의 그러한 $k$는 $6,11,18,23,30,35$.`,
      String.raw`4. 합은 $6+11+18+23+30+35=123$. (답 ⑤)`
    ),
    A: String.raw`⑤ 123`,
  },
  // [2024년 6월 고2 30번] f=|2sin(πx/k)+1/2|, [t,t+1] 최대 1/2 인 t가 둘뿐, kα+β (정답 47; k=6)
  '048': {
    P: String.raw`$k\alpha+\beta$의 값 (단, $\alpha<\beta$)`,
    C: String.raw`$f(x)=\left|2\sin\frac{\pi}{k}x+\frac{1}{2}\right|$ ($k>1$)이고, $0\le t\le 2k$인 $t$에 대해 $[t,t+1]$에서 $f$의 최댓값이 $\frac{1}{2}$이 되는 $t$가 $\alpha,\beta$뿐`,
    B: String.raw`$f\le\frac{1}{2}$이려면 $\sin\frac{\pi x}{k}\in\left[-\frac{1}{2},0\right]$이어야 하고, 이 구간(각도 폭 $\frac{\pi}{6}$)에 $[t,t+1]$(각도 폭 $\frac{\pi}{k}$)이 꼭 맞게 들어가야 $t$가 둘뿐이 된다`,
    S: S(
      String.raw`1. $[t,t+1]$에서 $f$의 최댓값이 $\frac{1}{2}$이려면 $\sin\frac{\pi x}{k}\in\left[-\frac{1}{2},0\right]$을 유지하며 끝점에서 $\frac{1}{2}$에 닿아야 한다.`,
      String.raw`2. $\sin\theta\in\left[-\frac{1}{2},0\right]$인 곳은 한 주기에 길이 $\frac{\pi}{6}$인 구간 두 개이다. $\frac{\pi}{k}<\frac{\pi}{6}$이면($k>6$) 양 끝쪽 두 위치가 가능해 $t$가 너무 많고, $\frac{\pi}{k}>\frac{\pi}{6}$이면($k<6$) 들어가지 못한다.`,
      String.raw`3. $t$가 정확히 둘이려면 $\frac{\pi}{k}=\frac{\pi}{6}$, 즉 $k=6$이고, 이때 $[t,t+1]$이 각 구간과 일치하는 $t=6,\ t=11$뿐이다.`,
      String.raw`4. 따라서 $\alpha=6,\ \beta=11$이고 $k\alpha+\beta=6\times 6+11=47$.`
    ),
    A: String.raw`47`,
  },
  // [2019년 11월 고2 15번] 직선 y=2 와 두 원 교점 A,B, sinα·cosβ (정답 -2/3)
  '051': {
    P: String.raw`$\sin\alpha\times\cos\beta$의 값`,
    C: String.raw`직선 $y=2$가 원 $x^2+y^2=5$, $x^2+y^2=9$와 제2사분면에서 만나는 점이 각각 $A,B$이고, $C(3,0)$, $\angle COA=\alpha$, $\angle COB=\beta$`,
    B: String.raw`각 $\alpha,\beta$는 동경 $OA,OB$가 양의 $x$축($OC$)과 이루는 각이므로, $\sin\alpha,\cos\beta$는 두 점의 좌표를 반지름으로 나눈 값`,
    S: S(
      String.raw`1. $x^2+y^2=5$, $y=2$에서 $x^2=1$, 제2사분면이라 $A(-1,2)$, $|OA|=\sqrt{5}$.`,
      String.raw`2. $x^2+y^2=9$, $y=2$에서 $x^2=5$, 제2사분면이라 $B(-\sqrt{5},2)$, $|OB|=3$.`,
      String.raw`3. $\sin\alpha=\frac{2}{\sqrt{5}}$, $\cos\beta=\frac{-\sqrt{5}}{3}$이므로 $\sin\alpha\times\cos\beta=\frac{2}{\sqrt{5}}\times\frac{-\sqrt{5}}{3}=-\frac{2}{3}$. (답 ⑤)`
    ),
    A: String.raw`⑤ $-\frac{2}{3}$`,
  },
  // [2022년 6월 고2 18번] f=3sin(2nx), 삼각형 ABC 넓이 π/12 존재 n 최댓값 (정답 18)
  '052': {
    P: String.raw`삼각형 $ABC$가 존재하도록 하는 $n$의 최댓값`,
    C: String.raw`$f(x)=3\sin 2nx$ ($-\frac{\pi}{2n}<x<\frac{\pi}{2n}$)와 원점을 지나는 양의 기울기 직선이 세 점 $O,A,B$에서 만나고, $C\left(\frac{\pi}{2n},0\right)$, $\triangle ABC$의 넓이가 $\frac{\pi}{12}$`,
    B: String.raw`$f$가 기함수라 교점은 $O$와 대칭점 $A(x_0,y_0),B(-x_0,-y_0)$이고, $\triangle ABC$의 넓이는 $\frac{\pi}{2n}|y_0|$로 정리된다`,
    S: S(
      String.raw`1. 직선과의 교점은 $O$, $A(x_0,y_0)$, $B(-x_0,-y_0)$이고, $\triangle ABC$의 넓이는 $\frac{1}{2}\left|\frac{\pi}{2n}\cdot 2y_0\right|=\frac{\pi}{2n}|y_0|$.`,
      String.raw`2. 넓이가 $\frac{\pi}{12}$이므로 $\frac{\pi}{2n}|y_0|=\frac{\pi}{12}$에서 $|y_0|=\frac{n}{6}$.`,
      String.raw`3. $y_0=3\sin 2nx_0$의 최댓값이 3이므로 $\frac{n}{6}\le 3$, 즉 $n\le 18$.`,
      String.raw`4. 따라서 $n$의 최댓값은 18. (답 ④)`
    ),
    A: String.raw`④ 18`,
  },
  // [2021년 9월 고2 19번] 반원·PA=PC·PA=PD, tanθ=3/4, △ADC 넓이 (정답 64/5)
  '053': {
    P: String.raw`삼각형 $ADC$의 넓이`,
    C: String.raw`지름 $\overline{AB}=10$인 반원의 호 위 점 $P$, $\overline{PB}$의 연장선 위 $\overline{PA}=\overline{PC}$인 $C$, $\overline{PO}$의 연장선 위 $\overline{PA}=\overline{PD}$인 $D$, $\angle PAB=\theta$, $4\sin\theta=3\cos\theta$`,
    B: String.raw`지름에 대한 원주각이라 $\angle APB=90^\circ$이고, $\tan\theta=\frac{3}{4}$에서 $\sin\theta=\frac{3}{5},\cos\theta=\frac{4}{5}$, $\overline{AP}=8,\overline{BP}=6,\overline{PO}=5$`,
    S: S(
      String.raw`1. $\angle APB=90^\circ$, $\tan\theta=\frac{3}{4}$에서 $\overline{AP}=10\cos\theta=8$, $\overline{BP}=10\sin\theta=6$, $\overline{PO}=5$이다.`,
      String.raw`2. 좌표로 $A(-5,0),O(0,0),B(5,0)$, $P=A+8(\cos\theta,\sin\theta)=(1.4,\ 4.8)$.`,
      String.raw`3. $C$는 $\overrightarrow{PB}$ 방향으로 $\overline{PC}=8$이라 $C(6.2,-1.6)$, $D$는 $\overrightarrow{PO}$ 방향으로 $\overline{PD}=8$이라 $D(-0.84,-2.88)$.`,
      String.raw`4. 삼각형 $ADC$의 넓이는 $\frac{1}{2}\left|(-5)(y_D-y_C)+x_D y_C-x_C y_D\right|=\frac{64}{5}$. (답 ③)`
    ),
    A: String.raw`③ $\frac{64}{5}$`,
  },
  // [2019년 6월 고2 17번] 3+2sin²θ+1/(3-2cos²θ) 최솟값 과정, f(p)+tan²(q+π/3) (정답 4)
  '055': {
    P: String.raw`$f(p)+\tan^2\left(q+\frac{\pi}{3}\right)$의 값`,
    C: String.raw`$0<\theta<2\pi$에서 $3+2\sin^2\theta+\frac{1}{3-2\cos^2\theta}$의 최솟값을 구하는 과정. $3+2\sin^2\theta=t$로 두고 (가)$=f(t)$, (나)$=p$, (다)$=q$`,
    B: String.raw`$3+2\sin^2\theta=t$로 두면 $3-2\cos^2\theta=t-2$이라 (가)$=t-2$. $t-2>0$이므로 $t+\frac{1}{t-2}=(t-2)+\frac{1}{t-2}+2\ge 4$`,
    S: S(
      String.raw`1. $2\sin^2\theta=t-3$, $\cos^2\theta=\frac{5-t}{2}$에서 $3-2\cos^2\theta=t-2$. 따라서 $f(t)=t-2$.`,
      String.raw`2. $t\ge 3$이라 $t-2>0$이고 $(t-2)+\frac{1}{t-2}+2\ge 2+2=4$, 등호는 $t-2=\frac{1}{t-2}$ 즉 $t=3$일 때이므로 $p=3$.`,
      String.raw`3. $t=3$이면 $\sin^2\theta=0$, $0<\theta<2\pi$에서 $\theta=\pi$이므로 $q=\pi$.`,
      String.raw`4. $f(p)=f(3)=1$, $\tan^2\left(\pi+\frac{\pi}{3}\right)=\tan^2\frac{\pi}{3}=3$이므로 합은 $1+3=4$. (답 ①)`
    ),
    A: String.raw`① 4`,
  },
  // [2019년 6월 고2 이과 16번] 055와 동일 문제 (정답 4)
  '056': {
    P: String.raw`$f(p)+\tan^2\left(q+\frac{\pi}{3}\right)$의 값`,
    C: String.raw`$0<\theta<2\pi$에서 $3+2\sin^2\theta+\frac{1}{3-2\cos^2\theta}$의 최솟값을 구하는 과정. $3+2\sin^2\theta=t$로 두고 (가)$=f(t)$, (나)$=p$, (다)$=q$`,
    B: String.raw`$3+2\sin^2\theta=t$로 두면 $3-2\cos^2\theta=t-2$이라 (가)$=t-2$. $t-2>0$이므로 $t+\frac{1}{t-2}=(t-2)+\frac{1}{t-2}+2\ge 4$`,
    S: S(
      String.raw`1. $2\sin^2\theta=t-3$, $\cos^2\theta=\frac{5-t}{2}$에서 $3-2\cos^2\theta=t-2$. 따라서 $f(t)=t-2$.`,
      String.raw`2. $t\ge 3$이라 $t-2>0$이고 $(t-2)+\frac{1}{t-2}+2\ge 2+2=4$, 등호는 $t-2=\frac{1}{t-2}$ 즉 $t=3$일 때이므로 $p=3$.`,
      String.raw`3. $t=3$이면 $\sin^2\theta=0$, $0<\theta<2\pi$에서 $\theta=\pi$이므로 $q=\pi$.`,
      String.raw`4. $f(p)=f(3)=1$, $\tan^2\left(\pi+\frac{\pi}{3}\right)=\tan^2\frac{\pi}{3}=3$이므로 합은 $1+3=4$. (답 ①)`
    ),
    A: String.raw`① 4`,
  },
  // [2018년 9월 고3 이과 14번] f=cos²(x-3π/4)-cos(x-π/4)+k, max3 min m, k+m (정답 5/2)
  '057': {
    P: String.raw`$k+m$의 값`,
    C: String.raw`$f(x)=\cos^2\left(x-\frac{3}{4}\pi\right)-\cos\left(x-\frac{\pi}{4}\right)+k$의 최댓값이 3, 최솟값이 $m$`,
    B: String.raw`$u=x-\frac{\pi}{4}$로 두면 $\cos\left(x-\frac{3}{4}\pi\right)=\sin u$이라 $f=-\cos^2 u-\cos u+1+k$, $\cos u$에 대한 이차식이다`,
    S: S(
      String.raw`1. $u=x-\frac{\pi}{4}$로 두면 $\cos\left(x-\frac{3}{4}\pi\right)=\cos\left(u-\frac{\pi}{2}\right)=\sin u$이므로 $f=\sin^2 u-\cos u+k=-\cos^2 u-\cos u+1+k$.`,
      String.raw`2. $c=\cos u\in[-1,1]$로 두면 $f=-\left(c+\frac{1}{2}\right)^2+\frac{5}{4}+k$.`,
      String.raw`3. 최댓값은 $c=-\frac{1}{2}$에서 $\frac{5}{4}+k=3$이라 $k=\frac{7}{4}$. 최솟값은 $c=1$에서 $m=k-1=\frac{3}{4}$.`,
      String.raw`4. 따라서 $k+m=\frac{7}{4}+\frac{3}{4}=\frac{5}{2}$. (답 ③)`
    ),
    A: String.raw`③ $\frac{5}{2}$`,
  },
  // [2023년 11월 고2 29번] [π/2,a] 에서 2cos(3x+b) max1 min-√3, ab=(q/p)π², p+q (정답 14)
  '058': {
    P: String.raw`$p+q$의 값 (단, $p,q$는 서로소인 자연수)`,
    C: String.raw`$0\le b\le\pi$, 닫힌구간 $\left[\frac{\pi}{2},a\right]$에서 $f(x)=2\cos(3x+b)$의 최댓값이 1, 최솟값이 $-\sqrt{3}$, $ab=\frac{q}{p}\pi^2$`,
    B: String.raw`최댓값 1은 $\cos(3x+b)=\frac{1}{2}$, 최솟값 $-\sqrt{3}$은 $\cos(3x+b)=-\frac{\sqrt{3}}{2}$일 때이고, $3x+b$가 $\frac{\pi}{3}$에서 $\frac{5\pi}{6}$까지(주기 포함) 단조 감소하도록 놓인다`,
    S: S(
      String.raw`1. $\theta=3x+b$로 두면 $x\in\left[\frac{\pi}{2},a\right]$일 때 $\theta\in\left[\frac{3\pi}{2}+b,\ 3a+b\right]$. 최댓값 1, 최솟값 $-\sqrt{3}$이려면 $\cos\theta$가 $\frac{1}{2}$에서 $-\frac{\sqrt{3}}{2}$로 단조 감소해야 한다.`,
      String.raw`2. 즉 $\frac{3\pi}{2}+b=2\pi+\frac{\pi}{3}$에서 $b=\frac{5\pi}{6}$ ($0\le b\le\pi$).`,
      String.raw`3. $3a+b=2\pi+\frac{5\pi}{6}$에서 $3a=2\pi$, $a=\frac{2\pi}{3}$.`,
      String.raw`4. $ab=\frac{2\pi}{3}\cdot\frac{5\pi}{6}=\frac{5}{9}\pi^2$이므로 $q=5,p=9$, $p+q=14$.`
    ),
    A: String.raw`14`,
  },
  // [2019년 6월 고2 27번] f=log3 x+2, g=3tan(x+π/6), (f∘g) max+min (정답 6)
  '059': {
    P: String.raw`$M+m$의 값`,
    C: String.raw`$f(x)=\log_3 x+2$, $g(x)=3\tan\left(x+\frac{\pi}{6}\right)$, $0\le x\le\frac{\pi}{6}$에서 합성함수 $(f\circ g)(x)$의 최댓값 $M$, 최솟값 $m$`,
    B: String.raw`$(f\circ g)(x)=\log_3\left(3\tan\left(x+\frac{\pi}{6}\right)\right)+2=\log_3\tan\left(x+\frac{\pi}{6}\right)+3$이고 $\tan$이 증가하므로 양 끝에서 최대·최소`,
    S: S(
      String.raw`1. $(f\circ g)(x)=\log_3\left(3\tan\left(x+\frac{\pi}{6}\right)\right)+2=\log_3\tan\left(x+\frac{\pi}{6}\right)+3$.`,
      String.raw`2. $x\in\left[0,\frac{\pi}{6}\right]$이면 $x+\frac{\pi}{6}\in\left[\frac{\pi}{6},\frac{\pi}{3}\right]$이라 $\tan$ 값은 $\frac{1}{\sqrt{3}}$에서 $\sqrt{3}$까지 증가.`,
      String.raw`3. $x=0$에서 $m=\log_3\frac{1}{\sqrt{3}}+3=\frac{5}{2}$, $x=\frac{\pi}{6}$에서 $M=\log_3\sqrt{3}+3=\frac{7}{2}$.`,
      String.raw`4. 따라서 $M+m=\frac{7}{2}+\frac{5}{2}=6$.`
    ),
    A: String.raw`6`,
  },
  // [2018년 11월 고2 이과 16번] 2cos²x+(2+√3)sinx-(2+√3)=0 해의 합 (정답 3π/2)
  '062': {
    P: String.raw`방정식의 모든 해의 합`,
    C: String.raw`$0\le x\le\pi$에서 $2\cos^2 x+(2+\sqrt{3})\sin x-(2+\sqrt{3})=0$`,
    B: String.raw`$\cos^2 x=1-\sin^2 x$로 바꾸면 $\sin x$에 대한 이차방정식이 된다`,
    S: S(
      String.raw`1. $2\cos^2 x=2-2\sin^2 x$이므로 $2\sin^2 x-(2+\sqrt{3})\sin x+\sqrt{3}=0$.`,
      String.raw`2. 인수분해하면 $(\sin x-1)(2\sin x-\sqrt{3})=0$, 즉 $\sin x=1$ 또는 $\sin x=\frac{\sqrt{3}}{2}$.`,
      String.raw`3. $0\le x\le\pi$에서 $\sin x=1$이면 $x=\frac{\pi}{2}$, $\sin x=\frac{\sqrt{3}}{2}$이면 $x=\frac{\pi}{3},\frac{2\pi}{3}$.`,
      String.raw`4. 따라서 해의 합은 $\frac{\pi}{2}+\frac{\pi}{3}+\frac{2\pi}{3}=\frac{3}{2}\pi$. (답 ④)`
    ),
    A: String.raw`④ $\frac{3}{2}\pi$`,
  },
  // [2021년 4월 고3 11번] 2cos²x-sin(π+x)-2=0 해의 합 (정답 2π)
  '066': {
    P: String.raw`방정식의 모든 해의 합`,
    C: String.raw`$0<x<2\pi$에서 $2\cos^2 x-\sin(\pi+x)-2=0$`,
    B: String.raw`$\sin(\pi+x)=-\sin x$, $\cos^2 x=1-\sin^2 x$로 바꾸면 $\sin x$로 인수분해된다`,
    S: S(
      String.raw`1. $\sin(\pi+x)=-\sin x$이므로 $2\cos^2 x+\sin x-2=0$, 즉 $-2\sin^2 x+\sin x=0$.`,
      String.raw`2. $\sin x(1-2\sin x)=0$에서 $\sin x=0$ 또는 $\sin x=\frac{1}{2}$.`,
      String.raw`3. $0<x<2\pi$에서 $\sin x=0$이면 $x=\pi$, $\sin x=\frac{1}{2}$이면 $x=\frac{\pi}{6},\frac{5\pi}{6}$.`,
      String.raw`4. 따라서 해의 합은 $\pi+\frac{\pi}{6}+\frac{5\pi}{6}=2\pi$. (답 ③)`
    ),
    A: String.raw`③ $2\pi$`,
  },
  // [2023년 6월 고2 15번] f=a cos(2x/3)+a, △ABC 정삼각형, a (정답 2√3π/3)
  '068': {
    P: String.raw`$a$의 값`,
    C: String.raw`$\left[-\frac{3}{2}\pi,\frac{3}{2}\pi\right]$에서 $f(x)=a\cos\frac{2}{3}x+a$ ($a>0$), $A$는 $y$축과의 교점, $B,C$는 직선 $y=\frac{a}{2}$와의 두 교점, $\triangle ABC$가 정삼각형`,
    B: String.raw`$A(0,2a)$이고 $\cos\frac{2x}{3}=-\frac{1}{2}$에서 $B(-\pi,\frac{a}{2}),C(\pi,\frac{a}{2})$. 정삼각형이면 높이가 밑변의 $\frac{\sqrt{3}}{2}$배`,
    S: S(
      String.raw`1. $f(0)=2a$이므로 $A(0,2a)$.`,
      String.raw`2. $a\cos\frac{2x}{3}+a=\frac{a}{2}$에서 $\cos\frac{2x}{3}=-\frac{1}{2}$, $\frac{2x}{3}=\pm\frac{2\pi}{3}$, $x=\pm\pi$이므로 $B(-\pi,\frac{a}{2}),C(\pi,\frac{a}{2})$, $\overline{BC}=2\pi$.`,
      String.raw`3. 높이는 $2a-\frac{a}{2}=\frac{3a}{2}$이고, 정삼각형이려면 $\frac{3a}{2}=\frac{\sqrt{3}}{2}\times 2\pi=\sqrt{3}\pi$.`,
      String.raw`4. 따라서 $a=\frac{2\sqrt{3}}{3}\pi$. (답 ⑤)`
    ),
    A: String.raw`⑤ $\frac{2\sqrt{3}}{3}\pi$`,
  },
  // [2020년 6월 고2 15번] y=tan(πx) 와 직선 3교점 자연수 n 최댓값 (정답 6)
  '069': {
    P: String.raw`자연수 $n$의 최댓값`,
    C: String.raw`$0\le x\le 2$에서 $y=\tan\pi x$의 그래프와 직선 $y=-\frac{10}{3}x+n$이 서로 다른 세 점에서 만남`,
    B: String.raw`$\tan\pi x$는 점근선 $x=\frac{1}{2},\frac{3}{2}$로 세 가지로 나뉘고 앞의 두 가지는 항상 한 번씩 만나므로, 세 번째 가지에서도 만나는 최대 $n$을 찾는다`,
    S: S(
      String.raw`1. $\tan\pi x$는 $x=\frac{1}{2},\frac{3}{2}$에서 점근선을 가져 세 가지로 나뉜다.`,
      String.raw`2. 감소하는 직선은 앞의 두 가지(각각 $-\infty\to+\infty$)와 항상 한 번씩 만난다.`,
      String.raw`3. 세 번째 가지 $\left(\frac{3}{2},2\right]$에서도 만나려면 $x=2$에서 직선이 곡선($\tan 2\pi=0$) 아래여야 하므로 $-\frac{20}{3}+n<0$, 즉 $n<\frac{20}{3}$.`,
      String.raw`4. 자연수 $n$의 최댓값은 $6$. (답 ⑤)`
    ),
    A: String.raw`⑤ 6`,
  },
  // [2019년 9월 고2 이과 28번] (2/√3)sin(x+π/3)-7/8=0 실근합 (정답 p+q=10)
  '071': {
    P: String.raw`$p+q$의 값 (단, $p,q$는 서로소인 자연수)`,
    C: String.raw`$0\le x\le 2\pi$에서 $\frac{2}{\sqrt{3}}\sin\left(x+\frac{\pi}{3}\right)-\frac{7}{8}=0$의 모든 실근의 합이 $\frac{q}{p}\pi$`,
    B: String.raw`$\sin\left(x+\frac{\pi}{3}\right)=\frac{7\sqrt{3}}{16}\in(0,1)$이라 두 근의 $\theta=x+\frac{\pi}{3}$ 값이 $\pi-\alpha$와 $2\pi+\alpha$로 대칭이 되어 합에서 $\alpha$가 소거된다`,
    S: S(
      String.raw`1. $\sin\left(x+\frac{\pi}{3}\right)=\frac{7\sqrt{3}}{16}$이고 $\theta=x+\frac{\pi}{3}\in\left[\frac{\pi}{3},\frac{7\pi}{3}\right]$(길이 $2\pi$)에서 두 해를 갖는다.`,
      String.raw`2. $\alpha=\arcsin\frac{7\sqrt{3}}{16}$로 두면 두 해는 $\theta=\pi-\alpha,\ 2\pi+\alpha$.`,
      String.raw`3. $x=\theta-\frac{\pi}{3}$이므로 근의 합은 $(\pi-\alpha)+(2\pi+\alpha)-\frac{2\pi}{3}=\frac{7\pi}{3}$.`,
      String.raw`4. 따라서 $\frac{q}{p}=\frac{7}{3}$, $p+q=10$.`
    ),
    A: String.raw`10`,
  },
  // [2019년 6월 고2 18번] y=-x/(5π)+1 과 y=sinx 교점 개수 (정답 11)
  '072': {
    P: String.raw`교점의 개수`,
    C: String.raw`직선 $y=-\frac{1}{5\pi}x+1$과 함수 $y=\sin x$의 그래프의 교점`,
    B: String.raw`교점은 직선의 $y$값이 $\sin x$의 치역 $[-1,1]$에 드는 $0\le x\le 10\pi$에만 생기고, 이 구간에 $\sin x$는 다섯 주기를 갖는다`,
    S: S(
      String.raw`1. $\sin x=-\frac{1}{5\pi}x+1$의 교점은 직선의 $y$값이 $[-1,1]$인 $0\le x\le 10\pi$에서만 생긴다.`,
      String.raw`2. 직선은 $(0,1)$에서 $(10\pi,-1)$로 완만히 감소하고, 이 구간에 $y=\sin x$는 다섯 주기를 갖는다.`,
      String.raw`3. 거의 수평인 직선이 다섯 주기의 마루와 골 부근에서 차례로 교차하여 교점은 모두 11개이다.`
    ),
    A: String.raw`⑤ 11`,
  },
  // [2024년 9월 고3 20번] 조각함수 f(x)=f(t) 해 3개인 t의 합 (정답 p+q=15)
  '073': {
    P: String.raw`$p+q$의 값 (단, $p,q$는 서로소인 자연수)`,
    C: String.raw`$[0,2\pi]$에서 $f(x)=\sin x-1\ (0\le x<\pi)$, $-\sqrt{2}\sin x-1\ (\pi\le x\le 2\pi)$. $0\le t\le 2\pi$에 대해 $f(x)=f(t)$의 서로 다른 실근이 3개가 되는 모든 $t$의 합이 $\frac{q}{p}\pi$`,
    B: String.raw`값 $c=f(t)$에 따른 $f(x)=c$의 근의 개수를 조사하면, 근이 3개인 경우는 $c=0$ 또는 $c=-1$일 때이다`,
    S: S(
      String.raw`1. 첫 구간 $f=\sin x-1$은 치역 $[-1,0]$, 둘째 구간 $f=-\sqrt{2}\sin x-1$은 치역 $[-1,\sqrt{2}-1]$이다.`,
      String.raw`2. $f(x)=c$의 근의 개수는 $c=\sqrt{2}-1$이면 1, $0<c<\sqrt{2}-1$이면 2, $c=0$이면 3, $-1<c<0$이면 4, $c=-1$이면 3이다.`,
      String.raw`3. 근이 3개이려면 $f(t)=0$ 또는 $f(t)=-1$. $f(t)=0$인 $t=\frac{\pi}{2},\frac{5\pi}{4},\frac{7\pi}{4}$, $f(t)=-1$인 $t=0,\pi,2\pi$.`,
      String.raw`4. 합은 $\frac{\pi}{2}+\frac{5\pi}{4}+\frac{7\pi}{4}+0+\pi+2\pi=\frac{13}{2}\pi$이므로 $p+q=2+13=15$.`
    ),
    A: String.raw`15`,
  },
  // [2022년 4월 고3 11번] sin(kx)=1/3 (8해) 모든 해의 합 (정답 7π)
  '074': {
    P: String.raw`방정식의 모든 해의 합`,
    C: String.raw`자연수 $k$에 대하여 $0\le x<2\pi$에서 $\sin kx=\frac{1}{3}$의 서로 다른 실근이 8개`,
    B: String.raw`$\theta=kx\in[0,2\pi k)$에서 $\sin\theta=\frac{1}{3}$은 한 주기당 2개라 총 $2k$개이므로 $2k=8$, $k=4$`,
    S: S(
      String.raw`1. $\theta=kx$로 두면 $\sin\theta=\frac{1}{3}$의 해는 $\theta\in[0,2\pi k)$에서 $2k$개이므로 $2k=8$에서 $k=4$.`,
      String.raw`2. 한 주기의 두 해 $\theta$의 합은 $\pi+4\pi n$이므로 $x=\frac{\theta}{k}$들의 합은 $\pi+2\pi(k-1)$.`,
      String.raw`3. $k=4$이므로 해의 합은 $\pi+2\pi\cdot 3=7\pi$. (답 ③)`
    ),
    A: String.raw`③ $7\pi$`,
  },
  // [2021년 10월 고3 11번] 조각함수와 y=sin(kπ/6) 교점수 합 a1..a5 (정답 9)
  '075': {
    P: String.raw`$a_1+a_2+a_3+a_4+a_5$의 값`,
    C: String.raw`$[0,2\pi]$에서 $f(x)=\sin x\ (0\le x\le\frac{k}{6}\pi)$, $2\sin\frac{k}{6}\pi-\sin x\ (\frac{k}{6}\pi<x\le 2\pi)$. $y=f(x)$와 $y=\sin\frac{k}{6}\pi$의 교점 수가 $a_k$`,
    B: String.raw`두 구간 모두 $f(x)=\sin\frac{k}{6}\pi$는 $\sin x=\sin\frac{k}{6}\pi$와 같으므로, $a_k$는 $[0,2\pi]$에서 $\sin x=\sin\frac{k}{6}\pi$의 해의 개수`,
    S: S(
      String.raw`1. $c=\sin\frac{k}{6}\pi$로 두면 첫 구간은 $\sin x=c$, 둘째 구간은 $2c-\sin x=c$ 즉 $\sin x=c$이므로 교점은 모두 $\sin x=c$의 해이다.`,
      String.raw`2. 따라서 $a_k$는 $[0,2\pi]$에서 $\sin x=\sin\frac{k}{6}\pi$의 해의 개수이다.`,
      String.raw`3. $k=1,2,4,5$이면 $0<c<1$이라 해 2개씩, $k=3$이면 $c=1$이라 해 1개($x=\frac{\pi}{2}$).`,
      String.raw`4. 따라서 $a_1+a_2+a_3+a_4+a_5=2+2+1+2+2=9$. (답 ④)`
    ),
    A: String.raw`④ 9`,
  },
  // [2024년 10월 고2 29번] 인수분해 방정식 해 2개인 정수 k의 곱 (정답 48)
  '078': {
    P: String.raw`모든 정수 $k$의 값의 곱`,
    C: String.raw`$0\le x\le 2\pi$에서 $\left(\sin x-\frac{1}{4}k\right)\left(\sin x+\frac{1}{4}k^2-\frac{3}{4}k\right)=0$의 서로 다른 해가 2개가 되도록 하는 정수 $k$`,
    B: String.raw`$\sin x=\frac{k}{4}$ 또는 $\sin x=\frac{3k-k^2}{4}$이고, $\sin x=v$의 해는 $|v|<1$이면 2개, $v=\pm1$이면 1개, $v=0$이면 3개, $|v|>1$이면 0개`,
    S: S(
      String.raw`1. $\sin x=\frac{k}{4}=A$ 또는 $\sin x=\frac{3k-k^2}{4}=B$.`,
      String.raw`2. 서로 다른 해가 2개이려면 한쪽이 $\pm1$(해 1개)·다른 쪽이 $(-1,1)$(해 2개)이거나, 한쪽이 범위 밖(해 0개)이어야 한다.`,
      String.raw`3. 정수 $k$를 조사하면 $k=-3$(해 $2+0$), $k=-2$($2+0$), $k=2$($A=B=\frac{1}{2}$로 2), $k=4$($A=1,B=-1$로 $1+1$)에서 해가 2개이다.`,
      String.raw`4. 따라서 곱은 $(-3)\times(-2)\times 2\times 4=48$.`
    ),
    A: String.raw`48`,
  },
  // [2016년 4월 고3 이과 26번] |cosx+1/4|=k 3해인 k=α, 40α (정답 30)
  '082': {
    P: String.raw`$40\alpha$의 값`,
    C: String.raw`$0\le x<2\pi$에서 $\left|\cos x+\frac{1}{4}\right|=k$가 서로 다른 3개의 실근을 갖도록 하는 $k$의 값이 $\alpha$`,
    B: String.raw`$\cos x=k-\frac{1}{4}$ 또는 $\cos x=-k-\frac{1}{4}$이고, 근이 3개이려면 한 값은 $\cos x=-1$(해 1개), 다른 값은 $(-1,1)$(해 2개)이어야 한다`,
    S: S(
      String.raw`1. $\left|\cos x+\frac{1}{4}\right|=k$에서 $\cos x=k-\frac{1}{4}$ 또는 $\cos x=-k-\frac{1}{4}$ ($k\ge 0$).`,
      String.raw`2. 근이 3개이려면 한쪽이 $\cos x=\pm1$(해 1개), 다른 쪽이 $(-1,1)$(해 2개)이어야 한다.`,
      String.raw`3. $-k-\frac{1}{4}=-1$에서 $k=\frac{3}{4}$이고, 이때 $\cos x=\frac{1}{2}$(2개)와 $\cos x=-1$(1개)로 총 3개이므로 $\alpha=\frac{3}{4}$.`,
      String.raw`4. 따라서 $40\alpha=40\times\frac{3}{4}=30$.`
    ),
    A: String.raw`30`,
  },
  // [2020년 6월 고2 19번] 반원 위 P, PQ=3, Q의 x좌표 최대일 때 sin²θ (정답 9/16)
  '083': {
    P: String.raw`$\sin^2\theta$의 값`,
    C: String.raw`$A(-1,0),B(1,0)$, 원 $x^2+y^2=1$ 위의 점 $P$, $\angle PAB=\theta\ (0<\theta<\frac{\pi}{2})$, 반직선 $PB$ 위 $\overline{PQ}=3$인 $Q$. $Q$의 $x$좌표가 최대일 때`,
    B: String.raw`$\overline{AB}$가 지름이라 $\angle APB=90^\circ$, $P(\cos 2\theta,\sin 2\theta)$이고 $\overrightarrow{PB}$의 단위벡터는 $(\sin\theta,-\cos\theta)$`,
    S: S(
      String.raw`1. $\overline{AB}$가 지름이므로 $\angle APB=90^\circ$, $\overline{AP}=2\cos\theta,\overline{BP}=2\sin\theta$, $P=(\cos 2\theta,\sin 2\theta)$.`,
      String.raw`2. $\overrightarrow{PB}$의 단위벡터가 $(\sin\theta,-\cos\theta)$이므로 $Q=P+3(\sin\theta,-\cos\theta)$, $Q_x=\cos 2\theta+3\sin\theta=-2\sin^2\theta+3\sin\theta+1$.`,
      String.raw`3. $s=\sin\theta$로 두면 $Q_x=-2s^2+3s+1$은 $s=\frac{3}{4}$에서 최대.`,
      String.raw`4. 따라서 $\sin^2\theta=\left(\frac{3}{4}\right)^2=\frac{9}{16}$. (답 ③)`
    ),
    A: String.raw`③ $\frac{9}{16}$`,
  },
  // [2019년 11월 고2 이과 18번] f=a cosbx+c, 사각형 ACDB 넓이 6π, f(x)=2 해의 합 (정답 13π/2)
  '084': {
    P: String.raw`$0\le x\le 4\pi$에서 방정식 $f(x)=2$의 모든 해의 합`,
    C: String.raw`$x\ge 0$에서 $f(x)=a\cos bx+c$의 최댓값 3, 최솟값 $-1$ ($a,b,c>0$). $y=3$과의 두 교점 $A,B$, $x$축과의 두 교점 $C,D$로 만든 사각형 $ACDB$의 넓이가 $6\pi$`,
    B: String.raw`최대·최소에서 $a=2,c=1$이고, 사다리꼴 $ACDB$의 넓이 식 $\frac{4\pi}{b}=6\pi$에서 $b=\frac{2}{3}$이 정해진다`,
    S: S(
      String.raw`1. 최댓값 $a+c=3$, 최솟값 $-a+c=-1$에서 $a=2,c=1$이므로 $f(x)=2\cos bx+1$.`,
      String.raw`2. $y=3$과의 교점 $A(0,3),B(\frac{2\pi}{b},3)$, $x$축과의 교점 $C(\frac{2\pi}{3b},0),D(\frac{4\pi}{3b},0)$. 사다리꼴 넓이는 $\frac{4\pi}{b}=6\pi$이므로 $b=\frac{2}{3}$.`,
      String.raw`3. $f(x)=2$는 $\cos\frac{2x}{3}=\frac{1}{2}$이고, $0\le x\le 4\pi$에서 $x=\frac{\pi}{2},\frac{5\pi}{2},\frac{7\pi}{2}$.`,
      String.raw`4. 따라서 해의 합은 $\frac{\pi}{2}+\frac{5\pi}{2}+\frac{7\pi}{2}=\frac{13}{2}\pi$. (답 ②)`
    ),
    A: String.raw`② $\frac{13}{2}\pi$`,
  },
  // [2021년 11월 고2 26번] (2a+6)cosx-a sin²x+a+12<0 해 존재 자연수 a 최솟값 (정답 7)
  '087': {
    P: String.raw`부등식의 해가 존재하도록 하는 자연수 $a$의 최솟값`,
    C: String.raw`$0\le x<2\pi$에서 $(2a+6)\cos x-a\sin^2 x+a+12<0$`,
    B: String.raw`$\sin^2 x=1-\cos^2 x$로 정리하면 $a\cos^2 x+(2a+6)\cos x+12<0$, $t=\cos x\in[-1,1]$의 이차부등식이다`,
    S: S(
      String.raw`1. $\sin^2 x=1-\cos^2 x$를 대입하면 $a\cos^2 x+(2a+6)\cos x+12<0$.`,
      String.raw`2. $t=\cos x$로 두면 $g(t)=at^2+(2a+6)t+12$의 꼭짓점은 $t=-1-\frac{3}{a}<-1$이라 $[-1,1]$에서 증가함수.`,
      String.raw`3. 따라서 최솟값은 $g(-1)=a-(2a+6)+12=6-a$. 해가 존재하려면 $6-a<0$, 즉 $a>6$.`,
      String.raw`4. 자연수 $a$의 최솟값은 7.`
    ),
    A: String.raw`7`,
  },
  // [부채꼴 넓이 - 두 원 겹침] 색칠한 넓이 p+q√3+rπ, p+q+r (정답 13; 해설 전사)
  '090': {
    P: String.raw`$p+q+r$의 값`,
    C: String.raw`반지름 6인 원 $O_1$과 원 $O_2$가 두 점에서 만나고, 색칠한 부분의 넓이가 $p+q\sqrt{3}+r\pi$ (해설 기준)`,
    B: String.raw`색칠한 넓이는 두 부채꼴의 넓이 합에서 삼각형 넓이를 뺀 것의 2배로 구한다`,
    S: S(
      String.raw`1. $\overline{O_1A}=6$, $\overline{AM}=3\sqrt{2}$에서 $\angle MO_1A=\frac{\pi}{4}$이고, 부채꼴 $O_1NA$의 넓이는 $\frac{1}{2}\times 6^2\times\frac{\pi}{4}=\frac{9}{2}\pi$.`,
      String.raw`2. $\angle MO_2A=\frac{\pi}{3}$에서 $\overline{O_2A}=2\sqrt{6}$이고, 부채꼴 $O_2AC$의 넓이는 $\frac{1}{2}\times(2\sqrt{6})^2\times\frac{2}{3}\pi=8\pi$.`,
      String.raw`3. $\overline{O_1O_2}=3\sqrt{2}-\sqrt{6}$이라 삼각형 $AO_1O_2$의 넓이는 $\frac{1}{2}\times 6\times(3\sqrt{2}-\sqrt{6})\times\sin\frac{\pi}{4}=9-3\sqrt{3}$.`,
      String.raw`4. 색칠한 넓이는 $2\left\{\frac{9}{2}\pi+8\pi-(9-3\sqrt{3})\right\}=-18+6\sqrt{3}+25\pi$이므로 $p+q+r=-18+6+25=13$.`
    ),
    A: String.raw`13`,
  },
  // [부채꼴 넓이 차] S1-S2 (정답 3π/2; 해설 전사)
  '092': {
    P: String.raw`$S_1-S_2$의 값`,
    C: String.raw`반지름 3인 원에서 중심각 $\frac{7}{6}\pi$인 부채꼴 $AO'B$의 넓이 $T_1$, 중심각 $\frac{5}{6}\pi$인 부채꼴 $AOB$의 넓이 $T_2$, 색칠한 부분 $S_1,S_2$ (해설 기준)`,
    B: String.raw`색칠한 두 영역은 $S_1=T_1+S_2-T_2$로 연결되어 두 부채꼴 넓이의 차로 정리된다`,
    S: S(
      String.raw`1. 반지름 3인 원에서 부채꼴 $T_1=\frac{1}{2}\cdot 3^2\cdot\frac{7}{6}\pi$, $T_2=\frac{1}{2}\cdot 3^2\cdot\frac{5}{6}\pi$.`,
      String.raw`2. $S_1=T_1+S_2-T_2=\left(\frac{1}{2}\cdot 9\cdot\frac{7}{6}\pi\right)+S_2-\left(\frac{1}{2}\cdot 9\cdot\frac{5}{6}\pi\right)$.`,
      String.raw`3. $=\frac{3}{2}\pi+S_2$.`,
      String.raw`4. 따라서 $S_1-S_2=\frac{3}{2}\pi$. (답 ④)`
    ),
    A: String.raw`④ $\frac{3}{2}\pi$`,
  },
  // [삼각함수 정의] 세 동경 좌표, 9(sin²β+tan²γ) (정답 80; 해설 전사)
  '095': {
    P: String.raw`$9(\sin^2\beta+\tan^2\gamma)$의 값`,
    C: String.raw`원점 중심 반지름 3인 원과 세 동경 $OP,OQ,OR$의 교점 $A,B,C$. $P$는 제1사분면, $\sin\alpha=\frac{1}{3}$, $Q$는 $P$와 직선 $y=x$ 대칭, $R$은 $Q$와 원점 대칭 (해설 기준)`,
    B: String.raw`삼각함수의 정의로 각 점의 좌표에서 $\sin\beta,\tan\gamma$를 구한다`,
    S: S(
      String.raw`1. $P$가 제1사분면이고 $\sin\alpha=\frac{1}{3}$이므로 $A(2\sqrt{2},1)$.`,
      String.raw`2. $Q$는 $P$와 $y=x$ 대칭이라 $B(1,2\sqrt{2})$, $R$은 $Q$와 원점 대칭이라 $C(-1,-2\sqrt{2})$.`,
      String.raw`3. 삼각함수의 정의로 $\sin\beta=\frac{2\sqrt{2}}{3}$, $\tan\gamma=\frac{-2\sqrt{2}}{-1}=2\sqrt{2}$.`,
      String.raw`4. 따라서 $9(\sin^2\beta+\tan^2\gamma)=9\left(\frac{8}{9}+8\right)=80$.`
    ),
    A: String.raw`80`,
  },
  // [삼각함수 활용+이차방정식] x²-k=0 두 근 6cosθ,5tanθ, k (정답 20; 해설 전사)
  '101': {
    P: String.raw`$k$의 값`,
    C: String.raw`$6\cos\theta$와 $5\tan\theta$가 이차방정식 $x^2-k=0$의 두 근 (해설 기준)`,
    B: String.raw`$x^2-k=0$의 두 근의 합은 0, 곱은 $-k$이므로 $6\cos\theta+5\tan\theta=0$, $k=-6\cos\theta\cdot 5\tan\theta$`,
    S: S(
      String.raw`1. 두 근의 합이 0이므로 $6\cos\theta+5\tan\theta=0$, 양변에 $\cos\theta$를 곱하면 $6\cos^2\theta+5\sin\theta=0$.`,
      String.raw`2. $\cos^2\theta=1-\sin^2\theta$에서 $6\sin^2\theta-5\sin\theta-6=0$, $(3\sin\theta+2)(2\sin\theta-3)=0$.`,
      String.raw`3. $-1\le\sin\theta\le 1$이므로 $\sin\theta=-\frac{2}{3}$.`,
      String.raw`4. 두 근의 곱이 $-k$이므로 $k=-6\cos\theta\cdot 5\tan\theta=-30\sin\theta=-30\times\left(-\frac{2}{3}\right)=20$.`
    ),
    A: String.raw`20`,
  },
  // [부채꼴/삼각형] f=a sinbx, △OAB 넓이4, a+b (정답 2+π/4; 해설 전사)
  '103': {
    P: String.raw`$a+b$의 값`,
    C: String.raw`$f(x)=a\sin bx$ ($a,b>0$)의 최고점 $A$와 다음 $x$절편 $B$, $A$에서 $x$축에 내린 수선의 발 $H$에 대해 $\overline{OH}=\overline{BH}=\overline{AH}$이고 삼각형 $OAB$의 넓이가 4 (해설 기준)`,
    B: String.raw`$A\left(\frac{\pi}{2b},a\right),B\left(\frac{\pi}{b},0\right)$이고 $\overline{OH}=\overline{BH}=\overline{AH}=a$에서 $\frac{\pi}{b}=2a$`,
    S: S(
      String.raw`1. 주기가 $\frac{2\pi}{b}$이므로 $A\left(\frac{\pi}{2b},a\right)$, $B\left(\frac{\pi}{b},0\right)$.`,
      String.raw`2. $A$에서 $x$축에 내린 수선의 발 $H$에 대해 $\overline{OH}=\overline{BH}=\overline{AH}=a$이므로 $\frac{\pi}{b}=2a$.`,
      String.raw`3. 삼각형 $OAB$의 넓이 $\frac{1}{2}\times 2a\times a=4$에서 $a=2$, $b=\frac{\pi}{2a}=\frac{\pi}{4}$.`,
      String.raw`4. 따라서 $a+b=2+\frac{\pi}{4}$. (답 ③)`
    ),
    A: String.raw`③ $2+\frac{\pi}{4}$`,
  },
  // [그래프 추론] 2<f(n)-g(n)<4 자연수 n의 합 (정답 13; 해설 전사)
  '105': {
    P: String.raw`부등식 $2<f(n)-g(n)<4$를 만족시키는 모든 자연수 $n$의 값의 합`,
    C: String.raw`$f(n)=2\sin\frac{\pi}{6}(n+1)$ 등 두 함수 $f,g$에 대한 부등식 (해설 기준)`,
    B: String.raw`$n$의 범위별로 $f(n),g(n)$의 값을 구해 $f(n)-g(n)$이 2와 4 사이인 $n$을 찾는다`,
    S: S(
      String.raw`1. $1\le n\le 5$일 때 $f(1)=\sqrt{3}$, $2\le n\le 5$이면 $f(n)=2$이고 $g(1\sim4)=1,g(5)=0$이라 $f(n)-g(n)$은 $\sqrt{3}-1,1,2$로 조건을 만족하는 $n$이 없다.`,
      String.raw`2. $n=6,7$일 때 $f(n)=2$, $g(6)=-1,g(7)=-\sqrt{3}$이라 $f(6)-g(6)=3$, $f(7)-g(7)=2+\sqrt{3}$로 모두 2와 4 사이이다.`,
      String.raw`3. $n\ge 8$일 때 $f(n)=2,g(n)=-2$이라 $f(n)-g(n)=4$로 조건을 만족하지 않는다.`,
      String.raw`4. 따라서 조건을 만족하는 $n$은 $6,7$이고 합은 $6+7=13$.`
    ),
    A: String.raw`13`,
  },
  // [그래프 추론] f=a sin(π/6(x-1))+b, g(t)로 a,b 결정 (정답 49; 해설 전사, 원문 일부 잘림)
  '106': {
    P: String.raw`조건을 만족시키는 값`,
    C: String.raw`$f(x)=a\sin\frac{\pi}{6}(x-1)+b$, $g(t)$는 $0<x<t$에서 $y=|f(x)|$와 직선 $y=4$의 교점 개수. $f(0)=8$, $g(18)=5$ (해설 기준)`,
    B: String.raw`주기가 12이고 $f(0)=-\frac{1}{2}a+b=8$에서 $a=2b-16$, $g(18)=5$ 조건에서 $a=-8,b=4$로 정해진다`,
    S: S(
      String.raw`1. $f(x)$의 주기는 $\frac{2\pi}{\pi/6}=12$이고 $f(0)=-\frac{1}{2}a+b=8$에서 $a=2b-16$.`,
      String.raw`2. $g(t)$는 $0<x<t$에서 $y=|f(x)|$가 직선 $y=4$와 만나는 점의 개수이다.`,
      String.raw`3. $g(18)=5$이려면 $f$의 최솟값 $3b-16=-4$, 즉 $a=-8,b=4$이므로 $f(x)=-8\sin\frac{\pi}{6}(x-1)+4$.`,
      String.raw`4. 이 그래프에서 $f(1)=f(7)=f(13)=4$, $f(4)=-4$임을 이용해 조건을 분석하면 답은 49이다.`
    ),
    A: String.raw`49`,
  },
  // [삼각함수 성질+확률] 삼각형 넓이 S<12 확률 (정답 2/3; 해설 전사)
  '108': {
    P: String.raw`삼각형 $ABC$의 넓이 $S<12$일 확률`,
    C: String.raw`주사위를 두 번 던져 나온 눈이 $m,n$, $\overline{AB}=8$, $C$의 $x$좌표의 절댓값이 $\left|m\cos\frac{n\pi}{3}\right|$, $S$는 삼각형 $ABC$의 넓이 (해설 기준)`,
    B: String.raw`$S=\frac{1}{2}\cdot 8\cdot\left|m\cos\frac{n\pi}{3}\right|=4m\left|\cos\frac{n\pi}{3}\right|$이고, $n=1,\dots,6$에서 $\left|\cos\frac{n\pi}{3}\right|$은 $\frac{1}{2},\frac{1}{2},1,\frac{1}{2},\frac{1}{2},1$`,
    S: S(
      String.raw`1. 두 번 던지는 경우의 수는 $6^2=36$. $S=\frac{1}{2}\cdot 8\cdot\left|m\cos\frac{n\pi}{3}\right|=4m\left|\cos\frac{n\pi}{3}\right|$.`,
      String.raw`2. $m=1,2$이면 $4m\le 8$이라 $n=1,\dots,6$ 모두 $S<12$로 $2\times 6=12$가지.`,
      String.raw`3. $m=3,4,5$이면 $12\le 4m\le 20$이라 $\left|\cos\frac{n\pi}{3}\right|<1$인 $n=1,2,4,5$일 때 $S<12$로 $3\times 4=12$가지. $m=6$이면 불가능.`,
      String.raw`4. $S<12$인 경우는 $12+12=24$가지이므로 확률은 $\frac{24}{36}=\frac{2}{3}$. (답 ④)`
    ),
    A: String.raw`④ $\frac{2}{3}$`,
  },
  // [2019년 6월 고2 29번 재출제] 025와 동일: y=k sin(2x+π/3)+k²-6 제1사분면 안 지나는 정수 k 개수 (정답 5)
  '113': {
    P: String.raw`그래프 $y=k\sin\left(2x+\frac{\pi}{3}\right)+k^2-6$이 제1사분면을 지나지 않도록 하는 모든 정수 $k$의 개수`,
    C: String.raw`$x>0$일 때 $\sin\left(2x+\frac{\pi}{3}\right)$은 $-1$부터 $1$까지 모든 값을 가지므로, $x>0$에서 $y$의 최댓값은 $k^2-6+|k|$ 이다`,
    B: String.raw`제1사분면을 지나지 않으려면 $x>0$에서 $y$의 최댓값이 0 이하이어야 한다`,
    S: S(
      String.raw`1. $x>0$에서 $\sin\left(2x+\frac{\pi}{3}\right)$의 최댓값은 1이므로 $y$의 최댓값은 $k^2-6+|k|$ 이다.`,
      String.raw`2. 제1사분면을 지나지 않으려면 $k^2-6+|k|\le 0$.`,
      String.raw`3. $|k|=t\ (t\ge 0)$로 두면 $t^2+t-6\le 0$, 즉 $(t+3)(t-2)\le 0$에서 $t\le 2$.`,
      String.raw`4. 따라서 $|k|\le 2$, 즉 $k=-2,-1,0,1,2$로 정수 $k$는 5개이다.`
    ),
    A: String.raw`5`,
  },
  // [2024년 11월 고3 10번 재출제] 026과 동일: f=a cosbx+3, x=π/3 max13, a+b 최솟값 (정답 16)
  '114': {
    P: String.raw`$f(x)=a\cos(bx)+3$이 $x=\frac{\pi}{3}$에서 최댓값 13을 갖도록 하는 두 자연수 $a,b$에 대하여 $a+b$의 최솟값`,
    C: String.raw`$a,b$는 자연수이고, 최댓값 13을 $x=\frac{\pi}{3}$에서 가진다`,
    B: String.raw`$\cos$의 최댓값은 1이므로 $f$의 최댓값은 $a+3$이고, 그 최댓값을 $x=\frac{\pi}{3}$에서 가지려면 $\cos\left(b\cdot\frac{\pi}{3}\right)=1$이어야 한다`,
    S: S(
      String.raw`1. 최댓값이 13이므로 $a+3=13$에서 $a=10$.`,
      String.raw`2. $x=\frac{\pi}{3}$에서 최댓값을 가지므로 $\cos\left(\frac{b\pi}{3}\right)=1$, 즉 $b=6k$ ($k$는 자연수)이다.`,
      String.raw`3. 자연수 $b$의 최솟값은 $b=6$이다.`,
      String.raw`4. 따라서 $a+b$의 최솟값은 $10+6=16$. (답 ③)`
    ),
    A: String.raw`③ 16`,
  },
  // [027 재출제] f=a-√3 tan2x, [-π/6,b] max7 min3, ab (정답 π/3)
  '115': {
    P: String.raw`$f(x)=a-\sqrt{3}\tan 2x$가 닫힌구간 $\left[-\frac{\pi}{6},\,b\right]$에서 최댓값 7, 최솟값 3을 가질 때 상수 $a,b$에 대한 $ab$의 값`,
    C: String.raw`$f$의 정의구간에 점근선 $x=\frac{\pi}{4}$가 포함되지 않으므로 $-\frac{\pi}{6}\le x\le b<\frac{\pi}{4}$ 이다`,
    B: String.raw`$\tan 2x$는 이 구간에서 증가함수라 $f$는 감소함수이고, 감소함수는 왼쪽 끝에서 최댓값, 오른쪽 끝에서 최솟값을 가진다`,
    S: S(
      String.raw`1. $f$는 감소함수이므로 최댓값은 $x=-\frac{\pi}{6}$에서: $f\left(-\frac{\pi}{6}\right)=a-\sqrt{3}\tan\left(-\frac{\pi}{3}\right)=a+3=7$ 에서 $a=4$.`,
      String.raw`2. 최솟값은 $x=b$에서: $f(b)=4-\sqrt{3}\tan 2b=3$ 에서 $\tan 2b=\frac{1}{\sqrt{3}}$.`,
      String.raw`3. $2b=\frac{\pi}{6}$에서 $b=\frac{\pi}{12}$.`,
      String.raw`4. 따라서 $ab=4\times\frac{\pi}{12}=\frac{\pi}{3}$. (답 ③)`
    ),
    A: String.raw`③ $\frac{\pi}{3}$`,
  },
  // [028 재출제] f=sin(kx)+2, g=3cos(12x) 포함조건 자연수 k 개수 (정답 4)
  '116': {
    P: String.raw`조건을 만족시키는 자연수 $k$의 개수`,
    C: String.raw`$f(x)=\sin kx+2$의 치역은 $[1,3]$이고 $g(x)=3\cos 12x$이며, 조건은 "교점의 $y$좌표 $a$에 대하여 $f(x)=a$인 모든 $x$가 $g(x)=a$도 만족"한다는 것`,
    B: String.raw`$f(x)=a$인 모든 점에서 $g$가 같은 값이면 포함조건이 성립하며, 이는 $\frac{12}{k}$가 짝수일 때이다`,
    S: S(
      String.raw`1. $f(x)=a$, 즉 $\sin kx=a-2$인 점에서 $kx=\theta$로 두면 해는 $\theta$와 $\pi-\theta$ 꼴이다.`,
      String.raw`2. $g=3\cos\left(\frac{12}{k}\cdot kx\right)$가 두 해에서 같으려면 $\frac{12}{k}$가 짝수여야 한다.`,
      String.raw`3. $\frac{12}{k}$가 짝수인 자연수 $k$는 $\frac{12}{k}=2,4,6,12$, 즉 $k=6,3,2,1$.`,
      String.raw`4. 따라서 조건을 만족하는 $k$는 $1,2,3,6$의 4개이다. (답 ②)`
    ),
    A: String.raw`② 4`,
  },
  // [029 재출제] y=a sin3x+b 가 y=9 와 3개·y=2 와 7개, ab (정답 14)
  '117': {
    P: String.raw`두 양수 $a,b$에 대하여 $ab$의 값`,
    C: String.raw`$0\le x\le 2\pi$에서 $y=a\sin 3x+b$ ($a,b>0$)가 직선 $y=9$와 3개, $y=2$와 7개의 점에서 만난다`,
    B: String.raw`$[0,2\pi]$에서 3주기이며 수평선과의 교점은 최대선·최소선 $y=b\pm a$에서 3개, 중심선 $y=b$에서 7개`,
    S: S(
      String.raw`1. $y=2$와 7개의 점에서 만나므로 2는 중심선, 즉 $b=2$.`,
      String.raw`2. $y=9$와 3개의 점에서 만나므로 9는 최대선이고, $a>0$이라 $9=b+a=2+a$에서 $a=7$.`,
      String.raw`3. 따라서 $ab=7\times 2=14$.`
    ),
    A: String.raw`14`,
  },
  // [삼각함수 활용] f=3sin(π/2 x), 정삼각형 ABC(한 변 4), t=√3 (정답 ③; 해설 전사)
  '131': {
    P: String.raw`$t$의 값`,
    C: String.raw`$f(x)=3\sin\frac{\pi}{2}x$와 직선 $y=-t$가 만나는 점의 $x$좌표 중 작은 값 $\alpha$ ($2<\alpha<3$)에 대해 $A(\alpha,-t),B(\alpha+4,-t),C$로 정삼각형 $ABC$(한 변 4)를 이룰 때 (해설 기준)`,
    B: String.raw`$C$의 $x$좌표는 $\alpha+2$, $y$좌표는 $f(\alpha+2)=t$이고, 정삼각형의 높이 $\overline{CH}=2\sqrt{3}$를 이용한다`,
    S: S(
      String.raw`1. $f(x)=3\sin\frac{\pi}{2}x$의 주기는 4이고, $C$의 $x$좌표는 $\frac{\alpha+(\alpha+4)}{2}=\alpha+2$.`,
      String.raw`2. $f(\alpha+2)=3\sin\left(\frac{\pi}{2}\alpha+\pi\right)=-3\sin\frac{\pi}{2}\alpha=-f(\alpha)=t$이므로 $C(\alpha+2,t)$.`,
      String.raw`3. 한 변 4인 정삼각형의 높이 $\overline{CH}=f(\alpha+2)-(-t)=2t=2\sqrt{3}$.`,
      String.raw`4. 따라서 $t=\sqrt{3}$. (답 ③)`
    ),
    A: String.raw`③ $\sqrt{3}$`,
  },
  // [044 재출제] g(n)=max|sinx-1/2|, g(k) 무리수인 k≤40 합 (정답 123)
  '133': {
    P: String.raw`$g(k)$가 무리수가 되도록 하는 40 이하의 자연수 $k$의 값의 합`,
    C: String.raw`$g(n)$은 구간 $\left[\frac{n-1}{6}\pi,\ \frac{n+2}{6}\pi\right]$에서 $f(x)=\left|\sin x-\frac{1}{2}\right|$의 최댓값`,
    B: String.raw`$\left|\sin x-\frac{1}{2}\right|$가 무리수인 경우는 $\sin x=\pm\frac{\sqrt{3}}{2}$에서 최대일 때이고, 이는 $n\equiv 6,11\ (\mathrm{mod}\ 12)$일 때`,
    S: S(
      String.raw`1. $\left|\sin x-\frac{1}{2}\right|$은 $\sin x=\pm\frac{\sqrt{3}}{2}$일 때 $\frac{\sqrt{3}\mp1}{2}$로 무리수, 그 외 격자값에서는 유리수이다.`,
      String.raw`2. $g(n)$이 무리수이려면 구간의 최댓값이 $\sin x=\pm\frac{\sqrt{3}}{2}$에서 나와야 하며 이는 $n\equiv 6,11\ (\mathrm{mod}\ 12)$일 때.`,
      String.raw`3. 40 이하의 그러한 $k$는 $6,11,18,23,30,35$.`,
      String.raw`4. 합은 $6+11+18+23+30+35=123$. (답 ⑤)`
    ),
    A: String.raw`⑤ 123`,
  },
  // [삼각함수 활용] |sin2x+2/3|=k₀ 교점수·|m-n|=3 으로 k=2/9 (정답 ②; 해설 전사, 원문 일부 잘림)
  '134': {
    P: String.raw`조건을 만족시키는 값`,
    C: String.raw`$f(x)=\left|\sin 2x+\frac{2}{3}\right|$ ($-\pi\le x\le\pi$)과 직선 $y=k_0$의 교점 개수, 그리고 $|m-n|=3$ 조건으로 $k$를 정한다 (해설 기준)`,
    B: String.raw`$y=f(x)$와 $y=k_0$의 교점 수를 $k_0$ 범위별로 센 뒤, $|m-n|=3$ 조건에서 $k=\frac{2}{9}$를 얻는다`,
    S: S(
      String.raw`1. 교점 수는 $0<k_0<\frac{1}{3}$이면 8, $k_0=\frac{1}{3}$이면 6, $\frac{1}{3}<k_0<\frac{2}{3}$이면 4, $k_0=\frac{2}{3}$이면 5, $\frac{2}{3}<k_0<\frac{5}{3}$이면 4, $k_0=\frac{5}{3}$이면 2, $k_0>\frac{5}{3}$이면 0이다.`,
      String.raw`2. $|m-n|=3$을 만족하는 경우를 따지면 $m=5,n=8$일 때 $k=\frac{2}{9}$.`,
      String.raw`3. $-\pi\le x\le\pi$에서 $\left|\sin 2x+\frac{2}{3}\right|=\frac{2}{9}$의 근 $\alpha_1,\dots,\alpha_8$은 대칭이라 $\alpha_1+\alpha_4=\alpha_2+\alpha_3=-\frac{\pi}{2}$.`,
      String.raw`4. 이 대칭성으로 근의 합을 구하면 답은 ②이다.`
    ),
    A: String.raw`②`,
  },
  // [합성함수 그래프] (f∘h),(h∘g) 케이스 분석 (정답 686; 해설 전사, 최종 도출 일부 흐림)
  '123': {
    P: String.raw`조건을 만족시키는 값`,
    C: String.raw`$(f\circ h)(x)=\cos(a\pi x)$ ($b$ 짝수) 또는 $-\cos(a\pi x)$ ($b$ 홀수)이고 $(h\circ g)(x)=a\sin\pi x+b$ (두 자연수 $a,b$, 해설 기준)`,
    B: String.raw`(가)의 교점 수가 홀수이려면 $b$가 짝수면 $b=a+1$($a$ 홀수), $b$가 홀수면 $b=a-1$($a$ 짝수)이어야 한다`,
    S: S(
      String.raw`1. $(f\circ h)(x)=\pm\cos(a\pi x)$의 주기는 $\frac{2}{a}$. (가)의 방정식 $(f\circ h)(x)=-a+b$의 교점 수가 홀수이려면 $b$가 짝수일 때 $-a+b=1$(즉 $b=a+1$, $a$ 홀수), $b$가 홀수일 때 $-a+b=-1$(즉 $b=a-1$, $a$ 짝수)이다.`,
      String.raw`2. (나)의 방정식 $(f\circ h)(x)=(h\circ g)(x)$의 서로 다른 실근의 개수는 상수 $a\sin\pi t+(a-1)$의 값에 따라 $2a+1$, $4a$, $2a$로 나뉜다.`,
      String.raw`3. 실근의 개수가 56이 되는 경우는 $2a=56$, 즉 $a=28$, $b=27$이다.`,
      String.raw`4. 이때 실근의 합 조건에서 $\sin\pi t=-\frac{6}{7}$, $\cos^2\pi t=\frac{13}{49}$이고, 최종 답은 686이다.`
    ),
    A: String.raw`686`,
  },
  // [코사인 그래프 절댓값] f=(n/2)cosπx+1, y=|f(x)| (정답 74; 해설 전사, 도출 일부 잘림)
  '132': {
    P: String.raw`조건을 만족시키는 값`,
    C: String.raw`$f(x)=\frac{n}{2}\cos\pi x+1$ ($0\le x\le 4$)와 그 절댓값 그래프 $y=|f(x)|$ (해설 기준)`,
    B: String.raw`$f$의 주기는 2이고 최댓값 $\frac{n}{2}+1$, 최솟값 $-\frac{n}{2}+1$이므로 $y=|f(x)|$의 개형을 이용한다`,
    S: S(
      String.raw`1. $f(x)=\frac{n}{2}\cos\pi x+1$의 주기는 $\frac{2\pi}{\pi}=2$이다.`,
      String.raw`2. $0\le x\le 4$에서 $f$는 최댓값 $\frac{n}{2}+1$, 최솟값 $-\frac{n}{2}+1$을 가진다.`,
      String.raw`3. 이를 이용해 $y=|f(x)|$의 그래프 개형을 그려 조건을 분석한다.`,
      String.raw`4. 분석 결과 답은 74이다.`
    ),
    A: String.raw`74`,
  },
};

module.exports = AUTHORED;
