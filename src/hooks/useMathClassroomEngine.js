/**
 * useMathClassroomEngine.js
 * 공통 데이터 엔진 hook - 문제 로딩, KaTeX 텍스트 매칭, AVS 매칭, 채점 로직
 * (Web LessonRenderer와 모바일 MathClassroom_Mobile이 공유합니다.)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { mathTextsData, answersMasterData, avsAnswersData, loadMathData } from '@/services/mathDataLoader';
import { URL_PREFIX } from '@/config/assets';

const TRIG_ANSWERS = {};

const unitToEnglish = {
  // Math Sang
  '다항식2단계': 'polynomial_step2',
  '다항식3단계': 'polynomial_step3',
  '다항식4단계': 'polynomial_step4',
  '항등식과나머지정리2단계': 'remainder_theorem_step2',
  '항등식과나머지정리3단계': 'remainder_theorem_step3',
  '항등식과나머지정리4단계': 'remainder_theorem_step4',
  '인수분해2단계': 'factorization_step2',
  '인수분해3단계': 'factorization_step3',
  '인수분해4단계': 'factorization_step4',
  '고차방정식2단계': 'higher_order_eqstep2',
  '고차방정식3단계': 'higher_order_eqstep3',
  '고차방정식4단계': 'higher_order_eqstep4',
  '일차부등식2단계': 'linear_ineq_step2',
  '일차부등식3단계': 'linear_ineq_step3',
  '일차부등식4단계': 'linear_ineq_step4',
  '이차부등식2단계': 'quadratic_ineq_step2',
  '이차부등식3단계': 'quadratic_ineq_step3',
  '이차부등식4단계': 'quadratic_ineq_step4',
  '경우의수2단계': 'cases_step2',
  '경우의수3단계': 'cases_step3',
  '경우의수4단계': 'cases_step4',
  '점과좌표2단계': 'point_coord_step2',
  '점과좌표3단계': 'point_coord_step3',
  '점과좌표4단계': 'point_coord_step4',
  '직선의방정식2단계': 'line_eq_step2',
  '직선의방정식3단계': 'line_eq_step3',
  '직선의방정식4단계': 'line_eq_step4',
  '원의방정식2단계': 'circle_eq_step2',
  '원의방정식3단계': 'circle_eq_step3',
  '원의방정식4단계': 'circle_eq_step4',
  '도형의이동2단계': 'shape_move_step2',
  '도형의이동3단계': 'shape_move_step3',
  '도형의이동4단계': 'shape_move_step4',
  '행렬2단계': 'matrix_step2',
  '행렬3단계': 'matrix_step3',
  '행렬4단계': 'matrix_step4',
  // Math 1
  '지수2단계': 'exp_step2',
  '지수3단계': 'exp_step3',
  '지수4단계': 'exp_step4',
  '지수로그4단계': 'explog_step4',
  '지수함수2단계': 'exponent_step2',
  '지수함수3단계': 'exponent_step3',
  '지수함수4단계': 'exponent_step4',
  '지수로그함수4단계': 'explog_func_step4',
  '로그2단계': 'log_step2',
  '로그3단계': 'log_step3',
  '로그4단계': 'log_step4',
  '로그함수2단계': 'log_func_step2',
  '로그함수3단계': 'log_func_step3',
  '로그함수4단계': 'log_func_step4',
  '삼각함수3단계': 'trig_step3',
  '삼각함수그래프': 'trig_graph',
  '삼각함수그래프2단계': 'trig_graph_step2',
  '삼각함수그래프3단계': 'trig_graph_step3',
  '삼각함수그래프4단계': 'trig_graph_step4',
  '삼각함수성질2단계': 'trig_prop_step2',
  '삼각함수활용2단계': 'trig_apply_step2',
  '삼각함수활용3단계': 'trig_apply_step3',
  '삼각함수활용 4단계(68)': 'trig_apply_step4',
  '삼각함수활용4단계': 'trig_apply_step4',
  '등차등비2단계': 'seq_apgp_step2',
  '등차등비3단계': 'seq_apgp_step3',
  '등차등비수열4단계': 'seq_apgp_step4',
  '시그마용법2단계': 'sigma_step2',
  '여러가지수열3단계': 'seq_misc_step3',
  '수열의합4단계': 'seq_sum_step4',
  '귀납적정의2단계': 'induction_def_step2',
  '수학적귀납법3단계': 'induction_step3',
  '수학적귀납법4단계': 'induction_step4',
};

/**
 * getHintFolder
 * - 현재 단원명을 힌트 JSON 폴더명/키로 매핑
 */
export function getHintFolder(unitName, selectedCourse) {
  if (!unitName) return null;
  const clean = unitName.replace(/\s+/g, '');
  const stepMatch = clean.match(/(2|3|4)단계/);
  const stepStr = stepMatch ? stepMatch[0] : '2단계';
  const stepNum = stepMatch ? stepMatch[1] : '2';

  let mapped = clean;
  if (selectedCourse === '기하' || selectedCourse === '수학2') {
    mapped = `(7)수학2/${clean}`;
  } else if (selectedCourse === '미적분') {
    if (clean.includes('수열의극한')) mapped = `1)극한${stepNum}`;
    else if (clean.includes('급수')) mapped = `2)급수${stepNum}`;
    else if (clean.includes('지수로그함수의극한')) mapped = '3)지수로그함수의극한';
    else if (clean.includes('삼각함수미분과극한')) mapped = '4)삼각함수미분과극한';
    else if (clean.includes('여러가지미분법')) mapped = '5)여러가지미분법';
    else if (clean.includes('도함수의활용')) mapped = '6)도함수의활용1';
  }
  return unitToEnglish[mapped] || mapped;
}

/**
 * resolveProblemImage
 * - fallback용 이미지 경로 해결
 */
export function resolveProblemImage(currentUnit, testProblemIdx, selectedCourse) {
  if (!currentUnit) return null;
  const formattedIdx = String(testProblemIdx).padStart(3, '0');
  const stepMatch = currentUnit.match(/(2|3|4)단계/);
  const stepStr = stepMatch ? stepMatch[0] : '2단계';

  const calcMapping = {
    '[2단계] 수열의극한': '1)극한2', '[4단계] 수열의극한': '1)극한4단계',
    '[2단계] 급수': '2)급수2', '[4단계] 급수': '2)급수4단계',
    '[2단계] 지수로그함수의극한': '3)지수로그함수의극한',
    '[4단계] 지수로그삼각함수의 미분법': '3)지수로그삼각함수의 미분법4단계',
    '[2단계] 삼각함수미분과극한': '4)삼각함수미분과극한',
    '[4단계] 여러가지 미분법': '4)여러가지 미분법4단계',
    '[2단계] 여러가지미분법': '5)여러가지미분법',
    '[4단계] 도함수의 활용': '5)도함수의 활용 4단계',
    '[2단계] 도함수의활용1': '6)도함수의활용1',
    '[2단계] 도함수의활용2': '7)도함수의활용2',
    '[2단계] 여러가지 적분법': '7)여러가지적분',
    '[4단계] 여러가지 함수의 적분': '6)여러가지 함수의 적분4단계',
    '[2단계] 초월함수의 정적분': '8)정적분',
    '[4단계] 정적분의 활용': '7)정적분의 활용 4단계'
  };
  const mappedUnit = calcMapping[currentUnit] || currentUnit;
  let img = null;

  if (['1)극한2','2)급수2','3)지수로그함수의극한','4)삼각함수미분과극한','5)여러가지미분법','6)도함수의활용1','7)도함수의활용2','7)여러가지적분','8)정적분'].includes(mappedUnit)) {
    const cs = {'1)극한2':'calc1','2)급수2':'calc2','3)지수로그함수의극한':'calc3','4)삼각함수미분과극한':'calc4','5)여러가지미분법':'calc5','6)도함수의활용1':'calc6','7)도함수의활용2':'calc7_1','7)여러가지적분':'calc7_2','8)정적분':'calc8'};
    img = window.resolveAsset(`/math_crops/미적분2단계/${cs[mappedUnit]||mappedUnit}/${formattedIdx}.webp`);
  } else if (['1)극한4단계','2)급수4단계','3)지수로그삼각함수의 미분법4단계','4)여러가지 미분법4단계','5)도함수의 활용 4단계','6)여러가지 함수의 적분4단계','7)정적분의 활용 4단계'].includes(mappedUnit)) {
    img = window.resolveAsset(`/math_crops/미적분4단계/${mappedUnit}/${formattedIdx}.webp`);
  } else if (selectedCourse === '확률과통계' || mappedUnit.includes('확률') || mappedUnit.includes('통계')) {
    img = window.resolveAsset(`/math_crops/확통수능/${mappedUnit}/${formattedIdx}.webp`);
  } else if (mappedUnit.includes('등차') || mappedUnit.includes('등비')) {
    img = stepStr === '4단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/등차등비수열4단계/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/등차등비${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('시그마') || currentUnit.includes('여러가지수열') || currentUnit.includes('수열의합') || currentUnit.includes('수열의 합')) {
    if (stepStr === '3단계') img = window.resolveAsset(`/math_crops/(5)수학1 중간/3단계/여러가지수열3단계/${formattedIdx}.webp`);
    else if (stepStr === '4단계') img = window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/수열의합4단계/${formattedIdx}.webp`);
    else img = window.resolveAsset(`/math_crops/(5)수학1 중간/2단계/시그마용법2단계/${formattedIdx}.webp`);
  } else if (currentUnit.includes('귀납적') || currentUnit.includes('수학적귀납법')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/2단계/귀납적정의2단계/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/수학적귀납법${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('삼각함수') && currentUnit.includes('활용')) {
    img = stepStr === '4단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수활용${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('삼각함수') && currentUnit.includes('그래프')) {
    img = stepStr === '4단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/삼각함수그래프${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수그래프${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('삼각함수') && (currentUnit.includes('정의') || currentUnit.includes('성질'))) {
    img = window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/삼각함수성질${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('지수함수')) {
    img = stepStr === '4단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그함수4단계/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/지수함수${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('로그함수')) {
    img = stepStr === '4단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그함수4단계/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/로그함수${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('지수') || currentUnit.includes('로그')) {
    img = stepStr === '4단계' ? window.resolveAsset(`/math_crops/(5)수학1 중간/4단계/지수로그4단계/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(5)수학1 중간/${stepStr}/${currentUnit.includes('지수') ? '지수' : '로그'}${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('다항식')) {
    img = window.resolveAsset(`/math_crops/(001)다항식/${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('항등식과나머지정리') || currentUnit.includes('항등식과 나머지정리')) {
    img = window.resolveAsset(`/math_crops/(002)항등식과나머지정리/${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('인수분해')) {
    img = window.resolveAsset(`/math_crops/(003)인수분해/${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('고차방정식')) {
    img = window.resolveAsset(`/math_crops/(2)수학(상)기말/고차방정식${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('일차부등식')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(2)수학(상)기말/(1)일차부등식 개념2단계(26) 1+1(쌍둥이)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(2)수학(상)기말/일차부등식${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('이차부등식')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(2)수학(상)기말/(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(2)수학(상)기말/이차부등식${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('경우의수') || currentUnit.includes('경우의 수')) {
    if (stepStr === '2단계') {
      img = window.resolveAsset(`/math_crops/cases_step2/${formattedIdx}.webp`);
    } else if (stepStr === '3단계') {
      img = window.resolveAsset(`/math_crops/cases_step3/${formattedIdx}.webp`);
    } else if (stepStr === '4단계') {
      img = window.resolveAsset(`/math_crops/cases_step4/${formattedIdx}.webp`);
    } else {
      img = window.resolveAsset(`/math_crops/cases_step2/${formattedIdx}.webp`);
    }
  } else if (currentUnit.includes('점과좌표')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(2)수학(상)기말/(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(2)수학(상)기말/점과좌표${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('직선의방정식') || currentUnit.includes('직선의 방정식')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(2)수학(상)기말/(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(2)수학(상)기말/직선의방정식${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('원의방정식') || currentUnit.includes('원의 방정식')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(2)수학(상)기말/(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(2)수학(상)기말/원의방정식${stepStr}/${formattedIdx}.webp`);
  } else if (currentUnit.includes('도형의이동') || currentUnit.includes('도형의 이동')) {
    img = stepStr === '2단계' ? window.resolveAsset(`/math_crops/(2)수학(상)기말/(8)도형의이동 개념2단계(46)p21 1+1(쌍둥이)/${formattedIdx}.webp`) : window.resolveAsset(`/math_crops/(2)수학(상)기말/도형의이동${stepStr}/${formattedIdx}.webp`);
  } else if (selectedCourse === '기하') {
    img = window.resolveAsset(`/math_crops/(7)수학2/${currentUnit}/${formattedIdx}.webp`);
  } else {
    img = window.resolveAsset(`/math_crops/${currentUnit}/${formattedIdx}.webp`);
  }
  if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
    img = `${URL_PREFIX}${img.startsWith('/') ? img : '/' + img}`;
  }
  img += `?v=20260429_v4`;
  return img;
}

/**
 * resolveProblemText
 */
export function resolveProblemText(currentProblemImage, selectedUnit, currentUnit, testProblemIdx, selectedCourse, sessionProblems) {
  const formattedIdx = String(testProblemIdx).padStart(3, '0');
  let text = null;

  if (sessionProblems && sessionProblems.length >= testProblemIdx) {
    text = sessionProblems[testProblemIdx - 1]?.questionText || null;
  }

  if (currentProblemImage && mathTextsData) {
    let imgKey = currentProblemImage;
    if (imgKey.includes('?')) imgKey = imgKey.split('?')[0];
    try { imgKey = decodeURIComponent(imgKey); } catch(e) {}
    const parts = imgKey.split('/');
    if (parts.length >= 2) {
      const key = parts[parts.length - 2] + '/' + parts[parts.length - 1];
      if (mathTextsData[key]) { text = mathTextsData[key]; }
    }
    if (!text) {
      const hintFolder = getHintFolder(selectedUnit || currentUnit, selectedCourse);
      if (hintFolder) {
        const fallbackKey = `${hintFolder}/${formattedIdx}.webp`;
        if (mathTextsData[fallbackKey]) { text = mathTextsData[fallbackKey]; }
      }
    }
  }
  return text;
}

/**
 * gradeAnswer
 */
export function gradeAnswer({ selectedUnit, currentUnit, selectedCourse, testProblemIdx, userAnswer, selectedAnswer, currentProblemRawData, session, currentPhaseFlow }) {
  const targetUnitFolder = getHintFolder(selectedUnit || currentUnit, selectedCourse);
  const targetProblemNum = Number(testProblemIdx);
  let rawAnswer = null;

  if (TRIG_ANSWERS[targetUnitFolder]?.[targetProblemNum]) {
    rawAnswer = TRIG_ANSWERS[targetUnitFolder][targetProblemNum];
  }

  if (!rawAnswer) {
    const normalizeUnitAndStage = (rawUnit) => {
      if (!rawUnit) return { baseUnit: '', stage: null };
      let clean = rawUnit.replace(/\s+/g, '');
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length > 1) {
          if (parts[parts.length - 1].match(/^[0-9]단계$/)) {
            clean = parts[parts.length - 2] + parts[parts.length - 1];
          } else {
            clean = parts.pop();
          }
        }
      }
      clean = clean.replace(/_/g, '');
      let stage = null;
      const sMatch = clean.match(/(1|2|3|4|5)단계/);
      if (sMatch) { stage = Number(sMatch[1]); clean = clean.replace(sMatch[0], ''); }
      clean = clean.replace(/\//g, '');
      const aliasMap = { '도형의이동': '점과좌표', '삼각함수그래프': '삼각함수', '삼각함수성질': '삼각함수' };
      if (aliasMap[clean]) clean = aliasMap[clean];
      return { baseUnit: clean, stage };
    };
    const normalizeProblemNum = (n) => { if (n == null) return null; const m = String(n).match(/\d+/); return m ? Number(m[0]) : null; };

    const tUnit = normalizeUnitAndStage(selectedUnit || currentUnit);
    const tProb = normalizeProblemNum(targetProblemNum);

    const avsKeyConstructed = tUnit.stage ? `${tUnit.baseUnit}${tUnit.stage}단계` : tUnit.baseUnit;
    const fallbackUnit = (selectedUnit || currentUnit || '').replace(/\s+/g, '').replace(/\//g, '');
    
    let avsUnitData = null;
    if (avsAnswersData) {
      const cleanTarget1 = avsKeyConstructed.replace(/\s+/g, '');
      const cleanTarget2 = fallbackUnit.replace(/\s+/g, '');
      const matchedKey = Object.keys(avsAnswersData).find(k => {
        const cleanK = k.replace(/\s+/g, '').replace(/\//g, '');
        return cleanK === cleanTarget1 || cleanK === cleanTarget2;
      });
      if (matchedKey) {
        avsUnitData = avsAnswersData[matchedKey];
      }
    }

    if (avsUnitData) {
      const pKey1 = String(tProb);
      const pKey2 = String(tProb).padStart(3, '0');
      if (avsUnitData[pKey1] !== undefined || avsUnitData[pKey2] !== undefined) {
        const val = avsUnitData[pKey1] !== undefined ? avsUnitData[pKey1] : avsUnitData[pKey2];
        rawAnswer = (typeof val === 'object' && val !== null) ? (val.ans !== undefined ? val.ans : val.answer) : val;
      }
    }

    if (!rawAnswer && currentProblemRawData) {
      rawAnswer = currentProblemRawData.correctAnswer || currentProblemRawData.A;
    }
    if (!rawAnswer) {
      const masterItem = answersMasterData.find(m => {
        const mUnit = normalizeUnitAndStage(m.unit);
        const isUnitMatch = mUnit.baseUnit === tUnit.baseUnit || mUnit.baseUnit.includes(tUnit.baseUnit) || tUnit.baseUnit.includes(mUnit.baseUnit);
        const isStageMatch = (tUnit.stage && mUnit.stage !== null) ? mUnit.stage === tUnit.stage : true;
        const mProb = normalizeProblemNum(m.problem);
        return isUnitMatch && isStageMatch && mProb === tProb;
      });
      if (masterItem) rawAnswer = masterItem.answer;
    }
  }

  if (!rawAnswer && currentProblemRawData) {
    const d = currentProblemRawData;
    rawAnswer = d.correctAnswer || d.answer || (d.finalAnswer || d.final_answer) || d.solution?.finalAnswer || d.avs?.finalAnswer || d.problem_render?.answer;
  }
  if (!rawAnswer && session?.curriculumData?.lessonContent) {
    const phaseKey = (currentPhaseFlow?.phase || 'core').toLowerCase();
    const phaseProbs = session.curriculumData.lessonContent[phaseKey]?.problems;
    if (phaseProbs && phaseProbs.length >= testProblemIdx) {
      rawAnswer = phaseProbs[testProblemIdx - 1]?.answer || phaseProbs[testProblemIdx - 1]?.finalAnswer;
    }
  }

  if (!rawAnswer) return { isCorrect: null, rawAnswer: null, error: '정답 데이터를 찾을 수 없습니다.' };

  const normalizeAnswer = (ans) => {
    if (!ans) return '';
    let clean = String(ans).replace(/\s+/g, '').replace(/\[|\{/g, '(').replace(/\]|\}/g, ')').replace(/\\pi/gi, 'π').replace(/\\sqrt/gi, '√').replace(/\\frac\{\s*([^}]+)\s*\}\{\s*([^}]+)\s*\}/g, '$1/$2').replace(/\^/g, '').replace(/,/g, '').replace(/\\/g, '').replace(/①|②|③|④|⑤/g, m => ({'①':'1','②':'2','③':'3','④':'4','⑤':'5'}[m])).toLowerCase();
    clean = clean.replace(/^[a-z]+[:=]/, '');
    if (!isNaN(clean) && clean.includes('.')) { const num = parseFloat(clean); if (Number.isInteger(num)) clean = String(num); }
    if (clean.startsWith('+') && !isNaN(clean.substring(1))) clean = clean.substring(1);
    return clean;
  };

  const normUser = normalizeAnswer(userAnswer);
  const normCorrect = normalizeAnswer(rawAnswer);
  const isCorrect = (selectedAnswer !== null && normUser === normCorrect) || (normUser === normCorrect) || (normCorrect.includes(normUser) && normUser.length > 0);

  return { isCorrect, rawAnswer, normUser, normCorrect };
}

export function useMathClassroomEngine() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadMathData().then(() => {
      if (mounted) setIsDataLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  return {
    isDataLoaded,
    getHintFolder,
    resolveProblemImage,
    resolveProblemText,
    gradeAnswer
  };
}
