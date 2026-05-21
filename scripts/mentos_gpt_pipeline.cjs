const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.VITE_OPENAI_API_KEY;
if (!API_KEY) {
  console.error("OpenAI API key not found in .env");
  process.exit(1);
}

const sysPrompt = `You are generating CSAT-level science questions.

STRICT RULES:
- Every question must be structurally unique
- No duplication
- No rephrasing
- No number-only changes
- Each question must involve different reasoning

Generate:
- 25 unique problems minimum
- At least 5 data analysis questions
- At least 5 multi-step reasoning questions

Output ONLY valid JSON matching this exact structure:
{
  "curriculumRef": "[단원 및 목표]",
  "lessonTypes": ["유형1", "유형2", "유형3", "유형4", "유형5"],
  "lessonFlow": [
    {
      "phase": "diagnosis",
      "targetTime": 15,
      "questions": [
        {
          "given": "문제 조건 데이터",
          "ask": "구체적 질문",
          "reasoning": "추론 요소",
          "tactic": { "출제 의도": "...", "함정 포인트": "...", "해결 전략": "..." }
        }
      ]
    },
    { "phase": "concept_rebuild", "targetTime": 20, "questions": [] },
    { "phase": "core_training", "targetTime": 40, "questions": [] },
    { "phase": "data_analysis", "targetTime": 20, "questions": [] },
    { "phase": "application", "targetTime": 25, "questions": [] }
  ]
}

Requirement constraints:
- diagnosis: 3 to 5 questions
- concept_rebuild: conceptual questions based on data
- core_training: 10+ questions
- data_analysis: 5+ questions
- application: 5+ questions

Total questions must be >= 25.`;

function similarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

async function callChatGPT(grade, rank, unit) {
  const prompt = `Target: ${grade} ${rank}, Topic: ${unit}. Generate minimum 25 questions strictly following the phases and constraints. Do not output anything but JSON.`;
  
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.9 // Higher temp to ensure less duplication
      })
    });
    const data = await res.json();
    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    }
    return null;
  } catch(e) {
    console.error("API Call failed:", e);
    return null;
  }
}

function validateLesson(data) {
  // 1. Structure check
  if (!data.lessonFlow) return "FAIL_STRUCTURE";
  
  const phases = ["diagnosis", "concept_rebuild", "core_training", "data_analysis", "application"];
  let phaseMap = {};
  data.lessonFlow.forEach(p => phaseMap[p.phase] = p);
  
  for(const p of phases) {
    if (!phaseMap[p]) return "FAIL_STRUCTURE";
  }

  // 2. Question counts
  const diagCount = phaseMap.diagnosis.questions?.length || 0;
  const coreCount = phaseMap.core_training.questions?.length || 0;
  const dataCount = phaseMap.data_analysis.questions?.length || 0;
  const appCount = phaseMap.application.questions?.length || 0;
  
  const totalQ = data.lessonFlow.reduce((acc, p) => acc + (p.questions?.length || 0), 0);
  
  if (totalQ < 25) return "FAIL_TOO_FEW_QUESTIONS";
  if (diagCount < 3) return "FAIL_STRUCTURE";
  if (coreCount < 10) return "FAIL_STRUCTURE";
  if (dataCount < 5) return "FAIL_STRUCTURE";
  if (appCount < 5) return "FAIL_STRUCTURE";

  // 3. Type diversity
  if (!data.lessonTypes || data.lessonTypes.length < 3) return "FAIL_NO_TYPE_STRUCTURE";

  // 4. Time Density
  let totalTime = data.lessonFlow.reduce((acc, p) => acc + (p.targetTime || 0), 0);
  if (totalTime < 90) return "FAIL_LOW_DENSITY";
  if (totalTime < 60) return "FAIL_FAKE_LESSON";

  // 5. Quality & Duplications
  let allQChars = [];
  let allExplanationChars = [];
  
  for (const block of data.lessonFlow) {
    if(!block.questions) continue;
    for (const q of block.questions) {
      if (!q.given || !q.ask || !q.reasoning) return "FAIL_LOW_QUALITY";
      if (!q.tactic || !q.tactic["출제 의도"] || !q.tactic["함정 포인트"] || !q.tactic["해결 전략"]) return "FAIL_TACTIC_INVALID";
      
      const qStr = q.ask + q.given;
      for (const prev of allQChars) {
        if (similarity(qStr, prev) > 0.8) return "FAIL_DUPLICATE_QUESTION";
      }
      allQChars.push(qStr);

      const expStr = JSON.stringify(q.tactic);
      for (const prevExp of allExplanationChars) {
        if (similarity(expStr, prevExp) > 0.8) return "FAIL_DUPLICATE_EXPLANATION";
      }
      allExplanationChars.push(expStr);
    }
  }

  return "PASS";
}

async function rebuildPipeline(targetFile, grade, rank, unit, localIntro) {
  console.log(`Starting generation loop for ${targetFile}...`);
  let attempts = 0;
  let passed = false;
  let finalData = null;

  while(!passed && attempts < 5) {
    attempts++;
    console.log(`Attempt ${attempts}...`);
    const gptData = await callChatGPT(grade, rank, unit);
    if (!gptData) continue;

    const vResult = validateLesson(gptData);
    if (vResult === "PASS") {
      passed = true;
      finalData = gptData;
    } else {
      console.log(`Validation Failed: ${vResult}. Retrying API call...`);
    }
  }

  if (passed && finalData) {
    // Add Local intro
    const skeleton = {
      meta: { grade, rank, unit },
      introMent: localIntro,
      ...finalData
    };

    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(skeleton, null, 2));
    console.log(`Successfully generated and verified ${targetFile}`);
  } else {
    console.log(`Failed to generate a valid lesson for ${targetFile} after 5 attempts.`);
  }
}

// POC Trigger for bio_t9 (고3 1등급 다중 뉴런 킬러)
const target = path.join(__dirname, '../src/data/lessons/biology/bio_t9/week_1/lesson_01.json');
const intro = [
  "환영합니다! 다중 뉴런 킬러를 정복할 시간입니다.",
  "이 단원은 감으로 접근하면 시간 초과로 침몰합니다.",
  "오직 거리와 시간의 연립 방정식과 귀류법만이 길입니다.",
  "수능 출제 위원들이 어디서 함정을 심어뒀는지 파헤치겠습니다.",
  "그럼, 당신의 논리를 증명해보십시오."
];

rebuildPipeline(target, "고3", "1~2등급", "다중 뉴런 시냅스 막전위 귀류법", intro);
