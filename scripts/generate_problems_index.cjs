const fs = require('fs');
const path = require('path');

const baseDir = 'c:/mentos_os_clean/public/math_hints';
const index = {};

function scanDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (item.endsWith('.json')) {
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            const unit = path.dirname(relPath);
            if (!index[unit]) index[unit] = [];
            index[unit].push(item.replace('.json', ''));
        }
    });
}

scanDir(baseDir);
fs.writeFileSync('c:/mentos_os_clean/public/problems_index.json', JSON.stringify(index, null, 2));
console.log('Successfully generated public/problems_index.json');
