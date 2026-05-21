import { PCBS_MOCK_DB } from './pcbsDatabase.js';

export class TemplatePromptProvider {
  constructor() {
    this.db = PCBS_MOCK_DB;
  }

  async generateQuestion(step, context) {
    switch(step) {
      case 'P': return "일단 문제부터 파악해보자. 이 문제에서 궁극적으로 [구해야 하는 것]은 무엇일까?";
      case 'C': return "좋아. 그렇다면 문제 안에 숨겨진 [결정적 단서]는 뭐지?";
      case 'B': return "그 단서를 풀기 위해 네 머릿속에서 꺼내야 할 [핵심 배경 개념]은 무엇일까?";
      case 'S': return "완벽해! 그럼 배운 개념을 토대로, 이제 [어떻게 식을 세우고 풀면] 될까?";
      default: return "";
    }
  }

  async evaluateShortAnswer(step, answer, context) {
    const { unit } = context;
    const expectedData = this.db[unit]?.[step];
    if (!expectedData) return false;
    
    // 단순 키워드 매칭 형태의 평가
    const isCorrect = expectedData.keywords.some(kw => answer.replace(/\s+/g, '').includes(kw));
    return isCorrect;
  }

  async generateFeedback(step, answer, isCorrect, context) {
    if (isCorrect) {
      const good = ["좋아, 정확해!", "맞아, 핵심을 찔렀어.", "훌륭해!", "정확해. 이대로 쭉쭉 가자."];
      return good[Math.floor(Math.random() * good.length)];
    } else {
      const bad = ["거의 맞아. 조금만 더 관찰해볼까?", "음, 방향이 살짝 틀렸어. 힌트를 줄까?", "다시 한 번 고민해보자."];
      return bad[Math.floor(Math.random() * bad.length)];
    }
  }

  // fallback/choice 관련
  getFallbackChoices(step, unit) {
    const expectedData = this.db[unit]?.[step];
    return expectedData ? expectedData.choices : ["보기1", "보기2", "보기3"];
  }

  getFallbackMessage(step, unit) {
    const expectedData = this.db[unit]?.[step];
    return expectedData?.fallback || "정답은 이거야. 눈에 익혀두고 넘어가자!";
  }
}
