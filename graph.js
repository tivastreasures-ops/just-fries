// Graph logic shared by the browser worker and the Node tests.
// `run(query, params)` must return a parsed Relate envelope: { columns, rows, stats, error }.
import { CATEGORIES, DIMENSIONS, ITEMS, SEED_VERSION } from './seed-data.js';

export class GraphError extends Error {}

export function makeRunner(db) {
  return (query, params = null) => {
    const env = JSON.parse(db.execute(query, params ? JSON.stringify(params) : null));
    if (env.error) throw new GraphError(`${env.error}\n  in: ${query.split('\n')[0]}`);
    return env;
  };
}

export function isSeeded(run) {
  const r = run('MATCH (m:Meta {id: "seed"}) RETURN m.version AS v');
  return r.rows.length > 0 && r.rows[0].v === SEED_VERSION;
}

// Idempotent: MERGE everywhere, so running twice never duplicates anything.
export function seed(run) {
  run('CREATE CONSTRAINT item_id IF NOT EXISTS FOR (m:MenuItem) REQUIRE m.id IS UNIQUE');
  for (const [cat, c] of Object.entries(CATEGORIES)) {
    run('MERGE (c:FoodCategory {name: $cat}) SET c.label = $label', { cat, label: c.label });
    for (const d of c.dims) {
      run('MATCH (c:FoodCategory {name: $cat}) MERGE (d:Dimension {name: $d}) SET d.label = $label MERGE (c)-[:ASKS]->(d)',
        { cat, d, label: DIMENSIONS[d].label });
    }
  }
  for (const [d, def] of Object.entries(DIMENSIONS)) {
    for (const v of def.values) {
      run('MATCH (d:Dimension {name: $d}) MERGE (a:Attr {dim: $d, value: $v}) MERGE (a)-[:ABOUT]->(d)', { d, v });
    }
  }
  for (const it of ITEMS) {
    run(`MATCH (c:FoodCategory {name: $cat})
         MERGE (m:MenuItem {id: $id}) SET m.name = $name, m.fictional = true
         MERGE (p:Place {name: $place}) SET p.fictional = true
         MERGE (m)-[:IN_CATEGORY]->(c)
         MERGE (m)-[:SERVED_AT]->(p)`, { cat: it.cat, id: it.id, name: it.name, place: it.place });
    for (const [d, v] of Object.entries(it.claims)) {
      run('MATCH (m:MenuItem {id: $id}), (a:Attr {dim: $d, value: $v}) MERGE (m)-[:HAS]->(a)', { id: it.id, d, v });
    }
    if (it.evidence) {
      run(`MATCH (m:MenuItem {id: $id})
           MERGE (e:EvidenceSource {id: $eid}) SET e.kind = $kind, e.last_checked = $checked, e.note = $note, e.fictional = true
           MERGE (m)-[:VERIFIED_BY]->(e)`,
        { id: it.id, eid: 'ev-' + it.id, kind: it.evidence.kind, checked: it.evidence.checked, note: it.evidence.note });
    }
    if (it.fryer) {
      run(`MATCH (m:MenuItem {id: $id})
           MERGE (f:Fryer {id: $fid}) SET f.status = $status
           MERGE (m)-[:COOKED_IN]->(f)`, { id: it.id, fid: 'fryer-' + it.id, status: it.fryer });
    }
  }
  run('MERGE (m:Meta {id: "seed"}) SET m.version = $v', { v: SEED_VERSION });
  run('MERGE (:UserPreference {profile: "me"})');
}

// ---- preferences live in the graph too: (UserPreference)-[:WANTS]->(Attr)
export function getPrefs(run) {
  const r = run(`MATCH (p:UserPreference {profile: "me"})-[:WANTS]->(a:Attr)
                 RETURN a.dim AS dim, a.value AS value`);
  const out = {};
  for (const row of r.rows) out[row.dim] = row.value;
  return out;
}

// prefs: { dim: value | null }.  null/'' = no preference for that dimension.
export function setPrefs(run, prefs) {
  for (const [dim, value] of Object.entries(prefs)) {
    run(`MATCH (p:UserPreference {profile: "me"})-[w:WANTS]->(a:Attr {dim: $dim}) DELETE w`, { dim });
    if (value) {
      run(`MATCH (p:UserPreference {profile: "me"}), (a:Attr {dim: $dim, value: $value}) MERGE (p)-[:WANTS]->(a)`,
        { dim, value });
    }
  }
}

// The graph does the lookup: one row per (item, wanted dimension) with a claim status.
const CLAIMS_QUERY = `
MATCH (p:UserPreference {profile: "me"})-[:WANTS]->(w:Attr)-[:ABOUT]->(d:Dimension)
MATCH (c:FoodCategory)-[:ASKS]->(d)
MATCH (m:MenuItem)-[:IN_CATEGORY]->(c)
OPTIONAL MATCH (m)-[:HAS]->(a:Attr)-[:ABOUT]->(d)
RETURN m.id AS id, d.name AS dim, d.label AS dim_label, w.value AS wanted, a.value AS actual,
       CASE WHEN a IS NULL THEN 'unknown'
            WHEN a.value = w.value THEN 'match'
            ELSE 'mismatch' END AS claim`;

const ITEMS_QUERY = `
MATCH (m:MenuItem)-[:IN_CATEGORY]->(c:FoodCategory)
MATCH (m)-[:SERVED_AT]->(p:Place)
OPTIONAL MATCH (m)-[:VERIFIED_BY]->(e:EvidenceSource)
OPTIONAL MATCH (m)-[:COOKED_IN]->(f:Fryer)
RETURN m.id AS id, m.name AS name, c.name AS cat, p.name AS place,
       e.kind AS ev_kind, e.last_checked AS ev_checked, e.note AS ev_note, f.status AS fryer
ORDER BY name`;

// Roll claims up into one verdict. Unknown data can NEVER produce MATCH.
export function rollUp(claims, hasEvidence) {
  if (claims.length === 0) return 'NO_PREFERENCE';
  if (claims.some(c => c.claim === 'mismatch')) return 'MISMATCH';
  if (claims.some(c => c.claim === 'unknown') || !hasEvidence) return 'UNVERIFIED';
  return 'MATCH';
}

export function verdicts(run) {
  const items = run(ITEMS_QUERY).rows;
  const claimRows = run(CLAIMS_QUERY).rows;
  const byItem = new Map();
  for (const r of claimRows) {
    if (!byItem.has(r.id)) byItem.set(r.id, []);
    byItem.get(r.id).push({ dim: r.dim, dim_label: r.dim_label, wanted: r.wanted, actual: r.actual, claim: r.claim });
  }
  return items.map(it => {
    const claims = byItem.get(it.id) ?? [];
    return {
      id: it.id, name: it.name, cat: it.cat, place: it.place,
      evidence: it.ev_kind ? { kind: it.ev_kind, checked: it.ev_checked, note: it.ev_note } : null,
      fryer: it.fryer ?? 'unknown',
      claims,
      verdict: rollUp(claims, !!it.ev_kind),
    };
  });
}

export function counts(run) {
  const r = run('MATCH (n) RETURN labels(n)[0] AS label, count(n) AS c ORDER BY label');
  return Object.fromEntries(r.rows.map(x => [x.label, x.c]));
}
