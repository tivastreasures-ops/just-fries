import { CATEGORIES, DIMENSIONS, PRESETS, PRESETS_REAL, EVIDENCE_KINDS } from './seed-data.js';

const $ = s => document.querySelector(s);
const worker = new Worker(new URL('./relate.worker.js', import.meta.url), { type: 'module' });
let nextId = 1; const pending = new Map();
worker.onmessage = ({ data }) => {
  if (data.type === 'notice') { $('#storage').textContent = data.text; return; }
  const p = pending.get(data.id); pending.delete(data.id);
  data.ok ? p.resolve(data.result) : p.reject(new Error(data.error));
};
worker.onerror = e => { $('#summary').textContent = 'The graph engine failed to start: ' + (e.message || 'unknown error'); };
const call = (op, payload) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); worker.postMessage({ id, op, payload }); });

let state = null, cat = 'fries', ds = 'real';
const presets = () => (ds === 'real' ? PRESETS_REAL : PRESETS)[cat] ?? {};
const tag = i => i.ds === 'real' ? 'real data' : 'fictional demo';
const ART = { fries: 'assets/fries-mascot-720.png', burger: 'assets/burger-twins-720.png', drink: 'assets/cup-mascot-720.png' };
const ALT = { fries: '', burger: '', drink: '' };
const BADGE = {
  MATCH: ['match', '✓ Match'], MISMATCH: ['mismatch', '✕ Mismatch'], REQUEST: ['unverified', '☝ Only if you ask'],
  UNVERIFIED: ['unverified', '? Unverified'], NO_PREFERENCE: ['none', '– No preference set'],
};
const CLAIM_BADGE = { match: ['match', '✓ confirmed'], mismatch: ['mismatch', '✕ conflicts'], unknown: ['unverified', '? unknown'], request: ['unverified', '☝ only if you ask'] };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderForm() {
  const dims = CATEGORIES[cat].dims;
  $('#cat-name').textContent = CATEGORIES[cat].label.toLowerCase();
  $('#cat-art').src = ART[cat]; $('#cat-art').alt = ALT[cat];
  $('#prefs-form').innerHTML = dims.map(d => `
    <label>${esc(DIMENSIONS[d].label)}
      <select data-dim="${d}"><option value="">No preference</option>
        ${DIMENSIONS[d].values.map(v => `<option value="${esc(v)}" ${state.prefs[d] === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}
      </select></label>`).join('');
  $('#presets').innerHTML = Object.keys(presets()).map(n => `<button type="button" class="preset" data-preset="${esc(n)}">${esc(n)}</button>`).join('');
}

function renderResults() {
  const items = state.items.filter(i => i.cat === cat);
  const label = CATEGORIES[cat].label.toLowerCase();
  const anyPref = CATEGORIES[cat].dims.some(d => state.prefs[d]);
  const c = v => items.filter(i => i.verdict === v).length;
  $('#summary').textContent = anyPref
    ? `${c('MATCH')} match · ${c('UNVERIFIED')} unverified · ${c('REQUEST') ? c('REQUEST') + ' only if you ask · ' : ''}${c('MISMATCH')} mismatch (of ${items.length} ${ds === 'real' ? 'real' : 'demo'} ${label}).`
    : `Set at least one preference above to check these ${items.length} ${ds === 'real' ? 'real' : 'demo'} ${label}.`;
  const order = anyPref ? ['MATCH', 'REQUEST', 'UNVERIFIED', 'MISMATCH'] : ['NO_PREFERENCE'];
  const titles = { MATCH: 'Confirmed matches', REQUEST: 'Possible only by asking (not the default)', UNVERIFIED: 'Unverified — something is unknown', MISMATCH: 'Mismatches', NO_PREFERENCE: 'All items' };
  $('#results').innerHTML = order.map(v => {
    const g = items.filter(i => i.verdict === v); if (!g.length) return '';
    return `<div class="group">${titles[v]} (${g.length})</div>` + g.map(i => {
      const [cls, text] = BADGE[i.verdict];
      return `<article class="card ${cls}"><div><h3>${esc(i.name)}</h3><small>${esc(i.place)} · ${tag(i)}${i.cat !== 'drink' && i.fryer !== 'dedicated' ? ` · <strong>⚠ fryer ${i.fryer === 'shared' ? 'shared' : 'unknown'}: confirm yourself</strong>` : ''}</small></div>
        <div class="row" style="margin:0"><span class="b ${cls}">${text}</span>
        <button class="why-btn" data-why="${i.id}">Why?</button></div></article>`;
    }).join('');
  }).join('');
  $('#storage').textContent = state.storage === 'opfs'
    ? 'Your preferences are stored only in this browser (private browser storage). Nothing is sent anywhere.'
    : 'Running in memory: your changes will NOT be saved. This happens if the app is already open in another tab, inside an embedded preview, or in a private window. Open it on its own in one tab to use saved storage.';
}

function showWhy(id) {
  const it = state.items.find(i => i.id === id);
  const [cls, text] = BADGE[it.verdict];
  const rows = it.claims.length ? it.claims.map(c => {
    const [bc, bt] = CLAIM_BADGE[c.claim] ?? (console.warn('unknown claim type', c.claim), ['unverified', '? unknown']);
    return `<tr><td>${esc(c.dim_label)}</td><td>${esc(c.wanted)}</td><td>${c.actual ? esc(c.actual) : '<em>not stated</em>'}</td><td><span class="b ${bc}">${bt}</span></td></tr>`;
  }).join('') : '<tr><td colspan="4"><em>No preferences set for this food type.</em></td></tr>';
  const ev = it.evidence
    ? `<p><strong>Evidence:</strong> ${esc(EVIDENCE_KINDS[it.evidence.kind] ?? it.evidence.kind)}<br>Last checked: ${esc(it.evidence.checked)}<br>${esc(it.evidence.note)}${it.evidence.url ? `<br><a href="${esc(it.evidence.url)}" target="_blank" rel="noopener">Source page</a>` : ''}<br><small>Recipes and kitchens vary by location and change. Confirm with your restaurant.</small></p>`
    : '<p><strong>Evidence:</strong> <em>none on file</em>, so this can never be a confirmed match.</p>';
  const fryer = it.cat !== 'drink'
    ? (it.fryer === 'dedicated'
      ? '<p><strong>Fryer / cross-contact:</strong> the data says dedicated. Still confirm with the restaurant yourself.</p>'
      : `<div class="warn"><strong>Cross-contact: ${it.fryer === 'shared' ? 'shared fryer reported' : 'unknown'}.</strong> This must be independently confirmed with the restaurant. We do not infer it.</div>`)
    : '';
  $('#why-body').innerHTML = `<h2 id="why-title">${esc(it.name)}</h2>
    <p><span class="b ${cls}">${text}</span> · ${esc(it.place)} <em>(${tag(it)})</em></p>
    <table><thead><tr><th>Question</th><th>You want</th><th>Item says</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    ${ev}${fryer}
    <p class="hint">Decided by walking the graph: UserPreference → WANTS → Attr ← HAS ← MenuItem, then checking its EvidenceSource and Fryer.</p>`;
  $('#why').showModal();
}

async function savePrefs(prefs) { state = await call('setPrefs', { prefs, ds }); renderForm(); renderResults(); }

function syncDs() {
  document.querySelectorAll('[data-ds]').forEach(b => b.setAttribute('aria-pressed', b.dataset.ds === ds));
  $('#ds-note').textContent = ds === 'real'
    ? 'Real data: only what each restaurant published, read on 2026-11-21, with a source link. Blank means they did not say, which shows as unknown, never safe.'
    : 'Demo data: fictional items for trying the app. Nothing here describes a real restaurant.';
}
document.addEventListener('change', e => {
  const d = e.target.dataset?.dim; if (d !== undefined) savePrefs({ [d]: e.target.value });
});
document.addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.cat) {
    cat = t.dataset.cat;
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b === t));
    renderForm(); renderResults();
  } else if (t.dataset.preset) {
    const p = { ...Object.fromEntries(CATEGORIES[cat].dims.map(d => [d, ''])), ...presets()[t.dataset.preset] };
    await savePrefs(p);
  } else if (t.id === 'clear') {
    await savePrefs(Object.fromEntries(CATEGORIES[cat].dims.map(d => [d, ''])));
  } else if (t.dataset.ds) {
    ds = t.dataset.ds; state = await call('state', { ds }); syncDs(); renderForm(); renderResults();
  } else if (t.dataset.why) {
    showWhy(t.dataset.why);
  } else if (t.id === 'reset') {
    if (confirm('Reset all demo data and your preferences?')) { state = await call('reset', { ds }); renderForm(); renderResults(); }
  }
});

try {
  const info = await call('init');
  state = await call('state', { ds });
  syncDs();
  window.__justFries = { call, info };          // handle for the automated browser test
  renderForm(); renderResults();
  document.body.dataset.ready = '1';
} catch (e) {
  $('#summary').textContent = 'Could not start: ' + e.message;
}
