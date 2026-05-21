const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let rawContent = fs.readFileSync(filePath, 'utf8');

// 1. JSON 파싱 전, 원시 텍스트 레벨에서 잘못된 백슬래시 교정
// n, r, t, u, f, b, ", \, / 를 제외한 문자 앞에 오는 단일 백슬래시를 이중으로 바꿈
// 단, 이미 이중인 경우는 건드리지 않도록 정교한 Regex 사용
rawContent = rawContent.replace(/\\(?![\\\"\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

try {
  let data = JSON.parse(rawContent);
  console.log("데이터베이스 파싱 성공! 3단계 고도화 진입...");

  const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

  keys.forEach(key => {
    let text = data[key];

    // 수식 기호 정규화
    text = text.replace(/sin\s*\\theta/g, '\\sin\\theta');
    text = text.replace(/cos\s*\\theta/g, '\\cos\\theta');
    text = text.replace(/tan\s*\\theta/g, '\\tan\\theta');

    // 가독성 줄바꿈 (가), (나), (다)
    text = text.replace(/\(가\)/g, '\n\n(가)');
    text = text.replace(/\(나\)/g, '\n(나)');
    text = text.replace(/\(다\)/g, '\n(다)');
    
    // 보기 및 객관식 번호 가독성 확보
    text = text.replace(/<보기>/g, '\n\n[보기]');
    text = text.replace(/ㄱ\./g, '\nㄱ.');
    text = text.replace(/ㄴ\./g, '\nㄴ.');
    text = text.replace(/ㄷ\./g, '\nㄷ.');
    
    if (text.includes('①')) {
      text = text.replace('①', '\n\n①');
    }

    data[key] = text;
  });

  // 3번 문항 최종 정밀 수동 교정
  const key3 = "삼각함수그래프3단계/003.webp";
  if (data[key3]) {
      data[key3] = "0 < \\theta < \\frac{\\pi}{4} 인 \\theta 에 대하여\n다음 보기 중에서 옳은 것만을 있는 대로 고른 것은?\n\n[보기]\nㄱ. 0 < \\sin\\theta < \\cos\\theta < 1\nㄴ. 0 < \\log_{\\cos\\theta}\\sin\\theta < 1\nㄷ. (\\sin\\theta)^{\\cos\\theta} < (\\sin\\theta)^{\\sin\\theta} < (\\cos\\theta)^{\\sin\\theta}\n\n① ㄱ  ② ㄱ, ㄴ  ③ ㄱ, ㄷ  ④ ㄴ, ㄷ  ⑤ ㄱ, ㄴ, ㄷ";
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log("3단계 전 문항 수식 깨짐 및 줄바꿈 교정 완료!");

} catch (e) {
  console.error("복구 실패:", e.message);
}
