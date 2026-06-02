// 좌표기하 (점과좌표 / 직선의방정식 / 원의방정식) + 이차방정식과이차함수 3단계
// KaTeX repairs. Coordinate-geometry crops (point_coord_step4/018, line_eq_step2/021,
// circle_eq_step2/023) are 34-byte blank placeholders, so those are STRUCTURAL-ONLY
// repairs: the math is self-consistent, only the $/$$ delimiters and circled-number
// placement were corrupted. The 이차함수 fixes (014, 040) are verified against the real
// crop images (parabola figures) — KaTeX cannot render \includegraphics / tikzpicture,
// so the figure blocks are stripped (the app renders the crop image separately).

module.exports = [
  // 점과좌표 4단계 018a: stray `$` inside \text{① $} (circled number must be plain text
  // OUTSIDE math), and the final display block closed with a single `$` instead of `$$`.
  { keys: [
      "점과좌표4단계/018a.webp",
      "point_coord_step4/018a.png",
      "point_coord_step4/018a.webp",
    ],
    replaces: [
      ["\\quad \\cdots \\; \\text{① $}$$", "\\quad \\cdots$$ ①"],
      ["\\quad \\cdots \\; \\text{②}$$", "\\quad \\cdots$$ ②"],
      ["6x - 3y + 4 = 0$", "6x - 3y + 4 = 0$$"],
    ] },

  // 직선의방정식 개념2단계 021a: circled numbers ①② sat INSIDE the $$ display blocks,
  // which broke $$ pairing once the segmenter split on ①. Move them outside the math.
  { keys: [
      "(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)/021a.webp",
      "line_eq_step2/021a.png",
      "line_eq_step2/021a.webp",
    ],
    replaces: [
      ["\\therefore 2a - b = -5 \\quad \\cdots \\; ①$$", "\\therefore 2a - b = -5 \\quad \\cdots$$ ①"],
      ["\\therefore a + 2b = 11 \\quad \\cdots \\; ②$$", "\\therefore a + 2b = 11 \\quad \\cdots$$ ②"],
    ] },

  // 원의방정식 개념2단계 023a: same — ①② inside $$ blocks.
  { keys: [
      "(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/023a.webp",
      "circle_eq_step2/023a.png",
      "circle_eq_step2/023a.webp",
    ],
    replaces: [
      ["\\therefore x + y - 1 = 0 \\quad \\cdots \\;  ①$$", "\\therefore x + y - 1 = 0 \\quad \\cdots$$ ①"],
      ["y = x \\quad \\cdots \\; ②$$", "y = x \\quad \\cdots$$ ②"],
    ] },

  // 이차방정식과이차함수 3단계 014: \includegraphics inside $$ is not KaTeX — strip the
  // figure block (the parabola graph is rendered from the crop image separately).
  { keys: ["(006)이차방정식과이차함수3단계/014.webp"],
    replaces: [
      ["\n\n$$\n\\includegraphics[width=0.7\\textwidth]{image.png}\n$$", ""],
    ] },

  // 이차방정식과이차함수 3단계 040: \begin{tikzpicture} is not KaTeX — strip the figure
  // block (the parabola graph is the crop image; the prose paraphrase below it stays).
  { keys: ["(006)이차방정식과이차함수3단계/040.webp"],
    replaces: [
      ["\n\n$$\n\\begin{tikzpicture}\n    \\draw[->] (-3,0) -- (2,0) node[right] {$x$};\n    \\draw[->] (0,-2) -- (0,3) node[above] {$y$};\n    \\node at (0,-0.3) {O};\n    \\node at (1,-0.3) {1};\n    \\draw[dashed] (-0.8, -2) -- (-0.8, 3);\n    \\draw[thick] plot[domain=-2:1.5] (\\x, {-0.5*(\\x+2)*(\\x-1)});\n\\end{tikzpicture}\n$$", ""],
    ] },
];
