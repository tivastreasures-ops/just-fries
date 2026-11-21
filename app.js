import { CATEGORIES, DIMENSIONS, PRESETS, EVIDENCE_KINDS } from './seed-data.js';

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

let state = null, cat = 'fries';
const ART = { fries: 'assets/fries-mascot-720.png', burger: 'assets/burger-twins-720.png', drink: 'assets/cup-mascot-720.png' };
const ALT = { fries: '', burger: '', drink: '' };
const BADGE = {
  MATCH: ['match', '✓ Match'], MISMATCH: ['mismatch', '✕ Mismatch'],
  UNVERIFIED: ['unverified', '? Unverified'], NO_PREFERENCE: ['none', '– No preference set'],
};
const CLAIM_BADGE = { match: ['match', '✓ confirmed'], mismatch: ['mismatch', '✕ conflicts'], unknown: ['unverified', '? unknown'] };
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
  $('#presets').innerHTML = Object.keys(PRESETS[cat]).map(n => `<button type="button" class="preset" data-preset="${esc(n)}">${esc(n)}</button>`).join('');
}

function renderResults() {
  const items = state.items.filter(i => i.cat === cat);
  const label = CATEGORIES[cat].label.toLowerCase();
  const anyPref = CATEGORIES[cat].dims.some(d => state.prefs[d]);
  const c = v => items.filter(i => i.verdict === v).length;
  $('#summary').textContent = anyPref
    ? `${c('MATCH')} match · ${c('UNVERIFIED')} unverified · ${c('MISMATCH')} mismatch (of ${items.length} demo ${label}).`
    : `Set at least one preference above to check these ${items.length} demo ${label}.`;
  const order = anyPref ? ['MATCH', 'UNVERIFIED', 'MISMATCH'] : ['NO_PREFERENCE'];
  const titles = { MATCH: 'Confirmed matches', UNVERIFIED: 'Unverified — something is unknown', MISMATCH: 'Mismatches', NO_PREFERENCE: 'All items' };
  $('#results').innerHTML = order.map(v => {
    const g = items.filter(i => i.verdict === v); if (!g.length) return '';
    return `<div class="group">${titles[v]} (${g.length})</div>` + g.map(i => {
      const [cls, text] = BADGE[i.verdict];
      return `<article class="card ${cls}"><div><h3>${esc(i.name)}</h3><small>${esc(i.place)} · fictional demo${i.cat !== 'drink' && i.fryer !== 'dedicated' ? ` · <strong>⚠ fryer ${i.fryer === 'shared' ? 'shared' : 'unknown'}: confirm yourself</strong>` : ''}</small></div>
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
    const [bc, bt] = CLAIM_BADGE[c.claim];
    return `<tr><td>${esc(c.dim_label)}</td><td>${esc(c.wanted)}</td><td>${c.actual ? esc(c.actual) : '<em>not stated</em>'}</td><td><span class="b ${bc}">${bt}</span></td></tr>`;
  }).join('') : '<tr><td colspan="4"><em>No preferences set for this food type.</em></td></tr>';
  const ev = it.evidence
    ? `<p><strong>Evidence:</strong> ${esc(EVIDENCE_KINDS[it.evidence.kind] ?? it.evidence.kind)}<br>Last checked: ${esc(it.evidence.checked)}<br>${esc(it.evidence.note)}</p>`
    : '<p><strong>Evidence:</strong> <em>none on file</em>, so this can never be a confirmed match.</p>';
  const fryer = it.cat !== 'drink'
    ? (it.fryer === 'dedicated'
      ? '<p><strong>Fryer / cross-contact:</strong> demo data says dedicated. Still confirm with the restaurant yourself.</p>'
      : `<div class="warn"><strong>Cross-contact: ${it.fryer === 'shared' ? 'shared fryer reported' : 'unknown'}.</strong> This must be independently confirmed with the restaurant. We do not infer it.</div>`)
    : '';
  $('#why-body').innerHTML = `<h2 id="why-title">${esc(it.name)}</h2>
    <p><span class="b ${cls}">${text}</span> · ${esc(it.place)} <em>(fictional demo)</em></p>
    <table><thead><tr><th>Question</th><th>You want</th><th>Item says</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    ${ev}${fryer}
    <p class="hint">Decided by walking the graph: UserPreference → WANTS → Attr ← HAS ← MenuItem, then checking its EvidenceSource and Fryer.</p>`;
  $('#why').showModal();
}

async function savePrefs(prefs) { state = await call('setPrefs', { prefs }); renderForm(); renderResults(); }

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
    const p = { ...Object.fromEntries(CATEGORIES[cat].dims.map(d => [d, ''])), ...PRESETS[cat][t.dataset.preset] };
    await savePrefs(p);
  } else if (t.id === 'clear') {
    await savePrefs(Object.fromEntries(CATEGORIES[cat].dims.map(d => [d, ''])));
  } else if (t.dataset.why) {
    showWhy(t.dataset.why);
  } else if (t.id === 'reset') {
    if (confirm('Reset all demo data and your preferences?')) { state = await call('reset'); renderForm(); renderResults(); }
  }
});

try {
  const info = await call('init');
  state = await call('state');
  window.__justFries = { call, info };          // handle for the automated browser test
  renderForm(); renderResults();
  document.body.dataset.ready = '1';
} catch (e) {
  $('#summary').textContent = 'Could not start: ' + e.message;
}
