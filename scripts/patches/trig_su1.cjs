// 삼각함수 (수학1) — KaTeX repairs reconstructed from ORIGINAL images
// public/math_crops/수학1 중간/{2단계,4단계}/{삼각함수활용2단계,삼각함수성질2단계,삼각함수그래프2단계,삼각함수그래프}/*.webp
// All verified against the printed solutions.
// Root corruptions: ①②③④⑤ markers left INSIDE $$...$$ (segmenter splits there and orphans the $$),
//   stray "$" inside \text{}, dangling trailing $$, $\text{π}$ inline, and \sin glued to its argument.

module.exports = [
  // 삼각함수활용2단계 054a — markers ①② were inside $$...$$ → move out as plain text
  { keys: ["삼각함수활용2단계/054a.webp", "trig_util_step2/054a.png", "trig_util_step2/054a.webp"],
    replaces: [
      ["$$= 18\\sqrt{3} + 36 \\quad \\cdots ①$$", "$$= 18\\sqrt{3} + 36 \\quad \\cdots$$ ①"],
      ["$$= \\frac{3\\sqrt{6}}{2}x + \\frac{3\\sqrt{2}}{2}x \\quad \\cdots ②$$", "$$= \\frac{3\\sqrt{6}}{2}x + \\frac{3\\sqrt{2}}{2}x \\quad \\cdots$$ ②"],
    ] },

  // 삼각함수성질2단계 008a — \text{① $} stray $ inside $$ → close $$ and put ① outside
  { keys: ["삼각함수성질2단계/008a.webp", "trig_prop_step2/008a.png", "trig_prop_step2/008a.webp"],
    replaces: [
      ["$$\\therefore \\theta = \\frac{n}{3}\\pi \\quad \\cdots \\; \\text{① $}$$", "$$\\therefore \\theta = \\frac{n}{3}\\pi \\quad \\cdots$$ ①"],
    ] },

  // 삼각함수성질2단계 016a — ① left inside $$ → move out
  { keys: ["삼각함수성질2단계/016a.webp", "trig_prop_step2/016a.png", "trig_prop_step2/016a.webp"],
    replaces: [
      ["$$\\therefore \\theta = \\frac{n}{5}\\pi + \\frac{\\pi}{20} \\quad \\cdots \\; ①$$", "$$\\therefore \\theta = \\frac{n}{5}\\pi + \\frac{\\pi}{20} \\quad \\cdots$$ ①"],
    ] },

  // 삼각함수그래프2단계 018a — inline $\text{π}$ → $\pi$
  { keys: ["삼각함수그래프2단계/018a.webp", "trig_graph_step2/018a.png", "trig_graph_step2/018a.webp"],
    replaces: [
      ["주기가 $\\text{π}$이므로", "주기가 $\\pi$이므로"],
    ] },

  // 삼각함수그래프2단계 031a — ①②③ inside $$ (+ stray $ in ①) and a dangling trailing $$
  { keys: ["삼각함수그래프2단계/031a.webp", "trig_graph_step2/031a.png", "trig_graph_step2/031a.webp"],
    replaces: [
      ["\\therefore \\alpha + \\beta = \\frac{\\pi}{2} \\cdots \\text{① $}$$", "\\therefore \\alpha + \\beta = \\frac{\\pi}{2} \\cdots$$ ①"],
      ["\\therefore \\gamma + \\delta = \\frac{3}{2}\\pi \\cdots \\text{②}$$", "\\therefore \\gamma + \\delta = \\frac{3}{2}\\pi \\cdots$$ ②"],
      ["\\therefore \\alpha + \\delta = \\pi \\cdots \\text{③}$$", "\\therefore \\alpha + \\delta = \\pi \\cdots$$ ③"],
      ["$$= \\frac{\\pi}{2} + \\frac{3}{2}\\pi + \\pi = 3\\pi$$ ①, ②, ③에서$$", "$$= \\frac{\\pi}{2} + \\frac{3}{2}\\pi + \\pi = 3\\pi$$"],
    ] },

  // 삼각함수그래프2단계 087a — heavily mangled (stray $ scattered); wholesale rebuild from image
  { keys: ["삼각함수그래프2단계/087a.webp", "trig_graph_step2/087a.png", "trig_graph_step2/087a.webp"],
    value:
      "해설 $\\tan^2 x + (\\sqrt{3} - 1) \\tan x < \\sqrt{3}$ 에서 $\\tan^2 x + (\\sqrt{3} - 1) \\tan x - \\sqrt{3} < 0$ $\\tan x = t$ 로 놓으면 $$t^2 + (\\sqrt{3} - 1)t - \\sqrt{3} < 0$$ $$(t + \\sqrt{3})(t - 1) < 0$$ $$\\therefore -\\sqrt{3} < t < 1$$ 즉, $-\\sqrt{3} < \\tan x < 1$ $0 \\leq x < \\pi$ 에서 함수 $y = \\tan x$ 의 그래프와 두 직선 $y = -\\sqrt{3}$, $y = 1$ 의 교점의 $x$ 좌표를 구하면 각각 $\\frac{2}{3}\\pi, \\frac{\\pi}{4}$ 따라서 주어진 부등식의 해는 $$0 \\leq x < \\frac{\\pi}{4}$$ 또는 $$\\frac{2}{3}\\pi < x < \\pi$$ $$\\therefore A = \\left\\{ x \\mid 0 \\leq x < \\frac{\\pi}{4} \\text{ 또는 } \\frac{2}{3}\\pi < x < \\pi \\right\\}$$ 이때 $\\frac{\\pi}{4} \\notin A$ 이므로 집합 $A$의 원소가 아닌 것은 ③이다."
  },

  // 삼각함수그래프 061a — \sin glued to argument
  { keys: ["삼각함수그래프/061a.webp"],
    replaces: [
      ["y = \\sinnx", "y = \\sin nx"],
      ["y = \\sin2x", "y = \\sin 2x"],
      ["$\\sin2x = \\frac{1}{5}$", "$\\sin 2x = \\frac{1}{5}$"],
      ["y = \\sin5x", "y = \\sin 5x"],
      ["$\\sin5x = \\frac{1}{5}$", "$\\sin 5x = \\frac{1}{5}$"],
    ] },

  // 삼각함수그래프 066a — \sin glued to x
  { keys: ["삼각함수그래프/066a.webp"],
    replaces: [
      ["= 2(1 - \\sin^2x) + \\sinx - 2", "= 2(1 - \\sin^2 x) + \\sin x - 2"],
      ["= -2\\sin^2x + \\sinx", "= -2\\sin^2 x + \\sin x"],
      ["= -\\sinx(2\\sinx - 1) = 0", "= -\\sin x(2\\sin x - 1) = 0"],
      ["\\sinx = 0 \\text{ 또는 } \\sinx = \\frac{1}{2}", "\\sin x = 0 \\text{ 또는 } \\sin x = \\frac{1}{2}"],
      ["\\sinx = 0 \\text{에서 } x = \\text{π}", "\\sin x = 0 \\text{에서 } x = \\text{π}"],
      ["\\sinx = \\frac{1}{2} \\text{에서 }", "\\sin x = \\frac{1}{2} \\text{에서 }"],
    ] },

  // 삼각함수그래프 133 — \sin glued to x
  { keys: ["삼각함수그래프/133.webp"],
    replaces: [
      ["y = \\sinx - \\frac{1}{2}", "y = \\sin x - \\frac{1}{2}"],
    ] },
];
