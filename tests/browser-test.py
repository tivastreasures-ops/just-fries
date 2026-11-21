"""Headless-Chrome end-to-end test. Usage: python3 tests/browser-test.py   (serves the repo on localhost itself)"""
import http.server, threading, os, sys, json, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.wasm': 'application/wasm', '.js': 'text/javascript'}
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_port}/index.html'
ok = True
def check(name, cond, extra=''):
    global ok; ok &= bool(cond); print(('PASS ' if cond else 'FAIL ') + name, extra)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_selector('body[data-ready="1"]', timeout=60000); pg.click('button[data-ds="demo"]'); pg.wait_for_timeout(300)
    check('app starts, OPFS storage used', pg.evaluate('window.__justFries.info.storage') == 'opfs')
    check('first load seeds graph', pg.evaluate('window.__justFries.info.wasSeeded') is False)
    pg.click('button[data-preset="Just fries, I said plain"]')
    pg.wait_for_selector('.card.match')
    m = pg.locator('.card.match h3').all_inner_texts(); u = pg.locator('.card.unverified h3').all_inner_texts(); x = pg.locator('.card.mismatch h3').all_inner_texts()
    check('plain-fries question shows confirmed matches', 'Plain Jane Shoestrings' in m and 'Thin & Crispy' not in m, m)
    check('unknowns are flagged unverified', 'Back-of-Menu Fries' in u, u)
    check('hard mismatches shown', 'Waffle Wonders' in x)
    pg.click('button[data-why="f09"]'); pg.wait_for_selector('dialog[open]')
    check('Why? opens on the request-only item', 'only if you ask' in pg.inner_text('#why-body'))
    pg.keyboard.press('Escape')
    pg.click('button[data-why="f05"]'); pg.wait_for_selector('dialog[open]')
    txt = pg.inner_text('#why-body')
    check('why panel shows evidence + status', 'Evidence' in txt and ('conflicts' in txt or 'unknown' in txt), txt[:120].replace('\n', ' '))
    pg.keyboard.press('Escape')
    pg.click('button[data-why="f02"]'); pg.wait_for_selector('dialog[open]')
    check('shared fryer shows cross-contact warning', 'shared fryer reported' in pg.inner_text('#why-body')); pg.keyboard.press('Escape')
    pg.select_option('select[data-dim="seasoning"]', 'spiced'); pg.wait_for_timeout(300)
    check('preference change alters results', 'Plain Jane Shoestrings' in pg.locator('.card.mismatch h3').all_inner_texts())
    pg.click('button[data-cat="burger"]'); pg.click('button[data-preset="Only ketchup"]'); pg.wait_for_selector('.card.match')
    check('second item type works', 'Ketchup-Only Cheeseburger' in pg.locator('.card.match h3').all_inner_texts())
    pg.click('button[data-cat="drink"]'); pg.click('button[data-preset="No ice"]'); pg.wait_for_selector('.card.match')
    check('third item type works', 'Cola, No Ice' in pg.locator('.card.match h3').all_inner_texts())
    pg.screenshot(path='/tmp/jf-drinks.png', full_page=True)
    # persistence: reload page -> preferences and data survive
    pg.reload(); pg.wait_for_selector('body[data-ready="1"]', timeout=60000); pg.click('button[data-ds="demo"]'); pg.wait_for_timeout(300)
    check('after reload: data already seeded (persisted)', pg.evaluate('window.__justFries.info.wasSeeded') is True)
    pg.click('button[data-cat="burger"]')
    check('after reload: burger preference persisted', pg.input_value('select[data-dim="sauce"]') == 'ketchup only')
    counts = pg.evaluate('window.__justFries.call("counts")'); 
    check('no duplicate items after reload', counts.get('MenuItem') == 25, counts)
    # new page in same context (like a new tab / closed and reopened tab)
    pg2 = ctx.new_page(); pg2.goto(URL); pg2.wait_for_selector('body[data-ready="1"]', timeout=60000); pg2.click('button[data-ds="demo"]'); pg2.wait_for_timeout(300)
    check('second tab falls back to in-memory (works, but says it is not saved)', pg2.evaluate('window.__justFries.info.storage') == 'memory' and 'NOT be saved' in pg2.inner_text('#storage'))
    pg2.click('button[data-preset="Just fries, I said plain"]'); pg2.wait_for_selector('.card.match')
    check('second tab is still usable', pg2.locator('.card.match').count() >= 1)
    pg2.close(); pg.close()
    pg3 = ctx.new_page(); pg3.goto(URL); pg3.wait_for_selector('body[data-ready="1"]', timeout=60000)
    check('after closing tabs: editable again and persisted', pg3.evaluate('window.__justFries.info.storage') == 'opfs' and pg3.evaluate('window.__justFries.info.wasSeeded') is True)
    errs and None
    check('no console/page errors', not errs, errs[:3])
    b.close()
print('ALL PASS' if ok else 'SOME FAILED'); sys.exit(0 if ok else 1)
