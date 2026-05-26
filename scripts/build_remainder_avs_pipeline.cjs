const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_CROPS = 'c:/mentos_os_clean/public/math_crops/(002)항등식과나머지정리';
const HINTS_BASE = 'c:/mentos_os_clean/public/math_hints';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function countTotalGenerated() {
  let count = 0;
  ['항등식과나머지정리2단계', '항등식과나머지정리3단계', '항등식과나머지정리4단계'].forEach(dir => {
    const p = path.join(HINTS_BASE, dir);
    if (fs.existsSync(p)) {
      const jsons = fs.readdirSync(p).filter(f => f.match(/^\d{3}\.json$/));
      count += jsons.length;
    }
  });
  return count;
}

async function runPipeline() {
  console.log('=== Starting Real-Time Remainder Theorem AVS Compilation Pipeline ===');
  
  const manifestPath = path.join(BASE_CROPS, 'extracted_answers.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Answers manifest missing! Run parse_remainder_crops.cjs first.');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const totalQuestions = 
    (manifest['2단계'] ? manifest['2단계'].qCount : 0) + 
    (manifest['3단계'] ? manifest['3단계'].qCount : 0) + 
    (manifest['4단계'] ? manifest['4단계'].qCount : 0);
    
  console.log(`Target total AVS files to generate: ${totalQuestions}`);

  let runCount = 0;
  
  while (true) {
    const currentGenerated = countTotalGenerated();
    console.log(`\n--- Pipeline Heartbeat #${++runCount} ---`);
    console.log(`Current progress: ${currentGenerated} / ${totalQuestions} generated.`);
    
    if (currentGenerated >= totalQuestions) {
      console.log('🎉 SUCCESS! All Remainder Theorem AVS files have been successfully compiled!');
      break;
    }
    
    console.log('Invoking Remainder Theorem AVS generator...');
    try {
      execSync('node scripts/generate_remainder_avs.cjs', { stdio: 'inherit' });
    } catch (err) {
      console.error('AVS generator run encountered an error:', err.message);
    }
    
    await sleep(15000);
  }
}

runPipeline().catch(console.error);
