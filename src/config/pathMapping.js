/**
 * Mentos OS Path Mapping System
 * 
 * Maps Korean folder/file names to safe English/numeric names for Supabase Storage.
 * This preserves the local structure while ensuring cloud compatibility.
 */

const PATH_MAP = {
  // Homework top-level and subject folders mapping
  '숙제': 'homework',
  '수학상': 'math_sang',
  '대수 수학1': 'math1_algebra',
  '수학1': 'math1',
  '수학2': 'math2',
  '수학2_out': 'math2_out',
  '미적분': 'calculus',
  '미적분심화': 'calculus_advanced',

  // Homework folders under 숙제/수학상
  '01다항식': '01_polynomial',
  '02나머지정리': '02_remainder',
  '03인수분해': '03_factorization',
  '04복소수': '04_complex_num',
  '05이차방정식': '05_quad_eq',
  '06이차함수1번숙제': '06_quad_func_1',
  '07이차함수2번숙제': '07_quad_func_2',
  '08이차함수3번숙제': '08_quad_func_3',
  '09고차방정식': '09_higher_order_eq',
  '10일차부등식': '10_linear_ineq',
  '11이차부등식': '11_quadratic_ineq',
  '12경우의수': '12_cases',
  '13행렬': '13_matrix',

  // Homework folders under 숙제/수학1
  '01지수': '01_exponent',
  '02로그': '02_logarithm',
  '03지수로그함수': '03_explog_func',
  '04지수로그함수활용': '04_explog_func_util',
  '05삼각함수정의': '05_trig_def',
  '06삼각함수그래프': '06_trig_graph',
  '07삼각함수활용': '07_trig_util',
  '08등차등비수열': '08_seq_apgp',
  '09수열의합': '09_seq_sum',
  '10수학적귀납법': '10_induction',

  // Homework folders under 숙제/수학2
  '01함수의극한': '01_limit',
  '02함수의연속': '02_continuity',
  '03미분계수': '03_derivative_coeff',
  '04도함수의활용1.2': '04_derivative_util_12',
  '04도함수활용12': '04_derivative_util_12',
  '05도함수의활용3': '05_derivative_util_3',
  '05도함수활용3': '05_derivative_util_3',
  '06부정적분과정적분': '06_integral',
  '06부정적분정적분': '06_integral',
  '07정적분의활용': '07_def_integral_util',
  '07정적분활용': '07_def_integral_util',

  // Homework folders under 숙제/미적분
  '01수열의극한': '01_seq_limit',
  '02급수': '02_series',
  '03지수로그함수미분': '03_explog_derivative',
  '04삼각함수미분': '04_trig_derivative',
  '05여러가지미분법': '05_misc_derivatives',
  '06도함수활용1': '06_derivative_util_1',
  '07도함수활용2': '07_derivative_util_2',
  '08여러가지적분법': '08_misc_integrals',
  '09정적분': '09_def_integral',

  // Homework folders under 숙제/대수 수학1
  '01지수2단계': '01_exponent_step2',
  '01지수3.4단계': '01_exponent_step34',
  '02로그2단계': '02_logarithm_step2',
  '02로그3.4단계': '02_logarithm_step34',
  '03지수,로그함수2단계': '03_explog_func_step2',
  '03지수,로그함수3.4단계단계': '03_explog_func_step34',
  '04지수로그함수활용2단계': '04_explog_func_util_step2',
  '04지수로그함수활용3.4단계': '04_explog_func_util_step34',
  '05삼각함수성질및정의2단계': '05_trig_prop_def_step2',
  '05삼각함수성질및정의3.4단계': '05_trig_prop_def_step34',
  '06삼각함수그래프2단계': '06_trig_graph_step2',
  '06삼각함수그래프3.4단계': '06_trig_graph_step34',
  '07삼각함수활용2단계': '07_trig_util_step2',
  '07삼각함수활용3.4단계': '07_trig_util_step34',
  '08등차등비수열2단계': '08_seq_apgp_step2',
  '09등차등비수열3.4단계': '09_seq_apgp_step34',
  '10수열의합2단계': '10_seq_sum_step2',
  '11수열의합3.4단계': '11_seq_sum_step34',
  '12수학적귀납법2단계': '12_induction_step2',
  '12수학적귀납법3.4단계': '12_induction_step34',

  // Homework folders under 숙제/미적분심화
  '01수열의극한2단계': '01_seq_limit_step2',
  '01수열의극한3단계': '01_seq_limit_step3',
  '01수열의극한4단계': '01_seq_limit_step4',
  '02급수2단계': '02_series_step2',
  '02급수3단계': '02_series_step3',
  '02급수4단계': '02_series_step4',
  '03지수로그함수의미분2단계': '03_explog_derivative_step2',
  '03지수로그함수의미분3.4단계': '03_explog_derivative_step34',
  '04삼각함수의미분2단계': '04_trig_derivative_step2',
  '04삼각함수의미분3단계': '04_trig_derivative_step3',
  '04삼각함수의미분4단계': '04_trig_derivative_step4',
  '05여러가지미분법2단계': '05_misc_derivatives_step2',
  '05여러가지미분법3.4단계': '05_misc_derivatives_step34',
  '06도함수의활용1': '06_derivative_util_1',
  '07도함수의활용2': '07_derivative_util_2',
  '08여러가지적분법': '08_misc_integrals',
  '09정적분': '09_def_integral',

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

  // Explicit Step Mappings for Supabase Storage Alignment
  '이차방정식과이차함수2단계': '06_quad_eq_funcstep2',
  '이차방정식과이차함수3단계': '06_quad_eq_funcstep3',
  '이차방정식과이차함수4단계': '06_quad_eq_funcstep4',
  '이차방정식2단계': '05_quad_eqstep2',
  '이차방정식3단계': '05_quad_eqstep3',
  '이차방정식4단계': '05_quad_eqstep4',
  '복소수2단계': '04_complex_numstep2',
  '복소수3단계': '04_complex_numstep3',
  '복소수4단계': '04_complex_numstep4',
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
  'cases_step4': 'cases_step4',
  'cases_step3': 'cases_step3',
  'cases_step2': 'cases_step2',
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

  // Math 1 Explicit Step Mappings
  '지수2단계': 'exp_step2',
  '지수3단계': 'exp_step3',
  '지수4단계': 'exp_step4',
  '지수로그4단계': 'explog_step4',
  '지수함수2단계': 'exp_func_step2',
  '지수함수3단계': 'exp_func_step3',
  '지수함수4단계': 'exp_func_step4',
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
  '삼각함수활용2단계': 'trig_util_step2',
  '삼각함수활용3단계': 'trig_util_step3',
  '삼각함수활용 4단계(68)': 'trig_util_step4',
  '등차등비2단계': 'arith_geom_seqstep2',
  '등차등비3단계': 'arith_geom_seqstep3',
  '등차등비수열4단계': 'arith_geom_seqsequencestep4',
  '시그마용법2단계': 'sigma_step2',
  '여러가지수열3단계': 'seq_misc_step3',
  '수열의합4단계': 'seq_sum_step4',
  '귀납적정의2단계': 'recursive_defstep2',
  '수학적귀납법3단계': 'induction_step3',
  '수학적귀납법4단계': 'induction_step4',

  // Parent folder exact mappings for Math Sang crops
  '(001)다항식': '001_polynomial',
  '(002)항등식과나머지정리': '002_remainder',
  '(003)인수분해': '003_factorization',
  '(004)복소수': '004_complex_num',
  '(005)이차방정식': '005_quad_eq',
  '(006)이차방정식과이차함수': '006_quad_eq_func',

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
  // 복소수~2차함수: 명시 단계 매핑(충돌 방지). sanitizePart 가 exact match 를 최우선으로
  // 처리하므로, '이차방정식'이 '이차방정식과이차함수'의 부분문자열로 먼저 치환되던 버그를 차단.
  // '이차방정식과이차함수'는 전용 네임스페이스(06_quad_eq_func*)로 직결 → 중복 업로드 의존 제거.
  '복소수2단계': '04_complex_numstep2',
  '복소수3단계': '04_complex_numstep3',
  '복소수4단계': '04_complex_numstep4',
  '이차방정식2단계': '05_quad_eqstep2',
  '이차방정식3단계': '05_quad_eqstep3',
  '이차방정식4단계': '05_quad_eqstep4',
  '이차방정식과이차함수2단계': '06_quad_eq_funcstep2',
  '이차방정식과이차함수3단계': '06_quad_eq_funcstep3',
  '이차방정식과이차함수4단계': '06_quad_eq_funcstep4',
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

  // Basic units for Hangul mapping fallback
  '복소수': '04_complex_num',
  '이차방정식': '05_quad_eq',
  '이차방정식과이차함수': '06_quad_eq_func',
  '고차방정식': 'higher_order_eq',
  '다항식': 'polynomial',
  '항등식과나머지정리': 'remainder',
  '인수분해': 'factorization',

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
  '함수의 극한': 'limit',
  '함수의극한': 'limit',
  '함수의 연속': 'continuity',
  '함수의연속': 'continuity',

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
  '3월': 'march',
  '9월': 'sept',
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
