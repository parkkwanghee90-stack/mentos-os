// Cleans up premium-lecture audio debris on Supabase left by the old broken getSafePath
// paths: loose step_N.mp3 files at the audio/premium_lectures/ root, and folders whose
// name is NOT a current SSOT slug (e.g. "1", "2", "3", "derivative_01").
//
// SAFE BY DEFAULT: dry-run unless --confirm is passed. Never touches any folder whose
// name is a valid SSOT slug. Folder deletion additionally requires --folders.
//
// Usage:
//   node scripts/cleanup_premium_tts_orphans.cjs                 # dry-run: list debris
//   node scripts/cleanup_premium_tts_orphans.cjs --confirm       # delete root orphan files
//   node scripts/cleanup_premium_tts_orphans.cjs --confirm --folders  # also delete non-SSOT folders
const dotenv = require('dotenv');
dotenv.config();
const LECTURES = require('../src/lib/premiumLectures.json');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'mentos-assets';
const ROOT = 'audio/premium_lectures/';

if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing Supabase env'); process.exit(1); }

async function list(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`list ${prefix} -> ${res.status}`);
  return res.json();
}

async function remove(prefixes) {
  if (prefixes.length === 0) return;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes }),
  });
  if (!res.ok) throw new Error(`delete -> ${res.status} ${await res.text()}`);
}

async function main() {
  const confirm = process.argv.includes('--confirm');
  const doFolders = process.argv.includes('--folders');
  const validSlugs = new Set(Object.values(LECTURES).map((l) => l.slug));

  const root = await list(ROOT);
  const orphanFiles = root.filter((x) => x.name && x.name.endsWith('.mp3')).map((x) => `${ROOT}${x.name}`);
  const nonSsotFolders = root
    .filter((x) => x.name && !x.name.endsWith('.mp3') && !validSlugs.has(x.name))
    .map((x) => x.name);

  console.log('=== Premium TTS cleanup ===');
  console.log(`Mode: ${confirm ? 'DELETE' : 'DRY-RUN'}${doFolders ? ' +folders' : ''}`);
  console.log(`\nRoot orphan files (${orphanFiles.length}):`);
  orphanFiles.forEach((p) => console.log('  ', p));
  console.log(`\nNon-SSOT folders (${nonSsotFolders.length}):`, nonSsotFolders);

  // Expand folder contents (so we know exactly what would be deleted; never expand a valid slug).
  const folderObjects = [];
  for (const f of nonSsotFolders) {
    const items = await list(`${ROOT}${f}/`);
    items.filter((x) => x.name).forEach((x) => folderObjects.push(`${ROOT}${f}/${x.name}`));
  }
  if (doFolders) {
    console.log(`\nFolder objects to remove (${folderObjects.length}):`);
    folderObjects.forEach((p) => console.log('  ', p));
  }

  if (!confirm) {
    console.log('\n(dry-run) Nothing deleted. Re-run with --confirm (and --folders to include folders).');
    return;
  }

  // Safety: never delete anything under a valid SSOT slug folder.
  const targets = [...orphanFiles, ...(doFolders ? folderObjects : [])]
    .filter((p) => {
      const seg = p.slice(ROOT.length).split('/')[0];
      return !validSlugs.has(seg);
    });

  console.log(`\nDeleting ${targets.length} object(s)...`);
  // Delete in batches of 100.
  for (let i = 0; i < targets.length; i += 100) {
    await remove(targets.slice(i, i + 100));
  }
  console.log('Done.');
}
main().catch((e) => { console.error(e); process.exit(1); });
