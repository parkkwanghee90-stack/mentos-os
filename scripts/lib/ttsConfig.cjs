// SSOT for premium-lecture TTS generation: model, voice, prompt, speech config, text cleanup.
const MODEL = 'gemini-3.1-flash-tts-preview';
const VOICE = 'Aoede';

// Fixed delivery instruction — identical across all generation for timbre consistency.
const STYLE_INSTRUCTION =
  '너는 고등학생들의 수학 학습을 돕는 친절하고 활기찬 대학생 여자 선생님이야. ' +
  '입력받은 한국어 수학 텍스트(수식 포함)를 친절하고 자연스러운 구어체로 상냥하게 읽어줘. ' +
  '절대로 추가적인 인사말, 해설, 격려 등 잡담을 전혀 덧붙이지 말고, 오직 아래에 주어진 대본 텍스트 자체만 있는 그대로 읽어줘';

function buildPrompt(text) {
  return `${STYLE_INSTRUCTION}:\n\n${text}`;
}

const SPEECH_CONFIG = {
  voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
};

function cleanNarration(text) {
  if (!text) return '';
  return text
    .replace(/<\/?(blue|green|yellow|red)>/g, '')
    .replace(/\$([^$]*)\$/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1')
    .replace(/\\pm/g, '플러스 마이너스')
    .replace(/\\times/g, ' 곱하기 ')
    .replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq/g, ' 이하')
    .replace(/\\geq/g, ' 이상')
    .replace(/\\neq/g, ' 같지 않음')
    .replace(/\\cdot/g, ' 곱하기 ')
    .replace(/\\alpha/g, '알파')
    .replace(/\\beta/g, '베타')
    .replace(/_n\\mathrm\{P\}_r/g, 'n 피 알')
    .replace(/_n\\mathrm\{C\}_r/g, 'n 시 알')
    .replace(/\^/g, '')
    .replace(/\\quad/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { MODEL, VOICE, STYLE_INSTRUCTION, buildPrompt, SPEECH_CONFIG, cleanNarration };
