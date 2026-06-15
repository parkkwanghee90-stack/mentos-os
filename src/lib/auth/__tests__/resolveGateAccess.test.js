import { describe, it, expect } from 'vitest';
import { resolveGateAccess } from '@/lib/auth/resolveGateAccess';

const student = { id: 's1', role: 'student' };
const admin = { id: 'a1', role: 'admin' };
const parent = { id: 'p1', role: 'parent' };

describe('resolveGateAccess — 공개/로그인', () => {
  it('공개(required·role 없음)는 허용', () => {
    expect(resolveGateAccess({ user: null })).toBe('allow');
    expect(resolveGateAccess({ user: student })).toBe('allow');
  });
  it('로그인 필요·비로그인·로드완료 → login', () => {
    expect(resolveGateAccess({ user: null, required: true, authLoading: false })).toBe('login');
  });
  it('로그인 필요·비로그인·로딩중 → loading (콘텐츠 플래시 방지)', () => {
    expect(resolveGateAccess({ user: null, required: true, authLoading: true })).toBe('loading');
  });
  it('로그인 필요·로그인됨 → allow', () => {
    expect(resolveGateAccess({ user: student, required: true })).toBe('allow');
  });
});

describe('resolveGateAccess — admin 역할(C2/C3)', () => {
  it('admin 역할 사용자는 허용', () => {
    expect(resolveGateAccess({ user: admin, required: true, requiredRole: 'admin' })).toBe('allow');
  });
  it('비-admin(student)은 forbidden', () => {
    expect(resolveGateAccess({ user: student, required: true, requiredRole: 'admin' })).toBe('forbidden');
  });
  it('비로그인·로드완료 → login (로그인 유도)', () => {
    expect(resolveGateAccess({ user: null, requiredRole: 'admin', authLoading: false })).toBe('login');
  });
  it('비로그인·로딩중 → loading', () => {
    expect(resolveGateAccess({ user: null, requiredRole: 'admin', authLoading: true })).toBe('loading');
  });
});

describe('resolveGateAccess — 일반 역할 + admin 슈퍼유저', () => {
  it('parent 역할 요구: parent 허용', () => {
    expect(resolveGateAccess({ user: parent, required: true, requiredRole: 'parent' })).toBe('allow');
  });
  it('parent 역할 요구: admin은 슈퍼유저로 허용', () => {
    expect(resolveGateAccess({ user: admin, required: true, requiredRole: 'parent' })).toBe('allow');
  });
  it('parent 역할 요구: student는 forbidden', () => {
    expect(resolveGateAccess({ user: student, required: true, requiredRole: 'parent' })).toBe('forbidden');
  });
});

describe('resolveGateAccess — localStorage 신뢰 없음(회귀 방지)', () => {
  it('user 입력만으로 판정 — 외부 플래그 인자 없음', () => {
    // 서버 파생 user가 null이면 어떤 추가 인자로도 admin이 될 수 없다
    expect(resolveGateAccess({ user: null, requiredRole: 'admin', authLoading: false })).toBe('login');
  });
});
