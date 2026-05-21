/**
 * apiUsageTracker.js
 * API 비용 통제 및 계측 엔진
 * 
 * API 호출 허용 시점:
 * 1. 학생이 [질문하기] 버튼 클릭
 * 2. 5문제 단위 취약 분석 요약 생성
 * 3. 수업 종료 리포트 생성
 * 4. 2주 테스트 결과 요약
 * 
 * 기본 학습에서는 API 호출 금지.
 */

const STORAGE_KEY = 'mentos_api_usage_sessions';

function getUsageData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveUsageData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 현재 세션 찾기 또는 생성
function getOrCreateSession() {
  const data = getUsageData();
  const today = new Date().toISOString().split('T')[0];
  let session = data.find(s => s.date === today);
  
  if (!session) {
    session = {
      date: today,
      startedAt: Date.now(),
      gptCalls: 0,
      inputTokens: 0,
      outputTokens: 0,
      sttSeconds: 0,
      ttsSeconds: 0,
      avsViews: 0,
      totalEstimatedCostUSD: 0,
      callLog: []
    };
    data.push(session);
    saveUsageData(data);
  }
  
  return { session, data };
}

/**
 * API 호출을 기록합니다.
 * @param {'gpt'|'stt'|'tts'|'avs'|'weakness_analysis'|'lesson_report'|'test_report'} type
 * @param {Object} meta - { inputTokens, outputTokens, durationSeconds, reason }
 */
export function trackApiCall(type, meta = {}) {
  const { session, data } = getOrCreateSession();
  
  const logEntry = {
    type,
    timestamp: Date.now(),
    reason: meta.reason || type,
    inputTokens: meta.inputTokens || 0,
    outputTokens: meta.outputTokens || 0,
    durationSeconds: meta.durationSeconds || 0
  };
  
  session.callLog.push(logEntry);

  switch (type) {
    case 'gpt':
      session.gptCalls++;
      session.inputTokens += logEntry.inputTokens;
      session.outputTokens += logEntry.outputTokens;
      // GPT-4o pricing: ~$2.50/1M input, ~$10/1M output
      session.totalEstimatedCostUSD += (logEntry.inputTokens * 2.5 / 1000000) + (logEntry.outputTokens * 10 / 1000000);
      break;
    case 'stt':
      session.sttSeconds += logEntry.durationSeconds;
      // Whisper: ~$0.006/min
      session.totalEstimatedCostUSD += (logEntry.durationSeconds / 60) * 0.006;
      break;
    case 'tts':
      session.ttsSeconds += logEntry.durationSeconds;
      // TTS: ~$0.015/1K chars ≈ duration-based estimate
      session.totalEstimatedCostUSD += (logEntry.durationSeconds / 60) * 0.015;
      break;
    case 'avs':
      session.avsViews++;
      // AVS is local (no cost), but tracked for analytics
      break;
    case 'weakness_analysis':
    case 'lesson_report':
    case 'test_report':
      session.gptCalls++;
      session.inputTokens += logEntry.inputTokens;
      session.outputTokens += logEntry.outputTokens;
      session.totalEstimatedCostUSD += (logEntry.inputTokens * 2.5 / 1000000) + (logEntry.outputTokens * 10 / 1000000);
      break;
  }

  // Update in array
  const idx = data.findIndex(s => s.date === session.date);
  if (idx >= 0) data[idx] = session;
  saveUsageData(data);

  console.log(`[API_TRACKER] ${type}: inputT=${logEntry.inputTokens} outputT=${logEntry.outputTokens} cost=$${session.totalEstimatedCostUSD.toFixed(4)}`);
  
  return session;
}

/**
 * 오늘의 API 사용 요약을 반환합니다.
 */
export function getTodayUsageSummary() {
  const { session } = getOrCreateSession();
  return {
    gptCalls: session.gptCalls,
    inputTokens: session.inputTokens,
    outputTokens: session.outputTokens,
    sttSeconds: session.sttSeconds,
    ttsSeconds: session.ttsSeconds,
    avsViews: session.avsViews,
    totalEstimatedCostUSD: session.totalEstimatedCostUSD,
    callCount: session.callLog.length
  };
}

/**
 * 2시간 수업 기준 API 사용량 리포트를 생성합니다.
 */
export function generateSessionCostReport() {
  const summary = getTodayUsageSummary();
  return `[API 비용 리포트]
GPT 호출: ${summary.gptCalls}회
Input Tokens: ${summary.inputTokens.toLocaleString()}
Output Tokens: ${summary.outputTokens.toLocaleString()}
STT 사용: ${Math.round(summary.sttSeconds)}초
TTS 사용: ${Math.round(summary.ttsSeconds)}초
AVS 시청: ${summary.avsViews}회
총 예상 비용: $${summary.totalEstimatedCostUSD.toFixed(4)} (약 ${Math.round(summary.totalEstimatedCostUSD * 1350)}원)`;
}

/**
 * API 호출이 허용되는지 체크합니다.
 * @param {'question'|'weakness'|'report'|'test'} reason
 */
export function isApiCallAllowed(reason) {
  const ALLOWED_REASONS = ['question', 'weakness', 'report', 'test'];
  return ALLOWED_REASONS.includes(reason);
}
