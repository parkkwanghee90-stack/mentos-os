import { mathTextsData, avsAnswersData } from './mathDataLoader.js';
import { HOMEWORK_UNITS, getHomeworkRange } from '../data/homeworkSSOT.js';
import { resolveAnswer } from './answerResolver.js';

/**
 * 도형의 방정식 단원(통합숙제 SSOT 미수록) — 단계별 크롭/정답에 직접 연결.
 * 문제 이미지: Supabase /math_crops/<folder>/<pid>.webp, 정답: avs_answers[answerKey][pid]
 * pid 목록은 avs_answers의 키에서 동적으로 추출(실재 문항만 → 404 방지).
 */
const GEOMETRY_HOMEWORK_UNITS = [
  { match: ['점과좌표', '점과 좌표'],     title: '점과 좌표',     folder: 'point_coord_step3', answerKey: '점과좌표3단계' },
  { match: ['직선의방정식', '직선의 방정식'], title: '직선의 방정식', folder: 'line_eq_step2',     answerKey: '직선의방정식2단계' },
  { match: ['원의방정식', '원의 방정식'],   title: '원의 방정식',   folder: 'circle_eq_step4',   answerKey: '원의방정식4단계' },
  { match: ['도형의이동', '도형의 이동'],   title: '도형의 이동',   folder: 'shape_move_step2',  answerKey: '도형의이동2단계' },
];

/** 도형 단원이면 단계별 크롭으로 dynamic 숙제를 만들어 반환. 아니면 null. */
function tryGenerateGeometryHomework(currentUnitName, courseName, teacherName, homeworkId, assignedAt, shortDateStr) {
  const clean = (currentUnitName || '').replace(/\s+/g, '');
  const geo = GEOMETRY_HOMEWORK_UNITS.find(g =>
    g.match.some(m => { const mc = m.replace(/\s+/g, ''); return clean.includes(mc) || mc.includes(clean); }));
  if (!geo) return null;

  const ansMap = (avsAnswersData && avsAnswersData[geo.answerKey]) || {};
  const allPids = Object.keys(ansMap).filter(k => /^\d{3}$/.test(k)).sort();
  if (allPids.length === 0) return null;

  // 등급별 문항 수: 1~2/3등급은 전체(최대 21), 4~5등급은 10문항
  const studentLevel = localStorage.getItem('studentLevel') || '4~5등급';
  const cap = (studentLevel.includes('1~2') || studentLevel.includes('3')) ? 21 : 10;
  const pids = allPids.slice(0, Math.min(cap, allPids.length));

  const problems = pids.map((pid, i) => ({
    problemId: `${homeworkId}_p_${i}`,
    unit: geo.answerKey,
    questionText: `[${geo.title} 보강] 다음 문제 이미지를 분석하고 정확한 정답을 입력하시오.`,
    problemImage: `/math_crops/${geo.folder}/${pid}.webp`,
    answer: ansMap[pid] != null ? String(ansMap[pid]) : '',
    sourceProblemId: parseInt(pid, 10),
    isHomework: true,
  }));

  const homeworkTitle = `[취약단원 보강] ${geo.title} 핵심 과제`;
  const localHwList = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
  localHwList.unshift({
    homeworkId, title: homeworkTitle, assignedAt, status: 'assigned',
    subject: 'math', teacherId: teacherName || 'AI 튜터', unitKey: geo.answerKey,
  });
  localStorage.setItem('mentosHomework', JSON.stringify(localHwList));

  const localHwDb = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
  localHwDb.push({ homeworkId, title: homeworkTitle, date: shortDateStr, problems });
  localStorage.setItem('mentos_math_homework_db', JSON.stringify(localHwDb));

  console.log(`[HOMEWORK GENERATOR] 도형 숙제 생성: ${geo.title} (${geo.folder}) ${problems.length}문항`);
  return { homeworkId, problemsCount: problems.length };
}


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
export function generateMathHomework(sessionHistory, courseName, teacherName, options = {}) {
  let assignedAt = new Date().toISOString();
  let homeworkId = `math_hw_${Date.now()}`;
  let shortDateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });

  // 1. Resolve unit name to target from solved history or earlyExit options
  let solvedHistory = sessionHistory || [];
  let currentUnitName = options.currentUnit;

  if (!currentUnitName && solvedHistory.length > 0) {
    currentUnitName = solvedHistory[0].unit;
  }

  if (!currentUnitName) {
    console.log("[HOMEWORK GENERATOR] No unit info found. Skipping homework assignment.");
    return null;
  }

  console.log(`[HOMEWORK GENERATOR] Generating unified homework for ${currentUnitName} (Course: ${courseName}, Teacher: ${teacherName}).`);

  // 0. 도형의 방정식 단원(통합숙제 SSOT 미수록) → 단계별 크롭으로 직접 생성
  const geometryResult = tryGenerateGeometryHomework(currentUnitName, courseName, teacherName, homeworkId, assignedAt, shortDateStr);
  if (geometryResult) return geometryResult;

  // 2. Identify matching homework unit inside homeworkSSOT.js
  const cleanUnitName = currentUnitName.replace(/\s+/g, '').replace(/[(]/g, '').replace(/[)]/g, '').replace(/단계/g, '').replace(/[\[\]\·]/g, '').replace(/개념/g, '');
  
  let matchedUnit = HOMEWORK_UNITS.find(u => {
    let courseMatch = true;
    if (courseName) {
      const cleanCourse = courseName.replace(/\s+/g, '').toLowerCase();
      const cleanSubj = (u.subject || '수학상').replace(/\s+/g, '').toLowerCase();
      if (cleanCourse.includes('미적분')) courseMatch = cleanSubj.includes('미적분');
      else if (cleanCourse.includes('수학1') || cleanCourse.includes('수1') || cleanCourse.includes('대수')) courseMatch = cleanSubj.includes('수학1');
      else if (cleanCourse.includes('수학2') || cleanCourse.includes('수2')) courseMatch = cleanSubj.includes('수학2');
      else if (cleanCourse.includes('상') || cleanCourse.includes('하')) courseMatch = cleanSubj.includes('수학상') || !u.subject;
    }
    if (!courseMatch) return false;

    const cleanRel = (u.relatedUnit || '').replace(/\s+/g, '');
    const cleanTitle = (u.title || '').replace(/\s+/g, '');
    const cleanFolder = (u.folderName || '').replace(/\s+/g, '');
    return cleanRel.includes(cleanUnitName) || cleanUnitName.includes(cleanRel) ||
           cleanTitle.includes(cleanUnitName) || cleanUnitName.includes(cleanTitle) ||
           cleanFolder.includes(cleanUnitName) || cleanUnitName.includes(cleanFolder);
  });

  // 단원명이 어떤 통합숙제 단원과도 매칭되지 않으면 숙제를 만들지 않는다.
  // (이전엔 '첫 과목단원' / HOMEWORK_UNITS[0]로 폴백 → 예: '원의 방정식' 수업인데
  //  엉뚱하게 '다항식' 숙제가 나가던 버그. 미커버 단원은 차라리 건너뛴다.)
  if (!matchedUnit) {
    console.warn(`[HOMEWORK GENERATOR] '${currentUnitName}'에 매칭되는 통합숙제 단원이 없어 숙제 생성을 건너뜁니다(엉뚱한 단원 발송 방지).`);
    return null;
  }

  // 3. Determine problem range based on student rank stage configs
  const studentLevel = localStorage.getItem('studentLevel') || '4~5등급';
  const range = getHomeworkRange(matchedUnit, studentLevel);
  const startIdx = range.start;
  const endIdx = range.end;

  const answerKey = matchedUnit.answerKey;
  let ansMap = avsAnswersData ? avsAnswersData[answerKey] : null;

  if (!ansMap) {
    const cachedAnswers = JSON.parse(localStorage.getItem('avs_answers_cache') || '{}');
    ansMap = cachedAnswers[answerKey];
  }

  // 4. Generate package problems
  const homeworkProblems = [];
  let problemCount = 0;

  for (let idx = startIdx; idx <= endIdx; idx++) {
    const keyStr = String(idx).padStart(3, '0');
    const subjFolder = matchedUnit.subject === '미적분' ? '미적분' :
                       matchedUnit.subject === '수학1' ? '수학1' :
                       matchedUnit.subject === '수학2' ? '수학2' : '수학상';
    const problemImage = `/math_crops/숙제/${subjFolder}/${matchedUnit.folderName}/${keyStr}.webp`;

    homeworkProblems.push({
      problemId: `${homeworkId}_p_${problemCount++}`,
      unit: answerKey,
      questionText: `[${courseName} 핵심 보강] 다음 문제 이미지를 분석하고 정확한 정답을 입력하시오.`,
      problemImage: problemImage,
      answer: (ansMap && ansMap[keyStr] != null) ? ansMap[keyStr] : resolveAnswer(matchedUnit.answerKey, idx),
      sourceProblemId: idx,
      isHomework: true
    });
  }

  if (homeworkProblems.length === 0) return null;

  const cleanTitleName = (matchedUnit.relatedUnit || matchedUnit.title || '수학').replace(/[0-9]/g, '').trim();
  const homeworkTitle = `[개인 맞춤 보강] ${courseName} ${cleanTitleName} 핵심 과제`;

  // 5. Update local mentosHomework list
  const localHwList = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
  const newHwMetadata = {
    homeworkId: homeworkId,
    title: homeworkTitle,
    assignedAt: assignedAt,
    status: 'assigned',
    subject: 'math',
    teacherId: teacherName || 'AI 튜터',
    unitKey: answerKey
  };
  localHwList.unshift(newHwMetadata);
  localStorage.setItem('mentosHomework', JSON.stringify(localHwList));

  // 6. Update local mentos_math_homework_db details
  const localHwDb = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
  const newHwDbEntry = {
    homeworkId: homeworkId,
    title: homeworkTitle,
    date: shortDateStr,
    problems: homeworkProblems
  };
  localHwDb.push(newHwDbEntry);
  localStorage.setItem('mentos_math_homework_db', JSON.stringify(localHwDb));

  console.log(`[HOMEWORK GENERATOR SUCCESS] Unified Homework created: ${homeworkId} with ${homeworkProblems.length} custom package problems.`);

  return {
    homeworkId,
    problemsCount: homeworkProblems.length
  };
}

