import { getSafePath } from './pathMapping';

export const URL_PREFIX = '';

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
