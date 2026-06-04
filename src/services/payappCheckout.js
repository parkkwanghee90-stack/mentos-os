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
 * PayApp 결제 파라미터를 구성한다.
 * NOTE: feedbackurl은 PayApp lite 결제 엔드포인트가 거부(error 70080)하므로 여기서 보내지 않는다.
 *       결제 완료 통보(웹훅)는 PayApp 판매자 관리자에서 "계정 단위 feedbackurl"로 설정한다.
 *       var1(회원ID)·var2(주문번호)는 통보에 그대로 실려 회원 매칭에 사용된다.
 */
export function buildPayappParams({ userId, orderId, recvphone }) {
  return {
    userid: import.meta.env.VITE_PAYAPP_USERID,
    goodname: 'Mentos AI 프리미엄 (테스트 1,000원)',
    price: '1000',
    recvphone,
    smsuse: 'n',
    var1: userId,
    var2: orderId,
    returnurl: `${window.location.origin}/success?orderId=${orderId}`,
    checkretry: 'y',
  };
}

/**
 * PayApp 결제창을 브라우저에서 직접 띄운다(클라이언트 form 전송).
 * 서버 생성 payurl을 다른 IP에서 여는 방식은 PayApp이 "요청을 확인할 수 없습니다"로 거부하므로,
 * 결제 생성·열기를 같은 브라우저 세션에서 수행한다.
 * @param {{ userId: string, phone?: string }} args
 * @returns {Promise<string>} 생성된 orderId
 */
export async function startPayappCheckout({ userId, phone }) {
  if (!userId) {
    throw new Error('로그인 후 결제할 수 있습니다.');
  }

  const recvphone = resolveStoredPhone(phone) || askPhone();
  const orderId = buildOrderId();

  const PayApp = await loadPayappSdk();
  PayApp.payrequest(buildPayappParams({ userId, orderId, recvphone }));
  return orderId;
}
