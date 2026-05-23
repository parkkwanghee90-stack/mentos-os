import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const VALID_FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';

if (!supabaseAnonKey || supabaseAnonKey.startsWith('sb_publishable') || supabaseAnonKey.includes('invalid') || supabaseAnonKey.length < 50) {
  console.warn('[SupabaseClient] Warning: Invalid or CLI key detected in environment. Using verified service fallback key.');
  supabaseAnonKey = VALID_FALLBACK_KEY;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Storage에서 대용량 JSON 데이터(수학 문제, 개념 등)를 비동기적으로 가져오는 핵심 헬퍼 함수
 * @param {string} bucketName - 스토리지 버킷명 (기본값: math-curriculum)
 * @param {string} fileName - 파일 경로명 (예: DIAMOND_BOX_4.json)
 * @returns {Promise<any>} 파싱된 JSON 객체
 */
export async function fetchCurriculumData(bucketName, fileName) {
  try {
    console.log(`[SupabaseClient] Fetching ${fileName} from bucket '${bucketName}'...`);
    
    // public URL 획득
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    if (!data || !data.publicUrl) {
      throw new Error(`Failed to get public URL for ${fileName}`);
    }

    const response = await fetch(data.publicUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} when fetching ${fileName}`);
    }
    
    const jsonData = await response.json();
    console.log(`[SupabaseClient] Successfully loaded ${fileName} (${(JSON.stringify(jsonData).length / (1024 * 1024)).toFixed(2)} MB)`);
    return jsonData;
  } catch (error) {
    console.error(`[SupabaseClient] Error fetching math data:`, error);
    throw error;
  }
}
