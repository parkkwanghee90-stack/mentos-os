// payapp-create: PayApp REST(cmd=payrequest) 결제요청 생성용 순수 로직.
// Deno/네트워크 미사용 — 단위테스트(vitest)로 검증 가능하게 분리.

export interface CreateInput {
  userid: string;       // PayApp 판매자 ID (예: nuricampus)
  userId: string;       // Supabase user id → var1 (결제자 매칭)
  orderId: string;      // 주문번호 → var2
  phone: string;        // 수신 휴대폰 (recvphone)
  price: number;        // 결제금액
  goodname: string;     // 상품명
  feedbackurl: string;  // 결제완료 통보(웹훅) URL
  returnurl: string;    // 결제후 복귀 URL
}

/** PayApp REST payrequest 파라미터를 구성한다. */
export function buildCreateParams(input: CreateInput): Record<string, string> {
  return {
    cmd: 'payrequest',
    userid: input.userid,
    goodname: input.goodname,
    price: String(input.price),
    recvphone: input.phone,
    smsuse: 'n',
    var1: input.userId,
    var2: input.orderId,
    feedbackurl: input.feedbackurl,
    returnurl: input.returnurl,
  };
}

export interface PayappResult {
  state: string;
  errno: string;
  mulNo: number | null;
  payurl: string | null;
  errorMessage: string;
}

/**
 * PayApp REST 응답(application/x-www-form-urlencoded 문자열)을 파싱한다.
 * 예: state=1&errno=00000&mul_no=123&payurl=https%3A%2F%2F...
 */
export function parsePayappResponse(text: string): PayappResult {
  const params = new URLSearchParams(text);
  const mulNoRaw = params.get('mul_no');
  return {
    state: params.get('state') ?? '',
    errno: params.get('errno') ?? '',
    mulNo: mulNoRaw ? Number(mulNoRaw) : null,
    payurl: params.get('payurl'), // URLSearchParams가 자동 디코드
    errorMessage: params.get('errorMessage') ?? '',
  };
}

/** 결제URL 발급 성공 여부. */
export function isCreateSuccess(r: PayappResult): boolean {
  return r.state === '1' && r.errno === '00000' && !!r.payurl;
}
