"""Screenshots voor de visuele poort van de modus Openen (vaste camera's van de orkestrator).
Gebruik: python3 gateshots.py UITVOERMAP

Autobestand (framework.json: auto). Overgenomen uit laguna3 en zonder knoopnamen gemaakt: de openers komen uit de
openerlijst van de pagina. Per opener: open via de knop in de openerlijst (camera zoals na een klik), dan een opname.
Daarnaast drie overzichten met alles open en telefoonbeelden van de openers in TELEFOON (een label dat de pagina niet
heeft, wordt overgeslagen en in index.json gemeld). Het panoramadak van laguna3 (beelden 90 tot 93) valt weg.
Exitcode 0 als elke opname gelukt is, 1 als er een mislukte.
"""
import sys, os, json, re
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))  # tools/ van deze checkout
from harness import session

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
JS_CHIPS = '() => [...document.querySelectorAll("#openList button")].map(b => b.textContent)'
TELEFOON = ('Motorkap', 'Portier links', 'Achterklep')


def slug(label):
    return re.sub(r'\s+', '-', label.strip().lower())


def settle(pg, ms=900):
    pg.evaluate('() => window.__model.finishAll()')
    pg.wait_for_timeout(ms)


with session() as s:
    pg = s.page(1280, 800)
    pg.wait_for_function('window.__model && window.__model.ready', timeout=180000)
    pg.evaluate('() => window.__model.setOpenMode(true)')
    settle(pg)
    pg.screenshot(path=f'{out}/00-openen-dicht.png')
    chips = pg.evaluate(JS_CHIPS)
    names = pg.evaluate('() => window.__model.openers().map(o => o.name)')
    log = []
    for i, label in enumerate(chips):
        pg.evaluate('() => window.__model.openAll(0, true)')
        settle(pg, 300)
        pg.evaluate(f'() => document.querySelectorAll("#openList button")[{i}].click()')
        pg.wait_for_timeout(200)
        settle(pg, 1200)
        fn = f'{out}/{i + 1:02d}-{slug(label)}.png'
        pg.screenshot(path=fn)
        log.append({'nr': i + 1, 'label': label, 'opener': names[i] if i < len(names) else '', 'file': fn,
                    'open': pg.evaluate('() => window.__model.openers().filter(o => o.open > 0).map(o => o.name)')})
    # overzichten met alles open
    pg.evaluate('() => window.__model.openAll(1, true)')
    settle(pg, 300)
    for tag, d in (('linksvoor', [1, 0.55, 1.1]), ('rechtsachter', [-1, 0.6, -1.1]), ('boven', [0.2, 1.6, 0.25])):
        pg.evaluate(f'() => {{ const L = window.__model; L.focusNodes([L.ROOT], new THREE.Vector3({d[0]}, {d[1]}, {d[2]}).normalize(), 1.04); }}')
        settle(pg, 900)
        pg.screenshot(path=f'{out}/80-alles-open-{tag}.png')
    # telefoon
    ph = s.page(390, 844, touch=True, scale=2)
    ph.wait_for_function('window.__model && window.__model.ready', timeout=180000)
    ph.evaluate('() => window.__model.setOpenMode(true)')
    settle(ph)
    tel_chips = ph.evaluate(JS_CHIPS)
    telefoon = []
    for i, label in enumerate(tel_chips):
        if label not in TELEFOON:
            continue
        ph.evaluate('() => window.__model.openAll(0, true)')
        settle(ph, 300)
        ph.evaluate(f'() => document.querySelectorAll("#openList button")[{i}].click()')
        ph.wait_for_timeout(200)
        settle(ph, 1200)
        fn = f'{out}/95-telefoon-{slug(label)}.png'
        ph.screenshot(path=fn)
        telefoon.append(fn)
    ontbreekt = [t for t in TELEFOON if t not in tel_chips]
    json.dump({'chips': chips, 'log': log, 'telefoon': telefoon, 'telefoon_ontbreekt': ontbreekt},
              open(f'{out}/index.json', 'w'), ensure_ascii=False, indent=1)
    print(len(log), 'openers;', len(telefoon), 'telefoonbeelden;', 'ontbreekt:', ontbreekt or 'niets')
    s.report()
sys.exit(1 if not log or ontbreekt else 0)
