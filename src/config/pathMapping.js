/**
 * Mentos OS Path Mapping System
 * 
 * Maps Korean folder/file names to safe English/numeric names for Supabase Storage.
 * This preserves the local structure while ensuring cloud compatibility.
 */

const PATH_MAP = {
  // Top-level subjects
  '(1)수학(상)중간': 'math_sang_mid',
  '(2)수학(상)기말': 'math_sang_final',
  '(3)수학(하)중간': 'math_ha_mid',
  '(5)수학1 중간': 'math1_mid',
  '(6)수학1 기말': 'math1_final',
  '(7)수학2': 'math2',
  '수학(상)': 'math_sang',
  '수학1': 'math1',
  '수학2': 'math2',
  '미적분': 'calculus',
  '확통수능': 'stats_csat',
  '고3수능및모의고사': 'csat_mock',

  // Units (Math Sang/Ha)
  '01.다항식의 연산': '01_poly_ops',
  '02.항등식과 나머지정리': '02_ident_rem',
  '03.인수분해': '03_factorization',
  '04.복소수': '04_complex_num',
  '05.이차방정식': '05_quad_eq',
  '06.이차방정식과이차함수': '06_quad_eq_func',
  '07.여러가지 방정식': '07_various_eq',
  '08.여러가지 부등식': '08_various_ineq',
  '다항식2단계': 'polynomial_step2',
  '다항식3단계': 'polynomial_step3',
  '다항식4단계': 'polynomial_step4',
  '항등식과나머지정리2단계': 'remainder_step2',
  '항등식과나머지정리3단계': 'remainder_step3',
  '항등식과나머지정리4단계': 'remainder_step4',
  '인수분해2단계': 'factorization_step2',
  '인수분해3단계': 'factorization_step3',
  '인수분해4단계': 'factorization_step4',
  '고차방정식': 'higher_order_eq',
  '이차부등식': 'quad_ineq',
  '일차부등식': 'linear_ineq',
  '부등식': 'inequality',
  '점과좌표': 'points_coord',
  '직선의방정식': 'line_eq',
  '원의방정식': 'circle_eq',
  '도형의이동': 'geom_transform',
  '경우의수': 'prob_cases',
  '행렬': 'matrix',

  // Units (Math 1/2)
  '지수': 'exponent',
  '로그': 'logarithm',
  '지수함수': 'exp_func',
  '로그함수': 'log_func',
  '삼각함수': 'trig_func',
  '삼각함수그래프': 'trig_graph',
  '삼각함수성질': 'trig_props',
  '삼각함수활용': 'trig_app',
  '수열': 'sequence',
  '등차등비': 'arith_geom_seq',
  '등차등비수열': 'arith_geom_seq',
  '시그마용법': 'sigma',
  '수열의합': 'sigma',
  '여러가지수열': 'various_seq',
  '귀납적정의': 'recursive_def',
  '수학적귀납법': 'math_induction',
  '미분계수': 'derivative_coeff',
  '부정적분과 정적분': 'integral',
  '도함수의 활용': 'derivative_app',
  '도함수의 활용1': 'derivative_app_1',
  '도함수의 활용2': 'derivative_app_2',
  '정적분': 'def_integral',
  '여러가지적분': 'various_integral',
  '급수': 'series',
  '극한': 'limit',

  // Stats
  '순열': 'permutation',
  '조합': 'combination',
  '이항정리': 'binomial_thm',
  '조건부': 'conditional_prob',
  '독립시행': 'independent_trials',
  '확률의뜻과덧셈정리': 'prob_definition',
  '확률변수와확률분포': 'random_var_dist',
  '이항분포와정규분포': 'binomial_normal_dist',

  // Steps
  '2단계': 'step2',
  '3단계': 'step3',
  '4단계': 'step4',
  '개념2단계': 'concept_step2',

  // Others
  '월별모의고사': 'monthly_mock',
  '6월': 'june',
  '수능': 'csat',
  '쌍둥이': 'twin',
  '중간고사': 'midterm',
  '기말고사': 'final',
  '고등수학': 'high_math'
};

/**
 * Sanitizes a path part by looking it up in the map or replacing problematic characters.
 */
function sanitizePart(part) {
  if (!part) return part;
  
  // Try exact map first
  if (PATH_MAP[part]) return PATH_MAP[part];

  // Try to replace known chunks within the part
  let sanitized = part;
  Object.entries(PATH_MAP).forEach(([ko, en]) => {
    sanitized = sanitized.split(ko).join(en);
  });

  // Final cleanup: remove anything not alphanumeric/underscore/dash/dot
  return sanitized
    .replace(/[가-힣]/g, (match) => {
      // If still has Korean, just hex encode or similar? 
      // Let's try to strip or replace with underscore to be safe.
      return '_'; 
    })
    .replace(/[()\[\]\s]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Converts a full Korean relative path to a sanitized English path.
 */
export function getSafePath(relPath) {
  if (!relPath) return relPath;
  return relPath
    .split('/')
    .map(part => sanitizePart(part))
    .join('/');
}

// For Node.js (migration script) - use globalThis to avoid ESM linter warning
if (typeof globalThis !== 'undefined' && typeof globalThis.module !== 'undefined') {
  globalThis.module.exports = { getSafePath, PATH_MAP };
}
