// src/data/diagnosticQuestionBank.js

// 과목별 기본 문제 제공 예시 템플릿 (AI가 이 형식을 참고하여 문제를 구체화함)
// math, english, physics, chemistry, biology, earthScience 구조화
export const diagnosticQuestionBankTemplate = {
  math: {
    guide: "수학은 특정 함수식 계산, 기하학적 도형의 넓이/부피, 조건에 맞는 근 찾기 등 명확한 계산형/논리형 문제 출제",
    examples: [
      "[계산형] f(x) = x^2 + 2x - 3 일 때 f(2)의 값은?",
      "[응용형] 두 점 (1, 2)와 (3, 6)을 지나는 직선의 방정식에서 기울기는?"
    ]
  },
  english: {
    guide: "영어는 문법상의 오류 찾기, 빈칸에 알맞은 어휘/전치사 채우기, 문장 구조 분석 및 해석 문제 출제",
    examples: [
      "[문법] 다음 문장에서 틀린 부분을 찾아 고치시오: 'He go to school every day.'",
      "[독해/어휘] 빈칸에 들어갈 가장 알맞은 단어는? 'I am looking _____ to seeing you.' (forward / for / at)"
    ]
  },
  physics: {
    guide: "물리는 속도/가속도/힘/에너지 등의 수치 계산과 기호(공식) 적용, 물리적 상황의 결과를 묻는 문제 출제",
    examples: [
      "[상황제시형] 질량 2kg인 물체가 3m/s^2의 가속도로 이동할 때 작용하는 알짜힘은 몇 N인가?",
      "[공식적용형] 10m/s로 일정하게 달리는 자동차가 5초 동안 이동한 거리는?"
    ]
  },
  chemistry: {
    guide: "화학은 화학식 계산, 몰수 변환, 반응물과 생성물의 양적 관계, 원소 주기율표 특성 및 이온 결합 문제 출제",
    examples: [
      "[양적관계] 물(H2O) 1몰에 포함된 수소 원자는 총 몇 몰인가?",
      "[구조/특성] 알칼리 금속이 물과 반응할 때 발생하는 기체는 무엇인가?"
    ]
  },
  biology: {
    guide: "생명과학은 유전 법칙의 확률 계산, 기관계의 작동 원리, 세포 분열의 과정 등 특정 기작의 이해를 묻는 문제 출제",
    examples: [
      "[유전] 유전자형이 Aa인 개체끼리 교배했을 때, 자손에서 aa가 나올 확률은?",
      "[기작특성] 혈당량이 높아졌을 때 췌장에서 분비되어 혈당을 낮추는 호르몬의 이름은?"
    ]
  },
  earthScience: {
    guide: "지구과학은 별의 진화 단계, 지진파 도달 시간(PS시) 계산, 암석의 생성 원리, 대기와 해양의 순환 결과를 묻는 문제 출제",
    examples: [
      "[자료해석/계산] P파가 도달한 후 S파가 도달할 때까지 걸린 시간이 10초일 때, 진앙 거리를 계산하는 공식에 필요한 정보는?",
      "[현상원리] 해륙풍 관측 시, 낮에 바다에서 육지로 부는 바람의 이름과 그 원인은?"
    ]
  }
};

export const getQuestionBankInstruction = (subjectKey) => {
  const bank = diagnosticQuestionBankTemplate[subjectKey];
  if (!bank) return "";
  
  return `[출제 스타일 가이드]
해당 과목(${subjectKey})의 유형에 맞추어 아래 가이드를 절대적으로 따르세요.
- 출제 방향: ${bank.guide}
- 참고 예시:
  ${bank.examples.join('\n  ')}
(위 예시를 그대로 출제하지 말고, 현재 단원에 맞추어 비슷한 구조로 출제할 것)`;
};
