import avsAnswers from '@/data/avs_answers.json';

/**
 * 정답 단일 로더. 정답이 없으면 절대 더미("3")를 만들지 않고 null 반환.
 * @param {string} answerKey - 예: '수학상_01다항식_통합숙제'
 * @param {number} num - 문제 번호 (1-base)
 * @returns {string|null}
 */
export function resolveAnswer(answerKey, num) {
  const map = avsAnswers[answerKey];
  if (!map) return null;
  const key = String(num).padStart(3, '0');
  const val = map[key];
  if (val === undefined || val === null || val === '') return null;
  return String(val);
}
