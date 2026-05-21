const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';

function listBucket(prefix) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ prefix: prefix, limit: 1000 });
    const options = {
      hostname: 'trvqgqvwhqvlgqzlsxbu.supabase.co',
      path: '/storage/v1/object/list/mentos-assets',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(body));
        else reject(new Error('List failed: ' + res.statusCode + ' ' + body));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function checkSample(path) {
  return new Promise((resolve) => {
    const url = SUPABASE_URL + '/storage/v1/object/public/mentos-assets/' + path;
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ path, status: res.statusCode, contentType: res.headers['content-type'] });
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
    req.end();
  });
}

async function run() {
  try {
    // Check math_crops
    const midFolders = await listBucket('math_crops/math_sang_mid/');
    const finalFolders = await listBucket('math_crops/math_sang_final/');
    
    console.log('math_crops/math_sang_mid/ folders:', midFolders.map(f => f.name));
    console.log('math_crops/math_sang_final/ folders:', finalFolders.map(f => f.name));
    
    // Pick some folders to list their files
    let cropFiles = [];
    if (midFolders.length > 0 && midFolders[0].name) {
       const f1 = await listBucket('math_crops/math_sang_mid/' + midFolders[0].name + '/');
       cropFiles.push(...f1.map(f => 'math_crops/math_sang_mid/' + midFolders[0].name + '/' + f.name));
    }
    if (finalFolders.length > 0 && finalFolders[0].name) {
       const f2 = await listBucket('math_crops/math_sang_final/' + finalFolders[0].name + '/');
       cropFiles.push(...f2.map(f => 'math_crops/math_sang_final/' + finalFolders[0].name + '/' + f.name));
    }
    
    console.log('Sample crops found:', cropFiles.slice(0, 5));
    
    // Check math_hints (math sang specific ones)
    // higher_order_eqstep2, quad_ineqstep2, linear_ineqstep2, etc.
    const hintFolders = ['higher_order_eqstep2', 'quad_ineqstep2', 'linear_ineqstep2', 'circle_eqstep2', 'points_coordstep2'];
    let hintFiles = [];
    for (const h of hintFolders) {
       try {
           const files = await listBucket('math_hints/' + h + '/');
           hintFiles.push(...files.map(f => 'math_hints/' + h + '/' + f.name));
       } catch (e) {}
    }
    console.log('Sample hints found:', hintFiles.slice(0, 5));
    
    // Data files
    const dataFiles = [
      'data/math_problem_texts.json',
      'data/answers_master.json',
      'data/avs_answers.json'
    ];
    
    // concept_cards / premium_lectures
    const premiumFiles = [
      'concept_cards/premium_lectures.json'
    ];
    
    const allSamplesToTest = [...dataFiles, ...premiumFiles, ...cropFiles.filter(f => !f.endsWith('.emptyFolderPlaceholder')).slice(0, 10), ...hintFiles.filter(f => !f.endsWith('.emptyFolderPlaceholder')).slice(0, 6)];
    
    console.log('\n--- Checking Samples ---');
    let successCount = 0;
    for (const file of allSamplesToTest) {
       const res = await checkSample(file);
       if (res.status === 200) {
         successCount++;
         console.log('? 200', res.path, 'Type:', res.contentType);
       } else {
         console.log('? FAIL', res.path, res.status || res.error);
       }
    }
    
    console.log('\nTotal Samples Checked:', allSamplesToTest.length);
    console.log('Success Count:', successCount);
    
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
