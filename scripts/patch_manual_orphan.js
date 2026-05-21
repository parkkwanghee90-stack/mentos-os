import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;

function applyPatch(keyIncludes, replaceFrom, replaceTo) {
  const key = Object.keys(data).find(k => k.includes(keyIncludes));
  if (key && data[key].includes(replaceFrom)) {
    data[key] = data[key].replace(replaceFrom, replaceTo);
    fixedCount++;
    console.log(`[PATCHED] ${keyIncludes}`);
  } else {
    console.log(`[FAILED to match] ${keyIncludes}`);
  }
}

// 1. (7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/006a
applyPatch(
  '(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/006a.webp',
  '$a^2 - 6a + 4b + 13 = 0$$ ② 이 점 (2, -1)을 지나므로 $$(2-a)^2 + (-1-b)^2 = b^2$$ a^2 - 4a + 2b + 5 = 0$$',
  '$$a^2 - 6a + 4b + 13 = 0$$ ② 이 점 $(2, -1)$을 지나므로 $$(2-a)^2 + (-1-b)^2 = b^2$$ $$a^2 - 4a + 2b + 5 = 0$$'
);

// 2. 점과좌표4단계/026
applyPatch(
  '점과좌표4단계/026.webp',
  '① $3 \n② $4 \n③ $5 \n④ $6 \n⑤ $7',
  '① $3$ \n② $4$ \n③ $5$ \n④ $6$ \n⑤ $7$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
