const PHONE_PROMPT = '결제 승인 통보를 받을 휴대폰 번호를 입력해주세요 (예: 010-1234-5678)';

export function buildOrderId() {
  return `mentos_${Date.now()}`;
}

/** 휴대폰 번호에서 숫자만 추출한다. */
export function normalizePhone(raw) {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '');
}

/** 01로 시작하는 10~11자리(국내 휴대폰)인지 검증한다. */
export function isValidPhone(raw) {
  return /^01\d{8,9}$/.test(normalizePhone(raw));
}

/**
 * 결제에 사용할 수신 휴대폰번호를 결정한다.
 * 우선순위: 명시 전달값 → localStorage(mentos_mock_user.parentPhone).
 * 둘 다 없으면 빈 문자열을 반환한다(호출부에서 prompt 처리).
 */
function resolveStoredPhone(explicit) {
  if (isValidPhone(explicit)) return normalizePhone(explicit);
  try {
    const stored = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}');
    if (isValidPhone(stored.parentPhone)) return normalizePhone(stored.parentPhone);
  } catch (e) {
    console.warn('[payappCheckout] stored phone parse error:', e);
  }
  return '';
}

/** prompt로 휴대폰 번호를 입력받아 정규화한다. 유효하지 않으면 throw. */
function askPhone() {
  const entered =
    typeof window !== 'undefined' && typeof window.prompt === 'function'
      ? window.prompt(PHONE_PROMPT, '')
      : '';
  if (!isValidPhone(entered)) {
    throw new Error('결제를 진행하려면 올바른 휴대폰 번호(예: 010-1234-5678)가 필요합니다.');
  }
  return normalizePhone(entered);
}

/**
 * Supabase Edge Function(payapp-create)에 결제요청을 만들어 PayApp 결제URL을 받는다.
 * @returns {Promise<{ payurl: string, orderId: string }>}
 */
export async function requestPayurl({ userId, recvphone, orderId }) {
  const createUrl = import.meta.env.VITE_PAYAPP_CREATE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!createUrl) {
    throw new Error('결제 설정이 누락되었습니다. (VITE_PAYAPP_CREATE_URL)');
  }

  const res = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ userId, phone: recvphone, orderId }),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    throw new Error('결제 서버 응답을 처리하지 못했습니다.');
  }

  if (!res.ok || !data.payurl) {
    throw new Error(data.error || '결제 요청에 실패했습니다.');
  }
  return { payurl: data.payurl, orderId };
}

/**
 * PayApp 결제를 시작한다. 서버(payapp-create)에서 발급한 결제URL로 이동한다.
 * 결제 결과 기록·프리미엄 승인은 Supabase edge function(payapp-feedback)에서만 처리한다.
 * @param {{ userId: string, phone?: string }} args
 * @returns {Promise<string>} 생성된 orderId
 */
export async function startPayappCheckout({ userId, phone }) {
  if (!userId) {
    throw new Error('로그인 후 결제할 수 있습니다.');
  }

  const recvphone = resolveStoredPhone(phone) || askPhone();
  const orderId = buildOrderId();

  const { payurl } = await requestPayurl({ userId, recvphone, orderId });
  window.location.href = payurl;
  return orderId;
}
