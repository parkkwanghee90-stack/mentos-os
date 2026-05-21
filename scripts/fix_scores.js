const fs = require('fs');

function getPointStr(id) {
    if (id <= 2) return '2점';
    if (id <= 8) return '3점';
    if (id <= 15) return '4점';
    if (id <= 19) return '3점';
    if (id <= 22) return '4점';
    if (id === 23) return '2점'; // 23번은 2점이 맞음
    if (id <= 27) return '3점';
    return '4점';
}

function processFile(filename) {
    let content = fs.readFileSync(filename, 'utf-8');
    
    content = content.replace(/\{ id: (\d+), type: "[^"]+"/g, (match, idStr) => {
        const id = parseInt(idStr);
        return '{ id: ' + id + ', type: "' + getPointStr(id) + '"';
    });

    // CSAT_2024_6.js의 동적 배열 생성 로직을 교체
    content = content.replace(/type: i \+ \d+ >= 15 \? "4점" : "3점"/g, 'type: ""'); // 임시
    content = content.replace(/type: .*? \? "4점" : "3점"/g, 'type: "TMP"'); 
    
    // 동적 생성 부분도 함수를 사용하도록 수정. 어차피 정규식으로 다루기 힘드니 
    // 여기서는 간단하게 replace
    fs.writeFileSync(filename, content);
}

processFile('src/data/mockExams/CSAT_2025_6.js');
processFile('src/data/mockExams/CSAT_2024_6.js');

let mentos = fs.readFileSync('src/pages/MentosMockExam.jsx', 'utf-8');
mentos = mentos.replace(/const pointType = \[15, 22, 30\].includes\(idx \+ 1\) \? '4점' : '3점';/g, 
`const id = idx + 1;
          let pointType = '3점';
          if (id <= 2) pointType = '2점';
          else if (id <= 8) pointType = '3점';
          else if (id <= 15) pointType = '4점';
          else if (id <= 19) pointType = '3점';
          else if (id <= 22) pointType = '4점';
          else if (id === 23) pointType = '2점';
          else if (id <= 27) pointType = '3점';
          else pointType = '4점';`);

fs.writeFileSync('src/pages/MentosMockExam.jsx', mentos);
