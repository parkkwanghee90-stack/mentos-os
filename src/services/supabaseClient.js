import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 보안 원칙: 클라이언트에는 RLS 보호를 받는 anon(public) 키만 사용한다.
// service_role 등 권한 키를 하드코딩하면 모든 RLS가 우회되어 DB 전체가 노출되므로 절대 금지.
// 키는 환경변수에서만 주입하며, 누락 시 위험한 fallback 대신 즉시 실패시킨다(fail-fast).
if (!supabaseAnonKey) {
  throw new Error(
    '[SupabaseClient] VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다. ' +
    '.env에 Supabase anon(public) 키를 설정하세요. ' +
    'service_role 등 권한 키는 클라이언트에서 절대 사용하지 마세요(RLS 우회 → DB 전체 노출).'
  );
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
