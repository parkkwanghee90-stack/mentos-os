const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let raw = fs.readFileSync(filePath, 'utf8');

// 1. 주요 수학 키워드에 대한 백슬래시 이중화 (이미 이중인 경우 제외)
const mathKeywords = ['sin', 'cos', 'tan', 'theta', 'pi', 'sqrt', 'frac', 'overline', 'triangle', 'therefore', 'angle', 'alpha', 'beta', 'gamma', 'delta', 'dots', 'cdots', 'vdots', 'quad', 'text', 'le', 'ge', 'leq', 'geq', 'pm', 'times', 'cdot', 'over'];

mathKeywords.forEach(kw => {
    // \(?!\\)키워드 를 \\키워드 로 변경
    const re = new RegExp(`\\\\(?!\\\\)${kw}`, 'g');
    raw = raw.replace(re, `\\\\${kw}`);
});

// 2. 기타 제어문자가 아닌 모든 단일 백슬래시 구제 (매우 조심스럽게)
// r, n, t, u, f, b, ", \, / 가 아닌 문자 앞의 \를 \\로
raw = raw.replace(/\\(?![\\\"\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

try {
  let data = JSON.parse(raw);
  console.log("데이터베이스 수리 성공! 3단계 고도화 진행...");

  const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

  keys.forEach(key => {
    let text = data[key];
    
    // 수식 기호 정규화
    text = text.replace(/sin\s*\\theta/g, '\\sin\\theta');
    text = text.replace(/cos\s*\\theta/g, '\\cos\\theta');
    
    // 줄바꿈 최적화
    text = text.replace(/\(가\)/g, '\n\n(가)');
    text = text.replace(/\(나\)/g, '\n(나)');
    text = text.replace(/\(다\)/g, '\n(다)');
    text = text.replace(/<보기>/g, '\n\n[보기]');
    text = text.replace(/ㄱ\./g, '\nㄱ.');
    text = text.replace(/ㄴ\./g, '\nㄴ.');
    text = text.replace(/ㄷ\./g, '\nㄷ.');
    
    if (text.includes('①')) {
      text = text.replace('①', '\n\n①');
    }
    data[key] = text;
  });

  // 3번 문항 정밀 수동 교정
  const key3 = "삼각함수그래프3단계/003.webp";
  if (data[key3]) {
    data[key3] = "0 < \\theta < \\frac{\\pi}{4} 인 \\theta 에 대하여\n다음 보기 중에서 옳은 것만을 있는 대로 고른 것은?\n\n[보기]\nㄱ. 0 < \\sin\\theta < \\cos\\theta < 1\nㄴ. 0 < \\log_{\\cos\\theta}\\sin\\theta < 1\nㄷ. (\\sin\\theta)^{\\cos\\theta} < (\\sin\\theta)^{\\sin\\theta} < (\\cos\\theta)^{\\sin\\theta}\n\n① ㄱ  ② ㄱ, ㄴ  ③ ㄱ, ㄷ  ④ ㄴ, ㄷ  ⑤ ㄱ, ㄴ, ㄷ";
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log("3단계 전 문항 수식 깨짐 및 가독성 작업 최종 완료!");

} catch (e) {
  console.error("복구 엔진 임계치 초과:", e.message);
}
