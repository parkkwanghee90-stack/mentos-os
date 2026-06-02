// Unbalanced single-$ repairs for point-coord / line-eq / linear-ineq / 인수분해 units.
// All crops in public/math_crops/<unit>/*.webp for these are 34-byte blank placeholders
// EXCEPT (003)인수분해/3단계/004*.webp (verified against the printed image).
// Fixes are STRUCTURE-only: drop a stray `$` inside \text{① $}, drop a trailing stray `$`
// after a final \], or add a missing closing `$`. Korean text / ①②③④⑤ markers preserved.

module.exports = [
  // point_coord_step2 / (5)점과좌표 개념2단계 017a:
  //   \text{① $} -> \text{①} (stray $) ; final \]$ -> \] (trailing stray $)
  { keys: [
      "point_coord_step2/017a.webp", "point_coord_step2/017a.png",
      "(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/017a.webp",
    ],
    replaces: [
      ["\\quad \\cdots \\text{① $} \\]", "\\quad \\cdots \\text{①} \\]"],
      ["\\therefore ab = 24 \\]$", "\\therefore ab = 24 \\]"],
    ] },

  // point_coord_step3 / 점과좌표3단계 002a:
  //   missing closing $ before \[  (...= \overline{CA}^2\[ -> ...= \overline{CA}^2$ \[)
  { keys: [
      "point_coord_step3/002a.webp", "point_coord_step3/002a.png",
      "점과좌표3단계/002a.webp",
    ],
    replaces: [
      ["\\overline{CA}^2\\[ \\overline{AB}^2", "\\overline{CA}^2$ \\[ \\overline{AB}^2"],
    ] },

  // point_coord_step3 / 점과좌표3단계 004a:
  //   stray $ before \(  (① $\(\overline{BC}\) -> ① \(\overline{BC}\)) ; missing closing $ at end
  { keys: [
      "point_coord_step3/004a.webp", "point_coord_step3/004a.png",
      "점과좌표3단계/004a.webp",
    ],
    replaces: [
      ["…… ① $\\(\\overline{BC}\\)", "…… ① \\(\\overline{BC}\\)"],
      ["∴ $a + b = 7", "∴ $a + b = 7$"],
    ] },

  // point_coord_step4 / 점과좌표4단계 013a:
  //   trailing stray $ after final \]  (...10이다.$ -> ...10이다.)
  { keys: [
      "point_coord_step4/013a.webp", "point_coord_step4/013a.png",
      "점과좌표4단계/013a.webp",
    ],
    replaces: [
      ["수의 합은 10이다.$", "수의 합은 10이다."],
    ] },

  // point_coord_step4 / 점과좌표4단계 016a:
  //   missing closing $ at end  (∴ $3x-y+7=0 -> ∴ $3x-y+7=0$)
  { keys: [
      "point_coord_step4/016a.webp", "point_coord_step4/016a.png",
      "점과좌표4단계/016a.webp",
    ],
    replaces: [
      ["∴ $3x-y+7=0", "∴ $3x-y+7=0$"],
    ] },

  // line_eq_step4 / 직선의방정식4단계 011a:
  //   \text{① $} -> \text{①} (stray $) ; final \]$ -> \] (trailing stray $)
  { keys: [
      "line_eq_step4/011a.webp", "line_eq_step4/011a.png",
      "직선의방정식4단계/011a.webp",
    ],
    replaces: [
      ["\\quad \\cdots \\text{① $}\\]", "\\quad \\cdots \\text{①}\\]"],
      ["64 \\times \\frac{5}{16} = 20\\]$", "64 \\times \\frac{5}{16} = 20\\]"],
    ] },

  // line_eq_step4 / 직선의방정식4단계 034a:
  //   missing closing $ at end  ($a + b = 3 -> $a + b = 3$)
  { keys: [
      "line_eq_step4/034a.webp", "line_eq_step4/034a.png",
      "직선의방정식4단계/034a.webp",
    ],
    replaces: [
      ["이므로 $a + b = 3", "이므로 $a + b = 3$"],
    ] },

  // linear_ineq_step2 / 일차부등식2단계 005a:
  //   \text{① $} -> \text{①} (stray $) ; missing closing $ at end ($2bx > -b -> $2bx > -b$)
  { keys: [
      "linear_ineq_step2/005a.webp", "linear_ineq_step2/005a.png",
      "일차부등식2단계/005a.webp",
    ],
    replaces: [
      ["\\quad \\cdots \\cdots \\text{① $} \\]", "\\quad \\cdots \\cdots \\text{①} \\]"],
      ["$2bx > -b", "$2bx > -b$"],
    ] },

  // linear_ineq_step4 / 일차부등식4단계 008a:
  //   missing closing $ at end ($\frac{3}{4} < x \leq 2 -> ...$)
  { keys: [
      "linear_ineq_step4/008a.webp", "linear_ineq_step4/008a.png",
      "일차부등식4단계/008a.webp",
    ],
    replaces: [
      ["$\\frac{3}{4} < x \\leq 2", "$\\frac{3}{4} < x \\leq 2$"],
    ] },

  // (003)인수분해3단계 004: option ⑤ missing closing $  ($a^2 + 2ab + b^2 = (a+b)^2 -> ...$)
  { keys: [
      "(003)인수분해3단계/004.webp", "(003)인수분해3단계/004.png",
    ],
    replaces: [
      ["⑤ $a^2 + 2ab + b^2 = (a+b)^2", "⑤ $a^2 + 2ab + b^2 = (a+b)^2$"],
    ] },
];
