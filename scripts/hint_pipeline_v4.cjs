/**
 * hint_pipeline_v4.cjs
 * 선생님께서 지시하신 10대 절대 규칙을 완벽하게 준수하는 중앙 통제 파이프라인.
 * 어떠한 경우에도 파싱 실패 파일이 프로덕션 경로에 남아있지 않도록 보장합니다.
 */

const fs = require('fs');
const path = require('path');

const BROKEN_DIR = path.join(__dirname, '../public/math_hints_broken');
// 고정된 에러 로그 파일
const LOG_FILE = path.join(BROKEN_DIR, 'pipeline_error.log');

if (!fs.existsSync(BROKEN_DIR)) {
  fs.mkdirSync(BROKEN_DIR, { recursive: true });
}

function writeLog(msg) {
  const time = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${time}] ${msg}\n`);
}

/**
 * [규칙 2] AI 응답 텍스트에서 JSON 부분만 안전하게 추출 및 Stringify
 */
function extractAndParseJSON(rawAiText) {
  let matchedList = rawAiText.match(/```json\n([\s\S]*?)```/);
  let jsonString = matchedList ? matchedList[1] : rawAiText;
  
  // JSON 범위 추출 (처음 나오는 { 부터 마지막 쓰레기 텍스트 전까지)
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('JSON object not found in AI output.');
  }
  
  jsonString = jsonString.substring(firstBrace, lastBrace + 1);

  // [규칙 5] JSON.parse()
  const obj = JSON.parse(jsonString);
  return obj;
}

/**
 * [규칙 3 & 규칙 5] 필수 스키마 고정 및 검사
 */
function validateSchema(obj) {
  if (!obj || typeof obj !== 'object') throw new Error("Root is not an object");
  if (!obj.problem_id) throw new Error("Missing 'problem_id'");
  if (!obj.problem_type) throw new Error("Missing 'problem_type'");
  if (!Array.isArray(obj.steps)) throw new Error("'steps' is missing or not an array");

  obj.steps.forEach((s, idx) => {
    if (!('step' in s)) throw new Error(`Step[${idx}] missing 'step'`);
    if (!('title' in s)) throw new Error(`Step[${idx}] missing 'title'`);
    if (!('caption' in s)) throw new Error(`Step[${idx}] missing 'caption'`);
    // visual_action object 검증
    if (!s.visual_action || typeof s.visual_action !== 'object') {
      throw new Error(`Step[${idx}] missing or invalid 'visual_action' object`);
    }
    if (!('type' in s.visual_action)) throw new Error(`Step[${idx}] visual_action missing 'type'`);
  });

  return true;
}

/**
 * [규칙 9] 겹침(Overwrite) 금지 - 버전 넘버링 파일명 생성
 * 단, 프론트엔드 라우터가 직접 접근하는 .render.json 빌드 결과물은 항상 최신 상태로 덮어쓰기 허용 (앱 구동용)
 */
function getVersionedDestPath(destPath) {
  if (destPath.endsWith('.render.json')) return destPath;
  if (!fs.existsSync(destPath)) return destPath;
  
  const ext = path.extname(destPath);
  const base = path.basename(destPath, ext);
  const dir = path.dirname(destPath);
  
  let v = 2;
  let newPath;
  do {
    newPath = path.join(dir, `${base}_v${v}${ext}`);
    v++;
  } while (fs.existsSync(newPath));
  
  return newPath;
}

/**
 * [규칙 1 & 규칙 10] Atomic Write (temp -> validate -> rename)
 */
function atomicWriteHints(finalDestPath, jsObject) {
  // 1. 객체 -> Stringify
  const contentStr = JSON.stringify(jsObject, null, 2);
  
  const dir = path.dirname(finalDestPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tempPath = finalDestPath + '.tmp_' + Date.now();
  
  try {
    // Step 1: temp 파일에 저장
    fs.writeFileSync(tempPath, contentStr, 'utf8');

    // Step 2 & 3: 파일 다시 읽어서 Parse 및 Schema 재검증! (안정성 극대화)
    const readBack = fs.readFileSync(tempPath, 'utf8');
    const parsedObj = JSON.parse(readBack);
    validateSchema(parsedObj);

    // Step 4: 통과 시 rename 시도 (버전 덧붙이기)
    const versionedPath = getVersionedDestPath(finalDestPath);
    
    // rename
    fs.renameSync(tempPath, versionedPath);
    return versionedPath;
    
  } catch (err) {
    writeLog(`[AtomicWrite Failed] ${finalDestPath} : ${err.message}`);
    // 중간 실패 시 temp 삭제
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw err;
  }
}

/**
 * [규칙 7] 에러 파일 처리
 * 깨졌거나 파싱할 수 없는 JSON 파일 발견 시 broken 폴더로 즉시 이동
 */
function isolateBrokenFile(filePath, reason) {
  if (!fs.existsSync(filePath)) return;
  const fileName = path.basename(filePath);
  const parentName = path.basename(path.dirname(filePath)); // 단원명 (예: 삼각함수활용2단계)
  
  const brokenTarget = path.join(BROKEN_DIR, `${parentName}_${fileName}`);
  
  fs.renameSync(filePath, brokenTarget);
  writeLog(`[Isolate] Moved ${filePath} to broken dir. Reason: ${reason}`);
}

module.exports = {
  extractAndParseJSON,
  validateSchema,
  atomicWriteHints,
  isolateBrokenFile
};
