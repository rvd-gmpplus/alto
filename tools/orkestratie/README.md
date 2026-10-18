# Hulpscripts voor de orkestratie

Scripts die de bouwsessie naast de vaste testset gebruikte: screenshots maken, eindcijfers verzamelen, ruimte in de auto bezetten en takken controleren vóór het samenvoegen. Ze staan los van de testset in `tools/` en worden niet door `build.py` gebruikt. Elk script dat de pagina laadt, gebruikt `tools/harness.py` (Chromium met software-rendering) en bouwt eerst een testversie uit `src/`.

| Script | Gebruik | Wat het doet |
|---|---|---|
| `finaltests.sh` | `tools/orkestratie/finaltests.sh UITVOERMAP` | Draait de hele testset (lint, smoke, integrity, silhouette, ui_inner met --open --strict, opentest met --strikt-min, itest met poorten, tri met --gate, pubsmoke, stats, presetshots, visdiff, ankercontrole) in twee parallelle reeksen en de extra tests uit `auto.json: extraTests` in een derde, zet de uitvoer per test in de map met de duur, en geeft exitcode 1 zodra een test faalt. |
| `gallery.py` | `python3 tools/orkestratie/gallery.py REPO UITVOERMAP [set]` | Vaste screenshotset. De sets zijn alles (standaard), exterieur, overzicht, motor, aandrijving, onderstel, interieur, systemen en mobiel. Autobestand: de weergaven noemen knopen van deze auto. Exitcode 1 als een beeld mislukt. |
| `presetshots.py` | `python3 tools/orkestratie/presetshots.py REPO UITVOERMAP` | Een screenshot van elke preset, zonder de rondleiding. |
| `docshots.py` | `python3 tools/orkestratie/docshots.py REPO UITVOERMAP` | De screenshots voor `docs/screenshots`: de lijst `docshots` uit `auto.json` op 1280 x 800 en `mobiel.png` op 390 x 844. Het veld `docshots` ontbreekt nog in `auto.json` van deze auto; zonder dat veld stopt het script. |
| `cijfers.py` | `python3 tools/orkestratie/cijfers.py UIT/stats.json [UIT/tri.json] > docs/cijfers.md` | Kerncijfers als één bron voor de documentatie (boom, driehoeken per hoofdgroep met budget, tekenopdrachten, opstarttijdlijn). |
| `stats.py` | `python3 tools/orkestratie/stats.py REPO UITVOER.json` | Eindcijfers: boom, driehoeken per hoofdgroep, presets, tekenopdrachten met en zonder bundelen, opstarttijdlijn. |
| `pickview.py` | `python3 tools/orkestratie/pickview.py REPO VIEWNAAM x,y [x,y ...]` | Laat zien welk onderdeel op een schermpunt van een galerijweergave staat. |
| `zone.py` | `python3 tools/orkestratie/zone.py REPO '{"naam":{"lo":[x,y,z],"hi":[x,y,z]}}' [motor\|auto]` | Toont welke meshes een kader snijden, in het motorframe of het autoframe, met de hoogte van de carrosserie erboven. |
| `build_pn.py` | `python3 tools/orkestratie/build_pn.py [--check] [--out MAP]` | Bouwt `src/partnumbers.js` en `docs/onderdeelnummers.csv` uit `data/pn/` (canoniek, zie `data/pn/README.md`) met controles op paden, eenheden, keuzes en bronnen; `--check` vergelijkt byte voor byte. |
| `mergecheck.py` | `python3 tools/orkestratie/mergecheck.py DOMEIN COMMIT [BASIS]` | Eigendomscontrole van een tak: raakt die alleen bestanden van het eigen domein? Exitcode 1 bij een overtreding. |
| `pick.py` | `PICK_PNG=uit.png python3 tools/orkestratie/pick.py 'JS-voorbereiding' x,y [x,y ...]` | Zet de modus Openen aan, draait de voorbereiding (bijvoorbeeld een opener openen), maakt een opname en noemt per schermpunt het pad van het onderdeel dat er ligt. |
| `shots.py` | `python3 tools/orkestratie/shots.py UITMAP naam 'JS' [naam2 'JS2' ...]` | Gerichte opnames in de modus Openen; elke JS draait na een verse Alles dicht. |
| `probe.py` | `python3 tools/orkestratie/probe.py 'JS-expressie'` | Draait een expressie op de pagina en drukt het resultaat als JSON af; `window.__box(naam)` geeft het wereldkader van een knoop. |
| `phone.py` | `python3 tools/orkestratie/phone.py UITMAP` | Twee telefoonbeelden (390 x 844): start en modus Openen, plus de scrollbreedte. |
| `gateshots.py` | `python3 tools/orkestratie/gateshots.py UITMAP` | De vaste beelden van de modus Openen: elke opener via zijn knop in de openerlijst, drie overzichten met alles open en telefoonbeelden van Motorkap, Portier links en Achterklep, met `index.json`. Exitcode 1 als een telefoonopener ontbreekt. |
| `dumptree.py` | `python3 tools/orkestratie/dumptree.py UIT.json` | De hele boom als JSON. |
| `clash.py` | `python3 tools/orkestratie/clash.py KNOOP [KNOOP...] [--tegen KNOOP...] [--straal MM] [--toegestaan BESTAND.json] [--json UIT.json]` | Doordringing en kleinste afstand van knopen tegen de rest van het model, ook binnen een hoofdgroep. Exitcode 1 bij een niet-toegestane doordringing. |
| `huid.py` | `python3 tools/orkestratie/huid.py --bewaar UIT.json KNOOP [...]` en `--vergelijk UIT.json [--grens MM]` | Bewaart de buitenhuid van knopen en meet later hoeveel die verschoven is. |
| `meetlib.js` | (geladen door `clash.py` en `huid.py`) | De meetfuncties in de pagina (`window.__meet`); kent geen onderdeelnamen. |

De scripts zonder REPO-argument gebruiken de checkout waarin ze staan, dus vanuit een worktree de bron van die worktree.

`pickview.py` leest de weergaven uit `gallery.py` en moet daarom in dezelfde map blijven staan.

Een eigen `THREE.Raycaster` in een hulpscript moet `layers.enableAll()` aanzetten. Met gebundeld tekenen staan de losse meshes van gesloten groepen op laag 1, en zonder die regel ziet de raycaster ze niet. `zone.py` doet dat al.

Niet in deze repo: `poort.js` (de visuele poort met beoordelaars als Workflow-script) en `rays_bagage.py` (stralen in de bagageruimte) uit laguna3. Beide noemen onderdelen en kenmerken van de Laguna en staan in `framework.json` onder auto; een Alto-versie is nog niet geschreven.
