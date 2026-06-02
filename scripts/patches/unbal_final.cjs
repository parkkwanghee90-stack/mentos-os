// Final 2 unbalanced-$ entries.
module.exports = [
  // 074a: two missing closing $ before \(, and a trailing stray $
  { keys: ["로그함수2단계/074a.webp"], replaces: [
    ["$x > -6\\(", "$x > -6$ \\("],
    ["\\leq 2\\( \\cdots \\text{②}", "\\leq 2$ \\( \\cdots \\text{②}"],
    ["8개이다.$", "8개이다."],
  ]},
  // 014a: final display block closed with single $ -> $$
  { keys: ["지수3단계/014a.webp", "exp_step3/014a.webp", "exp_step3/014a.png"], replaces: [
    ["= 6 - 2 \\cdot 10 + 15 = 1$", "= 6 - 2 \\cdot 10 + 15 = 1$$"],
  ]},
];
