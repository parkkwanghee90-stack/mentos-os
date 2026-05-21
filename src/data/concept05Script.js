export const CONCEPT_05_SCRIPT = [
  // ==========================================
  // 1. (a+b)^2
  // ==========================================
  { type: 'INIT_FORMULA', delay: 0,
    data: {
      target: "(a+b)^2",
      slot: "\\rightarrow \\quad [ \\quad \\quad ] \\times [ \\quad \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "[a][a]" },
        { id: 2, color: '#22c55e', text: "[a][b] \\\\ [b][a]" },
        { id: 3, color: '#3b82f6', text: "[b][b]" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "a^2" },
        { id: 2, color: '#22c55e', text: "2ab" },
        { id: 3, color: '#3b82f6', text: "b^2" }
      ],
      final: "a^2 + 2ab + b^2"
    }
  },
  { type: 'STEP', step: 1, delay: 100, text: "(a+b)의 제곱은 칸이 두 개입니다." },
  { type: 'STEP', step: 2, delay: 3000, text: "각 칸에 a나 b를 넣을 수 있습니다." },
  { type: 'STEP', step: 3, delay: 6000, text: "aa, ab, ba, bb 조합이 나옵니다." },
  { type: 'STEP', step: 4, delay: 10000, text: "ab와 ba는 같은 항이라서 합쳐서 2ab가 됩니다." },
  { type: 'STEP', step: 5, delay: 15000, text: "그래서 a제곱 더하기 2ab 더하기 b제곱입니다." },

  // ==========================================
  // 2. (a-b)^2
  // ==========================================
  { type: 'INIT_FORMULA', delay: 21000,
    data: {
      target: "(a-b)^2",
      slot: "\\rightarrow \\quad [ \\quad \\quad ] \\times [ \\quad \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "[a][a]" },
        { id: 2, color: '#22c55e', text: "[a][-b] \\\\ [-b][a]" },
        { id: 3, color: '#3b82f6', text: "[-b][-b]" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "a^2" },
        { id: 2, color: '#22c55e', text: "-2ab" },
        { id: 3, color: '#3b82f6', text: "b^2" }
      ],
      final: "a^2 - 2ab + b^2"
    }
  },
  { type: 'STEP', step: 1, delay: 21100, text: "(a-b)의 제곱도 똑같이 칸이 2개입니다." },
  { type: 'STEP', step: 2, delay: 24500, text: "이번에는 b가 아니라 -b를 각 칸에 넣습니다." },
  { type: 'STEP', step: 3, delay: 28500, text: "조합을 꺼내면 다른 것들끼리 마이너스 부호가 붙습니다." },
  { type: 'STEP', step: 4, delay: 33000, text: "그래서 가운데 두 항이 둘 다 마이너스가 됩니다." },
  { type: 'STEP', step: 5, delay: 37000, text: "마지막은 음수 곱하기 음수라서 플러스 b제곱입니다. 결과는 a제곱 빼기 2ab 더하기 b제곱입니다." },

  // ==========================================
  // 3. (a+b)(a-b)
  // ==========================================
  { type: 'INIT_FORMULA', delay: 45000,
    data: {
      target: "(a+b)(a-b)",
      slot: "\\rightarrow \\quad [ \\quad \\quad ] \\times [ \\quad \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "a, a \\rightarrow a^2" },
        { id: 2, color: '#22c55e', text: "a, (-b) \\rightarrow -ab" },
        { id: 3, color: '#eab308', text: "b, a \\rightarrow +ab" },
        { id: 4, color: '#3b82f6', text: "b, (-b) \\rightarrow -b^2" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "a^2" },
        { id: 2, color: '#22c55e', text: "상쇄됨 (0)" },
        { id: 3, color: '#3b82f6', text: "-b^2" }
      ],
      final: "a^2 - b^2"
    }
  },
  { type: 'STEP', step: 1, delay: 45100, text: "이건 앞 괄호와 뒤 괄호에서 하나씩 뽑는 구조입니다." },
  { type: 'STEP', step: 2, delay: 49000, text: "첫 괄호에서는 a 또는 b를, 둘째 괄호에서는 a 또는 -b를 뽑습니다." },
  { type: 'STEP', step: 3, delay: 54000, text: "네 가지 경우를 모두 뽑아봅니다." },
  { type: 'STEP', step: 4, delay: 57000, text: "가운데 항이 -ab와 +ab로 서로 반대라서 0으로 없어집니다." },
  { type: 'STEP', step: 5, delay: 62000, text: "그래서 가장 큰 것의 제곱, 가장 작은 것의 제곱인 a제곱 빼기 b제곱만 남습니다. 이게 합차 공식입니다." },

  // ==========================================
  // 4. (x+a)(x+b)
  // ==========================================
  { type: 'INIT_FORMULA', delay: 70000,
    data: {
      target: "(x+a)(x+b)",
      slot: "\\rightarrow \\quad [ \\quad \\quad ] \\times [ \\quad \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "x, x \\rightarrow x^2" },
        { id: 2, color: '#22c55e', text: "x, b \\rightarrow bx" },
        { id: 3, color: '#eab308', text: "a, x \\rightarrow ax" },
        { id: 4, color: '#3b82f6', text: "a, b \\rightarrow ab" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "x^2" },
        { id: 2, color: '#22c55e', text: "(a+b)x" },
        { id: 3, color: '#3b82f6', text: "ab" }
      ],
      final: "x^2 + (a+b)x + ab"
    }
  },
  { type: 'STEP', step: 1, delay: 70100, text: "마찬가지로 각 괄호에서 하나씩 뽑습니다." },
  { type: 'STEP', step: 2, delay: 73500, text: "첫 괄호에서는 x 또는 a, 둘째 괄호에서는 x 또는 b 입니다." },
  { type: 'STEP', step: 3, delay: 78000, text: "x가 두 번 뽑히면 x제곱이 됩니다." },
  { type: 'STEP', step: 4, delay: 81500, text: "x가 한 번만 나오는 ax와 bx 형태는 둘 다 x가 공통이므로 a 더하기 b의 x로 묶을 수 있습니다." },
  { type: 'STEP', step: 5, delay: 88000, text: "마지막으로 a와 b를 곱한 ab가 남습니다." },

  // ==========================================
  // 5. (a+b+c)^2
  // ==========================================
  { type: 'INIT_FORMULA', delay: 93000,
    data: {
      target: "(a+b+c)^2",
      slot: "\\rightarrow \\quad [ \\quad \\quad ] \\times [ \\quad \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "aa, bb, cc" },
        { id: 2, color: '#22c55e', text: "ab, ba, bc, cb, ca, ac" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "a^2+b^2+c^2" },
        { id: 2, color: '#22c55e', text: "2ab + 2bc + 2ca" }
      ],
      final: "a^2 + b^2 + c^2 + 2ab + 2bc + 2ca"
    }
  },
  { type: 'STEP', step: 1, delay: 93100, text: "이번에는 칸이 2개인데 넣을 수 있는 재료가 세 개입니다." },
  { type: 'STEP', step: 2, delay: 97500, text: "각 칸에 a, b, c 중 하나를 자유롭게 꺼냅니다." },
  { type: 'STEP', step: 3, delay: 101000, text: "같은 것 두 개를 뽑는 경우와, 다른 것 두 개를 뽑는 경우로 나뉩니다." },
  { type: 'STEP', step: 4, delay: 106000, text: "같은 것끼리 넣은 건 전부 제곱이 됩니다." },
  { type: 'STEP', step: 5, delay: 110000, text: "다른 것끼리는 순서를 바꾸면 같은 항이 두 번 나오므로 앞에 2가 붙습니다." },

  // ==========================================
  // 6. (a+b)^3
  // ==========================================
  { type: 'INIT_FORMULA', delay: 116000,
    data: {
      target: "(a+b)^3",
      slot: "\\rightarrow [ \\quad ] \\times [ \\quad ] \\times [ \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "[a][a][a]" },
        { id: 2, color: '#22c55e', text: "[a][a][b] \\\\ [a][b][a] \\\\ [b][a][a]" },
        { id: 3, color: '#eab308', text: "[a][b][b] \\\\ [b][a][b] \\\\ [b][b][a]" },
        { id: 4, color: '#3b82f6', text: "[b][b][b]" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "a^3" },
        { id: 2, color: '#22c55e', text: "3a^2b" },
        { id: 3, color: '#eab308', text: "3ab^2" },
        { id: 4, color: '#3b82f6', text: "b^3" }
      ],
      final: "a^3 + 3a^2b + 3ab^2 + b^3"
    }
  },
  { type: 'STEP', step: 1, delay: 116100, text: "세제곱은 칸이 3개입니다." },
  { type: 'STEP', step: 2, delay: 119000, text: "지금은 세 칸에서 선택합니다. 각각의 세 칸에 a 또는 b를 넣을 수 있으므로 조합이 늘어납니다." },
  { type: 'STEP', step: 3, delay: 124000, text: "선택된 경우를 보세요. a 2개, b 1개가 선택된 경우는 [a][a][b] 등 3가지가 애니메이션처럼 나옵니다." },
  { type: 'STEP', step: 4, delay: 130000, text: "이제 같은 결과끼리 그룹화합니다. 방금 3가지 경우가 묶여서 곱하기 3 구조가 되어 3a제곱b가 도출됩니다." },
  { type: 'STEP', step: 5, delay: 136000, text: "이 칸 선택 개념을 통해 결국 a세제곱 더하기 3a제곱b 더하기 3ab제곱 더하기 b세제곱이 완성됩니다." },

  // ==========================================
  // 7. (a-b)^3
  // ==========================================
  { type: 'INIT_FORMULA', delay: 143000,
    data: {
      target: "(a-b)^3",
      slot: "\\rightarrow [ \\quad ] \\times [ \\quad ] \\times [ \\quad ]",
      combinations: [
        { id: 1, color: '#ef4444', text: "[a][a][a]" },
        { id: 2, color: '#22c55e', text: "[a][a][-b] \\\\ [a][-b][a] \\\\ [-b][a][a]" },
        { id: 3, color: '#eab308', text: "[a][-b][-b] \\\\ [-b][a][-b] \\\\ [-b][-b][a]" },
        { id: 4, color: '#3b82f6', text: "[-b][-b][-b]" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "a^3" },
        { id: 2, color: '#22c55e', text: "-3a^2b" },
        { id: 3, color: '#eab308', text: "3ab^2" },
        { id: 4, color: '#3b82f6', text: "-b^3" }
      ],
      final: "a^3 - 3a^2b + 3ab^2 - b^3"
    }
  },
  { type: 'STEP', step: 1, delay: 143100, text: "빼기 세제곱도 세 칸입니다." },
  { type: 'STEP', step: 2, delay: 146500, text: "지금은 세 칸에서 선택합니다. 각 칸에서 a 또는 -b 중에서 선택합니다." },
  { type: 'STEP', step: 3, delay: 151500, text: "예를 들어 a 두 개, -b 하나가 선택된 경우는 화면처럼 순서에 따라 세 가지가 생깁니다." },
  { type: 'STEP', step: 4, delay: 156500, text: "이제 같은 결과를 그룹화합니다. 방금 본 3가지는 묶여서 곱하기 3이 되므로 마이너스 3a제곱b가 됩니다." },
  { type: 'STEP', step: 5, delay: 161000, text: "부호는 b가 뽑힌 횟수입니다. 결과적으로 선택하고, 묶이고, 계수가 나오는 이 구조가 바로 모든 전개 애니메이션의 본질입니다." },

  // ==========================================
  // 8. (a+b)(a^2-ab+b^2) & (a-b)(a^2+ab+b^2)
  // ==========================================
  { type: 'INIT_FORMULA', delay: 168000,
    data: {
      target: "(a+b)(a^2-ab+b^2) \\quad \\text{and} \\quad (a-b)(a^2+ab+b^2)",
      slot: "\\text{가운데 항 상쇄 구조}",
      combinations: [
        { id: 1, color: '#ef4444', text: "a^3 - a^2b + ab^2" },
        { id: 2, color: '#3b82f6', text: "a^2b - ab^2 + b^3" }
      ],
      reductions: [
        { id: 1, color: '#22c55e', text: "가운데 항 모두 소거됨" }
      ],
      final: "a^3 \\pm b^3"
    }
  },
  { type: 'STEP', step: 1, delay: 168100, text: "마지막으로 이건 외우는 공식이 아니라 중간항이 없어지는 구조입니다." },
  { type: 'STEP', step: 2, delay: 173500, text: "긴 수식을 전개해보면 대칭 구조로 이루어져 있습니다." },
  { type: 'STEP', step: 3, delay: 177500, text: "하나씩 짝을 맞추어 더해봅니다." },
  { type: 'STEP', step: 4, delay: 180500, text: "부호가 반대인 가운데 두 개의 항들이 완벽하게 서로 상쇄되어 지워지는 것을 볼 수 있습니다." },
  { type: 'STEP', step: 5, delay: 186000, text: "앞에 더하기가 있으면 세제곱의 합만 남고, 빼기가 있으면 세제곱의 차만 남습니다." },

  // ==========================================
  // 9. (x^2+x+1)(x^2-x+1)
  // ==========================================
  { type: 'INIT_FORMULA', delay: 193000,
    data: {
      target: "(x^2+x+1)(x^2-x+1)",
      slot: "\\text{위치를 바꿔서 합차 구조 만들기}",
      combinations: [
        { id: 1, color: '#ef4444', text: "A = x^2+1" },
        { id: 2, color: '#3b82f6', text: "B = x" }
      ],
      reductions: [
        { id: 1, color: '#ef4444', text: "(A+B)(A-B)" },
        { id: 2, color: '#22c55e', text: "A^2-B^2" },
        { id: 3, color: '#3b82f6', text: "(x^2+1)^2-x^2" }
      ],
      final: "x^4+x^2+1"
    }
  },
  { type: 'STEP', step: 1, delay: 193100, text: "항이 세 개인 식의 곱셈입니다." },
  { type: 'STEP', step: 2, delay: 196500, text: "무작정 전개하지 말고 순서를 바꿔서 x제곱 더하기 1과 더하기 x, 빼기 x인 합차 구조로 다시 바라봅니다." },
  { type: 'STEP', step: 3, delay: 202000, text: "x제곱 더하기 1을 A, x를 B로 두어 A 더하기 B와 A 빼기 B의 합차 곱 구조를 찾습니다." },
  { type: 'STEP', step: 4, delay: 207000, text: "합차 공식에 의해 A제곱 빼기 B제곱이 됩니다. 방금 변형한 식으로 다시 넣으면 x제곱 더하기 1의 완전제곱 빼기 x제곱이 됩니다." },
  { type: 'STEP', step: 5, delay: 213000, text: "마지막으로 앞쪽의 완전제곱식을 풀어서 뒤의 x제곱을 빼주면 전개가 완벽히 마무리됩니다." },

  // ==========================================
  // 10. a^3+b^3+c^3-3abc
  // ==========================================
  { type: 'INIT_FORMULA', delay: 220000,
    data: {
      target: "a^3+b^3+c^3-3abc",
      slot: "\\text{결과가 아닌 인수분해 구조 찾기}",
      combinations: [
        { id: 1, color: '#ef4444', text: "(a+b+c)" },
        { id: 2, color: '#3b82f6', text: "(a^2+b^2+c^2-ab-bc-ca)" }
      ],
      reductions: [
        { id: 1, color: '#eab308', text: "전개하여 교차항이 상쇄되는지 검산" }
      ],
      final: "(a+b+c)(a^2+b^2+c^2-ab-bc-ca)"
    }
  },
  { type: 'STEP', step: 1, delay: 220100, text: "세제곱이 세 개나 들어간 가장 긴 공식입니다. 결과를 무작정 외우게 하지 않고 인수분해 구조로 시작합니다." },
  { type: 'STEP', step: 2, delay: 226000, text: "이 식은 결국 a 더하기 b 더하기 c를 한 덩어리로 가정하고 묶는 것이 가장 큰 핵심입니다." },
  { type: 'STEP', step: 3, delay: 231500, text: "저 첫 괄호와 무엇이 곱해져야 원래의 식이 도출될 지, 두 번째 긴 괄호의 구조를 끼워맞춥니다." },
  { type: 'STEP', step: 4, delay: 236000, text: "끼워맞춘 두 괄호를 직접 전개해봅니다. 중간의 교차 항들이 모두 서로 상쇄되고 a세제곱 b세제곱 c세제곱 빼기 3abc가 되는지 철저히 검산해야 합니다." },
  { type: 'STEP', step: 5, delay: 242000, text: "구조를 찾고, 묶고, 공식을 적용한 뒤 최종적으로 검산까지 진행하는 이 흐름으로 식을 공부해야 합니다." },

  // ==========================================
  // 11. 마지막 요약
  // ==========================================
  { type: 'INIT_FORMULA', delay: 250000,
    data: {
      target: "\\text{개념 완성}",
      slot: "\\text{구조의 승리}",
      combinations: [],
      reductions: [],
      final: "\\text{외우지 말고 구조로 풀어라!}"
    }
  },
  { type: 'STEP', step: 1, delay: 250100, text: "정리하겠습니다. 곱셈 공식은 맹목적으로 외우는 것이 아닙니다." },
  { type: 'STEP', step: 5, delay: 254000, text: "칸 구조와 소거되는 원리를 머릿속에서 먼저 이해해야 합니다. 같은 것끼리는 제곱이 되고, 방향을 알면 수학은 쉬워집니다. 수고하셨습니다." },
];
