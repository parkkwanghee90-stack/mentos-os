const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '../src/data/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function countSentences(text) {
  if (!text) return 0;
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function countTurns(script) {
  if (!script) return 0;
  return script.split(/\n|M:|W:/).filter(s => s.trim().length > 0).length;
}

const teacherRanks = {
  h_eng1: '4~6등급', h_eng2: '1~2등급', h_eng3: '4~6등급', h_eng4: '1등급',
  h_eng5: '4~5등급', h_eng6: '4~5등급', h_eng7: '2~3등급', h_eng8: '1등급'
};

function getReadingSentenceMin(teacherId) {
  const rank = teacherRanks[teacherId];
  if (rank === '1등급') return 8;
  if (rank === '1~2등급' || rank === '2~3등급') return 6;
  return 5;
}

function inspectReading(lesson, teacherId, reasons) {
  if (!lesson.reading) { reasons.push("reading key is missing"); return; }
  if (!lesson.reading.passages || !lesson.reading.questions || !lesson.reading.teachPoints) {
    reasons.push("reading requires passages, questions, and teachPoints");
    return;
  }
  
  const minQuestions = 10;
  if (lesson.reading.questions.length < minQuestions && lesson.reading.passages.length < minQuestions) {
    reasons.push(`reading question count or passage count < ${minQuestions}`);
  }

  const minSentences = getReadingSentenceMin(teacherId);
  lesson.reading.passages.forEach((p, idx) => {
    if (!p.text) reasons.push(`reading passage[${idx}] text missing`);
    else {
      const sCount = countSentences(p.text);
      if (sCount < minSentences) {
        reasons.push(`reading passage[${idx}] has only ${sCount} sentences (minimum ${minSentences} required)`);
      }
      if (/[가-힣]/.test(p.text)) {
        reasons.push(`reading passage[${idx}] contains Korean text`);
      }
      if (p.text.includes("placeholder") || p.text.includes("Passage ")) {
        reasons.push(`reading passage[${idx}] contains placeholder string`);
      }
    }
  });
}

function inspectListening(lesson, reasons) {
  if (!lesson.listening) { reasons.push("listening key is missing"); return; }
  if (!lesson.listening.items || !lesson.listening.points) {
    reasons.push("listening requires items and points");
    return;
  }

  const minQuestions = 10;
  if (lesson.listening.items.length < minQuestions) {
    reasons.push(`listening question/item count < ${minQuestions}`);
  }

  lesson.listening.items.forEach((item, idx) => {
    const turns = countTurns(item.script);
    if (turns < 6) {
      reasons.push(`listening item[${idx}] script has only ${turns} turns (minimum 6 required)`);
    }
    // Check choices, answer, explanation
    if (!item.choices || !item.answer || !item.explanation) {
      reasons.push(`listening item[${idx}] missing choices, answer, or explanation`);
    }
  });
}

function inspectVocab(lesson, reasons) {
  if (!lesson.vocab) { reasons.push("vocab key is missing"); return; }
  if (!lesson.vocab.words) { reasons.push("vocab requires words array"); return; }
  
  if (lesson.vocab.words.length < 15) {
    reasons.push(`vocab words count < 15`);
  }
  
  lesson.vocab.words.forEach((w, idx) => {
    if (!w.word || !w.meaning || !w.context) {
      reasons.push(`vocab words[${idx}] missing word/meaning/context`);
    }
  });

  const testQuestions = lesson.vocab.vocabTest?.questions || lesson.vocab.wordTest?.questions || 0;
  if (testQuestions < 10) {
    reasons.push(`vocab test questions count < 10`);
  }
}

function inspectHomework(lesson, reasons) {
  if (!lesson.homework) { reasons.push("homework key is missing"); return; }
  if (!lesson.homework.items) { reasons.push("homework requires items array"); return; }

  let foundR = false, foundL = false, foundV = false;
  
  lesson.homework.items.forEach(h => {
    if (h.type === 'reading') {
      foundR = true;
      if (!h.title.includes('10') && (h.count || 0) < 10) reasons.push("reading homework must explicitly be >= 10 items");
    }
    if (h.type === 'listening') {
      foundL = true;
      if (!h.title.includes('10') && (h.count || 0) < 10) reasons.push("listening homework must explicitly be >= 10 items");
    }
    if (h.type === 'vocab') {
      foundV = true;
      if (!h.title.includes('10') && (h.count || 0) < 10) reasons.push("vocab homework must explicitly be >= 10 items");
    }
    if (h.title.includes("업로드") || h.type === "image") {
      reasons.push("homework contains invalid format (이미지 업로드 금지)");
    }
  });

  if (!foundR || !foundL || !foundV) {
    reasons.push("homework must contain reading, listening, and vocab parts");
  }
}

function runReview() {
  const baseDir = path.join(__dirname, '../src/data/lessons/english');
  const teachers = ['h_eng1', 'h_eng2', 'h_eng3', 'h_eng4', 'h_eng5', 'h_eng6', 'h_eng7', 'h_eng8'];
  const failedLessons = [];
  let totalLessons = 32;
  let passCount = 0;
  let failCount = 0;

  for (const tId of teachers) {
    for (let week = 1; week <= 2; week++) {
      for (let round = 1; round <= 2; round++) {
        const filePath = path.join(baseDir, tId, `week_${week}`, `lesson_0${round}.json`);
        const reasons = [];
        
        if (!fs.existsSync(filePath)) {
          reasons.push('file does not exist');
        } else {
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            inspectReading(data, tId, reasons);
            inspectListening(data, reasons);
            inspectVocab(data, reasons);
            inspectHomework(data, reasons);
          } catch(e) {
            reasons.push(`JSON parsing error: ${e.message}`);
          }
        }

        console.log(`[${tId}] week_${week} / lesson_0${round}`);
        if (reasons.length === 0) {
          console.log(`  => PASS`);
          passCount++;
        } else {
          console.log(`  => FAIL`);
          reasons.forEach(r => console.log(`     - ${r}`));
          failCount++;
          failedLessons.push({
            teacherId: tId,
            week,
            lesson: round,
            reasons
          });
        }
      }
    }
  }

  const report = {
    total_lessons: totalLessons,
    pass_count: passCount,
    fail_count: failCount,
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync(path.join(reportsDir, 'english_review_report.json'), JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(path.join(reportsDir, 'english_failed_lessons.json'), JSON.stringify(failedLessons, null, 2), 'utf8');

  let summaryMd = `# English Lesson Review Summary\n\n`;
  summaryMd += `- Total Lessons: ${totalLessons}\n`;
  summaryMd += `- Pass: ${passCount}\n`;
  summaryMd += `- Fail: ${failCount}\n\n`;
  summaryMd += `## Failed Details\n`;
  failedLessons.forEach(fl => {
    summaryMd += `### ${fl.teacherId} (W${fl.week} L${fl.lesson})\n`;
    fl.reasons.forEach(r => summaryMd += `- ${r}\n`);
    summaryMd += '\n';
  });

  fs.writeFileSync(path.join(reportsDir, 'english_review_summary.md'), summaryMd, 'utf8');
}

runReview();
