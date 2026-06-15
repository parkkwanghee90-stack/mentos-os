// 라우트 게이트 인가 판정(순수 함수).
// 보안 원칙: 판정은 서버에서 파생된 user(역할 포함)만으로 한다.
// localStorage 등 클라이언트 조작 가능한 플래그는 인자로도 받지 않는다.
//
// @param {{ user?: ({role?: string}|null), required?: boolean, requiredRole?: (string|null), authLoading?: boolean }} opts
// @returns {'allow'|'login'|'forbidden'|'loading'}
export function resolveGateAccess({
  user = null,
  required = false,
  requiredRole = null,
  authLoading = false,
} = {}) {
  const needsAuth = required || !!requiredRole;

  // 인증이 필요한데 로그인 안 됨: 로딩 중이면 대기, 아니면 로그인 유도
  if (needsAuth && !user) {
    return authLoading ? 'loading' : 'login';
  }

  // 역할이 필요한데 일치하지 않음 (admin은 슈퍼유저로 모든 역할 통과)
  if (requiredRole && user && user.role !== requiredRole && user.role !== 'admin') {
    return 'forbidden';
  }

  if (authLoading) return 'loading';
  return 'allow';
}
