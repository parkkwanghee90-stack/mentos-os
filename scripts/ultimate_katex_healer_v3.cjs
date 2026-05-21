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
            
            // 2. Strip existing \text{} to start clean
            s = s.replace(/\\text\{([^\}]*)\}/g, '$1');
            
            // 3. Wrap Korean blocks
            s = s.replace(/([가-힣\s\!\?\(\)가-힣]+)/g, (match) => {
                const t = match.trim();
                if (t === "" || t === ":" || t === "=") return match;
                return ` \\text{${t}} `;
            });

            // 4. Ensure backslashes for math commands
            const commands = ['leq', 'geq', 'pm', 'alpha', 'beta', 'cases', 'begin', 'end', 'frac', 'sqrt', 'Rightarrow', 'therefore', 'cdots', 'dots'];
            commands.forEach(cmd => {
                const regex = new RegExp(`(?<!\\\\)${cmd}`, 'g');
                s = s.replace(regex, `\\${cmd}`);
            });

            // 5. Final Cleanup
            s = s.replace(/\s+/g, ' ').trim();
            return s;
        }

        if (data.steps) {
            data.steps.forEach(step => {
                step.latex = healLatex(step.latex);
            });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(step => {
                step.latex = healLatex(step.latex);
            });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Healed KaTeX v3] ${unit}`);
});
