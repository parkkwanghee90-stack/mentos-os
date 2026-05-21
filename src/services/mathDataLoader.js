import { fetchCurriculumData } from './supabaseClient';

export let mathTextsData = null;
export let answersMasterData = null;
export let avsAnswersData = null;

let fetchPromise = null;

export const loadMathData = async () => {
  if (mathTextsData && answersMasterData && avsAnswersData) return;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      console.log("[MathDataLoader] Bootstrapping math curriculum data from Supabase Storage...");
      if (!mathTextsData) {
        mathTextsData = await fetchCurriculumData('math-curriculum', 'math_problem_texts.json');
      }
      if (!answersMasterData) {
        answersMasterData = await fetchCurriculumData('math-curriculum', 'answers_master.json');
      }
      if (!avsAnswersData) {
        avsAnswersData = await fetchCurriculumData('math-curriculum', 'avs_answers.json');
      }
      console.log("[MathDataLoader] All curriculum assets loaded successfully.");
    } catch (err) {
      console.error("Failed to load math data from Supabase Storage:", err);
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

