import { fetchCurriculumData } from './supabaseClient';

export let mathTextsData = null;
export let answersMasterData = null;
export let avsAnswersData = null;

let fetchPromise = null;

/**
 * 로컬 정적 리소스(/data/...)에서 데이터를 fetch하는 헬퍼 함수
 */
async function fetchLocalData(fileName) {
  const url = `/data/${fileName}`;
  console.log(`[MathDataLoader] Attempting to load from local build static path: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Local fetch status ${response.status}`);
  }
  const data = await response.json();
  console.log(`[MathDataLoader] Successfully loaded ${fileName} from local static path.`);
  return data;
}

export const loadMathData = async () => {
  if (mathTextsData && answersMasterData && avsAnswersData) return;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    console.log("[MathDataLoader] --- Bootstrapping math curriculum data process started ---");
    
    // 1. 수학 문제 텍스트 JSON 데이터 로딩
    if (!mathTextsData) {
      try {
        mathTextsData = await fetchLocalData('math_problem_texts.json');
      } catch (localErr) {
        console.warn(`[MathDataLoader] Local load failed for math_problem_texts.json: ${localErr.message}. Falling back to Supabase Storage...`);
        try {
          mathTextsData = await fetchCurriculumData('mentos-assets', 'data/math_problem_texts.json');
          console.log("[MathDataLoader] Successfully loaded math_problem_texts.json from Supabase Storage.");
        } catch (supaErr) {
          console.error("[MathDataLoader] Supabase Storage fallback also failed for math_problem_texts.json:", supaErr);
          throw supaErr;
        }
      }
      
      // 수학상/수학1 과목 데이터 구조 검증 및 로깅 추가
      if (mathTextsData) {
        const keys = Object.keys(mathTextsData);
        console.log(`[MathDataLoader] math_problem_texts.json analysis: Loaded ${keys.length} main categories.`);
        
        // 수학(상)과 수학1 과목 포함 여부 및 문제 개수 집계 로그
        const mathSangUnits = keys.filter(k => k.includes('수학(상)') || k.includes('수학상'));
        const math1Units = keys.filter(k => k.includes('수학1') || k.includes('수학 1'));
        console.log(`[MathDataLoader] [수학(상)] 관련 단원 개수: ${mathSangUnits.length}개. 단원 목록:`, mathSangUnits);
        console.log(`[MathDataLoader] [수학1] 관련 단원 개수: ${math1Units.length}개. 단원 목록:`, math1Units);
      }
    }

    // 2. 전체 마스터 답안지 JSON 데이터 로딩
    if (!answersMasterData) {
      try {
        answersMasterData = await fetchLocalData('answers_master.json');
      } catch (localErr) {
        console.warn(`[MathDataLoader] Local load failed for answers_master.json: ${localErr.message}. Falling back to Supabase Storage...`);
        try {
          answersMasterData = await fetchCurriculumData('mentos-assets', 'data/answers_master.json');
          console.log("[MathDataLoader] Successfully loaded answers_master.json from Supabase Storage.");
        } catch (supaErr) {
          console.error("[MathDataLoader] Supabase Storage fallback also failed for answers_master.json:", supaErr);
          throw supaErr;
        }
      }
    }

    // 3. AVS 정답지 JSON 데이터 로딩
    if (!avsAnswersData) {
      try {
        avsAnswersData = await fetchLocalData('avs_answers.json');
      } catch (localErr) {
        console.warn(`[MathDataLoader] Local load failed for avs_answers.json: ${localErr.message}. Falling back to Supabase Storage...`);
        try {
          avsAnswersData = await fetchCurriculumData('mentos-assets', 'data/avs_answers.json');
          console.log("[MathDataLoader] Successfully loaded avs_answers.json from Supabase Storage.");
        } catch (supaErr) {
          console.error("[MathDataLoader] Supabase Storage fallback also failed for avs_answers.json:", supaErr);
          throw supaErr;
        }
      }
    }

    console.log("[MathDataLoader] --- All curriculum assets loaded successfully ---");
    fetchPromise = null;
  })();

  return fetchPromise;
};


