// SSOT: modal lecture id -> { slug, sourceJson }. Slugs are collision-free ASCII used
// for both Supabase JSON and audio paths (bypasses the unreliable getSafePath mapping).
import data from './premiumLectures.json';

export const PREMIUM_LECTURES = data;

export function slugForLecture(lectureId) {
  if (!lectureId) return null;
  return data[lectureId]?.slug || null;
}

export function lectureIds() {
  return Object.keys(data);
}
