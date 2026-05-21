const fs = require('fs');
const path = require('path');

const BASE_SRC = path.join(__dirname, '../public/math_crops');
const BASE_DEST = path.join(__dirname, '../public/math_indexed');

const unitsToMap = [
  { uiName: '삼각함수', searchStr: '삼각함수성질' },
  { uiName: '삼각함수의 그래프', searchStr: '삼각함수그래프' },
  { uiName: '삼각함수의 활용', searchStr: '삼각함수활용' },
  { uiName: '수열', searchStr: '수열' },
  { uiName: '수학적귀납법', searchStr: '수학적귀납법' },
  { uiName: '지수', searchStr: '지수' },
  { uiName: '지수함수', searchStr: '지수함수' },
  { uiName: '로그', searchStr: '로그' },
  { uiName: '로그함수', searchStr: '로그함수' },
];

function scanAndMapFolder(sourceBase) {
    if (!fs.existsSync(sourceBase)) return;
    
    unitsToMap.forEach(mapping => {
      const destFolder = path.join(BASE_DEST, mapping.uiName, 'concept');
      if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
    
      for (let level = 2; level <= 4; level++) {
        const levelFolder = path.join(sourceBase, `${level}단계`);
        if (fs.existsSync(levelFolder)) {
          const folders = fs.readdirSync(levelFolder);
          
          // Loosen matching: It must contain the math unit searchStr.
          // We DO NOT strictly demand it to say "X단계" because humans name folders inconsistently.
          // Because it's ALREADY inside the `${level}단계` folder, any subfolder matching the math name is valid!
          let targetFolder = folders.find(f => f.replace(/\s+/g,'').includes(mapping.searchStr.replace(/\s+/g,'')));
          
          if (!targetFolder && mapping.uiName === '지수함수') targetFolder = folders.find(f => f.includes('지수로그함수'));
          if (!targetFolder && mapping.uiName === '로그함수') targetFolder = folders.find(f => f.includes('지수로그함수'));
          if (!targetFolder && mapping.uiName === '지수') targetFolder = folders.find(f => f.includes('지수로그'));
          if (!targetFolder && mapping.uiName === '로그') targetFolder = folders.find(f => f.includes('지수로그'));
          
          if (targetFolder) {
            const fullPath = path.join(levelFolder, targetFolder);
            const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.png'));
            
            if (files.length > 0) {
              const qDest = path.join(destFolder, `q00${level}.png`);
              const sDest = path.join(destFolder, `s00${level}.png`);
              fs.copyFileSync(path.join(fullPath, files[0]), qDest);
              if (files.length > 1) {
                fs.copyFileSync(path.join(fullPath, files[1]), sDest);
              } else {
                fs.copyFileSync(path.join(fullPath, files[0]), sDest);
              }
              console.log(`[${mapping.uiName}] Level ${level} -> Retrieved exactly from: [${targetFolder}] (in ${level}단계 folder)`);
            }
          }
        }
      }
    });
}

scanAndMapFolder(path.join(BASE_SRC, '(5)수학1 중간'));
