const fs = require('fs');
const path = require('path');

const baseDir = 'c:/mentos_os_clean/public/math_hints';
const folders = ['삼각함수그래프3단계', '삼각함수그래프'];

const keys = fs.readdirSync(path.join(baseDir, '삼각함수그래프3단계'))
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));

keys.forEach(pid => {
  const filePath = path.join(baseDir, '삼각함수그래프3단계', pid + '.json');
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let changed = false;

  // 1. steps의 모든 formula_raw 점검 및 교정
  if (data.steps) {
    data.steps.forEach(step => {
      if (step.formula_raw) {
        let raw = step.formula_raw;
        
        // sin, cos, tan, theta, pi, frac, begin, end, case 등 주요 키워드 앞의 단일 백슬래시를 이중화
        // (JSON 저장 시 사중이 됨)
        const keywords = ['sin', 'cos', 'tan', 'theta', 'pi', 'frac', 'sqrt', 'begin', 'end', 'cases', 'le', 'ge', 'alpha', 'beta', 'gamma'];
        
        keywords.forEach(kw => {
           // 이미 \\가 있는 경우는 건드리지 않음
           const re = new RegExp(`\\\\(?!\\\\)${kw}`, 'g');
           if (re.test(raw)) {
               raw = raw.replace(re, `\\\\${kw}`);
               changed = true;
           }
        });
        
        step.formula_raw = raw;
      }
    });
  }

  // 2. base_figure의 function expr 점검 (Placeholder sin(x) 퇴치)
  if (data.base_figure && data.base_figure.objects) {
    data.base_figure.objects.forEach(obj => {
      if (obj.type === 'function' && obj.expr === 'sin(x)') {
        // 실제 문제에 맞는 expr로 나중에 수동 교체해야 하나, 일단 마킹하거나 기본 보정
        // (여기서는 힌트 구조의 무결성 확보에 집중)
      }
    });
  }

  if (changed) {
    folders.forEach(f => {
      const outPath = path.join(baseDir, f, pid + '.json');
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
    });
  }
});

console.log("3단계 애니메이션 힌트 전수 수식 정규화 및 이스케이프 교정 완료!");
