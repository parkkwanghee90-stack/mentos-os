// scripts/rename_math1.js
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\mentos_os_clean\\public\\math_crops\\(5)수학1 중간';

const steps = ['2단계', '3단계', '4단계'];
let qRenamed = 0;
let aRenamed = 0;

for (const step of steps) {
    const stepDir = path.join(baseDir, step);
    if (!fs.existsSync(stepDir)) continue;

    const units = fs.readdirSync(stepDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const unit of units) {
        const unitDir = path.join(stepDir, unit.name);
        const files = fs.readdirSync(unitDir).filter(f => f.toLowerCase().endsWith('.png'));
        
        // Find existing _Nxx_ files
        const groups = {};
        for (const file of files) {
            // It could be 001q.png already renamed? If so, match 001q or match _N
            const match = file.match(/_N(\d+)_/);
            if (match) {
                const nRaw = match[1];
                const num = nRaw.padStart(3, '0');
                if (!groups[num]) groups[num] = [];
                groups[num].push(file);
            }
        }

        for (const num of Object.keys(groups)) {
            const sorted = groups[num].sort((a, b) => {
                const aIdxMatch = a.match(/^(\d+)_/);
                const bIdxMatch = b.match(/^(\d+)_/);
                const valA = aIdxMatch ? parseInt(aIdxMatch[1], 10) : 0;
                const valB = bIdxMatch ? parseInt(bIdxMatch[1], 10) : 0;
                return valA - valB;
            });

            if (sorted.length >= 2) {
                const oldQ = path.join(unitDir, sorted[0]);
                const oldA = path.join(unitDir, sorted[1]);
                const newQ = path.join(unitDir, `${num}q.png`);
                const newA = path.join(unitDir, `${num}a.png`);

                if (oldQ !== newQ) { fs.renameSync(oldQ, newQ); qRenamed++; }
                if (oldA !== newA && oldA !== oldQ) { fs.renameSync(oldA, newA); aRenamed++; }
            } else if (sorted.length === 1) {
                const oldQ = path.join(unitDir, sorted[0]);
                const newQ = path.join(unitDir, `${num}q.png`);
                if (oldQ !== newQ) { fs.renameSync(oldQ, newQ); qRenamed++; }
            }
        }
    }
}
console.log(`Done! Renamed Question files: ${qRenamed}, Answer files: ${aRenamed}`);
