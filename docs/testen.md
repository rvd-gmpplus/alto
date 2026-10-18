# Testen

Alle tests draaien in headless Chromium via Playwright (Python), met WebGL via SwiftShader (software-rendering). Elk script bouwt `src/` naar een tijdelijke testmap, start een kleine lokale webserver op die map en opent de pagina op 1280 × 800 (muis) en, waar nodig, op 390 × 844 (touch, schaal 2). Elk script geeft exitcode 0 bij slagen en 1 bij een fout.

## Voorbereiding

```bash
tools/setup.sh                 # Playwright uit requirements.txt, three.js 0.147.0 in de cache (met hashcontrole), Chromium
python3 tools/smoke.py
```

`tools/harness.py` regelt de rest: hij bouwt de testmap met een symlink `three/` naar het npm-pakket en start Chromium. Het ophalen van three.js vraagt `npm` en een netwerkverbinding; het pakket wordt vergeleken met de npm-integriteit (`THREE_INTEGRITY` in de harness) en een bestandsvergrendeling voorkomt dat twee reeksen tegelijk `npm pack` draaien. De versie staat op één plek: `THREE_VERSION` in `build.py`. Een SessionStart-hook (`.claude/hooks/session-start.sh`) draait `tools/setup.sh` in een Claude Code-sessie in de cloud. Instellingen:

| Omgevingsvariabele | Werking |
|---|---|
| `THREE_DIR` | Map met het uitgepakte npm-pakket `three@0.147.0` (de map `package`). Standaard `~/.cache/explosietekening/three-0.147.0/package`; ontbreekt die, dan draait het script `npm pack three@0.147.0` en pakt het uit. |
| `CHROMIUM` | Pad naar een Chromium-binary. Standaard `/opt/pw-browsers/chromium` als die bestaat, anders de Chromium van Playwright (`playwright install chromium`). |
| `MODEL_TEST` | Een bestaande testmap hergebruiken in plaats van opnieuw te bouwen. Zonder deze variabele ruimt de harness zijn tijdelijke testmap bij het sluiten op. |
| `MODEL_TIMEOUT_MS` | Wachttijd op laden en `ready`, standaard 120000. Op een belaste machine of in CI hoger zetten. |
| `PUBSMOKE_READY_MS` | Grens voor `ready` in `pubsmoke.py`, standaard 20000 (de grens uit de premortem). |

Chromium start met `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. De harness zet `window.__MODEL_CACHECHECK = true`, zodat een botsing van cache-sleutels in `core.js` als consolefout verschijnt. Een script faalt bij elke console-fout of -waarschuwing (`harness.errors()` geeft beide), behalve de regels in `IGNORE` in `tools/harness.py`; die lijst is een contract met per regel een reden en datum, en alleen de orkestrator wijzigt hem.

`harness.page()` neemt een `query` (bijvoorbeeld `'?preset=engine'`) voor de deelbare stand en de debug-overlay. De pagina zet `window.__model` met hulpfuncties voor tests, waaronder `version` (het versiestempel), `finishAll()` om animaties direct af te ronden, `state()`, `preset(id)`, `checkPresets()`, `pickNodeAt(x, y)`, `hoverTarget(x, y)`, `setExplode(v)`, `labelRects()`, `freeView()`, `profileFrames(naam, aantal)`, `timing()` (de opstarttijdlijn in milliseconden sinds het begin van de navigatie), `batchFlush()` (alle wachtende batches direct bouwen) en `batchStats()`. Een eigen `THREE.Raycaster` in een testscript moet `ray.layers.enableAll()` aanzetten: gebundeld renderen zet de losse meshes van gesloten groepen op laag 1, en een raycaster die alleen laag 0 ziet, mist ze (`integrity.py`, `silhouette.py` en `ui_inner.py` doen dit). De oude functies blijven werken; nieuwe haken komen erbij.

De Google Fonts-verzoeken beantwoordt de harness zelf (`Session.page`): uit `~/.cache/explosietekening/fonts`, eenmaal met Python opgehaald; lukt ophalen niet, dan een leeg antwoord zonder consolefout. Zo hangt een test niet af van het netwerk en blijven de letters gelijk aan die van de echte pagina; een leeg antwoord alleen liet de tekst op een systeemletter terugvallen en gaf bij `visdiff` een afwijking over het hele beeld. `tools/itest.py` heeft dezelfde route in `fault_page` (`FONT_HOSTS` en `_font_route` uit de harness), want die context maakt zelf een pagina buiten `Session.page`. `pubsmoke.py` houdt de bereikbaarheid van de stylesheet met `curl` bij. De cache is per platform: de Google Fonts-stylesheet verschilt per user-agent (op Linux 9.700 bytes, op macOS 9.828 bytes, andere woff2-bestanden), dus de Linux-container heeft een eigen cache (zie de sectie Linux-container).

Het gebruikte bestand is de testversie (`python3 build.py --test-only MAP`): die laadt three.js lokaal. De gepubliceerde `index.html` laadt het van jsDelivr en wordt door `pubsmoke.py` apart getoetst.

## CI op GitHub

`.github/workflows/ci.yml` draait bij elke push en PR de snelle set (lint, `index.html` hoort bij `src/`, smoke, integrity, silhouette, `tri.py --gate`, de testlijst van `finaltests.sh`), richting 5 tot 10 minuten; `nightly.yml` draait elke nacht en op aanvraag de lange set (itest met poorten, `opentest --strikt-min`, `ui_inner --open --strict`, pubsmoke, stats en cijfers), met ruimere wachttijden (`MODEL_TIMEOUT_MS` 600 s, `PUBSMOKE_READY_MS` 60 s) en de uitvoer als artefact. Een rode push-job stopt het werk tot hij groen is; een rode nachtrun is een melding. SwiftShader op een gedeelde runner is trager dan de container; de eerste runs zijn een proef van de tijdgrenzen.

## Scripts

### `python3 build.py --lint`

Sinds golf 5c-1 gaat ook elk inline script in `src/head.html` (de foutafhandeling vóór de scripttags) apart door `node --check`.

Controleert zonder iets te schrijven: dubbele functienamen op het hoogste niveau over alle bestanden in `ORDER`, dubbele materiaalnamen in `std()` en `phys()`, en de syntaxis van het samengevoegde script met `node --check`. Een fout wordt teruggerekend naar bestand en regel. Exitcode 1 bij een fout, anders `lint ok`. Cache-sleutels met een voorvoegsel worden hier niet gecontroleerd en de lint is daarvoor niet uitgebreid; botsingen vangt de testmodus van `cache()`.

### `python3 tools/smoke.py`

Rooktest. Laadt de pagina op desktop en telefoonformaat en meldt het aantal knopen, groepen, onderdelen, de maximale diepte, het aantal meshes en driehoeken, daarna één render van de gemonteerde auto (tijd, tekenopdrachten, driehoeken, geometrieën) en één van de volledig uitgeklapte auto, en of de telefoon horizontaal scrollt. Exitcode 1 bij console- of paginafouten.

### `python3 tools/integrity.py`

Integriteit van de boom. Exitcode 1 bij een fout, een ankerfout, een presetfout of een consolefout; waarschuwingen worden alleen gemeld (`WARN=999` toont ze allemaal).

Fouten:

- een knoop zonder naam, een groep zonder kinderen, een onderdeel zonder geometrie, NaN in de geometrie, een ongeldige omhullende, een ongeldige uitklapvector;
- een onderdeel buiten de omhullende van de auto (|x| ≤ 1,15, y van −0,08 tot 1,62, |z| ≤ 2,48);
- carrosserie buiten ZR tot ZF (6 mm marge voor kentekenplaten); carrosserie breder dan 0,915 (zonder spiegels) of 1,035 (met spiegels); een niet-carrosserie-onderdeel breder dan 1,035. Dit zijn de nieuwe lengte- en breedtegrenzen uit audit C08;
- een onderdeel buiten de carrosserie dat boven de carrosserie uitsteekt, gemeten met een straal van boven op het hoogste punt (meer dan 4 mm);
- te weinig ruimte onder de motorkap, met twee regels: minder dan 2,5 cm tussen het hoogste punt van een onderdeel en de buitenhuid van de kap, en minder dan 0,5 cm tussen dat punt en de laagste laag van de motorkap (binnenframe of isolatiemat);
- een onderdeel dat zijdelings meer dan 2 mm door de huid steekt, onder de schouderlijn en boven de onderkant (uitzonderingen: banden, velgen, wielbouten, naafdoppen, ventielen, banden-spanningssensoren, balansgewichten, tankklep en -dop, uitlaateindstukken);
- ankers: elke naam uit `tools/anchors.json` komt precies één keer voor; de acht kinderen van de wortel staan in de afgesproken volgorde; `Onderstel` heeft precies de vier afgesproken kinderen; de `contains`-paren hangen goed; de `content`-regels halen hun minimum; de 26 openers (`openers`, als pad, want namen als Zijruit komen vier keer voor) en de 43 preset-id's (`preset_ids`) zijn precies die van de pagina, zodat een verdwenen of hernoemde opener of preset een fout is;
- presets (via `checkPresets()`): elke naam bestaat precies één keer, `open`, `deep`, `select` en `labels` liggen onder de `iso`-groep (bevatting), elke `labelOnly`-naam is een kind van de labelgroep, id's, sneltoetsen en categorieën kloppen en de rondleiding noemt bestaande presets.

Waarschuwingen: korte of ontbrekende beschrijving, groep met één onderdeel, dubbele naam binnen een groep, een dubbel onderdeel op dezelfde plek, een uitklapvector van nul.

### `python3 tools/silhouette.py`

Meet de gemonteerde carrosserie met stralen en vergelijkt met het gemeten fase 2-silhouet: de bovenlijn op 20 stations in het zijaanzicht, de halve breedte op 17 stations in het bovenaanzicht en de raamlijn op 9 stations. De tolerantie is 0,03 m tussen de assen en 0,05 m in de overhang. De toets slaagt als hoogstens 2 stations per reeks buiten de tolerantie vallen en de halve breedte bij z = +2,30 hoogstens 0,40 is en bij z = −2,30 hoogstens 0,55. Spiegels, antenne, wissers en grepen tellen niet mee. Exitcode 1 als de toets niet slaagt.

### `python3 tools/itest.py`

Interactietest op desktop (muis) en telefoon (touch). Per controle een regel `ok` of `FOUT`, onderaan een samenvatting. Exitcode 1 bij een mislukte controle.

| Nr | Controle |
|---|---|
| 1 | Klik of tik vanuit Gemonteerd op Motorkap, Portier linksvoor, Wiel linksvoor en Koplamp links beweegt niets buiten de eigen subboom (meer dan 1 mm) en opent die groep. Een dubbeltik met 250 ms tussenpoos kiest het onderdeel van de eerste tik. 40 willekeurige klikken (vaste seed) doen precies wat `hoverTarget` aankondigt. |
| 2 | Dubbelklik op het diepste aanklikbare onderdeel opent al zijn voorouders en selecteert het. Zoeken naar "klepspie" in de boom ook. |
| 3 | Inklappen met rechtsklik, Shift+klik en lang drukken (touch) sluit de diepste open groep met zijn deelboom. |
| 4 | Gemonteerd zet elke knoop terug op zijn basispositie (afwijking onder 1e-6 m). |
| 5 | Stap terug na uitklappen, inklappen, preset en schuif herstelt de vorige `state()`. |
| 6 | De explosieschuif op 0, 1 en 0,5 voor de werkgroep. |
| 7 | Elke preset: `checkPresets()` is leeg, het onderwerp ligt binnen het vrije beeld en beslaat minstens 12 % ervan. |
| 8 | Labels overlappen niet, niet over de bediening en niet buiten het canvas, in zes standen. |
| 9 | Elke preset is bereikbaar met categorie plus item; de sneltoetsen 0 tot 9 werken. |
| 10 | Geen console-fouten of -waarschuwingen; geen horizontale scroll op de telefoon; de donkere modus geeft de verwachte achtergrond. |
| 11 | Informatie: tekenopdrachten in Gemonteerd en `profileFrames('Motor F4Rt', 120)` (p50, p95, max). Met `ITEST_GATES=1` worden dit controles: tekenopdrachten hoogstens 1.500 en p95 hoogstens 8 ms. |
| 12 | `inner`: een ingesloten knop is onzichtbaar en niet aanklikbaar zolang de ouder dicht is, zichtbaar zodra die uitklapt, weer verborgen na inklappen en zichtbaar bij isoleren. 12b: een opgetild onderdeel zakt terug bij `setExplode(0)`. |
| 13 | Gebundeld renderen: minder tekenopdrachten in Gemonteerd (op de eindstand 1.726 zonder en 390 met bundelen, grens 1.500 met), aanwijzen van een onderdeel in een gebundelde groep, een klik selecteert dat onderdeel en laat zijn groep los tekenen, openen maakt direct los en na het dichtklappen is de groep weer samengevoegd. |
| 14 | Openmodus: in Openen opent een klik op de ruit, de spiegel, de greep of het paneel van een dicht portier het portier; een dubbeltik doet hetzelfde als een klik; de camera-eindstand ligt in het vrije beeld; Alles open en Alles dicht; stap terug na openen; de presets Openen; de wissel naar Uitklappen laat de openers staan, uitklappen met open motorkap en achterklep houdt gasveren en koordjes aan hun ankers (`strutErr`, tijdens, na uit- en na inklappen), en terug in Openen blijven ze open. |
| 15 | Onderdeelnummers: de echte gegevens hebben geen onbekend pad of onbekende eenheid; daarna, met alleen tijdelijke records, de statussen, het bewijs, de bronlinks (alleen https, nieuw tabblad), de VIN-waarschuwing, het blok Gekozen voor deze auto met markering van de gekozen nummers, deel van een eenheid, zoeken op nummer en `pnCheck`. |
| 16 | Telefoon staand (390 × 844): de presetcategorieën staan in één zijwaarts schuivende rij (hoogte hoogstens 60 px) en elke categorie is bereikbaar; het vrije beeld is minstens 55 procent van de schermhoogte; na een keuze past het kader van de gekozen opener boven kaart en dock, gemeten aan de echte hoogtes. |
| 17 | Deelbare stand: `?preset=id` laadt die preset, `?open=naam,pad` opent die openers in de modus Openen, de adresbalk volgt preset en openstand (`replaceState`); `?debug=1` toont de overlay met tekensnelheid, tekenopdrachten en versie; `__model.version` is het versiestempel uit `build.py`. |
| 18 | Golf 5c-1, app (36 controles): foutpaden in een eigen context (`fault_page`: geen three.js, geen WebGL, een fout vóór en na `ready`, contextverlies en herstel met een nieuwe omgevingskaart) geven de melding met de versie; `uiLastFit` kadreert na een duik ook na draaien op het duikdoel; de rondleiding pauzeert, gaat terug en vooruit en pauzeert bij een verborgen tabblad; `integrity` en `crossorigin` op de scripttags; "+n meer" als labels wegvallen; fade en badge bij isoleren met Alles tonen; themaknop met geheugen in `localStorage`; toegankelijkheid (focusval en `inert` in het hulpvenster, menu-rollen, werkbalk met roving tabindex, focusrand op het canvas, schakelaarcontrast, tabs, live region alleen bij verandering, Esc sluit het mobiele paneel); hulpvenster uit `PRESETS`; zoeken met synoniemen en diakrieten; toast, suggestie en trilling; Beeld opslaan en de printstijl. Elke controle noemt de fout die hij gevangen zou hebben. |
| 19 | Toetsenbord (desktop, echte toetsaanslagen): Enter klapt de geselecteerde dichte groep uit en kiest haar, nog eens Enter de groep erboven (de selectie klimt mee), Shift+Enter klapt in; Enter op een onderdeel klapt zijn dichte groep uit en tilt het uit als alles open staat, Shift+Enter laat het zakken en klapt zijn groep in; Escape kiest de wortel en laat een uitgetild onderdeel zakken; `?` opent de uitleg met de focus op Sluiten, sneltoetsen erachter doen niets, Escape sluit en zet de focus terug; `/` zet de cursor in het zoekveld en typen gaat naar het veld (de o van "motorkap" wisselt de modus niet); pijltjes lopen door de boom (ouder, kind, buur) zonder iets uit te klappen en tellen in de historie; pijltjes op de modusknoppen en op de segmentknop wisselen de modus; Enter en Shift+Enter in Openen werken op de geselecteerde opener; het presetmenu met pijl omlaag, End, Home, Enter en Escape. Zou audit U29 (het model was niet met het toetsenbord te bedienen) gevangen hebben; dekt de toets `/` (U17) en Enter op een opener (golf 4). |
| 20 | Formaat wisselen in een desktopcontext: 1280 × 800 naar 390 × 844 (lade), terug, 844 × 390 (zijkolom), 1024 × 768 (kolom) en terug. Na elke wissel: de juiste indeling, geen horizontale scroll, labels zonder overlap binnen het vrije beeld, het kader van de selectie binnen het vrije beeld met minstens 12 procent dekking, geen nieuwe consolemelding. Zou bevinding I1 uit golf 2 (korte en liggende schermen zonder bruikbaar vrij beeld) en de bovenbalk op lage liggende schermen gevangen hebben. Het herkadreren na een duik (R3) toetst de app-agent zelf. |
| 21 | Stap terug tot 50 stappen: 55 pijltjesstappen geven een historie van 50, 50 keer Backspace geeft de stand van na stap 5, een 51e doet niets en de knop is uitgeschakeld. Reduced motion: met `emulate_media(reduced_motion='reduce')` en opnieuw laden staat `REDUCED`, de paneelovergang is uit, een uitklap staat na een tik in de eindstand en een preset staat direct in beeld zonder `finishAll()`; op de gewone pagina staat de uitklap na een tik nog aan het begin. Zou de bevindingen I5 en I6 (de stand volgde stap terug niet) over de volle diepte gevangen hebben; `REDUCED` bestond sinds golf 1 zonder controle. |
| 22 | Zoeken: "KLEPSPIE" en "klepspie" geven dezelfde treffers; "klépspie" vindt klepspie, "solenoide" vindt Solenoïde en "vacuum" vindt Vacuüm (de normalisatie op kleine letters en zonder accenten in `app1.js` en `app2.js`). Audit U17; beschermt het zoeken terwijl U10 het uitbreidt met synoniemen. |

Twee eigenschappen van de testbrowser (headless Chromium met SwiftShader) waar controle 18 rekening mee houdt: `requestAnimationFrame` tikt niet zolang er niets te tekenen is (0 frames per 500 ms in rust), dus animaties lopen in een test alleen via `finishAll()` of door `uiTick` zelf aan te roepen; en `page.click` duurt door de stabiliteitswacht seconden, zodat een rondleiding van 5 s per stap tijdens een test vanzelf doorloopt (de controle pauzeert hem eerst). De foutpaden draaien buiten de logregistratie van de harness (`fault_page`), omdat de melding zelf een consolefout is. Bij R5 (golf 5c-1) zijn in controle 15 twee verwachte `rel`-waarden aangescherpt van `noopener` naar `noopener noreferrer` (`UI_LINK_REL` in `src/app2.js`).

`ITEST_SHOTS=MAP` bewaart screenshots van de stappen. `ITEST_GATES=1` zet controle 11 als poort aan; zonder die variabele blijft 11 alleen informatie. De controles voor gebundeld renderen (nummer 13) staan in `tools/itest.py`. Het script telde voor golf 4 79 controles over desktop en telefoon samen (alle 79 slaagden op `9c731c8`). Op de stand van golf 5c-1 zijn het er 218: 161 tot en met controle 17 (golf 5 bracht er 155, controle 17 zes), 36 in controle 18 en 21 in de controles 19 tot 22; zie de resultaten hieronder. Met de openstand die bij de wissel naar Uitklappen blijft staan (16 oktober) zijn het er 222: in controle 14 maakte een controle per weergave plaats voor drie. Omdat gebundeld renderen losse meshes naar laag 1 verplaatst, zetten alle raycasters in de tools alle lagen aan.

### `python3 tools/opentest.py [--only namen] [--out map] [--strikt-min]`

Toetst elke opener van de modus Openen (26 stuks). `--only` beperkt de run tot de genoemde openers, `--out` bewaart de uitvoer in een map. Met `--strikt-min` (zo draait `finaltests.sh` hem) is een leider zonder `open.min` een fout, en ook een `min` onder 0,8 maal de volle hoek of slag: zo kan een agent een opener niet eerst kleiner maken en dan de ondergrens meenemen. Een volger zonder eigen `min` blijft een melding. Per opener zes controles:

| Nr | Controle |
|---|---|
| 1 | Eindstand: de gemeten hoek of slag uit de eigen meshes haalt de waarde van de opener. |
| 2 | Ondergrens: de eindstand haalt `open.min`, en `open.min` is minstens 0,8 maal de volle hoek of slag. Een volger zonder `min` geeft een melding; een leider zonder `min` of met een te lage `min` is met `--strikt-min` een fout. |
| 3 | Botsing: 400 monsterpunten van het bewegende deel in 16 stappen tegen alle niet-bewegende meshes. Het telt als botsing bij meer dan 5 mm doordringing die nieuw is ten opzichte van de gesloten stand. Contactparen die bij u = 0 al bestaan worden genegeerd. Uitzonderingen staan in `tools/open_allow.json` (9 regels, elk met reden). |
| 4 | Blootleggen: een raster van 160 x 100 stralen vanuit de camera van `look`. Toegestaan zijn 0 treffers op verborgen knopen en hoogstens 2 procent stralen die door de opening in het niets verdwijnen. |
| 5 | Prestaties met alle openers open: tekenopdrachten tegen 3.000, frametijd p95 bij `openAll(1)` en `openAll(0)` tegen 8 ms. |
| 6 | Spookbatchproef: de batchopbouw wordt onderbroken door een opener; daarna worden alle getoonde batches vergeleken met een verse opbouw. |

De uitzonderingen in `tools/open_allow.json` zijn contacten die bij de echte auto bestaan. Ze zijn voor domeineigenaars alleen-lezen. Voorbeelden: de slotbeugel van de motorkap die in het motorkapslot grijpt, en de raamsleuf, de ruitgeleiders en het portierrubber waar het glas van een zijruit doorheen zakt.

### `python3 tools/pubsmoke.py`

Publicatierooktest voor beide kanalen. Zet de kale CDN-pagina (zoals `build.py --bare` hem schrijft) in hetzelfde HTML-geraamte als de artefacthost, en laadt daarnaast `index.html` zoals GitHub Pages het serveert: een volledig document met doctype en viewport-regel. Hij laadt in Chromium en beantwoordt de verzoeken naar `cdn.jsdelivr.net/npm/three@0.147.0/` uit het lokale pakket. Controleert:

- geen console- of paginafouten, `__model` klaar binnen 20 s, `THREE.REVISION` is 147;
- het canvas heeft `touch-action: none` en `user-select: none`, en `-webkit-touch-callout: none` staat in de stylesheet (lang drukken op iOS);
- geen horizontale scroll op 1280 × 800 en 390 × 844;
- de Pages-versie op een telefoon (390 × 844): documentmodus `CSS1Compat` en een schermbreedte van 390 px. Tot 16 oktober had `index.html` geen doctype en geen viewport-regel, waardoor een telefoon de Pages-versie in quirks-modus op 980 px breedte toonde; het artefact had daar geen last van, omdat de host een geraamte toevoegt. De tests vingen het niet, omdat ze de pagina altijd in een eigen geraamte laadden. Gevonden bij de vergelijking met espace5, waar `build.py` het al zo deed;
- via `curl` en de proxy: elk CDN-bestand bestaat en is byte voor byte gelijk aan het lokale pakket, en de stylesheet van Google Fonts is bereikbaar.

Na publicatie moet GitHub Pages byte voor byte `index.html` serveren, en moet het artefact de kale pagina uit `build.py --bare` bevatten. Dat controleert dit script niet. De orkestrator leest beide URL's terug; in de pagina van het artefact zoekt hij de kale pagina byte voor byte: het bestand moet er precies één keer en aaneengesloten in staan, met alleen het paginaskelet van de host eromheen. De uitkomst staat in de tabel hieronder.

### `python3 tools/pncheck.py [--tree] [--update]`

Herbouwt `src/partnumbers.js` en `docs/onderdeelnummers.csv` uit `data/pn/` in het geheugen en vergelijkt byte voor byte met de gecommitte bestanden (zonder browser; in de push-job van CI). Met `--tree` vergelijkt hij ook `data/tree.json` met de boom van de pagina; `--tree --update` schrijft `data/tree.json` opnieuw. Exitcode 1 bij een verschil, een pad buiten de boom, een onbekende eenheid, een keuze met een nummer dat niet in de lijst staat, of een bron zonder https. De bouw stopt ook bij een bron-URL met `|` of een spatie (de CSV scheidt bronnen met `|`). De statistiek noemt sinds golf 5d ook `csv_rijen`, `bytes_csv`, `bronnen_uniek_in_csv`, `bronnen_met_page` (URL's met `?page=N`, nog 24) en `namen_met_schuine_streep`. Het schema van de CSV staat in `onderdeelnummers-schema.md`.

### `python3 tools/tri.py [--gate] [--json UIT.json]`

Telt driehoeken per hoofdgroep (met het aantal onderdelen per groep, zodat een zwaar deel dat van groep wisselt zichtbaar blijft) en toont de 25 zwaarste onderdelen. Met `--gate` faalt hij boven de budgetten in `tools/anchors.json` (`triangle_budgets`: 700.000 totaal, 240.000 Aandrijflijn, 190.000 Carrosserie, 125.000 Onderstel, 95.000 Interieur, en per systeem). De budgetten zijn alleen-lezen voor domeineigenaars; wijzigen alleen met een reden in `docs/onderzoek/beslissingen.md`. Zonder `--gate` is hij informatie.

### `python3 tools/visdiff.py BEELDMAP BASISMAP [--drempel 1.5] [--tolerantie 16] [--schaal 2] [--uit RAPPORT]`

Visuele regressie. Verkleint elke PNG in BEELDMAP (de uitvoer van `tools/orkestratie/presetshots.py`) met een vaste factor (standaard 2, Lanczos: 1280 × 800 wordt 640 × 400), vergelijkt hem met de gelijknamige PNG in BASISMAP (die al op die maat staat) en telt per beeld het aandeel pixels waarvan een kanaal meer dan de tolerantie (standaard 16 van 255) afwijkt. Boven de drempel (standaard 1,5 procent) is het beeld rood; dan komt er een verschilbeeld (basis, nieuw, afwijking in rood, op de verkleinde maat) in RAPPORT, naast `visdiff.json`. Een beeld dat in een van beide mappen ontbreekt of na het verkleinen een ander formaat heeft is ook rood. Een regel per beeld, onderaan een samenvatting; exitcode 1 bij een rood beeld.

De basislijn staat in `docs/baseline/`: de 42 presets zonder rondleiding, verkleind naar 640 × 400 en teruggebracht tot 256 kleuren (Pillow `quantize` met `MAXCOVERAGE`, dat de grootste kleurfout klein houdt, hier hoogstens 12 stappen per kanaal, en ongeveer de helft kleinere bestanden geeft dan de mediaansnede van `docshots.py`), samen 2.313.903 bytes (ongeveer 2,3 MB; op volle maat met de mediaansnede was het 9,4 MB). Ze is gemaakt met `python3 tools/visdiff.py --basislijn UITVOER_VAN_PRESETSHOTS docs/baseline`. Gemeten op `69cd0fd`: de basislijn tegen zichzelf 0,000 procent op alle 42 beelden; twee verse `presetshots`-reeksen op dezelfde stand tegen de basislijn 0,000 procent op alle 42 beelden bij de standaardtolerantie van 16 (bij tolerantie 12 hoogstens 0,038 procent, bij "Alles uit elkaar"), dus de ruisvloer van verkleinen en kwantiseren ligt ver onder de helft van de drempel. Alleen de orkestrator vernieuwt de basislijn, in een eigen commit met een voor/na-galerij (struikeldraad T8); een domeinagent die rood ziet, herstelt de weergave of legt in zijn rapport uit waarom het beeld moet veranderen.

### `python3 tools/anchorcheck.py [--json UIT.json] [--basis BASIS.json] [--only id,id]`

Labelankers per preset (zonder de rondleiding, 1280 × 800). Na `preset(id)` en `finishAll()` leest het script de geplaatste labels met hun ankerpunt (`uiSpots`, dezelfde lijst als `labelRects()`) en schiet door elk ankerpunt een straal vanuit de camera over de aanklikbare meshes (`uiPickList()`, dezelfde lijst als een klik). Twee maten per anker: eigen (op de straal ligt een treffer op het gelabelde onderdeel of een afstammeling binnen 1 cm van het ankerpunt, dus het anker zit op het eigen deel en niet in de lucht) en vrij (de eerste treffer op de straal is het gelabelde onderdeel, dus niets staat ervoor). Per preset en in totaal: labels, eigen, vrij, met de namen van de ankers achter een ander deel en in de lucht. `--json` bewaart de uitkomsten; `--basis` vergelijkt de twee totalen met een eerder bewaard bestand en is rood als een van beide daalt (de poort "geen van beide daalt"). Zonder `--basis` is het script informatie; consolefouten geven altijd exitcode 1. Op `69cd0fd`: 42 presets, 352 labels, eigen 319, vrije zichtlijn 267 (de meting van golf 3 in de sectie Labelankers hieronder was 261 van 345 op 36 presets, met de hand).

### `python3 tools/shot.py MAP 'JSON'`

Screenshots en `eval`-stappen per viewport. Voorbeeld:

```bash
python3 tools/shot.py /tmp/shots '[["desk",1280,800,["shot:gemonteerd","eval:__model.preset(\"main\"); __model.finishAll(); 1","wait:800","shot:hoofdgroepen"]]]'
```

Breder dan 700 pixels is desktop, smaller is touch. Stappen: `eval:`, `wait:`, `click:`, `shot:`. Een screenshot van een grote explosie heeft in software-rendering een lange time-out nodig (180 s is ingesteld). Geeft altijd 0; console-meldingen worden alleen getoond.

### `python3 tools/ui_inner.py`

Controleert in de gemonteerde stand vanuit ten minste 200 richtingen rond de hele auto en rond elke hoofdgroep afzonderlijk geïsoleerd of een `inner`-knop de eerste treffer van buitenaf is: dan zou het verbergen een gat in de auto laten. Dit script is nieuw in golf 2 en staat in de samengevoegde boom. Opties: `--strict` (exitcode 1 bij een zichtbare ingesloten knoop), `--json`, `--open` (zie hieronder) en `UI_INNER_DIRS` voor het aantal richtingen. Uitvoer op de eindstand (`9c731c8`): 253 ingesloten knopen in de boom, 200 richtingen per weergave, 39.200 stralen op de hele auto en 20.000 per hoofdgroep, 0 eerste treffers op een ingesloten onderdeel, dus 0 overtreders voor elke eigenaar. De opbergbak in de middenconsole is in de carrosserieronde niet meer als ingesloten gemarkeerd, omdat dit script er door de zijruit een treffer op vond; daarom zijn het 253 knopen en niet meer 256. Direct na de samenvoeging van golf 2 waren er 52 zichtbare ingesloten knopen (carrosserie, interieur, onderstel, systemen, aandrijving en motor); de herstelronde heeft ze opgelost.

### `python3 tools/ui_inner.py --open`

Dezelfde controle met alles open: welke ingesloten knopen worden zichtbaar als de openers open staan. Een knoop die zichtbaar wordt door een opening is een reden om de `inner`-vlag weg te halen. Na golf 4 zijn op deze manier veel vlaggen weggehaald (onder meer de koppelomvormer en het onderstel).

### `tools/orkestratie/finaltests.sh UITVOERMAP`

Draait de volledige testset in twee parallelle reeksen (plus een derde met de extra tests van de auto, zie onder): lint, smoke, integrity, silhouette, `ui_inner.py --open --strict` en `opentest.py --strikt-min` in de ene reeks; `itest.py` met poorten, `tri.py --gate`, pubsmoke en stats in de andere. De uitvoer per test staat in de map, met per test de duur en de exitcode op de laatste regel, en `start.txt` en `einde.txt`. Het script geeft exitcode 1 zodra één test faalt en weigert zonder uitvoermap. De lijst van tests staat in `tests.txt`, zodat CI kan zien of er een test uit de set is gevallen.

Extra tests per auto: het generieke veld `extraTests` in `auto.json` (uitleg: `docs/framework.md`, sectie "Extra tests per auto") meldt eigen tests aan. `finaltests.sh` start ze als derde parallelle reeks naast de twee vaste, elk via `python3 tools/framework.py extra NAAM UITMAP`, dat de exitcode van het commando ongewijzigd doorgeeft. Voor de Alto zijn dat `meet`, `zijstraal` en `meet-achter` (sinds open punt AWK, stage S1), in die volgorde en achter elkaar in de derde reeks. Elke extra test schrijft `NAAM.txt` met als laatste regel `exit N (Ns)`, telt mee in de eindlus en de exitcode (een ontbrekend `NAAM.txt` is FOUT) en staat na de vaste namen in `tests.txt`, dat daarmee `lint smoke integ sil inner opentest itest tri pub stats shots visdiff anchor meet zijstraal meet-achter` bevat. Naast `meet.txt`, `zijstraal.txt` en `meet-achter.txt` staan `meet.json`, `zijstraal.json` en `meet-achter.json` in de uitvoermap. `meet-achter` is op `fa5c619` rood (nulmeting, zie "Resultaten AWK S1" hieronder) en op de tak van open punt AWK groen sinds de achterwielkast dicht is en de id-pass 24-bit diepte heeft (zie "Resultaten AWK C2-S1" hieronder). Een ongeldig `extraTests`-veld maakt de set meteen rood, vóór het werk begint (`framework.py extra-namen` geeft exit 1). Zonder het veld is de set precies de vaste lijst.

CI bewaakt de haak zelf: de stap "haak voor extra tests in finaltests.sh" in `.github/workflows/ci.yml` controleert met `grep -F` dat `finaltests.sh` zowel `framework.py extra-namen` als `framework.py extra "$n"` bevat en drukt de aangemelde namen af; `framework.py check` valideert het veld (rood bij een fout). De haak komt uit laguna3, tak `finaltests-extra`, commit `0c58c83`, en is geëxporteerd in `8b85200`. CI draait de metingen zelf niet; die staan in de lokale set en in de Linux-container.

Resultaten, aantallen, duur en herhaalbaarheid: sectie "Resultaten P1: meet en zijstraal in finaltests (17 oktober 2026)" hieronder; kerngetallen van de pagina: `docs/cijfers.md`.

### `python3 tools/meet.py [--achter] [--root WERKBOOM] [--uit MAP] [--json BESTAND] [--cams a,b,c|rondgang|wielkast] [--geen-rondgang] [--sw] [--geen-geo] [--geen-png] [--shots] [--basis EERDERE.json]`

Meting van de voorkant, uit de front-rondes (versie 2) overgenomen in `tools/`. Het script rendert per camera een id-pass (elke knoop een eigen kleur, zonder antialias, helder glas verborgen) en telt de beeldpunten per knoop. Elke knoop krijgt een klasse (buitenkant, wiel, wielkast, interieur, motorruimte, onderstel, overig); een knoop uit de motorruimte of het onderstel die door een kier zichtbaar is, staat met aantal beeldpunten, omkadering en een voorbeeldbeeldpunt in `meet.json` (voor `rays.py`). Daarnaast meet het geometrie: bumperschouderhoek, lip-aansluiting, hoogteverschil van hoekkap en hoofdlens, verhouding bumper/lamp en driehoeken. De volledige uitleg per poort staat in de docstring van het script.

- Poortgroepen (aantallen: sectie "Resultaten P1" hieronder): kier in de hoekcamera's (doorkijk naar motorruimte of onderstel), zicht onder de bumper, bumperschouderhoek, hoekkap boven en onder, lip (afstand, aansluithoek, normaalsprong), verhouding bumper/lamp, helderheid van de onderplaat en afscherming onder de bumper, wielkastcamera's met een kierpoort per kant (venster boven de band, gat onder de boog, opening boven het venster, scharnier achter de band) en een lage rondgang om de auto, wielkastbekleding tegenover onderstel en aandrijving, en een console zonder fouten. De afwerkingsmetingen (a tot en met e) zijn zachte poorten.
- Harde en zachte poorten: 99 harde poorten en 13 zachte. Een zachte poort is in `meet.json` gemarkeerd met `zacht: true` (uitkomst in `ok_afwerking`), staat in `meet.txt` als `GEEL` wanneer hij niet groen is, en telt niet mee voor de exitcode. Op de huidige stand is 12 van de 13 zachte poorten groen; de gele is `afwerking e: embleem leesbaar zijhoek-r light` (embleem 0,80 tot 1,87 keer de helderheid van het gaas, ondergrens 0,9).
- Exitcode: 0 alle harde poorten groen, 1 minstens een harde poort rood, 2 de meting is mislukt (een uitzondering in het script, of `tools/harness.py` ontbreekt in de gekozen wortel). `finaltests.sh` telt 1 en 2 allebei als FOUT.
- Controle op het aantal poorten (alleen in volle modus, dus zonder `--cams`, `--geen-geo` en `--geen-rondgang`): `VERWACHT_HARD = 99` en `VERWACHT_ZACHT = 13` in het script (nulmeting 17 oktober 2026 op `d044bae`). Wijkt het gevonden aantal af, dan is de extra harde poort `aantal poorten` rood en is de exitcode 1; wie bewust een poort toevoegt of schrapt, past die twee getallen mee aan. De controle staat ook in het groene geval in `meet.json` (`extra: true`, `meta.aantal_poorten`) en telt niet mee in de 99. In de beperkte modus meldt het script `aantal poorten niet gecontroleerd (beperkte modus)`.
- Ontbrekende invoer geeft rood: in volle modus worden de geometriepoorten (bumperschouderhoek, hoekkap boven en onder, de drie lippoorten, de twee verhoudingspoorten, afscherming onder de lip, afscherming raakt aandrijving niet, wielkastbekleding raakt onderstel niet) en `onderplaat tegenover gaas in eig` altijd aangemaakt. Ontbreekt hun invoer (een hernoemde knoop, een geometriemeting die `null` of de beginwaarde geeft), dan staat de poort rood met de waarde `invoer ontbreekt: <sleutel>` en verdwijnt hij niet stil uit de lijst. `Onderplaat voorbumper` is daarbij een verplichte, vaste knoop. De zachte poort `afwerking d` blijft zacht en wordt via het aantal zachte poorten bewaakt.
- Argumenten: `--root` (standaard de repowortel boven `tools/`, daarna `$MEET_ROOT`), `--uit` (uitvoermap; `finaltests.sh` geeft `{uit}/meet`), `--json`, `--cams` (een lijst, of `rondgang` of `wielkast`), `--geen-rondgang` (snelle tussenmeting zonder de lage rondgang, de rondgangpoorten ontbreken dan), `--sw`, `--geen-geo`, `--geen-png` (geen beelden schrijven; zo staat het in `auto.json`), `--shots` (gewone opnamen, donker en licht) en `--basis` (verschil met een eerdere `meet.json`).
- Renderer: standaard ANGLE Metal (GPU) op macOS en SwiftShader in Linux; `--sw` dwingt SwiftShader af. De keuze is bewust de standaard van het script (zie het item `meet` in `auto.json`). Gelijkheid: alle 112 poorten hebben dezelfde kleur (groen of rood) op macOS-GPU, macOS-SwiftShader en Linux-SwiftShader (nulmeting uit `auto.json`, 17 oktober 2026). SwiftShader geeft op macOS en Linux dezelfde beeldpunttellingen; de GPU wijkt tot enkele tientallen beeldpunten af. Vergeleken in de uitvoer van deze fase (macOS-GPU tegen de Linux-container): dezelfde kleur voor alle 112 poorten, en 88 van de 112 met exact dezelfde waardetekst. De kleinste marge van een harde doorkijkpoort op de GPU is 35 van 50 beeldpunten.
- Dieptebuffer: de id-pass en de pass met de wereldpositie renderen in een render target met `stencilBuffer: true`, zodat three r147 een 24-bit dieptebuffer kiest, net als het canvas van de app. Reden en meting: sectie achtermodus hieronder. De voormodus houdt daarmee dezelfde kleur voor alle poortregels (sectie "Resultaten AWK C2-S1").
- Duur: zie "Resultaten P1". Kort: ca. 4 minuten op macOS met de GPU, 12 tot 20 minuten in de Linux-container met SwiftShader, afhankelijk van of er andere tests naast draaien.

Gebruik: `. ~/.config/web3d/env.sh`, dan `python3 -I tools/meet.py --uit UITMAP --json UITMAP/meet.json`. Voor een snelle tussenmeting: `--geen-rondgang`. Een rode poort uitzoeken: `rays.py` (hieronder). De achterwielkasten: `--achter` (volgende sectie); zonder `--achter` is het script precies de voormodus hierboven.

### `python3 tools/meet.py --achter` (achtermodus, open punt AWK)

Dezelfde meting voor de achterwielkasten: doorkijk door de achterboog naar achterbank, bagagebekleding, vloer en zijbekleding achter (beslissing 25, punt 2 en advies punt 3, in `docs/onderzoek/beslissingen.md`). De voormodus verandert er niet door: op `fa5c619` geeft `meet.py` zonder `--achter` na de wijziging precies dezelfde `meet.json` (alle 113 poortregels en alle 484 camera's gelijk; alleen `meta.aantal_poorten` heeft het veld `modus` erbij).

- Herkomst: `front-ronde4/v2/meet_achter.py`, dat is `meet.py` ronde 4 met vier verschillen, hier letterlijk overgenomen: (1) het interessegebied is de omkadering van het achterwiel per kant plus 25 procent (`ROI_WIEL_L_ACHTER`, `ROI_WIEL_R_ACHTER`); (2) de zone loopt over z -1,628 tot -0,868 (`ZONE_Z_ACHTER`: de achterboog, AXR -1,248 plus en min 0,30, plus 80 mm); (3) de as van de vrijstelling midden onder de boog is -1,248 (`AXR_ACHTER`); (4) ook `Remleiding achter` en `Remslang achter` tellen als remhardware in de wielkast (`WK_HARDWARE_ACHTER`). Drempels als voor: 50 beeldpunten (smal en breed) per interieur- of motorruimteknoop, tussenpoort 2.500 beeldpunten per camera. Bekende eigenaardigheid, bewust niet veranderd: het tweede deel van het interessegebied, `.*/Wielkast achter links ` (met een spatie aan het eind, net als voor), past op geen knoop; het gebied is dus alleen de omkadering van het wiel plus 25 procent, zoals in `meet_achter.py`.
- Camera's: de lage rondgang van de voormodus (432 camera's) en 24 wielkastcamera's achter (`WIELKAST_ACHTER`, 12 per kant, met reden in het script): `wielkast-recht`, `wielkast-achter` en `zij-laag` van de voorwielkast overgezet naar het achterwiel, gespiegeld rond de as (`ach-sp-`, z' = AXR - (z - AXF)) en verschoven (`ach-vs-`, z' = z - AXF + AXR), plus `ach-zij-laag`, `ach-zij-hurk`, `ach-34-laag`, `ach-voor-laag`, `ach-dorpel` en `ach-bumper` van de adviseur (`front-ronde4/adv/cams/achter.json`), elk ook gespiegeld (`-r`). `wk-zij-laag` staat op de as: beide overzettingen geven dezelfde camera, en die is gelijk aan `ach-zij-laag`; hij staat er een keer in. Geen hoek-, eigenaar-, voor-, detail-, afwerking- of beeldcamera's en geen geometriemeting.
- Poorten, 25 harde en geen zachte. De 21 van `meet_achter.py`, met `achter` voor de kant in de naam: per kant `wielkast venster boven de band achter`, `wielkast gat onder de boog achter`, `wielkast opening boven het venster achter` en de tussenpoort `wielkast venster tegenover V1 achter` (over de rondgang van die kant), zes rondgangpoorten `wielkast rondgang h0.23|h0.45 r2.0|r3.0|r4.5 achter <kant>`, en `console zonder fouten achter`. De teksten die voor de voorkant gelden (schot, veerpoottoren, V1) zijn feitelijk herschreven; de getallen niet. Daarbij twee strengere poorten per kant: `wielkast midden onder de boog achter` (voor is midden onder de boog, |z - as| < 0,20 en y < 0,50, vrijgesteld voor de aandrijfas; achter loopt geen aandrijfas, dus de vrijstelling verbergt daar doorkijk; dezelfde eis van 50 beeldpunten per knoop in `zone_px.midden` over de rondgang) en `wielkastcamera's achter` (de 12 wielkastcamera's van die kant, 50 beeldpunten per knoop in de zones onder, venster, boven en midden).
- Controle: in volle achtermodus (zonder `--cams` en `--geen-rondgang`) precies `VERWACHT_HARD_ACHTER = 25` harde en `VERWACHT_ZACHT_ACHTER = 0` zachte poorten, anders is de extra poort `aantal poorten achter` rood; de extra poort `interessegebied achterwielen in beeld` is rood als geen enkele rondgangcamera het linker- of het rechterachterwiel ziet, of als een wielkastcamera achter geen interessegebied heeft (een hernoemde knoop zou anders elke poort stil groen maken). Een poort zonder camera's van zijn kant staat in volle modus rood met `invoer ontbreekt: ...`. Beide extra poorten staan ook groen in de lijst (`extra: true`), tellen niet mee in de 25, wel in de exitcode. In de beperkte modus (`--cams`, bijvoorbeeld `--cams rondgang` voor alleen de 21 poorten van `meet_achter.py`, of `--geen-rondgang`) meldt het script `aantal poorten niet gecontroleerd`.
- JSON: per gevlagde knoop ook `zone_px.midden` (de beeldpunten die de vrijstelling midden onder de boog naar `overig` zet; een deel van `overig`) en per camera `roi_gevonden`.
- Dieptebuffer (open punt AWK, cyclus 2): zonder stencil kiest three r147 voor een render target `DEPTH_COMPONENT16`, ongeveer 7 mm precisie op 1,8 m en 17 mm op 4,5 m. Een knoop die minder dan 1 a 2 cm achter een wand ligt, lekte daardoor in de id-pass door de wand heen en telde als doorkijk, terwijl de app (een canvas met 24-bit diepte) en de beelden de boog dicht laten zien; `rays.py` bevestigde dat Bagagevloer (5 mm), Kabelboom achter (0,7 mm) en Wielkastbekleding (15 mm) achter een wand liggen. Met `stencilBuffer: true` wordt het `DEPTH24_STENCIL8`. Geen drempel, zone, camera of poort is daarbij veranderd; de nulmeting op `fa5c619` is ook met 24-bit diepte 22 van 25 rood, dus de correctie verruimt niets (beslissing 27 in `docs/onderzoek/beslissingen.md`).
- `rays.py --cam` kent ook de wielkastcamera's achter.
- Gebruik: `python3 -I tools/meet.py --achter --uit UITMAP --json UITMAP/meet-achter.json --geen-png`; in `finaltests.sh` als extra test `meet-achter` (`auto.json`). Nulmeting en herhaalbaarheid: sectie "Resultaten AWK S1" hieronder; de stand met 24-bit diepte en de duur: sectie "Resultaten AWK C2-S1".

### `python3 tools/rays.py --cam CAMERA --px X,Y [--px ...] [--n 5] [--ring N] [--sw] [--root WERKBOOM]`

Beantwoordt de vraag "wat ligt er achter dit beeldpunt van `meet.py`?". Het script zet dezelfde camera als `meet.py` (zelfde cameralijst, DPR 2, 2000 x 1476), schiet met `THREE.Raycaster` een straal door elk opgegeven beeldpunt en toont de eerste treffers: knoop, afstand, punt en normaal, met het glas verborgen zoals in de id-pass. `--n` is het aantal treffers per straal, `--ring N` schiet er acht buurstralen op N beeldpunten afstand bij (toont wat de opening begrenst), en `--box x0,y0,x1,y1 --stap N` schiet een raster binnen een omkadering uit `meet.json` (`gevlagd[].box`; het voorbeeldbeeldpunt staat in `gevlagd[].voorbeeld_px`). Het script laadt `meet.py` uit dezelfde map en leest geen bestanden. Het is een hulpmiddel bij een rode poort, geen poort; het zit niet in `finaltests.sh`. Exitcode 2 als `tools/harness.py` in de gekozen wortel ontbreekt.

### `python3 tools/zijstraal.py [--root WERKBOOM] [--json BESTAND] [--uit MAP] [--stap MM] [--sw] [--straal Y,Z ...]`

Harde poort voor platen en onderdelen die zijdelings door de buitenhuid van de carrosserie steken. Aanleiding: `d2ae9f1` (sluitplaten achter de achterband) kwam door alle poorten (zie `docs/onderzoek/beslissingen.md`), omdat `integrity.py` alleen onderdelen buiten de carrosserie toetst en `clash.py` een dunne plaat door een open schaal niet als doordringing ziet.

- De regel: stralen evenwijdig aan de x-as, van beide kanten van buiten naar binnen, op een raster van 5 mm in (y, z), tussen onderkant (YB) en schouderlijn (YT min 1 cm) en tussen ZR plus 5 cm en ZF min 5 cm, in de gesloten stand. Per straal tellen alle treffers. De buitenste treffer van een huidknoop (maximum over de stralen binnen 5 mm) is de huid van die kant. Een zichtbare knoop die geen huid is, is rood als hij meer dan 2 mm (of zijn toegestane uitsteek) buiten die huid ligt.
- Huidlijst (`HUID` in het script, met een reden per item): schermen en de schermflens, A-, B- en C-stijlen, achterpaneel, dorpels, buitenpaneel en rand van het portier, voorbumper (schaal, lip, onderplaat), achterbumperschaal, motorkap (buitenpaneel en rand) en het buitenpaneel van de achterklep.
- Uitzonderingslijst (`UITZONDERING`, met reden en toegestane uitsteek): koplampunit, buitendeurgreep (15 mm), zijlijsten (8 mm), zijrepeater (5 mm) en de bumpernaad voor (5 mm). De lijst van `integrity.py` (banden, velgen, tankklep, uitlaateindstukken en dergelijke) is bewust niet overgenomen, zodat een band die door het scherm steekt rood blijft.
- Rekenwijze: analytisch per driehoek in het (y, z)-vlak, zonder renderer; als controle schiet het script een vaste steekproef van echte `THREE.Raycaster`-stralen en vergelijkt alle treffers. Een verschil bij meer dan 1 procent van de steekproef is een mislukte meting.
- Dekking per patroon: de JSON heeft `dekking` met per patroon van `HUID` en `UITZONDERING` het aantal gematchte zichtbare meshes (`{huid: {patroon: n}, uit: {patroon: n}}`; de telling van `uit` slaat knopen over die al onder `HUID` vallen). Een patroon zonder mesh (n = 0), bijvoorbeeld na het hernoemen van een knoop, is een mislukte meting: het script meldt `METING MISLUKT: huidpatroon zonder mesh: <patroon>` of `METING MISLUKT: uitzondering zonder mesh: <patroon>` en geeft exitcode 2. Voorheen controleerde de meting alleen of elke kant in totaal stralen met huid had, zodat de dekking van een weggevallen patroon stil verdween en de poort groen bleef. De telling is per patroon, niet per alternatief in een groep: valt alleen `Voorscherm` uit `(Voorscherm|Achterscherm|Schermflens)` weg, dan wordt dat patroon 4 in plaats van 6 meshes en blijft de melding uit, maar de poort zelf wordt dan rood (exitcode 1). Op de huidige stand: huid 6, 6, 1, 2, 4, 3, 1, 2 en 1 meshes, uitzondering 14, 4, 4, 2 en 1.
- Exitcode: 0 groen, 1 rood (een knoop door de huid, of een consolefout), 2 meting mislukt (raycaster-controle wijkt af, geen huid geraakt of een patroon zonder mesh). Uitvoer: `zijstraal.json` met per kant de stralen, de knopen door de huid, de grootste uitsteek in mm met een voorbeeldpunt, de lijsten en de controle. Argumenten: `--root`, `--json`, `--uit`, `--stap` (rasterstap in mm, standaard 5), `--sw`, `--straal Y,Z` (alle treffers van een straal, met soort: huid, kandidaat, uitzondering).
- Ijking (stap 5 mm, uit het commitbericht van `d044bae`): `f3b77bd` en `dc4b70e` groen; `d2ae9f1` rood met Wielkast achter links 239 stralen tot 17,5 mm en rechts 355 stralen tot 26,6 mm door het achterscherm (23,0 mm op een raster van 1 cm, zoals de eerdere meting). HEAD (`d044bae`) groen: 0 stralen door de huid. Synthetisch: de buitenplaten van Wielkast voor links op x 0,72 rood (54 mm); de hele wielkast 30 mm naar buiten rood (11 stralen, 10,9 mm). Twee runs en `--sw` geven dezelfde JSON.
- Zwaktes (uit de docstring): de poort ziet niets boven de schouderlijn (ruiten, stijlen, dak, spiegel), onder de onderkant, op de voor- en achterkant en bovenkant, en in de eerste en laatste 5 cm van de lengte; ziet een onderdeel niet dat buiten de huid staat waar binnen 5 mm geen huid van dezelfde kant ligt (op `d2ae9f1` links ziet hij de plaat alleen boven y 0,375); mist vlakken evenwijdig aan de straal (de hele wielkast 30 mm naar buiten geeft maar 11 stralen); mist uitsteeksels onder de 2 mm of smaller dan de stap; en kijkt niet naar verborgen knopen (`inner`, `hideWhen`), doorzichtige meshes en de open stand (die dekken `opentest.py` en `clash.py`).

`VISDIFF_BASIS` kiest een andere basislijn voor `visdiff` dan `docs/baseline`. Software-rendering is niet vergelijkbaar tussen platforms: `docs/baseline` komt uit de Linux-container, en op de Mac wijken alle 34 beelden daar 6,01 tot 25,48 procent van af (gemiddeld 8,58 procent, gemeten op `b0201d0`), ver boven de drempel van 1,5 procent. Een run op de Mac meet daarom eerst een eigen basis B0 op dezelfde machine, van een groene startstand: `python3 tools/visdiff.py --basislijn UITVOER_VAN_PRESETSHOTS B0MAP`, met de presets van die stand (`presetshots.py`). Voor versie 3 is B0 gemaakt van `ccf90b8` met `harness.py` en `shots.py` uit de bijgewerkte werkboom (34 presetbeelden, 1.794.468 bytes op 640 x 400, schaal 2); daarna `VISDIFF_BASIS=B0MAP tools/orkestratie/finaltests.sh UITMAP`. Zwakte: een afwijking die al in B0 zit, is onzichtbaar. De functietests zijn platformonafhankelijk; `visdiff` is op Linux de poort en op de Mac informatief.

## Bevroren testcontract

De tests spreken de pagina aan via `window.__model` (de testkoppeling in `src/app2.js`, hierboven beschreven; sinds het framework van 16 oktober heet hij in elk model zo, en `AUTO.hook` in `auto.json` geeft hem per auto een tweede naam, hier `window.__laguna`), maar op een aantal plekken ook rechtstreeks via interne namen van de app: globale functies en variabelen uit `src/*.js` die in `page.evaluate` bruikbaar zijn omdat de pagina één klassiek script is. Die namen zijn een contract: wie er een hernoemt, verplaatst of van betekenis verandert, levert de wijziging van het testscript in dezelfde commit en noemt dat in het commitbericht. De lijst is met grep over `tools/` gecontroleerd op `69cd0fd`.

| Script | Interne namen |
|---|---|
| `tools/itest.py` | `applyVisibility`, `PN_DATA` (controles 12 en 15); `renderer`, `scene`, `camera`, `canvas` (controles 11 tot 13 en de hulpfuncties); `REDUCED`, `uiTick` (controles 18 en 21); `uiFadeMat`, `uiFade`, `uiTick` (controle 18, de fade bij isoleren) |
| `tools/opentest.py` | `uiTick`, `uiBatchSync`, `uiBatchQ`, `uiBatchJob`, `uiBatchFree`, `uiBatchStep`, `uiBatchAdd`, `uiBatchInfo`, `uiBatched`, `uiBaseRel`, `uiAnchorFrame`, `updateLabels`, `uiOpenAnim`, `uiInnerHidden`, `requestRender`, `ASMS`, `SPREAD`; `ROOT`, `ALL`, `MESHES`, `camera`, `controls` |
| `tools/ui_inner.py` | `uiInnerHidden`, `uiOpenNear` |
| `tools/integrity.py` | `OPENERS`, `uiPathOf` (achter een `typeof`-controle) |
| `tools/pncheck.py` | `uiPathOf` |
| `tools/smoke.py` | `renderer`, `scene`, `camera` |
| `tools/anchorcheck.py` | `uiSpots`, `uiNPlaced`, `uiLabelAnchor`, `uiPickList`; `camera`, `canvas` |
| `tools/orkestratie/*` (hulpscripts, geen poort) | `camera`, `controls` (`gateshots.py`, `pick.py`), `scene` (`rays_bagage.py`) |

Haken op `window.__model` die golf 5c-1 toevoegde en die controle 18 gebruikt: `lastError` (ook `window.__modelLastError`), `contextLost`, `lastFit()`, `tourState()`, `tour.pause`, `tour.resume`, `tour.prev`, `tour.next`, `labelsMore()`, `fading`, `isolated()`, `theme()`, `setTheme(t)`, `norm`, `searchTerms`, `saveImage()`, `toast(txt)`, `hintStage`, `hintNext()`.

Daarnaast hangen de tests aan element-id's, klassen en data-attributen uit `src/head.html` en `src/app2.js`. Voor `tools/itest.py`: `#sheet`, `#modes [data-mode]`, `#openSeg [data-omode]`, `#explode`, `#presets`, `[data-cat]`, `#menu`, `.mi`, `[data-preset]`, `#undo`, `#tabbtn-info`, `#tabbtn-tree`, `#tab-tree`, `#treeSearch`, `#treeInfo`, `#tree .trow .tn`, `#labels .lbl`, `#tip`, `#btnOpenAll`, `#btnCloseAll`, `#btnOpenList`, `#openList`, `#actOpen`, `#pnBody`, `#pnWarn`, `#pnBox`, `.pn-tab`, `#help`, `#helpDlg`, `#helpClose`, `#debug`. `pubsmoke.py` toetst de stijlregels van het canvas (`touch-action`, `user-select`, `-webkit-touch-callout`). Ook deze namen vallen onder het contract. De basislijn van `visdiff.py` (`docs/baseline/`), `IGNORE` in `tools/harness.py` en `tools/anchors.json` wijzigt alleen de orkestrator (struikeldraad T8).

### Hulpmiddelen van de visuele poort (`tools/orkestratie/`)

Golf 5 bracht de hulpmiddelen van de visuele poort en van het nameten in de repo. De scripts zonder REPO-argument gebruiken de checkout waarin ze staan. De tabel in `tools/orkestratie/README.md` heeft de aanroepen.

| Script | Wat het doet |
|---|---|
| `gateshots.py UITMAP` | De vaste beelden van de poort: elke opener via zijn knop, drie overzichten met alles open, het dak van boven en van binnen en drie telefoonbeelden, met een `index.json`. |
| `poort.js` | De poort zelf (Workflow-script): drie plakken met elk drie beoordelaars, meerderheid per kenmerk K1 tot K13. Leest de beelden van `gateshots.py`. |
| `pick.py` | Zet Openen aan, draait een voorbereiding en noemt per schermpunt het pad van het onderdeel dat er ligt. |
| `shots.py` | Gerichte opnames in de modus Openen. |
| `probe.py` | Draait een JS-expressie op de pagina en drukt het resultaat als JSON af; `window.__box(naam)` geeft het wereldkader van een knoop. |
| `rays_bagage.py` | Stralen vanuit het midden van de bagageruimte naar links en rechts: vrije ruimte en het eerste onderdeel. |
| `phone.py` | Twee telefoonbeelden (390 x 844) en de scrollbreedte. |
| `dumptree.py` | De hele boom als JSON. |

### Meetscripts van de orkestrator buiten `finaltests.sh`: `clash.py` en `huid.py`

`tools/orkestratie/clash.py KNOOP... [--tegen KNOOP...] [--straal MM] [--toegestaan BESTAND]` meet doordringing en kleinste afstand van knopen tegen het model, ook binnen dezelfde hoofdgroep (waar `integrity.py` niet kijkt); `--toegestaan` verwijst naar een lijst toegestane paren (`data/clash-toegestaan.json`, hier `[]`) en moet expliciet worden meegegeven, het script heeft geen standaardpad. `huid.py --bewaar` legt de huid van een knoop vast en `huid.py --vergelijk` meet later de afwijking (maximum, 95-percentiel, gemiddelde). Beide gebruiken `meetlib.js`. Ze staan bewust buiten de testlijst: het zijn meetscripts voor een golf met nieuwe geometrie (vooraf, na elke stap en na elke samenvoeging), geen poort die de set rood maakt. Dat geldt voor `clash.py` en `huid.py`, niet meer voor `meet.py` en `zijstraal.py`: die draaien sinds versie 3 als extra tests in `finaltests.sh` (zie hierboven); `rays.py` blijft een hulpmiddel buiten de set.

Kalibratie op de Alto (17 oktober 2026, op `b0201d0`):

- `huid.py`: `--bewaar` en direct `--vergelijk` op dezelfde stand (`assembled`) geeft 0,000 mm voor maximum, 95-percentiel en gemiddelde, voor Motorkap (20 meshes, 3.463 punten) en Bumperschaal voor (1 mesh, 2.471 punten). Exitcode 0.
- `clash.py` op het bekende geval `d2ae9f1` (sluitplaten op x 0,715, samengevoegd in de mesh Wielkast achter links en rechts; zij stonden links tot 17 mm en rechts tot 23 mm door het achterscherm): aanroep `clash.py "Wielkast achter links" "Wielkast achter rechts" --tegen "Achterscherm links" "Achterscherm rechts" --straal 30 --toegestaan data/clash-toegestaan.json`. Drie runs, alle exitcode 0 en 0 doordringend:

| Paar | Met platen (`d2ae9f1`) | Zonder platen (`61831c0`, gelijk aan de werkboom) |
|---|---|---|
| links | kleinste afstand 0,052 mm op x 714,9; ONZEKER, NIET GESLOTEN; punten achter het oppervlak 2.687 en 272 (tot 78,2 mm) | 0,321 mm op x 697,5; ONZEKER, NIET GESLOTEN; 1.244 en 0 |
| rechts | 0,055 mm op x -715,0; ONZEKER, NIET GESLOTEN; 215 en 1.484 (tot 26,6 mm) | 0,746 mm op x -705,1; ONZEKER, NIET GESLOTEN; 0 en 89 (tot 12,7 mm) |

Uitkomst: gedeeltelijk. `clash.py` ziet dat er iets verandert (afstand van 0,3 en 0,7 mm naar 0,05 mm op de plaatstand, meer punten achter het oppervlak), maar niet de 17 en 23 mm doordringing: het achterscherm is een open schaal en de plaat een dunne plaat erdoorheen, dus de afstand ligt rond 0 in plaats van negatief, en het oordeel ONZEKER telt niet mee voor de exitcode. De "tot"-waarden zijn de afstand van een punt achter het oppervlak, geen doordringdiepte. Op dit type geval geeft `clash.py` dus geen poortsignaal; daar is `huid.py` of een stralenmeting nodig. Die stralenmeting is `tools/zijstraal.py`, geijkt op ditzelfde geval en sinds versie 3 een poort in `finaltests.sh`.

## Resultaten

De kolom "Na golf 1" is de tussenstand van 13 oktober 2026 rond 11:30 UTC, ongewijzigd uit het overdrachtsdocument van golf 1. De kolom "Eind golf 2" is gemeten op commit `ead92f6`, behalve waar een rij anders zegt. De derde kolom is gemeten op `d6d0456`, na de visuele herstelronde (`index.html` gebouwd in `60909fe`). De laatste kolom is de carrosserieronde: de volledige testset (uitvoer in het scratchpad, `g3final5`) draaide op `9c731c8` op 13 oktober rond 23:45 UTC. De eindstand van de code is `ff42dbd`; die commit verandert alleen de eindstukken van de uitlaat (`src/systems.js`). Daarop zijn alleen `integrity.py`, `ui_inner.py`, `smoke.py` en de publicatierooktest opnieuw gedraaid, en die waren groen. De overige scripts zijn niet op `ff42dbd` gedraaid; hun getallen horen bij `9c731c8`. `index.html` is gebouwd in `5b6cefa` uit `ff42dbd`. Alle tijden komen uit een container met software-rendering.

| Test | Na golf 1 | Eind golf 2 (`ead92f6`) | Na de visuele herstelronde (`d6d0456`) | Carrosserieronde (testset op `9c731c8`) |
|---|---|---|---| --- |
| `build.py --lint` | ok | ok | ok | ok |
| Boom | 1.762 knopen, 303 groepen, 1.459 onderdelen, diepte 7 | 2.878 knopen, 484 groepen, 2.394 onderdelen, diepte 8 | 2.881 knopen, 485 groepen, 2.396 onderdelen, diepte 8 (de stator van de dynamo is nu een groep van drie delen) | 2.924 knopen, 489 groepen, 2.435 onderdelen, diepte 8, 253 ingesloten knopen, 37 presets in 6 categorieën |
| Driehoeken | 419.554 | 599.972 (budget 700.000). Aandrijflijn 245.794 (budget 240.000, dus 5.794 erboven), Carrosserie 130.026, Onderstel 109.916, Interieur 67.608, Koeling en luchtinlaat 18.700, Uitlaatsysteem 12.832, Brandstofsysteem 7.608, Elektrisch systeem 7.488 | 604.972 (budget 700.000). Aandrijflijn 250.794 (budget 240.000, dus 10.794 erboven); de andere hoofdgroepen ongewijzigd | 630.368 (budget 700.000). Aandrijflijn 237.310 (budget 240.000, dus binnen budget), Carrosserie 165.546 (budget 190.000), Onderstel 110.204, Interieur 70.328, Koeling en luchtinlaat 18.700, Uitlaatsysteem 13.184, Brandstofsysteem 7.608, Elektrisch systeem 7.488 |
| Tekenopdrachten gemonteerd (grens 1.500) | 1.052 | 1.680 zonder bundelen (boven de grens) | 1.682 zonder bundelen (boven de grens) | 1.726 zonder bundelen (boven de grens) |
| Tekenopdrachten gemonteerd met gebundeld renderen | niet aanwezig | 369 (41 groepen, 301 batchmeshes, 1.612 losse meshes vervangen, 21,6 MB van 42,2 MB) | 370 (41 groepen, 302 batchmeshes, 1.614 losse meshes vervangen, 21,9 MB van 42,6 MB) | 390 (41 groepen, 318 batchmeshes, 1.654 losse meshes vervangen, 24,2 MB van 45,3 MB) |
| Tekenopdrachten volledig uitgeklapt (grens 3.000) | niet vastgelegd na golf 1 | 1.495 in één weergave van `smoke.py` (396.652 driehoeken in beeld) | 1.506 in één weergave van `smoke.py` (398.044 driehoeken in beeld) | 1.517 in één weergave van `smoke.py` (415.047 driehoeken in beeld) |
| Frametijd `profileFrames('Motor F4Rt', 120)` (p95 grens 8 ms) | p50 0,3 ms, p95 0,6 ms | p50 0,5 ms, p95 0,7 ms, max 1,9 ms (uit `itest.py` op `ead92f6`; op `6eca637` gelijk) | p50 0,5 ms, p95 1,1 ms, max 4,9 ms (uit `itest.py`, terwijl de andere tests tegelijk draaiden) | p50 0,5 ms, p95 1 ms, max 3,4 ms (uit `itest.py`, terwijl de andere tests tegelijk draaiden) |
| `buildCar()` (grens 600 ms) | niet vastgelegd na golf 1 | 526 ms (`buildCar` 1.147 min `buildStart` 621 in `__model.timing()`, één meting) | 123 ms (`buildCar` 665 min `buildStart` 542, één meting op een minder belaste machine) | 166 ms (`buildCar` 854 min `buildStart` 688 in `stats.json`, één meting) |
| `smoke.py` | geen console-fouten | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 20,6 s op 1280 x 800 en 17,9 s op 390 x 844 | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 14,6 s op 1280 x 800 en 24,4 s op 390 x 844 terwijl de itest tegelijk draaide (de grens van 20 s geldt voor `pubsmoke.py`) | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 8,0 s op 1280 x 800 en 28,1 s op 390 x 844 terwijl de itest tegelijk draaide. Op `ff42dbd` opnieuw zonder consolemeldingen (laadtijd 8,4 s en 23,3 s, tegelijk met de publicatierooktest) |
| `integrity.py` | 13 fouten, alle in domeinen van golf 2; 0 ankerfouten; 0 presetfouten | 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (vooral uitklapvector nul bij ankers) | 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen | 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen. Op `ff42dbd` hetzelfde (2.924 knopen, 2.435 onderdelen) |
| `silhouette.py` | OK, 46 van 46 stations binnen tolerantie | OK, 46 van 46 stations binnen tolerantie (20 zijaanzicht, 17 bovenaanzicht, 9 raamlijn; 318 carrosseriemeshes gemeten) | OK, 46 van 46 stations binnen tolerantie | OK, 45 van 46 stations binnen tolerantie (355 carrosseriemeshes gemeten). De enige uitschieter is het raamlijnpunt bij z = −0,155: dat ligt nu in de bredere B-stijl (referentie: zwarte beplating op de gordel van z −0,28 tot −0,13), dus de straal raakt daar geen glas. Dat is een meetartefact van de plaats van het station en geen fout in de raamlijn. De toets slaagt omdat hoogstens 2 stations per reeks buiten de tolerantie mogen vallen |
| `itest.py` (twee keer achter elkaar) | 71 van 72 (een telefoontik als lang drukken gelezen onder belasting) | 78 van 78 na de samenvoeging van golf 2; 79 van 79 op `6eca637` en op `ead92f6` (zie de volgende rij). Een tweede achtereenvolgende run op dezelfde commit is niet vastgelegd. | zie de volgende rij | zie de volgende rij |
| `ITEST_GATES=1 python3 tools/itest.py` | niet vastgelegd na golf 1 | 79 van 79 op `6eca637` en opnieuw 79 van 79 op de eindstand `ead92f6` (11: 369 tekenopdrachten, p95 0,7 ms) | 78 van 79, twee keer achter elkaar gelijk (de tweede keer zonder andere tests ernaast). De ene fout: op de telefoon koos tik 4 van de 40 willekeurige tikken (stand Gemonteerd) het buurdeel. Het aanwijzen gaf `Binnenframe motorkap`, de tik selecteerde `Koplampsproeiers`. `pick()` is in deze ronde niet veranderd. De vaste steekproef schuift wel mee met de lijst meshes, en die veranderde door de nieuwe stator. Vermoedelijk ligt het punt op de rand van twee onderdelen; dat is niet bewezen en niet opgelost. (Later bewezen als echte app-fout en opgelost; zie "Het itest-randgeval" hieronder.) De andere 78 controles slaagden, ook 11 (370 tekenopdrachten, p95 1,1 ms) en 13 (bundelen). | 79 van 79 (11: 390 tekenopdrachten, p95 1 ms). Vlak daarvoor was een losse run op `9c731c8` ook 79 van 79. Eerder ook 79 van 79 op `34d3469` (twee keer achter elkaar) en op `efaba28`. Het randgeval van de vorige kolom was een echte app-fout en is opgelost; zie "Het itest-randgeval" hieronder |
| `pubsmoke.py` | OK | OK: `ready` na 14,8 s (1280 x 800) en 7,2 s (390 x 844), grens 20 s; three r147; geen horizontale scroll | OK: `ready` na 7,5 s (1280 x 800) en 7,7 s (390 x 844), grens 20 s; three r147; geen horizontale scroll | OK: `ready` na 5,2 s (1280 x 800) en 8,0 s (390 x 844), grens 20 s; three r147; geen horizontale scroll. Op `ff42dbd` opnieuw OK: `ready` na 12,2 s en 9,9 s onder belasting |
| `ui_inner.py` | bestond nog niet | 0 eerste treffers op 256 ingesloten knopen (na golf 2 waren het er 52) | 0 eerste treffers op 256 ingesloten knopen | 0 eerste treffers op 253 ingesloten knopen (39.200 stralen op de hele auto, 20.000 per hoofdgroep). Op `ff42dbd` hetzelfde |
| URL na publicatie gelijk aan `index.html` | niet van toepassing | Gelijk. Versie 2 van de URL, teruggelezen op 13 oktober om 17:00 UTC, bevat `index.html` van `8095a3e` (618.341 bytes, md5 `dc2bc3b0…`) precies één keer en aaneengesloten. Daaromheen staan alleen het vaste paginaskelet van de host (531 bytes: doctype, charset, viewport en basisstijl tot en met `<body>`) en de afsluiting `</body></html>` (15 bytes). | Gelijk. Versie 3 van de URL, teruggelezen op 13 oktober om 17:37 UTC, bevat `index.html` van `60909fe` (620.025 bytes, md5 `d92a8bb2…`) precies één keer en aaneengesloten, met hetzelfde paginaskelet ervoor (531 bytes) en dezelfde afsluiting erna (15 bytes). | Gelijk. Versie 4 van de URL bevat `index.html` uit `ec92a53` (commit `9c03015`, 663.654 bytes, md5 `70b2e62a426312ec788fc851086ab4c6`) precies één keer, met alleen het paginaskelet van de host eromheen (531 bytes ervoor, 15 erna). Versie 5, gepubliceerd op 14 oktober en teruggelezen om 00:02 UTC, bevat `index.html` uit `ff42dbd` (commit `5b6cefa`, 678.887 bytes, md5 `649cbf95397d877f6a361600c42a4afd`) precies één keer en byte voor byte gelijk, met hetzelfde skelet (531 bytes ervoor, 15 erna) |

## Resultaten AWK C2-S1: id-pass met 24-bit diepte (18 oktober 2026)

Open punt AWK, cyclus 2, stage S1, werkboom `golf4-awk`. Commit `432c60b` (`meet.py`: `stencilBuffer: true` in beide render targets van de id-pass, verder niets) en de commit met deze tekst. Elke meting draaide op een schone kopie (`git archive`) op de Mac; uitvoer buiten de repo: `~/alto-wt/awk-meet/c2/s1/` (`ach-fa24.json`, `ach-head-gpu.json`, `ach-head-sw.json`, `voor-head-gpu.json`, `duur.txt`).

- Tegenproef op `fa5c619` met het nieuwe `meet.py`: 22 van 25 rood, dezelfde kleur als de nulmeting van S1 voor alle 27 regels (25 poorten en de twee extra controles), 15 met exact dezelfde waardetekst; de rest wijkt in het aantal beeldpunten af (bijvoorbeeld Zitbekleding achter 8.008 in plaats van 8.210 in ach-vs-wielkast-recht). De correctie maakt geen rode poort groen die dat door de geometrie niet is.
- Stand op de tak (na stage S3, beslissing 26): op de stand vóór de correctie 14 van 25 rood door de 16-bit diepte, nu 25 van 25 groen op de macOS-GPU en met SwiftShader, met `aantal poorten achter` en `interessegebied achterwielen in beeld` groen. GPU en SwiftShader geven dezelfde waardetekst voor alle 27 regels. Kleinste marge: 35 van 50 beeldpunten (Vloerbedekking in baanm-r3.0-h0.23-a40 en -a-40, in de poorten `wielkast gat onder de boog achter` en `wielkast rondgang h0.23 r3.0 achter`, beide kanten); verder hoogstens 6 beeldpunten (h0.23 r4.5), alle andere poorten 0. De tussenpoorten tegenover V1: 0 van 2.500.
- Voormodus (zonder `--achter`, GPU): 99 van 99 harde poorten groen, 12 van 13 zachte (geel blijft `afwerking e: embleem leesbaar zijhoek-r light`), `aantal poorten` groen. Alle 113 poortregels hebben dezelfde kleur als voor de correctie; 14 waardeteksten veranderen een paar beeldpunten in de helderheidsmetingen (het luchtrooster in de twaalf regels `helderheid onderplaat`, het gaas in `afwerking e: embleem leesbaar zijhoek light` en `onderplaat tegenover gaas in eig`, verhouding hoogstens 0,03 anders).
- Duur (macOS, los, na elkaar): `--achter` GPU 186 s, SwiftShader 561 s; de voormodus op de GPU 245 s. Met 16-bit diepte was dat 187 s, 593 s en 241 s (sectie "Resultaten AWK S1"): de 24-bit diepte kost geen merkbare tijd.
- Andere render targets met diepte en zonder stencil in `tools/`: geen; `meet.py` is het enige script met een `WebGLRenderTarget`, en het is geen generiek bestand (`framework.json`).

## Resultaten AWK S1: achtermodus en nulmeting op `fa5c619` (18 oktober 2026)

Open punt AWK (achterwielkast), stage S1, werkboom `golf4-awk` vanaf `fa5c619`. Commits: `38853bf` (achtermodus met de 21 poorten van `meet_achter.py`), `3c0d55d` (poort midden onder de boog), `7e75b8d` (wielkastcamera's achter met hun poort), en de commit met `meet-achter` in `auto.json` en deze tekst. `src/` is niet gewijzigd: de nulmeting geldt voor `fa5c619`. Meetuitvoer buiten de repo: `~/alto-wt/awk-meet/s1/` (`ach-gpu2.json`, `ach-sw.json`, `voor-fa5c619.json`, `voor-na.json`) en `~/alto-wt/awk-meet/s1-resultaat.json`.

- Uitkomst op `fa5c619`: 22 van 25 harde poorten rood, op de macOS-GPU en met SwiftShader (macOS) gelijk in kleur voor alle 27 regels (25 poorten en de twee extra controles). Groen zijn alleen de twee tussenpoorten tegenover V1 (grootste 213 en 188 beeldpunten door het venster) en de console. De grootste knopen: `Zijbekleding achter links` 34.489 en `rechts` 32.816 beeldpunten in het gat onder de boog (baanm-r2.0-h0.23-a150 en -a-150); `Kabelboom achter` 76.405 en `Bagagevloer` 22.414 midden onder de boog (baanm-r2.0-h0.23-a160); in de wielkastcamera's achter `Zitbekleding achter` 8.210 (ach-vs-wielkast-recht) en 8.256 (ach-vs-wielkast-recht-r), 9 van 12 camera's per kant rood. De kleinste overschrijding is `wielkast opening boven het venster achter rechts`: 78 beeldpunten Rugachterschaal tegen de grens van 50.
- Reproductie van `meet_achter.py`: de 21 poorten hebben op `fa5c619` (GPU) dezelfde kleur en exact dezelfde waardetekst als `ach-h0` op `1ea1319` (18 van 21 rood). Van de 432 camera's verschillen er twee: `Langsligger voor links` en `rechts` met 4 dunne beeldpunten (een naad, telt niet) in baanm-r3.0-h0.23-a160 en -a-160, door de wijzigingen aan de voorkant sinds `1ea1319`.
- Wat de vrijstelling midden onder de boog achter verbergt (rondgang, GPU): links 20 knopen boven 50 beeldpunten in 13 camera's, rechts 16 in 9; daarnaast in kleinere aantallen Zitbekleding, Rugachterbekleding, Wielkastbekleding en Zijbekleding bagageruimte.
- SwiftShader tegenover GPU: dezelfde kleur voor alle 27 regels, 7 met exact dezelfde waardetekst; de rest wijkt een paar beeldpunten af (grootste zoneverschil per knoop 104 beeldpunten, Rugbekleding in ach-vs-wielkast-recht). Twee GPU-runs na elkaar (los en via `framework.py extra meet-achter`) gaven dezelfde JSON (alle 456 camera's gelijk).
- Duur (macOS, los): GPU 187 s (ook 185 s via `framework.py extra`), SwiftShader 593 s. De voormodus op de GPU: 239 s voor en 241 s na de wijziging. In de Linux-container is `meet-achter` in deze stage niet gemeten; de derde reeks van `finaltests.sh` draait `meet`, `zijstraal` en `meet-achter` achter elkaar, dus de set wordt ongeveer zo veel langer als `meet-achter` duurt.
- Randgevallen getest: achtermodus vol (25 harde, `aantal poorten achter` groen) en beperkt (`--cams` met twee rondgangcamera's: `aantal poorten niet gecontroleerd`); kopieen van het script met minder rondganghoeken (vol, groen aantal), met een hernoemd interessegebied (`interessegebied achterwielen in beeld` rood, exitcode 1), met een rondganghoogte minder (`aantal poorten achter` rood: 15 van 21 op dat moment) en zonder camera's links (alle poorten links rood met `invoer ontbreekt`); voormodus vol (99 harde en 13 zachte, alle waarden gelijk aan `fa5c619`) en beperkt.
- macOS-basis B0 voor `visdiff` van `fa5c619`: `~/alto-wt/awk-meet/b0` (34 beelden, 1.793.508 bytes, uit een schone kopie `~/alto-wt/awk-meet/b0src`); een tweede `presetshots.py`-reeks gaf 0,00 procent afwijking op alle 34 beelden, dus geen herkadrering.
- Beeldgalerij 'voor' van de achterwielkast: `~/alto-wt/awk-meet/galerij-voor/` (de 22 camera's van `front-ronde4/adv/cams/achter.json`, licht en donker en een id-kaart per camera, met `kijk3.py` ongewijzigd).
- `zijstraal` op de werkboom: groen.

## Resultaten P1: meet en zijstraal in finaltests (17 oktober 2026)

Open punt P1: `meet.py`, `rays.py` en `zijstraal.py` in `tools/`, en `meet` en `zijstraal` als `extraTests` in `finaltests.sh`. Werkboom `golf4-basis` op `d044bae` (commits `04f0805` meet en rays, `f3b77bd` `meet` in `auto.json`, `d044bae` zijstraal en `zijstraal` in `auto.json`; de haak zelf in `8b85200`). Uitvoer: container `~/alto-linux/run-aqHG/uit/ft` (`tests.txt`, `meet.json`, `zijstraal.json`) en macOS `~/alto-wt/s4-meet/ft-mac`. Aantallen poorten, camera's en rasters: de lijst "Aantallen" onder de bewuste fouten.

| Test | Linux-container (`explosie-test:1`, 15 cpu) | macOS (GPU, `VISDIFF_BASIS` op B0) |
|---|---|---|
| lint | 0 (0 s) | 0 (0 s) |
| smoke | 0 (31 s) | 0 (16 s) |
| integ | 0 (13 s) | 0 (8 s) |
| sil | 0 (23 s) | 0 (8 s) |
| inner | 0 (30 s) | 0 (25 s) |
| opentest | 0 (74 s) | 0 (47 s) |
| itest | 0 (500 s): 222 van 222 | 0 (362 s): 222 van 222 |
| tri | 0 (7 s), budgetpoort ok | 0 (8 s), budgetpoort ok |
| pub | 0 (17 s) | 0 (18 s); alleen de ANGLE-melding `GPU stall due to ReadPixels` (bekende ruis) |
| stats | 0 (11 s) | 0 (8 s) |
| shots | 0 (47 s) | 0 (38 s) |
| visdiff | 0 (1 s): 34 van 34 | 0 (1 s): 34 van 34 tegen B0 |
| anchor | 0 (18 s): poort ok | 0 (18 s): poort ok |
| meet | 0 (1228 s): ALLES GROEN, 99 van 99 harde poorten; zacht 12 van 13 groen | 0 (243 s): ALLES GROEN; zacht 12 van 13 groen |
| zijstraal | 0 (16 s): GROEN, 0 knopen door de huid, raycaster-controle 1.774 stralen, 0 verschil | 0 (2 s): GROEN, hetzelfde |
| Totaal (klok van de run) | 20 min 46 s | 7 min 33 s |

Zonder de extra tests (zelfde ref, container, `~/alto-linux/run-Q8hF`): alles groen in 6 min 52 s; de twee extra tests kosten in de container dus ca. 14 minuten, vrijwel alleen `meet`. De tijden in de container zijn gemeten met de tests van de andere reeksen tegelijk (15 cpu); stand-alone is `meet` sneller (zie herhaalbaarheid). Een stand-alone meting van `zijstraal` in de container is niet gemeten.

De bewuste fouten (op macOS, `VISDIFF_BASIS` op B0, op een kopie van `d044bae` met een opzettelijke wijziging; elke run is rood zoals bedoeld). De precieze wijziging per fout staat niet in de bewaarde uitvoer; de kolom beschrijft alleen wat de set meldde:

| Fout | Wat de set meldde | Wat de set zag |
|---|---|---|
| a: een deel door de huid | `zijstraal` rood (exit 1, 2 s), de rest groen, ook `meet` (ALLES GROEN, 99 van 99) | Wielkast voor links en rechts: elk 39 stralen (y 0,265 tot 0,285, z 1,380 tot 1,430), tot 25,87 mm buiten Bumperschaal voor. `meet` ziet deze fout niet; `zijstraal` wel. De totale set was rood in 6 min 45 s. |
| b: een wijziging die de motorruimte vanaf de kap zichtbaar maakt | `meet` rood (exit 1, 242 s): 6 rode poorten van 99 (kier hoekboven, hoekboven-r, bovenlamp, bovenlamp-r, flankhoog, flankhoog-r); ook `opentest` rood (Motorkap: blootleggen, 1 treffer op een verborgen knoop, Tuimelaar inlaat 2a) en `visdiff` rood (33 van 34, rood: 30-openHood.png); `zijstraal` groen | Het zicht door de kier op accu, luchtfilter, inlaatspruitstuk en frontmodule. Totale set rood in 6 min 33 s. |
| c: een uitzondering in `meet.py` | `meet` exit 2 (1 s): `RuntimeError: bewuste fout (c)`, `METING MISLUKT: bewuste fout (c)`; de rest groen | De set is rood (exit 1): een mislukte meting telt als FOUT, niet als stil groen. Totale set rood in 6 min 30 s. |

Aantallen (opgenomen uit de handmatige sectie van `docs/cijfers.md`, die niet door `tools/orkestratie/cijfers.py` wordt gegenereerd; de duren staan hierboven):

- `meet.py`: 484 camera's in `meet.json`. De aantallen poorten (harde, zachte, de ene gele) staan in de sectie `tools/meet.py`; sinds `63314de` bewaakt het script ze in volle modus.
- `zijstraal.py`: stap 5 mm, 88.454 stralen per kant, 1.041 meshes (26 huid, 14 uitzondering). De uitkomst van de controle met de Raycaster staat in de tabel; de dekking per patroon in de sectie `tools/zijstraal.py`.
- Bronnen: `meet.json`, `zijstraal.json` en `tests.txt` van de volledige set (container `~/alto-linux/run-aqHG/uit/ft`, macOS `~/alto-wt/s4-meet/ft-mac`).

Herhaalbaarheid:

- `meet` in de container, drie runs: `f3b77bd` (`run-Mjan`, 992 s), `d044bae` los (`run-PXBQ`, 704 s) en `d044bae` in de volledige set (`run-aqHG`, 1228 s). De 112 poorten zijn in alle drie volledig gelijk (kleur en waardetekst). De verschillen in duur komen vermoedelijk van de belasting door de andere tests; dat is niet apart gemeten. Elke run: 99 van 99 harde poorten groen.
- `meet` op macOS tegen Linux: dezelfde kleur voor alle 112 poorten, 88 van de 112 met exact dezelfde waardetekst (de rest verschilt in beeldpunttellingen van enkele tientallen beeldpunten, zoals de GPU-nulmeting uit `auto.json` zegt, bijvoorbeeld onderplaat in eig donker 49.473 tegen 49.430 px).
- `zijstraal`: `zijstraal.json` van macOS (GPU) en Linux (SwiftShader) is, afgezien van tijden en `meta`, gelijk; twee runs en `--sw` gaven op de ijking dezelfde JSON (commitbericht van `d044bae`).
- Niet gemeten: een tweede reeks `meet` op de macOS-GPU zonder wijziging op dezelfde stand (de enige onaangepaste macOS-run is `ft-mac`); `meet` met een lege lettertypencache; `zijstraal` stand-alone in de container.
- Duur van `meet` in `auto.json`: het item `meet` noemde "ca. 20 minuten" voor SwiftShader op macOS en "ca. 17 minuten" voor de Linux-run. Gemeten: macOS-SwiftShader 701 s los en 19 min 56 s naast andere belasting; Linux-container 704 s los en 846 tot 1347 s in de volledige set (`run-RdPa` 846 s, `run-3qin` 991 s, `run-aqHG` 1228 s, `run-v9eG` 1347 s). Het item geeft nu een bereik dat daarbij past (cyclus 2 van open punt P1).

## Resultaten framework f63b185 (17 oktober 2026)

Werkboom `golf4-basis` op `b0201d0` (export van laguna3 `f63b185`, geen gecommitte wijziging erna). Driehoeken totaal 343.116 naar 338.988 (-4.128): Aandrijflijn 108.132, Carrosserie 96.964, Onderstel 62.460, Interieur 49.156, Koeling en luchtinlaat 6.036, Uitlaatsysteem 5.820, Elektrisch systeem 5.716, Brandstofsysteem 4.704; de andere cijfers staan in `docs/cijfers.md`. Alle tests: lint, smoke, integrity, silhouette, inner, opentest, itest, tri, stats, shots, visdiff en anchor groen, `pub` rood alleen door de bedoelde meting (zie onder).

| Test | Linux-container (`explosie-test:1`, Fonts-hosts geblokkeerd) | macOS (`https_proxy` op een dode proxy, `VISDIFF_BASIS` op B0) |
|---|---|---|
| lint | 0 (0 s) | 0 (0 s) |
| smoke | 0 (15 s) | 0 (13 s) |
| integ | 0 (7 s) | 0 (8 s) |
| sil | 0 (16 s) | 0 (7 s) |
| inner | 0 (26 s) | 0 (24 s) |
| opentest | 0 (53 s): 13 openers getoetst, 0 fouten, 5 meldingen `open.min` ontbreekt (volger) | 0 (46 s): 0 fouten, meldingen alleen `open.min` ontbreekt (volger) bij Zijruit |
| itest | 0 (405 s): 222 van 222 (`ITEST_GATES=1`) | 0 (333 s): 222 van 222 |
| tri | 0 (7 s), budgetpoort ok | 0 (6 s), budgetpoort ok |
| pub | 1 (18 s): enige foutregel `Google Fonts geeft HTTP 000` (bedoeld onder blokkade); zonder blokkade `PUBLICATIEROOKTEST OK` bij de eerste poging | 1 (13 s): vijf CDN-regels en `Google Fonts geeft HTTP 000`, alle HTTP 000 door de dode proxy; `pubsmoke.py` los zonder proxy: OK |
| stats | 0 (8 s) | 0 (7 s) |
| shots | 0 (40 s) | 0 (38 s) |
| visdiff | 0 (1 s): 34 van 34 binnen 1,50 procent tegen `docs/baseline`, hoogste 0,146 procent (08-head) | 0 (1 s): 34 van 34 tegen B0, hoogste 0,14 procent (08-head) |
| anchor | 0 (15 s): poort ok, labels 242, eigen 211, vrij 180 | 0 (17 s): poort ok, timing eigen 8 |
| Totaal | 8 min 15 s | 6 min 55 s |

Visdiff per beeld (Linux, procent afwijkend): 06 engine 0,02, 07 engineAll 0,02, 08 head 0,15, 09 crank 0,01, 10 timing 0,04, 11 intake 0,01, de overige 28 beelden 0,00 (01 tot en met 05 en 12 tot en met 34). Op de Mac tegen B0 hetzelfde patroon (0,02, 0,02, 0,14, 0,01, 0,03, 0,01), dus de afwijking is niet platformgebonden maar komt van de bronwijziging. Op `08-head` zijn 1.175 pixels afwijkend na het kanaalverschil van 16 (van 1280 x 800); de bouten en tekst zien er op het oog gelijk uit, het zichtbare verschil zit in de ankerpunten van de labels 3, 4, 5, 6 en 8 en in de randpixels van de boutkoppen (6 of 8 facetten door `hexBolt`). Een precieze oorzaak per pixel is niet uitgezocht. Het besluit over de basislijn: geen vernieuwing nodig, `docs/baseline` en `anchorcheck.json` zijn niet aangeraakt.

Lettertypencache: op Linux 7 bestanden (1 stylesheet, 6 woff2) en op de Mac 7 bestanden; de sha256-lijsten zijn voor en na de runs gelijk. Op Linux stond de cache alleen-lezen en waren de Fonts-hosts geblokkeerd; er is geen enkele netwerkmelding in de uitvoer (gezocht op `fonts.g`, `ERR_NAME_NOT_RESOLVED`, `ERR_NETWORK_CHANGED`, `ERR_SOCKET_NOT_CONNECTED`, `Failed to load resource`). `visdiff` bleef op 0,00 procent tegenover de Linux-basislijn, dus de letters kwamen uit de cache; een run met een lege cache is niet apart gemeten. Bijzonderheid: `finaltests.sh` doet in de git-archive-kopie `git log` (`fatal: not a git repository`), waardoor `commit.txt` leeg is; geen testfout. Bij de export meette de smoke op de Mac eenmalig een laadtijd van 35,76 s op 1280 x 800; dat is niet herhaald of nader onderzocht, en de smoke duurde in de volledige set 13 s.

## Resultaten framework (16 oktober 2026)

Strikte set op `5150354` (framework: `auto.json`, `presetdata.js`, testhaak `__model`, silhouet in `data/silhouet.json`, grenzen uit `body.js`): alle tests groen behalve visdiff, met 0 van 42 beelden. Oorzaak: `presetshots.py` las de preset-id's met een regex uit `src/presets.js`, waar ze niet meer staan, en maakte zonder melding nul beelden. Nu leest het script de id's uit de pagina (`presetList()`) en faalt het als er geen presets zijn. Daarna presetshots en visdiff opnieuw: 42 van 42 binnen de drempel zonder nieuwe basislijn, dus het beeld is door het framework niet veranderd. Verder: itest 222 van 222, opentest 0 fouten, integrity 0 fouten, budgetpoort ok, pubsmoke ok in drie rondes (ook Pages op de telefoon), ankerpoort ok. Een proefauto uit `tools/framework.py nieuw` bouwt en haalt smoke, integrity (0 fouten) en de budgetpoort.

## Resultaten openstand blijft staan (16 oktober 2026)

Strikte set op `4eef6e8` (de wissel van Openen naar Uitklappen laat de openers staan; `uiOpenResync`; `hideWhen` in beide modi), alle tests groen behalve de opentest: die meldde bij de rugleuningen 866 en 309 treffers op de hoedenplank, die nu ook buiten de modus Openen uitgenomen is. De test telde dat uitgenomen deel als gat; in `5f845e3` telt een deel dat door `hideWhen` is uitgenomen als afwezig. Daarna opentest opnieuw: 26 openers, 0 fouten, 31 meldingen (volgers zonder `open.min`). itest 222 van 222, visdiff 42 van 42 zonder nieuwe basislijn, ankerpoort ok. Gemeten met een losse probe: zonder `uiOpenResync` hangt na Alles uitklappen de linker gasveer van een open achterklep 0,62 m naast zijn anker en een hoedenplankkoord 0,36 m na inklappen; met de herberekening is de afwijking 0.

## Resultaten golf 5c-1 en 5d (structureel), tak van PR #3 (versie 8)

Strikte set op de samengevoegde stand `452916e` (app-laag van golf 5c-1 erbij; de docs daarna raken de pagina niet), 16 oktober 2026, 02:55 tot 03:16 UTC, alle dertien tests groen. Versiestempel van de pagina: `7 (bron 65d7276)`. De statistieken staan in [cijfers.md](cijfers.md).

| Test | Uitslag | Duur |
|---|---|---|
| `build.py --lint` | ok (ook het inline script in head.html) | 0 s |
| `smoke.py` | geen consolefouten of -waarschuwingen, geen horizontale scroll | 73 s |
| `integrity.py` | 0 fouten, 0 ankerfouten, 0 presetfouten | 20 s |
| `silhouette.py` | ok | 19 s |
| `ui_inner.py --open --strict` | geen ingesloten knoop van buitenaf zichtbaar | 98 s |
| `opentest.py --strikt-min` | 26 openers, 0 fouten; twee meldingen voor volgers zonder `open.min` | 507 s |
| `itest.py` met poorten | 218 van 218 (controle 18: 36, controles 19 tot 22: 21) | 1.067 s |
| `tri.py --gate` | budgetpoort ok | 8 s |
| `pubsmoke.py` | OK, klaar na 9,9 s op 390 x 844, scripts met `integrity` van de CDN | 32 s |
| `stats.py` | ok | 19 s |
| `presetshots.py` | 42 beelden | 96 s |
| `visdiff.py` | 42 van 42 binnen de drempel tegen de basislijn van `452916e` | 1 s |
| `anchorcheck.py` | poort ok tegen `docs/baseline/anchorcheck.json` (352 labels, eigen 319, vrij 265) | 27 s |

## Resultaten golf 5 en 5a, tak van PR #3

Strikte set (`tools/orkestratie/finaltests.sh`) op de samengevoegde stand `2c179a5`, 16 oktober 2026, 01:21 tot 01:52 UTC; CI op GitHub groen op dezelfde commit. De statistieken staan in [cijfers.md](cijfers.md).

| Test | Uitslag | Duur |
|---|---|---|
| `build.py --lint` | ok | 0 s |
| `smoke.py` | geen consolefouten of -waarschuwingen, geen horizontale scroll op de telefoon | 68 s |
| `integrity.py` | 0 fouten, 0 ankerfouten, 0 presetfouten | 28 s |
| `silhouette.py` | ok | 17 s |
| `ui_inner.py --open --strict` | geen ingesloten knoop van buitenaf zichtbaar | 99 s |
| `opentest.py --strikt-min` | 26 openers, 0 fouten; twee meldingen voor volgers zonder `open.min` (toegestaan) | 515 s |
| `itest.py` met poorten | 161 van 161 (controle 16 telefoon staand, 17 deelbare stand) | 899 s |
| `tri.py --gate` | budgetpoort ok | 9 s |
| `pubsmoke.py` | OK, klaar na 9,5 s op 390 x 844 | 26 s |
| `stats.py` | ok | 15 s |

## Resultaten golf 4

Eindstand `g4final4` op `3ab6a8d` (de uitvoer staat in het scratchpad). Daarna veranderden alleen de screenshots en de documentatie.

| Test | Uitslag |
|---|---|
| `build.py --lint` | ok |
| `smoke.py` | geen consolemeldingen, geen horizontale scroll op de telefoon |
| `integrity.py` | 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (uitklapvector nul) |
| `silhouette.py` | ok |
| `itest.py` met poorten | 150 van 150 |
| `ui_inner.py --open` | 223 ingesloten knopen, 0 eerste treffers van buitenaf op de hele auto en per hoofdgroep |
| `pubsmoke.py` | OK, klaar na 11,6 s op 1280 x 800 en 10,1 s op 390 x 844 (grens 20 s) |
| `opentest.py` | 26 openers, 0 fouten: eindstand, ondergrens, 0 botsingen, 0 verborgen knopen, stralen in het niets onder 2 procent, spookbatchproef goed. Meldingen alleen voor volgers zonder `open.min`. |

Statistieken `g4final4`: 3.012 knopen, 499 groepen, 2.513 onderdelen, diepte 8, 659.496 driehoeken (Aandrijflijn 235.534, Carrosserie 187.554, Onderstel 110.204, Interieur 77.612), 223 ingesloten knopen, 43 presets. Tekenopdrachten: 439 gebundeld en 1.867 zonder; met alles open 774 (grens 3.000). Frametijd p95 bij openAll(1) 3,1 ms en bij openAll(0) 2,2 ms (mediaan van drie metingen, grens 8 ms).

Tussenstanden: `g4final2` op `7f54e61` (opentest een fout: Gordelrolautomaat voor rechts 8,8 mm in de bekleding van het open achterportier, opgelost in `0ac1052`) en `g4final3` op `4fc11cd` (alles groen, maar Carrosserie 199.394 driehoeken door een fijner gaas van de achterportieren; dat gaas is in `3ab6a8d` teruggezet).

Visuele poort golf 4: drie plakken (voorkant en voorportieren, achterkant en dak van buiten, interieur en dak van binnen), per plak drie beoordelaars die elk beeld een keer bekijken, meerderheid per kenmerk. Na poort 1 en poort 2 volgde een herstelronde; na poort 3 is gestopt.

| Poort | Stand | Ja | Deels | Nee |
|---|---|---|---|---|
| 1 | `0ac1052` | 6 | 9 | 2 (K5 doppen, K9 interieur: zwevende luidsprekers onder de hoedenplank) |
| 2 | `4fc11cd` | 10 | 7 | 0 |
| 3 | `3ab6a8d` | 10 | 7 | 0 |

Op de eindstand staan op ja: K2 achterportieren, K3 zijruiten voor en achter, K4 spiegels, K5 doppen, K7 tankklep, K8 panoramadak van buiten, K9 (geen doorsteken) bij de voorkant, K10 bediening en K12 alles open leest als Laguna III. Deels: K1 motorkap (de steunstang is op desktop nauwelijks te zien), K2 voorportieren (de B-stijl onder de gordellijn is weinig te onderscheiden), K6 achterklep (de opgetilde hoedenplank leest van achter als vlak liggend), K9 van slice b en c, K11 interieuropeners (camera bij de armsteun en de middenarmsteun), K13 dak van binnen. Tussen poort 2 en 3 gingen K5 en K8 naar ja en K1 en K2 naar deels zonder wijziging aan kap en portieren: de spreiding tussen beoordelaars is van dezelfde orde als de laatste verbeteringen. Daarom is na poort 3 gestopt; de punten staan in `handomdraai.md`.

De spookbatchproef vond bij de telescoop een echte spookbatch; die is opgelost in `a116db9`.

## Resultaten golf 5

Eindstand van de code is `33b2b50`; de testset heet `g5final3` en draaide op die stand (de uitvoer staat in het scratchpad). `index.html` van versie 7 is er in `25c3ddf` uit gebouwd en daarna veranderden alleen documenten.

| Test | Uitslag |
|---|---|
| `build.py --lint` | ok |
| `smoke.py` | geen consolemeldingen, geen horizontale scroll |
| `integrity.py` | 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (uitklapvector nul) |
| `silhouette.py` | ok |
| `itest.py` met `ITEST_GATES=1` | 155 van 155 (vier nieuwe controles voor de telefoon, plus een voor het blok Gekozen voor deze auto; zie de tabel met controles) |
| `ui_inner.py --open` | ok; 223 ingesloten knopen in de boom |
| `opentest.py` | 26 openers, 0 fouten, 33 meldingen (`open.min` ontbreekt bij volgers) |
| `pubsmoke.py` | ok; de telefoon is klaar in 6,5 s (grens 20 s) |

Statistieken `g5final3`: 3.023 knopen, 499 groepen, 2.524 onderdelen, diepte 8, 668.020 driehoeken (budget 700.000). Per hoofdgroep: Carrosserie 189.446 (budget 190.000, een dunne marge van 554), Aandrijflijn 235.546 (budget 240.000), Onderstel 113.228, Interieur 81.084, Koeling en luchtinlaat 18.824, Uitlaatsysteem 13.184, Brandstofsysteem 9.220 en Elektrisch systeem 7.488. Tekenopdrachten: 444 gebundeld en 1.878 zonder bundelen; met alle openers open ongeveer 784 (grens 3.000). 43 presets in 7 categorieën.

Visuele poort golf 5: dezelfde kenmerken K1 tot K13 als in golf 4 (`tools/orkestratie/poort.js`, beelden van `gateshots.py`), telkens negen beoordelaars (Opus, high) in drie plakken van drie, meerderheid per kenmerk. Elke poort telt 17 oordelen, omdat K2, K3 en K9 in meer dan een plak voorkomen. Na poort 1 en poort 2 volgde een herstelronde; na poort 3 is gestopt.

| Poort | Stand | Ja | Deels | Nee |
|---|---|---|---|---|
| 1 | `f581bca` | 11 | 6 | 0 |
| 2 | `b529ac1` | 12 | 4 | 1 (K13, dak van binnen, door een slechte vaste binnencamera) |
| 3 | `33b2b50` | 13 | 4 | 0 |

Ter vergelijking haalde golf 4 10 ja, 7 deels en 0 nee. Na poort 3 is gestopt: geen nee, niets blokkerends en de winst per ronde kleiner dan de spreiding tussen beoordelaars. Deels in poort 3: K6 (achterklep: de hoedenplank leest vlak liggend en de linker gasveer is dun), K11 (interieuropeners: de zijbekleding van de bagageruimte is trapvormig en de camera van het handschoenenkastje staat dicht op het dashboard) en K9 in de interieurplak (de vaste zijruit achter is groot, de luchtroosters hebben ruis). Voor poort 3 kreeg de vaste binnencamera van het dak een beeldhoek van 70 graden, zodat beide openingen in een beeld staan; dat geldt alleen voor het poortbeeld, de app gebruikt zijn eigen camera.

S7 (herkenbaarheid van het exterieur, negen kenmerken) is opnieuw gedraaid op `8e03e87`: 7 van 9 ja, kenmerk 4 en 8 deels. De eis is 7, dus S7 is gehaald.

Tussenstanden: `g5final1` en `g5final2` zijn de eerdere runs van de testset in dezelfde golf; de eindstand is `g5final3`.

## Het itest-randgeval

In de vorige stand (`d6d0456`) slaagden 78 van de 79 controles. Bij tik 4 van de 40 willekeurige tikken (telefoon, stand Gemonteerd) meldde `noteTarget` het Binnenframe van de motorkap, maar na de tik was Koplampsproeiers geselecteerd.

- Oorzaak, bewezen met instrumentatie: het aanwijzen en de tik waren het eens. Alle 3 x 3 buurpixels en de halve pixels gaven het Binnenframe van de motorkap, `pointerdown` en `pointerup` kregen exact 246/218, het was een directe treffer (de tolerantie is niet gebruikt) en na `pointerup` was het juiste deel geselecteerd. Daarna stuurde Chromium bij de touch-tik nog de compatibele `mousedown`, `mouseup` en `click`. Die vielen op label 13, Koplampsproeiers, dat door de nieuwe selectie net onder de vinger was geschoven. Dit is een echte app-fout; op een telefoon gebeurt hetzelfde.
- Fix in `src/app2.js`: `touchend` op het canvas krijgt `preventDefault()`, en een label reageert alleen op een `click` die op dat label begon, of op een `click` zonder aanwijzer (toetsenbord, schermlezer). Commits `149f43b` en later `36aea29`.
- De test is niet veranderd, alleen de app. Op `9c731c8` slagen alle 79 controles.

## Labelankers

Een label ankert nu op het gelabelde deel zelf, niet meer op het midden van het kader van de groep. De ankers worden over meerdere frames opgebouwd, met een terugval op het eerste zichtbare deel. Een label-klik werkt ook bij een lange muisdruk. Gemeten over alle 36 presets (zonder de rondleiding):

| Meting | Eerder | Nu |
|---|---|---|
| Ankers op het eigen deel | 175 van 345 | 261 van 345 |
| Ankers in de lucht | 52 | 0 |
| Grootste frame bij koud openen, Carrosserie | 17,4 ms | 2,8 ms |
| Grootste frame bij koud openen, Aandrijflijn | niet vastgelegd | 7,3 ms |

De overige 84 van de 345 ankers liggen ook op het eigen deel, maar liggen afhankelijk van de camera achter een ander deel. Dat is niet opgelost. De getallen zijn door een agent gemeten en door de orkestrator nagelegd. De testset heeft er geen aparte controle voor; controle 8 van `tools/itest.py` toetst alleen dat de labels elkaar en de bediening niet overlappen.

## Handmatige controle van de onderkant

De onderkant is nagelopen met stralen. Deze controles zijn handmatig gedaan met scripts die in het scratchpad stonden en niet in de repo zitten. Ze maken dus geen deel uit van de testset en zijn niet te herhalen zonder de scripts opnieuw te schrijven.

- Loodrecht door de vier wielbogen: 0 interieurtreffers (eerst 8 per kant achter).
- Van onderen in zeven richtingen: 2 randgevallen op ruim 60.000 stralen.

Aanleiding was de melding van de gebruiker dat het interieur (beige leder, de bagagevloer en de hemelbekleding) door de wielbogen en van onderen te zien was. De oorzaken en de reparatie (commit `9c731c8`) staan in [ontwerp-en-architectuur.md](ontwerp-en-architectuur.md), punt 7 van de ontwikkelgeschiedenis.

## Linux-container

`visdiff` is op Linux de poort. De container (Apple container, image `explosie-test:1`, 15 cpu, 16 GB) draait een git-ref in een schone kopie (`git archive`, dus eerst committen): `~/alto-linux/run.sh WERKBOOM REF 'commando'`. Voor een run met de lettertypencache gebruik je `~/alto-linux/run-fonts.sh`, een kopie van `run.sh` met een extra koppeling: `fonts-linux` (standaard `~/.cache/explosietekening/fonts-linux`) komt alleen-lezen op `/root/.cache/explosietekening/fonts` (in de container is `HOME` gelijk aan `/root`).

- Cache vullen: eenmaal met `FONTS_MODE=` (leeg, dus schrijfbaar) bijvoorbeeld `FONTS_MODE= ~/alto-linux/run-fonts.sh WERKBOOM REF 'python3 tools/smoke.py'`; de harness haalt de stylesheet en de woff2-bestanden dan op. De Linux-cache is niet gelijk aan die van macOS (andere inhoud van de stylesheet per user-agent), dus houd hem apart.
- Bewijs zonder netwerk: laat het commando de Fonts-hosts (`fonts.googleapis.com`, `fonts.gstatic.com`) in `/etc/hosts` naar `127.0.0.1` en `::1` zetten, controleer met `curl` dat de verbinding mislukt, en draai dan de volledige set met de cache alleen-lezen. Alleen `pub` wordt rood, door de bewust gemeten bereikbaarheid van de stylesheet (`HTTP 000`); draai `pubsmoke.py` daarom apart, zonder blokkade, met dezelfde alleen-lezen cache.
- Vergelijk de sha256-lijst van de cachemap voor en na de run: gelijk betekent dat de run niet naar het netwerk is gegaan voor lettertypen.

## Bekende beperkingen

- De metingen komen uit een container met software-rendering (SwiftShader). Laadtijden daar (5 tot 28 seconden, afhankelijk van de belasting van de machine) zeggen niets over een echt apparaat.
- De frametijd is alleen JavaScript-tijd. Zonder gebundeld renderen heeft de gemonteerde auto 1.878 tekenopdrachten (op `33b2b50`); gebundeld renderen staat standaard aan en brengt dat op 444. De grens van 1.500 geldt dus alleen met bundelen.
- De Aandrijflijn heeft 235.546 driehoeken tegen een budget van 240.000 en zit dus binnen budget. De hele auto (668.020) blijft binnen 700.000. Carrosserie zit op 189.446 van 190.000 driehoeken: een dunne marge, dus een volgende wijziging moet eerst elders besparen.
- Het aandeel labelankers dat achter een ander deel ligt (84 van 345) en de spikkels op de motorkap in het bovenaanzicht zijn open; zie de twee secties hierboven en de README.
- Golf 4: de metingen aan de openmodus komen uit software-rendering. Tekenopdrachten en JavaScript-tijd zijn het meetbare deel; er is geen echte telefoon of GPU. De eindhoeken zijn geschat uit foto's, het instructieboekje en het werkplaatshandboek; aan de echte auto is niets gemeten.
- De testset van de carrosserieronde liep op `9c731c8`. Op `ff42dbd` (alleen de eindstukken van de uitlaat veranderd) zijn alleen `integrity.py`, `ui_inner.py`, `smoke.py` en de publicatierooktest opnieuw gedraaid. De visuele poort (poort 5) is op `9c731c8` gedraaid en niet opnieuw na de uitlaatreparatie.
- De getekende multiriem is 1.672 mm lang tegen 1.795 mm (7PK1795); in golf 4 was het 1.569 mm.
- De voorste langsliggers lopen sinds golf 5 boven de aandrijfassen (ribdoorboringen van 1.855 naar 34).
- De positie van de stuurpomp en de routes van de slangen zijn schematisch.
- UX-punt U19 (rest dimmen bij duiken) en de zijkolom voor telefoons in liggende stand zijn in golf 5 gebouwd; er is geen echte telefoon gebruikt om ze te beproeven.
- In SwiftShader (software-rendering) duurt een frame tijdens grote animaties enkele seconden. Een echte GPU is veel sneller. Op oudere telefoons kan "Alles uit elkaar" wel haperen. De pagina schakelt dan zelf over op een lichte weergave.
- Screenshots van grote explosies hebben in de testomgeving een lange time-out nodig.
- De gemeten frametijd is alleen JavaScript-tijd (explosie-update en labelindeling, zonder `render`). Echte GPU-tijd is in de container niet te meten; er is geen GPU en geen telefoon.
- De meeste tests roepen `finishAll()` aan voordat ze kijken, dus ze zien geen animatieframe. Alleen `profileFrames` en controle 11 doen dat wel.
- Het gedrag van de webview van een telefoon-app (lang drukken opent geen systeemmenu, sneltoetsen in een iframe, de dock boven de thuisbalk) is niet te draaien. `pubsmoke.py` dekt wat statisch toetsbaar is: de stijlregels en de `viewport-fit`.
- Zes agents op vier CPU's maken Chromium traag. Houd screenshotreeksen klein en gebruik time-outs van minstens 300 seconden.
- Het testbestand `tools/itest.py` was in golf 1 één keer rood onder belasting (een tik als lang drukken gelezen). Herhaal een rode itest één keer op een rustige machine voor je de code verdenkt.
