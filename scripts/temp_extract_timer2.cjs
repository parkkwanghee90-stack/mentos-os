const fs = require('fs');
const lines = fs.readFileSync('C:/Users/user/.gemini/antigravity/brain/d0b63412-06e6-454e-a803-d02fe3b01adb/.system_generated/logs/overview.txt', 'utf8').split('\n');
lines.forEach(l => {
  if (l.includes('getProblemTimeLimit')) {
    console.log(l);
  }
});
