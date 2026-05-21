const fs = require('fs');

const file = 'c:/mentos_os_clean/src/data/mockExams/CSAT_2024_6.js';
let content = fs.readFileSync(file, 'utf8');

// The logic is to replace objects without unit, level, type, concept
content = content.replace(/\{ id: 1, type: "2점", text:[^]*?tag: '지수' \}/, `{ id: 1, type: "2점", text: "$$\\\\left(\\\\frac{5}{\\\\sqrt[3]{25}}\\\\right)^{\\\\frac{3}{2}}$$ 의 값은?", options: ["$\\\\frac{1}{5}$", "$\\\\frac{\\\\sqrt{5}}{5}$", "$1$", "$\\\\sqrt{5}$", "$5$"], answer: 3, tag: '지수', unit: '지수함수와 로그함수', level: 2, problemType: '지수계산', concept: ['지수', '거듭제곱근'] }`);

const metaMap = {
  1: { unit: '지수함수와 로그함수', level: 2, problemType: '지수계산', concept: ['지수', '거듭제곱근'] },
  2: { unit: '다항함수의 미분법', level: 2, problemType: '미분계수', concept: ['미분계수'] },
  3: { unit: '수열', level: 3, problemType: '시그마의 성질', concept: ['시그마'] },
  4: { unit: '함수의 극한과 연속', level: 3, problemType: '좌극한우극한', concept: ['함수의 극한', '그래프'] },
  5: { unit: '다항함수의 미분법', level: 3, problemType: '도함수', concept: ['미분법', '곱의미분'] },
  6: { unit: '삼각함수', level: 3, problemType: '삼각함수의 성질', concept: ['삼각함수', '각의 변환'] },
  7: { unit: '다항함수의 미분법', level: 3, problemType: '방정식과 부등식', concept: ['도함수의 활용', '실근의 개수'] },
  8: { unit: '수열', level: 3, problemType: '등비수열', concept: ['등비수열', '일반항'] },
  9: { unit: '함수의 극한과 연속', level: 4, problemType: '함수의 연속성', concept: ['연속함수', '합성함수'] },
  10: { unit: '삼각함수', level: 4, problemType: '사인법칙과 코사인법칙', concept: ['사인법칙', '코사인법칙'] },
  11: { unit: '다항함수의 미분법', level: 4, problemType: '도함수의 활용', concept: ['미분계수', '접선의 방정식'] },
  12: { unit: '지수함수와 로그함수', level: 4, problemType: '지수함수 그래프', concept: ['지수함수', '그래프 교점'] },
  13: { unit: '다항함수의 적분법', level: 4, problemType: '넓이', concept: ['정적분의 활용', '넓이'] },
  14: { unit: '지수함수와 로그함수', level: 4, problemType: '로그방정식', concept: ['로그함수', '자연수 조건'] },
  15: { unit: '다항함수의 적분법', level: 4, problemType: '정적분으로 정의된 함수', concept: ['정적분', '미분가능성'] },
  16: { unit: '지수함수와 로그함수', level: 3, problemType: '로그방정식', concept: ['로그방정식'] },
  17: { unit: '다항함수의 적분법', level: 3, problemType: '부정적분', concept: ['부정적분'] },
  18: { unit: '수열', level: 3, problemType: '시그마계산', concept: ['시그마'] },
  19: { unit: '다항함수의 적분법', level: 3, problemType: '속도와 거리', concept: ['정적분의 활용', '속도와 위치'] },
  20: { unit: '삼각함수', level: 4, problemType: '삼각함수 그래프', concept: ['삼각함수 그래프', '주기성'] },
  21: { unit: '다항함수의 미분법', level: 4, problemType: '극대극소와 그래프', concept: ['도함수의 활용', '사차함수 개형'] },
  22: { unit: '수열', level: 4, problemType: '수열의 귀납적 정의', concept: ['수열', '점화식'] }
};

const calcMap = {
  23: { unit: '수열의 극한', level: 2, problemType: '극한계산', concept: ['등비수열의 극한'] },
  24: { unit: '여러 가지 미분법', level: 3, problemType: '음함수의 미분', concept: ['음함수의 미분법'] },
  25: { unit: '수열의 극한', level: 3, problemType: '급수와 극한', concept: ['급수', '일반항 극한'] },
  26: { unit: '여러 가지 미분법', level: 3, problemType: '넓이 극한', concept: ['도함수의 활용', '접선'] },
  27: { unit: '도함수의 활용(미적분)', level: 3, problemType: '접선의 방정식', concept: ['접선의 방정식', '법선'] },
  28: { unit: '도함수의 활용(미적분)', level: 4, problemType: '극대극소', concept: ['역함수의 미분', '불연속'] },
  29: { unit: '도함수의 활용(미적분)', level: 4, problemType: '미분가능성', concept: ['미분가능성', '도함수 부호'] },
  30: { unit: '삼각함수의 미분', level: 4, problemType: '초월함수의 극한', concept: ['삼각함수의 극한', '덧셈정리'] }
};

const statsMap = {
  23: { unit: '이항정리', level: 2, problemType: '계수찾기', concept: ['이항정리'] },
  24: { unit: '확률', level: 3, problemType: '독립사건', concept: ['독립사건의 확률'] },
  25: { unit: '확률', level: 3, problemType: '조건부확률', concept: ['조건부확률'] },
  26: { unit: '통계', level: 3, problemType: '신뢰구간', concept: ['모평균의 추정'] },
  27: { unit: '확률', level: 3, problemType: '독립시행', concept: ['확률의 곱셈정리'] },
  28: { unit: '통계', level: 4, problemType: '확률밀도함수', concept: ['확률밀도함수'] },
  29: { unit: '통계', level: 4, problemType: '이산확률분포', concept: ['이산확률분포', '기댓값'] },
  30: { unit: '경우의 수', level: 4, problemType: '중복조합', concept: ['중복조합', '함수의 개수'] }
};

let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('{ id: ') && line.includes('type: "') && line.includes('tag:')) {
    const idMatch = line.match(/id:\s*(\d+)/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      let mapToUse = null;
      if (i < lines.findIndex(l => l.includes('calculusQuestions2024'))) {
        mapToUse = metaMap;
      } else if (i < lines.findIndex(l => l.includes('statsQuestions2024'))) {
        mapToUse = calcMap;
      } else {
        mapToUse = statsMap;
      }
      
      const meta = mapToUse[id];
      if (meta && !line.includes('unit:')) {
        let replacement = ` unit: '${meta.unit}', level: ${meta.level}, problemType: '${meta.problemType}', concept: ${JSON.stringify(meta.concept)} }`;
        if (line.endsWith('},')) {
           line = line.replace(/}\s*,\s*$/, replacement + ',');
        } else if (line.endsWith('}')) {
           line = line.replace(/}\s*$/, replacement);
        }
        lines[i] = line;
      }
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Injected metadata into CSAT_2024_6.js');
