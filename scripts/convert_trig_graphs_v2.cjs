const fs = require('fs');
const path = require('path');

const folders = ['삼각함수그래프2단계', '삼각함수그래프3단계', '삼각함수그래프'];

function cleanLatex(str) {
  if (!str) return '';
  // Remove \text{Korean...}
  let s = str.replace(/\\text\{[^}]*[가-힣]+[^}]*\}/g, '');
  // Remove dangling \text{...
  s = s.replace(/\\text\{[^\}]*$/g, '');
  // Remove any stray korean chars just in case outside \text
  s = s.replace(/[가-힣]/g, '');
  return s.trim();
}

let count = 0;
folders.forEach(folder => {
  const srcDir = `c:/mentos_os_clean/math_hints_py_extracted/math_hints/${folder}`;
  const destDir = `c:/mentos_os_clean/public/math_hints/${folder}`;
  if (!fs.existsSync(srcDir)) {
      console.log('Skipping (not found):', srcDir);
      return;
  }
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
  files.forEach(f => {
    const srcData = JSON.parse(fs.readFileSync(path.join(srcDir, f)));
    let p='구하고자 하는 것을 파악합니다.', c='조건을 분석합니다.', b='관련 개념을 떠올립니다.', s='', a='해설 참조';
    if (srcData.steps && srcData.steps.length > 0) {
      const steps = srcData.steps.map(st => {
          let lx = cleanLatex(st.latex);
          // If latex contains newlines, replace them with $$ \n\n $$
          lx = lx.split('\\newline').map(l => `$$ ${l.trim()} $$`).join('\n\n');
          lx = lx.split('\\\\').map(l => `$$ ${l.trim()} $$`).join('\n\n');
          // cleanup multiple $$ $$ if any
          lx = lx.replace(/\$\$\s*\$\$/g, '');
          return lx;
      });
      s = steps.join('\n\n');
    }
    
    let stepName = folder.includes('2단계') ? '2단계' : (folder.includes('3단계') ? '3단계' : '4단계');
    let cropFolder = folder === '삼각함수그래프' ? '4단계/삼각함수그래프' : `${stepName}/${folder}`;

    const destData = {
      P: p, C: c, B: b, S: s, A: a,
      problem_render: {
        body: `${folder} - 문제 ${parseInt(f)}`,
        choices: null,
        source_image: `/math_crops/(5)수학1 중간/${cropFolder}/${f.replace('.json', '.webp')}`
      }
    };
    fs.writeFileSync(path.join(destDir, f), JSON.stringify(destData, null, 2));
    count++;
  });
});
console.log(`Converted ${count} files for Trig Graphs!`);
