import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

const needsFixKeys = [
"점과좌표3단계/007a.webp",
"점과좌표3단계/020a.webp",
"점과좌표3단계/021.webp",
"점과좌표4단계/018a.webp",
"직선의방정식3단계/016.webp",
"직선의방정식3단계/016a.webp",
"직선의방정식3단계/015a.webp",
"직선의방정식3단계/018a.webp",
"직선의방정식3단계/024a.webp",
"직선의방정식4단계/011a.webp",
"직선의방정식4단계/033a.webp",
"직선의방정식4단계/034a.webp",
"직선의방정식4단계/029a.webp",
"원의방정식3단계/018a.webp",
"점과좌표4단계/032.webp",
"(4)행렬2단계/006.webp",
"고차방정식2단계/014.webp",
"고차방정식2단계/045.webp",
"고차방정식3단계/015.webp",
"고차방정식3단계/054.webp",
"고차방정식4단계/007.webp",
"고차방정식4단계/015.webp",
"도형의이동3단계/022.webp",
"도형의이동4단계/005.webp",
"도형의이동4단계/004.webp",
"도형의이동4단계/023.webp",
"도형의이동4단계/028.webp",
"도형의이동4단계/041.webp",
"이차부등식3단계/037.webp",
"이차부등식3단계/052.webp",
"일차부등식3단계/014.webp",
"일차부등식3단계/016.webp",
"일차부등식3단계/013.webp",
"행렬4단계/003.webp",
"고차방정식2단계/008a.webp",
"고차방정식2단계/014a.webp",
"고차방정식2단계/021a.webp",
"고차방정식3단계/004a.webp",
"고차방정식3단계/015a.webp",
"고차방정식4단계/007a.webp",
"고차방정식4단계/011a.webp",
"고차방정식4단계/008a.webp",
"고차방정식4단계/017a.webp",
"고차방정식4단계/015a.webp",
"고차방정식4단계/019a.webp",
"일차부등식2단계/005a.webp",
"일차부등식2단계/001.webp",
"일차부등식2단계/001a.webp",
"일차부등식2단계/015a.webp",
"일차부등식2단계/024a.webp",
"일차부등식3단계/010a.webp",
"일차부등식3단계/013a.webp",
"일차부등식3단계/014a.webp",
"일차부등식4단계/006a.webp",
"일차부등식4단계/008a.webp",
"일차부등식4단계/011a.webp",
"일차부등식4단계/015a.webp",
"일차부등식4단계/019a.webp",
"일차부등식4단계/016a.webp"
];

for (let key of Object.keys(data)) {
  if (!needsFixKeys.some(nk => key.includes(nk.replace('.webp', '')))) continue;
  
  let text = data[key];
  let original = text;

  // 1. Fix options
  // Replace options that contain '\frac', '\pm', '\sqrt', etc.
  text = text.replace(/([①②③④⑤])\s*([^\n]+)/g, (match, num, body) => {
    let b = body.trim();
    if (b.includes('\\frac') || b.includes('\\sqrt') || b.includes('\\pm') || b.includes('\\left') || b.includes('\\begin')) {
      if (!b.startsWith('$')) {
        return `${num} $${b}$`;
      }
    }
    return match;
  });

  // 2. Wrap specific naked commands in question body
  // 점과좌표3단계/007a
  if (key.includes('점과좌표3단계/007a')) {
    text = text.replace(/AB = \\sqrt\{\(-4-1\)\^2 \+ \(-8-4\)\^2\} = 13/g, '$AB = \\sqrt{(-4-1)^2 + (-8-4)^2} = 13$');
    text = text.replace(/AC = \\sqrt\{\(5-1\)\^2 \+ \(1-4\)\^2\} = 5/g, '$AC = \\sqrt{(5-1)^2 + (1-4)^2} = 5$');
    text = text.replace(/\\overline\{AD\} \\text\{는 \} \\angle A \\text\{의 이등분선이므로\}/g, '$\\overline{AD}$는 $\\angle A$의 이등분선이므로');
    text = text.replace(/\\frac\{\\overline\{AB\}\}\{\\overline\{AC\}\} = \\frac\{\\overline\{BD\}\}\{\\overline\{DC\}\}/g, '$\\frac{\\overline{AB}}{\\overline{AC}} = \\frac{\\overline{BD}}{\\overline{DC}}$');
    text = text.replace(/\\frac\{\\overline\{BD\}\}\{\\overline\{DC\}\} = \\frac\{\\overline\{AB\}\}\{\\overline\{AC\}\} = \\frac\{13\}\{5\}/g, '$\\frac{\\overline{BD}}{\\overline{DC}} = \\frac{\\overline{AB}}{\\overline{AC}} = \\frac{13}{5}$');
    text = text.replace(/\\left\( \\frac\{13 \\times 5 \+ 5 \\times \(-4\)\}\{13\+5\}, \\frac\{13 \\times 1 \+ 5 \\times \(-8\)\}\{13\+5\} \\right\) = \\left\( \\frac\{5\}\{2\}, -\\frac\{3\}\{2\} \\right\)/g, '$\\left( \\frac{13 \\times 5 + 5 \\times (-4)}{13+5}, \\frac{13 \\times 1 + 5 \\times (-8)}{13+5} \\right) = \\left( \\frac{5}{2}, -\\frac{3}{2} \\right)$');
    text = text.replace(/\\therefore a \+ b = \\frac\{5\}\{2\} \+ \\left\( -\\frac\{3\}\{2\} \\right\) = 1/g, '$\\therefore a + b = \\frac{5}{2} + \\left( -\\frac{3}{2} \\right) = 1$');
  }

  // 직선의방정식3단계/016
  text = text.replace(/\\frac\{\\sqrt\{3\}\}\{4\}/g, '$\\frac{\\sqrt{3}}{4}$');

  // \therefore wrap
  text = text.replace(/\\therefore\s*[a-zA-Z0-9_\-+=(){}\[\],.\/\s\\]*(?=[\n①])/g, match => {
    if (match.includes('$')) return match;
    return `$${match.trim()}$ `;
  });

  // \\( \\) replaces
  text = text.replace(/\\\(\s*/g, '$').replace(/\s*\\\)/g, '$');
  
  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Total fixed: ${fixedKeys.size}`);
