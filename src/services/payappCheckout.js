const SDK_SRC = 'https://lite.payapp.kr/public/api/v2/payapp-lite.js';

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

export function buildPayappParams({ userId, orderId }) {
  return {
    userid: import.meta.env.VITE_PAYAPP_USERID,
    goodname: 'Mentos AI 프리미엄 (테스트 1,000원)',
    price: '1000',
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
 * @param {{ userId: string }} args
 * @returns {Promise<string>} 생성된 orderId
 */
export async function startPayappCheckout({ userId }) {
  if (!userId) {
    throw new Error('로그인 후 결제할 수 있습니다.');
  }
  const orderId = buildOrderId();
  const PayApp = await loadPayappSdk();
  PayApp.payrequest(buildPayappParams({ userId, orderId }));
  return orderId;
}
