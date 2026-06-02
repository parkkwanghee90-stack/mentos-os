// Unbalanced-$ repairs for 지수/로그 함수 units, reconstructed from ORIGINAL images
// (public/math_crops/수학1 중간/{2,3}단계/...). All verified against printed solutions.
// English / Korean / .png / .webp variants of the same number share one string -> fixed together.

module.exports = [
  // 034a (로그함수2단계 / log_func_step2): stray "$" inside \text{① $}, and trailing stray "$"
  {
    keys: [
      "로그함수2단계/034a.webp",
      "log_func_step2/034a.webp",
      "log_func_step2/034a.png",
    ],
    replaces: [
      ["\\quad \\cdots \\quad \\text{① $} \\]", "\\quad \\cdots \\quad \\text{①} \\]"],
      ["a - m = -1 - (-2) = 1 \\]$", "a - m = -1 - (-2) = 1 \\]"],
    ],
  },

  // 064a (로그함수2단계 / log_func_step2): missing closing "$" before \[
  {
    keys: [
      "로그함수2단계/064a.webp",
      "log_func_step2/064a.webp",
      "log_func_step2/064a.png",
    ],
    replaces: [
      ["$x<4$, $x>-8\\[ -8<x<4 \\]", "$x<4$, $x>-8$ \\[ -8<x<4 \\]"],
    ],
  },

  // 074a (log_func_step2): missing closing "$" before \(, and trailing stray "$"
  {
    keys: [
      "log_func_step2/074a.webp",
      "log_func_step2/074a.png",
    ],
    replaces: [
      ["∴ $x > -6\\( \\cdots \\text{①} \\)", "∴ $x > -6$ \\( \\cdots \\text{①} \\)"],
      ["∴ $-\\frac{47}{8} \\leq x \\leq 2\\( \\cdots \\text{②} \\)", "∴ $-\\frac{47}{8} \\leq x \\leq 2$ \\( \\cdots \\text{②} \\)"],
      ["$-5, -4, -3, \\cdots, 2$의 8개이다.$", "$-5, -4, -3, \\cdots, 2$의 8개이다."],
    ],
  },

  // 019a (로그함수3단계 / log_func_step3): stray "$" in \text{① $}, and missing closing "$" on "$a = 10"
  {
    keys: [
      "로그함수3단계/019a.webp",
      "log_func_step3/019a.webp",
      "log_func_step3/019a.png",
    ],
    replaces: [
      ["\\quad \\cdots \\; \\text{① $} \\]", "\\quad \\cdots \\; \\text{①} \\]"],
      ["(i), (ii)에 의하여 $a = 10", "(i), (ii)에 의하여 $a = 10$"],
    ],
  },

  // 035 (지수함수3단계 / exp_func_step3): stray "$" before 이므로 inside \[..\]; move 이므로 outside
  {
    keys: [
      "지수함수3단계/035.webp",
      "exp_func_step3/035.webp",
      "exp_func_step3/035.png",
    ],
    replaces: [
      ["= a^{-\\frac{1}{a}}$ 이므로 \\]", "= a^{-\\frac{1}{a}} \\] 이므로"],
      ["따라서 옳은 것은 ㄱ, ㄴ이다.$", "따라서 옳은 것은 ㄱ, ㄴ이다."],
    ],
  },

  // 039 (지수함수3단계 / exp_func_step3): trailing stray "$" after the ①②③④ legend
  {
    keys: [
      "지수함수3단계/039.webp",
      "exp_func_step3/039.webp",
      "exp_func_step3/039.png",
    ],
    replaces: [
      ["$\\therefore a+b = \\frac{5}{6}$ ① ② ③ ④$", "$\\therefore a+b = \\frac{5}{6}$ ① ② ③ ④"],
    ],
  },
];
