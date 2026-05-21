const cp = require('child_process');
const fs = require('fs');

console.log('[WATCHDOG] Starting TTS Generation Watchdog...');

function runScript() {
  console.log('[WATCHDOG] Launching bulk_generate_tts.cjs...');
  const child = cp.spawn('node', ['scripts/bulk_generate_tts.cjs'], {
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n[WATCHDOG] Script crashed with code ${code}. Restarting in 3 seconds...`);
      setTimeout(runScript, 3000);
    } else {
      console.log('\n[WATCHDOG] Script finished successfully (Code 0). All TTS generated!');
      fs.writeFileSync('tts_progress_monitor.md', '# TTS Generation Complete\nAll 124 units successfully generated and uploaded to Supabase.');
      process.exit(0);
    }
  });
}

runScript();
