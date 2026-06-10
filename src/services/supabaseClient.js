import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTcwNTMsImV4cCI6MjA5NDIzMzA1M30.f7pyqXvQv-llJNd1Ceyrepf0RljTqetP0rQWlfbs4kU';

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[SupabaseClient] ⚠️ VITE_SUPABASE_ANON_KEY가 설정되지 않아 내장 헬퍼 키(Fallback)로 대체 구동됩니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Storage에서 대용량 JSON 데이터(수학 문제, 개념 등)를 비동기적으로 가져오는 핵심 헬퍼 함수
 * @param {string} bucketName - 스토리지 버킷명 (기본값: math-curriculum)
 * @param {string} fileName - 파일 경로명 (예: DIAMOND_BOX_4.json)
 * @returns {Promise<any>} 파싱된 JSON 객체
 */
export async function fetchCurriculumData(bucketName = 'math-curriculum', fileName) {
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
