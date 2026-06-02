// 지수3단계 / exp_step3 — KaTeX repairs reconstructed from original images
// (public/math_crops/수학1 중간/3단계/지수3단계/*.webp). All verified against the printed solutions.
const k = (n) => [`exp_step3/${n}.png`, `exp_step3/${n}.webp`, `지수3단계/${n}.webp`];

module.exports = [
  // 006: f(n) = 2^{√(n+2) - √n}
  { keys: k('006'), replaces: [
    ["2\\sqrt[n+2] - \\sqrt[n]", "2^{\\sqrt{n+2} - \\sqrt{n}}"],
  ]},
  // 009: 6th/8th roots of fractions (missing braces)
  { keys: k('009'), replaces: [
    ["\\sqrt[6]\\frac{5^{n-1}}{2^m}", "\\sqrt[6]{\\frac{5^{n-1}}{2^m}}"],
    ["\\sqrt[8]\\frac{4^{n+1}}{3^{m-2}}", "\\sqrt[8]{\\frac{4^{n+1}}{3^{m-2}}}"],
  ]},
  // 014a: stray single-$ should be display $$
  { keys: k('014a'), replaces: [
    ["① $\\sqrt[3]{\\frac{n}{3}}$$", "① $$\\sqrt[3]{\\frac{n}{3}}$$"],
  ]},
  // 016a: terms were collapsed into one exponent; \root 8 \root 2 -> \sqrt[8]{2}
  { keys: k('016a'), replaces: [
    ["2^{\\frac{1}{4} + 2 + 2 - \\frac{1}{4}}", "2^{\\frac{1}{4}} + 2 + 2^{-\\frac{1}{4}}"],
    ["\\bigg(2^{\\frac{1}{8} + 2 - \\frac{1}{8}}\\bigg)^2", "\\bigg(2^{\\frac{1}{8}} + 2^{-\\frac{1}{8}}\\bigg)^2"],
    ["2^{\\frac{1}{8} + 2} = \\root 8 \\root 2 + \\frac{1}{\\root 8 \\root 2}", "2^{\\frac{1}{8}} + 2^{-\\frac{1}{8}} = \\sqrt[8]{2} + \\frac{1}{\\sqrt[8]{2}}"],
  ]},
  // 026a: \big{..\big} -> {..}; b is a NESTED radical ³√(⁴√8)
  { keys: k('026a'), replaces: [
    ["\\sqrt[4]\\big{2\\big}", "\\sqrt[4]{2}"],
    ["\\sqrt[3]\\big{8\\big}", "\\sqrt[3]{\\sqrt[4]{8}}"],
    ["\\sqrt[12]\\big{2^3\\big}", "\\sqrt[12]{2^3}"],
  ]},
  // 033: \sqrt[p]\sqrt[a^2] -> \sqrt[p]{a^2} (spurious 2nd \sqrt)
  { keys: k('033'), replaces: [
    ["\\sqrt[p]\\sqrt[a^2] = \\sqrt[q]\\sqrt[b^3] = \\sqrt[r]\\sqrt[c^6]", "\\sqrt[p]{a^2} = \\sqrt[q]{b^3} = \\sqrt[r]{c^6}"],
    ["\\sqrt[3]\\sqrt[abc]", "\\sqrt[3]{abc}"],
  ]},
  // 040: heavily mangled \frac{\root N \big{}} -> clean √N exponents (wholesale)
  { keys: k('040'), value:
    "해설 $f(1) = 2^{\\sqrt{3} - 1}$ $f(3) = 2^{\\sqrt{5} - \\sqrt{3}}$ $f(5) = 2^{\\sqrt{7} - \\sqrt{5}}$ $\\vdots$ $f(119) = 2^{\\sqrt{121} - \\sqrt{119}}$ 이므로 $f(1) \\times f(3) \\times f(5) \\times \\cdots \\times f(119)$ $= 2^{(\\sqrt{3} - 1) + (\\sqrt{5} - \\sqrt{3}) + \\cdots + (\\sqrt{121} - \\sqrt{119})}$ $= 2^{11 - 1} = 2^{10} = 1024$"
  },
];
