import { mathTextsData } from './mathDataLoader';

/**
 * Scrambles and clones a math problem based on its type.
 * Returns { questionText: string, answer: string }
 */
export function scrambleMathProblem(originalText, originalAnswer, twinIndex) {
  // Safe helper to extract and scramble integers inside math blocks
  const offset = twinIndex === 0 ? 2 : -1; // Different twins get different values
  const randOffset = () => (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3)) + offset;

  // 1. SPECIFIC SCRAMBLER: Cartesian Plane Coordinates Distance (점과 좌표)
  if (originalText.includes('좌표') || originalText.includes('점 $A') || originalText.includes('선분 $AB')) {
    // Attempt coordinate perfect-triple scrambling
    try {
      // Find coordinates like A(1, 3) or B(3, 5) or C(a, 0)
      const coordRegex = /([A-Z])\((-?\d+),\s*(-?\d+)\)/g;
      const coords = [];
      let match;
      while ((match = coordRegex.exec(originalText)) !== null) {
        coords.push({
          label: match[1],
          x: parseInt(match[2], 10),
          y: parseInt(match[3], 10),
          full: match[0]
        });
      }

      if (coords.length >= 2) {
        // Scramble coords to have a Pythagorean distance (e.g. 5, 10, 13)
        const p1 = coords[0];
        const p2 = coords[1];
        
        // Choose new x1, y1
        const x1_new = p1.x + randOffset();
        const y1_new = p1.y + randOffset();
        
        // Pythagorean triple generators: (3, 4, 5) or (5, 12, 13) or (8, 15, 17)
        const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]];
        const triple = triples[Math.floor(Math.random() * triples.length)];
        const mult = Math.random() > 0.5 ? 1 : -1;
        const dx = triple[0] * mult;
        const dy = triple[1] * (Math.random() > 0.5 ? 1 : -1);
        
        const x2_new = x1_new + dx;
        const y2_new = y1_new + dy;
        const newDistance = String(triple[2]);

        let newText = originalText;
        newText = newText.replace(p1.full, `${p1.label}(${x1_new}, ${y1_new})`);
        newText = newText.replace(p2.full, `${p2.label}(${x2_new}, ${y2_new})`);

        // If the question is finding the distance, update options
        if (originalText.includes('길이') || originalText.includes('최소값') || originalText.includes('최솟값')) {
          const newAns = newDistance;
          // Clean up options inside the text
          const optionRegex = /([①②③④⑤])\s*([^①②③④⑤\n]+)/g;
          let optMatch;
          const options = [];
          while ((optMatch = optionRegex.exec(originalText)) !== null) {
            options.push({ circle: optMatch[1], value: optMatch[2].trim(), full: optMatch[0] });
          }

          if (options.length === 5) {
            // Rebuild options with newDistance as correct option
            const ansIndex = Math.floor(Math.random() * 5); // Randomize correct option index
            const optionValues = [];
            for (let i = 0; i < 5; i++) {
              if (i === ansIndex) {
                optionValues.push(`$${newAns}$`);
              } else {
                const wrongVal = parseInt(newAns, 10) + (i - ansIndex) * 2;
                optionValues.push(`$${Math.max(1, wrongVal)}$`);
              }
            }
            
            let optionsText = "\n\n";
            optionsText += `① ${optionValues[0]}\n`;
            optionsText += `② ${optionValues[1]}\n`;
            optionsText += `③ ${optionValues[2]}\n`;
            optionsText += `④ ${optionValues[3]}\n`;
            optionsText += `⑤ ${optionValues[4]}`;

            // Strip original options and append new options
            newText = newText.split('①')[0].trim() + optionsText;
            return { questionText: newText, answer: String(ansIndex + 1) };
          }
          return { questionText: newText, answer: newAns };
        }
      }
    } catch (e) {
      console.warn("Failed plane coordinate scrambling, falling back to general scrambler", e);
    }
  }

  // 2. SPECIFIC SCRAMBLER: Quadratic Equations (고차방정식 / 이차방정식)
  if (originalText.includes('방정식') && (originalText.includes('x^2') || originalText.includes('x^3') || originalText.includes('x^4'))) {
    try {
      // Find common quadratic forms: x^2 - Sx + P = 0
      const quadRegex = /x\^2\s*([+-]\s*\d+)?x\s*([+-]\s*\d+)?\s*=\s*0/;
      const match = originalText.match(quadRegex);
      if (match) {
        // Scramble roots to be simple integers: e.g. (r1, r2)
        const r1 = 1 + Math.floor(Math.random() * 4) + twinIndex;
        const r2 = r1 + 1 + Math.floor(Math.random() * 3);
        const sum = r1 + r2;
        const prod = r1 * r2;
        
        const sumStr = sum > 0 ? `- ${sum}` : `+ ${Math.abs(sum)}`;
        const prodStr = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
        const newEquation = `x^2 ${sumStr}x ${prodStr} = 0`;
        
        let newText = originalText.replace(match[0], newEquation);
        
        // Roots are r1, r2. Update question/answer
        if (originalText.includes('실근') || originalText.includes('모든 해') || originalText.includes('합')) {
          const newAns = String(sum);
          return { questionText: newText, answer: newAns };
        } else if (originalText.includes('해') || originalText.includes('근')) {
          // If asking for roots, the smaller one could be correct
          const newAns = String(r1);
          return { questionText: newText, answer: newAns };
        }
      }
    } catch (e) {
      console.warn("Failed quadratic scrambling, falling back to general scrambler", e);
    }
  }

  // 3. SPECIFIC SCRAMBLER: Arithmetic & Geometric Progressions (수열 / 등차 / 등비)
  if (originalText.includes('수열') || originalText.includes('등차') || originalText.includes('등비')) {
    try {
      // For general progressions, find term parameters
      // e.g. a_1 = 3, d = 4. Let's find single numbers
      const numMatch = originalText.match(/\$a_1\s*=\s*(\d+)\$/);
      if (numMatch) {
        const a1 = parseInt(numMatch[1], 10);
        const a1_new = a1 + randOffset();
        let newText = originalText.replace(numMatch[0], `$a_1 = ${a1_new}$`);
        
        const dMatch = originalText.match(/\$d\s*=\s*(\d+)\$/);
        if (dMatch) {
          const d = parseInt(dMatch[1], 10);
          const d_new = Math.max(1, d + randOffset());
          newText = newText.replace(dMatch[0], `$d = ${d_new}$`);
          
          // Let's compute a new 5th or 10th term as the answer
          // a_n = a_1 + (n-1)d
          const termMatch = originalText.match(/\$a_{?(\d+)}?\$/);
          if (termMatch) {
            const n = parseInt(termMatch[1], 10);
            const newAns = String(a1_new + (n - 1) * d_new);
            return { questionText: newText, answer: newAns };
          }
        }
      }
    } catch (e) {
      console.warn("Failed progression sequence scrambling, falling back to general", e);
    }
  }

  // 4. SMART GENERAL FALLBACK SCRAMBLER
  // Extracts numbers inside dollars, shifts them by small random offsets,
  // updates the answers and multiple-choice options proportionally.
  try {
    const mathContentRegex = /\$([^\$]+)\$/g;
    let newText = originalText;
    let match;
    const numMappings = [];
    
    // We search all mathematical blocks for digits to scramble
    while ((match = mathContentRegex.exec(originalText)) !== null) {
      const originalBlock = match[0];
      const numbersInBlock = [...match[1].matchAll(/(-?\d+)/g)].map(m => parseInt(m[1], 10));
      
      if (numbersInBlock.length > 0) {
        let scrambledBlock = match[1];
        numbersInBlock.forEach(num => {
          if (Math.abs(num) < 100 && Math.abs(num) > 0) {
            const scrambledNum = num + randOffset();
            scrambledBlock = scrambledBlock.replace(String(num), String(scrambledNum));
            numMappings.push({ original: num, scrambled: scrambledNum });
          }
        });
        newText = newText.replace(originalBlock, `$${scrambledBlock}$`);
      }
    }

    // Now update options or final subjective answers proportionally
    // We calculate a sensible dominant scale factor from the first changed constant
    const mainShift = numMappings.length > 0 ? numMappings[0].scrambled - numMappings[0].original : randOffset();
    
    // Check if it is a multiple-choice layout
    const optionRegex = /([①②③④⑤])\s*([^①②③④⑤\n]+)/g;
    let optMatch;
    const options = [];
    while ((optMatch = optionRegex.exec(originalText)) !== null) {
      options.push({ circle: optMatch[1], value: optMatch[2].trim(), full: optMatch[0] });
    }

    if (options.length === 5) {
      // Multiple choice scaling
      const originalAnsInt = parseInt(originalAnswer, 10);
      const isCircleAnswer = originalAnsInt >= 1 && originalAnsInt <= 5;
      
      const newOptionValues = [];
      for (let i = 0; i < 5; i++) {
        const optVal = options[i].value;
        const optNumMatch = optVal.match(/(-?\d+)/);
        if (optNumMatch) {
          const optNum = parseInt(optNumMatch[1], 10);
          const newOptNum = optNum + mainShift;
          newOptionValues.push(optVal.replace(optNumMatch[1], String(newOptNum)));
        } else {
          newOptionValues.push(optVal); // Keep unchanged if not numeric
        }
      }
      
      let optionsText = "\n\n";
      optionsText += `① ${newOptionValues[0]}\n`;
      optionsText += `② ${newOptionValues[1]}\n`;
      optionsText += `③ ${newOptionValues[2]}\n`;
      optionsText += `④ ${newOptionValues[3]}\n`;
      optionsText += `⑤ ${newOptionValues[4]}`;
      
      newText = newText.split('①')[0].trim() + optionsText;
      return { questionText: newText, answer: originalAnswer }; // Keep the same option index
    } else {
      // Subjective answers
      if (!isNaN(originalAnswer)) {
        const originalAnsInt = parseInt(originalAnswer, 10);
        const newAns = String(Math.max(1, originalAnsInt + mainShift));
        return { questionText: newText, answer: newAns };
      }
    }
    return { questionText: newText, answer: originalAnswer };
  } catch (e) {
    console.error("Smart General Scrambler error:", e);
    return { questionText: originalText, answer: originalAnswer };
  }
}

/**
 * Main Homework Generator function.
 * Called at the end of classroom sessions.
 */
export function generateMathHomework(sessionHistory, courseName, teacherName) {
  if (!sessionHistory || sessionHistory.length === 0) {
    console.log("[HOMEWORK GENERATOR] No session history found. Skipping homework assignment.");
    return null;
  }

  console.log(`[HOMEWORK GENERATOR] Generating personalized homework for ${courseName} under ${teacherName}.`);

  const assignedAt = new Date().toISOString();
  const homeworkId = `math_hw_${Date.now()}`;
  const shortDateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });

  const homeworkProblems = [];
  let twinCount = 0;

  sessionHistory.forEach((solvedItem) => {
    const isCorrect = solvedItem.isCorrect;
    const repeatCount = isCorrect ? 1 : 2; // Correct answers get 1 twin, incorrect get 2 twins
    const problemIndex = solvedItem.problemId;
    const unitName = solvedItem.unit;

    // Pad problem index to match database format, e.g. 2 -> "002"
    const formattedIdx = String(problemIndex).padStart(3, '0');

    // Find original question text inside global mathTextsData
    let originalQuestionText = null;
    if (mathTextsData) {
      const cleanUnit = unitName ? unitName.replace(/\s+/g, '').replace(/[(]\d+[)]/g, '').replace(/개념/g, '') : '';
      
      // Look up key
      const matchedKey = Object.keys(mathTextsData).find(k => {
        const kDecoded = decodeURIComponent(k);
        const cleanK = kDecoded.replace(/\s+/g, '').replace(/[(]\d+[)]/g, '').replace(/개념/g, '');
        return cleanK.includes(cleanUnit) && kDecoded.endsWith(`/${formattedIdx}.webp`);
      });

      if (matchedKey) {
        originalQuestionText = mathTextsData[matchedKey];
      }
    }

    // Fallback if question text not found in local JSON database
    if (!originalQuestionText) {
      originalQuestionText = `다음 문제를 해결하고 올바른 정답을 기입하시오.\n\n$$x^2 - 4x + 3 = 0$$의 실근을 구하시오.\n(원본 문항 ${problemIndex}번 - ${unitName})`;
    }

    const originalAnswer = String(solvedItem.correctAnswer || '3');

    // Generate twin problems
    for (let t = 0; t < repeatCount; t++) {
      const twin = scrambleMathProblem(originalQuestionText, originalAnswer, t);
      homeworkProblems.push({
        problemId: `${homeworkId}_p_${twinCount++}`,
        unit: unitName,
        questionText: twin.questionText + `\n\n*(쌍둥이 유사 문제 ${t + 1} - ${isCorrect ? '개념 다지기' : '오답 클리닉'})*`,
        answer: twin.answer,
        sourceProblemId: problemIndex
      });
    }
  });

  if (homeworkProblems.length === 0) return null;

  // 1. Save homework metadata inside 'mentosHomework'
  const localHwList = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
  const newHwMetadata = {
    homeworkId: homeworkId,
    title: `[오답 분석 클리닉] ${courseName} 핵심 복습 과제`,
    assignedAt: assignedAt,
    status: 'assigned',
    subject: 'math',
    teacherId: teacherName || 'AI 튜터'
  };
  localHwList.unshift(newHwMetadata);
  localStorage.setItem('mentosHomework', JSON.stringify(localHwList));

  // 2. Save homework problems details inside 'mentos_math_homework_db'
  const localHwDb = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
  const newHwDbEntry = {
    homeworkId: homeworkId,
    title: `[오답 분석 클리닉] ${courseName} 핵심 복습 과제`,
    date: shortDateStr,
    problems: homeworkProblems
  };
  localHwDb.push(newHwDbEntry);
  localStorage.setItem('mentos_math_homework_db', JSON.stringify(localHwDb));

  console.log(`[HOMEWORK GENERATOR SUCCESS] Personalized homework created: ${homeworkId} with ${homeworkProblems.length} twin problems.`);

  return {
    homeworkId,
    problemsCount: homeworkProblems.length
  };
}
