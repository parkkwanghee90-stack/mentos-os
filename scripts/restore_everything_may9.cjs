const fs = require('fs');
const path = require('path');

const srcBase = 'c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_hints';
const destBase = 'c:/mentos_os_clean/public/math_hints';

const excludeKeywords = ['순열', '조합'];

if (!fs.existsSync(srcBase)) {
    console.error("Source May 9th backup not found!");
    process.exit(1);
}

if (!fs.existsSync(destBase)) {
    fs.mkdirSync(destBase, { recursive: true });
}

const folders = fs.readdirSync(srcBase);

folders.forEach(folder => {
    const shouldExclude = excludeKeywords.some(kw => folder.includes(kw));

    if (!shouldExclude) {
        const srcDir = path.join(srcBase, folder);
        const destDir = path.join(destBase, folder);

        console.log(`Restoring all: ${folder}`);
        copyRecursiveSync(srcDir, destDir);
    } else {
        console.log(`Excluding as requested: ${folder}`);
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

console.log("Full restoration of ALL units from May 9th backup completed (Excluding Permutation/Combination).");
