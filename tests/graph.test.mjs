// Node test: same graph.js as the browser, in-memory Relate. Run: node tests/graph.test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import init, { RelateDb } from '../vendor/relate/relate.js';
import { makeRunner, seed, isSeeded, setPrefs, getPrefs, verdicts, counts } from '../graph.js';
import { ITEMS, REAL_ITEMS } from '../seed-data.js';

await init({ module_or_path: fs.readFileSync(new URL('../vendor/relate/relate_bg.wasm', import.meta.url)) });
const run = makeRunner(new RelateDb());
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('PASS', name); };

seed(run);
t('seeded flag set', () => assert.ok(isSeeded(run)));
const c1 = counts(run);
seed(run);
t('seed is idempotent (counts unchanged after second seed)', () => assert.deepEqual(counts(run), c1));
t('all demo items present', () => assert.equal(c1.MenuItem, ITEMS.length + REAL_ITEMS.length));

const status = v => Object.fromEntries(v.map(x => [x.id, x.verdict]));

setPrefs(run, { cut: 'shoestring', texture: 'crispy', seasoning: 'none', topping: 'none' });
let v = status(verdicts(run));
t('plain fries question: confirmed exact match', () => { assert.equal(v.f01, 'MATCH'); assert.equal(v.f09, 'REQUEST'); });
t('hard mismatch detected', () => { assert.equal(v.f02, 'MISMATCH'); assert.equal(v.f03, 'MISMATCH'); });
t('known claim that conflicts is a MISMATCH even if others are unknown', () => assert.equal(v.f05, 'MISMATCH'));
t('missing claims = UNVERIFIED, never MATCH', () => assert.equal(v.f08, 'UNVERIFIED'));
t('report-only evidence with all claims matching is MATCH with evidence kind shown', () => {
  setPrefs(run, { cut: 'crinkle', texture: 'crispy', seasoning: 'none', topping: 'none' });
  const f06 = verdicts(run).find(x => x.id === 'f06');
  assert.equal(f06.verdict, 'MATCH'); assert.equal(f06.evidence.kind, 'report');
  setPrefs(run, { cut: 'shoestring', texture: 'crispy', seasoning: 'none', topping: 'none' });
});
t('burgers/drinks show NO_PREFERENCE when nothing wanted', () => { assert.equal(v.b01, 'NO_PREFERENCE'); assert.equal(v.d01, 'NO_PREFERENCE'); });

setPrefs(run, { cut: 'standard', texture: 'crispy', seasoning: 'none', topping: '' });
t('unknown seasoning on an otherwise fitting item = UNVERIFIED', () => assert.equal(status(verdicts(run)).f05, 'UNVERIFIED'));
setPrefs(run, { cut: 'shoestring', texture: 'crispy', seasoning: 'none', topping: 'none' });

// preference change visibly alters results
setPrefs(run, { cut: 'waffle', texture: 'crispy', seasoning: 'spiced', topping: 'none' });
v = status(verdicts(run));
t('preference change flips results', () => { assert.equal(v.f03, 'MATCH'); assert.equal(v.f01, 'MISMATCH'); });
t('prefs round-trip through the graph', () => assert.deepEqual(getPrefs(run), { cut: 'waffle', texture: 'crispy', seasoning: 'spiced', topping: 'none' }));

// second item type on same schema
setPrefs(run, { cut: '', texture: '', seasoning: '', topping: '', sauce: 'ketchup only' });
v = status(verdicts(run));
t('second item type (burgers) on same schema', () => { assert.equal(v.b01, 'MATCH'); assert.equal(v.b03, 'MISMATCH'); assert.equal(v.b05, 'UNVERIFIED'); assert.equal(v.f01, 'NO_PREFERENCE'); });
setPrefs(run, { sauce: '', ice: 'none' });
v = status(verdicts(run));
t('drinks: no ice', () => { assert.equal(v.d01, 'MATCH'); assert.equal(v.d02, 'MISMATCH'); assert.equal(v.d03, 'UNVERIFIED'); assert.equal(v.d04, 'MISMATCH'); });

// safety invariant across many random preference sets
t('invariant: an item with any unknown claim or no evidence is never MATCH', () => {
  const dims = { cut: ['shoestring','thick','waffle'], texture: ['crispy','soft'], seasoning: ['none','salt only','spiced'], topping: ['none','cheese'], sauce: ['ketchup only','mustard'], ice: ['none','light'], fizz: ['still','sparkling'], bun:['plain','sesame'], cheese:['none','american'] };
  for (let i = 0; i < 40; i++) {
    const p = {}; for (const [d, vals] of Object.entries(dims)) p[d] = Math.random() < 0.5 ? vals[Math.floor(Math.random()*vals.length)] : '';
    setPrefs(run, p);
    for (const x of verdicts(run)) if (x.verdict === 'MATCH') {
      assert.ok(x.evidence, x.id + ' MATCH without evidence');
      assert.ok(x.claims.every(c => c.claim === 'match'), x.id + ' MATCH with non-match claim');
    }
  }
});
console.log(`\n${pass} tests passed`);

// ---- real data
{
  const stat = () => Object.fromEntries(verdicts(run, 'real').map(x => [x.id, x.verdict]));
  setPrefs(run, { cut: '', texture: '', seasoning: 'none', topping: '' });
  let r = stat();
  t('real: no-salt wanted: McDonalds is only-if-you-ask, never MATCH', () => assert.equal(r.r03, 'REQUEST'));
  t('real: Five Guys is salted, so MISMATCH for no-salt', () => assert.equal(r.r01, 'MISMATCH'));
  t('real: In-N-Out never states seasoning -> UNVERIFIED not MATCH', () => assert.equal(r.r07, 'UNVERIFIED'));
  setPrefs(run, { cut: 'waffle', texture: '', seasoning: '', topping: '' });
  r = stat();
  t('real: waffle cut matches only Chick-fil-A', () => { assert.equal(r.r04, 'MATCH'); assert.equal(r.r01, 'UNVERIFIED'); });
  t('real: every real item carries a source url', () => assert.ok(verdicts(run, 'real').every(x => x.evidence?.url)));
  t('real: datasets do not leak into each other', () => assert.ok(verdicts(run, 'demo').every(x => x.ds === 'demo')));
}
