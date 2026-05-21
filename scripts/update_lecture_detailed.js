import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const detailedContent = `# 📌 이항정리와 다항정리 완벽 마스터

이항정리란 두 항의 합의 거듭제곱, 즉 $(a+b)^n$을 전개하는 공식입니다. 이항정리를 응용하면 파스칼의 삼각형과 다항정리까지 확장할 수 있습니다.

## 1. 이항정리의 기본 공식

$(a+b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r$

여기서 $\\binom{n}{r}$ 또는 $_nC_r$을 **이항계수**라고 부릅니다.

### 💡 예제 1: $(x+y)^3$ 전개하기
$(x+y)^3 = x^3 + 3x^2y + 3xy^2 + y^3$

---

## 2. $(1+x)^n$ 의 전개와 이항계수의 성질

$(1+x)^n = \\binom{n}{0} + \\binom{n}{1}x + \\cdots + \\binom{n}{n}x^n$

**① 총합:** $\\binom{n}{0} + \\binom{n}{1} + \\cdots + \\binom{n}{n} = 2^n$
**② 교대 부호:** $\\binom{n}{0} - \\binom{n}{1} + \\cdots + (-1)^n\\binom{n}{n} = 0$
**③ 짝수/홀수 합:** $\\binom{n}{0} + \\binom{n}{2} + \\cdots = \\binom{n}{1} + \\binom{n}{3} + \\cdots = 2^{n-1}$

---

## 3. 파스칼의 삼각형과 하키스틱 패턴

파스칼의 삼각형에서 대각선으로 숫자를 더해 내려가면 꺾인 방향의 숫자와 같아집니다. 이를 **하키스틱 법칙**이라고 합니다. 하키스틱 법칙은 시작 위치와 꺾이는 방향에 따라 크게 세 가지 형태로 정리할 수 있습니다.

**패턴 1: 오른쪽 아래로 내려가다 왼쪽으로 꺾기**
- 우측 테두리(끝)에서 시작하여 연속해서 더할 때 사용합니다.
- 공식: $\\sum_{k=r}^{n} \\binom{k}{r} = \\binom{r}{r} + \\binom{r+1}{r} + \\cdots + \\binom{n}{r} = \\binom{n+1}{r+1}$
- 예: $\\binom{2}{2} + \\binom{3}{2} + \\binom{4}{2} = \\binom{5}{3}$

**패턴 2: 왼쪽 아래로 내려가다 오른쪽으로 꺾기**
- 좌측 테두리(끝)에서 시작하여 연속해서 더할 때 사용합니다.
- 공식: $\\sum_{k=0}^{m} \\binom{n+k}{k} = \\binom{n}{0} + \\binom{n+1}{1} + \\cdots + \\binom{n+m}{m} = \\binom{n+m+1}{m}$
- 예: $\\binom{3}{0} + \\binom{4}{1} + \\binom{5}{2} = \\binom{6}{2}$

**패턴 3: 중간에서 시작하는 경우 (테두리 보정)**
- 만약 테두리(1)에서 시작하지 않고 중간에서 더하기 시작했다면, 공식 적용 후 빠진 테두리 부분의 값을 빼주어야 합니다.
- 예: $\\binom{3}{2} + \\binom{4}{2} = \\binom{5}{3} - \\binom{2}{2}$

---

## 4. 다항정리 (항이 세 개 이상인 경우)

이항정리를 확장하여 항이 3개 이상인 $(a+b+c)^n$ 꼴의 전개식에서 계수를 구하는 정리입니다.
각 항은 $a^p b^q c^r$ 모양을 가지며, 이때 $p+q+r=n$ 이어야 합니다.

**[다항정리 일반항 공식]**
$$ \\frac{n!}{p!q!r!} a^p b^q c^r \\quad (단, p+q+r=n) $$

### 💡 예제 2: $(x+y+z)^5$ 에서 $x^2 y z^2$ 의 계수는?
**풀이:** $p=2, q=1, r=2$ 이고 합이 5가 맞습니다.
계수는 $\\frac{5!}{2! 1! 2!} = \\frac{120}{2 \\times 1 \\times 2} = 30$ 입니다.

### 💡 예제 3: $(x+2y-z)^4$ 에서 $x y^2 z$ 의 계수는?
**풀이:** $a=x, b=2y, c=-z$ 라 생각합니다. 차수는 $p=1, q=2, r=1$ 입니다.
일반항: $\\frac{4!}{1! 2! 1!} (x)^1 (2y)^2 (-z)^1 = 12 \\times x \\times 4y^2 \\times (-z) = -48 x y^2 z$
따라서 계수는 **-48** 입니다.

### 💡 예제 4: $(x^2 + x - 1)^4$ 에서 $x^3$ 의 계수는?
**풀이:** $(x^2)^p (x)^q (-1)^r$ 이며 $p+q+r=4$ 입니다.
문자 부분의 차수는 $x^{2p+q}$ 이므로 $2p+q=3$ 이 되어야 합니다.
가능한 $(p, q, r)$ 순서쌍은 다음과 같습니다:
- $p=1$ 이면 $q=1$. 이때 $p+q+r=4$ 이므로 $r=2$. $\\implies (1, 1, 2)$
- $p=0$ 이면 $q=3$. 이때 $p+q+r=4$ 이므로 $r=1$. $\\implies (0, 3, 1)$

각 경우의 계수를 계산하여 더합니다:
- (1, 1, 2)인 경우: $\\frac{4!}{1!1!2!} (1)^1 (1)^1 (-1)^2 = 12$
- (0, 3, 1)인 경우: $\\frac{4!}{0!3!1!} (1)^0 (1)^3 (-1)^1 = 4 \\times (-1) = -4$
따라서 총 계수는 $12 - 4 =$ **8** 입니다.`;

const statsList = data['확률과통계'];
const index = statsList.findIndex(x => x.id === '이항정리');
if (index !== -1) {
  statsList[index].content = detailedContent;
  statsList[index].title = "이항정리와 다항정리";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated 이항정리와 다항정리 in concept_cards');
