#!/usr/bin/env node
/**
 * src/data/generated_answers/*.json 을 src/data/avs_answers.json 에 병합.
 * 기존 키는 보존, 생성된 13개 단원 키 추가/갱신.
 */
const fs = require('fs');
const path = require('path');

const avsPath = path.join(__dirname, '..', 'src', 'data', 'avs_answers.json');
const genDir = path.join(__dirname, '..', 'src', 'data', 'generated_answers');

const avs = JSON.parse(fs.readFileSync(avsPath, 'utf8'));
const files = fs.existsSync(genDir) ? fs.readdirSync(genDir).filter(f => f.endsWith('.json')) : [];
let added = 0, totalProblems = 0;
for (const f of files) {
  const key = f.replace(/\.json$/, '');
  const data = JSON.parse(fs.readFileSync(path.join(genDir, f), 'utf8'));
  const n = Object.keys(data).length;
  if (n === 0) { console.log(`(skip 빈값) ${key}`); continue; }
  avs[key] = { ...(avs[key] || {}), ...data };
  added++; totalProblems += n;
  console.log(`병합 ${key}: ${n}문항`);
}
fs.writeFileSync(avsPath, JSON.stringify(avs, null, 0) + '\n');
console.log(`\n✅ ${added}개 단원, 총 ${totalProblems}문항 병합 → ${avsPath}`);
console.log(`avs_answers.json 총 키: ${Object.keys(avs).length}`);
