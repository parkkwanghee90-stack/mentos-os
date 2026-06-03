const SDK_SRC = 'https://lite.payapp.kr/public/api/v2/payapp-lite.js';
const PHONE_PROMPT = '결제 승인 통보를 받을 휴대폰 번호를 입력해주세요 (예: 010-1234-5678)';

function loadPayappSdk() {
  return new Promise((resolve, reject) => {
    if (window.PayApp) return resolve(window.PayApp);
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve(window.PayApp);
    script.onerror = () => reject(new Error('PayApp SDK 로딩에 실패했습니다.'));
    document.body.appendChild(script);
  });
}

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

export function buildPayappParams({ userId, orderId, recvphone }) {
  return {
    userid: import.meta.env.VITE_PAYAPP_USERID,
    goodname: 'Mentos AI 프리미엄 (테스트 1,000원)',
    price: '1000',
    recvphone,
    smsuse: 'n',
    var1: userId,
    var2: orderId,
    feedbackurl: import.meta.env.VITE_PAYAPP_FEEDBACK_URL,
    returnurl: `${window.location.origin}/success?orderId=${orderId}`,
    checkretry: 'y',
  };
}

/**
 * PayApp 결제창을 띄운다. 결제 결과 기록은 Supabase edge function(feedbackurl)에서만 처리한다.
 * recvphone은 PayApp 필수 파라미터이므로 저장된 번호 우선, 없으면 입력을 요청한다.
 * @param {{ userId: string, phone?: string }} args
 * @returns {Promise<string>} 생성된 orderId
 */
export async function startPayappCheckout({ userId, phone }) {
  if (!userId) {
    throw new Error('로그인 후 결제할 수 있습니다.');
  }

  let recvphone = resolveStoredPhone(phone);
  if (!recvphone) {
    const entered = typeof window !== 'undefined' && typeof window.prompt === 'function'
      ? window.prompt(PHONE_PROMPT, '')
      : '';
    if (!isValidPhone(entered)) {
      throw new Error('결제를 진행하려면 올바른 휴대폰 번호(예: 010-1234-5678)가 필요합니다.');
    }
    recvphone = normalizePhone(entered);
  }

  const orderId = buildOrderId();
  const PayApp = await loadPayappSdk();
  PayApp.payrequest(buildPayappParams({ userId, orderId, recvphone }));
  return orderId;
}
