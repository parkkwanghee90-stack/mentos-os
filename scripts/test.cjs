const fs = require('fs');
const data = JSON.parse(fs.readFileSync('logs/math_upper_math1_auto_latex_fail_report.json', 'utf8'));
const counts = {};
data.forEach(d => {
  counts[d.detectedPattern] = (counts[d.detectedPattern] || 0) + 1;
});
console.log(Object.entries(counts).sort((a,b) => b[1]-a[1]).map(e => `${e[1]}: ${e[0]}`).join('\n'));
