// Print the exact failing KaTeX segment(s) for a given key (debug helper).
const katex = require('../node_modules/katex');
console.warn = () => {}; console.error = () => {};
const m = require('../public/data/math_problem_texts.json');
function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt.replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n').replace(/\\\\n/g, '\n').replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$').replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  txt = txt.replace(/\$\$([\s\S]+?)\$\$/g, (mm, inner) => (inner.includes('\\begin{aligned}') || inner.includes('\\begin{cases}') || inner.includes('\\begin{array}')) ? mm : (inner.includes('\\\\') ? `$$ \\begin{aligned} ${inner} \\end{aligned} $$` : mm));
  return txt;
}
const key = process.argv[2];
const t = normalizeMathText(m[key]);
const br = /\$\$([\s\S]+?)\$\$/g; let b, last = 0; const ch = [];
while ((b = br.exec(t))) { if (b.index > last) ch.push(t.slice(last, b.index)); try { katex.renderToString(b[1], { throwOnError: true, displayMode: true, strict: false }); } catch (e) { console.log('BLOCK FAIL:', JSON.stringify(b[1].slice(0, 120)), '::', e.message.slice(0, 80)); } last = b.index + b[0].length; }
if (last < t.length) ch.push(t.slice(last));
const il = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
for (const c of ch) { let mm; while ((mm = il.exec(c))) { try { katex.renderToString(mm[1], { throwOnError: true, displayMode: false, strict: false }); } catch (e) { console.log('INLINE FAIL:', JSON.stringify(mm[1].slice(0, 120)), '::', e.message.slice(0, 80)); } } }
console.log('--- done', key);
