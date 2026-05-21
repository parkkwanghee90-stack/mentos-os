export class PcbsEngine {
  constructor(provider, context) {
    this.provider = provider;
    this.context = context; // { unit, grade, level, text, problem_id }
    this.steps = ['P', 'C', 'B', 'S', 'DONE'];
    this.currentIndex = 0;
    this.failCount = 0;
  }

  get currentStep() {
    return this.steps[this.currentIndex];
  }

  get isDone() {
    return this.currentStep === 'DONE';
  }

  get progress() {
    return Math.floor((this.currentIndex / (this.steps.length - 1)) * 100);
  }

  async init() {
    this.currentIndex = 0;
    this.failCount = 0;
    return await this.getNextPrompt();
  }

  async getNextPrompt() {
    if (this.isDone) {
      return { 
        done: true, 
        step: 'DONE',
        question: "수고했어! 완벽하게 사고의 뼈대를 잡았네. 이제 빈 종이에 스스로 풀이를 전개해보자." 
      };
    }
    
    const question = await this.provider.generateQuestion(this.currentStep, this.context);
    return {
      step: this.currentStep,
      question,
      failCount: this.failCount,
      done: false
    };
  }

  async submitAnswer(answer) {
    if (this.isDone) return { done: true };

    const isCorrect = await this.provider.evaluateShortAnswer(this.currentStep, answer, this.context);
    const feedback = await this.provider.generateFeedback(this.currentStep, answer, isCorrect, this.context);

    if (isCorrect) {
      this.currentIndex++;
      this.failCount = 0;
      return { 
        feedback, 
        isCorrect, 
        nextPrompt: await this.getNextPrompt() 
      };
    } else {
      this.failCount++;
      if (this.failCount >= 2) {
        // 2회 실패 시 보기/정답 강제 노출 후 강제 전진
        const choices = this.provider.getFallbackChoices(this.currentStep, this.context.unit);
        const fallbackMessage = this.provider.getFallbackMessage(this.currentStep, this.context.unit);
        
        this.currentIndex++;
        this.failCount = 0;
        
        return { 
          feedback: `거의 다 왔어! 멘토스 AI가 정답을 알려줄게.\n👉 ${fallbackMessage}`, 
          isCorrect: false, 
          choices, 
          isFallback: true,
          nextPrompt: await this.getNextPrompt() 
        };
      }
      return { 
        feedback, 
        isCorrect, 
        nextPrompt: await this.getNextPrompt() 
      };
    }
  }
}
