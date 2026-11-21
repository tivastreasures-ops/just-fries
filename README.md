# Just Fries — a food compatibility graph

**Entry for the Relate by Neo4j Hackathon.** Restaurant search answers "who serves fries." People with sensory food restrictions need
"how is *this exact item* prepared, and how sure are we?" Just Fries answers that with a graph: every menu item's claims are linked to
evidence, and anything unknown stays **unknown**. It starts with fries and uses the same schema for burgers and drinks.

> All data is fictional demo data. This is not medical advice, not an allergy or food-safety guarantee, and not a diagnostic or food-expansion tool.
> "Safe" is a personal status only the user can set. Shared fryers / cross-contact must always be confirmed independently.

## How Relate is used (it is the engine, not decoration)
The whole app runs on [Relate](https://github.com/relatedb/relate) compiled to WebAssembly, **inside a browser Web Worker, persisted to the browser's private storage (OPFS)**. No server, no cloud.
- Graph: `FoodCategory -ASKS-> Dimension <-ABOUT- Attr`, `MenuItem -IN_CATEGORY-> FoodCategory`, `MenuItem -HAS-> Attr`,
  `MenuItem -SERVED_AT-> Place`, `MenuItem -VERIFIED_BY-> EvidenceSource`, `MenuItem -COOKED_IN-> Fryer`, `UserPreference -WANTS-> Attr`.
- Your preferences are edges in the graph. Changing a preference changes the traversal and the results.
- One Cypher query (`graph.js`, `CLAIMS_QUERY`) walks preference → wanted attribute → item and returns a per-claim status: `match` / `mismatch` / `unknown`.
  Items roll up to **Match** (all claims confirmed *and* evidence on file), **Mismatch** (a known claim conflicts) or **Unverified** (something unknown or no evidence).
  A test asserts that unknown data can never produce a Match.
- The "Why?" panel shows exactly which claims passed or failed, the evidence kind and last-checked date, and the cross-contact status.

## Run it
It is static files. It needs `http(s)` (not `file://`) because browser storage requires a secure context; `localhost` counts.
```
python3 -m http.server 8000      # then open http://localhost:8000
```
Any static host works (GitHub Pages, Apache). On Apache, `.htaccess` sets the `application/wasm` type.

## Tests
```
node tests/graph.test.mjs        # graph logic on in-memory Relate (Node 18+)
pip install playwright && python3 tests/browser-test.py   # end-to-end in headless Chrome incl. persistence across reloads
```
`browser-test.py` expects Chrome at `/usr/bin/google-chrome`; edit `executable_path` if yours differs.

## Known limits
- Browser storage is per-browser and per-site, and "clear site data" erases it. Use "Reset demo data" to rebuild.
- Only one tab can hold the saved data. A second tab runs in memory and says so.
- Tested in Chrome (Windows and headless Linux). Safari and Firefox are untested.
- The Relate engine is ~7 MB, so the first load takes a moment.

## Layout
`index.html`, `app.js` (UI) · `relate.worker.js` (the only place a database exists) · `graph.js` (seed, preference and verdict logic) ·
`seed-data.js` (fictional data) · `vendor/relate/` (pinned Relate WASM 1.2.0) · `assets/` (mascots) · `ASSETS.md` (AI-use and asset disclosure).

Licence: MIT. Relate is Apache-2.0.
