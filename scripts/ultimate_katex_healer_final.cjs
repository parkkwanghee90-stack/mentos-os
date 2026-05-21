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
            let s = latex.replace(/\$/g, '').replace(/\\n/g, ' ');
            
            // 2. Remove all \text{...} wrappers globally while keeping content
            // We use a regex that matches \text{ and the corresponding closing }
            // To handle nested cases, we repeat until no more \text{
            while (s.includes('\\text{')) {
                s = s.replace(/\\text\{([^\}]*)\}/g, '$1');
            }
            
            // 3. Remove all stray curly braces that might have been part of \text{}
            // This is safer than removing ALL braces.
            // We only remove } if it follows a space or is at the end of a block of Korean.
            s = s.replace(/([가-힣])\}/g, '$1');
            s = s.replace(/\}\s*\}/g, '}');

            // 4. Re-wrap Korean blocks carefully
            s = s.replace(/([가-힣\s\!\?\(\)가-힣]+)/g, (match) => {
                const t = match.trim();
                if (t === "" || t === ":" || t === "=") return match;
                return ` \\text{${t}} `;
            });

            // 5. Ensure backslashes for math commands
            const commands = ['leq', 'geq', 'pm', 'alpha', 'beta', 'cases', 'begin', 'end', 'frac', 'sqrt', 'Rightarrow', 'therefore', 'cdots', 'dots'];
            commands.forEach(cmd => {
                const regex = new RegExp(`(?<!\\\\)${cmd}`, 'g');
                s = s.replace(regex, `\\${cmd}`);
            });

            // Final safety cleanup of broken braces
            s = s.replace(/\{ \}/g, '');
            s = s.replace(/\}\}/g, '}');

            s = s.replace(/\s+/g, ' ').trim();
            return s;
        }

        if (data.steps) {
            data.steps.forEach(step => { step.latex = healLatex(step.latex); });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(step => { step.latex = healLatex(step.latex); });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Healed KaTeX Final] ${unit}`);
});
