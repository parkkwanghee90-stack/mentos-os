const fs = require('fs');
const path = require('path');

const srcBase = 'c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_hints';
const destBase = 'c:/mentos_os_clean/public/math_hints';

const includeKeywords = [
    '고차방정식',
    '부등식',
    '점과좌표',
    '직선의방정식',
    '직선의 방정식',
    '원의방정식',
    '원의 방정식',
    '도형의이동',
    '도형의 이동',
    '행렬',
    '경우의수',
    '경우의 수',
    '고등수학(상)'
];

const excludeKeywords = ['순열', '조합'];

if (!fs.existsSync(srcBase)) {
    console.error("Source May 9th backup not found!");
    process.exit(1);
}

const folders = fs.readdirSync(srcBase);

folders.forEach(folder => {
    const shouldInclude = includeKeywords.some(kw => folder.includes(kw));
    const shouldExclude = excludeKeywords.some(kw => folder.includes(kw));

    if (shouldInclude && !shouldExclude) {
        const srcDir = path.join(srcBase, folder);
        const destDir = path.join(destBase, folder);

        console.log(`Restoring from May 9th: ${folder}`);
        copyRecursiveSync(srcDir, destDir);
    } else if (shouldExclude) {
        console.log(`Excluding: ${folder}`);
    }
});

function copyRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        try {
            fs.copyFileSync(src, dest);
        } catch (e) {
            console.warn(`Warning: Could not copy ${src} to ${dest} (${e.code})`);
        }
    }
}

console.log("Restoration from May 9th backup completed.");
