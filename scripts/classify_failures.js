import fs from 'fs';

const reportPath = 'reports/math_upper_math1_plaintext_latex_failures.json';
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const categories = {
  'begin/end mismatch': [],
  'array/cases/matrix mismatch': [],
  'left/right mismatch': [],
  'nested fraction': [],
  'nested sqrt': [],
  'broken \\frac': [],
  'broken \\sqrt': [],
  'broken \\neq': [],
  'orphan $': [],
  'escaped braces': [],
  'other': []
};

for (const item of data) {
  const snippet = item.rawSnippet;
  const pattern = item.detectedPattern;
  
  if (snippet.includes('\\begin') && !snippet.includes('\\end')) {
    categories['begin/end mismatch'].push(item);
  } else if (snippet.includes('\\end') && !snippet.includes('\\begin')) {
    categories['begin/end mismatch'].push(item);
  } else if (/(matrix|array|cases|aligned|gather)/.test(snippet)) {
    categories['array/cases/matrix mismatch'].push(item);
  } else if (snippet.includes('\\left') || snippet.includes('\\right')) {
    categories['left/right mismatch'].push(item);
  } else if (/\\frac\s*\{.*\\frac/.test(snippet)) {
    categories['nested fraction'].push(item);
  } else if (/\\sqrt\s*(?:\[[^\]]*\])?\s*\{.*\\sqrt/.test(snippet)) {
    categories['nested sqrt'].push(item);
  } else if (pattern.includes('\\frac')) {
    categories['broken \\frac'].push(item);
  } else if (pattern.includes('\\sqrt')) {
    categories['broken \\sqrt'].push(item);
  } else if (pattern.includes('eq O') || pattern.includes('eq B') || snippet.includes('neq')) {
    categories['broken \\neq'].push(item);
  } else if (pattern.includes('orphan $') || pattern.includes('leading/trailing/orphan $')) {
    categories['orphan $'].push(item);
  } else if (snippet.includes('\\{') || snippet.includes('\\}')) {
    categories['escaped braces'].push(item);
  } else {
    categories['other'].push(item);
  }
}

// Generate summary report
const summary = {};
for (const [cat, items] of Object.entries(categories)) {
  if (items.length > 0) {
    summary[cat] = {
      count: items.length,
      examples: items.slice(0, 5).map(i => ({
        unit: i.unit,
        number: i.number,
        sourceField: i.sourceField,
        snippet: i.rawSnippet
      }))
    };
  }
}

fs.writeFileSync('reports/classified_failures_summary.json', JSON.stringify(summary, null, 2), 'utf8');

console.log('--- Classification Summary ---');
for (const [cat, data] of Object.entries(summary)) {
  console.log(`${cat}: ${data.count} items`);
}
