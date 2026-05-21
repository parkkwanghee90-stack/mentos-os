const fs = require('fs');
const path = require('path');

function searchForMath1Answers(dir) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.includes('node_modules') || item.includes('.git') || item.includes('android')) continue;
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        searchForMath1Answers(fullPath);
      } else if (item.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('지수함수2단계') && (content.includes('answer') || content.includes('avs'))) {
            console.log('Found in:', fullPath);
          }
        } catch(e) {}
      }
    }
  } catch(e) {}
}

console.log('Searching...');
searchForMath1Answers('C:\\mentos_os_clean');
console.log('Done.');
