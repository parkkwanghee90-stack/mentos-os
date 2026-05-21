const fs = require('fs');
const data = require('../reports/classified_failures_summary.json');
let md = '# Classified LaTeX Failures\n\n';
for (const [cat, info] of Object.entries(data)) {
  md += `## ${cat} (${info.count} items)\n\n`;
  info.examples.forEach(ex => {
    md += `- **${ex.unit}/${ex.number}** (${ex.sourceField}):\n  \`\`\`\n  ${ex.snippet}\n  \`\`\`\n\n`;
  });
}
fs.writeFileSync('../reports/classified_failures_summary.md', md, 'utf8');
