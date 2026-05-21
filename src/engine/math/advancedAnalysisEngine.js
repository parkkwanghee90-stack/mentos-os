/**
 * advancedAnalysisEngine.js
 * [PROJECT GOAL] STEP 7, 8 구현: 고급 모델 (gpt-4o) 적용
 * AI 오답 분석 및 5문제 누적 패턴 분석
 */

import { tutorChat } from '@/services/openaiChatApi';

/**
 * [STEP 8] 틀린 문제 즉시 분석 (Instant Incorrect Action)
 * 문제 정보와 학생의 오답을 넣으면 4o가 즉시 교정 논리를 추출합니다.
 */
export async function analyzeIncorrectProblem(problemInfo, pcbsData, studentAnswer, correctAnswer) {
  const systemMessage = '당신은 최상위권 학생을 지도하는 수학 대치동 일타 강사입니다.
학생이 문제를 틀렸을 때 나무라지 않고, 어떻게 사고를 교정해야 하는지를 정확한 논리로 짚어줍니다.
출력은 무조건 제시된 JSON 구조만 반환하세요.`;

  const userMessage = `
[문제 정보]: ${JSON.stringify(problemInfo)}
[표준 PCBS (올바른 사고 방식)]: ${JSON.stringify(pcbsData)}
[학생이 낸 오답]: ${studentAnswer}
[실제 정답]: ${correctAnswer}

이 상황을 기반으로 학생의 사고 과정을 교정하는 분석을 다음 JSON 구조로 출력하세요:
{
  "why_wrong": "학생의 오답이나 접근 방식에서 논리적으로 어떤 부분이 어긋났는가?",
  "correct_thinking": "문제의 조건(C)에서 어떤 정보로 접근(P)했어야 올바른가? (힌트 방식)",
  "key_concept": "반드시 필요한 핵심 개념(B) 한 줄 요약",
  "retry_strategy": "이후 다시 이 유형을 맞히기 위해 학생이 취해야 할 풀이 전략(S)"
}';

  try {
    const response = await tutorChat({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      // 실제로는 json_object 지정하거나 gpt-4o 파라미터 사용
    });
    
    // JSON 추출
    const replyStr = response.reply || response;
    const jsonMatch = replyStr.match(/\\{.*\\}/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("[STEP 8] 분석 중 오류 발생:", error);
    return null;
  }
}

/**
 * [STEP 7] 고급 누적 분석 엔진 (매 5문제 단위 실행)
 * 최근 5문제의 정오답 결과를 종합하여 취약점 및 패턴을 찾아냅니다.
 */
export async function analyzeFiveProblemStreak(recentResults) {
  const systemMessage = '당신은 학생의 문제 풀이 데이터를 기반으로 취약점을 분석하는 AI 어드바이저입니다.
학생의 5문제치 행동 데이터를 분석해 메타인지적인 개선 방향을 제공합니다.
출력은 필수적으로 다음 JSON을 준수하세요:
{
  "weakness": "...",
  "mistake_pattern": "...",
  "strategy_fix": "...",
  "next_approach": "..."
}";

  // recentResults 예: [{ id: "001", isCorrect: true, pcbData: {...}, wrongAnalysis: null }, ...]
  const userMessage = `
최근 5문제 풀이 기록:
${JSON.stringify(recentResults, null, 2)}

위 데이터를 바탕으로 학생의 누적 패턴을 분석하세요.
{
  "weakness": "최근 5문제 기반으로 보이는 학생의 취약 단원 또는 세부 유형",
  "mistake_pattern": "단순 계산 실수인지, 개념의 오해인지 등 반복되는 실수 패턴",
  "strategy_fix": "학습자가 태도나 수학 접근 기법에서 고쳐야 할 개선점",
  "next_approach": "다음 5문제를 풀 때 가장 명심하고 집중해야 할 행동 요령"
}';

  try {
    const response = await tutorChat({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]
    });
    
    // JSON 추출
    const replyStr = response.reply || response;
    const jsonMatch = replyStr.match(/\\{.*\\}/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("[STEP 7] 패턴 분석 중 오류 발생:", error);
    return null;
  }
}
