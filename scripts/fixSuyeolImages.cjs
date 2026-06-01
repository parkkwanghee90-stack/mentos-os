const fs = require('fs');
const path = require('path');

const HTML = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\대수 수학1\\11수열의합3.4단계\\정답및해설.html';
const FILES = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\대수 수학1\\11수열의합3.4단계\\정답및해설_files';
const OUT = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\수학1\\09수열의합';

const html = fs.readFileSync(HTML, 'utf-8');
const regex = /<img[^>]+src="([^"]+\.webp)"/gi;
const images = [];
const seen = new Set();
let m;
while ((m = regex.exec(html)) !== null) {
  const fname = path.basename(m[1]);
  if (!seen.has(fname)) {
    seen.add(fname);
    const fp = path.join(FILES, fname);
    if (fs.existsSync(fp)) images.push(fp);
  }
}
console.log(`해설 이미지: ${images.length}개`);

for (let i = 0; i < 27 && i < images.length; i++) {
  const pid = String(43 + i).padStart(3, '0');
  const dest = path.join(OUT, `${pid}a.webp`);
  fs.copyFileSync(images[i], dest);
}
console.log('해설 이미지 복사 완료');
