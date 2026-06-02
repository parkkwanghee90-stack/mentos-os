import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[SupabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env 를 확인하세요. (service_role 키는 절대 클라이언트에 두지 않습니다)'
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
