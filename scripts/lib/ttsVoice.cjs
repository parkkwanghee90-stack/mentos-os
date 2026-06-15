'use strict';

// [SSOT] 모든 TTS 생성기의 단일 모델/보이스 공급원.
// 변경 금지 규칙: 음색 일관성을 위해 반드시 gemini-3.1-flash-tts-preview + Aoede.
// 다른 모델(2.5 등)은 같은 Aoede라도 음색이 달라 혼재되므로 금지.

const TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const TTS_VOICE = 'Aoede';

const SYSTEM_INSTRUCTION =
  '너는 수학 학습을 돕는 친절하고 활기찬 여자 대학생 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 자연스러운 한국어 구어로 낭독해줘. 절대로 인사말이나 해설, 추가 설명, 잡담을 덧붙이지 말고, 오직 주어진 텍스트 자체만 있는 그대로 읽어줘. 수식은 한국어 수학 읽기 표준에 맞춰 자연스럽게 읽어줘.';

module.exports = { TTS_MODEL, TTS_VOICE, SYSTEM_INSTRUCTION };
