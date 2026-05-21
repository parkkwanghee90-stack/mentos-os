const fs = require('fs');
const path = require('path');

const ROOT_APP = "C:\\mentos_os_clean";
const INDEXED_DIR = path.join(ROOT_APP, "public", "math_indexed");
const CROPS_DIR = path.join(ROOT_APP, "public", "math_crops");

const VALID_UNITS = [
    // 고1
    '직선의방정식', '원의방정식', '일차부등식', '이차부등식', '다항식의연산', '나머지정리',
    '도형의이동', '점과좌표', '다항식', '방정식', '부등식', '복소수', '이차함수', 
    '집합', '명제', '함수', '유리함수', '무리함수', '순열과조합', '순열', '조합',
    // 고2 수1
    '지수함수', '로그함수', '지수', '로그', '삼각함수의활용', '삼각함수', 
    '등차수열', '등비수열', '수열의합', '수학적귀납법', '수열',
    // 고2 수2, 미적, 확통
    '수열의극한', '극한', '미분계수', '도함수의활용', '도함수', '미분', 
    '부정적분', '정적분', '적분', '연속', '조건부확률', '확률', '통계', '이항정리' 
];

let globalStats = {};

function addStat(unit, level, isTwin, increment = 1) {
    if (!globalStats[unit]) {
        globalStats[unit] = { '2': 0, '3': 0, '4': 0, hasTwin: false };
    }
    let lvl = '2';
    if (level.includes('3')) lvl = '3';
    if (level.includes('4') || level.includes('상')) lvl = '4';
    
    globalStats[unit][lvl] += increment;
    if (isTwin) globalStats[unit].hasTwin = true;
}

if (fs.existsSync(INDEXED_DIR)) {
    const units = fs.readdirSync(INDEXED_DIR).filter(d => fs.statSync(path.join(INDEXED_DIR, d)).isDirectory());
    for (let u of units) {
        let uPath = path.join(INDEXED_DIR, u);
        for (let lvl of ['2','3','4']) {
            let p = path.join(uPath, lvl);
            if (fs.existsSync(p)) {
                let count = 0;
                let hasTwin = false;
                const mp = path.join(p, 'metadata.json');
                if (fs.existsSync(mp)) {
                    try {
                        let meta = JSON.parse(fs.readFileSync(mp, 'utf8'));
                        count = Array.isArray(meta) ? meta.length : 0;
                        if (Array.isArray(meta) && meta.some(x => x.is_twin)) hasTwin = true;
                    } catch(e) {}
                } else {
                    let files = fs.readdirSync(p).filter(f => f.endsWith('.png'));
                    let qFiles = files.filter(f => f.endsWith('_q.png') || f.includes('문제') || /q\d+\.png/i.test(f));
                    count = qFiles.length > 0 ? qFiles.length : Math.floor(files.length / 2);
                    if (files.some(f => f.includes('쌍둥이') || f.includes('twin'))) hasTwin = true;
                }
                if (count > 0) addStat(u, lvl, hasTwin, count);
            }
        }
    }
}

function scanCrops(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const dirent of entries) {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
            scanCrops(fullPath);
        } else if (dirent.name === 'metadata.json') {
            try {
                const meta = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                if (meta && Array.isArray(meta.items)) {
                    let folderStr = fullPath.replace(/\\/g, '/');
                    let isTwin = folderStr.includes('쌍둥이') || folderStr.includes('1+1');
                    
                    let levelStr = '2'; // Default
                    if (folderStr.includes('3단계') || folderStr.includes('최상위') || folderStr.includes('상위') || folderStr.includes('심화')) levelStr = '3';
                    if (folderStr.includes('4단계') || folderStr.includes('킬러') || folderStr.includes('TOT')) levelStr = '4';
                    
                    let fallbackUnit = '기타단원';
                    for (let kw of VALID_UNITS) {
                        if (folderStr.includes(kw)) { fallbackUnit = kw; break; } // keep taking first match
                    }

                    for (let item of meta.items) {
                        let idUnitMatched = item.id ? item.id.match(/^([^ ]+) Q/) : null;
                        let itemUnit = fallbackUnit;
                        if (idUnitMatched && idUnitMatched[1] !== '기타') {
                            itemUnit = idUnitMatched[1];
                        }
                        
                        // Refine itemUnit further if it's too generic
                        if(itemUnit === '기타단원') {
                            for (let kw of VALID_UNITS) {
                                if (folderStr.includes(kw)) { itemUnit = kw; break; }
                            }
                        }
                        addStat(itemUnit, levelStr, isTwin, 1);
                    }
                }
            } catch(e) {}
        }
    }
}
scanCrops(CROPS_DIR);

let unitData = [];
// Filter strictly to High 2 Math 1 units based on user prompt
const userTargets = ['지수', '로그', '지수함수', '로그함수', '삼각함수', '수열', '수학적귀납법', '등차수열', '등비수열', '수열의합', '삼각함수의활용'];

for (let unit of Object.keys(globalStats)) {
    if (!userTargets.some(t => unit.includes(t))) {
        if(unit === '지수' || unit === '로그') {} // exact check
        else continue; 
    }
    
    let stats = globalStats[unit];
    let count2 = stats['2'];
    let count3 = stats['3'];
    let count4 = stats['4'];
    let sum = count2 + count3 + count4;
    
    if (sum === 0) continue;

    let evaluateLevel = (lvl, count) => {
        if (lvl === '2') {
            if (count >= 30) return '충분';
            if (count >= 20) return '보통';
            return '부족';
        } else if (lvl === '3') {
            if (count >= 25) return '충분';
            if (count >= 15) return '보통';
            return '부족';
        } else if (lvl === '4') {
            if (count >= 20) return '충분';
            if (count >= 10) return '보통';
            return '부족';
        }
        return '부족';
    };

    let ev2 = evaluateLevel('2', count2);
    let ev3 = evaluateLevel('3', count3);
    let ev4 = evaluateLevel('4', count4);
    
    unitData.push({
        name: unit, count2, count3, count4, sum,
        hasTwin: stats.hasTwin,
        status2: ev2, status3: ev3, status4: ev4
    });
}

unitData.sort((a,b) => b.sum - a.sum);

console.table(unitData.map(u => ({
    '단원명': u.name,
    '2단계(기본)': `${u.count2} (${u.status2})`,
    '3단계(심화)': `${u.count3} (${u.status3})`,
    '4단계(최상위)': `${u.count4} (${u.status4})`,
    '총합': u.sum
})));
