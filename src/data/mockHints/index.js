// 고1·고2·고3 모의고사 AVS(PCBSA) 인라인 힌트 인덱스.
import h_hg1_2023_03 from './hg1-2023-03.json';
import h_hg1_2023_06 from './hg1-2023-06.json';
import h_hg1_2023_09 from './hg1-2023-09.json';
import h_hg1_2023_12 from './hg1-2023-12.json';
import h_hg1_2024_03 from './hg1-2024-03.json';
import h_hg1_2024_06 from './hg1-2024-06.json';
import h_hg1_2024_09 from './hg1-2024-09.json';
import h_hg1_2024_10 from './hg1-2024-10.json';
import h_hg1_2025_03 from './hg1-2025-03.json';
import h_hg1_2025_06 from './hg1-2025-06.json';
import h_hg1_2025_09 from './hg1-2025-09.json';
import h_hg1_2025_10 from './hg1-2025-10.json';
import h_hg2_2023_03 from './hg2-2023-03.json';
import h_hg2_2023_06 from './hg2-2023-06.json';
import h_hg2_2023_09 from './hg2-2023-09.json';
import h_hg2_2024_03 from './hg2-2024-03.json';
import h_hg2_2024_06 from './hg2-2024-06.json';
import h_hg2_2024_09 from './hg2-2024-09.json';
import h_hg2_2024_10 from './hg2-2024-10.json';
import h_hg2_2025_03 from './hg2-2025-03.json';
import h_hg2_2025_06 from './hg2-2025-06.json';
import h_hg2_2025_09 from './hg2-2025-09.json';
import h_hg2_2025_10 from './hg2-2025-10.json';
import h_CSAT_2025_9월_미적분 from './CSAT_2025_9월_미적분.json';
import h_CSAT_2025_9월_확통 from './CSAT_2025_9월_확통.json';
import h_CSAT_2026_3월_미적분 from './CSAT_2026_3월_미적분.json';
import h_CSAT_2026_3월_확통 from './CSAT_2026_3월_확통.json';

export const MOCK_HINTS = {
  'hg1-2023-03': h_hg1_2023_03,
  'hg1-2023-06': h_hg1_2023_06,
  'hg1-2023-09': h_hg1_2023_09,
  'hg1-2023-12': h_hg1_2023_12,
  'hg1-2024-03': h_hg1_2024_03,
  'hg1-2024-06': h_hg1_2024_06,
  'hg1-2024-09': h_hg1_2024_09,
  'hg1-2024-10': h_hg1_2024_10,
  'hg1-2025-03': h_hg1_2025_03,
  'hg1-2025-06': h_hg1_2025_06,
  'hg1-2025-09': h_hg1_2025_09,
  'hg1-2025-10': h_hg1_2025_10,
  'hg2-2023-03': h_hg2_2023_03,
  'hg2-2023-06': h_hg2_2023_06,
  'hg2-2023-09': h_hg2_2023_09,
  'hg2-2024-03': h_hg2_2024_03,
  'hg2-2024-06': h_hg2_2024_06,
  'hg2-2024-09': h_hg2_2024_09,
  'hg2-2024-10': h_hg2_2024_10,
  'hg2-2025-03': h_hg2_2025_03,
  'hg2-2025-06': h_hg2_2025_06,
  'hg2-2025-09': h_hg2_2025_09,
  'hg2-2025-10': h_hg2_2025_10,
  'CSAT_2025_9월_미적분': h_CSAT_2025_9월_미적분,
  'CSAT_2025_9월_확통': h_CSAT_2025_9월_확통,
  'CSAT_2026_3월_미적분': h_CSAT_2026_3월_미적분,
  'CSAT_2026_3월_확통': h_CSAT_2026_3월_확통,
};

export function getMockHint(examId, num) {
  let key = examId;
  // 고3 확통 1~22 공통문항은 미적분 힌트 공유(없을 때 폴백)
  const m = MOCK_HINTS[key];
  const pid3 = String(num).padStart(3, '0');
  if (m && (m[String(num)] || m[pid3])) return m[String(num)] || m[pid3];
  if (typeof key === 'string' && key.endsWith('_확통') && Number(num) <= 22) {
    const mc = MOCK_HINTS[key.replace('_확통', '_미적분')];
    if (mc) return mc[String(num)] || mc[pid3] || null;
  }
  return null;
}
