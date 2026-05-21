import fs from 'fs';

const steps = [
  { "step": 1, "narration": "급수의 기초 정의", "visuals": { "title": "개념 1. 급수의 수렴", "question": "\\sum a_n \\text{ 의 정의는?}", "solution": "\\lim_{n \\to \\infty} S_n = S" } },
  { "step": 2, "narration": "일반항 극한 판정", "visuals": { "title": "개념 2. 일반항 판정법", "question": "\\lim a_n \\neq 0 \\implies ?", "solution": "\\text{발산}" } },
  { "step": 3, "narration": "무한등비급수 조건", "visuals": { "title": "개념 3. 수렴 조건", "question": "|r| < 1", "solution": "S = a/(1-r)" } },
  { "step": 4, "narration": "부분분수 계산", "visuals": { "title": "유형 1. 부분분수", "question": "\\sum 1/n(n+1)", "solution": "1" } },
  { "step": 5, "narration": "로그 계산", "visuals": { "title": "유형 2. 로그 급수", "question": "\\sum \\ln(1-1/n^2)", "solution": "-\\ln 2" } },
  { "step": 6, "narration": "순환소수 응용", "visuals": { "title": "유형 3. 순환소수", "question": "0.1212...", "solution": "4/33" } },

  // --- USER REQUESTED TYPES 7, 8, 9 ---
  { 
    "step": 7, 
    "narration": "유형 7. 점의 극한 위치입니다. 나선형으로 움직이는 점을 관찰하세요.", 
    "visuals": { 
      "title": "유형 7. 점의 극한 (도형 시각화)", 
      "component": "GeometricSeriesAnimation", 
      "props": { "type": "coordinate_path" },
      "question": "\\text{[도형 문제] 좌표평면에서 점 } P_n \\text{ 이 그림과 같이 이동할 때 극한 좌표는?}", 
      "solution": "x = 1 - 1/4 + 1/16 - \\dots = 4/5 \\\\ y = 1/2 - 1/8 + \\dots = 2/5" 
    } 
  },
  { 
    "step": 8, 
    "narration": "유형 8. 무한히 채워지는 원의 넓이 합입니다. 닮음비가 공비의 제곱임을 잊지 마세요.", 
    "visuals": { 
      "title": "유형 8. 도형의 넓이 합 (도형 시각화)", 
      "component": "GeometricSeriesAnimation", 
      "props": { "type": "circles_in_triangle" },
      "question": "\\text{[도형 문제] 정삼각형 안에 무한히 내접하는 원들의 총 넓이는?}", 
      "solution": "r = (1/3)^2 = 1/9 \\\\ S = \\frac{a_1}{1-1/9} = 9/8 a_1" 
    } 
  },
  { 
    "step": 9, 
    "narration": "유형 9. 수능형 활꼴 프랙탈입니다. 첫 넓이를 정확히 구하는 것이 핵심입니다.", 
    "visuals": { 
      "title": "유형 9. 수능 실전 도형 (도형 시각화)", 
      "component": "GeometricSeriesAnimation", 
      "props": { "type": "arc_fractal" },
      "question": "\\text{[도형 문제] 호를 따라 반복되는 활꼴들의 무한 합을 구하시오.}", 
      "solution": "S = \\frac{a_1}{1-r}" 
    } 
  },
  
  { "step": 10, "narration": "급수 종합 마무리", "visuals": { "title": "유형 10. 마무리", "question": "\\sum a_n \\text{ 이 수렴하면 } \\lim a_n = 0 \\text{ 이다.}", "solution": "\\text{참 (True)}" } }
];

const unit = { "id": "미적분_급수", "title": "미적분 - 급수와 도형 (7, 8, 9 시각화)", "subject": "미적분", "steps": steps };
fs.writeFileSync('./public/premium_lectures/미적분_급수.json', JSON.stringify(unit, null, 2));

console.log('Re-ordered and visual-mapped Grade 12 Series!');
