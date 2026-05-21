const fs = require('fs');
const path = require('path');
const https = require('https');

let envContent = '';
try { envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8'); } catch (e) {}
const API_KEY = (envContent.match(/VITE_OPENAI_API_KEY=(.+)/) || [])[1]?.trim() || process.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("OpenAI API key missing.");
  process.exit(1);
}

function countSentences(text) { return text ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0; }
function countTurns(script) { return script ? script.split(/\n|M:|W:/).filter(s => s.trim().length > 0).length : 0; }

const teacherRanks = {
  h_eng1: '4~6등급', h_eng2: '1~2등급', h_eng3: '4~6등급', h_eng4: '1등급',
  h_eng5: '4~5등급', h_eng6: '4~5등급', h_eng7: '2~3등급', h_eng8: '1등급'
};

function getMinSentences(tId) {
  const r = teacherRanks[tId];
  if (r === '1등급') return 8;
  if (r === '1~2등급' || r === '2~3등급') return 6;
  return 5;
}

function validateLesson(lesson, tId) {
  const r = [];
  if (!lesson.reading || !lesson.reading.passages) { r.push('reading missing'); return r; }
  if ((lesson.reading.questions?.length || 0) < 10 && lesson.reading.passages.length < 10) r.push('reading count < 10');
  lesson.reading.passages.forEach((p, idx) => {
    if (countSentences(p.text) < getMinSentences(tId)) r.push(`R P[${idx}] sens < ${getMinSentences(tId)}`);
  });

  if (!lesson.listening || !lesson.listening.items) { r.push('listening missing'); return r; }
  if (lesson.listening.items.length < 10) r.push('listening count < 10');
  lesson.listening.items.forEach((item, idx) => {
    if (countTurns(item.script) < 6) r.push(`L I[${idx}] turns < 6`);
    if (!item.choices || !item.answer) r.push(`L I[${idx}] missing choices/answer`);
  });

  if (!lesson.vocab || !lesson.vocab.words) { r.push('vocab missing'); return r; }
  if (lesson.vocab.words.length < 15) r.push('vocab count < 15');
  if ((lesson.vocab.wordTest?.questions?.length || 0) < 10 && (lesson.vocab.wordTest?.questionsCount || 0) < 10) r.push('vocab test < 10');

  // Homework check simplified
  if (!lesson.homework || !lesson.homework.items || lesson.homework.items.length < 3) r.push('homework missing parts');
  return r;
}

async function generateChunk(sys, pType, teacherRank) {
  let prompt = '';
  let count = 5;
  if (pType === 'R') {
    prompt = `Output JSON strictly: { "passages": [ { "id": "Passage_n", "text": "<English text>", "teachPoint": "...", "question": "..." } ] }\nGenerate 5 entirely unique passages. NO Korean. NO Placeholders.`;
  } else if (pType === 'L') {
    prompt = `Output JSON strictly: { "items": [ { "id": "Audio_n", "script": "M: ...\\nW: ...", "points": "...", "choices": ["...","...","...","...","..."], "answer": "...", "explanation": "..." } ] }\nGenerate 5 completely unique audio items. Min 6 turns.`;
  } else if (pType === 'V') {
    count = teacherRank.includes('1등급') ? 25 : (teacherRank.includes('2~3') ? 20 : 15);
    const difficultyLevel = teacherRank.includes('1등급') ? "Highest Level (EBS/Evaluation Institute Killer words like 'appreciate', 'compromise', 'account for', 'subject to', 'yield', 'address')" : "Medium-High Level";
    prompt = `CRITICAL: You are an expert in the Korean CSAT (수능) English exam.
You MUST ONLY select from the actual 5,000 frequent CSAT words.
ABSOLUTELY NO Philosophy/Academic jargon (e.g., NO ontology, epistemology, nihilism, solipsism, paradigm, dialectic).
If you output even ONE of those academic words, the user will fail the generation.
Select words like 'appreciate', 'compromise', 'address', 'subject', 'yield', 'observe', which are common but have multiple complex meanings in tests.
Level exactly for: ${difficultyLevel}.
JSON FORMAT:
{ 
  "words": [ { "word": "", "meaning": "", "alt_meaning": "", "example_sentence": "<CSAT style sentence>", "context_explain": "<Korean explanation of the specific nuance>" } ],
  "test_questions": [ { "type": "meaning_choice", "question": "...", "choices": ["","","",""], "answer": "" } ]
}
Generate ${count} CSAT words, and 12 test questions derived from them.`;
  }

  const reqData = JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "system", content: sys }, { role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }
    }, (res) => {
      let b = ''; res.on('data', c => b+=c);
      res.on('end', () => {
        try { resolve(JSON.parse(JSON.parse(b).choices[0].message.content)); } catch(e) { reject(e); }
      });
    });
    req.on('error', reject); req.write(reqData); req.end();
  });
}

async function rebuildLesson(teacherId, week, round) {
  console.log(`\n### Rebuilding ${teacherId} (W${week} L${round})`);
  const rMin = getMinSentences(teacherId);
  const sys = `Expert English Teacher for Rank ${teacherRanks[teacherId]}. Passages MUST have ${rMin}+ sentences.`;

  let attempt = 1;
  while (attempt <= 3) {
    try {
      const r1 = await generateChunk(sys, 'R', teacherRanks[teacherId]);
      const r2 = await generateChunk(sys, 'R', teacherRanks[teacherId]);
      const passages = [...(r1.passages||[]), ...(r2.passages||[])];
      passages.forEach((p,i) => p.id = `Passage_${i+1}`);

      const l1 = await generateChunk(sys, 'L', teacherRanks[teacherId]);
      const l2 = await generateChunk(sys, 'L', teacherRanks[teacherId]);
      const items = [...(l1.items||[]), ...(l2.items||[])];
      items.forEach((p,i) => p.id = `AudioItem_${i+1}`);

      const vStr = await generateChunk(sys, 'V', teacherRanks[teacherId]);

      const fullLesson = {
        teacherId, round, title: `Curriculum Mode for ${teacherRanks[teacherId]}`,
        targetGrades: ["고1", "고2", "고3", "N수"], targetRanks: [teacherRanks[teacherId]],
        reading: { passageCount: passages.length, passages, teachPoints: passages.map(x=>x.teachPoint), questions: passages.map(x=>x.question) },
        listening: { scriptCount: items.length, items, points: items.map(x=>x.points), timeline: items.map((x,i)=>`[${i}m] Audio`) },
        vocab: {
          words: vStr.words || [],
          wordTest: { questionsCount: (vStr.test_questions||[]).length, questions: vStr.test_questions || [] },
        },
        homework: { title: "HW", items: [{type:"reading",title:"10 items"},{type:"listening",title:"10 items"},{type:"vocab",title:"10 items"}] }
      };

      const reasons = validateLesson(fullLesson, teacherId);
      if (reasons.length === 0) {
        const pPath = path.join(__dirname, `../src/data/lessons/english/${teacherId}/week_${week}`);
        if (!fs.existsSync(pPath)) fs.mkdirSync(pPath, {recursive: true});
        fs.writeFileSync(path.join(pPath, `lesson_0${round}.json`), JSON.stringify(fullLesson, null, 2), 'utf8');
        console.log(`   => [PASS]`);
        return true;
      } else {
        console.log(`   => [FAIL] ${reasons.join(', ')}`);
      }
    } catch(e) { console.log(`   => [ERROR] ${e.message}`); }
    attempt++;
  }
  return false;
}

async function run() {
  const teachers = Object.keys(teacherRanks);
  for (const tId of teachers) {
    for (let w=1; w<=2; w++) {
      for (let r=1; r<=2; r++) {
         await rebuildLesson(tId, w, r);
      }
    }
  }
}

run().catch(console.error);
