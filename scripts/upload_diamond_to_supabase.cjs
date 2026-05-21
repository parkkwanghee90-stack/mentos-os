const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load the same path mapping logic used by the React app
const { getSafePath } = require('../src/config/pathMapping.js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'mentos-assets';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Upload a single file to Supabase
async function uploadFile(localPath, rawRemotePath) {
  // Apply exactly the same path mapping as the client side
  const remotePath = getSafePath(rawRemotePath);
  
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const buffer = fs.readFileSync(localPath);
  
  const contentType = localPath.endsWith('.json') ? 'application/json' : 'application/octet-stream';
  
  // URL encode the segments for the HTTP request, but keep the actual path for Supabase
  const encodedRemotePath = remotePath.split('/').map(encodeURIComponent).join('/');
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedRemotePath}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Failed to upload ${remotePath} (raw: ${rawRemotePath}): ${res.status} ${errText}`);
    return false;
  }
  return true;
}

// Recursively find all files in a directory
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function main() {
  console.log('=== Uploading DIAMOND_BOX_4 to Supabase mentos-assets ===');
  const baseDir = 'DIAMOND_BOX_4';
  
  if (!fs.existsSync(baseDir)) {
    console.error('DIAMOND_BOX_4 not found!');
    process.exit(1);
  }

  const dirsToScan = [];
  
  if (fs.existsSync(path.join(baseDir, 'math_hints'))) {
    dirsToScan.push(path.join(baseDir, 'math_hints'));
  }
  
  const subDirs = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
  for (const sub of subDirs) {
    const subHintPath = path.join(baseDir, sub, 'math_hints');
    if (fs.existsSync(subHintPath)) {
      dirsToScan.push(subHintPath);
    }
  }
  
  console.log(`Found ${dirsToScan.length} math_hints directories to process.`);
  
  let totalUploaded = 0;
  let totalFailed = 0;
  let totalFiles = 0;
  
  for (const hintDir of dirsToScan) {
    console.log(`\nScanning ${hintDir}...`);
    const allFiles = getAllFiles(hintDir);
    totalFiles += allFiles.length;
    
    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < allFiles.length; i += batchSize) {
      const batch = allFiles.slice(i, i + batchSize);
      
      const promises = batch.map(async (localPath) => {
        const relativePath = path.relative(hintDir, localPath);
        // The raw remote path should start with math_hints/
        const rawRemotePath = `math_hints/${relativePath.split(path.sep).join('/')}`;
        
        const success = await uploadFile(localPath, rawRemotePath);
        if (success) {
          totalUploaded++;
          if (totalUploaded % 100 === 0) {
            console.log(`Uploaded ${totalUploaded} / ${totalFiles} files...`);
          }
        } else {
          totalFailed++;
        }
      });
      
      await Promise.all(promises);
    }
  }
  
  console.log('\n=== Upload Complete ===');
  console.log('\n=== Upload Complete ===');
  console.log(`Total Uploaded: ${totalUploaded}`);
  console.log(`Total Failed: ${totalFailed}`);
}

main().catch(console.error);
