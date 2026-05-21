require('dotenv').config();
process.env.VITE_OPENAI_MODEL = 'gpt-4o-mini';
const fs = require('fs');
const { tutorChat } = require('../src/services/openaiChatApi.js');

const noAvsList = [
  '이차부등식2단계/001','이차부등식2단계/005','이차부등식2단계/024','이차부등식2단계/037','이차부등식2단계/041',
  '이차부등식3단계/001','이차부등식3단계/003','이차부등식3단계/006','이차부등식3단계/014','이차부등식3단계/021',
  '이차부등식3단계/023','이차부등식3단계/031','이차부등식3단계/032','이차부등식3단계/041','이차부등식3단계/048',
  '이차부등식4단계/013','이차부등식4단계/021','이차부등식4단계/025','이차부등식4단계/028','이차부등식4단계/029',
  '이차부등식4단계/031','이차부등식4단계/034','이차부등식4단계/038'
];

const texts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const avs = JSON.parse(fs.readFileSync('src/data/avs_answers.json', 'utf8'));

async function processMissing() {
  for (const idPath of noAvsList) {
    const [unit, id] = idPath.split('/');
    let textKey = unit + '/' + id + '.webp';
    let avsUnitKey = unit;
    if (unit === '이차부등식2단계') {
      textKey = '(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)/' + id + '.webp';
      avsUnitKey = '(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)';
    }

    const p = 'public/math_hints/' + unit + '/' + id + '.json';
    if (!fs.existsSync(p)) continue;
    
    let j = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    // Check if it already has choices
    if (j.answerType === 'multiple_choice' && j.choices && j.choices.length === 5) {
      if (j.correctChoiceIndex !== undefined) {
        avs[avsUnitKey] = avs[avsUnitKey] || {};
        avs[avsUnitKey][id.replace(/^0+/, '')] = (j.correctChoiceIndex + 1).toString();
        // Also update the simple name if it's 2단계
        if (unit === '이차부등식2단계') {
          avs['이차부등식2단계'] = avs['이차부등식2단계'] || {};
          avs['이차부등식2단계'][id.replace(/^0+/, '')] = (j.correctChoiceIndex + 1).toString();
        }
        console.log(`Already has choices for ${idPath}, updated AVS.`);
        continue;
      }
    }

    const text = texts[textKey];
    if (!text) {
      console.log(`Text not found for ${idPath}`);
      continue;
    }

    console.log(`Processing ${idPath}...`);

    const prompt = `
이 문제는 현재 주관식(또는 정답 누락)입니다. 객관식 5지선다형으로 변환해야 합니다.
문제 텍스트와 현재 풀이 힌트 데이터를 참고하여 매력적인 오답 4개를 포함한 5지선다 보기 배열과 정답 인덱스를 생성하세요.

문제 텍스트:
${text}

현재 힌트 데이터 (정답 도출 과정):
${JSON.stringify(j.steps, null, 2)}

요구사항:
1. choices는 5개의 문자열 배열입니다. 반드시 KaTeX 문법을 따르고 $ 기호를 감싸지 마세요.
2. 부등식인 경우 \\leq, \\geq, <, > 등을 적절히 섞어 오답을 구성하세요.
3. correctChoiceIndex는 0부터 4 사이의 정수입니다 (정답의 인덱스).

오직 JSON 형식으로만 출력하세요:
{
  "choices": ["...", "...", "...", "...", "..."],
  "correctChoiceIndex": 2
}
    `;

    try {
      const response = await tutorChat([
        { role: 'system', content: 'You output only valid JSON.' },
        { role: 'user', content: prompt }
      ]);

      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        if (result.choices && result.choices.length === 5 && result.correctChoiceIndex !== undefined) {
          j.answerType = 'multiple_choice';
          j.choices = result.choices;
          j.correctChoiceIndex = result.correctChoiceIndex;
          j.finalAnswer = (result.correctChoiceIndex + 1).toString();
          j.correctAnswer = j.finalAnswer;

          fs.writeFileSync(p, JSON.stringify(j, null, 2), 'utf8');

          // Update AVS
          const numKey = parseInt(id, 10).toString();
          avs[avsUnitKey] = avs[avsUnitKey] || {};
          avs[avsUnitKey][numKey] = j.finalAnswer;
          if (unit === '이차부등식2단계') {
            avs['이차부등식2단계'] = avs['이차부등식2단계'] || {};
            avs['이차부등식2단계'][numKey] = j.finalAnswer;
          }

          console.log(`Successfully generated choices for ${idPath}`);
        }
      } else {
        console.log(`Failed to parse JSON for ${idPath}`);
      }
    } catch (e) {
      console.log(`Error processing ${idPath}: ${e.message}`);
    }
  }

  fs.writeFileSync('src/data/avs_answers.json', JSON.stringify(avs, null, 2), 'utf8');
  console.log('Finished processing missing AVS problems.');
}

processMissing();
