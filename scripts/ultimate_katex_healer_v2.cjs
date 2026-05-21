const fs = require('fs');
const path = require('path');

const units = [
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

units.forEach(unit => {
    const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        function healLatex(latex) {
            if (!latex) return "";
            // 1. Remove all dollar signs and newlines
            let s = latex.replace(/\$/g, '').replace(/\\n/g, ' ').trim();
            
            // 2. Identify Korean and wrap in \text{}
            // This pattern targets continuous Korean/space/punctuation blocks
            s = s.replace(/([가-힣\s\(\)가-힣\!\?]+)/g, (match) => {
                const trimmed = match.trim();
                if (trimmed === "" || trimmed === ":") return match;
                return `\\text{${trimmed}} `;
            });

            // 3. Cleanup nested \text{}
            while (s.includes('\\text{\\text{')) {
                s = s.replace(/\\text\{\\text\{/g, '\\text{').replace(/\}\}/g, '}');
            }
            
            // 4. Ensure backslashes for math commands
            const commands = ['leq', 'geq', 'pm', 'alpha', 'beta', 'cases', 'begin', 'end', 'frac', 'sqrt', 'Rightarrow', 'therefore', 'cdots', 'dots'];
            commands.forEach(cmd => {
                const regex = new RegExp(`(?<!\\\\)${cmd}`, 'g');
                s = s.replace(regex, `\\${cmd}`);
            });

            // 5. Fix common broken artifacts
            s = s.replace(/\\text\{정답\s*:\s*\}\s*}/g, '\\text{정답: }');
            s = s.replace(/\\text\{정답\}\s*:\s*\}/g, '\\text{정답: }');
            s = s.replace(/\\text\{정답\}\s*:/g, '\\text{정답: }');

            return s.trim();
        }

        if (data.steps) {
            data.steps.forEach(step => {
                step.latex = healLatex(step.latex);
                if (step.label_text && !step.label) step.label = step.label_text;
            });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(step => {
                step.latex = healLatex(step.latex);
                if (step.label_text && !step.label) step.label = step.label_text;
            });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Healed KaTeX v2] ${unit}`);
});
