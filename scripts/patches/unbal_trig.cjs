// 삼각함수 (trig graph) KaTeX repairs reconstructed from ORIGINAL images
// (public/math_crops/수학1 중간/{3단계,4단계}/삼각함수그래프*). Verified vs printed solutions.
// English/Korean/.png/.webp variants of the same number share the SAME corrected string.

module.exports = [
  // 020a: solution ends "∴ a = 576" — final inline $ never closed.
  { keys: [
      "삼각함수그래프3단계/020a.webp", "삼각함수그래프3단계/020a.png",
      "trig_graph_step3/020a.webp", "trig_graph_step3/020a.png",
    ],
    replaces: [
      ["$\\therefore a = 576", "$\\therefore a = 576$"],
    ],
  },

  // 053: multiple stray $ inside \text{} / between ㉠㉡㉢ markers. Markers are PLAIN text.
  { keys: [
      "삼각함수그래프3단계/053.webp", "삼각함수그래프3단계/053.png",
      "trig_graph_step3/053.webp", "trig_graph_step3/053.png",
    ],
    replaces: [
      // (1) \text{\n\n① $}  -> \text{ ① }  (stray $ + leading newlines inside text)
      ["\\text{\n\n① $}", "\\text{ ① }"],
      // (2) ①,$\n② $에서  -> ①, ②에서  (markers are plain text)
      ["①,$\n② $에서", "①, ②에서"],
      // (3) \frac{2}{7}\pi,$\n\;  -> \frac{2}{7}\pi, \;  (stray $ mid display block)
      ["\\frac{2}{7}\\pi,$\n\\;", "\\frac{2}{7}\\pi, \\;"],
      // (4) 또,\n③ $에서 $\cos...  -> 또, ③에서 $\cos...  (drop stray $에서 $ wrapper)
      ["또,\n③ $에서 $\\cos", "또, ③에서 $\\cos"],
      // (5) ...같다.$\n\[  -> ...같다.\n\[  (stray $ before display block)
      ["같다.$\n\\[", "같다.\n\\["],
      // (6) a\text{의 값을 ② $에 대입하면}  -> a\text{의 값을 ② 에 대입하면}
      ["a\\text{의 값을 ② $에 대입하면}", "a\\text{의 값을 ② 에 대입하면}"],
      // (7) trailing orphan $ at end of string (was pairing with the removed 같다.$ stray)
      ["\\text{이다.} \\]$", "\\text{이다.} \\]"],
    ],
  },

  // 114: trailing " ①$" is junk after final "10 + 6 = 16" (answer is ③, not ①).
  { keys: [
      "삼각함수그래프/114.webp", "삼각함수그래프/114.png",
      "trig_graph_step4/114.webp", "trig_graph_step4/114.png",
    ],
    replaces: [
      ["$10 + 6 = 16$ ①$", "$10 + 6 = 16$"],
    ],
  },
];
