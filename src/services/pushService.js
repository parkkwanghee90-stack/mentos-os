import { supabase } from '@/services/supabaseClient';

// ─── Push Config Helpers ────────────────────────────────────────────
const PUSH_CONFIG_KEY = 'mentos_push_config';
const PUSH_QUEUE_KEY = 'pushQueue';

/**
 * 푸시 설정을 localStorage에서 읽어옵니다.
 * @returns {{ sms: { apiKey: string, apiSecret: string, sender: string }, kakao: { apiKey: string, templateId: string, senderKey: string }, parentPhones: Record<string, string> } | null}
 */
export function getPushConfig() {
  try {
    const raw = localStorage.getItem(PUSH_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 푸시 설정을 localStorage에 저장합니다.
 * @param {object} config
 */
export function savePushConfig(config) {
  localStorage.setItem(PUSH_CONFIG_KEY, JSON.stringify(config));
}

// ─── localStorage Queue Helpers ─────────────────────────────────────
function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(PUSH_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(PUSH_QUEUE_KEY, JSON.stringify(queue));
}

// ─── 1. Supabase 푸시 저장 ──────────────────────────────────────────
async function saveToSupabase(pushTask) {
  try {
    const { error } = await supabase.from('push_notifications').insert({
      type: pushTask.type,
      message: pushTask.message,
      status: pushTask.status,
      channels: pushTask.channels || [],
      created_at: new Date(pushTask.timestamp).toISOString(),
    });
    if (error) throw error;
    console.log('[pushService] Supabase 저장 성공');
    return true;
  } catch (err) {
    console.warn('[pushService] Supabase 저장 실패 (localStorage fallback):', err.message);
    return false;
  }
}

// ─── 2. CoolSMS REST API v4 발송 ────────────────────────────────────
async function sendCoolSMS(message, config) {
  const { sms } = config;
  let { parentPhones } = config;
  if (!sms?.apiKey || !sms?.apiSecret || !sms?.sender) {
    console.log('[pushService] CoolSMS 설정 없음 — skip');
    return false;
  }

  // parentPhones가 비어있으면 localStorage의 mentos_mock_user에서 자동 추출
  if (!parentPhones || Object.keys(parentPhones).length === 0) {
    try {
      const u = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}');
      if (u.parentPhone) {
        parentPhones = { [u.name || '학생']: u.parentPhone };
      }
    } catch (e) { /* ignore */ }
  }

  const phones = parentPhones ? Object.values(parentPhones).filter(Boolean) : [];
  if (phones.length === 0) {
    console.log('[pushService] 학부모 전화번호 미등록 — SMS skip');
    return false;
  }

  try {
    // HMAC-SHA256 인증 헤더 생성
    const date = new Date().toISOString();
    const salt = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    // Web Crypto API로 HMAC-SHA256 서명
    const encoder = new TextEncoder();
    const keyData = encoder.encode(sms.apiSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC', cryptoKey, encoder.encode(date + salt)
    );
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const authHeader = `HMAC-SHA256 apiKey=${sms.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

    // 각 학부모에게 개별 발송
    const results = await Promise.allSettled(
      phones.map(phone => {
        const cleanPhone = phone.replace(/-/g, '');
        return fetch('https://api.coolsms.co.kr/messages/v4/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            message: {
              to: cleanPhone,
              from: sms.sender.replace(/-/g, ''),
              text: message,
              type: message.length > 90 ? 'LMS' : 'SMS',
            },
          }),
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[pushService] CoolSMS 발송 완료: ${successCount}/${phones.length}건`);
    return successCount > 0;
  } catch (err) {
    console.warn('[pushService] CoolSMS 발송 실패:', err.message);
    return false;
  }
}

// ─── Solapi(CoolSMS) v4 공통 인증 헤더 (HMAC-SHA256) ─────────────────
const SOLAPI_SEND_URL = 'https://api.solapi.com/messages/v4/send';

async function buildSolapiAuthHeader(apiKey, apiSecret) {
  const date = new Date().toISOString();
  const salt = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(apiSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(date + salt));
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

// 학부모 전화번호 수집 (config.parentPhones 또는 mentos_mock_user fallback)
function resolveParentPhones(config) {
  let { parentPhones } = config;
  if (!parentPhones || Object.keys(parentPhones).length === 0) {
    try {
      const u = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}');
      if (u.parentPhone) parentPhones = { [u.name || '학생']: u.parentPhone };
    } catch (e) { /* ignore */ }
  }
  return parentPhones ? Object.values(parentPhones).filter(Boolean) : [];
}

// ─── 3. Solapi → 카카오 발송 (알림톡/친구톡) ────────────────────────
// 인증·발신번호는 Solapi 자격증명(config.sms)을 그대로 사용한다.
// 카카오 채널 pfId는 필수, templateId가 있으면 알림톡, 없으면 친구톡(자유 텍스트).
// SMS와 동일한 Solapi 계정이므로 "Solapi에서 카카오톡으로 전송" 구조와 일치한다.
async function sendKakaoAlimtalk(message, config) {
  const { sms, kakao } = config;
  if (!sms?.apiKey || !sms?.apiSecret) {
    console.log('[pushService] Solapi 자격증명(config.sms) 없음 — 카카오 skip');
    return false;
  }
  if (!kakao?.pfId) {
    console.log('[pushService] 카카오 채널(pfId) 미설정 — 카카오 skip');
    return false;
  }

  const phones = resolveParentPhones(config);
  if (phones.length === 0) {
    console.log('[pushService] 학부모 전화번호 미등록 — 카카오 skip');
    return false;
  }

  try {
    const authHeader = await buildSolapiAuthHeader(sms.apiKey, sms.apiSecret);
    const from = (sms.sender || '').replace(/-/g, '');

    const results = await Promise.allSettled(
      phones.map(phone => {
        const to = phone.replace(/-/g, '');
        const kakaoOptions = { pfId: kakao.pfId, disableSms: false };
        if (kakao.templateId) kakaoOptions.templateId = kakao.templateId;
        return fetch(SOLAPI_SEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
          body: JSON.stringify({ message: { to, from, text: message, kakaoOptions } }),
        }).then(async res => {
          if (!res.ok) throw new Error(`Solapi ${res.status}: ${await res.text()}`);
          return res;
        });
      })
    );

    const ok = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[pushService] Solapi 카카오 발송: ${ok}/${phones.length}건`);
    return ok > 0;
  } catch (err) {
    console.warn('[pushService] Solapi 카카오 발송 실패:', err.message);
    return false;
  }
}

// ─── 4. 브라우저 Notification API ────────────────────────────────────
async function sendBrowserNotification(message) {
  try {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification('멘토스 OS 학부모 알림', {
        body: message,
        icon: '/favicon.ico',
      });
      console.log('[pushService] 브라우저 알림 발송 성공');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[pushService] 브라우저 알림 실패:', err.message);
    return false;
  }
}

// ─── 메인 푸시 함수 (기존 호환성 유지) ──────────────────────────────
/**
 * 학부모 푸시 알림을 다중 채널로 발송합니다.
 * 발송 순서: 카카오톡 → SMS → 브라우저 → localStorage
 * @param {string} messageStr - 푸시 메시지 문자열
 * @returns {object} pushTask 결과 객체
 */
export function queueParentPush(messageStr) {
  const pushTask = {
    type: 'parent_notification',
    message: messageStr,
    timestamp: Date.now(),
    status: 'pending',
    channels: [],
  };

  // 5. localStorage fallback — 항상 저장 (기존 호환성)
  const queue = readQueue();
  queue.push(pushTask);
  writeQueue(queue);

  console.log('[pushService] Parent Push Queued!', messageStr);

  // 비동기 다중 채널 발송 (fire-and-forget, 기존 동기 시그니처 유지)
  _dispatchAsync(pushTask).catch(err => {
    console.warn('[pushService] 비동기 발송 중 오류:', err.message);
  });

  return pushTask;
}

// ─── 비동기 다중 채널 디스패치 ───────────────────────────────────────
async function _dispatchAsync(pushTask) {
  const config = getPushConfig();
  const channelsUsed = [];

  // 6. 발송 순서: 카카오톡 → SMS → 브라우저 → localStorage(이미 완료)
  if (config) {
    // 카카오톡 알림톡
    const kakaoResult = await sendKakaoAlimtalk(pushTask.message, config);
    if (kakaoResult) channelsUsed.push('kakao');

    // CoolSMS
    const smsResult = await sendCoolSMS(pushTask.message, config);
    if (smsResult) channelsUsed.push('sms');
  }

  // 브라우저 알림
  const browserResult = await sendBrowserNotification(pushTask.message);
  if (browserResult) channelsUsed.push('browser');

  // 항상 localStorage에는 이미 저장됨
  channelsUsed.push('localStorage');

  // pushTask 상태 업데이트
  pushTask.channels = channelsUsed;
  pushTask.status = channelsUsed.some(ch => ch !== 'localStorage') ? 'sent' : 'pending';

  // localStorage 큐에서 해당 항목 상태 업데이트
  const queue = readQueue();
  const idx = queue.findIndex(
    item => item.timestamp === pushTask.timestamp && item.message === pushTask.message
  );
  if (idx !== -1) {
    queue[idx] = { ...queue[idx], status: pushTask.status, channels: channelsUsed };
    writeQueue(queue);
  }

  // 1. Supabase 저장 (실패해도 다른 채널 결과에 영향 없음)
  await saveToSupabase(pushTask);

  console.log(`[pushService] 다중 채널 발송 완료:`, channelsUsed);
}

// ─── 7. 푸시 이력 조회 ──────────────────────────────────────────────
/**
 * pushQueue에서 푸시 알림 이력을 조회합니다.
 * @param {number} limit - 최대 조회 건수 (기본 50)
 * @returns {Array} 푸시 이력 배열 (최신 순)
 */
export function getPushHistory(limit = 50) {
  const queue = readQueue();
  return queue
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
