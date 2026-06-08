import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildCreateParams, parsePayappResponse, isCreateSuccess } from './lib.ts';
import { effectivePaidPlan } from '../_shared/tiers.ts';

const PAYAPP_API = 'https://api.payapp.kr/oapi/apiLoad.html';

// 멤버십(월 구독) 구매 의도로 들어오는 plan 키. 이 경우 가격을 클라이언트 선택이 아닌
// 서버가 '가입 순번'으로 결정한다(101~1000=earlybird 45,000 / 1001+=regular 89,000).
// 강의용 'early'(49,000)·기간권(m6/y1/lifetime)은 게이트 대상이 아니다.
const MEMBERSHIP_PLANS = new Set(['regular', 'earlybird']);

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

function isValidPhone(raw: string): boolean {
  return /^01\d{8,9}$/.test((raw ?? '').replace(/\D/g, ''));
}

// 서버 권위 가격 (클라이언트가 금액 조작 불가) — 1회결제 기준.
// 월 요금제(early/regular)도 우선 1회결제. 자동 정기결제는 PayApp 정기결제 활성화 후 별도 연동.
const PLAN_PRICES: Record<string, { price: number; name: string }> = {
  earlybird: { price: 45000,  name: '매쓰멘토스 AI 1:1 과외 · 얼리버드(선착순 1,000명, 1개월)' },
  early:    { price: 49000,   name: '매쓰멘토스 AI 1:1 과외 · 프리미엄 강의' },
  regular:  { price: 89000,   name: '매쓰멘토스 AI 1:1 과외 · 정규(1개월)' },
  m6:       { price: 373800,  name: '매쓰멘토스 AI 1:1 과외 · 6개월권' },
  y1:       { price: 640800,  name: '매쓰멘토스 AI 1:1 과외 · 1년권' },
  lifetime: { price: 1800000, name: '매쓰멘토스 AI 1:1 과외 · 평생권' },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let payload: { userId?: string; phone?: string; orderId?: string; plan?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: '잘못된 요청입니다.' }, 400);
  }

  const userId = (payload.userId ?? '').trim();
  const orderId = (payload.orderId ?? '').trim();
  const phone = (payload.phone ?? '').replace(/\D/g, '');
  const plan = (payload.plan ?? '').trim();

  if (!userId) return json({ error: '로그인 후 결제할 수 있습니다.' }, 400);
  if (!orderId) return json({ error: '주문번호가 없습니다.' }, 400);
  if (!isValidPhone(phone)) return json({ error: '올바른 휴대폰 번호가 필요합니다.' }, 400);

  // 테스트 모드: PAYAPP_TEST_PLAN=1 이면 plan 무시하고 EXPECTED_PRICE 사용
  const testMode = Deno.env.get('PAYAPP_TEST_PLAN') === '1';
  const planInfo = PLAN_PRICES[plan];
  if (!testMode && !planInfo) return json({ error: '유효하지 않은 요금제입니다.' }, 400);

  // ── 가입 순번 게이트 ──
  // 멤버십(월 구독) 결제는 클라이언트 선택이 아니라 서버가 '가입 순번'으로 가격(plan)을 정한다.
  // effectivePlan을 바꾸면 가격과 orderId 접두사(earlybird__/regular__)가 함께 이동하여
  // payapp-feedback의 가격 검증과 항상 일치한다(결합 보존).
  let effectivePlan = plan;
  if (!testMode && MEMBERSHIP_PLANS.has(plan)) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      const { data: ordinal, error: ordErr } = await supabase.rpc('signup_ordinal', { uid: userId });
      if (ordErr) {
        console.error('[payapp-create] signup_ordinal 실패 → regular로 fail-closed:', ordErr.message);
        effectivePlan = 'regular';
      } else {
        effectivePlan = effectivePaidPlan(Number(ordinal));
      }
    } catch (e) {
      console.error('[payapp-create] 순번 게이트 예외 → regular로 fail-closed:', e);
      effectivePlan = 'regular';
    }
  }
  const effInfo = PLAN_PRICES[effectivePlan]!;

  const userid = Deno.env.get('PAYAPP_USERID') ?? 'nuricampus';
  const price = testMode
    ? Number(Deno.env.get('PAYAPP_EXPECTED_PRICE') ?? '1000')
    : effInfo.price;
  const goodname = testMode ? 'Mentos AI 프리미엄 (테스트 1,000원)' : effInfo.name;
  // feedback가 plan별 금액을 검증하도록 orderId에 (실효)plan 접두사 부착
  const fullOrderId = testMode ? orderId : `${effectivePlan}__${orderId}`;
  const feedbackurl =
    Deno.env.get('PAYAPP_FEEDBACK_URL') ??
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/payapp-feedback`;
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://www.mathmentos.com';

  const params = buildCreateParams({
    userid,
    userId,
    orderId: fullOrderId,
    phone,
    price,
    goodname,
    feedbackurl,
    returnurl: `${appOrigin}/success?orderId=${fullOrderId}`,
  });

  let resp: Response;
  try {
    resp = await fetch(PAYAPP_API, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });
  } catch (e) {
    console.error('[payapp-create] PayApp fetch error:', e);
    return json({ error: '결제 서버 연결에 실패했습니다.' }, 502);
  }

  const text = await resp.text();
  const result = parsePayappResponse(text);

  if (!isCreateSuccess(result)) {
    console.error(
      '[payapp-create] PayApp error:',
      result.errno,
      result.errorMessage,
      text.slice(0, 200),
    );
    return json(
      { error: `결제 요청에 실패했습니다. (${result.errorMessage || result.errno || 'unknown'})` },
      502,
    );
  }

  return json({ payurl: result.payurl, mulNo: result.mulNo, orderId: fullOrderId }, 200);
});
