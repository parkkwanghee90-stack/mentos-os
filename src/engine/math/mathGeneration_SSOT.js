export const MATH_HINT_SSOT = {
  version: "3.0.0",
  strict_rules: [
    "출력은 오직 JSON 형식만 허용한다. JSON 외 텍스트 출력 금지.",
    "기존 해설을 요약하거나 복사하지 말고 문제를 기반으로 전면 재작성하라.",
    "P, C, B, S, A 필드를 반드시 채운다. 하나라도 비어있으면 생성 실패."
  ],
  system_prompt_enforcement: "
    [MATH HINT GENERATION SSOT: PCBSA FRAMEWORK]
    {
      "P": "문제에서 구하고자 하는 것을 문장에서 그대로 추출해서 작성",
      "C": "문제에서 주어진 수치, 조건을 모두 나열",
      "B": "사용하는 개념 이름 + 공식",
      "S": "계산 과정을 단계별로 전개",
      "A": "최종 정답"
    }
  ",
  validateSSOT: function(data) {
    const valid = ["P","C","B","S","A"].every(k => data[k] && String(data[k]).trim() !== "");
    if (!valid) throw new Error("SSOT 구조 불일치: 필수 필드 누락");
    return true;
  }
};
