// calc_deriv — KaTeX repairs for 미적분 도함수의 활용 + 미분 units.
// Reconstructed from original images (public/math_crops/미적분/..., public/math_crops/(7)수학2/...).
// Corruption classes: \\frac(\\f+rac), \\root->\\sqrt(\\r+oot), \\bigg(\\b+igg),
//   \\lnx/\\sinx/\\cosx/\\sint/\\cost -> spaced, \\text{√}/\\text{π} -> \\sqrt/\\pi,
//   tabular->array (KaTeX has no tabular; inner $ stripped), tikzpicture -> "(그래프 생략)",
//   align* split by stray $$ -> single $$\\begin{aligned}...$$.
// FIND strings contain literal control bytes (formfeed/CR/backspace) preserved exactly via JSON.stringify.
module.exports = [
  {
    "keys": [
      "6)도함수의활용1/005.webp"
    ],
    "replaces": [
      [
        "(1, \\\frac{1}{e})",
        "(1, \\frac{1}{e})"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/014.webp"
    ],
    "replaces": [
      [
        "y=a \\lnx",
        "y=a \\ln x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/015.webp"
    ],
    "replaces": [
      [
        "f(x) = \\sinx",
        "f(x) = \\sin x"
      ],
      [
        "\\frac{\\text{√}2}{2} x - \\frac{\\text{√}2}{8} \\text{π} + \\frac{\\text{√}2}{2}",
        "\\frac{\\sqrt{2}}{2} x - \\frac{\\sqrt{2}}{8} \\pi + \\frac{\\sqrt{2}}{2}"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/022.webp"
    ],
    "replaces": [
      [
        "f(x) = a \\lnx + x^2 - 4x",
        "f(x) = a \\ln x + x^2 - 4x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/024.webp"
    ],
    "replaces": [
      [
        "f(x) = ax - \\lnx",
        "f(x) = ax - \\ln x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/026.webp"
    ],
    "replaces": [
      [
        "f(x) = x \\sinx + \\cosx",
        "f(x) = x \\sin x + \\cos x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/028.webp"
    ],
    "replaces": [
      [
        "f(x) = \\\frac{ax^2 + 2x + b}{x^2 + 1}",
        "f(x) = \\frac{ax^2 + 2x + b}{x^2 + 1}"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/037.webp"
    ],
    "replaces": [
      [
        "y = \\\frac{1}{x^2 + 9}",
        "y = \\frac{1}{x^2 + 9}"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/038.webp"
    ],
    "replaces": [
      [
        "y = \\\frac{1}{x^2 + 1}",
        "y = \\frac{1}{x^2 + 1}"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/039.webp"
    ],
    "replaces": [
      [
        "\\\frac{S_2}{S_1}",
        "\\frac{S_2}{S_1}"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/041.webp"
    ],
    "replaces": [
      [
        "a \\sin x + b \\cos x + c $$",
        "a \\sin x + b \\cos x + cx $$"
      ],
      [
        "\bigg( \\frac{\\text{π}}{2}, -\\frac{\\text{π}}{2} \bigg)",
        "\\bigg( \\frac{\\pi}{2}, -\\frac{\\pi}{2} \\bigg)"
      ],
      [
        "x = \\frac{\\text{π}}{3}",
        "x = \\frac{\\pi}{3}"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/042.webp"
    ],
    "replaces": [
      [
        "f(x) = x^2 + ax - b \\lnx",
        "f(x) = x^2 + ax - b \\ln x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/043.webp"
    ],
    "replaces": [
      [
        "\\frac{a}{\root{2}} x^2 + \root{2} \\sinx",
        "\\frac{a}{\\sqrt{2}} x^2 + \\sqrt{2} \\sin x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/047.webp"
    ],
    "replaces": [
      [
        "f(x) = x + \\cosx",
        "f(x) = x + \\cos x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/048.webp"
    ],
    "replaces": [
      [
        "f(x) = x - \\sinx",
        "f(x) = x - \\sin x"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/056.webp"
    ],
    "replaces": [
      [
        "y = \\cosx + |\\sinx| - 3",
        "y = \\cos x + |\\sin x| - 3"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/058.webp"
    ],
    "replaces": [
      [
        "f(x) = x \\lnx - 2x + k",
        "f(x) = x \\ln x - 2x + k"
      ]
    ]
  },
  {
    "keys": [
      "6)도함수의활용1/063.webp"
    ],
    "replaces": [
      [
        "0 < t < \\\frac{3}{2}",
        "0 < t < \\frac{3}{2}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용1 2단계/016.webp"
    ],
    "replaces": [
      [
        "$\\\frac{a}{c}$",
        "$\\frac{a}{c}$"
      ]
    ]
  },
  {
    "keys": [
      "7)도함수의활용2/003.webp"
    ],
    "replaces": [
      [
        "e^{2x} = \\\frac{2}{\root{e}} x + k",
        "e^{2x} = \\frac{2}{\\sqrt{e}} x + k"
      ]
    ]
  },
  {
    "keys": [
      "7)도함수의활용2/004.webp"
    ],
    "replaces": [
      [
        "\\sinx + k\\cosx \\leq k",
        "\\sin x + k\\cos x \\leq k"
      ]
    ]
  },
  {
    "keys": [
      "7)도함수의활용2/020.webp"
    ],
    "replaces": [
      [
        "x = at^2 - a \\sint, \\, y = t - a \\cost",
        "x = at^2 - a \\sin t, \\, y = t - a \\cos t"
      ]
    ]
  },
  {
    "keys": [
      "7)도함수의활용2/031.webp"
    ],
    "replaces": [
      [
        "100 \\\frac{m}{s}",
        "100 \\frac{m}{s}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용1 2단계/040a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $-1$ & $\\cdots$ & $3$ & $\\cdots$ \\\\\n\\hline\n$f'(x)$ & $+$ & $0$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$f(x)$ & $\\nearrow$ & $9$ & $\\searrow$ & $-23$ & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & \\cdots & -1 & \\cdots & 3 & \\cdots \\\\\n\\hline\nf'(x) & + & 0 & - & 0 & + \\\\\n\\hline\nf(x) & \\nearrow & 9 & \\searrow & -23 & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용1 2단계/053a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $1$ & $\\cdots$ & $3$ & $\\cdots$ \\\\\n\\hline\n$f'(x)$ & $+$ & $0$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$f(x)$ & $\\nearrow$ & \\text{극대} & $\\searrow$ & \\text{극소} & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & \\cdots & 1 & \\cdots & 3 & \\cdots \\\\\n\\hline\nf'(x) & + & 0 & - & 0 & + \\\\\n\\hline\nf(x) & \\nearrow & \\text{극대} & \\searrow & \\text{극소} & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용1 2단계/054a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c||c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $1$ & $\\cdots$ \\\\\n\\hline\n$f'(x)$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$f(x)$ & $\\searrow$ & \\text{극소} & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c||c|c|c|}\n\\hline\nx & \\cdots & 1 & \\cdots \\\\\n\\hline\nf'(x) & - & 0 & + \\\\\n\\hline\nf(x) & \\searrow & \\text{극소} & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용1 2단계/056a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $0$ & $\\cdots$ & $3$ & $\\cdots$ \\\\\n\\hline\n$h'(x)$ & $-$ & $0$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$h(x)$ & $\\searrow$ & & $\\searrow$ & 극소 & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & \\cdots & 0 & \\cdots & 3 & \\cdots \\\\\n\\hline\nh'(x) & - & 0 & - & 0 & + \\\\\n\\hline\nh(x) & \\searrow & & \\searrow & 극소 & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의활용2 2단계/028a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $-1$ & $\\cdots$ & $(0)$ \\\\\n\\hline\n$f'(x)$ & $-$ & $0$ & $+$ & \\\\\n\\hline\n$f(x)$ & $\\searrow$ & $3$ & $\\nearrow$ & \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|}\n\\hline\nx & \\cdots & -1 & \\cdots & (0) \\\\\n\\hline\nf'(x) & - & 0 & + & \\\\\n\\hline\nf(x) & \\searrow & 3 & \\nearrow & \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의활용3단계/004a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $0$ & $\\cdots$ & $1$ & $\\cdots$ & $3$ \\\\\n\\hline\n$f'(x)$ & & $+$ & $0$ & $-$ & $0$ \\\\\n\\hline\n$f(x)$ & $a$ & $\\nearrow$ & $a+4$ & $\\searrow$ & $a$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & 0 & \\cdots & 1 & \\cdots & 3 \\\\\n\\hline\nf'(x) & & + & 0 & - & 0 \\\\\n\\hline\nf(x) & a & \\nearrow & a+4 & \\searrow & a \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의활용3단계/005a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c||c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $-1$ & $\\cdots$ & $2$ & $\\cdots$ \\\\\n\\hline\n$f'(x)$ & $+$ & $0$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$f(x)$ & $\\nearrow$ & 극대 & $\\searrow$ & 극소 & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c||c|c|c|c|c|}\n\\hline\nx & \\cdots & -1 & \\cdots & 2 & \\cdots \\\\\n\\hline\nf'(x) & + & 0 & - & 0 & + \\\\\n\\hline\nf(x) & \\nearrow & 극대 & \\searrow & 극소 & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용 4단계/034a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c||c|c|c|c|c|}\n\\hline\n$a$ & (0) & $\\cdots$ & 2 & $\\cdots$ & (6) \\\\\n\\hline\n$g'(a)$ & & $-$ & 0 & $+$ & \\\\\n\\hline\n$g(a)$ & & $\\searrow$ & $-48$ & $\\nearrow$ & \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c||c|c|c|c|c|}\n\\hline\na & (0) & \\cdots & 2 & \\cdots & (6) \\\\\n\\hline\ng'(a) & & - & 0 & + & \\\\\n\\hline\ng(a) & & \\searrow & -48 & \\nearrow & \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용 4단계/050a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $1$ & $\\cdots$ & $3$ & $\\cdots$ \\\\\n\\hline\n$f'(x)$ & $+$ & $0$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$f(x)$ & $\\nearrow$ & $k+4$ & $\\searrow$ & $k$ & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & \\cdots & 1 & \\cdots & 3 & \\cdots \\\\\n\\hline\nf'(x) & + & 0 & - & 0 & + \\\\\n\\hline\nf(x) & \\nearrow & k+4 & \\searrow & k & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용 4단계/053a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $\\cdots$ & $\\frac{4}{3}$ & $\\cdots$ & $6$ & $\\cdots$ \\\\\n\\hline\n$f'(x)$ & $+$ & $0$ & $-$ & $0$ & $+$ \\\\\n\\hline\n$f(x)$ & $\\nearrow$ & 극대 & $\\searrow$ & 극소 & $\\nearrow$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & \\cdots & \\frac{4}{3} & \\cdots & 6 & \\cdots \\\\\n\\hline\nf'(x) & + & 0 & - & 0 & + \\\\\n\\hline\nf(x) & \\nearrow & 극대 & \\searrow & 극소 & \\nearrow \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "미분의활용 2단계/temp_005a.webp"
    ],
    "replaces": [
      [
        "\\begin{tabular}{|c|c|c|c|c|c|}\n\\hline\n$x$ & $0$ & $\\cdots$ & $1$ & $\\cdots$ & $5$ \\\\\n\\hline\n$f'(x)$ & & $+$ & $0$ & $-$ & \\\\\n\\hline\n$f(x)$ & $a$ & $\\nearrow$ & $a+7$ & $\\searrow$ & $a-25$ \\\\\n\\hline\n\\end{tabular}",
        "\\begin{array}{|c|c|c|c|c|c|}\n\\hline\nx & 0 & \\cdots & 1 & \\cdots & 5 \\\\\n\\hline\nf'(x) & & + & 0 & - & \\\\\n\\hline\nf(x) & a & \\nearrow & a+7 & \\searrow & a-25 \\\\\n\\hline\n\\end{array}"
      ]
    ]
  },
  {
    "keys": [
      "도함수의 활용 4단계/020a.webp"
    ],
    "replaces": [
      [
        "$$\n\\begin{tikzpicture}\n\\draw[->] (-3,0) -- (3,0) node[right] {$x$};\n\\draw[->] (0,-3) -- (0,3) node[above] {$y=f(x)$};\n\\node at (0,0) [below left] {O};\n\\draw[line width=0.8pt] (-2,2.5) .. controls (-1.5,0.5) and (-0.5,-0.5) .. (0,0) .. controls (0.5,0.5) and (1.5,-0.5) .. (2,-2.5);\n\\draw[line width=0.8pt] (0,0) .. controls (0.5,-0.5) and (1.5,0.5) .. (2,2.5);\n\\draw[line width=0.8pt] (0,0) .. controls (-0.5,0.5) and (-1.5,-0.5) .. (-2,-2.5);\n\\end{tikzpicture}\n$$",
        "(그래프 생략)"
      ],
      [
        "$$\n\\begin{tikzpicture}\n\\draw[->] (-3,0) -- (3,0) node[right] {$x$};\n\\draw[->] (0,-3) -- (0,3) node[above] {$y=f(x)$};\n\\node at (0,0) [below left] {O};\n\\node at (1.5,0) [below right] {$a$};\n\\draw[line width=0.8pt] (-2.5,2.5) .. controls (-1,2) and (-1.5,0) .. (0,0) .. controls (1.5,0) and (1,-2) .. (2.5,-2.5);\n\\draw[line width=0.8pt] (-1.5,0) arc (180:0:1.5) ;\n\\end{tikzpicture}\n$$",
        "(그래프 생략)"
      ],
      [
        "$$\n\\begin{tikzpicture}\n\\draw[->] (-3,0) -- (3,0) node[right] {$x$};\n\\draw[->] (0,-3) -- (0,3) node[above] {$y=f(x)$};\n\\node at (0,0) [below left] {O};\n\\node at (1,0) [below left] {$\\alpha$};\n\\node at (2,0) [below right] {$8$};\n\\draw[line width=0.8pt] (-2.5,2.5) .. controls (-1,2) and (-1.5,0) .. (0,0) .. controls (1.5,0) and (1,-2) .. (2.5,-2.5);\n\\draw[line width=0.8pt] (-1,0) arc (180:0:1) ;\n\\draw[line width=0.8pt] (0,2) -- (2,-2);\n\\draw[line width=0.8pt] (0,-2) -- (-2,2);\n\\draw[line width=0.8pt] (2,-2) -- (2.5,2.5);\n\\draw[line width=0.8pt] (-2,2) -- (-2.5,-2.5);\n\\draw[line width=0.8pt] (0,2) -- (2.5,2.5);\n\\draw[line width=0.8pt] (0,-2) -- (-2.5,-2.5);\n\\end{tikzpicture}\n$$",
        "(그래프 생략)"
      ]
    ]
  },
  {
    "keys": [
      "미분계수 2단계/018a.webp"
    ],
    "value": "$$\\begin{aligned} \\lim_{x \\to 1} \\frac{\\{f(x)\\}^2 - 1}{x-1} &= \\lim_{x \\to 1} \\frac{\\{f(x)\\}^2 - \\{f(1)\\}^2}{x-1} \\quad (\\because f(1)=1) \\\\ &= \\lim_{x \\to 1} \\frac{f(x) - f(1)}{x-1} \\times \\{f(x) + f(1)\\} \\\\ &= f'(1) \\times 2f(1) = 3 \\times 2 \\times 1 = 6 \\end{aligned}$$"
  }
];
