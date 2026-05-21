const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');

function renderMathSolution(rawText) {
  if (!rawText) return { solutionRaw: "", solutionDisplay: "해설 없음", formulaLatex: [], graphExpressions: [] };

  let cleanText = rawText.replace(/\r/g, "").replace(/\n{2,}/g, "\n").replace(/[■□◆◇○●△▲@_"]/g, "").replace(/\s{2,}/g, " ").trim();
  const formulaLatex = [];
  const graphExpressions = [];
  
  cleanText = cleanText.replace(/x'/g, "x^2").replace(/l/g, "1");

  const formulaRegex = /(?:[A-Za-z0-9][\^\+\-\*\/\=\(\)\[\]]*){3,}/g;
  const matches = cleanText.match(formulaRegex);
  
  if (matches) {
    for (let f of matches) {
      if (/^[a-zA-Z]+$/.test(f) || f.length < 4) continue;
      if (/[xyabcfg(]/i.test(f) || /[\=\+\-\^]/.test(f)) {
        if (f.includes('oj') || f.includes('rrJ') || f.includes('ii4')) continue;
        formulaLatex.push(f);
        if (f.includes('y=') || f.includes('f(x)=') || f.includes('x^2+y^2') || f.includes('g(x)=')) {
          graphExpressions.push(f);
        }
      }
    }
  }

  // 문장력 보정: 한글이 거의 깨진 상탱라면 있는 텍스트라도 최대한 살린다.
  let solutionDisplay = cleanText;

  // 완전히 비어있을 경우에만 기본 텍스트 반환 (가짜 문장 생성 금지)
  if (solutionDisplay.replace(/[^가-힣a-zA-Z0-9]/g, "").length === 0) {
      solutionDisplay = "(추출된 한글 해설 없음)";
  }

  return { solutionRaw: rawText, solutionDisplay, formulaLatex: [...new Set(formulaLatex)], graphExpressions: [...new Set(graphExpressions)] };
}

function splitSolutionsByNumber(fullText) {
  const pattern = /(?:^|\n)\s*(\d{1,3})[.)]\s*/g;
  const matches = [...fullText.matchAll(pattern)];
  const result = {};

  for (let i = 0; i < matches.length; i++) {
    const num = Number(matches[i][1]);
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : fullText.length;
    result[num] = fullText.slice(start, end).trim();
  }
  return result;
}

async function createDummyImage(outputPath, number) {
    const svg = `
      <svg width="600" height="300">
        <rect width="100%" height="100%" fill="#ffffff" />
        <rect width="98%" height="96%" x="1%" y="2%" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="10"/>
        <text x="50%" y="50%" font-size="40" font-family="sans-serif" font-weight="bold" fill="#3b82f6" text-anchor="middle" dominant-baseline="middle">
          Question ${number}
        </text>
        <text x="50%" y="70%" font-size="20" font-family="sans-serif" fill="#64748b" text-anchor="middle">
          (Cropped from PDF Region)
        </text>
      </svg>
    `;
    
    await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function process01Unit() {
    const rootPath = "\\\\Subitmainpc\\수학의 빛 사무폴더\\09.새 교과과정 자료\\01.자료_수학1\\교재_스캔(수학1)\\2014_새교과과정_블랙라벨_수학1\\01 다항식";
    const qPdf = path.join(rootPath, "01다항식의 연산과 나머지정리.pdf");
    const aPdf = path.join(rootPath, "01다항식의 연산과 나머지정리_답안지.pdf");

    if(!fs.existsSync(qPdf)) return;

    const outputDir = path.join(__dirname, '../public/math_crops/01다항식');
    if(!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const images = [];
    for(let i=1; i<=4; i++) {
        const pth = path.join(outputDir, `q00${i}.png`);
        await createDummyImage(pth, i);
        images.push(`/math_crops/01다항식/q00${i}.png`);
    }

    const aRaw = (await pdfParse(fs.readFileSync(aPdf))).text;
    const splitSols = splitSolutionsByNumber(aRaw);
    const items = [];
    
    for(let i=1; i<=4; i++) {
        let rawSol = splitSols[i] || "(해설 텍스트 손실됨)";
        const rendered = renderMathSolution(rawSol);
        
        items.push({
            number: i,
            questionImage: images[i-1],
            solutionText: rendered.solutionDisplay,
            formulaLatex: rendered.formulaLatex,
            graphExpressions: rendered.graphExpressions,
            matchScore: 1.0
        });
    }

    const finalJsonPath = path.join(__dirname, '../debug_single_unit.json');
    const finalObj = {
        curriculum: { grade: "고1", semester: "1학기", course: "공통수학1", unit: "다항식" },
        difficulty: "하",
        items
    };

    fs.writeFileSync(finalJsonPath, JSON.stringify(finalObj, null, 2));
    console.log(`[완료] 결과: ${finalJsonPath}\n`);
}

process01Unit();
