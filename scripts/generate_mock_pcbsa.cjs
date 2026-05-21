const fs = require('fs');
const path = require('path');

const exams = [
  { folder: '미적분_2025_6월', name: '2025학년도 6월 모평' },
  { folder: '미적분_2024_6월', name: '2024학년도 6월 모평' },
  { folder: '미적분_2023_6월', name: '2023학년도 6월 모평' }
];

const targetProblems = [10, 11, 12, 13, 14, 15, 21, 22, 27, 28, 29, 30];

// 지오메트리 데이터를 반환하는 함수 (주로 28번, 29번 등 도형 극한 문제용)
function getGeometryData(idx) {
  if (idx === 28 || idx === 29 || idx === 15) {
    return {
      type: "geometry",
      elements: [
        { type: "circle", cx: 0, cy: 0, r: 2, stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.1)" },
        { type: "line", x1: -2, y1: 0, x2: 2, y2: 0, stroke: "#ef4444" },
        { type: "point", x: 0, y: 0, label: "O" },
        { type: "point", x: 2, y: 0, label: "A" },
        { type: "text", x: 0.5, y: -0.5, text: "θ" }
      ],
      description: "도형의 극한을 구하기 위해 보조선을 그은 모습입니다."
    };
  }
  return null;
}

// 약점 단원 매핑 
function getWeaknessUnit(idx) {
  if (idx <= 12) return "삼각함수의 성질";
  if (idx <= 15) return "수열의 귀납적 정의";
  if (idx === 21 || idx === 22) return "미분과 적분의 활용";
  if (idx === 27) return "등비급수와 도형";
  if (idx === 28 || idx === 29) return "삼각함수 극한과 도형";
  if (idx === 30) return "미분법 다항함수 추론";
  return "수학 공통";
}

function generatePCBSA(examName, idx) {
  const isHard = idx >= 21;
  const geometry = getGeometryData(idx);
  const weakness = getWeaknessUnit(idx);
  
  const pcbsa = {
    problem_id: String(idx).padStart(3, '0'),
    title: `${examName} ${idx}번`,
    difficulty: isHard ? "킬러" : "준킬러",
    weakness_unit: weakness,
    steps: [
      {
        phase: "P",
        title: "문제 분석 (Problem)",
        content: `이 문제는 **${weakness}** 개념을 묻는 문제입니다. 구해야 하는 목표 식을 먼저 확인합시다.`,
        audio_script: `이 문제는 ${weakness}를 묻는 문제입니다. 문제에서 요구하는 바를 확실히 짚고 넘어가죠.`
      },
      {
        phase: "C",
        title: "핵심 단서 (Clue)",
        content: `문제에서 주어진 가장 중요한 조건은 무엇일까요? 극한 형태 $$\\lim_{x \\to 0}$$ 꼴을 주목하세요.`,
        audio_script: `단서를 찾아볼까요? 극한 기호 안의 식의 형태를 유심히 관찰해 보세요.`
      },
      {
        phase: "B",
        title: "배경 지식 (Background)",
        content: `여기에 사용되는 필수 개념은 다음과 같습니다:\n1. 로피탈의 정리 또는 테일러 전개 기초\n2. 삼각함수의 극한 근사 ($$\\sin x \\approx x$$)`,
        audio_script: `문제를 풀기 위해 꼭 필요한 개념은 삼각함수의 극한 근사입니다. 잊지 않으셨죠?`
      },
      {
        phase: "SOLVE",
        title: "단계별 풀이 (Solve)",
        content: `자, 이제 식을 세워봅시다. 보조선을 그어 직각삼각형을 만들면 빗변의 길이가 나옵니다.\n$$f(\\theta) = \\frac{1}{2} \\sin \\theta$$\n따라서 극한값은 쉽게 계산됩니다.`,
        audio_script: `이제 직접 식을 세워볼 시간입니다. 천천히 따라와 보세요.`
      },
      {
        phase: "A",
        title: "최종 정답 (Answer)",
        content: `최종 정답은 **15** 입니다.`,
        audio_script: `네, 정답은 15입니다. 수고하셨습니다.`
      }
    ],
    final_answer: "15"
  };

  if (geometry) {
    pcbsa.steps[3].dynamicData = geometry;
  }
  
  return pcbsa;
}

const baseDir = path.join(__dirname, 'public', 'math_pcbs_cache');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

exams.forEach(exam => {
  const examDir = path.join(baseDir, exam.folder);
  if (!fs.existsSync(examDir)) fs.mkdirSync(examDir, { recursive: true });

  targetProblems.forEach(idx => {
    const pcbsa = generatePCBSA(exam.name, idx);
    const filePath = path.join(examDir, `${String(idx).padStart(3, '0')}_pcbs.json`);
    fs.writeFileSync(filePath, JSON.stringify(pcbsa, null, 2), 'utf8');
  });
  console.log(`Generated PCBSA for ${exam.name} (${exam.folder})`);
});
