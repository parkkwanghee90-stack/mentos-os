// 고1 모의고사 AVS(PCBSA) 힌트 인덱스 — examId → { 문항번호: hint }. 힌트는 동명 .json.
import _hg1_2025_03 from './hg1-2025-03.json';
import _hg1_2025_06 from './hg1-2025-06.json';
import _hg1_2025_09 from './hg1-2025-09.json';
import _hg1_2025_10 from './hg1-2025-10.json';
import _hg1_2024_03 from './hg1-2024-03.json';
import _hg1_2024_06 from './hg1-2024-06.json';
import _hg1_2024_09 from './hg1-2024-09.json';
import _hg1_2024_10 from './hg1-2024-10.json';
import _hg1_2023_03 from './hg1-2023-03.json';
import _hg1_2023_06 from './hg1-2023-06.json';
import _hg1_2023_09 from './hg1-2023-09.json';
import _hg1_2023_12 from './hg1-2023-12.json';

export const MOCK_HINTS = {
  'hg1-2025-03': _hg1_2025_03,
  'hg1-2025-06': _hg1_2025_06,
  'hg1-2025-09': _hg1_2025_09,
  'hg1-2025-10': _hg1_2025_10,
  'hg1-2024-03': _hg1_2024_03,
  'hg1-2024-06': _hg1_2024_06,
  'hg1-2024-09': _hg1_2024_09,
  'hg1-2024-10': _hg1_2024_10,
  'hg1-2023-03': _hg1_2023_03,
  'hg1-2023-06': _hg1_2023_06,
  'hg1-2023-09': _hg1_2023_09,
  'hg1-2023-12': _hg1_2023_12,
};

export function getMockHint(examId, num) {
  const m = MOCK_HINTS[examId]; if (!m) return null;
  return m[String(num)] || m[String(num).padStart(3, '0')] || null;
}
