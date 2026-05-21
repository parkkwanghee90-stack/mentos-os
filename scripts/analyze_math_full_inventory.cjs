const fs = require('fs');
const path = require('path');

const ROOT_APP = "C:\\mentos_os_clean";
const INDEXED_DIR = path.join(ROOT_APP, "public", "math_indexed");
const CROPS_DIR = path.join(ROOT_APP, "public", "math_crops");

// Valid units mapping grouping logically
const VALID_UNITS = [
    '직선의방정식', '원의방정식', '일차부등식', '이차부등식', 
    '도형의이동', '점과좌표', '다항식', '방정식', '부등식', '복소수', '이차함수', '다항식의연산', '나머지정리',
    '집합', '명제', '함수', '유리함수', '무리함수', '순열과조합',
    '지수함수', '로그함수', '삼각함수', '수열', '수열의극한', '극한', '미분', '적분', '연속', '도함수', 
    '확률', '통계', '이항정리', '조건부확률'
];

let globalStats = {};

function addStat(unit, level, isTwin, increment = 1) {
    if (!globalStats[unit]) {
        globalStats[unit] = { '2': 0, '3': 0, '4': 0, hasTwin: false };
    }
    
    // Normalize level to 2, 3, 4
    let lvl = '2';
    if (level.includes('3')) lvl = '3';
    if (level.includes('4') || level.includes('상')) lvl = '4';
    
    globalStats[unit][lvl] += increment;
    if (isTwin) globalStats[unit].hasTwin = true;
}

// 1. Parse math_indexed (already rigidly structured)
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

// 2. Parse math_crops (unindexed raw new extractions)
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
                    // figure out unit context
                    let folderStr = fullPath.replace(/\\/g, '/');
                    let isTwin = folderStr.includes('쌍둥이') || folderStr.includes('1+1');
                    
                    let levelStr = '2'; // Default
                    if (folderStr.includes('3단계') || folderStr.includes('최상위') || folderStr.includes('상위') || folderStr.includes('심화')) levelStr = '3';
                    if (folderStr.includes('4단계') || folderStr.includes('킬러') || folderStr.includes('TOT')) levelStr = '4';
                    
                    let fallbackUnit = '기타단원';
                    for (let kw of VALID_UNITS) {
                        if (folderStr.includes(kw)) { fallbackUnit = kw; break; }
                    }

                    // Count specific questions inside this crop metadata
                    for (let item of meta.items) {
                        let idUnitMatched = item.id ? item.id.match(/^([^ ]+) Q/) : null;
                        let itemUnit = fallbackUnit;
                        if (idUnitMatched && idUnitMatched[1] !== '기타') {
                            itemUnit = idUnitMatched[1];
                        }
                        addStat(itemUnit, levelStr, isTwin, 1);
                    }
                }
            } catch(e) {}
        }
    }
}
scanCrops(CROPS_DIR);

// Consolidate data
let unitData = [];
let totalProblems = 0;
let totalByLevel = { '2': 0, '3': 0, '4': 0 };

for (let unit of Object.keys(globalStats)) {
    if (unit === '기타단원' && globalStats[unit]['2'] === 0 && globalStats[unit]['3'] === 0 && globalStats[unit]['4'] === 0) continue;
    
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
    
    let statusesStr = [ev2, ev3, ev4].join(',');
    let overallEv = '충분';
    if (statusesStr.includes('보통')) overallEv = '보통';
    if (statusesStr.includes('부족')) overallEv = '부족';

    unitData.push({
        name: unit,
        count2, count3, count4, sum,
        hasTwin: stats.hasTwin,
        status2: ev2, status3: ev3, status4: ev4,
        overallStatus: overallEv
    });

    totalProblems += sum;
    totalByLevel['2'] += count2;
    totalByLevel['3'] += count3;
    totalByLevel['4'] += count4;
}

unitData.sort((a,b) => b.sum - a.sum);

console.log("=== 📊 1. 전체 구조 요약 ===");
console.log(`- 총 단원 개수: ${unitData.length}`);
console.log(`- 총 문제 수: ${totalProblems}`);
console.log(`- 난이도별 총 문제 수: 2단계(${totalByLevel['2']}) / 3단계(${totalByLevel['3']}) / 4단계(${totalByLevel['4']})`);

console.log("\n=== 📝 2. 단원별 상세 리스트 ===");
console.table(unitData.map(u => ({
    '단원명': u.name,
    '2단계(기본)': `${u.count2} (${u.status2})`,
    '3단계(심화)': `${u.count3} (${u.status3})`,
    '4단계(최상위)': `${u.count4} (${u.status4})`,
    '총합': u.sum,
    '쌍둥이': u.hasTwin,
    '평가': u.overallStatus
})));

console.log("\n=== ⚠️ 4. 위험 단원 시작 (문제 수 부족) ===");
const danger = unitData.filter(u => u.overallStatus === '부족');
if (danger.length > 0) {
    danger.forEach(d => {
        console.log(`- [${d.name}] : 부족한 난이도 -> ` 
            + (d.status2 === '부족' ? '2단계 ' : '')
            + (d.status3 === '부족' ? '3단계 ' : '')
            + (d.status4 === '부족' ? '4단계 ' : '')
        );
    });
} else {
    console.log("-> 위험 단원이 없습니다! 모든 단원이 수업 운영에 충분/보통 상태입니다.");
}

console.log("\n=== ⚖️ 5. 최종 수업 가능 여부 판단 ===");
let hasMiddle = false;
let hasHigh1 = false;
let hasHigh2 = false;
let hasHigh3 = false;

// Basic logic to determine available courses
const high1units = ['함수', '집합', '명제', '유리함수', '무리함수', '순열과조합', '도형의이동', '원의방정식', '이차부등식', '다항식', '방정식'];
const high2units = ['지수함수', '로그함수', '삼각함수', '수열', '극한', '미분', '적분'];
const high3units = ['수열의극한', '도함수', '통계'];
for (let u of unitData) {
    if (high1units.some(h => u.name.includes(h))) hasHigh1 = true;
    if (high2units.some(h => u.name.includes(h))) hasHigh2 = true;
    if (high3units.some(h => u.name.includes(h))) hasHigh3 = true;
}

console.log("-> 현재 데이터로 분석된 커버리지:");
console.log(`   * 중등 수학: 불가 (데이터 없음)`);
console.log(`   * 고1 수학(상/하): ${hasHigh1 ? "일부 가능" : "불가"}`);
console.log(`   * 고2 수학1, 수학2: ${hasHigh2 ? "일부 가능" : "불가"}`);
console.log(`   * 고3 (미적/확통): ${hasHigh3 ? "일부 가능" : "불가"}`);

if (danger.length > 0) {
    console.log(`-> 🆘 부족한 영역(단원): ${danger.map(d=>d.name).join(', ')}`);
}

console.log("\n=== 🏆 6. 랭킹 보드 ===");
console.log("◆ 가장 문제 많은 단원 TOP 5:");
unitData.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u.name} (${u.sum}문제)`));
console.log("\n◆ 가장 부족한 단원 TOP 5 (뒤에서부터):");
const reversed = [...unitData].sort((a,b)=>a.sum - b.sum);
reversed.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u.name} (${u.sum}문제)`));

console.log("\n[폴더 경로 예시 3개]");
let exDirs = [];
if (fs.existsSync(INDEXED_DIR)) {
    const un = fs.readdirSync(INDEXED_DIR).filter(d => fs.statSync(path.join(INDEXED_DIR, d)).isDirectory());
    for(let i=0; i<Math.min(3, un.length); i++) exDirs.push(`C:\\mentos_os_clean\\public\\math_indexed\\${un[i]}\\2\\`);
}
exDirs.forEach(e => console.log('  ' + e));
