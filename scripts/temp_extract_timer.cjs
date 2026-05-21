const fs = require('fs');
const lines = fs.readFileSync('C:/Users/user/.gemini/antigravity/brain/d0b63412-06e6-454e-a803-d02fe3b01adb/.system_generated/logs/overview.txt', 'utf8').split('\n');
lines.forEach(l => {
  try {
    const d = JSON.parse(l);
    if (d.tool_calls) {
      d.tool_calls.forEach(tc => {
        if (tc.name === 'multi_replace_file_content' && tc.args.ReplacementChunks && tc.args.ReplacementChunks.includes('getProblemTimeLimit')) {
          const chunks = JSON.parse(tc.args.ReplacementChunks);
          chunks.forEach(ch => {
            console.log('----- START CHUNK -----');
            console.log('TargetContent:\n' + ch.TargetContent);
            console.log('ReplacementContent:\n' + ch.ReplacementContent);
            console.log('----- END CHUNK -----');
          });
        }
      });
    }
  } catch(e) {}
});
