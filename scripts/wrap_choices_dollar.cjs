const fs = require('fs');

for (let i = 1; i <= 35; i++) {
  let id = i.toString().padStart(3, '0');
  let p = `public/math_hints/일차부등식4단계/${id}.json`;
  if (fs.existsSync(p)) {
    let j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (j.choices) {
      let modified = false;
      j.choices = j.choices.map(c => {
        // If it already has $, skip
        if (c.startsWith('$') && c.endsWith('$')) return c;
        // If it is just Korean text without math, skip? The user asked to fix "math broken".
        // Let's wrap it in $ if it contains math or \text
        // Actually, just wrap everything in $ except if it's already just plain Korean that we fixed.
        // Wait, for 23, we made it "ㄱ", "ㄴ", "ㄷ".
        if (["ㄱ", "ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"].includes(c)) {
          return c;
        }
        modified = true;
        return `$${c}$`;
      });
      if (modified) {
        fs.writeFileSync(p, JSON.stringify(j, null, 2), 'utf8');
        console.log(`Updated choices for 4단계 ${id}`);
      }
    }
  }
}

// And check 2단계 7번 just in case they meant 2단계 7번!
const l2_007_path = 'public/math_hints/일차부등식2단계/007.json';
if (fs.existsSync(l2_007_path)) {
  let j = JSON.parse(fs.readFileSync(l2_007_path, 'utf8'));
  if (j.choices) {
    let modified = false;
    j.choices = j.choices.map(c => {
      if (c.startsWith('$') && c.endsWith('$')) return c;
      modified = true;
      return `$${c}$`;
    });
    if (modified) {
      fs.writeFileSync(l2_007_path, JSON.stringify(j, null, 2), 'utf8');
      console.log(`Updated choices for 2단계 007`);
    }
  }
}

// What about 2단계 23번? Let's check if it has choices.
const l2_023_path = 'public/math_hints/일차부등식2단계/023.json';
if (fs.existsSync(l2_023_path)) {
  let j = JSON.parse(fs.readFileSync(l2_023_path, 'utf8'));
  if (j.choices) {
    let modified = false;
    j.choices = j.choices.map(c => {
      if (c.startsWith('$') && c.endsWith('$')) return c;
      modified = true;
      return `$${c}$`;
    });
    if (modified) {
      fs.writeFileSync(l2_023_path, JSON.stringify(j, null, 2), 'utf8');
      console.log(`Updated choices for 2단계 023`);
    }
  } else {
    console.log(`2단계 023 has no choices.`);
  }
}
