const assert = require('node:assert');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { pick } = require('./next_pick.cjs');

const emptyPosted = path.join(os.tmpdir(), `posted_empty_${process.pid}.json`);
fs.writeFileSync(emptyPosted, '[]');
const PRI = ['강남', '서초', '송파', '분당', '성남'];

// 빈 트래커·빈 게시: go1 우선, 강남/분당 우선, 개수 준수
const t0 = { done: [], deferred: [], needs_review: [], needs_source: [] };
const r = pick(5, { tracker: t0, postedFile: emptyPosted });
assert.strictEqual(r.length, 5, 'returns N');
assert.ok(r.every(x => x.grade === 'go1'), 'go1 before go2');
assert.ok(PRI.some(k => r[0].region.includes(k)), 'priority region first');

// 제외: done·needs_review·게시는 큐에서 빠진다
const t1 = { done: [{ grade: 'go1', slug: r[0].slug }], deferred: [], needs_review: [{ grade: 'go1', slug: r[1].slug }], needs_source: [] };
const r1 = pick(50, { tracker: t1, postedFile: emptyPosted });
assert.ok(!r1.some(x => x.grade === 'go1' && x.slug === r[0].slug), 'done excluded');
assert.ok(!r1.some(x => x.grade === 'go1' && x.slug === r[1].slug), 'needs_review excluded');

// deferred 는 다시 뽑힌다(제외 아님)
const t2 = { done: [], deferred: [{ grade: 'go1', slug: r[0].slug }], needs_review: [], needs_source: [] };
const r2 = pick(50, { tracker: t2, postedFile: emptyPosted });
assert.ok(r2.some(x => x.grade === 'go1' && x.slug === r[0].slug), 'deferred is re-picked');

fs.unlinkSync(emptyPosted);
console.log('next_pick.test OK');
