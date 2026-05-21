import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const binomialContent = `# 📌 이항정리 (Binomial Theorem) 완벽 마스터

이항정리란 두 항의 합의 거듭제곱, 즉 $(a+b)^n$을 전개하는 공식입니다. 이항정리를 이용하면 복잡한 다항식의 전개를 빠르고 정확하게 할 수 있습니다.

## 1. 이항정리의 기본 공식

$(a+b)^n$ 을 전개하면 각 항은 $a$와 $b$를 합하여 $n$번 곱한 형태가 됩니다. 이때 각 항의 계수는 조합(Combination)을 이용하여 구할 수 있습니다.

**[공식]**
$$ (a+b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r $$

풀어서 쓰면 다음과 같습니다:
$$ (a+b)^n = \\binom{n}{0}a^n + \\binom{n}{1}a^{n-1}b^1 + \\cdots + \\binom{n}{r}a^{n-r}b^r + \\cdots + \\binom{n}{n}b^n $$

여기서 $\\binom{n}{r}$ 또는 $_nC_r$을 **이항계수**라고 부르며, 전개식에서 특정 항 $a^{n-r}b^r$의 계수가 됩니다.

### 💡 예제 1: $(x+y)^3$ 전개하기
$$ (x+y)^3 = \\binom{3}{0}x^3 + \\binom{3}{1}x^2y + \\binom{3}{2}xy^2 + \\binom{3}{3}y^3 $$
$$ = x^3 + 3x^2y + 3xy^2 + y^3 $$

---

## 2. $(1+x)^n$ 의 전개와 이항계수의 성질

$a=1$, $b=x$ 를 대입하면 매우 중요한 공식인 $(1+x)^n$의 전개식을 얻을 수 있습니다.

**[공식]**
$$ (1+x)^n = \\binom{n}{0} + \\binom{n}{1}x + \\binom{n}{2}x^2 + \\cdots + \\binom{n}{n}x^n $$

이 식에 $x$ 대신 특정 값을 대입하면 이항계수에 관한 다양한 성질을 이끌어낼 수 있습니다.

**① 이항계수의 총합 ( $x=1$ 대입 )**
$$ \\binom{n}{0} + \\binom{n}{1} + \\binom{n}{2} + \\cdots + \\binom{n}{n} = 2^n $$

**② 교대 부호의 합 ( $x=-1$ 대입 )**
$$ \\binom{n}{0} - \\binom{n}{1} + \\binom{n}{2} - \\cdots + (-1)^n\\binom{n}{n} = 0 $$

**③ 짝수/홀수 번째 계수의 합 ( ①과 ②를 더하거나 뺌 )**
$$ \\binom{n}{0} + \\binom{n}{2} + \\binom{n}{4} + \\cdots = \\binom{n}{1} + \\binom{n}{3} + \\binom{n}{5} + \\cdots = 2^{n-1} $$

---

## 3. 파스칼의 삼각형 (Pascal's Triangle)

파스칼의 삼각형은 이항계수들을 삼각형 모양으로 배열한 것입니다.

      1
     1 1
    1 2 1
   1 3 3 1
  1 4 6 4 1

**파스칼의 삼각형의 핵심 원리:**
1. **대칭성:** 좌우 대칭을 이룹니다. $\\implies \\binom{n}{r} = \\binom{n}{n-r}$
2. **합의 법칙 (파스칼의 공식):** 바로 위쪽 두 수의 합이 아래쪽 수가 됩니다.
$$ \\binom{n-1}{r-1} + \\binom{n-1}{r} = \\binom{n}{r} $$
3. **하키스틱 패턴:** 한 쪽 끝에서 대각선으로 쭉 내려오며 더한 값은 꺾인 방향의 수와 같습니다.
$$ \\sum_{k=r}^{n} \\binom{k}{r} = \\binom{n+1}{r+1} $$

### 💡 예제 2: 파스칼의 공식 적용
$\\binom{4}{2} + \\binom{4}{3}$ 을 계산하시오.
**풀이:** 파스칼의 공식에 의해 $n-1=4$이므로 $n=5$, 그리고 $r=3$입니다. 따라서 $\\binom{5}{3} = 10$이 됩니다.

---
### 🎓 요약 및 실전 팁!
- 전개식에서 특정 항의 계수를 찾을 때는 일반항 $\\binom{n}{r} a^{n-r} b^r$ 에 대입하여 $r$을 찾는 것이 가장 빠릅니다.
- $(1+x)^n$ 꼴의 이항계수 성질은 모의고사에서 자주 출제되는 단골 소재이니 암기가 필수입니다!`;

const statsList = data['확률과통계'];
const index = statsList.findIndex(x => x.id === '이항정리');
if (index !== -1) {
  statsList[index].content = binomialContent;
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated 이항정리');
