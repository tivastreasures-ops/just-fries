// The ONLY place a RelateDb exists. OPFS storage requires a dedicated worker.
import init, { RelateDb } from './vendor/relate/relate.js';
import { makeRunner, seed, isSeeded, getPrefs, setPrefs, verdicts, counts } from './graph.js';

let db = null, run = null, storage = 'none';
const DB_NAME = 'just-fries';

async function start(dbName = DB_NAME) {
  await init(); // mandatory before any RelateDb use
  let why = null;
  try {
    db = await RelateDb.open(`opfs://${dbName}`);
    storage = 'opfs';
  } catch (e) {
    // Most common cause: another tab already holds the single writer lock (verified: a read-only
    // open is also refused then). Fall back to a working in-memory copy and say so.
    why = String(e?.message ?? e);
    db = new RelateDb();
    storage = 'memory';
  }
  run = makeRunner(db);
  const wasSeeded = isSeeded(run);
  if (!wasSeeded) seed(run);
  return { storage, wasSeeded, why };
}

const ops = {
  async init(p) { return start(p?.dbName); },
  state(p) { const ds = p?.ds ?? 'demo'; return { ds, prefs: getPrefs(run), items: verdicts(run, ds), storage }; },
  setPrefs(p) { setPrefs(run, p.prefs); return ops.state(p); },
  counts() { return counts(run); },
  reset(p) { db.reset(); seed(run); return ops.state(p); },
  free() { db.free(); db = null; return true; },
};

self.onmessage = async ({ data }) => {
  const { id, op, payload } = data;
  try { self.postMessage({ id, ok: true, result: await ops[op](payload) }); }
  catch (e) { self.postMessage({ id, ok: false, error: String(e?.message ?? e) }); }
};
