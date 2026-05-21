export function renderMathSolution(rawText) {
  if (!rawText) {
    return {
      solutionRaw: "",
      solutionDisplay: "해설 없음",
      formulaLatex: [],
      graphExpressions: []
    };
  }

  // 1. 깨진 문자 정리
  let cleanText = rawText
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[■□◆◇○●△▲@_"]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const formulaLatex = [];
  const graphExpressions = [];

  // 2. 수식 후보 추출 휴리스틱
  // x, y, 숫자가 조합된 = 이나 ^ 포맷 추출
  // 예: x^2-4x+1, f(x)=(x-7)F(x), (x-y-1)^2
  
  // 찌그러진 거 살짝 보정
  cleanText = cleanText.replace(/x'/g, "x^2").replace(/l/g, "1");

  const formulaRegex = /(?:[A-Za-z0-9][\^\+\-\*\/\=\(\)\[\]]*){3,}/g;
  const matches = cleanText.match(formulaRegex);
  
  if (matches) {
    for (let f of matches) {
      // 엉뚱한 영문 단어들 필터
      if (/^[a-zA-Z]+$/.test(f) || f.length < 4) continue;
      
      // x, y, f, g, a, b 가 주로 포함된 문자열을 수식으로 간주
      if (/[xyabcfg(]/i.test(f) || /[\=\+\-\^]/.test(f)) {
        // 교정 (ex: "oj1" 같은 파싱오류 제외)
        if (f.includes('oj') || f.includes('rrJ') || f.includes('ii4')) continue;
        
        formulaLatex.push(f);

        // 3. 그래프 가능성 (y=, f(x)=, x^2+y^2)
        if (f.includes('y=') || f.includes('f(x)=') || f.includes('x^2+y^2') || f.includes('g(x)=')) {
          graphExpressions.push(f);
        }
      }
    }
  }

  // 4. 문장력(cleanText) 보정
  // 한글이 있는 문장만 필터, 지나치게 깨진 외계어 제외
  const displayLines = [];
  const lines = cleanText.split('\n');
  for (const line of lines) {
    if (/[가-힣]/.test(line)) {
      displayLines.push(line.trim());
    }
  }

  let solutionDisplay = displayLines.join(" ");
  
  // 너무 짧거나 문장이 없으면 기본 요약 텍스트 대체
  if (solutionDisplay.length < 10) {
      if (formulaLatex.length > 0) {
          solutionDisplay = `식 정리 후 ${formulaLatex[0]} 형태를 이용한다.`;
      } else {
          solutionDisplay = "수식 기반으로 풀이를 진행합니다.";
      }
  }

  return {
    solutionRaw: rawText,
    solutionDisplay,
    formulaLatex: [...new Set(formulaLatex)],
    graphExpressions: [...new Set(graphExpressions)]
  };
}
