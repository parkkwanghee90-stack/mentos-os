import { buildCreateParams, parsePayappResponse, isCreateSuccess } from './lib.ts';

const PAYAPP_API = 'https://api.payapp.kr/oapi/apiLoad.html';

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let payload: { userId?: string; phone?: string; orderId?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: '잘못된 요청입니다.' }, 400);
  }

  const userId = (payload.userId ?? '').trim();
  const orderId = (payload.orderId ?? '').trim();
  const phone = (payload.phone ?? '').replace(/\D/g, '');

  if (!userId) return json({ error: '로그인 후 결제할 수 있습니다.' }, 400);
  if (!orderId) return json({ error: '주문번호가 없습니다.' }, 400);
  if (!isValidPhone(phone)) return json({ error: '올바른 휴대폰 번호가 필요합니다.' }, 400);

  const userid = Deno.env.get('PAYAPP_USERID') ?? 'nuricampus';
  const price = Number(Deno.env.get('PAYAPP_EXPECTED_PRICE') ?? '1000');
  const feedbackurl =
    Deno.env.get('PAYAPP_FEEDBACK_URL') ??
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/payapp-feedback`;
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://www.mathmentos.com';

  const params = buildCreateParams({
    userid,
    userId,
    orderId,
    phone,
    price,
    goodname: 'Mentos AI 프리미엄 (테스트 1,000원)',
    feedbackurl,
    returnurl: `${appOrigin}/success?orderId=${orderId}`,
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

  return json({ payurl: result.payurl, mulNo: result.mulNo, orderId }, 200);
});
