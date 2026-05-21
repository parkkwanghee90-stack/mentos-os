import fs from 'fs';

const reportPath = 'reports/math_upper_math1_plaintext_latex_failures.json';
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const groups = {
  'TYPE-A_eq_corruption': [],
  'TYPE-B_orphan_dollar': [],
  'TYPE-C_matrix_left_right': [],
  'TYPE-D_matrix_block': [],
  'TYPE-E_choice_leakage': [],
  'TYPE-F_cases_structure': [],
  'TYPE-G_escaped_newline': [],
  'TYPE-H_text_leakage': [],
  'TYPE-I_inequality_leakage': [],
  'TYPE-J_currency_mixed': [],
  'TYPE-K_inequality_chain': [],
  'TYPE-L_displayed_equation_split': [],
  'TYPE-M_nested_fraction': [], // Add a few legacy types that we know exist
  'TYPE-N_other': []
};

data.forEach(item => {
  const snippet = item.rawSnippet;
  const pattern = item.detectedPattern;
  const source = item.sourceField;

  let classified = false;

  const addToGroup = (type) => {
    groups[type].push(item);
    classified = true;
  };

  // TYPE-A: eq 오염
  if (/([A-Za-z]\s*eq\s*[A-Za-z])/.test(snippet) || pattern.includes('eq O') || pattern.includes('eq B') || snippet.includes('neq')) {
    addToGroup('TYPE-A_eq_corruption');
  }

  // TYPE-G: escaped newline leakage
  if (snippet.includes('ewline')) {
    addToGroup('TYPE-G_escaped_newline');
  }

  // TYPE-H: raw \text leakage
  if (snippet.includes('\\text')) {
    addToGroup('TYPE-H_text_leakage');
  }

  // TYPE-E: choice block latex leakage
  if (source.includes('choice_')) {
    addToGroup('TYPE-E_choice_leakage');
  }

  // TYPE-C & D & F: matrix, array, cases
  if (snippet.includes('\\left') || snippet.includes('\\right')) {
    addToGroup('TYPE-C_matrix_left_right');
  }
  if (/(matrix|array)/.test(snippet)) {
    addToGroup('TYPE-D_matrix_block');
  }
  if (/cases/.test(snippet) || /\(i=j\)/.test(snippet) || /\(i\\neq j\)/.test(snippet)) {
    addToGroup('TYPE-F_cases_structure');
  }

  // TYPE-J: currency
  if (/\$US/.test(snippet) || /\\\$[0-9]/.test(snippet) || /\\textwon/.test(snippet)) {
    addToGroup('TYPE-J_currency_mixed');
  }

  // TYPE-I & K & L: inequalities, equations
  if (/\\leq|\\geq|\\neq|\\pm|\\therefore/.test(snippet) || pattern.match(/\\(leq|geq|pm|therefore)/)) {
    addToGroup('TYPE-I_inequality_leakage');
  }
  if (/(<|>|\\leq|\\geq).*?(<|>|\\leq|\\geq)/.test(snippet) || /\|.*?\|.*?(<|>|\\leq|\\geq)/.test(snippet)) {
    addToGroup('TYPE-K_inequality_chain');
  }
  if (/^[A-Za-z0-9\/]+\s*=\s*/.test(snippet) && !classified) {
    addToGroup('TYPE-L_displayed_equation_split');
  }

  // Nested fractions
  if (/\\frac\s*\{.*\\frac/.test(snippet)) {
    addToGroup('TYPE-M_nested_fraction');
  }

  // TYPE-B: orphan dollar (only if not primarily a choice leakage)
  if (pattern.includes('orphan $') && !source.includes('choice_')) {
    addToGroup('TYPE-B_orphan_dollar');
  }

  if (!classified) {
    addToGroup('TYPE-N_other');
  }
});

Object.keys(groups).forEach(type => {
  if (groups[type].length > 0) {
    fs.writeFileSync(`reports/pattern_groups/${type}.json`, JSON.stringify(groups[type], null, 2));
    console.log(`[${type}] ${groups[type].length} items mapped`);
  }
});
