import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyCredentials, decideAction, mapPaymentRow } from './lib.ts';

// payapp-create와 동일한 서버 권위 가격. var2(orderId) 접두사로 plan 식별.
const PLAN_PRICES: Record<string, number> = {
  early: 49000,
  regular: 89000,
  m6: 373800,
  y1: 640800,
  lifetime: 1800000,
  // 내신 완벽대비 풀코스 — payapp-create와 동일 권위 가격
  naesin_event: 19900,
  naesin_regular: 50000,
};

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('FAIL', { status: 200 });
  }

  // PayApp은 application/x-www-form-urlencoded 로 POST
  const form = await req.formData();
  const body: Record<string, string> = {};
  for (const [k, v] of form.entries()) body[k] = String(v);

  // var2(orderId) 접두사로 plan 식별 → 해당 plan의 권위 가격으로 검증
  const testMode = Deno.env.get('PAYAPP_TEST_PLAN') === '1';
  const planKey = (body.var2 ?? '').split('__')[0];
  const expectedPrice = testMode
    ? Number(Deno.env.get('PAYAPP_EXPECTED_PRICE') ?? '1000')
    : (PLAN_PRICES[planKey] ?? -1); // 알 수 없는 plan → -1 (어떤 결제도 통과 못 함)

  const creds = {
    userid: Deno.env.get('PAYAPP_USERID') ?? '',
    linkkey: Deno.env.get('PAYAPP_LINKKEY') ?? '',
    linkval: Deno.env.get('PAYAPP_VALUE') ?? '',
    expectedPrice,
  };

  if (!verifyCredentials(body, creds)) {
    console.warn('[payapp-feedback] credential/price verification failed');
    return new Response('FAIL', { status: 200 });
  }

  const action = decideAction(body.pay_state);
  if (action === 'ignore') {
    return new Response('SUCCESS', { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 멱등: 동일 mul_no가 이미 같은 상태로 처리됐으면 재처리 안 함
  const mulNo = Number(body.mul_no);
  const { data: existing } = await supabase
    .from('payments')
    .select('id,status')
    .eq('mul_no', mulNo)
    .maybeSingle();

  if (existing && existing.status === action) {
    return new Response('SUCCESS', { status: 200 });
  }

  const now = new Date().toISOString();
  const row = mapPaymentRow(body, action, now);

  const { error: upErr } = await supabase
    .from('payments')
    .upsert(row, { onConflict: 'mul_no' });
  if (upErr) {
    console.error('[payapp-feedback] payments upsert failed:', upErr.message);
    return new Response('FAIL', { status: 200 });
  }

  if (action === 'success') {
    const { error: adminErr } = await supabase.auth.admin.updateUserById(body.var1, {
      user_metadata: { is_paid: true, premium: true, paid_at: now },
    });
    if (adminErr) {
      console.error('[payapp-feedback] premium grant failed:', adminErr.message);
      return new Response('FAIL', { status: 200 });
    }
  }

  return new Response('SUCCESS', { status: 200 });
});
