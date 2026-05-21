const fs = require('fs');
const path = require('path');

const OUTPUT_ROOT = "C:\\mentos_os_clean\\public\\math_crops";
const UNIT_KEYWORDS = [
    '직선의방정식', '원의방정식', '일차부등식', '이차부등식', 
    '도형의이동', '점과좌표', '다항식', '방정식', '부등식', '복소수', '이차함수',
    '집합', '명제', '함수', '유리함수', '무리함수', '순열과조합',
    '지수함수', '로그함수', '삼각함수', '수열', '극한', '미분', '적분', '수열의극한'
];

function renamePagesRecurse(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    let foundKeyword = null;
    let fullDirStr = dir.replace(/\\/g, '/');
    for (const kw of UNIT_KEYWORDS) {
        if (fullDirStr.includes(kw)) {
            foundKeyword = kw;
            break;
        }
    }

    for (const dirent of entries) {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
            renamePagesRecurse(fullPath);
        } else if (dirent.isFile() && dirent.name.startsWith('page_') && dirent.name.endsWith('.png')) {
            if (foundKeyword) {
                // If it already starts with keyword, skip to prevent double prefixing
                if (dirent.name.startsWith(`${foundKeyword}_`)) continue;
                
                const newName = `${foundKeyword}_${dirent.name}`;
                const newFullPath = path.join(dir, newName);
                fs.renameSync(fullPath, newFullPath);
            }
        }
    }
}

renamePagesRecurse(OUTPUT_ROOT);
console.log("Renaming complete based on folder path keywords.");
