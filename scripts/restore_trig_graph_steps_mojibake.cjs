/*
 * 삼각함수그래프 2·3단계(trig_graph_step2/step3) 모지바케 힌트 복원기 — 수동 저작판
 *
 * trig_graph(=4단계)와 동일 구조: 최상위 P/C/B/S/A 의 S(풀이) 한국어만 손상.
 * Claude 비전 판독 + numpy/sympy 검산한 P/C/B/S/A 를 오버레이 x-upsert.
 * 이미지: step2 = math_crops/trig_graph_step2/{pid}.webp (실파일),
 *         step3 = (최상위는 placeholder, 일부는 손상힌트 LaTeX 로 복원).
 *
 * 사용: node scripts/restore_trig_graph_steps_mojibake.cjs <step2|step3> [--dry-run] [pid ...]
 */
require('dotenv').config();
const { buildNarration } = require('./generate_su1_tts.cjs');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const S = (...lines) => lines.join('\n');

// ============ trig_graph_step2 (삼각함수그래프2단계) ============
const AUTHORED_STEP2 = {
  // [2022년 9월 고2 18번 변형] f=|sin4x+2/3|, |m-n|=7 => k=2/9, f=k 근의 합 (정답 2π)
  '035': {
    P: String.raw`$x$에 대한 방정식 $f(x)=k$의 모든 실근의 합`,
    C: String.raw`$\{x\mid -\pi\le x\le\pi\}$에서 $f(x)=\left|\sin 4x+\frac{2}{3}\right|$. $y=f(x)$가 $y=3k,y=k$와 만나는 점의 수 $m,n$이 $|m-n|=7$`,
    B: String.raw`$y=c$와의 교점 수는 $0<c<\frac{1}{3}$이면 16, $c=\frac{2}{3}$이면 9 등이고, $|m-n|=7$이려면 $k=\frac{2}{9}$, $3k=\frac{2}{3}$이다`,
    S: S(
      String.raw`1. $y=f(x)$와 $y=c$의 교점 수는 $0<c<\frac{1}{3}$이면 16, $c=\frac{1}{3}$이면 12, $\frac{1}{3}<c<\frac{2}{3}$이면 8, $c=\frac{2}{3}$이면 9, $c=\frac{5}{3}$이면 4이다.`,
      String.raw`2. $|m-n|=7$이려면 $k=\frac{2}{9}$(교점 16)와 $3k=\frac{2}{3}$(교점 9)이어야 한다.`,
      String.raw`3. $f(x)=\frac{2}{9}$는 $\left|\sin 4x+\frac{2}{3}\right|=\frac{2}{9}$, 즉 $\sin 4x=-\frac{4}{9}$ 또는 $-\frac{8}{9}$로 $[-\pi,\pi]$에 근이 16개이다.`,
      String.raw`4. 대칭성으로 16개 근의 합을 구하면 $2\pi$. (답 ②)`
    ),
    A: String.raw`② $2\pi$`,
  },
  // [삼각함수 각변환] 직선 2x-4y+1=0, tanθ=1/2, 3cos(π-θ)+3sin(π/2-θ)-2tan(-θ) (정답 1)
  '041': {
    P: String.raw`$3\cos(\pi-\theta)+3\sin\left(\frac{\pi}{2}-\theta\right)-2\tan(-\theta)$의 값`,
    C: String.raw`직선 $2x-4y+1=0$이 $x$축의 양의 방향과 이루는 각이 $\theta$`,
    B: String.raw`직선의 기울기가 $\tan\theta$이고, $\cos(\pi-\theta)=-\cos\theta$, $\sin\left(\frac{\pi}{2}-\theta\right)=\cos\theta$, $\tan(-\theta)=-\tan\theta$`,
    S: S(
      String.raw`1. 직선 $2x-4y+1=0$의 기울기는 $\frac{1}{2}$이므로 $\tan\theta=\frac{1}{2}$.`,
      String.raw`2. $\cos(\pi-\theta)=-\cos\theta$, $\sin\left(\frac{\pi}{2}-\theta\right)=\cos\theta$, $\tan(-\theta)=-\tan\theta$.`,
      String.raw`3. 식은 $-3\cos\theta+3\cos\theta+2\tan\theta=2\tan\theta$.`,
      String.raw`4. 따라서 $2\tan\theta=2\times\frac{1}{2}=1$.`
    ),
    A: String.raw`1`,
  },
  // [삼각함수 여각] cos²3°+cos²6°+...+cos²87°, a+b (정답 31/2)
  '043': {
    P: String.raw`$a+b$의 값`,
    C: String.raw`$\cos^2 3^\circ+\cos^2 6^\circ+\cdots+\cos^2 87^\circ$의 값을 구하는 과정에서 (가)$=a$, (나)$=b$`,
    B: String.raw`$\cos(90^\circ-\alpha)=\sin\alpha$이므로 $\cos^2(90^\circ-\alpha)+\cos^2\alpha=\sin^2\alpha+\cos^2\alpha=1$, 즉 (가)$=1$`,
    S: S(
      String.raw`1. $\cos(90^\circ-\alpha)=\sin\alpha$이므로 $\cos^2(90^\circ-\alpha)+\cos^2\alpha=1$, 즉 $a=1$.`,
      String.raw`2. $3^\circ,6^\circ,\dots,87^\circ$는 29개 항이고, $\cos^2\alpha+\cos^2(90^\circ-\alpha)=1$로 짝지으면 $(3^\circ,87^\circ),\dots,(42^\circ,48^\circ)$의 14쌍이 각각 1이다.`,
      String.raw`3. 가운데 $\cos^2 45^\circ=\frac{1}{2}$이 남으므로 합은 $14+\frac{1}{2}=\frac{29}{2}$, 즉 $b=\frac{29}{2}$.`,
      String.raw`4. 따라서 $a+b=1+\frac{29}{2}=\frac{31}{2}$. (답 ②)`
    ),
    A: String.raw`② $\frac{31}{2}$`,
  },
  // [삼각함수 성질] 삼각형 내각 보기 ㄱㄴㄷㄹ (정답 ㄱ,ㄷ)
  '046': {
    P: String.raw`보기 ㄱ, ㄴ, ㄷ, ㄹ 중 옳은 것`,
    C: String.raw`삼각형 $ABC$의 세 내각 $A,B,C$에 대하여 $A+B+C=\pi$`,
    B: String.raw`$A+B=\pi-C$, $\frac{A+B}{2}=\frac{\pi}{2}-\frac{C}{2}$ 등 보각·여각 관계를 이용한다`,
    S: S(
      String.raw`1. (ㄱ) $\sin(A+B)=\sin(\pi-C)=\sin C$로 참.`,
      String.raw`2. (ㄴ) $\sin(A+B+C)=\sin\pi=0\ne-1$로 거짓.`,
      String.raw`3. (ㄷ) $\sin\frac{A+B}{2}=\sin\left(\frac{\pi}{2}-\frac{C}{2}\right)=\cos\frac{C}{2}$로 참.`,
      String.raw`4. (ㄹ) $\tan\frac{A+C}{2}=\tan\left(\frac{\pi}{2}-\frac{B}{2}\right)=\frac{1}{\tan\frac{B}{2}}$이라 $\tan\frac{B}{2}\tan\frac{A+C}{2}=1\ne-1$로 거짓. 따라서 옳은 것은 ㄱ, ㄷ. (답 ①)`
    ),
    A: String.raw`① ㄱ, ㄷ`,
  },
  // [2021년 9월 고2 19번 변형] AB=13 반원, PA=PC=PD, 12sinθ=5cosθ, △ADC 넓이 (정답 288/13)
  '047': {
    P: String.raw`삼각형 $ADC$의 넓이`,
    C: String.raw`지름 $\overline{AB}=13$인 반원의 호 위 점 $P$, $\overline{PB}$ 연장선 위 $\overline{PA}=\overline{PC}$인 $C$, $\overline{PO}$ 연장선 위 $\overline{PA}=\overline{PD}$인 $D$, $\angle PAB=\theta$, $12\sin\theta=5\cos\theta$`,
    B: String.raw`$\angle APB=90^\circ$이고 $\tan\theta=\frac{5}{12}$에서 $\sin\theta=\frac{5}{13},\cos\theta=\frac{12}{13}$, $\overline{AP}=12,\overline{BP}=5,\overline{PO}=\frac{13}{2}$`,
    S: S(
      String.raw`1. 지름에 대한 원주각이라 $\angle APB=90^\circ$, $\tan\theta=\frac{5}{12}$에서 $\overline{AP}=13\cos\theta=12$, $\overline{BP}=13\sin\theta=5$, $\overline{PO}=\frac{13}{2}$.`,
      String.raw`2. 좌표로 $A\left(-\frac{13}{2},0\right),O(0,0),B\left(\frac{13}{2},0\right)$, $P\left(\frac{119}{26},\frac{120}{26}\right)$.`,
      String.raw`3. $C$는 $\overrightarrow{PB}$ 방향으로 $\overline{PC}=12$, $D$는 $\overrightarrow{PO}$ 방향으로 $\overline{PD}=12$인 점이다.`,
      String.raw`4. 삼각형 $ADC$의 넓이를 좌표로 계산하면 $\frac{288}{13}$이다. (답 ②)`
    ),
    A: String.raw`② $\frac{288}{13}$`,
  },
  // [주기] y=|tan(ax)| 주기 = y=3sin4x 주기, a (정답 2)
  '049': {
    P: String.raw`양수 $a$의 값`,
    C: String.raw`$y=|\tan ax|$의 주기와 $y=3\sin 4x$의 주기가 같다`,
    B: String.raw`$|\tan ax|$의 주기는 $\frac{\pi}{a}$, $3\sin 4x$의 주기는 $\frac{2\pi}{4}=\frac{\pi}{2}$`,
    S: S(
      String.raw`1. $\tan ax$의 주기가 $\frac{\pi}{a}$이고 절댓값을 취해도 주기는 $\frac{\pi}{a}$로 같다.`,
      String.raw`2. $3\sin 4x$의 주기는 $\frac{2\pi}{4}=\frac{\pi}{2}$.`,
      String.raw`3. 두 주기가 같으므로 $\frac{\pi}{a}=\frac{\pi}{2}$.`,
      String.raw`4. 따라서 $a=2$.`
    ),
    A: String.raw`2`,
  },
  // [각변환 분수식] y=[2cos(3π/2-x)-a+3]/[sin(π+x)+2] max1, a²+m² (정답 5)
  '054': {
    P: String.raw`$a^2+m^2$의 값`,
    C: String.raw`$y=\dfrac{2\cos\left(\frac{3}{2}\pi-x\right)-a+3}{\sin(\pi+x)+2}$의 최댓값이 1, 최솟값이 $m$ ($a>0$)`,
    B: String.raw`$\cos\left(\frac{3}{2}\pi-x\right)=-\sin x$, $\sin(\pi+x)=-\sin x$로 정리하면 $y=2-\dfrac{1+a}{2-\sin x}$`,
    S: S(
      String.raw`1. $\cos\left(\frac{3}{2}\pi-x\right)=-\sin x$, $\sin(\pi+x)=-\sin x$이므로 $y=\dfrac{-2\sin x-a+3}{2-\sin x}=2-\dfrac{1+a}{2-\sin x}$.`,
      String.raw`2. $s=\sin x\in[-1,1]$이라 $2-s\in[1,3]$. 최댓값은 $2-s=3$일 때 $2-\frac{1+a}{3}=1$에서 $a=2$.`,
      String.raw`3. 최솟값은 $2-s=1$일 때 $m=2-(1+a)=1-a=-1$.`,
      String.raw`4. 따라서 $a^2+m^2=4+1=5$.`
    ),
    A: String.raw`5`,
  },
  // [이차식 최댓값] y=cos²x+2a sinx-1 max3, A² (정답 16)
  '057': {
    P: String.raw`$A^2$의 값`,
    C: String.raw`$y=\cos^2 x+2a\sin x-1$ ($0\le x\le 2\pi$)의 최댓값이 3일 때 모든 실수 $a$의 값의 곱이 $A$`,
    B: String.raw`$\cos^2 x=1-\sin^2 x$로 정리하면 $y=-(\sin x-a)^2+a^2$, $\sin x=s\in[-1,1]$의 이차식`,
    S: S(
      String.raw`1. $y=1-\sin^2 x+2a\sin x-1=-(\sin x-a)^2+a^2$, $s=\sin x\in[-1,1]$.`,
      String.raw`2. $a>1$이면 최댓값은 $s=1$에서 $2a-1=3$, 즉 $a=2$. $a<-1$이면 $s=-1$에서 $-1-2a=3$, 즉 $a=-2$. ($|a|\le1$이면 $a^2=3$로 모순)`,
      String.raw`3. 따라서 $a=2$ 또는 $a=-2$이고 곱 $A=-4$.`,
      String.raw`4. $A^2=16$.`
    ),
    A: String.raw`16`,
  },
  // [각변환 방정식] sin(π/2-θ)+sin(π+θ)=sin(3π/2-θ)+sin(2π+θ), θ합 (정답 3π/2)
  '064': {
    P: String.raw`방정식을 만족시키는 모든 $\theta$의 값의 합`,
    C: String.raw`$0\le\theta\le 2\pi$에서 $\sin\left(\frac{\pi}{2}-\theta\right)+\sin(\pi+\theta)=\sin\left(\frac{3}{2}\pi-\theta\right)+\sin(2\pi+\theta)$`,
    B: String.raw`각 변환으로 좌변 $=\cos\theta-\sin\theta$, 우변 $=-\cos\theta+\sin\theta$이라 $\tan\theta=1$`,
    S: S(
      String.raw`1. $\sin\left(\frac{\pi}{2}-\theta\right)=\cos\theta$, $\sin(\pi+\theta)=-\sin\theta$이라 좌변 $=\cos\theta-\sin\theta$.`,
      String.raw`2. $\sin\left(\frac{3}{2}\pi-\theta\right)=-\cos\theta$, $\sin(2\pi+\theta)=\sin\theta$이라 우변 $=-\cos\theta+\sin\theta$.`,
      String.raw`3. $\cos\theta-\sin\theta=-\cos\theta+\sin\theta$에서 $\tan\theta=1$, 즉 $\theta=\frac{\pi}{4},\frac{5\pi}{4}$.`,
      String.raw`4. 따라서 합은 $\frac{\pi}{4}+\frac{5\pi}{4}=\frac{3}{2}\pi$. (답 ③)`
    ),
    A: String.raw`③ $\frac{3}{2}\pi$`,
  },
  // [cos 두 근] cosx=-√5/4 두 근 α,β, sin(α+β) (정답 0)
  '075': {
    P: String.raw`$\sin(\alpha+\beta)$의 값`,
    C: String.raw`$0\le x\le 2\pi$에서 $\cos x=-\frac{\sqrt{5}}{4}$의 두 근이 $\alpha,\beta$`,
    B: String.raw`$\cos x=c$의 두 근은 $x=\pi$에 대하여 대칭이므로 $\alpha+\beta=2\pi$`,
    S: S(
      String.raw`1. $\cos x=-\frac{\sqrt{5}}{4}$의 두 근은 $x=\pi$에 대하여 대칭이라 $\alpha+\beta=2\pi$.`,
      String.raw`2. 따라서 $\sin(\alpha+\beta)=\sin 2\pi=0$. (답 ③)`
    ),
    A: String.raw`③ 0`,
  },
  // [방정식 근의 개수] sin2x=cosx 실근 개수 (정답 4)
  '076': {
    P: String.raw`방정식의 서로 다른 실근의 개수`,
    C: String.raw`$0\le x\le 2\pi$에서 $\sin 2x=\cos x$`,
    B: String.raw`$\sin 2x=2\sin x\cos x$이므로 $\cos x(2\sin x-1)=0$`,
    S: S(
      String.raw`1. $2\sin x\cos x=\cos x$에서 $\cos x(2\sin x-1)=0$, 즉 $\cos x=0$ 또는 $\sin x=\frac{1}{2}$.`,
      String.raw`2. $\cos x=0$이면 $x=\frac{\pi}{2},\frac{3\pi}{2}$, $\sin x=\frac{1}{2}$이면 $x=\frac{\pi}{6},\frac{5\pi}{6}$.`,
      String.raw`3. 따라서 서로 다른 실근은 4개이다.`
    ),
    A: String.raw`4`,
  },
  // [이차방정식 중근] t²-(4sinθ)t-4sinθ+3=0 중근, θ합 (정답 π)
  '077': {
    P: String.raw`모든 실수 $\theta$의 값의 합`,
    C: String.raw`$0\le\theta<2\pi$에서 이차방정식 $t^2-(4\sin\theta)t-4\sin\theta+3=0$이 중근을 가진다`,
    B: String.raw`중근을 가지려면 판별식이 0, 즉 $(4\sin\theta)^2-4(-4\sin\theta+3)=0$`,
    S: S(
      String.raw`1. 중근 조건은 판별식 $D=16\sin^2\theta+16\sin\theta-12=0$.`,
      String.raw`2. 정리하면 $4\sin^2\theta+4\sin\theta-3=0$, $(2\sin\theta-1)(2\sin\theta+3)=0$.`,
      String.raw`3. $-1\le\sin\theta\le1$이므로 $\sin\theta=\frac{1}{2}$, 즉 $\theta=\frac{\pi}{6},\frac{5\pi}{6}$.`,
      String.raw`4. 따라서 합은 $\frac{\pi}{6}+\frac{5\pi}{6}=\pi$. (답 ①)`
    ),
    A: String.raw`① $\pi$`,
  },
  // [2019년 11월 고2 이과 16번 변형] sin(πx/3)=k 슬라이딩 윈도우, b/a+k² (정답 7/2)
  '078': {
    P: String.raw`$\dfrac{b}{a}+k^2$의 값`,
    C: String.raw`$0\le t\le\frac{9}{2}$, $t\le x\le t+\frac{3}{2}$에서 $\sin\frac{\pi}{3}x=k$의 해의 개수 $f(t)$가 $1\,(0\le t<a$ 또는 $a<t\le b)$, $2\,(t=a)$, $0\,(b<t\le\frac{9}{2})$ ($0<a<b<5$)`,
    B: String.raw`$\sin\frac{\pi}{3}x$는 주기 6, $[0,6]$의 두 근은 $\frac{3}{2}$에 대칭이고, 폭 $\frac{3}{2}$ 창에 둘 다 드는 $t$가 한 점뿐이려면 두 근의 간격이 $\frac{3}{2}$이어야 한다`,
    S: S(
      String.raw`1. $\sin\frac{\pi}{3}x=k\ (k\in(0,1))$는 $[0,6]$에서 $x=\frac{3}{2}\pm d$인 두 근(주기 6, $\frac{3}{2}$에 대칭)을 갖는다.`,
      String.raw`2. 폭 $\frac{3}{2}$인 창에 두 근이 동시에 드는 $t$가 한 점($t=a$)뿐이려면 두 근의 간격 $2d=\frac{3}{2}$, 즉 $d=\frac{3}{4}$.`,
      String.raw`3. 두 근은 $x=\frac{3}{4},\frac{9}{4}$이라 $a=\frac{3}{4}$, $b=\frac{9}{4}$, $k=\sin\left(\frac{\pi}{3}\cdot\frac{3}{4}\right)=\sin\frac{\pi}{4}=\frac{\sqrt{2}}{2}$.`,
      String.raw`4. 따라서 $\frac{b}{a}+k^2=3+\frac{1}{2}=\frac{7}{2}$. (답 ④)`
    ),
    A: String.raw`④ $\frac{7}{2}$`,
  },
  // [2023년 4월 고3 11번 변형] 4sin²x-2cosx=k 3근, kα (정답 10π/3)
  '079': {
    P: String.raw`$k\alpha$의 값`,
    C: String.raw`$0\le x\le 2\pi$에서 $4\sin^2 x-2\cos x=k$의 서로 다른 실근이 3개, 가장 큰 근이 $\alpha$`,
    B: String.raw`$\cos x=c$로 두면 $-4c^2-2c+4=k$이고, 근이 3개이려면 한 $c$는 $-1$(해 1개), 다른 $c$는 $(-1,1)$(해 2개)이어야 한다`,
    S: S(
      String.raw`1. $4\sin^2 x-2\cos x=-4\cos^2 x-2\cos x+4$이므로 $c=\cos x$로 두면 $-4c^2-2c+4=k$.`,
      String.raw`2. 근이 3개이려면 $\cos x=-1$(해 1개)과 $\cos x\in(-1,1)$(해 2개)이어야 하므로 $c=-1$에서 $k=2$.`,
      String.raw`3. $k=2$이면 $\cos x=-1$ 또는 $\cos x=\frac{1}{2}$, 즉 $x=\pi,\frac{\pi}{3},\frac{5\pi}{3}$.`,
      String.raw`4. 가장 큰 근 $\alpha=\frac{5\pi}{3}$이므로 $k\alpha=2\times\frac{5\pi}{3}=\frac{10\pi}{3}$. (답 ④)`
    ),
    A: String.raw`④ $\frac{10\pi}{3}$`,
  },
  // [부등식] sinx<cosx 의 해가 될 수 없는 것 (정답 9π/8)
  '083': {
    P: String.raw`부등식 $\sin x<\cos x$의 해가 될 수 없는 것`,
    C: String.raw`$0<x<2\pi$`,
    B: String.raw`$\cos x-\sin x=\sqrt{2}\cos\left(x+\frac{\pi}{4}\right)>0$이라 해는 $\left(0,\frac{\pi}{4}\right)\cup\left(\frac{5\pi}{4},2\pi\right)$`,
    S: S(
      String.raw`1. $\sin x<\cos x$는 $\cos x-\sin x>0$, 즉 $\sqrt{2}\cos\left(x+\frac{\pi}{4}\right)>0$.`,
      String.raw`2. $\cos\left(x+\frac{\pi}{4}\right)>0$에서 $0<x<2\pi$의 해는 $\left(0,\frac{\pi}{4}\right)\cup\left(\frac{5\pi}{4},2\pi\right)$.`,
      String.raw`3. $\frac{9}{8}\pi$는 $\frac{\pi}{4}<\frac{9}{8}\pi<\frac{5}{4}\pi$이라 해집합에 들지 않는다(나머지 보기는 모두 해).`,
      String.raw`4. 따라서 해가 될 수 없는 것은 $\frac{9}{8}\pi$. (답 ③)`
    ),
    A: String.raw`③ $\frac{9}{8}\pi$`,
  },
  // [2020년 4월 고3 이과 9번] sin²x=cos²x+cosx & sinx>cosx, x합 (정답 4π/3)
  '084': {
    P: String.raw`방정식과 부등식을 동시에 만족시키는 모든 $x$의 값의 합`,
    C: String.raw`$0<x\le 2\pi$에서 $\sin^2 x=\cos^2 x+\cos x$이고 $\sin x>\cos x$`,
    B: String.raw`$\sin^2 x=1-\cos^2 x$를 대입하면 $2\cos^2 x+\cos x-1=0$, $(2\cos x-1)(\cos x+1)=0$`,
    S: S(
      String.raw`1. $1-\cos^2 x=\cos^2 x+\cos x$에서 $2\cos^2 x+\cos x-1=0$, $(2\cos x-1)(\cos x+1)=0$.`,
      String.raw`2. $\cos x=\frac{1}{2}$이면 $x=\frac{\pi}{3},\frac{5\pi}{3}$, $\cos x=-1$이면 $x=\pi$.`,
      String.raw`3. $\sin x>\cos x$를 만족하는 것은 $x=\frac{\pi}{3}$과 $x=\pi$이다($x=\frac{5\pi}{3}$은 제외).`,
      String.raw`4. 따라서 합은 $\frac{\pi}{3}+\pi=\frac{4}{3}\pi$. (답 ①)`
    ),
    A: String.raw`① $\frac{4}{3}\pi$`,
  },
  // [부등식 항상성립] cos²θ-4sinθ≤3k, k 최솟값 (정답 4/3)
  '088': {
    P: String.raw`실수 $k$의 최솟값`,
    C: String.raw`모든 실수 $\theta$에 대하여 부등식 $\cos^2\theta-4\sin\theta\le 3k$가 성립`,
    B: String.raw`$\cos^2\theta-4\sin\theta=1-\sin^2\theta-4\sin\theta$의 최댓값이 $3k$ 이하이면 된다`,
    S: S(
      String.raw`1. $s=\sin\theta\in[-1,1]$로 두면 $\cos^2\theta-4\sin\theta=1-s^2-4s=-(s+2)^2+5$.`,
      String.raw`2. 이는 $s=-1$에서 최댓값 $-(1)^2+5=4$를 가진다.`,
      String.raw`3. 모든 $\theta$에서 성립하려면 $4\le 3k$.`,
      String.raw`4. 따라서 $k\ge\frac{4}{3}$이고 최솟값은 $\frac{4}{3}$.`
    ),
    A: String.raw`$\frac{4}{3}$`,
  },
};

// ============ trig_graph_step3 (삼각함수그래프3단계) ============
// (이미지 placeholder → 손상힌트의 잔존 LaTeX·정답으로 충실복원. 050·054·061은 독립 검산.)
const AUTHORED_STEP3 = {
  // 함수방정식 g(x)=(f(x-2)+f(x+4))/2, f(x-3)=f(x+3), ad+bc (정답 12; 해설 전사)
  '044': {
    P: String.raw`$ad+bc$의 값`,
    C: String.raw`$g(x)=\dfrac{f(x-2)+f(x+4)}{2}$이고 $f(x-3)=f(x+3)$ (해설 기준)`,
    B: String.raw`$f(x-3)=f(x+3)$에서 $x\to x+1$하면 $f(x-2)=f(x+4)$이므로 $g(x)=f(x-2)$`,
    S: S(
      String.raw`1. $f(x-3)=f(x+3)$에서 $x$ 대신 $x+1$을 넣으면 $f(x-2)=f(x+4)$.`,
      String.raw`2. 따라서 $g(x)=\dfrac{f(x-2)+f(x+4)}{2}=f(x-2)$.`,
      String.raw`3. $g(4)=f(2)=2$, $g(8)=f(6)=-1$ 등에서 $a=4,b=2,c=8,d=-1$.`,
      String.raw`4. 따라서 $ad+bc=4\cdot(-1)+2\cdot 8=12$.`
    ),
    A: String.raw`12`,
  },
  // 각의 합 α+3β+3γ+δ (정답 13π/4; 독립 검산)
  '050': {
    P: String.raw`$\alpha+3\beta+3\gamma+\delta$의 값`,
    C: String.raw`$\alpha+\beta=\dfrac{\pi}{2}$, $\gamma+\delta=\dfrac{3}{4}\pi$, $\beta+\gamma=\pi$ (해설 기준)`,
    B: String.raw`$\alpha+3\beta+3\gamma+\delta=(\alpha+\beta)+(\gamma+\delta)+2(\beta+\gamma)$로 묶어 계산한다`,
    S: S(
      String.raw`1. $\alpha+3\beta+3\gamma+\delta=(\alpha+\beta)+(\gamma+\delta)+2(\beta+\gamma)$.`,
      String.raw`2. $=\dfrac{\pi}{2}+\dfrac{3}{4}\pi+2\pi$.`,
      String.raw`3. $=\dfrac{2\pi}{4}+\dfrac{3\pi}{4}+\dfrac{8\pi}{4}=\dfrac{13}{4}\pi$.`
    ),
    A: String.raw`$\dfrac{13}{4}\pi$`,
  },
  // 코사인 그래프 사다리꼴 넓이 40, aπ/b (정답 48; 해설 전사)
  '051': {
    P: String.raw`$\dfrac{a\pi}{b}$의 값`,
    C: String.raw`주기 $T=12$, $\overline{CD}=8$, $\overline{AD}=a\cos\dfrac{\pi}{3}+1$, 사다리꼴 $ABCD$의 넓이가 40 (해설 기준)`,
    B: String.raw`$\dfrac{2\pi}{|b|}=12$에서 $b=\dfrac{\pi}{6}$, $\overline{AD}=\dfrac{a}{2}+1$`,
    S: S(
      String.raw`1. $\dfrac{2\pi}{|b|}=12$에서 $b=\dfrac{\pi}{6}$ ($b>0$).`,
      String.raw`2. $\overline{AD}=a\cos\dfrac{\pi}{3}+1=\dfrac{a}{2}+1$.`,
      String.raw`3. 사다리꼴 넓이 $8\cdot\left(\dfrac{a}{2}+1\right)=40$에서 $\dfrac{a}{2}+1=5$, $a=8$.`,
      String.raw`4. 따라서 $\dfrac{a\pi}{b}=\dfrac{8\pi}{\pi/6}=48$.`
    ),
    A: String.raw`48`,
  },
  // 코사인 함수 넓이 조건, a (정답 10; 해설 전사)
  '052': {
    P: String.raw`$a$의 값`,
    C: String.raw`주기 6인 $f(x)=a\cos\dfrac{\pi}{3}x$에서 관련 넓이가 20 (해설 기준)`,
    B: String.raw`$\dfrac{2\pi}{b}=6$에서 $b=\dfrac{\pi}{3}$, $f(1)=\dfrac{a}{2}$`,
    S: S(
      String.raw`1. 주기가 6이므로 $\dfrac{2\pi}{b}=6$에서 $b=\dfrac{\pi}{3}$, $f(x)=a\cos\dfrac{\pi}{3}x$.`,
      String.raw`2. $f(1)=a\cos\dfrac{\pi}{3}=\dfrac{a}{2}$.`,
      String.raw`3. 넓이 $\dfrac{a}{2}\cdot 4=20$에서 $2a=20$.`,
      String.raw`4. 따라서 $a=10$.`
    ),
    A: String.raw`10`,
  },
  // y=a sin3x+b, y=9(3개)·y=2(7개), ab (정답 14; 029와 동일 유형, 검산)
  '054': {
    P: String.raw`$ab$의 값`,
    C: String.raw`$0\le x\le 2\pi$에서 $y=a\sin 3x+b$가 직선 $y=9$와 3개, $y=2$와 7개의 점에서 만난다 (해설 기준)`,
    B: String.raw`중심선 $y=b$에서 7개, 최대선 $y=a+b$에서 3개의 교점이 생긴다`,
    S: S(
      String.raw`1. $y=a\sin 3x+b$의 주기는 $\dfrac{2\pi}{3}$이고, 직선과의 교점은 중심선 $y=b$에서 7개, 최대선·최소선 $y=\pm a+b$에서 3개이다.`,
      String.raw`2. $y=2$와 7개에서 만나므로 $b=2$.`,
      String.raw`3. $y=9$와 3개에서 만나므로 $a+b=9$, 즉 $a=7$.`,
      String.raw`4. 따라서 $ab=7\cdot 2=14$.`
    ),
    A: String.raw`14`,
  },
  // f=2sin²(x-3π/4)-sin(x-π/4)+k, max3 min m, 2(k+m) (정답 3/2; 독립 검산)
  '061': {
    P: String.raw`$2(k+m)$의 값`,
    C: String.raw`$f(x)=2\sin^2\left(x-\dfrac{3}{4}\pi\right)-\sin\left(x-\dfrac{\pi}{4}\right)+k$의 최댓값이 3, 최솟값이 $m$`,
    B: String.raw`$u=x-\dfrac{\pi}{4}$로 두면 $f=-2\sin^2 u-\sin u+k+2$, $t=\sin u$의 이차식 $y=-2t^2-t+k+2$`,
    S: S(
      String.raw`1. $u=x-\dfrac{\pi}{4}$로 두면 $\sin\left(x-\dfrac{3}{4}\pi\right)=-\cos u$이라 $f=2\cos^2 u-\sin u+k=-2\sin^2 u-\sin u+k+2$.`,
      String.raw`2. $t=\sin u\in[-1,1]$로 두면 $y=-2t^2-t+k+2=-2\left(t+\dfrac{1}{4}\right)^2+k+\dfrac{17}{8}$.`,
      String.raw`3. 최댓값은 $t=-\dfrac{1}{4}$에서 $k+\dfrac{17}{8}=3$이라 $k=\dfrac{7}{8}$. 최솟값은 $t=1$에서 $m=k-1=-\dfrac{1}{8}$.`,
      String.raw`4. 따라서 $2(k+m)=2\left(\dfrac{7}{8}-\dfrac{1}{8}\right)=\dfrac{3}{2}$.`
    ),
    A: String.raw`$\dfrac{3}{2}$`,
  },
  // 동경 일치 sinθ+...+sin7θ (정답 √3/2; 문제텍스트 전체 확보·검산)
  '057': {
    P: String.raw`$\sin\theta+\sin 2\theta+\cdots+\sin 7\theta$의 값`,
    C: String.raw`각 $\theta$를 나타내는 동경과 각 $7\theta$를 나타내는 동경이 일치하고 $\frac{\pi}{6}<\theta<\frac{\pi}{2}$ (해설 기준)`,
    B: String.raw`동경이 일치하므로 $7\theta-\theta=2n\pi$에서 $\theta=\frac{n\pi}{3}$이고, 범위 조건으로 $\theta=\frac{\pi}{3}$ (즉 $3\theta=\pi$)`,
    S: S(
      String.raw`1. 두 동경이 일치하므로 $7\theta-\theta=2n\pi$, 즉 $6\theta=2n\pi$에서 $\theta=\frac{n\pi}{3}$.`,
      String.raw`2. $\frac{\pi}{6}<\theta<\frac{\pi}{2}$이므로 $\theta=\frac{\pi}{3}$, 즉 $3\theta=\pi$.`,
      String.raw`3. $\sin 4\theta=\sin(\pi+\theta)=-\sin\theta$, $\sin 5\theta=-\sin 2\theta$, $\sin 6\theta=-\sin 3\theta$, $\sin 7\theta=\sin(2\pi+\theta)=\sin\theta$이다.`,
      String.raw`4. 따라서 $(\sin\theta+\sin 4\theta)+(\sin 2\theta+\sin 5\theta)+(\sin 3\theta+\sin 6\theta)+\sin 7\theta=\sin 7\theta=\sin\frac{\pi}{3}=\frac{\sqrt{3}}{2}$.`
    ),
    A: String.raw`$\dfrac{\sqrt{3}}{2}$`,
  },
};

async function fetchProdHint(hintDir, pid) {
  const r = await fetch(`${PUBLIC_BASE}/math_hints/${hintDir}/${pid}.json`, { cache: 'no-store' });
  if (!r.ok) return null;
  return r.json();
}
async function uploadHint(hintDir, pid, obj) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/math_hints/${hintDir}/${pid}.json`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(obj),
  });
  if (!r.ok) throw new Error(`upload ${pid}: ${r.status} ${(await r.text()).slice(0, 120)}`);
}
const countMojibake = (s) => (String(s).match(/\?\?/g) || []).length;

async function main() {
  const args = process.argv.slice(2);
  const stage = args[0]; // step2 | step3
  const dryRun = args.includes('--dry-run');
  const pids = args.filter((a) => /^\d{3}$/.test(a));
  const HINT_DIR = stage === 'step2' ? 'trig_graph_step2' : stage === 'step3' ? 'trig_graph_step3' : null;
  const AUTHORED = stage === 'step2' ? AUTHORED_STEP2 : stage === 'step3' ? AUTHORED_STEP3 : null;
  if (!HINT_DIR) { console.error('Usage: node restore_trig_graph_steps_mojibake.cjs <step2|step3> [--dry-run] [pid...]'); process.exit(1); }
  if (!SERVICE_KEY && !dryRun) { console.error('❌ SUPABASE_SERVICE_ROLE_KEY 없음'); process.exit(1); }

  const targets = pids.length ? pids : Object.keys(AUTHORED);
  let ok = 0, fail = 0;
  for (const pid of targets) {
    const authored = AUTHORED[pid];
    if (!authored) { console.warn(`⚠️ ${pid}: AUTHORED 없음 — 건너뜀`); continue; }
    const selfBad = ['P', 'C', 'B', 'S', 'A'].reduce((n, k) => n + countMojibake(authored[k]), 0);
    if (selfBad > 0) { console.error(`❌ ${pid}: 저작 ?? ${selfBad}`); fail++; continue; }
    const base = (await fetchProdHint(HINT_DIR, pid)) || {};
    const merged = { ...base, P: authored.P, C: authored.C, B: authored.B, S: authored.S, A: authored.A };
    const narration = buildNarration(merged);
    const narBad = countMojibake(narration);
    console.log(`\n--- ${HINT_DIR}/${pid} --- (기존 ?? ${countMojibake(JSON.stringify(base))} → 나레이션 ?? ${narBad})`);
    console.log(`  ${narration.slice(0, 150).replace(/\n/g, ' ')}...`);
    if (narBad > 0) { console.error('  ❌ 나레이션 ?? 잔존'); fail++; continue; }
    if (dryRun) { console.log('  [dry-run]'); ok++; continue; }
    // 업로드 실패는 해당 pid 만 건너뛰고 배치는 계속 (1건 오류로 전체 중단 방지)
    try {
      await uploadHint(HINT_DIR, pid, merged);
      const v = await fetchProdHint(HINT_DIR, pid);
      if (countMojibake(JSON.stringify(v)) > 0) { console.error('  ❌ 재조회 ?? 잔존'); fail++; continue; }
      console.log('  ☁️ 업로드·검증 완료');
      ok++;
    } catch (e) {
      console.error(`  ❌ ${pid} 업로드 실패: ${e.message} — 건너뜀`);
      fail++;
    }
  }
  console.log(`\n========== ${HINT_DIR} 복원: 성공 ${ok}, 실패 ${fail} (총 ${targets.length}) ==========`);
}
main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
