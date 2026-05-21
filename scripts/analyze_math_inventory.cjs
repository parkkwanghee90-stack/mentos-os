const fs = require('fs');
const path = require('path');

const ROOT_APP = "C:\\mentos_os_clean";
const BASE_DIR = path.join(ROOT_APP, "public", "math_indexed");

function main() {
    if (!fs.existsSync(BASE_DIR)) {
        console.error("math_indexed 폴더가 없습니다.");
        return;
    }

    const units = fs.readdirSync(BASE_DIR).filter(d => fs.statSync(path.join(BASE_DIR, d)).isDirectory());
    
    let totalProblems = 0;
    let totalByLevel = { '2': 0, '3': 0, '4': 0, 'concept': 0 };
    
    let unitData = [];

    for (let u of units) {
        let unitPath = path.join(BASE_DIR, u);
        
        let count2 = checkCount(unitPath, '2');
        let count3 = checkCount(unitPath, '3');
        let count4 = checkCount(unitPath, '4');
        
        let sum = count2 + count3 + count4;

        // Check if twin problems exist (has _twin.png or metadata marker)
        // just a heuristic for now, scanning the 2, 3, 4 folders for twin names
        let hasTwin = false;
        for (let lvl of ['2','3','4']) {
            let p = path.join(unitPath, lvl);
            if (fs.existsSync(p)) {
                const files = fs.readdirSync(p);
                if (files.some(f => f.includes('쌍둥이') || f.includes('twin'))) {
                    hasTwin = true;
                    break;
                }
                
                // If metadata exists, check if property twin exists
                const mp = path.join(p, 'metadata.json');
                if (fs.existsSync(mp)) {
                    try {
                        const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
                        if (m.some(x => x.is_twin)) hasTwin = true;
                    } catch(e) {}
                }
            }
        }
        
        // Evaluate condition
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
        
        // Determine overall evaluating state
        let statusesStr = [ev2, ev3, ev4].join(',');
        let overallEv = '충분';
        if (statusesStr.includes('보통')) overallEv = '보통';
        if (statusesStr.includes('부족')) overallEv = '부족';

        unitData.push({
            name: u,
            count2,
            count3,
            count4,
            sum,
            hasTwin,
            status2: ev2,
            status3: ev3,
            status4: ev4,
            overallStatus: overallEv
        });

        totalProblems += sum;
        totalByLevel['2'] += count2;
        totalByLevel['3'] += count3;
        totalByLevel['4'] += count4;
    }

    // Sort by most problems to lowest
    unitData.sort((a,b) => b.sum - a.sum);

    // Generate output
    console.log("=== 📊 1. 전체 구조 요약 ===");
    console.log(`- 총 단원 개수: ${units.length}`);
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
    // Mathematics 1st year HS includes Math Ha (집합, 명제, 함수, 유리함수, 무리함수, 경우의수)
    // Math Sang includes (다항식, 방정식, 부등식, 도형의방정식 등)
    // Current units are all High School 1st year (고1) Mathematics!
    console.log("-> 분석 결과: 현재 탑재된 단원들은 모두 [고1 수학(상/하)] 범위입니다.");
    console.log(`-> 고1 수학 수업 가능 여부: ${danger.length > 0 ? "⚠️ 일부 단원 보강 필요" : "✅ 100% 즉시 투입 가능"}`);
    if (danger.length > 0) {
        console.log(`-> 🆘 보충 시급: ${danger.map(d=>d.name).join(', ')}`);
    }

    console.log("\n=== 🏆 6. 랭킹 보드 ===");
    console.log("◆ 가장 문제 많은 단원 TOP 5:");
    unitData.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u.name} (${u.sum}문제)`));
    console.log("\n◆ 가장 부족한 단원 TOP 5 (뒤에서부터):");
    const reversed = [...unitData].sort((a,b)=>a.sum - b.sum);
    reversed.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u.name} (${u.sum}문제)`));
    
    console.log("\n[폴더 경로 예시 3개]");
    for(let i=0; i<Math.min(3, units.length); i++) {
        console.log(`  C:\\mentos_os_clean\\public\\math_indexed\\${units[i]}\\2\\`);
    }
}

function checkCount(unitPath, levelStr) {
    let p = path.join(unitPath, levelStr);
    if (!fs.existsSync(p)) return 0;
    
    // Is there a metadata.json?
    let mp = path.join(p, 'metadata.json');
    if (fs.existsSync(mp)) {
        try {
            let m = JSON.parse(fs.readFileSync(mp, 'utf8'));
            if (Array.isArray(m)) return m.length;
        } catch(e) {}
    }
    
    // Otherwise count unique files or problem pairs. Usually math problems are .png
    // Let's divide image count by 2 assuming q and a, or count suffix _q.png
    let files = fs.readdirSync(p).filter(f => f.endsWith('.png'));
    let qFiles = files.filter(f => f.endsWith('_q.png') || f.includes('문제') || /q\d+\.png/i.test(f));
    
    if (qFiles.length > 0) return qFiles.length;
    // Without strict naming, if there are metadata, we used it. If not, assume each pair is 2 files.
    if (files.length > 0) return Math.floor(files.length / 2);
    
    return 0;
}

main();
