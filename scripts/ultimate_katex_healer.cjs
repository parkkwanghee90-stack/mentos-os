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
            let s = latex.replace(/\$\$/g, ''); // Remove $$
            
            // Wrap Korean blocks in \text{}
            // This regex finds Korean characters and wraps them
            s = s.replace(/([가-힣\s\(\)가-힣]+)/g, (match) => {
                if (match.trim() === "") return match;
                // If already inside \text{}, don't wrap
                return `\\text{${match.trim()}} `;
            });
            
            // Cleanup double \text{\text{...}}
            s = s.replace(/\\text\{\\text\{/g, '\\text{').replace(/\}\}/g, '}');
            
            // Ensure backslashes for common KaTeX commands
            const commands = ['leq', 'geq', 'pm', 'alpha', 'beta', 'cases', 'begin', 'end', 'frac', 'sqrt', 'Rightarrow', 'therefore'];
            commands.forEach(cmd => {
                const regex = new RegExp(`(?<!\\\\)${cmd}`, 'g');
                s = s.replace(regex, `\\${cmd}`);
            });

            return s;
        }

        if (data.steps) {
            data.steps.forEach(step => {
                step.latex = healLatex(step.latex);
                // Fix labels if they were label_text
                if (step.label_text && !step.label) {
                    step.label = step.label_text;
                }
            });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(step => {
                step.latex = healLatex(step.latex);
                if (step.label_text && !step.label) {
                    step.label = step.label_text;
                }
            });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Healed KaTeX] ${unit}`);
});
