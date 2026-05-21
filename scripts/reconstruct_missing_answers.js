import fs from 'fs';
import path from 'path';

const baseDir = './public/math_hints';
const answersMaster = JSON.parse(fs.readFileSync('./src/data/answers_master.json', 'utf8'));
const avsAnswers = JSON.parse(fs.readFileSync('./src/data/avs_answers.json', 'utf8'));

const targetFolders = [
  '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
  '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
  '도형의이동2단계', '도형의이동3단계', '도형의이동4단계'
];

let results = {
  fixed: 0,
  manualReview: 0
};

function normalize(ans) {
    if (!ans) return '';
    return String(ans).trim().toLowerCase().replace(/^[a-z]+[:=]/, '');
}

function findAnswer(item) {
    // 1. AVS Answers (Highest priority for AVS problems)
    const unitStage = `${item.unit}${item.stage}단계`;
    if (avsAnswers[unitStage] && avsAnswers[unitStage][item.problemNumber]) {
        return { answer: avsAnswers[unitStage][item.problemNumber], source: 'avs' };
    }

    // Normalized unit name mapping
    const unitMap = {
        '일차부등식': ['일차부등식', '부등식'],
        '이차부등식': ['이차부등식', '부등식'],
        '고차방정식': ['고차방정식'],
        '원의방정식': ['원의방정식', '원'],
        '도형의이동': ['도형의이동', '평행이동', '대칭이동'],
        '점과좌표': ['점과좌표', '평면좌표']
    };

    const searches = unitMap[item.unit] || [item.unit];

    // 2. Answers Master
    const master = answersMaster.find(a => {
        const isUnitMatch = searches.some(s => a.unit.includes(s) || s.includes(a.unit));
        const isStageMatch = a.stage === item.stage;
        const isProbMatch = a.problem === item.problemNumber;
        return isUnitMatch && isStageMatch && isProbMatch;
    });
    if (master) return { answer: master.answer, source: 'master' };

    return null;
}

function extractFromLatex(steps) {
    if (!steps || steps.length === 0) return null;
    const lastStep = steps[steps.length - 1].latex || "";
    
    // Look for = \frac{3}{2}, = 4, etc.
    const fracMatch = lastStep.match(/=\s*\\frac\{(-?[0-9.]+)\}\{(-?[0-9.]+)\}/);
    if (fracMatch) return `${fracMatch[1]}/${fracMatch[2]}`;

    const numMatch = lastStep.match(/=\s*(-?[0-9.]+)\s*$/) || lastStep.match(/=\s*(-?[0-9.]+)\s*\\/);
    if (numMatch) return numMatch[1];

    const simpleMatch = lastStep.match(/정답은\s*([0-9]+)/);
    if (simpleMatch) return simpleMatch[1];

    return null;
}

targetFolders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) return;

  fs.readdirSync(folderPath).forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Manual fix for known broken ones
    if (file === "044.json" && folder === "원의방정식2단계") {
        content = content.replace(/"\?각.*"/, '"삼각형 ABC의 넓이가 최대"');
    }
    if (file === "045.json" && folder === "원의방정식2단계") {
        content = content.replace(/"\?.*"/g, '"값"');
    }
    if (file === "026.json" && folder === "도형의이동2단계") {
        content = content.replace(/label: ""/, 'label: "",'); // fix missing comma
    }

    content = content.replace(/\\{3,}/g, '\\\\');
    content = content.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F]/g, ' '); 

    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        try {
            data = JSON.parse(content.replace(/\r?\n/g, ' '));
        } catch (e2) {
            console.log(`Failed to parse ${folder}/${file}: ${e.message}`);
            return;
        }
    }

    // Only process if missing finalAnswer or not completed
    if (data.finalAnswer) return;

    const problemNumber = parseInt(file.replace('.json', ''));
    const item = {
        unit: folder.replace(/[0-9]단계$/, ''),
        stage: parseInt(folder.match(/[0-9]/)?.[0]),
        problemNumber: problemNumber
    };

    const steps = data.steps || data.overlay_steps || [];
    let answerInfo = findAnswer(item);
    
    if (!answerInfo) {
        const extracted = extractFromLatex(steps);
        if (extracted) {
            answerInfo = { answer: extracted, source: 'latex' };
        }
    }

    if (answerInfo) {
        data.finalAnswer = String(answerInfo.answer);
        data.correctAnswer = String(answerInfo.answer);
        data.answerType = (String(answerInfo.answer).length === 1 && !isNaN(answerInfo.answer)) ? "multiple_choice" : "short_answer";
        data.normalizedAnswers = [
            normalize(answerInfo.answer),
            normalize(answerInfo.answer) + ".0",
            "+" + normalize(answerInfo.answer),
            "x=" + normalize(answerInfo.answer),
            "answer:" + normalize(answerInfo.answer)
        ];
        data.pcbsa_completed = true;
        data.status = "complete";
        data.extractionSource = answerInfo.source;
        results.fixed++;
    } else {
        data.manual_review_required = true;
        data.pcbsa_completed = false;
        data.status = "incomplete";
        results.manualReview++;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });
});

console.log(`Summary: Fixed ${results.fixed}, Manual Review Required: ${results.manualReview}`);
