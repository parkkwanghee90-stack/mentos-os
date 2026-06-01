/**
 * 슈퍼패스/관리자 인증번호 일치 여부를 판정하는 순수 함수.
 *
 * 보안 원칙: 시크릿이 미설정(undefined·빈 값·공백만)이면 입력과 무관하게 항상 false를
 * 반환한다. 이렇게 해야 환경변수(VITE_SUPER_PASS)가 누락된 환경에서 빈 입력으로
 * 관리자 권한이 우회되는 사고를 막을 수 있다.
 *
 * @param {string|undefined} configuredSecret - 환경변수에서 주입된 시크릿
 * @param {unknown} input - 사용자가 입력한 값
 * @returns {boolean} 인증 통과 여부
 */
export function isSuperPassMatch(configuredSecret, input) {
  if (typeof configuredSecret !== 'string') return false;
  const secret = configuredSecret.trim();
  if (!secret) return false;
  if (typeof input !== 'string') return false;
  return input.trim() === secret;
}
