export interface PayappBody { [key: string]: string }

export interface Creds {
  userid: string;
  linkkey: string;
  linkval: string;
  expectedPrice: number;
}

export function verifyCredentials(body: PayappBody, creds: Creds): boolean {
  return (
    body.userid === creds.userid &&
    body.linkkey === creds.linkkey &&
    body.linkval === creds.linkval &&
    Number(body.price) === creds.expectedPrice
  );
}

export type PayAction = 'success' | 'cancelled' | 'pending' | 'ignore';

export function decideAction(payState: string | number): PayAction {
  const s = Number(payState);
  if (s === 4) return 'success';
  if ([8, 9, 32, 64, 70, 71].includes(s)) return 'cancelled';
  if ([1, 10].includes(s)) return 'pending';
  return 'ignore';
}

export interface PaymentRow {
  user_id: string;
  order_id: string;
  mul_no: number;
  amount: number;
  status: string;
  pay_type: number | null;
  approved_at: string | null;
  raw: PayappBody;
}

export function mapPaymentRow(
  body: PayappBody,
  status: string,
  now: string,
): PaymentRow {
  return {
    user_id: body.var1,
    order_id: body.var2,
    mul_no: Number(body.mul_no),
    amount: Number(body.price),
    status,
    pay_type: body.pay_type ? Number(body.pay_type) : null,
    approved_at: status === 'success' ? now : null,
    raw: body,
  };
}
