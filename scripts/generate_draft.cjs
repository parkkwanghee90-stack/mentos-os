const fs = require('fs');
const data = require('../reports/classified_failures_summary.json');
let code = 'import fs from "fs";\nconst dbPath = "src/data/math_problem_texts.json";\nconst data = JSON.parse(fs.readFileSync(dbPath, "utf8"));\nlet fixedCount = 0;\nfunction applyPatch(keyIncludes, replaceFrom, replaceTo) {\n  const key = Object.keys(data).find(k => k.includes(keyIncludes));\n  if (key && data[key].includes(replaceFrom)) {\n    data[key] = data[key].replace(replaceFrom, replaceTo);\n    fixedCount++;\n  }\n}\n\n';
for (const [cat, info] of Object.entries(data)) {
  code += `// == ${cat} ==\n`;
  info.examples.slice(0, 5).forEach(ex => {
    code += `applyPatch('${ex.unit}/${ex.number}', ${JSON.stringify(ex.snippet)}, '...');\n`;
  });
}
code += '\nfs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");\nconsole.log(`Manual patches applied: ${fixedCount}`);\n';
fs.writeFileSync('../scripts/patch_manual_draft.js', code, 'utf8');
