const assert = require('node:assert');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const T = require('./tracker.cjs');

const tmp = path.join(os.tmpdir(), `tracker_test_${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify({ done: [{ grade: 'go1', slug: '가락고' }] }));

const t = T.load(tmp);
assert.deepStrictEqual(t.deferred, [], 'missing lists default to []');
assert.strictEqual(T.status(t, 'go1', '가락고'), 'done');
assert.strictEqual(T.status(t, 'go2', '휘문고'), null);

// mark moves between lists and is idempotent (no dup, promoted out of old list)
T.mark(t, 'go2', '휘문고', 'deferred', { reason: 'limit' });
assert.strictEqual(T.status(t, 'go2', '휘문고'), 'deferred');
T.mark(t, 'go2', '휘문고', 'done');
assert.strictEqual(T.status(t, 'go2', '휘문고'), 'done');
assert.strictEqual(t.deferred.length, 0, 'removed from deferred when promoted to done');
T.mark(t, 'go2', '휘문고', 'done'); // repeat
assert.strictEqual(t.done.filter(e => e.slug === '휘문고').length, 1, 'no duplicate done');

// limit signal detection
assert.ok(T.isLimitSignal("You've hit your weekly limit · resets 6pm (Asia/Seoul)"));
assert.ok(T.isLimitSignal('session limit'));
assert.ok(!T.isLimitSignal('all three files written and verified, done'));

T.save(t, tmp);
const reloaded = T.load(tmp);
assert.strictEqual(T.status(reloaded, 'go2', '휘문고'), 'done', 'save/load round-trip');

fs.unlinkSync(tmp);
console.log('tracker.test OK');
