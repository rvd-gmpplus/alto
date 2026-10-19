# alto: afspraken voor wie hier bouwt

Interactieve 3D-explosietekening van een Suzuki Alto 1.0-16V Twist (2001, 3-deurs, G10BB 993 cc, handgeschakelde
vijfbak, Bright Red 2) in three.js r147. Gebouwd op het framework van laguna3; de bron-commit staat in `FRAMEWORK`. Alle
geometrie staat in code; `build.py` plakt `src/head.html` en `src/*.js` (volgorde `ORDER`) tot één `index.html` en vult
de velden uit `auto.json` in. Nederlands is de taal van code-commentaar, beschrijvingen, docs en commits. Geen em-dashes
in tekst. Feiten over de auto: `docs/contract.md` en `docs/specificaties-en-bronnen.md`; tellingen: `docs/cijfers.md`.

## Bouwen en testen

- Omgeving: `tools/setup.sh` (Playwright uit `requirements.txt`, three.js 0.147.0 met hashcontrole). Lokaal op de Mac
  eerst `source ~/.config/web3d/env.sh`.
- Voor elke commit: `python3 build.py --lint`; bij een wijziging aan de generieke laag ook `python3 tools/framework.py check`.
  `python3 build.py` herbouwt `index.html`; dat doet alleen de orkestrator (zie Werkwijze).
- Volledige set: `tools/orkestratie/finaltests.sh UITMAP` (strikt, één exitcode, uitvoer en duur per test in UITMAP).
  - Vaste tests (regel `TESTS` in het script): lint, smoke, integ, sil, inner (`ui_inner.py --open --strict`), opentest
    (`opentest.py --strikt-min`), itest (met `ITEST_GATES=1`), tri (`--gate`), pub, stats, shots, visdiff, anchor.
  - Extra tests van deze auto uit `auto.json: extraTests`, als derde reeks: `meet` (voorkant, `tools/meet.py`),
    `zijstraal` (`tools/zijstraal.py`) en `meet-achter` (achterwielkasten, `tools/meet.py --achter`). Wat ze meten en hoe
    lang ze duren staat in het veld `uitleg` van elk item en in `docs/testen.md`. Los draaien:
    `python3 tools/framework.py extra NAAM UITMAP`.
- macOS: de set draait direct op de Mac; `meet` en `meet-achter` gebruiken daar de GPU (ANGLE Metal). De basislijn
  `docs/baseline` komt van Linux, dus op de Mac `VISDIFF_BASIS=B0MAP tools/orkestratie/finaltests.sh UITMAP` met een
  eigen basis B0 van dezelfde machine en een groene startstand (`docs/testen.md`, alinea over `VISDIFF_BASIS`). Op de
  Mac is visdiff informatief.
- Linux: `~/alto-linux/run-fonts.sh REPO REF 'bash tools/orkestratie/finaltests.sh /uit'`. Draait in de Apple
  container `explosie-test:1` (tijdelijk, `--rm`) met standaard 8 cores en 10 GB (`ALTO_CPUS`, `ALTO_MEM`; de run wacht tot de load onder `ALTO_MAXLOAD` 15 ligt, zie `~/alto-linux/lib.sh`) op een `git archive`-kopie van REF (dus alleen gecommit werk), met
  de lettertypencache voor Linux; de uitvoer staat in `~/alto-linux/run-XXXX/uit`. Uitleg: `docs/testen.md`, sectie
  "Linux-container".
- Groen betekent: `finaltests.sh` geeft exitcode 0, dus elke vaste en extra test exit 0. Bij `meet` en `meet-achter`
  tellen alleen de harde poorten; een gele zachte poort is geen fout. CI (`.github/workflows/ci.yml` en `nightly.yml`)
  draait een deel van de set en vervangt de volledige set niet.
- Budgetten (driehoeken per hoofdgroep) staan in `tools/anchors.json`; `tools/tri.py --gate` bewaakt ze. De stand staat
  in `docs/cijfers.md`.
- Een melding van de gebruiker eerst narekenen met `tools/orkestratie/pick.py`, `pickview.py`, `probe.py`,
  `tools/rays.py` of `tools/orkestratie/clash.py`; dan pas wijzigen. Hulpscripts: `tools/orkestratie/README.md`.

## Klaar

- Volledige set groen op macOS en op Linux (container).
- Visuele poort (visdiff) groen op Linux. Een groene macOS-run is geen oordeel over visdiff.
- Open-stand-botsingsmeting (`opentest.py --strikt-min`, in de set) zonder nieuwe doordringingen; uitzonderingen alleen
  via `tools/open_allow.json`, door de orkestrator.
- Advisor-oordeel pass.
- Hoogstens 6 reparatierondes per golf; daarna een beslisnotitie aan de gebruiker in plaats van nog een ronde.

## Bekende ruis

- macOS: GPU-prestatiehints van ANGLE in de console, zoals `GPU stall due to ReadPixels`. Melden, niet blokkeren.
- opentest: de meldingen `open.min ontbreekt (volger)`, letterlijk `melding: Zijruit: Rubber zijruit: open.min ontbreekt (volger)`,
  `melding: Zijruit: Ruitdrager: open.min ontbreekt (volger)` (beide portieren) en
  `melding: Motorkap: Motorkapsteun: open.min ontbreekt (volger)`. Een volger zonder eigen ondergrens is ook met
  `--strikt-min` een melding en geen fout.
- Herkadrering G1 in `src/app2.js` (`uiRefitSoon`, de camera past opnieuw in als de dock van hoogte verandert): af en toe
  kadreert een hele `presetshots`-reeks kleiner. Een basislijn voor visdiff komt daarom uit minstens drie reeksen die
  onderling binnen de drempel van visdiff liggen (reproduceerbaarheidscontrole), en een rode visdiff over veel beelden
  tegelijk wordt eerst met een nieuwe reeks herhaald.
- `python3 tools/pncheck.py` faalt met `FileNotFoundError: ... data/pn/meta.json` en `pncheck: FOUT` zolang `data/pn/`
  ontbreekt (onderdeelnummers zijn nog niet opgenomen). Dat geldt ook voor de stap pncheck in CI; `finaltests.sh` draait
  pncheck niet.
- Geen ruis: netwerkfouten bij Google Fonts (`ERR_NETWORK_CHANGED`, `ERR_SOCKET_NOT_CONNECTED`). De harness haalt de
  lettertypen uit `~/.cache/explosietekening/fonts`; zie je ze toch, dan is de cache leeg of ontbreekt hij (Linux:
  `run-fonts.sh`). Melden.

## Eigendom en contracten

- Eén bestand per domein: carrosserie (`body.js`, `bodyparts.js`; `panorama.js` blijft leeg, de Alto heeft geen glazen
  dak), motor (`engine1-3.js`), aandrijving (`drivetrain.js`), onderstel (`chassis.js`), interieur (`interior.js`),
  systemen (`systems.js`), app (`core.js`, `app1.js`, `presetdata.js`, `presets.js`, `app2.js`, `head.html`).
  Voorvoegsels per eigenaar voor functies, materialen en cachesleutels (`docs/contract.md`, paragraaf 7).
- Alleen-lezen voor domeineigenaars: `core.js`, `body.js`, `tools/anchors.json`, `tools/open_allow.json`, de
  testscripts, `IGNORE` in `tools/harness.py`. Wijzigen gaat via de orkestrator, met een melding aan de eigenaren.
- Knopen: `A(naam, opties, kinderen)` en `P(naam, geometrie, materiaal, opties)` met verplicht `d` (Nederlandse
  beschrijving), `spec` alleen voor geverifieerde feiten in Nederlandse notatie, `ex` als uitklapvector, `inner` alleen
  voor wat van buiten nooit te zien is, `hideWhen` voor wat uitgenomen is zolang een opener open staat. Openers hebben
  altijd `open.min` van minstens 0,8 maal de volle hoek of slag.
- `src/partnumbers.js` en `docs/onderdeelnummers.csv` komen uit `data/pn/` via `tools/orkestratie/build_pn.py`; niet met
  de hand. `python3 tools/pncheck.py` bewaakt dat.
- Het chassisnummer en het kenteken van de gebruiker komen nooit in de repo, de pagina of een commitbericht.
- Nummers in de docs: één bron (`docs/cijfers.md`, gemaakt door `tools/orkestratie/cijfers.py`); elders ernaar
  verwijzen in plaats van getallen herhalen.

## Werkwijze

- Golven per domein, elk in een eigen worktree onder `~/alto-wt/` met een eigen tak. `tools/orkestratie/mergecheck.py
  DOMEIN COMMIT` vóór samenvoegen; na samenvoegen de volledige set op macOS en Linux.
- Agents committen geen `index.html` en pushen niet. De orkestrator herbouwt `index.html` na de groene set en pusht.
- Alleen de orkestrator vernieuwt de basislijn (`docs/baseline/`), op Linux en in een eigen commit (zie Bekende ruis
  voor de drie reeksen).
- Publicatie: GitHub Pages vanaf `main` (https://rvd-gmpplus.github.io/alto/). Na publiceren de URL teruglezen en byte
  voor byte vergelijken met `index.html` (een volledig document).
- `VERSION` is het versienummer van de volgende publicatie; `build.py` zet nummer plus inhoudshash in de pagina.
  Wijzigingen per versie in `CHANGELOG.md`.
- Begin elke sessie met `git ls-remote --heads origin` en een vergelijking van elke tak met `main`.
- Framework: generieke bestanden (`framework.json`: generiek) bevatten geen autonaam (`auto.json: verboden`); wat per auto
  verschilt, staat in `auto.json` en de autobestanden. `python3 tools/framework.py check` voor elke commit aan de
  generieke laag. Een generieke verbetering ontstaat in laguna3 en komt met `framework.py export` hierheen; een
  generiek bestand dat hier toch wijzigt, gaat ook naar laguna3, anders draait de volgende export het terug.
  Uitleg: `docs/framework.md`.
- Volledige uitleg: `docs/framework.md`, `docs/contract.md`, `docs/ontwerp-en-architectuur.md`, `docs/testen.md`,
  `docs/onderzoek/beslissingen.md`.
