// membership: 가입 순번 기반 멤버십 상태 조회 + 선착순 100명 1개월 무료 부여(서버 권위).
//   action='status'     → { ordinal, tier, price, premium, premium_until } (체험종료 분기/가격표시용)
//   action='claim_free' → ordinal≤100 검증 후 premium_until=+30d 부여 (클라이언트 셀프부여 취약점 우회)
// 가격/무료 판정은 절대 클라이언트를 신뢰하지 않고 auth.users 순번(service_role)으로만 결정한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { membershipInfo } from '../_shared/tiers.ts';

const FREE_GRANT_DAYS = 30;

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
};

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}

function isPremiumActive(meta: Record<string, unknown>): boolean {
  const flagged = meta.premium === true || meta.is_paid === true;
  if (!flagged) return false;
  const until = meta.premium_until as string | null | undefined;
  if (!until) return true; // 만료 없음(유료 영구)
  return new Date(until).getTime() > Date.now();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: '로그인이 필요합니다.' }, 401);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // JWT 검증 → 호출자 식별 (본인만)
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user) return json({ error: '유효하지 않은 인증입니다.' }, 401);

  // 가입 순번(service_role 전용 RPC)
  const { data: ordinalRaw, error: ordErr } = await admin.rpc('signup_ordinal', { uid: user.id });
  if (ordErr) {
    console.error('[membership] signup_ordinal 실패:', ordErr.message);
    return json({ error: '가입 순번 조회에 실패했습니다.' }, 500);
  }
  const info = membershipInfo(Number(ordinalRaw)); // { ordinal, tier, price }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const premium = isPremiumActive(meta);
  const premiumUntil = (meta.premium_until as string | null) ?? null;

  let body: { action?: string } = {};
  try { body = await req.json(); } catch { /* status 기본 */ }
  const action = body.action ?? 'status';

  if (action === 'claim_free') {
    if (info.tier !== 'free') {
      return json({ ...info, premium, error: '선착순 100명 무료 이벤트 대상이 아닙니다.' }, 403);
    }
    if (premium) {
      return json({ ...info, premium: true, premium_until: premiumUntil, alreadyPremium: true }, 200);
    }
    const now = new Date();
    const until = new Date(now.getTime() + FREE_GRANT_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error: grantErr } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...meta,
        is_paid: true,
        premium: true,
        premium_until: until,
        paid_at: now.toISOString(),
        grant: 'free100',
      },
    });
    if (grantErr) {
      console.error('[membership] free100 grant 실패:', grantErr.message);
      return json({ error: '무료 혜택 부여에 실패했습니다.' }, 500);
    }
    return json({ ...info, premium: true, premium_until: until, granted: true }, 200);
  }

  // action === 'status' (기본)
  return json({ ...info, premium, premium_until: premiumUntil }, 200);
});
