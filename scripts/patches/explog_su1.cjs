// explog_su1 — KaTeX repairs for 로그함수2단계 / log_func_step2 / log_func_step4 /
// 지수로그4단계 / explog_step4 / 지수로그함수4단계, reconstructed from original images
// (public/math_crops/수학1 중간/*/*.webp). Verified against the printed solutions.
module.exports = [
  // 083a: stray "$" left inside \text{} after the ㉠ circle label
  { keys: [
      "로그함수2단계/083a.webp",
      "log_func_step2/083a.png",
      "log_func_step2/083a.webp",
    ],
    replaces: [
      ["\\cdots \\bigcirc \\text{① $}", "\\cdots \\bigcirc"],
    ]},

  // 025a: stray "$" left inside \text{} after the ① label (same corruption)
  { keys: [
      "log_func_step4/025a.png",
      "log_func_step4/025a.webp",
      "지수로그함수4단계/025a.webp",
    ],
    replaces: [
      ["= 60 \\quad \\cdots \\; \\text{① $}", "= 60 \\quad \\cdots \\;"],
    ]},

  // 006a: \sqrt[n]\big{8} / \sqrt[2n]\big{8} -> \sqrt[n]{8} / \sqrt[2n]{8}
  { keys: [
      "지수로그4단계/006a.webp",
      "explog_step4/006a.png",
      "explog_step4/006a.webp",
    ],
    replaces: [
      ["\\sqrt[n]\\big{8}", "\\sqrt[n]{8}"],
      ["\\sqrt[2n]\\big{8}", "\\sqrt[2n]{8}"],
    ]},

  // 058a: mismatched \left\{ ... \right. ... \right\} -> drop the stray \right.
  { keys: [
      "지수로그4단계/058a.webp",
      "explog_step4/058a.png",
      "explog_step4/058a.webp",
    ],
    replaces: [
      ["b^2 = a^k, \\right. a와", "b^2 = a^k, \\; a와"],
    ]},
];
