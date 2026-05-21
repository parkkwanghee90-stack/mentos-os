import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.type() + ': ' + msg.text());
  });
  
  page.on('pageerror', error => {
    logs.push('PAGE_ERROR: ' + error.message);
  });

  try {
    await page.goto('http://localhost:5174/class/h_math6', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (e) {
    logs.push('GOTO_ERROR: ' + e.message);
  }
  
  // wait a bit for loops to happen
  await new Promise(r => setTimeout(r, 3000));
  
  fs.writeFileSync('C:/mentos_os_clean/scripts/console_logs.txt', logs.join('\n'));
  console.log('Logs saved.');
  
  await browser.close();
})();
