const fs = require('fs');
const path = require('path');

const TARGET_DIR = "C:\\mentos_os_clean\\public\\math_crops\\(2)수학(상)기말";

console.log("=========================================");
console.log("사용자 수동 폴더 1:1 강제 매핑 엔진 작동 시작");
console.log("=========================================\n");

const subdirs = fs.readdirSync(TARGET_DIR);
for (let d of subdirs) {
    // User requested to SKIP "고등수학 상 2021~2023 1+1 쌍둥이" ("잘됨 건드리지 말고 위에 꺼만 작업함")
    if (d.includes("고등수학") && d.includes("쌍둥이")) {
        console.log(`[PASS] 유저 지시에 따라 시스템 통과: ${d}`);
        continue;
    }

    const dirPath = path.join(TARGET_DIR, d);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    
    // .png 파일만 모아서 오름차순(시퀀스 순서) 정렬 
    // 파일명이 001_N01_Title.png 형태로 뽑혔으므로 자연 정렬하면 시간순서(문제->해설)가 완벽 보존됨
    let pngs = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));
    pngs.sort();
    
    if (pngs.length === 0) continue;
    
    console.log(`\n[폴더 확인] ${d} - 총 ${pngs.length} 파일 남김없이 인지`);
    
    if (pngs.length % 2 !== 0) {
        console.log(`  -> [경고] 파일 개수(${pngs.length})가 짝수가 아닙니다. 문제수/해설수가 1:1로 맞추어지지 않았거나 미세 찌꺼기가 남은 상태입니다. 이 폴더 보류.`);
        continue;
    }
    
    const half = pngs.length / 2;
    console.log(`  -> 퍼펙트! 파일 갯수 짝수 검증 완료. ${half}개의 [문제-해설] 1:1 강제 링크 및 이름 재부여 착수.`);
    
    // 임시 이름으로 우선 일괄 변경 (파일 오버라이드 충돌 방지)
    const tempMap = [];
    for (let i = 0; i < half; i++) {
        let qFile = pngs[i];
        let aFile = pngs[i + half];
        
        let seq = String(i + 1).padStart(3, '0');
        
        // 기존 이름에서 앞쪽의 숫자 찌꺼기들 전부 삭제하고 문제의 진짜 한글 타이틀만 뽑아냄
        let cleanTitle = qFile.replace(/^\d+_N\d+_/, "")
                              .replace(/^[0-9_]+/, "") // 혹시 모를 선행숫자 추가 제거
                              .replace(/\.png$/, "")
                              .trim() || "Matched_Problem";
                              
        let newQ = `${seq}_q_${cleanTitle}.png`;
        let newA = `${seq}_a_${cleanTitle}.png`;
        
        tempMap.push({oldPath: path.join(dirPath, qFile), newPath: path.join(dirPath, "TEMP_" + newQ)});
        tempMap.push({oldPath: path.join(dirPath, aFile), newPath: path.join(dirPath, "TEMP_" + newA)});
    }
    
    // 1단계: 임시 치환
    for (let t of tempMap) {
        if(fs.existsSync(t.oldPath)) fs.renameSync(t.oldPath, t.newPath);
    }
    
    // 2단계: 완벽한 q / a 매핑으로 확정
    let temps = fs.readdirSync(dirPath).filter(f => f.startsWith('TEMP_'));
    for (let t of temps) {
        fs.renameSync(path.join(dirPath, t), path.join(dirPath, t.replace('TEMP_', '')));
    }
    
    console.log(`  -> ✓ 쌍둥이 연결 완료: 001_q / 001_a 순차 포맷팅 달성!`);
}

console.log(`\n★★★ [(2)수학(상)기말] 유저 맞춤형 전용 링크 엔진 작업 100% 완료! ★★★`);
