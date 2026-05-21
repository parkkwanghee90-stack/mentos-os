import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const DB_PATH = 'src/data/math_problem_texts.json';
const BACKUP_PATH = 'src/data/math_problem_texts.json.bak';
const REPORT_PATH = 'reports/math_upper_math1_plaintext_latex_failures.json';
const SUMMARY_PATH = 'reports/patch_rounds_summary.json';

// Get fail count
function getFailCount() {
  try {
    execSync('node scripts/audit_latex_v4.js', { stdio: 'pipe' });
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    return report.length;
  } catch (e) {
    // If audit fails to run, we assume bad state
    return Infinity;
  }
}

// Timeout wrapper
function execWithTimeout(cmd, timeoutMs) {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: timeoutMs });
    return true;
  } catch (e) {
    return false;
  }
}

async function run() {
  console.log('Starting Patch Rounds Runner...');
  
  // 1. Git status check (just checking if git exists/works, not strictly blocking if clean or not, since user might have uncommitted changes)
  try {
    execSync('git status', { stdio: 'pipe' });
  } catch (e) {
    console.error('Git is not available or not in a git repository.');
  }

  // 2. Backup data
  fs.copyFileSync(DB_PATH, BACKUP_PATH);

  // Initial count
  const initialCount = getFailCount();
  console.log(`Initial fail count: ${initialCount}`);

  let currentCount = initialCount;
  const summary = [];

  // Find all patch scripts
  const scriptsDir = 'scripts';
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.startsWith('patch_manual_round_') && f.endsWith('.js'))
    .sort(); // This will sort round_1, round_2... round_4, round_4_fix

  for (const script of files) {
    const scriptPath = path.join(scriptsDir, script);
    const roundName = script.replace('.js', '');
    
    // 3. Run round
    const startCount = currentCount;
    const success = execWithTimeout(`node ${scriptPath}`, 30000);
    
    if (!success) {
      const errorMsg = 'Timeout or execution error';
      summary.push({ round: roundName, beforeFailCount: startCount, afterFailCount: null, changedFiles: [], status: 'stopped', errorMessage: errorMsg });
      console.log(`[STOPPED] ${roundName} - ${errorMsg}`);
      
      // Rollback
      fs.copyFileSync(BACKUP_PATH, DB_PATH);
      console.log(`Rolled back to backup.`);
      break;
    }

    // 4. Audit
    const afterCount = getFailCount();
    
    // 5. Fail count check
    if (afterCount > startCount) {
      const errorMsg = `Fail count increased from ${startCount} to ${afterCount}.`;
      summary.push({ round: roundName, beforeFailCount: startCount, afterFailCount: afterCount, changedFiles: [DB_PATH], status: 'rollback', errorMessage: errorMsg });
      console.log(`[ROLLBACK] ${roundName} - ${errorMsg}`);
      
      // Rollback
      fs.copyFileSync(BACKUP_PATH, DB_PATH);
      console.log(`Rolled back to backup.`);
      break;
    }

    // 6. Proceed
    summary.push({ round: roundName, beforeFailCount: startCount, afterFailCount: afterCount, changedFiles: [DB_PATH], status: 'pass', errorMessage: null });
    console.log(`[PASS] ${roundName} - count: ${startCount} -> ${afterCount}`);
    
    currentCount = afterCount;
  }

  // 7. Output summary
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Runner finished. Final count: ${currentCount}`);
}

run();
