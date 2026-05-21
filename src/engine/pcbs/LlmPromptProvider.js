import { PCBS_CONFIG } from './pcbsConfig.js';
import { TemplatePromptProvider } from './TemplatePromptProvider.js';

export class LlmPromptProvider {
  constructor() {
    this.config = PCBS_CONFIG;
    this.fallbackProvider = new TemplatePromptProvider();
  }

  async _fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  }

  async _callLLM(systemPrompt, userPrompt) {
    const { provider, ollama, lmstudio, temperature, max_tokens, timeout_sec } = this.config;
    console.log(`[PCBS_LLM] Using provider: ${provider}`);

    try {
      if (provider === `ollama`) {
        const body = {
          model: ollama.model_name,
          prompt: `${systemPrompt}\n\nUser: ${userPrompt}`,
          stream: false,
          options: { temperature, num_predict: max_tokens }
        };

        const start = Date.now();
        const res = await this._fetchWithTimeout(ollama.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }, timeout_sec * 1000);
        
        const data = await res.json();
        console.log(`[PCBS_LLM] Response time: ${Date.now() - start}ms`);
        return data.response.trim();

      } else if (provider === 'lmstudio') {
        const body = {
          model: lmstudio.model_name,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens,
          stream: false
        };

        const start = Date.now();
        const res = await this._fetchWithTimeout(lmstudio.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }, timeout_sec * 1000);

        const data = await res.json();
        console.log(`[PCBS_LLM] Response time: ${Date.now() - start}ms`);
        return data.choices[0].message.content.trim();
      }
    } catch (e) {
      console.error(`[PCBS_LLM] Error or Timeout calling LLM:`, e);
      throw e;
    }
  }

  async generateQuestion(step, context) {
    if (this.config.provider === 'template') {
      return this.fallbackProvider.generateQuestion(step, context);
    }

    const sysPrompt = `당신은 친절하지만 단호한 수학 교사입니다. 문장 형태는 짧고 간결한 반말(해요체/해라체 믹스)입니다. 절대 2문장 이상 작성하지 마세요. 현재 단계는 [${step}] 입니다.
[P: 문제의 목표 묻기, C: 문제의 단서 묻기, B: 필요한 배경개념 묻기, S: 식 세우기/풀이 묻기] 풀이나 정답을 절대 알려주지 말고, 오직 학생의 사고를 유도하는 1문장 질문만 출력하세요.`;
    const userPrompt = `단원: ${context.unit}\n문제 텍스트: ${context.text || `알 수 없음`}\n위 내용을 바탕으로 단계 ${step}에 맞는 질문 1문장을 생성해줘.`;

    try {
      const result = await this._callLLM(sysPrompt, userPrompt);
      if (!result) throw new Error("Empty response");
      return result;
    } catch (e) {
      console.log("[PCBS_LLM] Fallback to TemplatePromptProvider for question");
      return this.fallbackProvider.generateQuestion(step, context);
    }
  }

  async evaluateShortAnswer(step, answer, context) {
    if (this.config.provider === 'template') {
      return this.fallbackProvider.evaluateShortAnswer(step, answer, context);
    }

    // 간단하고 빠른 키워드 평가
    const sysPrompt = `당신은 학생의 짧은 대답을 채점하는 교사입니다. 학생의 대답이 수학적/논리적으로 현재 단계 [${step}]의 방향성과 맞는지 평가하세요. 맞으면 오직 'true', 틀리면 오직 'false' 라는 단어 하나만 반환하세요.`;
    const userPrompt = `단원: ${context.unit}\n문제 텍스트: ${context.text}\n학생의 대답: ${answer}\n이 대답이 올바른 방향입니까?`;

    try {
      const result = await this._callLLM(sysPrompt, userPrompt);
      if (!result) throw new Error("Empty response");
      return result.toLowerCase().includes('true');
    } catch (e) {
      console.log("[PCBS_LLM] Fallback to TemplatePromptProvider for evaluation");
      return this.fallbackProvider.evaluateShortAnswer(step, answer, context);
    }
  }

  async generateFeedback(step, answer, isCorrect, context) {
    if (this.config.provider === 'template') {
      return this.fallbackProvider.generateFeedback(step, answer, isCorrect, context);
    }

    const sysPrompt = '당신은 친절한 수학 교사입니다. 응답은 무조건 1문장으로 짧게 하세요. 학생의 대답이 정답인지 오답인지에 따라 적절한 1문장 피드백을 생성하세요. 긴 해설 절대 금지.';
    const userPrompt = `학생 대답: ${answer}\n평가 결과: ${isCorrect ? '정답' : '오답/부족함'}\n이 학생에게 해줄 짧은 1문장 피드백은?`;

    try {
      const result = await this._callLLM(sysPrompt, userPrompt);
      if (!result) throw new Error("Empty response");
      return result;
    } catch (e) {
      console.log("[PCBS_LLM] Fallback to TemplatePromptProvider for feedback");
      return this.fallbackProvider.generateFeedback(step, answer, isCorrect, context);
    }
  }

  getFallbackChoices(step, unit) {
    return this.fallbackProvider.getFallbackChoices(step, unit);
  }

  getFallbackMessage(step, unit) {
    return this.fallbackProvider.getFallbackMessage(step, unit);
  }
}
