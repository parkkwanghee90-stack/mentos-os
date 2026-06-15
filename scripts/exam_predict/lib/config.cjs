/**
 * 전국 고1 1학기 기말 예상문제 자동화 파이프라인 — 공통 설정
 *
 * 소스(기출 PDF): 마운트된 사무폴더. 환경변수 EXAM_SRC_DIR 로 덮어쓸 수 있음.
 * 산출물: 저장소 내 src/data/exam_predict/<stage>/<school>.json
 *
 * 단계별 산출물:
 *   raw_png/<school>/p01.png ...   ← 01_pdf_to_png
 *   extracted/<school>.json        ← 02_extract  (실제 기출을 디지털화: 분석용 내부데이터)
 *   analysis/<school>.json         ← 03_analyze  (출제비중·난이도·TOP유형)
 *   predicted/<school>.json        ← 04_generate (오리지널 예상문제 20)
 *   cards/<school>.json            ← 05_assemble (앱 카드/포스터용 최종)
 *
 * 저작권 주의: extracted/* 는 실제 기출의 디지털 사본이라 **내부 분석용**이며 앱에 그대로
 * 노출하지 않는다. 앱/포스터에 나가는 것은 predicted/*(생성된 오리지널)와 analysis 통계뿐.
 */
const path = require('path');
const fs = require('fs');

const REPO = path.join(__dirname, '..', '..', '..');

const SRC_DIR = process.env.EXAM_SRC_DIR
  || '/Volumes/수학의 빛 사무폴더/멘토스기출/2025/1학년1학기말';

// 출력 베이스. 고2 등 별도 파이프라인은 EXAM_OUT_BASE 로 분리(고1과 raw_png/predicted 섞이지 않게).
const OUT_BASE = process.env.EXAM_OUT_BASE
  ? path.resolve(process.env.EXAM_OUT_BASE)
  : path.join(REPO, 'src', 'data', 'exam_predict');
const STAGES = {
  raw_png: path.join(OUT_BASE, 'raw_png'),
  extracted: path.join(OUT_BASE, 'extracted'),
  analysis: path.join(OUT_BASE, 'analysis'),
  predicted: path.join(OUT_BASE, 'predicted'),
  cards: path.join(OUT_BASE, 'cards'),
};
const FAILED_LOG = path.join(OUT_BASE, 'failed.json');

// 공통수학1 1학기 기말 표준 단원(분류 타깃). 분석·생성의 기준 라벨.
const UNITS = [
  '복소수', '이차방정식', '이차함수', '고차방정식', '여러가지방정식', '연립방정식',
  '연립부등식', '절댓값부등식', '이차부등식', '경우의수', '순열', '조합', '행렬',
];

function ensureDirs() {
  [OUT_BASE, ...Object.values(STAGES)].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
}

/**
 * PDF 파일명에서 학교명을 최대한 안정적으로 추출.
 * 파일명이 제각각이라 휴리스틱 + 수동 override(school_overrides.json) 병행.
 */
// macOS 파일명은 NFD(자모 분리)로 오므로 NFC 로 정규화해 비교·표시.
function nfc(s) { return String(s).normalize('NFC'); }
function matches(file, filter) { return !filter || nfc(file).includes(nfc(filter)); }

// 학교명 추출: 파일명 어디에 있든(괄호 안 포함) '…고/여고/외고/고등학교' 로 끝나는
// 한글 토큰을 찾는다. 오탐(기말고사 등)은 뒤 글자(사/등) 검사로 배제.
function schoolFromFilename(file) {
  file = nfc(file);
  const overrides = loadOverrides();
  if (overrides[file]) return overrides[file];

  const name = file.replace(/\.pdf$/i, '');
  // 고 뒤에 한글이 안 오거나(=토큰 끝), '등학교' 로 이어질 때만 학교 토큰으로 인정.
  const re = /([가-힣]{2,20}?(?:여고|외고|고등학교|고))(?![가-힣])/g;
  const bad = /^(기말고|시험고|학년도고|지필고|중간고|평가고)$/;
  const cands = [];
  let m;
  while ((m = re.exec(name))) { const t = m[1]; if (!bad.test(t)) cands.push(t); }
  if (!cands.length) return 'unknown';
  // 가장 그럴듯한 것: 여고/외고/고등학교 우선, 없으면 첫 번째
  const pick = cands.find(c => /(여고|외고|고등학교)$/.test(c)) || cands[0];
  return pick.replace(/고등학교$/, '고');
}

function loadOverrides() {
  const p = path.join(OUT_BASE, 'school_overrides.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

// 학교명을 파일시스템 안전 슬러그로
function slug(school) {
  return String(school).replace(/[\/\\:*?"<>|\s]+/g, '_');
}

function logFailure(stage, school, file, error) {
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(FAILED_LOG, 'utf8')); } catch { /* 첫 실패 */ }
  arr.push({ stage, school, file, error: String(error && error.message || error), at: new Date().toISOString() });
  fs.writeFileSync(FAILED_LOG, JSON.stringify(arr, null, 2));
}

function listSourcePdfs() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`소스 폴더 없음(마운트 확인): ${SRC_DIR}`);
  }
  return fs.readdirSync(SRC_DIR).filter(f => /\.pdf$/i.test(f)).sort();
}

module.exports = { REPO, SRC_DIR, OUT_BASE, STAGES, FAILED_LOG, UNITS, ensureDirs, schoolFromFilename, slug, logFailure, listSourcePdfs, nfc, matches };
