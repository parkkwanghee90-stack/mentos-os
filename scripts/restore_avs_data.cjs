const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../DIAMOND_BOX_4/math_hints');
const PUBLIC_DIR = path.join(__dirname, '../public/math_hints');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  
  const items = fs.readdirSync(from);
  let filesCopied = 0;
  
  for (const item of items) {
    const fromPath = path.join(from, item);
    const toPath = path.join(to, item);
    
    const stat = fs.statSync(fromPath);
    if (stat.isDirectory()) {
      filesCopied += copyFolderSync(fromPath, toPath);
    } else if (stat.isFile() && item.endsWith('.json')) {
      fs.copyFileSync(fromPath, toPath);
      filesCopied++;
    }
  }
  return filesCopied;
}

function main() {
  console.log('=== 📐 AVS 로컬 데이터 복원 시작 ===');
  console.log(`백업 소스: ${BACKUP_DIR}`);
  console.log(`대상 경로: ${PUBLIC_DIR}\n`);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ 백업 소스 디렉토리가 존재하지 않습니다!');
    process.exit(1);
  }
  
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  
  const folders = fs.readdirSync(BACKUP_DIR).filter(item => {
    return fs.statSync(path.join(BACKUP_DIR, item)).isDirectory();
  });
  
  console.log(`발견된 백업 단원 수: ${folders.length}개\n`);
  
  let totalFiles = 0;
  for (const folder of folders) {
    const fromFolder = path.join(BACKUP_DIR, folder);
    const toFolder = path.join(PUBLIC_DIR, folder);
    
    console.log(`-> [복원] ${folder} 단원 복사 중...`);
    const copiedCount = copyFolderSync(fromFolder, toFolder);
    console.log(`   완료 (${copiedCount}개 파일 복원)`);
    totalFiles += copiedCount;
  }
  
  console.log(`\n🎉 로컬 AVS 데이터 복원 성공!`);
  console.log(`총 복원된 단원 수: ${folders.length}개`);
  console.log(`총 복원된 JSON 힌트 파일 수: ${totalFiles}개`);
}

main();
