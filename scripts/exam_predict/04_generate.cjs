#!/usr/bin/env node
/**
 * 04단계: analysis/<school>.json → predicted/<school>.json
 * 학교 출제비중·난이도에 맞춰 **오리지널 예상문제 20문제**를 생성(정답+해설+오답포인트).
 *
 * 저작권 안전: 실제 기출(extracted)을 복제하지 않는다. pool_고1_1학기기말.json 은
 * '유형/난이도 감(感)'을 잡는 참고로만 제공하고, 새 수치·새 문장으로 생성하도록 강제.
 * 답은 생성기가 직접 계산해 채우고, 객관식은 보기 5개를 만든다.
 * 멱등: predicted/<school>.json 있으면 건너뜀(REGEN=1 강제).
 *
 * 사용:  set -a; source .env; set +a
 *        node scripts/exam_predict/04_generate.cjs ["풍산"]
 */
const path = require('path');
const fs = require('fs');
const C = require('./lib/config.cjs');
const G = require('./lib/gemini.cjs');

const filter = process.argv[2];
const TOTAL = parseInt(process.env.EXAM_COUNT || '20', 10); // 회당 20문제

const POOL = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(C.REPO, 'src/data/naesin_exams/pool_고1_1학기기말.json'), 'utf8')); }
  catch { return null; }
})();

// 단원별 출제 문항 수를 비중에 맞춰 20문제로 배분(최소 0, 합=TOTAL)
function blueprint(analysis) {
  // 실제 분포를 그대로 사용(특정 단원만 필터하면 그 비중이 다른 단원으로 쏠림). '기타'만 제외.
  const base = analysis.unit_share.filter(u => u.unit && u.unit !== '기타' && u.percent > 0);
  let alloc = base.map(u => ({ unit: u.unit, n: Math.round((u.percent / 100) * TOTAL) }));
  // 합 보정
  let sum = alloc.reduce((s, a) => s + a.n, 0);
  while (sum !== TOTAL && alloc.length) {
    const i = sum < TOTAL ? alloc.indexOf(alloc.reduce((m, a) => a.n >= m.n ? a : m, alloc[0]))
                          : alloc.indexOf(alloc.reduce((m, a) => a.n > 0 && a.n <= m.n ? a : m, alloc.find(a=>a.n>0)||alloc[0]));
    alloc[i].n += sum < TOTAL ? 1 : -1; sum += sum < TOTAL ? 1 : -1;
  }
  return alloc.filter(a => a.n > 0);
}

function poolSamples(unit, k = 2) {
  if (!POOL) return [];
  const pick = [];
  for (const level of ['필수', '심화']) {
    const arr = (POOL[level] && POOL[level][unit]) || [];
    arr.slice(0, k).forEach(p => pick.push(p.latex));
  }
  return pick.slice(0, k);
}

function buildPrompt(analysis, alloc) {
  const subjRatio = analysis.subjective_ratio;
  const lines = alloc.map(a => {
    const ref = poolSamples(a.unit).map(s => `      · 참고유형: ${s}`).join('\n');
    return `  - ${a.unit}: ${a.n}문항\n${ref}`;
  }).join('\n');
  return `너는 한국 고1 공통수학1 내신 출제위원이다. ${analysis.school}의 1학기 기말 출제경향을 반영한
**오리지널 예상문제 ${TOTAL}문항**을 만든다. (실제 기출 복제 금지 — 새로운 수치·상황으로 창작)

[출제 설계] 난이도 ${analysis.difficulty_stars}★ / 서술형 약 ${subjRatio}% / 단원별 배분:
${lines}

각 문항 스키마(JSON):
{ "num": 1, "unit": "단원명", "level": "기본"|"심화", "type": "객관식"|"서술형",
  "latex": "발문(KaTeX, $...$/$$...$$ 만, \\( \\) 금지)",
  "choices": ["$①식$","$②식$","$③식$","$④식$","$⑤식$"]   // 객관식만, 5개
  "answer": 객관식은 정답 보기번호(1~5 정수) / 서술형은 최종답 문자열,
  "solution": "단계별 풀이(생략 없이, 수식은 $...$). 네가 직접 계산해 정답과 일치시킬 것",
  "wrong_point": "학생이 자주 틀리는 포인트 한 줄" }

규칙:
- 서술형 비율(${subjRatio}%)에 맞춰 type 분배. 나머지는 객관식.
- 반드시 네가 풀어서 answer 와 solution 이 일치하도록 검산. 객관식 정답이 보기 안에 있어야 함.
- 단원 배분 수를 정확히 지킬 것(합 ${TOTAL}).
- **JSON 문자열 값 안에서는 큰따옴표(")를 절대 쓰지 말 것**(인용이 필요하면 작은따옴표나 「」). 백슬래시는 LaTeX 명령으로만.
- 출력은 {"problems":[ ... ${TOTAL}개 ... ]} JSON만.`;
}

async function generateSchool(analysis) {
  const alloc = blueprint(analysis);
  const prompt = buildPrompt(analysis, alloc);
  const parsed = await G.textJson(prompt);
  let problems = (parsed.problems || []).filter(p => p && p.latex);
  problems = problems.slice(0, TOTAL).map((p, i) => ({
    id: `${C.slug(analysis.school)}_${String(i + 1).padStart(2, '0')}`,
    num: i + 1, unit: p.unit, level: p.level || '기본', type: p.type || '객관식',
    latex: p.latex, choices: p.choices || null, answer: p.answer ?? null,
    solution: p.solution || '', wrong_point: p.wrong_point || '',
  }));
  return {
    school: analysis.school, year: analysis.year, grade: analysis.grade, term: analysis.term, subject: analysis.subject,
    generated_at: new Date().toISOString(), count: problems.length,
    blueprint: { difficulty_stars: analysis.difficulty_stars, subjective_ratio: analysis.subjective_ratio, allocation: alloc },
    avs_pending: true,       // AVS(사고과정) 생성은 별도(05 이후 기존 AVS 인프라 연계)
    problems,
  };
}

async function run() {
  C.ensureDirs();
  let files = fs.readdirSync(C.STAGES.analysis).filter(f => f.endsWith('.json'));
  if (filter) files = files.filter(f => f.includes(filter));
  console.log(`[04] 생성 대상 ${files.length}개 (회당 ${TOTAL}문제)`);
  let ok = 0, skip = 0, fail = 0;
  for (const f of files) {
    const out = path.join(C.STAGES.predicted, f);
    if (fs.existsSync(out) && process.env.REGEN !== '1') { console.log(`  · skip ${f}`); skip++; continue; }
    try {
      const analysis = JSON.parse(fs.readFileSync(path.join(C.STAGES.analysis, f), 'utf8'));
      const data = await generateSchool(analysis);
      fs.writeFileSync(out, JSON.stringify(data, null, 2));
      const obj = data.problems.filter(p => p.type === '객관식').length;
      console.log(`  ✓ ${data.school}: ${data.count}문항 (객${obj}/서술${data.count - obj})`);
      ok++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) { console.log(`  ✗ ${f}: ${e.message}`); C.logFailure('04_generate', f, f, e); fail++; }
  }
  console.log(`[04] 완료 ok=${ok} skip=${skip} fail=${fail}`);
}

if (require.main === module) run();
module.exports = { generateSchool, blueprint };
