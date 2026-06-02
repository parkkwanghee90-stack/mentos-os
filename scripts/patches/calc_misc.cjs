// calc_misc — KaTeX repairs for 미적분 2단계/4단계 residual corruption.
// Reconstructed from ORIGINAL images under public/math_crops/미적분/{2단계,4단계}/...
// Corruption patterns observed:
//   "\\\f" + "rac"  = backslash + FORMFEED(0x0C) + "rac"  -> "\\frac"
//   "\bigg"         = backslash-looking but actually BACKSPACE(0x08) + "igg" -> "\\bigg"
//   "\sinx"/"\cosx"/"\lnx" -> "\sin x"/"\cos x"/"\ln x"
//   "\text{∞}" -> "\infty" ; "\text{√}3" -> "\sqrt{3}" ; "$$$" -> "$$"
// NOTE: in JS source, "\f" IS the form-feed char and "\b" IS the backspace char,
//       so the find-strings below match the stored control bytes exactly.
const FF = "\f";   // form-feed 0x0C  (the corrupted "\frac" carrier)
const BS = "\b";   // backspace 0x08  (the corrupted "\bigg" carrier)

module.exports = [
  // ── 4)삼각함수합성과미분 ──────────────────────────────────────────────
  // 003: $$$ -> $$ (×2 open/close), \text{√}3 -> \sqrt{3}
  { keys: ["4)삼각함수합성과미분/003.webp"], replaces: [
    ["\n$$$\\begin{align*}", "\n$$\\begin{align*}"],
    ["\\end{align*}$$$", "\\end{align*}$$"],
    ["\\frac{1}{\\text{√}3}", "\\frac{1}{\\sqrt{3}}"],
  ]},
  // 009: \sinx \cosx -> \sin x \cos x
  { keys: ["4)삼각함수합성과미분/009.webp"], replaces: [
    ["f(x) = \\sinx \\cosx", "f(x) = \\sin x \\cos x"],
  ]},
  // 011: 2\cosx -> 2\cos x ; n\sinx -> n\sin x
  { keys: ["4)삼각함수합성과미분/011.webp"], replaces: [
    ["f(x)=2\\cosx", "f(x)=2\\cos x"],
    ["g(x)=n\\sinx", "g(x)=n\\sin x"],
  ]},
  // 016: \text{∞} -> \infty ; backspace-bigg -> \bigg (×2)
  { keys: ["4)삼각함수합성과미분/016.webp"], replaces: [
    ["\\lim_{x \\to \\text{∞}} " + BS + "igg( 1 + \\sin \\frac{1}{x} " + BS + "igg)^{x}",
     "\\lim_{x \\to \\infty} \\bigg( 1 + \\sin \\frac{1}{x} \\bigg)^{x}"],
  ]},
  // 022: tangled (stray $, \text wrappers). Wholesale.
  { keys: ["4)삼각함수합성과미분/022.webp"], value:
    "이 문제에서 찾아야 할 핵심을 살펴봅시다.\n$$ f(x) = e^x - 1, \\quad g(x) = \\sin x $$ 일 때, 극한값이 존재하는 것을 찾아야 합니다." },
  // 023: backspace-bigg -> \bigg (×2)
  { keys: ["4)삼각함수합성과미분/023.webp"], replaces: [
    ["\\lim_{\\theta \\to 0} " + BS + "igg( \\frac{2}{\\sin^2 \\theta} - \\frac{1}{1 - \\cos \\theta} " + BS + "igg)",
     "\\lim_{\\theta \\to 0} \\bigg( \\frac{2}{\\sin^2 \\theta} - \\frac{1}{1 - \\cos \\theta} \\bigg)"],
  ]},
  // 028: \cosx -> \cos x ; backspace-bigg -> \bigg (×2)
  { keys: ["4)삼각함수합성과미분/028.webp"], replaces: [
    ["(1 - \\cosx)f(x)", "(1 - \\cos x)f(x)"],
    ["\\ln" + BS + "igg(1 + \\frac{1}{2}x" + BS + "igg)", "\\ln\\bigg(1 + \\frac{1}{2}x\\bigg)"],
  ]},
  // 031: tangled (stray single $, \text wrappers, \theta_{APO}). Wholesale.
  // image: ∠APO=α, ∠BPA=β, lim_{k→∞} α/β, points A(1,0) B(3,0) P(0,k)
  { keys: ["4)삼각함수합성과미분/031.webp"], value:
    "이 문제에서 찾아야 할 핵심을 살펴봅시다.\n$$ \\text{세 점 } A(1, 0),\\ B(3, 0),\\ P(0, k) \\text{ 에 대하여 } \\angle APO = \\alpha,\\ \\angle BPA = \\beta \\text{ 일 때, } \\lim_{k \\to \\infty} \\frac{\\alpha}{\\beta} \\text{ 의 값을 구해야 합니다.} $$" },

  // ── 5)여러가지미분법2 ─────────────────────────────────────────────────
  // 003: \<FF>rac -> \frac (×2)
  { keys: ["5)여러가지미분법2/003.webp"], replaces: [
    ["\\" + FF + "rac{1}{x^2} + \\" + FF + "rac{2x}{x^2 + 1}", "\\frac{1}{x^2} + \\frac{2x}{x^2 + 1}"],
  ]},
  // 008: \lnx -> \ln x
  { keys: ["5)여러가지미분법2/008.webp"], replaces: [
    ["y = \\log_2(\\lnx^2)", "y = \\log_2(\\ln x^2)"],
  ]},
  // 015: \lnx -> \ln x
  { keys: ["5)여러가지미분법2/015.webp"], replaces: [
    ["y = \\lnx", "y = \\ln x"],
  ]},
  // 016: backspace-bigg -> \bigg (×4)
  { keys: ["5)여러가지미분법2/016.webp"], replaces: [
    ["f" + BS + "igg(\\frac{\\text{π}}{2}+h" + BS + "igg)-f" + BS + "igg(\\frac{\\text{π}}{2}-h" + BS + "igg)",
     "f\\bigg(\\frac{\\pi}{2}+h\\bigg)-f\\bigg(\\frac{\\pi}{2}-h\\bigg)"],
  ]},
  // 019: tangled (stray $, \text{ln(lnx)}). Wholesale.
  { keys: ["5)여러가지미분법2/019.webp"], value:
    "이 문제에서 찾아야 할 핵심을 살펴봅시다.\n$$ f(x) = \\ln(\\ln x) \\text{ 일 때, } \\lim_{h \\to 0} \\frac{f(e+h) - f(e-h)}{h} \\text{ 의 값을 구해야 합니다.} $$" },
  // 020: \sinx -> \sin x ; \text{π} -> \pi (×2)
  { keys: ["5)여러가지미분법2/020.webp"], replaces: [
    ["f(x) = x \\ln(\\sinx)", "f(x) = x \\ln(\\sin x)"],
    ["\\lim_{x \\to \\frac{\\text{π}}{4}} \\frac{f'(x) - a}{x - \\frac{\\text{π}}{4}}",
     "\\lim_{x \\to \\frac{\\pi}{4}} \\frac{f'(x) - a}{x - \\frac{\\pi}{4}}"],
  ]},

  // ── 3)지수로그함수의극한 ──────────────────────────────────────────────
  // 011: \<FF>rac -> \frac
  { keys: ["3)지수로그함수의극한/011.webp"], replaces: [
    ["\\" + FF + "rac{e^{7x} + e^{4x} + e^{x} - 3}{x}", "\\frac{e^{7x} + e^{4x} + e^{x} - 3}{x}"],
  ]},
  // 027: extra trailing } after \frac{b}{x}
  { keys: ["3)지수로그함수의극한/027.webp"], replaces: [
    ["\\frac{(1 + ax)^{\\frac{b}{x}}}", "(1 + ax)^{\\frac{b}{x}}"],
  ]},
  // 032: \lnx -> \ln x
  { keys: ["3)지수로그함수의극한/032.webp"], replaces: [
    ["f(x)=(2x-1)\\lnx", "f(x)=(2x-1)\\ln x"],
  ]},
  // 037: \<FF>rac -> \frac
  { keys: ["3)지수로그함수의극한/037.webp"], replaces: [
    ["\\tan 2\\theta = \\" + FF + "rac{5}{12}", "\\tan 2\\theta = \\frac{5}{12}"],
  ]},

  // ── 7)여러가지적분 ────────────────────────────────────────────────────
  // 016: backspace-bigg -> \bigg (×2)
  { keys: ["7)여러가지적분/016.webp"], replaces: [
    ["\\frac{d^n}{dx^n} " + BS + "igg( x^n e^x " + BS + "igg)", "\\frac{d^n}{dx^n} \\bigg( x^n e^x \\bigg)"],
  ]},
  // 018: \lnx -> \ln x
  { keys: ["7)여러가지적분/018.webp"], replaces: [
    ["f'(x)=(x-2)\\lnx", "f'(x)=(x-2)\\ln x"],
  ]},

  // ── 6)여러가지 함수의 적분4단계 ───────────────────────────────────────
  // 001: \<FF>rac -> \frac
  { keys: ["6)여러가지 함수의 적분4단계/001.webp"], replaces: [
    ["f'(x) = 2 - \\" + FF + "rac{3}{x^2}", "f'(x) = 2 - \\frac{3}{x^2}"],
  ]},

  // ── 7)정적분의 활용 4단계 ─────────────────────────────────────────────
  // 003: \<FF>rac -> \frac
  { keys: ["7)정적분의 활용 4단계/003.webp"], replaces: [
    ["f(x) = \\" + FF + "rac{4x^2}{x^2+3}", "f(x) = \\frac{4x^2}{x^2+3}"],
  ]},
];
