import fs from 'fs';

const path = './public/premium_lectures/삼각함수성질.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const fix = (text) => {
  if (!text) return text;
  return text
    .replace(/pi \+- theta/g, '$\\pi \\pm \\theta$')
    .replace(/pi\/2 - theta/g, '$\\pi/2 - \\theta$')
    .replace(/3pi\/2 - theta/g, '$3\\pi/2 - \\theta$')
    .replace(/theta/g, '$\\theta$') // Be careful with this one
    .replace(/\$ \$/g, '') // Clean up
    .replace(/\$\$\$/g, '$'); // Clean up
};

data.steps.forEach(s => {
  // Fix Titles
  if (s.visuals.title) {
    if (s.visuals.title.includes('pi')) {
      s.visuals.title = s.visuals.title
        .replace('pi +- theta 의 대칭성', '$\\pi \\pm \\theta$의 대칭성')
        .replace('pi/2 - theta (y=x 대칭)', '$\\pi/2 - \\theta$ ($y=x$ 대칭)');
    }
  }

  // Fix Narrations
  if (s.narration) {
    s.narration = s.narration
      .replace(/pi \+- theta/g, '$\\pi \\pm \\theta$')
      .replace(/pi\/2 - theta/g, '$\\pi/2 - \\theta$')
      .replace(/3pi\/2 - theta/g, '$3\\pi/2 - \\theta$');
  }

  // Preserve line breaks in math
  // No need to change unless we find single backslashes where doubles should be.
});

// Deep check on ALL math fields
data.steps.forEach(s => {
    if (s.visuals.math) {
        // If it contains array but only one backslash for line break, fix it.
        if (s.visuals.math.includes('array') && !s.visuals.math.includes('\\\\')) {
             s.visuals.math = s.visuals.math.replace(/\\ /g, '\\\\ ');
        }
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Total Investigation of 삼각함수성질.json completed!');
