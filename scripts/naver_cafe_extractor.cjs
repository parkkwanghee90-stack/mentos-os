const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

puppeteer.use(StealthPlugin());

const CAFE_URL = 'https://cafe.naver.com/subit';
const SESSION_PATH = path.join(__dirname, '../session_cookies.json');

async function runExtractor() {
  console.log("==================================================");
  console.log("🚀 [Mentos OS] 네이버 수학 카페(subit) 풀-오토 크롤러 엔진 가동");
  console.log("==================================================");

  const nId = process.env.NAVER_CAFE_ID;
  const nPw = process.env.NAVER_CAFE_PW;

  if (!nId || nId.includes("아이디") || !nPw || nPw.includes("비밀번호")) {
    console.error("[ERROR] .env 파일에 아이디와 비밀번호가 올바르게 세팅되지 않았습니다.");
    process.exit(1);
  }

  // 화면 숨김 (완전 자동 봇 모드)
  const browser = await puppeteer.launch({ 
    headless: false, // 만약 캡차가 뜨면 즉시 확인할 수 있도록 유지
    defaultViewport: null,
    args: ['--start-maximized'] 
  });
  
  const page = await browser.newPage();

  if (fs.existsSync(SESSION_PATH)) {
    const cookiesString = fs.readFileSync(SESSION_PATH);
    const parsedCookies = JSON.parse(cookiesString);
    if (parsedCookies.length !== 0) {
      await page.setCookie(...parsedCookies);
    }
  }

  console.log(`[LOG] 카페 주소(${CAFE_URL})로 접속합니다...`);
  await page.goto(CAFE_URL, { waitUntil: 'networkidle2' });

  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('.gnb_btn_login') === null;
  });

  if (!isLoggedIn) {
     console.log("[LOG] 로그인이 풀렸습니다. 자동 로그인을 재시도합니다...");
     await page.goto('https://nid.naver.com/nidlogin.login', { waitUntil: 'networkidle2' });
     await page.evaluate((id, pw) => {
         document.body.querySelector('#id').value = id;
         document.body.querySelector('#pw').value = pw;
     }, nId, nPw);
     await page.click('.btn_login');
     await new Promise(r => setTimeout(r, 10000));
     await page.goto(CAFE_URL, { waitUntil: 'networkidle2' });
     const cookies = await page.cookies();
     fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies, null, 2));
  } else {
     console.log("[SUCCESS] 정상 로그인 식별 완료.");
  }

  // 영상 저장 DB 준비
  const capturedDbPath = path.join(__dirname, '../src/data/math_vision_db/captured_videos.json');
  if (!fs.existsSync(capturedDbPath)) {
      fs.writeFileSync(capturedDbPath, JSON.stringify([], null, 2));
  }
  let capturedCount = 0;

  // m3u8 스니퍼 전역 탑재
  page.on('response', response => {
      const url = response.url();
      if (url.includes('.m3u8') || url.includes('/hls/')) {
          console.log(`\n⭐ [비디오 포착!] 스트리밍 주소 확보 성공!`);
          console.log(` -> ${url.substring(0, 100)}...`);
          
          const db = JSON.parse(fs.readFileSync(capturedDbPath, 'utf8'));
          if(!db.find(v => v.url === url)) {
              db.push({ timestamp: new Date().toISOString(), url: url });
              fs.writeFileSync(capturedDbPath, JSON.stringify(db, null, 2));
              capturedCount++;
          }
      }
  });

  console.log("\n==================================================");
  console.log("[LOG] 카페 내부 게시글 전면 스캔을 개시합니다. (완전 자동 싹쓸이 모드)");

  try {
      await new Promise(r => setTimeout(r, 3000)); 
      console.log("[LOG] 카페 진입 확인 중... (만약 브라우저에 '새로운 기기 등록'이나 '보안 캡차'가 떴다면 1분 30초 내에 직접 클릭해 넘겨주세요!)");
      // 90초 대기 (네이버 보안 알림 수동 통과용)
      await page.waitForSelector('iframe#cafe_main', { timeout: 90000 });
      const frames = page.frames();
      const cafeMainFrame = frames.find(f => f.name() === 'cafe_main');
      
      if (!cafeMainFrame) {
          throw new Error("cafe_main 프레임 접근 실패. 네이버 구조가 변경되었거나 권한 부족입니다.");
      }

      console.log("[LOG] 메인 프레임 침투 성공. 올라온 최근 수학 해설 글들을 찾아냅니다...");

      const articleLinks = await cafeMainFrame.evaluate(() => {
          const links = document.querySelectorAll('a.article, a.m-tcol-c');
          const results = [];
          links.forEach(l => {
              if (l.innerText.trim() && l.href.includes('ArticleRead')) {
                  results.push({ title: l.innerText.trim(), href: l.href });
              }
          });
          const unique = [];
          const seen = new Set();
          for(const r of results) {
              if(!seen.has(r.href)) {
                  seen.add(r.href);
                  unique.push(r);
              }
          }
          return unique.slice(0, 5); // 봇 차단 방어용으로 상위 5건만 추출
      });

      if (articleLinks.length === 0) {
          console.log("[LOG] 추출할 게시글 링크가 없습니다.");
      } else {
          console.log(`[LOG] 총 ${articleLinks.length}개의 타겟 추적 완료. 시퀀스 뜯어내기 시작합니다.`);

          for (let i = 0; i < articleLinks.length; i++) {
              const target = articleLinks[i];
              console.log(`\n▶ [탐색 ${i+1}/${articleLinks.length}] 타겟 게시글: "${target.title}"`);
              
              const articlePage = await browser.newPage();
              // articlePage 에도 스니퍼 장착
              articlePage.on('response', response => {
                  const url = response.url();
                  if (url.includes('.m3u8') || url.includes('/hls/')) {
                      console.log(`  ⭐ [스니퍼 포착] -> ${url.substring(0, 80)}...`);
                      const db = JSON.parse(fs.readFileSync(capturedDbPath, 'utf8'));
                      if(!db.find(v => v.url === url)) {
                          db.push({ title: target.title, url: url, timestamp: new Date().toISOString() });
                          fs.writeFileSync(capturedDbPath, JSON.stringify(db, null, 2));
                          capturedCount++;
                      }
                  }
              });

              await articlePage.goto(target.href, { waitUntil: 'networkidle2' });
              console.log(`   └ 내부 프레임 진입 대기 및 영상 로딩 트리거 가동 중...`);
              await new Promise(r => setTimeout(r, 6000)); 
              await articlePage.close(); 
          }
      }
      
      console.log(`\n==================================================`);
      console.log(`[SUCCESS] 크롤링 종료. 방금 총 ${capturedCount}건의 m3u8 해설 영상 주소를 우리 JSON DB로 무단 복사했습니다!`);
      console.log(`==================================================`);

  } catch(e) {
      console.log("[ERROR] 치명적 에러 발생: ", e.message);
  }

  await browser.close();
}

runExtractor().catch(console.error);
