const fs = require('fs');
const path = require('path');

const srcBase = 'c:/mentos_os_clean/GOLD_BOX_G1_2026_05_08_1844/public/math_hints';
const destBase = 'c:/mentos_os_clean/public/math_hints';

// Extended Math Sang units keywords (including Matrix and Cases)
const mathSangKeywords = [
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
    '순열',
    '조합',
    '고등수학(상)'
];

if (!fs.existsSync(srcBase)) {
    console.error("Source GOLD_BOX not found!");
    process.exit(1);
}

const folders = fs.readdirSync(srcBase);

folders.forEach(folder => {
    const isMathSang = mathSangKeywords.some(kw => folder.includes(kw));
    
    if (isMathSang) {
        const srcDir = path.join(srcBase, folder);
        const destDir = path.join(destBase, folder);

        console.log(`Restoring: ${folder}`);

        // Recursively copy directory
        copyRecursiveSync(srcDir, destDir);
    }
});

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        // Copy file
        fs.copyFileSync(src, dest);
    }
}

console.log("Full Math Sang restoration (including Matrix/Cases) completed from GOLD_BOX.");
