export const PCBS_CONFIG = {
  // 사용 가능한 provider: 'template', 'ollama', 'lmstudio'
  provider: 'ollama',
  
  // Ollama 설정
  ollama: {
    endpoint: 'http://localhost:11434/api/generate',
    model_name: 'qwen2.5:latest', // 추천: qwen, gemma, mistral 등
  },
  
  // LM Studio 설정
  lmstudio: {
    endpoint: 'http://localhost:1234/v1/chat/completions',
    model_name: 'local-model',
  },

  // LLM 공통 파라미터
  temperature: 0.3,
  max_tokens: 150,
  timeout_sec: 5000, // 5초 타임아웃
};
