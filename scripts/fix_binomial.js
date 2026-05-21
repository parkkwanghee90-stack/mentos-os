import fs from 'fs';

const p = './public/premium_lectures/이항분포.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

d.steps[5].narration = "분산도 똑같아! 1번 던졌을 때의 분산은 '제평평제'로 구하면 p 빼기 p제곱, 즉 p(1-p)가 돼. 이것을 q라고 하면 pq지! 이걸 n번 더하니까 전체 분산은 깔끔하게 npq가 나오는 거란다!";
d.steps[5].visuals.math = "\\begin{array}{rl} V(X_1) &= E(X_1^2) - \\{E(X_1)\\}^2 \\\\ &= p - p^2 = p(1-p) = pq \\\\ \\\\ V(X) &= V(X_1) + \\cdots + V(X_n) \\\\ &= pq + \\cdots + pq = npq \\end{array}";

// Also fix Step 5 visuals to use array instead of aligned just in case that was broken too
d.steps[4].visuals.math = "\\begin{array}{rl} X &= X_1 + X_2 + \\cdots + X_n \\\\ E(X) &= E(X_1) + E(X_2) + \\cdots + E(X_n) \\\\ &= p + p + \\cdots + p = np \\end{array}";

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Fixed Bengali typo and KaTeX array issues!');
