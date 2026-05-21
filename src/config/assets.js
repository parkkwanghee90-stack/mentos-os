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
    const [pathPart, queryPart] = normalizedPath.split('?');
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
