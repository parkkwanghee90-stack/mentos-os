const fs = require('fs');
const path = require('path');

const units = [
    '행렬2단계', '행렬3단계', '행렬4단계',
    '고차방정식2단계', '고차방정식3단계', '고차방정식4단계'
];

function repairKorean(text) {
    if (!text) return text;
    return text
        .replace(/\?심/g, '핵심')
        .replace(/\?리/g, '정리')
        .replace(/\?라\?/g, '따라서')
        .replace(/\?답/g, '정답')
        .replace(/\?인/g, '확인')
        .replace(/\?요/g, '필요')
        .replace(/\?개/g, '개념')
        .replace(/\?대/g, '형태')
        .replace(/\?립/g, '연립')
        .replace(/\?용/g, '적용')
        .replace(/\?출/g, '도출')
        .replace(/\?해/g, '이해')
        .replace(/\?인/g, '확인')
        .replace(/\?의/g, '정의')
        .replace(/\?/g, ''); 
}

units.forEach(unit => {
    const dirPath = path.join('public/math_hints', unit);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        content = content.replace(/"A":\s*"\?\?,/g, '"A": "",');

        let data;
        try {
            data = JSON.parse(content);
        } catch (e) {
            try {
                data = JSON.parse(content + '}');
            } catch (e2) {
                return;
            }
        }

        if (data.hints && !data.steps) {
            data.steps = data.hints;
            delete data.hints;
        }
        if (!data.type) data.type = 'geometry';

        if (data.steps) {
            data.steps.forEach(step => {
                if (step.label) step.label = repairKorean(step.label);
                if (step.label_text) step.label_text = repairKorean(step.label_text);
                if (step.latex) step.latex = repairKorean(step.latex);
            });
        }
        
        const fields = ['P', 'C', 'B', 'S', 'A', 'explanationFinalLine'];
        fields.forEach(f => { if(data[f]) data[f] = repairKorean(data[f]); });

        if (data.steps && data.steps.length > 0) {
            const lastStep = data.steps[data.steps.length - 1];
            const lastLatex = lastStep.latex || '';
            
            const circleMatch = lastLatex.match(/[①-⑤]/);
            if (circleMatch) {
                const circleMap = { '①': 0, '②': 1, '③': 2, '④': 3, '⑤': 4 };
                data.correctChoiceIndex = circleMap[circleMatch[0]];
                data.correctAnswer = (data.correctChoiceIndex + 1).toString();
                data.A = circleMatch[0];
                data.answerType = 'multiple_choice';
            } else {
                const valMatches = [...lastLatex.matchAll(/=\s*(\\begin\{pmatrix\}.*?\\end\{pmatrix\}|-?\d+)/gs)];
                if (valMatches.length > 0) {
                    const result = valMatches[valMatches.length - 1][1];
                    data.correctAnswer = result;
                    data.A = result;
                    
                    if (data.choices && data.choices.length === 5) {
                        const cleanRes = result.replace(/\s/g, '');
                        for (let i = 0; i < 5; i++) {
                            const cleanChoice = data.choices[i].replace(/\s/g, '').replace(/\\n$/, '');
                            if (cleanChoice.includes(cleanRes) || cleanRes.includes(cleanChoice)) {
                                data.correctChoiceIndex = i;
                                data.correctAnswer = (i + 1).toString();
                                const circles = ['①', '②', '③', '④', '⑤'];
                                data.A = circles[i];
                                data.answerType = 'multiple_choice';
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        if (data.A && !data.explanationFinalLine) {
            data.explanationFinalLine = `따라서 정답은 ${data.A}입니다.`;
        }

        data.status = 'complete';
        data.pcbsa_completed = true;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
console.log('Master Remediation (Fixed Regex) complete.');
