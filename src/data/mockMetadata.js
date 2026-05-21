// 모의고사/수능 문항 메타데이터 사전
// 오답 문항 하나하나에 unit / subunit / detail_type / level / pcbs_focus / linked_training_sets 를 부여합니다.

export const MOCK_METADATA = {
  // === 2025학년도 수능 (미적분) ===
  '2025_수능_미적분_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2025_수능_미적분_11': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(그래프)', level: 3, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_3단계'] },
  '2025_수능_미적분_12': { unit: '수학2', subunit: '적분', detail_type: '정적분과 넓이', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2025_수능_미적분_13': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '역함수의 미분', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_여러가지미분_3단계', '미적분_여러가지미분_4단계'] },
  '2025_수능_미적분_14': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(속도와 가속도)', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_수능_미적분_15': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(접선/극값/증감)', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_4단계', '수2_미분_3단계'] },
  '2025_수능_미적분_16': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수방정식', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_지수로그_3단계'] },
  '2025_수능_미적분_21': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_수열_4단계'] },
  '2025_수능_미적분_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_수능_미적분_28': { unit: '미적분', subunit: '적분법', detail_type: '치환/부분적분', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['미적분_적분법_4단계'] },
  '2025_수능_미적분_29': { unit: '미적분', subunit: '미분법', detail_type: '도함수의 활용(그래프 개형)', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_미분법_4단계'] },
  '2025_수능_미적분_30': { unit: '미적분', subunit: '적분법', detail_type: '정적분의 활용', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['미적분_적분법_4단계'] },

  // === 2025학년도 수능 (확통) ===
  '2025_수능_확통_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2025_수능_확통_11': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(그래프)', level: 3, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_3단계'] },
  '2025_수능_확통_12': { unit: '수학2', subunit: '적분', detail_type: '정적분과 넓이', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2025_수능_확통_13': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '중복조합', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2025_수능_확통_14': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(속도와 가속도)', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_수능_확통_15': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(접선/극값/증감)', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_수능_확통_21': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_수열_4단계'] },
  '2025_수능_확통_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_수능_확통_28': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '중복조합', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2025_수능_확통_29': { unit: '확률과 통계', subunit: '확률', detail_type: '조건부 확률', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['확통_확률_4단계'] },
  '2025_수능_확통_30': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '순열과 조합 응용', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['확통_경우의수_4단계'] },

  // === 2024학년도 수능 (미적분) ===
  '2024_수능_미적분_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 계산', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2024_수능_미적분_11': { unit: '수학2', subunit: '미분', detail_type: '속도와 거리', level: 3, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_3단계'] },
  '2024_수능_미적분_12': { unit: '수학1', subunit: '수열', detail_type: '등차/등비수열', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_수열_3단계'] },
  '2024_수능_미적분_13': { unit: '미적분', subunit: '수열의 극한', detail_type: '도형과 등비급수', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['미적분_수열극한_4단계'] },
  '2024_수능_미적분_14': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(추론)', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수2_미분_4단계'] },
  '2024_수능_미적분_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['P', 'C'], linked_training_sets: ['수1_수열_4단계'] },
  '2024_수능_미적분_16': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '로그방정식', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_지수로그_3단계'] },
  '2024_수능_미적분_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 그래프', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2024_수능_미적분_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2024_수능_미적분_28': { unit: '미적분', subunit: '미분법', detail_type: '여러가지 미분법', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['미적분_미분법_4단계'] },
  '2024_수능_미적분_29': { unit: '미적분', subunit: '수열의 극한', detail_type: '등비급수', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_수열극한_4단계'] },
  '2024_수능_미적분_30': { unit: '미적분', subunit: '미분법', detail_type: '도함수의 활용(그래프)', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['미적분_미분법_4단계'] },

  // === 2024학년도 수능 (확통) ===
  '2024_수능_확통_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 계산', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2024_수능_확통_11': { unit: '수학2', subunit: '미분', detail_type: '속도와 거리', level: 3, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_3단계'] },
  '2024_수능_확통_12': { unit: '수학1', subunit: '수열', detail_type: '등차/등비수열', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_수열_3단계'] },
  '2024_수능_확통_13': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '순열과 조합', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2024_수능_확통_14': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(추론)', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수2_미분_4단계'] },
  '2024_수능_확통_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['P', 'C'], linked_training_sets: ['수1_수열_4단계'] },
  '2024_수능_확통_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 그래프', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2024_수능_확통_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2024_수능_확통_28': { unit: '확률과 통계', subunit: '확률', detail_type: '조건부 확률', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['확통_확률_4단계'] },
  '2024_수능_확통_29': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '중복조합', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2024_수능_확통_30': { unit: '확률과 통계', subunit: '확률', detail_type: '독립시행의 확률', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['확통_확률_4단계'] },

  // === 2023학년도 수능 (미적분) ===
  '2023_수능_미적분_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2023_수능_미적분_11': { unit: '수학1', subunit: '수열', detail_type: '등차/등비수열', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_수열_3단계'] },
  '2023_수능_미적분_12': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(극값)', level: 3, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_3단계'] },
  '2023_수능_미적분_13': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 함수의 그래프', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2023_수능_미적분_14': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(추론)', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2023_수능_미적분_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['P', 'C'], linked_training_sets: ['수1_수열_4단계'] },
  '2023_수능_미적분_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '로그방정식', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2023_수능_미적분_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2023_수능_미적분_28': { unit: '미적분', subunit: '수열의 극한', detail_type: '도형과 등비급수', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['미적분_수열극한_4단계'] },
  '2023_수능_미적분_29': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '역함수/음함수의 미분', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_여러가지미분_4단계'] },
  '2023_수능_미적분_30': { unit: '미적분', subunit: '적분법', detail_type: '정적분의 활용', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['미적분_적분법_4단계'] },

  // === 2023학년도 수능 (확통) ===
  '2023_수능_확통_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2023_수능_확통_11': { unit: '수학1', subunit: '수열', detail_type: '등차/등비수열', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_수열_3단계'] },
  '2023_수능_확통_12': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(극값)', level: 3, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_미분_3단계'] },
  '2023_수능_확통_13': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '순열과 조합', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2023_수능_확통_14': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(추론)', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2023_수능_확통_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['P', 'C'], linked_training_sets: ['수1_수열_4단계'] },
  '2023_수능_확통_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '로그방정식', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2023_수능_확통_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2023_수능_확통_28': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '중복조합', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2023_수능_확통_29': { unit: '확률과 통계', subunit: '확률', detail_type: '조건부 확률', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['확통_확률_4단계'] },
  '2023_수능_확통_30': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '순열과 조합 응용', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['확통_경우의수_4단계'] },

  // === 2025학년도 6월 모의고사 ===
  '2025_6월_미적분_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_수열_4단계'] },
  '2025_6월_미적분_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 그래프', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2025_6월_미적분_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_6월_미적분_28': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '역함수의 미분', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['미적분_여러가지미분_4단계'] },
  '2025_6월_미적분_29': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '매개변수 미분', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_여러가지미분_4단계'] },
  '2025_6월_미적분_30': { unit: '미적분', subunit: '도함수의 활용', detail_type: '그래프 개형', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['미적분_미분법_4단계'] },

  // === 2026학년도 3월 모의고사 ===
  '2026_3월_미적분_15': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수2_적분_4단계'] },
  '2026_3월_미적분_21': { unit: '수학1', subunit: '수열', detail_type: '등비수열', level: 4, pcbs_focus: ['P', 'S'], linked_training_sets: ['수1_수열_4단계'] },
  '2026_3월_미적분_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2026_3월_미적분_28': { unit: '미적분', subunit: '수열의 극한', detail_type: '도형과 등비급수', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['미적분_수열극한_4단계'] },
  '2026_3월_미적분_29': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '합성함수의 미분', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_여러가지미분_4단계'] },
  '2026_3월_미적분_30': { unit: '미적분', subunit: '도함수의 활용', detail_type: '극값과 그래프', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['미적분_미분법_4단계'] },

  // === 2025학년도 6월 모의고사 (확통) ===
  '2025_6월_확통_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_수열_4단계'] },
  '2025_6월_확통_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 그래프', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2025_6월_확통_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2025_6월_확통_28': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '중복조합', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2025_6월_확통_29': { unit: '확률과 통계', subunit: '확률', detail_type: '조건부 확률', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['확통_확률_4단계'] },
  '2025_6월_확통_30': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '순열과 조합 응용', level: 4, pcbs_focus: ['P', 'C', 'S'], linked_training_sets: ['확통_경우의수_4단계'] },

  // === 2023학년도 6월 모의고사 (미적분) ===
  '2023_6월_미적분_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용(넓이)', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2023_6월_미적분_11': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수방정식', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_지수로그_3단계'] },
  '2023_6월_미적분_12': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(접선)', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_미분_3단계'] },
  '2023_6월_미적분_13': { unit: '수학1', subunit: '삼각함수', detail_type: '삼각함수 활용', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_삼각함수_4단계'] },
  '2023_6월_미적분_14': { unit: '수학2', subunit: '적분', detail_type: '속도와 거리', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_적분_4단계'] },
  '2023_6월_미적분_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_수열_4단계'] },
  '2023_6월_미적분_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 그래프', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2023_6월_미적분_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2023_6월_미적분_27': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '삼각함수의 미분', level: 3, pcbs_focus: ['S'], linked_training_sets: ['미적분_여러가지미분_3단계'] },
  '2023_6월_미적분_28': { unit: '미적분', subunit: '적분법', detail_type: '여러가지 적분', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['미적분_적분법_4단계'] },
  '2023_6월_미적분_29': { unit: '미적분', subunit: '여러가지 미분법', detail_type: '음함수 미분', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['미적분_여러가지미분_4단계'] },
  '2023_6월_미적분_30': { unit: '미적분', subunit: '수열의 극한', detail_type: '급수', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['미적분_수열극한_4단계'] },

  // === 2023학년도 6월 모의고사 (확통) ===
  '2023_6월_확통_10': { unit: '수학2', subunit: '적분', detail_type: '정적분의 활용(넓이)', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_적분_3단계'] },
  '2023_6월_확통_11': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수방정식', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수1_지수로그_3단계'] },
  '2023_6월_확통_12': { unit: '수학2', subunit: '미분', detail_type: '도함수의 활용(접선)', level: 3, pcbs_focus: ['S'], linked_training_sets: ['수2_미분_3단계'] },
  '2023_6월_확통_13': { unit: '수학1', subunit: '삼각함수', detail_type: '삼각함수 활용', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_삼각함수_4단계'] },
  '2023_6월_확통_14': { unit: '수학2', subunit: '적분', detail_type: '속도와 거리', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['수2_적분_4단계'] },
  '2023_6월_확통_15': { unit: '수학1', subunit: '수열', detail_type: '수열의 귀납적 정의', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['수1_수열_4단계'] },
  '2023_6월_확통_21': { unit: '수학1', subunit: '지수함수와 로그함수', detail_type: '지수/로그 그래프', level: 4, pcbs_focus: ['C', 'S'], linked_training_sets: ['수1_지수로그_4단계'] },
  '2023_6월_확통_22': { unit: '수학2', subunit: '미분', detail_type: '다항함수의 추론', level: 4, pcbs_focus: ['P', 'C', 'B', 'S'], linked_training_sets: ['수2_미분_4단계'] },
  '2023_6월_확통_27': { unit: '확률과 통계', subunit: '확률', detail_type: '조건부 확률', level: 3, pcbs_focus: ['S'], linked_training_sets: ['확통_확률_3단계'] },
  '2023_6월_확통_28': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '함수의 개수', level: 4, pcbs_focus: ['C', 'B'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2023_6월_확통_29': { unit: '확률과 통계', subunit: '경우의 수', detail_type: '중복조합', level: 4, pcbs_focus: ['B', 'S'], linked_training_sets: ['확통_경우의수_4단계'] },
  '2023_6월_확통_30': { unit: '확률과 통계', subunit: '확률', detail_type: '확률과 조합', level: 4, pcbs_focus: ['C', 'B', 'S'], linked_training_sets: ['확통_확률_4단계'] },
};

export const getMetadataForProblem = (year, examType, subject, qId) => {
  const key = `${year}_${examType}_${subject}_${qId}`;
  if (MOCK_METADATA[key]) return MOCK_METADATA[key];
  
  // Default metadata if not explicitly mapped
  return {
    unit: subject === 'calculus' ? '미적분' : subject === 'stats' ? '확률과 통계' : subject,
    subunit: '종합',
    detail_type: '일반유형',
    level: qId >= 28 || qId === 22 || qId === 15 ? 4 : 3,
    pcbs_focus: ['S'],
    linked_training_sets: [`${subject}_종합_3단계`]
  };
};
