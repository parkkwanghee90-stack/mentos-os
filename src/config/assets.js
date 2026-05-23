import { getSafePath } from './pathMapping';

// 브라우저 환경 판별: 로컬호스트(localhost, 127.0.0.1)가 아닌 배포 프로덕션 도메인인 경우
// Supabase Storage Public URL_PREFIX를 자동으로 지정해줍니다.
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const URL_PREFIX = isLocalhost ? '' : 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets';


/**
 * Resolves a local asset path to a Supabase public URL.
 * Automatically applies the Korean -> English mapping.
 */
export function resolveAsset(localPath) {
  console.log(`[assets.js] resolveAsset called with: ${localPath}`);
  console.log(`[assets.js] current URL_PREFIX is: "${URL_PREFIX}"`);
  if (!localPath) return localPath;
  // Remove leading slash if any
  const normalizedPath = localPath.startsWith('/') ? localPath.slice(1) : localPath;
  
  // If it's already an absolute URL, return as is
  if (normalizedPath.startsWith('http')) {
    console.log(`[assets.js] Returning absolute URL: ${localPath}`);
    return localPath;
  }

  // If we are in local development (empty URL_PREFIX), bypass path mapping 
  // and use the actual local Korean path with safe URL segment encoding.
  if (!URL_PREFIX) {
    let [pathPart, queryPart] = normalizedPath.split('?');
    
    // 로컬 환경의 평탄화(flat)된 math_crops 폴더 구조 및 명칭에 맞게 동적 재매핑
    if (pathPart.includes('math_crops')) {
      pathPart = pathPart.replace(/\(2\)수학\(상\)기말\//g, '');
      if (pathPart.includes('고차방정식2단계')) pathPart = pathPart.replace('고차방정식2단계', 'higher_order_eqstep2');
      else if (pathPart.includes('고차방정식3단계')) pathPart = pathPart.replace('고차방정식3단계', 'higher_order_eqstep3');
      else if (pathPart.includes('고차방정식4단계')) pathPart = pathPart.replace('고차방정식4단계', 'higher_order_eqstep4');
      else if (pathPart.includes('일차부등식3단계')) pathPart = pathPart.replace('일차부등식3단계', 'linear_ineq_step3');
      else if (pathPart.includes('일차부등식4단계')) pathPart = pathPart.replace('일차부등식4단계', 'linear_ineq_step4');
      else if (pathPart.includes('이차부등식3단계')) pathPart = pathPart.replace('이차부등식3단계', 'quadratic_ineq_step3');
      else if (pathPart.includes('이차부등식4단계')) pathPart = pathPart.replace('이차부등식4단계', 'quadratic_ineq_step4');
      else if (pathPart.includes('경우의수3단계') || pathPart.includes('경우의 수3단계')) pathPart = pathPart.replace(/경우의\s*수3단계/, 'cases_step3');
      else if (pathPart.includes('경우의수4단계') || pathPart.includes('경우의 수4단계')) pathPart = pathPart.replace(/경우의\s*수4단계/, 'cases_step4');
      else if (pathPart.includes('행렬3단계')) pathPart = pathPart.replace('행렬3단계', 'matrix_step3');
      else if (pathPart.includes('행렬4단계')) pathPart = pathPart.replace('행렬4단계', 'matrix_step4');
      else if (pathPart.includes('점과좌표3단계') || pathPart.includes('점과 좌표3단계')) pathPart = pathPart.replace(/점과\s*좌표3단계/, 'point_coord_step3');
      else if (pathPart.includes('점과좌표4단계') || pathPart.includes('점과 좌표4단계')) pathPart = pathPart.replace(/점과\s*좌표4단계/, 'point_coord_step4');
      else if (pathPart.includes('직선의방정식3단계') || pathPart.includes('직선의 방정식3단계')) pathPart = pathPart.replace(/직선의\s*방정식3단계/, 'line_eq_step3');
      else if (pathPart.includes('직선의방정식4단계') || pathPart.includes('직선의 방정식4단계')) pathPart = pathPart.replace(/직선의\s*방정식4단계/, 'line_eq_step4');
      else if (pathPart.includes('원의방정식3단계') || pathPart.includes('원의 방정식3단계')) pathPart = pathPart.replace(/원의\s*방정식3단계/, 'circle_eq_step3');
      else if (pathPart.includes('원의방정식4단계') || pathPart.includes('원의 방정식4단계')) pathPart = pathPart.replace(/원의\s*방정식4단계/, 'circle_eq_step4');
      else if (pathPart.includes('도형의이동3단계') || pathPart.includes('도형의 이동3단계')) pathPart = pathPart.replace(/도형의\s*이동3단계/, 'shape_move_step3');
      else if (pathPart.includes('도형의이동4단계') || pathPart.includes('도형의 이동4단계')) pathPart = pathPart.replace(/도형의\s*이동4단계/, 'shape_move_step4');
    }

    const encodedSegments = pathPart.split('/').map(part => {
      // Skip encoding if segment is already percent-encoded
      if (/%[0-9A-Fa-f]{2}/.test(part)) return part;
      return encodeURIComponent(part);
    }).join('/');
    const localResult = `/${encodedSegments}` + (queryPart ? `?${queryPart}` : '');
    console.log(`[assets.js] Local dev fallback returning: ${localResult}`);
    return localResult;
  }

  const safePath = getSafePath(normalizedPath);
  console.log(`[assets.js] getSafePath returned: ${safePath}`);
  
  const finalPath = `${URL_PREFIX}/${safePath}`;
  console.log(`[assets.js] resolveAsset returning: ${finalPath}`);
  return finalPath;
}

// Global accessibility
if (typeof window !== 'undefined') {
  window.URL_PREFIX = URL_PREFIX;
  window.resolveAsset = resolveAsset;
}
