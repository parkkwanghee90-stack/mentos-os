// 지수2단계 / exp_step2 — 060 is the SAME problem as 지수3단계/033 (verified via image):
// \sqrt[p]\sqrt[a^2] -> \sqrt[p]{a^2} (spurious 2nd \sqrt).
const k = (n) => [`exp_step2/${n}.png`, `exp_step2/${n}.webp`, `지수2단계/${n}.webp`];
module.exports = [
  { keys: k('060'), replaces: [
    ["\\sqrt[p]\\sqrt[a^2]", "\\sqrt[p]{a^2}"],
    ["\\sqrt[q]\\sqrt[b^3]", "\\sqrt[q]{b^3}"],
    ["\\sqrt[r]\\sqrt[c^6]", "\\sqrt[r]{c^6}"],
    ["\\sqrt[3]\\sqrt[abc]", "\\sqrt[3]{abc}"],
  ]},
];
