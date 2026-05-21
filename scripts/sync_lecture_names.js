import fs from 'fs';
import path from 'path';

const dir = './public/premium_lectures';

const syncFile = (source, targets) => {
  if (fs.existsSync(path.join(dir, source))) {
    const content = fs.readFileSync(path.join(dir, source));
    targets.forEach(t => {
      fs.writeFileSync(path.join(dir, t), content);
    });
  }
};

// Ensure all variations of naming exist for the new split units
syncFile('도함수의활용1.json', ['미분의 활용 접선.json', '미분의활용1.json', '도함수의 활용 1.json']);
syncFile('도함수의활용2.json', ['미분의 활용 그래프와방정식.json', '미분의활용2.json', '도함수의 활용 2.json']);
syncFile('도함수의활용3.json', ['미분의 활용 속도와가속도.json', '미분의활용3.json', '도함수의 활용 3.json', '미분의활용_속도와가속도.json']);
syncFile('정적분의활용.json', ['정적분의 활용.json', '정적분활용.json', '넓이와적분.json', '넓이와 적분.json']);
syncFile('미적분_지수로그극한.json', ['지수로그함수의 극한.json', '지수로그함수의극한.json', '여러가지함수의미분.json', '여러가지함수미분.json']);
syncFile('미적분_삼각함수극한.json', ['삼각함수의 극한.json', '삼각함수의극한.json']);
syncFile('미적분_삼각함수공식.json', [
  '삼각함수의 여러 가지 공식.json', 
  '삼각함수의 여러가지공식.json', 
  '삼각함수의 여러 가지공식.json',
  '삼각함수의 여러가지 공식.json',
  '삼각함수공식.json',
  '여러가지공식.json'
]);
syncFile('미적분_적분법.json', ['여러 가지 적분법.json', '여러가지적분법.json', '여러가지함수의적분.json', '치환적분과 부분적분.json']);
syncFile('미적분_정적분.json', ['정적분.json', '초월함수의 정적분.json', '미적분 정적분.json']);

console.log('File variations created for robust mapping!');
