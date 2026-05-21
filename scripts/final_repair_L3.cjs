const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let raw = fs.readFileSync(filePath, 'utf8');

// 1. 모든 단일 백슬래시를 이중으로 (이미 이중인 경우 사중이 됨 -> JSON에서 정상적인 \로 인식)
raw = raw.replace(/\\/g, '\\\\');

// 2. JSON 구조를 파괴하는 \" 를 복구 (\\\\\" -> \")
raw = raw.replace(/\\\\\"/g, '\\"');

try {
  let data = JSON.parse(raw);
  console.log("데이터베이스 구조 복구 성공! 3단계 고도화 진입...");

  const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

  keys.forEach(key => {
    let text = data[key];
    
    // 수식 기호 정규화 및 가독성 최적화
    text = text.replace(/\\sin\\theta/g, '\\sin \\theta');
    text = text.replace(/\\cos\\theta/g, '\\cos \\theta');
    
    // 줄바꿈 (가), (나), (다)
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
    data[key3] = "0 < \\sin \\theta < \\cos \\theta < 1 인 \\theta 에 대하여\n다음 보기 중에서 옳은 것만을 있는 대로 고른 것은?\n\n[보기]\nㄱ. 0 < \\sin \\theta < \\cos \\theta < 1\nㄴ. 0 < \\log_{\\cos \\theta} \\sin \\theta < 1\nㄷ. (\\sin \\theta)^{\\cos \\theta} < (\\sin \\theta)^{\\sin \\theta} < (\\cos \\theta)^{\\sin \\theta}\n\n① ㄱ  ② ㄱ, ㄴ  ③ ㄱ, ㄷ  ④ ㄴ, ㄷ  ⑤ ㄱ, ㄴ, ㄷ";
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log("3단계 전 문항 수식 깨짐 및 줄바꿈 교정 최종 완료!");

} catch (e) {
  console.error("복구 실패 - 상세 오류:", e.message);
  // 오류 지점 주변 텍스트 출력
  if (e.message.includes('position')) {
      const pos = parseInt(e.message.match(/position (\d+)/)[1]);
      console.log("오류 지점 주변:", raw.substring(pos - 20, pos + 20));
  }
}
